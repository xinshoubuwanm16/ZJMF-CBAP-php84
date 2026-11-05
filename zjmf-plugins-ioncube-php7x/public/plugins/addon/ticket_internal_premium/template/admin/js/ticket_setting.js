(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("template")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    const host = location.origin;
    const fir = location.pathname.split("/")[1];
    const str = `${host}/${fir}/`;
    new Vue({
      components: {
        comConfig,
        comTinymce,
      },
      data() {
        return {
          message: "template...",
          // 工单类型数据
          orderTypeData: [],
          prereplyContent: "",
          // 工单类型下拉框
          orderTypeOptions: [],
          departFormData: {
            id: "",
            name: "",
            admin_id: [],
            director_admin_id: "",
            type: [
              {
                name: "",
                processing_limit: undefined,
              },
            ],
          },
          departFormRules: {
            name: [{ required: true, message: lang.order_text125 }],
            admin_id: [{ required: true, message: lang.order_text126 }],
            director_admin_id: [
              { required: true, message: lang.order_text127 },
            ],
            type: [{ required: true, message: lang.order_text128 }],
          },
          popupVisible: false,
          // 工单状态数据
          orderStatusData: [],
          // 工单部门
          departmentList: [],
          // 预设回复列表
          prereplyList: [],
          editReplayItem: {},
          // 完结状态下拉框
          statusOpitons: [
            {
              statusText: lang.order_text63,
              status: 1,
            },
            {
              statusText: lang.order_text64,
              status: 0,
            },
          ],
          // 指定部门下拉框数据（管理员分组列表数据）
          departmentOptions: [],
          // 指定人员下拉框数据（分组下管理员）
          adminsOptions: [],
          // 所有人员数据
          adminList: [],
          departmentDialog: false,
          departmentLoading: false,
          isSubmit: false,
          isSubStatus: false,
          isUpdateType: false,
          isUpdateStatus: false,
          isAddType: false,
          isAddStatus: false,
          isEditReply: false,
          deleteVisible: false,
          isAddReply: false,
          saveLoading: false,
          columns: [
            {
              colKey: "name",
              title: lang.order_text65,
              cell: "name",
              width: "193",
              ellipsis: true,
            },
            {
              colKey: "type",
              title: lang.order_text120,
              cell: "type",
              ellipsis: true,
            },
            {
              colKey: "admin",
              title: lang.order_text121,
              cell: "admin",
              ellipsis: true,
            },
            {
              colKey: "director_admin_name",
              title: lang.order_text122,
              cell: "director_admin_name",
              width: "193",
              ellipsis: true,
            },
            {
              colKey: "op",
              title: lang.order_text67,
              cell: "op",
              width: "360",
              width: "128",
            },
          ],
          columns2: [
            {
              colKey: "index",
              title: lang.order_text68,
              cell: "index",
              width: "193",
            },
            {
              colKey: "name",
              title: lang.order_text69,
              cell: "name",
              ellipsis: true,
            },
            {
              colKey: "color",
              title: lang.order_text70,
              cell: "color",
              ellipsis: true,
            },
            {
              colKey: "statusText",
              title: lang.order_text71,
              cell: "status",
              ellipsis: true,
            },
            {
              colKey: "op",
              title: lang.order_text67,
              cell: "op",
              width: "128",
            },
          ],
          columns3: [
            {
              colKey: "content",
              title: lang.order_text72,
              cell: "content",
            },
            {
              colKey: "op",
              title: lang.order_text67,
              cell: "op",
              width: "128",
            },
          ],
          configObj: {
            refresh_time: 0,
            order_button: 0,
            follow_limit: 0,
            will_timeout_notice: 0,
          },
          submitLoading: false,
        };
      },
      computed: {
        calcName() {
          return (arr) => {
            if (arr.length > 0) {
              const temp = arr.reduce((all, cur) => {
                all.push(cur.name);
                return all;
              }, []);
              return temp.join("，");
            }
            return "";
          };
        },
        calcId() {
          return (arr) => {
            const temp = arr.reduce((all, cur) => {
              all.push(cur.id);
              return all;
            }, []);
            return temp;
          };
        },
        calcDirectorList() {
          const list = [];
          this.departmentOptions.forEach((item) => {
            item.children.forEach((is) => {
              if (this.departFormData.admin_id.includes(is.value)) {
                list.push(is);
              }
            });
          });
          return list;
        },
      },
      methods: {
        adminChange() {
          this.departFormData.director_admin_id = "";
        },
        departmentClose() {
          this.departFormData.id = "";
          this.departFormData.name = "";
          this.departFormData.admin_id = [];
          this.departFormData.director_admin_id = "";
          this.departFormData.type = [
            {
              name: "",
              processing_limit: undefined,
            },
          ];
          this.$refs.departdForm.reset();
          this.departmentDialog = false;
        },
        async getConfig() {
          try {
            const res = await getOrderConfig();
            this.configObj = res.data.data;
            this.$refs.comTinymce.setContent(
              this.configObj.ticket_notice_description
            );
          } catch (error) {}
        },
        async saveConfig() {
          try {
            this.submitLoading = true;
            // const content = tinyMCE.editors[1].getContent();
            // const content = this.$refs.comTinymce.getContent();
            const params = { ...this.configObj };
            //  params.ticket_notice_description = content;
            const res = await saveOrderConfig(params);
            this.$message.success(res.data.msg);
            this.submitLoading = false;
            this.getConfig();
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        // 初始化富文本
        initTemplate() {
          tinymce.init({
            selector: "#tiny",
            language_url: "/tinymce/langs/zh_CN.js",
            language: "zh_CN",
            min_height: 400,
            width: "100%",
            plugins:
              "link lists image code table colorpicker textcolor wordcount contextmenu fullpage paste",
            toolbar:
              "bold italic underline strikethrough | fontsizeselect | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent blockquote | undo redo | link unlink image fullpage code | removeformat",
            images_upload_url: str + "v1/upload",
            paste_data_images: true,
            convert_urls: false,
            //粘贴图片后，自动上传
            urlconverter_callback: function (url, node, on_save, name) {
              return url;
            },
            images_upload_handler: this.handlerAddImg,
          });

          tinymce.init({
            selector: "#ticketNoticeTiny",
            language_url: "/tinymce/langs/zh_CN.js",
            language: "zh_CN",
            min_height: 400,
            width: "100%",
            plugins:
              "link lists image code table colorpicker textcolor wordcount contextmenu fullpage paste",
            toolbar:
              "bold italic underline strikethrough | fontsizeselect | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent blockquote | undo redo | link unlink image fullpage code | removeformat",
            images_upload_url: str + "v1/upload",
            paste_data_images: true,
            convert_urls: false,
            //粘贴图片后，自动上传
            urlconverter_callback: function (url, node, on_save, name) {
              return url;
            },
            images_upload_handler: this.handlerAddImg,
          });
        },

        // 富文本上传图片
        handlerAddImg(blobInfo, success, failure) {
          return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("file", blobInfo.blob());
            axios
              .post(`${str}v1/upload`, formData, {
                headers: {
                  Authorization:
                    "Bearer" + " " + localStorage.getItem("backJwt"),
                },
              })
              .then((res) => {
                const json = {};
                if (res.status !== 200) {
                  failure("HTTP Error: " + res.data.msg);
                  return;
                }
                // json = JSON.parse(res)
                json.location = res.data.data?.image_url;
                if (!json || typeof json.location !== "string") {
                  failure("Error:" + res.data.msg);
                  return;
                }
                success(json.location);
              });
          });
        },
        // 添加工单类型
        appendToRoot() {
          if (this.isUpdateType || this.isAddType) {
            return this.$message.error(lang.please_save);
          }
          this.orderTypeData.push({
            isedit: false,
            name: "",
            isAdd: true,
            arr: [],
            arr1: [],
          });
          this.isAddType = true;
        },
        // 获取工单类型数据
        getOrderTypeOptions() {
          ticketDepartment()
            .then((res) => {
              this.orderTypeData = res.data.data.list;
            })
            .catch((err) => {
              this.$message.error(err.data.msg);
            });
        },
        departFormSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            this.departmentLoading = true;
            const subApi = this.departFormData.id
              ? editDepartment
              : newDepartment;
            subApi(this.departFormData)
              .then((res) => {
                this.departmentLoading = false;
                this.$message.success(res.data.msg);
                this.departmentClose();
                this.getOrderTypeOptions();
              })
              .catch((err) => {
                this.departmentLoading = false;
                this.$message.error(err.data.msg);
              });
          } else {
            this.$message.warning(firstError);
          }
        },
        onPopupVisibleChange(val) {
          this.popupVisible = val;
        },
        onClear(row) {
          row.name = "";
        },
        onOptionClick(item, row) {
          row.name = item;
          this.popupVisible = false;
        },
        onInputChange(val, row) {
          row.name = val;
        },
        // 编辑
        edithandleClickOp(row) {
          this.departFormData.id = row.id;
          this.departFormData.name = row.name;
          this.departFormData.admin_id = row.admin.map((item) => {
            return item.id;
          });
          this.departFormData.director_admin_id = row.director_admin_id;
          this.departFormData.type = row.type.map((item) => {
            return {
              id: item.id,
              name: item.name,
              processing_limit: item.processing_limit,
            };
          });
          this.departmentDialog = true;
        },
        // 工单-工单类型管理-删除
        async orderTypeMgtDelete(id) {
          const result = await deleteDepartment(id);
          if (result.status === 200) {
            this.$message.success({
              content: result.data.msg,
              placement: "top-right",
            });
            this.getOrderTypeOptions();
          } else {
            this.$message.warning({
              content: result.data.msg,
              placement: "top-right",
            });
          }
        },
        // 取消新增类型
        deleteClickadd() {
          this.orderTypeData.pop();
          this.isAddType = false;
        },
        //取消修改
        canceledit(item) {
          this.isUpdateType = false;
          item.arr1 = item.arr;
          this.getOrderTypeOptions();
        },
        // 工单-工单类型管理-保存
        async orderTypeMgtSave(row) {
          if (row.arr1.length === 0 || !row.name) {
            this.$message.warning({
              content: lang.order_type_verify1,
              placement: "top-right",
            });
            return;
          }
          const params = {
            admin_id: row.arr1,
            name: row.name,
          };
          if (this.isSubmit) {
            return;
          }
          this.isSubmit = true;
          if (row.status === "edit") {
            params.id = row.id;
            await orderTypeEdit(row.id, params)
              .then((result) => {
                this.$message.success({
                  content: result.data.msg,
                  placement: "top-right",
                });
                this.getOrderTypeOptions();
              })
              .catch((result) => {
                this.$message.warning({
                  content: result.data.msg,
                  placement: "top-right",
                });
              });
          } else {
            await orderTypeAdd(params)
              .then((result) => {
                this.$message.success({
                  content: result.data.msg,
                  placement: "top-right",
                });
                this.getOrderTypeOptions();
              })
              .catch((result) => {
                this.$message.warning({
                  content: result.data.msg,
                  placement: "top-right",
                });
              });
          }
          this.isSubmit = false;
          this.isUpdateType = false;
          this.isAddType = false;
        },
        // 删除
        deleteClickOp(id) {
          deletehelptype({ id })
            .then((res) => {
              this.$message.success(res.data.msg);
              this.getOrderTypeOptions();
            })
            .catch((err) => {
              this.$message.error(err.data.msg);
            });
        },
        addType() {
          this.departFormData.type.push({
            name: "",
            processing_limit: undefined,
          });
        },
        minusType(index) {
          this.departFormData.type.splice(index, 1);
        },
        addTicket() {
          this.departFormData.id = "";
          this.departFormData.name = "";
          this.departFormData.admin_id = [];
          this.departFormData.director_admin_id = "";
          this.departFormData.type = [
            {
              name: "",
              processing_limit: undefined,
            },
          ];
          this.departmentDialog = true;
          this.$nextTick(() => {
            this.$refs.departdForm.reset();
          });
        },
        // 工单-转内部-选择部门变化
        departmentChange(val, item) {
          // 获取部门id对应部门名称
          // const department = this.departmentOptions.filter(item => item.id === val)[0];
          // const name = department ? department.name : null;
          // const optionList = [];
          // // 清除已选人员数据
          // this.adminList.forEach(item => {
          //   if (name && item.roles === name) {
          //     optionList.push(item);
          //   }
          // });
          // this.adminsOptions = optionList;
          item.arr1 = val;
        },
        // 获取工单状态列表
        getTicketStatus() {
          ticketStatus().then((res) => {
            res.data.data.list.forEach((item, index) => {
              if (item["default"] === 1) {
                item.noEdit = true;
              }
              if (item["status"] === 1) {
                item.statusText = lang.order_text63;
              } else if (item["status"] === 0) {
                item.statusText = lang.order_text64;
              } else {
                item.statusText = "--";
              }
              delete item["default"];
              item.index = index + 1;
              item.isedit = false;
            });
            this.orderStatusData = res.data.data.list;
          });
        },
        // 编辑状态
        editStatus(row) {
          if (this.isUpdateStatus) {
            return this.$message.error(lang.please_save);
          }
          if (row.noEdit) {
            return this.$message.error(lang.order_text73);
          }
          this.isUpdateStatus = true;
          for (let i = 0; i < this.orderStatusData.length; i++) {
            if (row.id === this.orderStatusData[i].id) {
              this.$set(this.orderStatusData[i], "isedit", true);
            }
          }
        },
        // 保存状态
        async orderStatustSave(row) {
          console.log(row);
          if (!row.name || !row.color || row.status === "") {
            this.$message.warning({
              content: lang.order_text74,
              placement: "top-right",
            });
            return;
          }
          const params = {
            name: row.name,
            color: row.color,
            status: row.status,
          };
          if (this.isSubStatus) {
            return;
          }
          this.isSubStatus = true;
          if (row.isedit) {
            params.id = row.id;
            await editTicketStatus(params)
              .then((result) => {
                this.$message.success({
                  content: result.data.msg,
                  placement: "top-right",
                });
                this.getTicketStatus();
              })
              .catch((result) => {
                this.$message.warning({
                  content: result.data.msg,
                  placement: "top-right",
                });
              });
          } else {
            await addTicketStatus(params)
              .then((result) => {
                this.$message.success({
                  content: result.data.msg,
                  placement: "top-right",
                });
                this.getTicketStatus();
              })
              .catch((result) => {
                this.$message.warning({
                  content: result.data.msg,
                  placement: "top-right",
                });
              });
          }
          this.isSubStatus = false;
          this.isUpdateStatus = false;
          this.isAddStatus = false;
        },
        // 添加工单状态
        appendStatus() {
          if (this.isUpdateStatus || this.isAddStatus) {
            return this.$message.error(lang.please_save);
          }
          const index = this.orderStatusData.length + 2;
          this.orderStatusData.push({
            isedit: false,
            name: "",
            isAdd: true,
            index: index,
          });
          this.isAddStatus = true;
        },
        // 工单状态删除
        async orderStatusMgtDelete(row) {
          if (row.noEdit) {
            return this.$message.error(lang.order_text75);
          }
          const result = await deleteTicketStatus(row.id).catch((result) => {
            this.$message.warning({
              content: result.data.msg,
              placement: "top-right",
            });
          });
          if (result.status === 200) {
            this.$message.success({
              content: result.data.msg,
              placement: "top-right",
            });
            this.getTicketStatus();
          } else {
            this.$message.warning({
              content: result.data.msg,
              placement: "top-right",
            });
          }
        },
        // 取消新增状态
        deleteStatusadd() {
          this.orderStatusData.pop();
          this.isAddStatus = false;
        },

        // 取消修改状态
        cancelStatusEdit() {
          this.isUpdateStatus = false;
          this.getTicketStatus();
        },
        // 工单-转发-选择人员变化
        adminChange(val) {
          this.$forceUpdate();
        },
        // 获取部门数据
        getDepartmentOptions() {
          getAdminList({ page: 1, limit: 99999 }).then((res) => {
            const roleList = [];
            res.data.data.list.forEach((item) => {
              if (!roleList.includes(item.roles)) {
                roleList.push(item.roles);
              }
            });
            this.departmentOptions = roleList.map((item) => {
              const children = [];
              res.data.data.list.forEach((is) => {
                if (is.roles === item) {
                  is.value = is.id;
                  is.label = is.name;
                  children.push(is);
                }
              });
              return {
                value: item,
                label: item,
                children: children,
              };
            });
            console.log(this.departmentOptions);
          });
        },
        // 获取人员数据
        getAdminList() {
          getAdminList({ page: 1, limit: 10000 })
            .then((result) => {
              this.adminList = result.data.data.list;
            })
            .catch();
        },
        // 时间格式转换
        formatDate(dateStr) {
          const date = new Date(dateStr * 1000);
          const str1 = [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
          ].join("-");
          const str2 = [
            this.formatDateAdd0(date.getHours()),
            this.formatDateAdd0(date.getMinutes()),
            this.formatDateAdd0(date.getSeconds()),
          ].join(":");
          return str1 + " " + str2;
        },
        formatDateAdd0(m) {
          return m < 10 ? "0" + m : m;
        },

        // 获取工单预设回复列表
        getTicketPrereply() {
          ticketPrereply().then((res) => {
            this.prereplyList = res.data.data.list;
          });
        },
        // 编辑预设回复
        editPrereply(row) {
          if (this.isEditReply) {
            return this.$message.error(lang.order_text76);
          }
          this.isEditReply = true;
          //tinyMCE.editors[0].setContent(row.content);
          this.prereplyContent = row.content;
          this.$refs.comTinymce1.setContent(row.content);
          this.editReplayItem = row;
        },
        // 删除预设回复
        async deletePrereply(row) {
          if (this.isEditReply) {
            return this.$message.error(lang.order_text76);
          }
          await deleteTicketPrereply(row.id);
          this.getTicketPrereply();
        },

        handelDelete() {},
        // 保存预设回复
        async savePreReplay() {
          this.saveLoading = true;
          // const content = tinyMCE.editors[0].getContent();
          const content = this.$refs.comTinymce1.getContent();
          const params = {
            content: content,
          };
          // 编辑
          if (this.isEditReply) {
            params.id = this.editReplayItem.id;
            await editTicketPrereply(params);
            this.isEditReply = false;
            this.$refs.comTinymce1.setContent(" ");
            this.getTicketPrereply();
          } else {
            await addTicketPrereply(params);
            this.$refs.comTinymce1.setContent(" ");
            this.getTicketPrereply();
          }
          this.saveLoading = false;
        },
      },
      created() {
        this.getOrderTypeOptions();
        this.getDepartmentOptions();
        this.getTicketStatus();
        this.getTicketPrereply();
        this.getConfig();
      },
      mounted() {
        // this.initTemplate();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

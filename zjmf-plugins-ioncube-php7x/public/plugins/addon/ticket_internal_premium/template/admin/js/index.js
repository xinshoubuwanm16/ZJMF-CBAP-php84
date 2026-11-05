(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("template")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    const host = location.host;
    const fir = location.pathname.split("/")[1];
    const str = `${host}/${fir}/`;
    new Vue({
      components: {
        comConfig,
      },
      data() {
        return {
          configObj: {},
          starVisible: false,
          starObj: {
            id: "",
            title: "",
            department: "",
            satisfaction: 0,
            attitude: 0,
            processing_time: 0,
          },
          starLoading: false,
          message: "template...",
          closeRow: null,
          closeOrderVisible: false,
          activeTab: "first",
          departmentList: [],
          params: {
            keywords: "",
            page: 1,
            limit: 20,
            orderby: "status",
            sort: "desc",
            // 工单类型
            type_id: [],
            // 工单状态
            status: [],
            // 发起人
            post_admin_id: "",
            // 跟进人
            last_reply_admin_id: "",
            // 领取人
            order_admin_id: "",
          },
          total: 100,
          pageSizeOptions: [20, 50, 100],
          timeList: [
            {
              label: "1" + lang.sales_plugin_text73,
              value: 60000,
            },
            {
              label: "3" + lang.sales_plugin_text73,
              value: 180000,
            },
            {
              label: "5" + lang.sales_plugin_text73,
              value: 300000,
            },
            {
              label: "10" + lang.sales_plugin_text73,
              value: 600000,
            },
          ],
          order_time: 180000,
          tableHeight: 500,
          // 上传文件headers设置
          uploadHeaders: {
            Authorization: "Bearer" + " " + localStorage.getItem("backJwt"),
          },
          uploadUrl: str + "v1/upload",

          uploadTip: "",
          // 转发弹窗
          forwardDialogVisible: false,
          submitLoading: false,
          forwardFormData: {
            id: "",
            department_id: "",
            admin_id: "",
            type_id: "",
            notes: "",
          },
          forwardFormRules: {
            department_id: [
              {
                required: true,
                message: lang.order_designated_department + lang.isRequired,
                type: "error",
              },
            ],
            admin_id: [
              {
                required: true,
                message: lang.order_designated_person + lang.isRequired,
                type: "error",
              },
            ],
            notes: [
              {
                required: true,
                message: lang.order_designated_reson + lang.isRequired,
                type: "error",
              },
            ],
            type_id: [
              {
                required: true,
                message: lang.order_designated_type + lang.isRequired,
                type: "error",
              },
            ],
          },

          // 新建工单弹窗
          addOrderDialogVisible: false,
          addOrderFormData: {},
          addOrderFormRules: {
            title: [
              {
                required: true,
                message: lang.order_title + lang.isRequired,
                type: "error",
              },
              {
                validator: (val) => val.length >= 1 && val.length <= 150,
                message: lang.verify8 + "1-150",
                type: "warning",
              },
            ],
            priority: [
              {
                required: true,
                message: lang.order_priority + lang.isRequired,
                type: "error",
              },
            ],
            type_id: [
              {
                required: true,
                message: lang.order_name + lang.isRequired,
                type: "error",
              },
            ],
            admin_role_id: [
              {
                required: true,
                message: lang.order_designated_department + lang.isRequired,
                type: "error",
              },
            ],
            content: [
              {
                validator: (val) => !val || val.length <= 3000,
                message: lang.verify3 + "3000",
                type: "warning",
              },
            ],
          },

          // 工单类型管理弹窗
          orderTypeMgtDialogVisible: false,
          orderTypeMgtTableloading: false,
          orderTypeEditRow: {},
          orderTypeMgtData: [],
          orderTypeMgtColumns: [
            {
              align: "left",
              width: 50,
              colKey: "index",
              title: lang.order_index,
            },
            {
              align: "left",
              width: 130,
              colKey: "name",
              title: lang.order_type_name,
            },
            {
              align: "left",
              width: 180,
              colKey: "role_name",
              title: lang.order_default_receive_department,
            },
            {
              align: "left",
              width: 100,
              colKey: "operation",
              title: lang.operation,
              fixed: "right",
            },
          ],

          // 关联客户下拉框数据
          clientOptions: [],
          // 关联产品下拉框数据
          hostOptions: [],
          // 指定部门下拉框数据（管理员分组列表数据）
          departmentOptions: [],
          // 所有人员数据
          adminList: [],
          // 紧急程度下拉框数据
          priorityOptions: [
            {
              id: "medium",
              name: lang.order_priority_medium,
            },
            {
              id: "high",
              name: lang.order_priority_high,
            },
          ],
          // 内部工单列表
          internalOrderTableloading: true,
          internalOrderData: [],
          isSubmit: false,
          internalOrderColumns: [
            {
              align: "left",
              width: "200",
              colKey: "id",
              title: "ID",
            },
            {
              align: "left",
              colKey: "title",
              title: lang.order_title,
              ellipsis: true,
            },
            {
              align: "left",
              width: "220",
              colKey: "name",
              title: lang.order_name,
              ellipsis: true,
            },
            {
              align: "left",
              width: "150",
              colKey: "admin_name",
              title: lang.order_text87,
              ellipsis: true,
            },
            {
              align: "left",
              width: "230",
              colKey: "user",
              title: lang.order_text134,
              ellipsis: true,
            },
            {
              align: "left",
              width: "160",
              colKey: "last_reply_time",
              title: lang.order_last_reply_time,
              ellipsis: true,
            },
            {
              align: "left",
              width: "110",
              colKey: "status",
              title: lang.order_status,
            },
            {
              align: "center",
              width: "110",
              colKey: "admin_id",
              fixed: "right",
            },
            {
              align: "left",
              width: "120",
              colKey: "operation",
              fixed: "right",
              title: lang.operation,
            },
          ],

          // 内部工单状态
          statusList: [],
          timer: null,
          isPlayerAudio: false,
          audio_tip: null,
          playNum: 1,
        };
      },
      computed: {
        orderTypeOptions() {
          return (
            this.departmentList.filter(
              (item) => item.id === this.forwardFormData.department_id
            )[0]?.type || []
          );
        },
        adminsOptions() {
          return (
            this.departmentList.filter(
              (item) => item.id === this.forwardFormData.department_id
            )[0]?.admin || []
          );
        },
      },

      created() {
        const domHeight = template.scrollHeight;
        this.tableHeight = domHeight - 230;
        this.getDepartmentOptions();
        this.getConfig();
        setTimeout(() => {
          this.selectTimeChange(180000);
        }, 180000);
      },
      mounted() {
        this.audio_tip = document.getElementById("audio_tip");
        // 获取内部工单状态
        this.getTicketStatus();
      },

      methods: {
        handelStar(row) {
          this.starObj.id = row.id;
          this.starObj.title = row.title;
          this.starObj.department = row.department_name + "-" + row.type_name;
          this.starObj.satisfaction = 0;
          this.starObj.attitude = 0;
          this.starObj.processing_time = 0;
          this.starVisible = true;
        },

        // 关闭工单
        internalOrderResolved(row) {
          this.submitLoading = true;
          closeInternalOrder(row.id)
            .then((result) => {
              this.$message.success({
                content: result.data.msg,
                placement: "top-right",
              });
              this.submitLoading = false;
              this.closeDia();
              this.getInternalOrderList();
            })
            .catch((result) => {
              this.submitLoading = false;
              this.$message.warning({
                content: result.data.msg,
                placement: "top-right",
              });
            });
        },
        starSubmit() {
          if (
            this.starObj.satisfaction === 0 ||
            this.starObj.attitude === 0 ||
            this.starObj.processing_time === 0
          ) {
            this.$message.warning(lang.order_text163);
            return;
          }
          this.starLoading = true;
          const { id, satisfaction, attitude, processing_time } = this.starObj;

          const params = {
            id,
            satisfaction,
            attitude,
            processing_time,
          };
          orderScore(params)
            .then((res) => {
              this.$message.success(res.data.msg);
              this.starLoading = false;
              this.starVisible = false;
              this.getInternalOrderList();
            })
            .catch((err) => {
              this.starLoading = false;
              this.$message.error(err.data.msg);
            });
        },
        async getConfig() {
          try {
            const res = await getOrderConfig();
            this.configObj = res.data.data;
          } catch (error) {}
        },
        // 获取部门数据
        getDepartmentOptions() {
          ticketDepartment().then((res) => {
            this.adminList = [];
            const arr = [];
            this.departmentList = res.data.data.list.map((item) => {
              item.label = item.name;
              item.value = "f-" + item.id;
              item.admin.forEach((is) => {
                if (!arr.includes(is.id)) {
                  arr.push(is.id);
                  this.adminList.push(is);
                }
              });
              item.children = item.type.map((i) => {
                i.label = i.name;
                i.value = i.id;
                return i;
              });
              item.orginId = item.id;
              item.id = "t-" + item.id;
              return item;
            });
          });
        },
        // 选择部门变化
        departmentChange(val) {
          // 清除已选人员数据
          this.forwardFormData.type_id = "";
          this.forwardFormData.admin_id = "";
        },

        rowClick(e) {
          // location.href = `ticket_detail.htm?id=${e.row.id}`;
        },
        // 工单-接收
        userOrderReceive(row) {
          row.receiveLoading = true;
          orderAccept(row.id)
            .then((result) => {
              this.$message.success(result.data.msg);
              row.receiveLoading = false;
              this.getInternalOrderList();
            })
            .catch((err) => {
              row.receiveLoading = false;
              this.$message.warning(err.data.msg);
            });
        },
        // 工单-列表-获取数据
        async getInternalOrderList() {
          const internalOrderData = await getInternalOrder(this.params);
          if (internalOrderData && internalOrderData.data) {
            internalOrderData.data.data.list.forEach((item) => {
              item.newTitle = "#" + item.ticket_num + "-" + item.title;
              item.receiveLoading = false;
            });
            if (this.internalOrderData.length > 0 && this.isPlayerAudio) {
              this.audio_tip.addEventListener("ended", this.palyAudio);
              this.audio_tip.play();
            }
            this.internalOrderData = internalOrderData.data.data.list;
            this.total = internalOrderData.data.data.count;
            this.internalOrderTableloading = false;
          }
        },
        // 工单-列表-切换分页
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.params.keywords = "";
          this.getInternalOrderList();
        },
        // 工单-列表-查询
        doInternalOrderSearch(val) {
          if (val === "all") {
            this.params.status = this.statusList.map((item) => {
              return item.id;
            });
          }
          this.params.page = 1;
          this.getInternalOrderList();
        },
        // 工单-列表-清空
        doInternalOrderClear() {
          this.params.page = 1;
          this.params.keywords = "";
          this.getInternalOrderList();
        },
        isClose(row) {
          this.closeRow = row;
          this.closeOrderVisible = true;
        },

        closeDia() {
          this.closeOrderVisible = false;
        },
        // 工单-接收
        internalOrderReceive(row) {
          receiveInternalOrder(row.id)
            .then((result) => {
              this.$message.success({
                content: result.data.msg,
                placement: "top-right",
              });
              this.getInternalOrderList();
            })
            .catch((result) => {
              this.$message.warning({
                content: result.data.msg,
                placement: "top-right",
              });
            });
        },

        // 工单-转发
        internalOrderForward(row) {
          this.forwardFormData.admin_id = "";
          this.forwardFormData.type_id = "";
          this.forwardFormData.department_id = "";
          this.forwardFormData.id = row.id;
          this.forwardFormData.notes = "";
          this.forwardDialogVisible = true;
        },
        // 工单-转发-提交
        forwardFormSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            const data = this.forwardFormData;
            data.department_id = data.department_id.split("-")[1];

            const params = {
              ...data,
            };
            this.submitLoading = true;
            forwardInternalOrder(data.id, params)
              .then((result) => {
                this.$message.success({
                  content: result.data.msg,
                  placement: "top-right",
                });
                this.submitLoading = false;
                this.forwardDialogClose();
                this.getInternalOrderList();
              })
              .catch((result) => {
                this.submitLoading = false;
                this.$message.warning({
                  content: result.data.msg,
                  placement: "top-right",
                });
              });
          } else {
            this.$message.warning({
              content: firstError,
              placement: "top-right",
            });
          }
        },
        // 工单-转发-弹窗关闭
        forwardDialogClose() {
          this.forwardDialogVisible = false;
        },

        // 工单-新建工单-上传文件返回内容
        uploadFormatResponse(res) {
          if (!res || res.status !== 200) {
            return { error: res.msg };
          }
          return { ...res, save_name: res.data.save_name };
        },
        // 上传附件-进度
        uploadProgress(val) {
          if (val.percent) {
            this.uploadTip = "uploaded" + val.percent + "%";
            if (val.percent === 100) {
              this.uploadTip = "";
            }
          }
        },
        // 上传附件-成功后
        uploadSuccess(res) {
          if (
            res.fileList.filter((item) => item.name == res.file.name).length > 1
          ) {
            this.$message.warning({
              content: lang.upload_same_name,
              placement: "top-right",
            });
            this.addOrderFormData.attachment.splice(
              this.addOrderFormData.attachment.length - 1,
              1
            );
          }
          this.$forceUpdate();
        },
        removeAttachment(file, i) {
          this.addOrderFormData.attachment.splice(i, 1);
          this.$forceUpdate();
        },
        goclient_detail(row) {
          location.href = str + `client_detail.htm?client_id=${row.client_id}`;
        },
        // 工单-回复
        internalOrderReply(row) {
          this.$checkPermission(
            "auth_addon_ticket_internal_premium_ticket_detail"
          ) && (location.href = `ticket_internal_detail.htm?id=${row.id}`);
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

        // 获取工单状态
        async getTicketStatus() {
          try {
            const res = await ticketStatus();
            if (res.data.status == 200) {
              const list = res.data.data.list;
              list.forEach((item) => {
                if (item["status"] === 0) {
                  this.params.status.push(item.id);
                }
                delete item["default"];
              });
              this.statusList = list;
              this.isPlayerAudio = true;
              // 获取内部工单列表
              this.getInternalOrderList();
            }
          } catch (error) {}
        },
        // 选择刷新时间
        selectTimeChange(value) {
          if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
          }
          this.timer = setInterval(() => {
            this.isPlayerAudio = true;
            this.getInternalOrderList();
          }, value);
        },
        // 播放音频
        palyAudio() {
          this.playNum++;
          if (this.playNum >= 3) {
            this.playNum = 1;
            this.isPlayerAudio = false;
            return;
          }
          this.audio_tip.play();
        },
        goAddorder() {
          location.href = `ticket_internal_add.htm`;
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

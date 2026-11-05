(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("template")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    const host = location.origin;
    const fir = location.pathname.split("/")[1];
    const str = `${host}/${fir}`;
    new Vue({
      components: {
        comConfig,
        comChooseUser,
      },
      data() {
        return {
          configObj: {},
          id: "",
          baseUrl: str,
          message: "template...",
          activeTab: "first",
          showIdcsmartTicketInternal: false,
          params: {
            keywords: "", // 关键字
            page: 1,
            limit: 20,
            status: [], // 状态
            ticket_type_ids: [],
            client_id: "", // 用户搜索
            admin_id: "", // 跟进人搜索
            host_id: "",
            last_reply_admin_id: "", // 跟进人搜索
          },
          userParams: {
            keywords: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
          },
          popupProps: {
            overlayInnerStyle: (trigger) => ({
              width: `${trigger.offsetWidth}px`,
              "max-height": "362px",
            }),
          },
          searchLoading: false,
          // 转发弹窗
          forwardDialogVisible: false,
          audio_tip: null,
          playNum: 1,
          isPlayerAudio: false,
          forwardFormData: {
            id: "",
            department_id: "",
            admin_id: "",
            ticket_type_id: "",
            notes: "",
          },
          departmentList: [],

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
            ticket_type_id: [
              {
                required: true,
                message: lang.order_designated_type + lang.isRequired,
                type: "error",
              },
            ],
          },
          total: 100,
          pageSizeOptions: [20, 50, 100],
          tableHeight: 500,
          // 工单转内部弹窗
          turnInsideDialogVisible: false,
          turnInsideFormData: {},
          turnInsideFormRules: {
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
            ticket_type_id: [
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
          // 指定部门下拉框数据（管理员分组列表数据）
          departmentOptions: [],
          // 所有人员数据
          adminList: [],
          // 关联客户下拉框数据
          clientOptions: [],
          // 关联产品下拉框数据
          hostOptions: [],
          // 工单类型下拉框数据
          // 工单状态下拉框数据
          order_status_options: [],
          closeOrderVisible: false,
          // 默认自动刷新时间
          order_time: 180000,
          timeList: [
            {
              label: "1分钟",
              value: 60000,
            },
            {
              label: "3分钟",
              value: 180000,
            },
            {
              label: "5分钟",
              value: 300000,
            },
            {
              label: "10分钟",
              value: 600000,
            },
          ],
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
          // 上传文件headers设置
          uploadHeaders: {
            Authorization: "Bearer" + " " + localStorage.getItem("backJwt"),
          },
          uploadUrl: str + "/v1/upload",
          uploadTip: "",
          // 用户工单列表
          userOrderTableloading: false,
          userOrderData: [],
          userOrderColumns: [
            {
              align: "left",
              width: "120",
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
              title: lang.order_user_people,
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
              ellipsis: true,
            },
            {
              align: "center",
              width: "110",
              colKey: "admin_id",
              fixed: "right",
            },
            {
              align: "center",
              width: "120",
              colKey: "op",
              fixed: "right",
              title: lang.operation,
            },
          ],
          // 管理工单类型弹窗相关
          orderTypeMgtTableloading: false,
          orderTypeMgtDialogVisible: false,
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
            // priority: [{ required: true, message: lang.order_priority + lang.isRequired, type: 'error' }],
            client_id: [
              {
                required: true,
                message: lang.order_text2 + lang.isRequired,
                type: "error",
              },
            ],
            ticket_type_id: [
              {
                required: true,
                message: lang.order_name + lang.isRequired,
                type: "error",
              },
            ],
            // admin_role_id: [{
            //   required: true, message: lang.order_designated_department + lang.isRequired,
            //   type: 'error'
            // }],
            content: [
              {
                validator: (val) => !val || val.length <= 3000,
                message: lang.verify3 + "3000",
                type: "warning",
              },
            ],
          },
          clientList: [], // 用户列表
          clientDetail: {},
          searchLoading: false,
          clinetParams: {
            keywords: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
          },
          hostArr: [],
          submitLoading: false,
        };
      },
      computed: {
        calcShow() {
          return (data) => {
            return (
              `#${data.id}-` +
              (data.username
                ? data.username
                : data.phone
                ? data.phone
                : data.email) +
              (data.company ? `(${data.company})` : "")
            );
          };
        },
        isExist() {
          return !this.clientList.find(
            (item) => item.id === this.clientDetail.id
          );
        },
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
      methods: {
        async getHostList() {
          try {
            const res = await getClientPro(this.id, { page: 1, limit: 9999 });
            this.hostArr = res.data.data.list;
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        getQuery(name) {
          const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
          const r = window.location.search.substr(1).match(reg);
          if (r != null) return decodeURI(r[2]);
          return null;
        },
        // 远程搜素
        remoteMethod(key) {
          this.clinetParams.keywords = key;
          this.getClintList();
        },
        filterMethod(search, option) {
          return option;
        },
        // 0：正常 1: 已超时 2：不足15%
        isExpire(post_time, due_time) {
          // 获取现在的时间戳 秒级
          const now = new Date().getTime() / 1000;
          const timeDiff = due_time * 1 - now;
          const allTime = due_time * 1 - post_time * 1;
          if (timeDiff <= 0) {
            return 1;
          } else if (timeDiff / allTime <= 0.15) {
            return 2;
          } else {
            return 0;
          }
        },
        // 获取用户详情
        async getUserDetail() {
          try {
            const res = await getClientDetail(this.id);
            this.clientDetail = res.data.data.client;
          } catch (error) {}
        },
        async getClintList() {
          try {
            this.searchLoading = true;
            const res = await getClientList(this.clinetParams);
            this.clientList = res.data.data.list;
            this.clientTotal = res.data.data.count;
            this.searchLoading = false;
          } catch (error) {
            console.log("error", error);
            this.searchLoading = false;
            console.log(error.data.msg);
          }
        },
        changeUser(id) {
          this.id = id;
          location.href = `${this.baseUrl}/plugin/idcsmart_ticket/client_ticket.htm?id=${this.id}`;
        },
        // 选择部门
        changeType(type) {},

        rowClick(e) {
          // location.href = `ticket_detail.htm?id=${e.row.id}`;
        },
        // 工单-转发
        internalOrderForward(row) {
          // 清除已选人员数据
          this.forwardFormData.admin_id = "";
          this.forwardFormData.ticket_type_id = "";
          this.forwardFormData.department_id = "";
          this.forwardFormData.id = row.id;
          this.forwardFormData.notes = "";
          this.forwardDialogVisible = true;
        },
        goclient_detail(row) {
          location.href = str + `/client_detail.htm?client_id=${row.client_id}`;
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
            forwardTicket(data.id, params)
              .then((result) => {
                this.$message.success({
                  content: result.data.msg,
                  placement: "top-right",
                });
                this.forwardDialogClose();
                this.getUserOrderList();
              })
              .catch((result) => {
                this.$message.warning({
                  content: result.data.msg,
                  placement: "top-right",
                });
              })
              .finally(() => {
                this.submitLoading = false;
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
        // 获取客户数据
        getClientOptions() {
          this.searchLoading = true;
          getClient(this.userParams)
            .then((result) => {
              this.searchLoading = false;
              this.clientOptions = result.data.data.list;
            })
            .catch((err) => {
              this.searchLoading = false;
            });
        },
        // 获取部门数据
        getDepartmentOptions() {
          getAdminRole({ page: 1, limit: 10000 })
            .then((result) => {
              this.departmentOptions = result.data.data.list;
            })
            .catch();
        },
        // 获取已激活插件
        getActive_plugin() {
          active_plugin().then((res) => {
            const arr = res.data.data.list.map((item) => {
              return item.name;
            });
            if (arr.includes("IdcsmartTicketInternal")) {
              this.showIdcsmartTicketInternal = true;
              this.$forceUpdate();
            }
          });
        },
        // 获取工单状态列表
        getTicketStatus() {
          ticketStatus().then((res) => {
            res.data.data.list.forEach((item) => {
              // if (item['status'] === 0) {
              //   this.params.status.push(item.id)
              // }
              this.params.status.push(item.id);
              delete item["default"];
            });
            this.order_status_options = res.data.data.list;
            this.isPlayerAudio = true;
            this.getUserOrderList();
          });
        },
        // 选择刷新时间
        selectTimeChange(value) {
          if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
          }
          this.timer = setInterval(() => {
            this.isPlayerAudio = true;
            this.doUserOrderClear();
          }, value);
        },
        // 工单-获取数据
        async getUserOrderList() {
          this.userOrderTableloading = true;
          const userOrderData = await getUserOrder(this.params);
          if (userOrderData && userOrderData.data) {
            userOrderData.data.data.list.forEach((item) => {
              item.newTitle = "#" + item.ticket_num + "-" + item.title;
              item.receiveLoading = false;
            });
            this.userOrderData = userOrderData.data.data.list;
            this.total = userOrderData.data.data.count;
            this.userOrderTableloading = false;
          }
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
        // 工单-切换分页
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.getUserOrderList();
        },
        // 新建工单
        goAddorder(row) {
          if (row) {
            location.href = encodeURI(
              `${str}/plugin/ticket_internal_premium/ticket_internal_add.htm?id=${
                row.id
              }&client_id=${row.client_id}&host_ids=${JSON.stringify(
                row.host_ids
              )}`
            );
          } else {
            location.href = `ticket_add.htm`;
          }
        },
        // 工单-查询
        doUserOrderSearch() {
          this.params.page = 1;
          this.getUserOrderList();
        },
        // 工单-列表-清空
        doUserOrderClear() {
          this.params.page = 1;
          this.params.keywords = "";
          this.params.status = []; // 状态
          this.params.ticket_type_id = ""; // 工单类型
          this.params.client_id = ""; // 用户搜索
          this.params.admin_id = ""; // 跟进人搜索
          this.getTicketStatus();
        },
        // 工单-转内部
        userOrderTurnInside(row) {
          this.turnInsideFormData = {};
          getUserOrderDetail(row.id)
            .then((result) => {
              const data = result.data.data.ticket;
              if (data.attachment && data.attachment.length > 0) {
                data.attachment.forEach((item, i) => {
                  data.attachment[i] = { response: {} };
                  data.attachment[i].name = item.split("^")[1];
                  data.attachment[i].response.save_name =
                    item.split("upload/")[1];
                });
              }
              this.turnInsideFormData = { ...row, ...data };
              // const client = this.clientOptions.filter(item => item.username === row.username)[0];
              // this.turnInsideFormData.client_id = client ? client.id : null;

              if (this.turnInsideFormData.client_id) {
                this.clientChange(this.turnInsideFormData.client_id, true);
              }
              if (!this.turnInsideFormData.ticket_type_id) {
                const orderType = this.orderTypeOptions.filter(
                  (item) => item.name === this.turnInsideFormData.name
                )[0];
                this.turnInsideFormData.ticket_type_id = orderType
                  ? orderType.id
                  : null;
              }
              this.orderTypeChange(this.turnInsideFormData.ticket_type_id);
              // this.turnInsideFormData.attachment = [];
              this.turnInsideDialogVisible = true;
            })
            .catch((error) => {
              console.log(error);
            });
        },
        // 工单-转内部-关联用户变化
        clientChange(val, isFirst) {
          if (!isFirst) {
            // 清除已选产品数据
            this.turnInsideFormData.host_ids = [];
          }
          getHost({ client_id: val, page: 1, limit: 10000 }).then((result) => {
            this.hostOptions = result.data.data.list;
            this.hostChange();
          });
        },
        // 工单-转内部-关联产品变化
        hostChange() {
          this.$forceUpdate();
        },
        // 工单-转内部-选择部门变化
        departmentChange(val) {
          this.forwardFormData.ticket_type_id = "";
          this.forwardFormData.admin_id = "";
        },
        // 工单-转发-选择人员变化
        adminChange(val) {
          this.$forceUpdate();
        },
        // 工单-转内部-工单类型变化
        orderTypeChange(val) {
          // 获取当前所选数据工单类型对应部门名称
          const type = this.orderTypeOptions.filter(
            (item) => item.id === val
          )[0];
          const admin_role_name = type ? type.role_name : null;
          if (admin_role_name) {
            // 默认设置部门为工单类型对应的部门
            const data = this.departmentOptions.filter(
              (item) => item.name && item.name === admin_role_name
            )[0];
            this.turnInsideFormData.admin_role_id =
              data && data.id ? data.id : null;
            // 获取该部门下人员列表
            this.departmentChange(this.turnInsideFormData.admin_role_id);
          }
          // 清除已选人员数据
          this.turnInsideFormData.admin_id = null;
        },
        // 工单-转内部-上传附件-返回
        uploadFormatResponse(res) {
          if (!res || res.status !== 200) {
            return { error: lang.upload_fail };
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
            this.turnInsideFormData.attachment.splice(
              this.turnInsideFormData.attachment.length - 1,
              1
            );
          }
          this.$forceUpdate();
        },
        removeAttachment(file, i) {
          this.turnInsideFormData.attachment.splice(i, 1);
          this.$forceUpdate();
        },
        // 工单-转内部-提交
        turnInsideFormSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            const data = this.turnInsideFormData;
            const attachmentList = [];
            data.attachment.forEach((item) => {
              attachmentList.push(item.response.save_name);
            });
            const params = {
              ticket_id: data.id, //工单ID(转内部工单时需要传此参数)
              title: data.title, //内部工单标题
              ticket_type_id: data.ticket_type_id, //内部工单类型ID
              priority: data.priority, //紧急程度:medium一般,high紧急
              client_id: data.client_id ? data.client_id : null, //关联用户
              admin_role_id: data.admin_role_id, //指定部门
              admin_id: data.admin_id ? data.admin_id : null, //管理员ID
              host_ids: data.host_ids ? data.host_ids : [], //关联产品ID,数组
              content: data.content ? data.content : "", //问题描述
              attachment: attachmentList, //附件,数组,取上传文件返回值save_name)
            };
            this.submitLoading = true;
            newInternalOrder(params)
              .then((result) => {
                this.$message.success({
                  content: result.data.msg,
                  placement: "top-right",
                });
                this.turnInsideDialogClose();
                this.getUserOrderList();
              })
              .catch((result) => {
                this.$message.warning({
                  content: result.data.msg,
                  placement: "top-right",
                });
              })
              .finally(() => {
                this.submitLoading = false;
              });
          } else {
            this.$message.warning({
              content: firstError,
              placement: "top-right",
            });
          }
        },
        // 工单-转内部-弹窗关闭
        turnInsideDialogClose() {
          this.turnInsideDialogVisible = false;
        },
        // 工单-接收
        userOrderReceive(row) {
          row.receiveLoading = true;
          receiveUserOrder(row.id)
            .then((result) => {
              this.$message.success({
                content: result.data.msg,
                placement: "top-right",
              });
              this.getUserOrderList();
            })
            .catch((result) => {
              row.receiveLoading = false;
              this.$message.warning({
                content: result.data.msg,
                placement: "top-right",
              });
            });
        },
        // 工单-回复
        userOrderReply(row) {
          this.$checkPermission("auth_user_detail_ticket_premium_detail") &&
            (location.href = `ticket_detail.htm?id=${row.id}`);
        },
        // 工单-已解决
        userOrderResolved(row) {
          this.submitLoading = true;
          resolvedUserOrder(row.id)
            .then((result) => {
              this.$message.success({
                content: result.data.msg,
                placement: "top-right",
              });
              this.getUserOrderList();
              this.closeDia();
            })
            .catch((result) => {
              this.$message.warning({
                content: result.data.msg,
                placement: "top-right",
              });
            })
            .finally(() => {
              this.submitLoading = false;
            });
        },
        isClose(row) {
          this.closeRow = row;
          this.closeOrderVisible = true;
        },
        closeDia() {
          this.closeOrderVisible = false;
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
      },
      created() {
        // localStorage.setItem('curValue', 253)
        const domHeight = template.scrollHeight;
        this.tableHeight = domHeight - 230;
        this.id = this.params.client_id = this.getQuery("id") * 1;
        this.params.host_id = this.getQuery("host_id") * 1 || "";
        this.getHostList();
        this.getDepartmentOptions();
        this.getClientOptions();
        this.getActive_plugin();
        this.getClintList();
        this.getUserDetail();
        setTimeout(() => {
          this.selectTimeChange(180000);
        }, 180000);
        window.doUserOrderSearch = this.doUserOrderSearch();
      },
      mounted() {
        this.audio_tip = document.getElementById("audio_tip");
        this.getTicketStatus();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("voucher")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = window.moment;
    const host = location.origin;
    const fir = location.pathname.split("/")[1];
    const str = `${host}/${fir}/`;
    new Vue({
      components: {
        comConfig,
        comChooseUser,
      },
      data() {
        return {
          baseUrl: "",
          curLevelId: "",
          data: [],
          tableLayout: false,
          bordered: true,
          visible: false,
          delVisible: false,
          statusVisble: false,
          hover: true,
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          columns: [
            {
              colKey: "code",
              title: lang.voucher_code,
              className: "code-item",
              width: 120,
            },
            {
              colKey: "price",
              title: lang.money,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "use",
              title: lang.voucher_use,
              width: 150,
              className: "used",
            },
            {
              colKey: "type",
              title: lang.voucher_type,
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "start_time",
              title: lang.assert_time,
              width: 170,
            },
            {
              colKey: "end_time",
              title: lang.dead_time,
              width: 170,
            },
            {
              colKey: "status",
              title: lang.current_state,
              width: 120,
            },
            {
              colKey: "notes",
              title: lang.notes,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "op",
              title: lang.operation,
              width: 100,
            },
          ],
          params: {
            code: "",
            status: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
          },
          total: 0,
          pageSizeOptions: [20, 50, 100],
          loading: false,
          maxHeight: "",
          levelList: [],
          statusVisble: false,
          recordTit: "",
          statusTip: "",
          /* 使用记录 */
          recordDialog: false,
          recordLoading: false,
          recordList: [],
          recordPage: [5, 10],
          recordColumns: [
            {
              colKey: "username",
              title: lang.order_username,
              className: "code-item",
            },
            {
              colKey: "status",
              title: lang.use_status,
            },
            {
              colKey: "order_id",
              title: lang.order_number,
            },
            {
              colKey: "use_time",
              title: lang.use_time,
            },
            {
              colKey: "op",
              title: lang.operation,
              width: 80,
            },
          ],
          recordTotal: 0,
          recordParams: {
            // 发放记录
            client_id: "",
            page: 1,
            limit: 5,
            use: "",
            voucher_id: "",
          },
          // 切换状态
          statusParams: {},
          typeList: [
            {
              value: "0",
              label: lang.not_used,
            },
            {
              value: "1",
              label: lang.used,
            },
          ],
          useStatus: {
            expired: lang.promo_expiration,
            normal: lang.not_used,
            used: lang.used,
          },
          statusList: [
            {
              value: "disable",
              label: lang.stop_using_the,
            },
            {
              value: "enable",
              label: lang.promo_active,
            },
            {
              value: "expired",
              label: lang.promo_expiration,
            },
            {
              value: "wait_effect",
              label: lang.promo_pending,
            },
          ],
          popupProps: {
            overlayInnerStyle: (trigger) => ({
              width: `${trigger.offsetWidth}px`,
            }),
            attach: `#load`,
          },
          // 发放代金卷
          sourceModal: false,
          pluginKey: "",
          originColumns: [
            {
              colKey: "row-select",
              type: "multiple",
              className: "demo-multiple-select-cell",
              width: 30,
            },
            { colKey: "username", title: lang.name, ellipsis: true },
            { colKey: "phone", title: lang.contact, ellipsis: true },
            { colKey: "email", title: lang.email, ellipsis: true },
          ],
          checkColumns: [
            { colKey: "username", title: lang.name, ellipsis: true },
            { colKey: "phone", title: lang.contact, ellipsis: true },
            { colKey: "email", title: lang.email, ellipsis: true },
            {
              colKey: "num",
              title: lang.grant_times,
              ellipsis: true,
              align: "center",
            },
            { colKey: "op", width: 40, className: "delItem", align: "right" },
          ],
          originList: [],
          checkId: [],
          checkList: [],
          selectedRowKeys: [],
          clientParams: {
            page: 1,
            limit: 20,
            keywords: "",
            type: "", // "" | id | username | phone | email
          },
          userTotal: 0,
          clientList: [],
          isLoading: false,
          curId: "",
          // 代金券发放次数表
          voucherTimes: [],
          grantClient: [],
          grantParams: {
            page: 1,
            limit: 20,
            keywords: "",
          },
          checkAll: false,
          submitLoading: false,
          typeOption: [
            { value: "", label: lang.auth_all },
            { value: "id", label: "ID" },
            { value: "username", label: lang.name },
            { value: "phone", label: lang.phone },
            { value: "email", label: lang.email },
          ],
          hasDelete: false
        };
      },
      created() {
        this.getVoucherList();
        this.getClientList();
      },
      methods: {
        closeRecord () {
          if (this.hasDelete) {
            this.getVoucherList();
          }
        },
        deleteHandler (row) {
          this.curId = row.id;
          this.delVisible = true;
        },
        async sureDel () {
          try {
            this.submitLoading = true;
            const res = await deleteVoucher({
              id: this.curId
            });
            this.hasDelete = true;
            this.submitLoading = false;
            this.$message.success(res.data.msg);
            this.getRecordList();
            this.delVisible = false;
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        changeUser(val) {
          this.recordParams.client_id = val;
        },
        changeUserPage(e) {
          this.clientParams.page = e.current;
          this.clientParams.limit = e.pageSize;
          this.clientParams.keywords = "";
          this.getClientList();
        },
        goDetail({ row, e }) {
          if (!this.$checkPermission("auth_idcsmart_voucher_update_voucher")) {
            return;
          }
          const name = e.target.className;
          if (name === "stop" || name.baseVal?.indexOf("stop")) {
            return;
          }
          location.href = `create_voucher.htm?id=${row.id}`;
        },
        jump(row) {
          location.href = `create_voucher.htm?id=${row.id}`;
        },
        async getVoucherTime() {
          try {
            const res = await getVoucherTimes({
              id: this.curId,
            });
            this.voucherTimes = res.data.data.list;
          } catch (error) {}
        },
        loadTest(e) {
          const el = e.e.target;
          const LIMIT_BOTTOM = 100;
          const scrollBottom =
            el.scrollHeight - (el.scrollTop + el.clientHeight) < LIMIT_BOTTOM;
          if (scrollBottom) {
            this.loadMore();
          }
        },
        async getClientList() {
          try {
            const res = await getClientList(this.clientParams);
            this.grantClient = res.data.data.list;
            this.userTotal = res.data.data.count;
            if (this.checkAll) {
              this.checkId = Array.from(
                new Set(this.grantClient.map((item) => item.id))
              );
              this.checkList.push(...this.grantClient);
              this.checkList = this.checkList.reduce((all, cur) => {
                if (!all.find((item) => item.id === cur.id)) {
                  all.push(cur);
                }
                return all;
              }, []);
            } else {
              this.checkId = this.checkList.map((item) => item.id);
            }
          } catch (error) {}
        },

        onSubmit() {},
        // 发放
        grantVoucher(row) {
          this.curId = row.id;
          this.sourceModal = true;
          this.checkId = [];
          this.checkList = [];
          this.pluginKey = "";
          this.getVoucherTime();
        },
        changeType() {
          this.clientParams.page = 1;
          this.clientParams.keywords = "";
        },
        // 本地搜索插件
        seacrhPlugin() {
          this.grantClient = [];
          this.userTotal = 0;
          this.getClientList();
        },
        clearPluginKey() {
          this.pluginKey = "";
          this.grantClient = this.clientList;
        },
        // 选择发放对象
        rehandleSelectChange(value, { selectedRowData }) {
          this.checkId = value;
          let temp = (this.selectedRowKeys = selectedRowData);
          if (value.length === 0) {
            this.checkList = [];
          } else {
            if (temp.length !== this.grantClient.length) {
              this.checkAll = false;
              const curId = this.grantClient.map((item) => item.id);
              this.checkList = this.checkList.filter(
                (item) => !curId.includes(item.id)
              );
            }
            this.checkList.push(...temp);
            this.checkList = this.checkList.reduce((all, cur) => {
              if (!all.find((item) => item.id === cur.id)) {
                all.push(cur);
              }
              return all;
            }, []);
          }

          // 处理发放次数
          this.checkList = this.checkList.map((item) => {
            item.num = this.voucherTimes.filter(
              (el) => el.client_id === item.id
            )[0]?.num;
            return item;
          });
        },
        changeAll(e) {
          if (e) {
            this.pluginKey = "";
            this.checkList = this.grantClient;
            this.checkId = this.grantClient.map((item) => item.id);
          } else {
            this.checkList = this.checkId = [];
          }
        },
        // 移除数据
        delItem(row) {
          const index = this.checkList.findIndex((item) => item.id === row.id);
          if (index !== -1) {
            this.checkList.splice(index, 1);
            this.checkId = this.checkId.filter((id) => id !== row.id);
          }
          this.checkAll = false;
        },
        async sureSubmit() {
          try {
            if (this.checkList.length === 0) {
              return this.$message.warning(lang.select + lang.user);
            }
            let client_id = [];
            if (this.checkAll) {
              client_id = ["all"];
            } else {
              client_id = this.checkList.reduce((all, cur) => {
                all.push(cur.id);
                return all;
              }, []);
            }
            const params = {
              id: this.curId,
              client_id,
            };
            this.submitLoading = true;
            const res = await grantVoucher(params);
            this.$message.success(res.data.msg);
            this.submitLoading = false;
            this.sourceModal = false;
            this.getVoucherList();
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },

        // 新增、编辑
        addPromo() {
          location.href = "create_voucher.htm";
        },
        updatePromo(row) {
          location.href = `create_voucher.htm?id=${row.id}`;
        },
        // 切换状态
        changeStatus(row) {
          this.statusParams = JSON.parse(JSON.stringify(row));
          this.statusVisble = true;
          this.statusTip =
            lang.sure +
            (row.status === "disable" ? lang.enable : lang.deactivate) +
            "?";
        },
        async sureChange() {
          try {
            const params = {
              id: this.statusParams.id,
              status: this.statusParams.status,
            };
            this.submitLoading = true;
            const res = await changeVoucherStatus(params);
            this.$message.success(res.data.msg);
            this.getVoucherList();
            this.statusVisble = false;
            this.submitLoading = false;
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        jumpUser(row) {
          location.href = str + `client_detail.htm?client_id=${row.client_id}`;
        },
        jumpOrder(row) {
          location.href = str + `order.htm?order_id=${row.order_id}`;
        },
        // 使用记录
        getRecord(row) {
          this.recordParams.voucher_id = row.id;
          this.recordParams.page = 1;
          this.recordParams.limit = 5;
          this.recordParams.client_id = "";
          this.recordParams.use = "";
          this.recordDialog = true;
          this.recordTit = lang.use_record + "-" + row.code;
          this.getRecordList();
        },
        changeRecord(e) {
          this.recordParams.page = e.current;
          this.recordParams.limit = e.pageSize;
          this.getRecordList();
        },
        async getRecordList() {
          try {
            this.recordLoading = true;
            const res = await useVoucherRecord(this.recordParams);
            this.recordTotal = res.data.data.count;
            this.recordList = res.data.data.list;
            this.recordLoading = false;
          } catch (error) {
            this.recordLoading = false;
          }
        },
        // 获取列表
        async getVoucherList() {
          try {
            this.loading = true;
            const res = await getVoucher(this.params, this.curLevelId);
            this.loading = false;
            this.hasDelete = false;
            this.data = res.data.data.list;
            this.total = res.data.data.count;
          } catch (error) {
            this.loading = false;
            this.$message.error(error.data.msg);
          }
        },
        // 切换分页
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.params.keywords = "";
          this.getVoucherList();
        },
        // 发放记录
        changeGrant(e) {
          this.grantParams.page = e.current;
          this.grantParams.limit = e.pageSize;
          this.grantParams.keywords = "";
          this.getGrantClient();
        },
        // 排序
        sortChange(val) {
          if (!val) {
            this.params.orderby = "id";
            this.params.sort = "desc";
          } else {
            this.params.orderby = val.sortBy;
            this.params.sort = val.descending ? "desc" : "asc";
          }
          this.getVoucherList();
        },
        // 使用记录搜索
        seacrhRecord() {
          this.recordParams.page = 1;
          this.getRecordList();
        },
        clearKey() {
          this.params.code = "";
          this.seacrh();
        },
        seacrh() {
          this.params.page = 1;
          this.getVoucherList();
        },
        async getGrantClient() {
          try {
            const res = await getClientList(this.grantParams);
            this.grantClient = res.data.data.list;
            this.userTotal = res.data.data.count;
          } catch (error) {}
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

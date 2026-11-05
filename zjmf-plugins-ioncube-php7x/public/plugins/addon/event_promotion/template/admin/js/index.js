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
      },
      data() {
        return {
          baseUrl: url,
          curLevelId: "",
          data: [],
          tableLayout: false,
          bordered: true,
          visible: false,
          delVisible: false,
          statusVisble: false,
          delVisible: false,
          hover: true,
          tableLoading: false,
          addon_event_promotion_does_not_participate: "",
          active_list: [],
          active_columns: [
            {
              colKey: "drag", // 列拖拽排序必要参数
              title: lang.event_promotion_text68,
              cell: "drag",
              width: 90,
            },
            {
              cell: "name",
              colKey: "name", // 列拖拽排序必要参数
              title: lang.event_promotion_text4,
              ellipsis: true,
            },
            {
              cell: "notes",
              title: lang.event_promotion_text66,
              ellipsis: true,
            },
          ],
          sortVisible: false,
          delId: null,
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set"))?.currency_prefix ||
            "¥",
          columns: [
            {
              cell: "id",
              colKey: "id",
              title: "ID",
              width: 90,
            },
            {
              cell: "name",
              colKey: "active_name",
              title: lang.event_promotion_text4,
              width: 300,
              ellipsis: true,
            },

            {
              colKey: "active_time",
              title: lang.event_promotion_text5,
              width: 400,
            },
            {
              cell: "client_type",
              colKey: "client_type",
              title: lang.event_promotion_text6,
              width: 150,
            },
            {
              colKey: "status",
              title: lang.event_promotion_text7,
              width: 120,
            },
            {
              colKey: "notes",
              title: lang.event_promotion_text8,
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "op",
              title: lang.event_promotion_text47,
              width: 100,
            },
          ],
          client_type: {
            all: lang.event_promotion_text9,
            appoint: lang.event_promotion_text10,
          },
          params: {
            keywords: "",
            status: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
            time: "",
          },
          total: 0,
          pageSizeOptions: [20, 50, 100],
          loading: false,
          levelList: [],
          statusVisble: false,
          recordTit: "",
          statusTip: "",
          popupProps: {
            overlayInnerStyle: (trigger) => ({
              width: `${trigger.offsetWidth}px`,
            }),
            attach: `#load`,
          },
          statusList: [
            {
              value: "Suspended",
              label: lang.event_promotion_text11,
              theme: "danger",
            },
            {
              value: "Active",
              label: lang.event_promotion_text12,
              theme: "success",
            },
            {
              value: "Expiration",
              label: lang.event_promotion_text13,
              theme: "default",
            },
            {
              value: "Pending",
              label: lang.event_promotion_text14,
              theme: "warning",
            },
          ],
          submitLoading: false,
        };
      },
      created() {
        this.getVoucherList();
      },
      methods: {
        async sureSort() {
          this.submitLoading = true;
          try {
            await apiActiveSort({
              id: this.active_list.map((item) => item.id),
            });
            await apiActiveConfig({
              addon_event_promotion_does_not_participate:
                this.addon_event_promotion_does_not_participate,
            });
            this.$message.success(lang.event_promotion_text69);
            this.submitLoading = false;
            this.sortVisible = false;
            this.getActiveList();
          } catch (err) {
            this.submitLoading = false;
            console.log(err);
          }
        },
        onDragSort({ targetIndex, newData }) {
          this.active_list = newData;
        },
        sortEvent() {
          this.getActiveList();
          this.sortVisible = true;
        },
        getActiveList() {
          this.tableLoading = true;
          apiActiveList()
            .then((res) => {
              this.active_list = res.data.data.list;
              this.addon_event_promotion_does_not_participate =
                res.data.data.addon_event_promotion_does_not_participate;
              this.tableLoading = false;
            })
            .catch((err) => {
              this.tableLoading = false;
              this.$message.error(err.data.msg);
            });
        },
        deletes(id) {
          this.delId = id;
          this.delVisible = true;
        },
        sureDelUser() {
          this.submitLoading = true;
          delVoucher(this.delId)
            .then((res) => {
              this.$message.success(res.data.msg);
              this.getVoucherList();
              this.delId = null;
              this.delVisible = false;
            })
            .catch((err) => {
              this.$message.error(err.data.msg);
            })
            .finally(() => {
              this.submitLoading = false;
            });
        },
        calcStatus(row) {
          return this.statusList.filter((item) => {
            return item.value === row.status;
          })[0];
        },
        goDetail({ row, e }) {
          if (
            !this.$checkPermission(
              "auth_event_promotion_update_event_promotion"
            )
          ) {
            return;
          }
          const name = e.target.className;
          if (name === "stop" || name.baseVal?.indexOf("stop")) {
            return;
          }
          location.href = `event_detail.htm?id=${row.id}`;
        },
        jump(row) {
          location.href = `event_detail.htm?id=${row.id}`;
        },

        // 新增、编辑
        addPromo() {
          location.href = "event_detail.htm";
        },

        // 切换状态
        changeStatus(row) {
          this.statusParams = JSON.parse(JSON.stringify(row));
          this.statusVisble = true;
          this.statusTip =
            lang.event_promotion_text45 +
            (row.status === "Suspended"
              ? lang.event_promotion_text48
              : lang.event_promotion_text49) +
            "?";
        },
        async sureChange() {
          try {
            this.submitLoading = true;
            const params = {
              id: this.statusParams.id,
              status: this.statusParams.status === "Active" ? 0 : 1,
            };
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

        // 获取列表
        async getVoucherList() {
          try {
            this.loading = true;
            const params = { ...this.params };
            if (params.time) {
              // 转时间戳
              params.time = new Date(params.time).getTime() / 1000;
            }
            const res = await getVoucher(params);
            this.loading = false;
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

        clearKey() {
          this.params.code = "";
          this.seacrh();
        },
        seacrh() {
          this.params.page = 1;
          this.getVoucherList();
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

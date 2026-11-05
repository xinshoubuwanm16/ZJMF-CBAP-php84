(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("admin")[0];
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
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set"))?.currency_prefix || "¥",
          currency_suffix:
            JSON.parse(localStorage.getItem("common_set"))?.currency_suffix || "元",
          params: {
            start_time: "",
            end_time: "",
            keywords: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
          },
          pageSizeOptions: [20, 50, 100],
          total: 0,
          tableList: [],
          columns: [
            {
              width: 80,
              colKey: "id",
              title: "ID",
            },
            {
              width: 100,
              cell: "host_id",
              title: lang.host_transfer_text4,
              ellipsis: true,
            },
            {
              width: 300,
              cell: "product_name",
              title: lang.host_transfer_text5,
              ellipsis: true,
            },
            {
              width: 300,
              cell: "name",
              title: lang.host_transfer_text6,
              ellipsis: true,
            },
            {
              width: 250,
              cell: "old_username",
              title: lang.host_transfer_text7,
              ellipsis: true,
            },
            {
              width: 250,
              colKey: "new_username",
              title: lang.host_transfer_text8,
              ellipsis: true,
            },
            {
              width: 180,
              cell: "create_time",
              title: lang.host_transfer_text9,
              ellipsis: true,
            },
            {
              Width: 100,
              cell: "user_name",
              title: lang.host_transfer_text10,
              ellipsis: true,
            },
          ],
          loading: false,
        };
      },
      created() {
        this.getList();
      },
      mounted() {},
      methods: {
        goclient_detail(id) {
          location.href = str + `client_detail.htm?client_id=${id}`;
        },
        goOrder(row) {
          window.open(
            str +
              `host_detail.htm?client_id=${row.new_client_id}&id=${row.host_id}`
          );
        },
        seacrh() {
          this.params.page = 1;
          this.getList();
        },
        // 获取列表
        getList() {
          this.loading = true;
          hostTransferList(this.params).then((res) => {
            this.loading = false;
            this.tableList = res.data.data.list;
            this.total = res.data.data.count;
          });
        },
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.getList();
        },
        onChange(value, context) {
          const arr = context.dayjsValue.map((d) => d.valueOf());
          if (arr.length != 0) {
            this.params.start_time = arr[0] / 1000;
            this.params.end_time = arr[1] / 1000 + 86399;
          } else {
            this.params.start_time = "";
            this.params.end_time = "";
          }
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

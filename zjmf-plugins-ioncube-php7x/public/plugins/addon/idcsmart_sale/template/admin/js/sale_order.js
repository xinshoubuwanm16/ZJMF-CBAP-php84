(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("admin")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        comConfig,
      },
      data() {
        return {
          data: [],
          tableLayout: false,
          bordered: true,
          visible: false,
          delVisible: false,
          hover: true,
          isSaleFlag: false, // 是否是销售
          sale_list: [],
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          currency_suffix:
            JSON.parse(localStorage.getItem("common_set")).currency_suffix ||
            "元",
          columns: [
            {
              colKey: "order_id",
              title: lang.sale_text21,
              width: 90,
            },
            {
              colKey: "username",
              title: lang.sale_text22,
              cell: "username",
              ellipsis: true,
            },
            {
              colKey: "amount",
              title: lang.sale_text24,
              cell: "amount",
            },
            {
              colKey: "commission_price",
              title: lang.sale_text25,
              cell: "commission_price",
            },
            {
              colKey: "create_time",
              title: lang.sale_text27,
              width: 200,
              cell: "create_time",
            },
            {
              colKey: "statusText",
              title: lang.sale_text28,
              width: 120,
              cell: "statustext",
            },
          ],
          params: {
            keywords: "",
            page: 1,
            limit: 20,
            sale_id: [],
          },
          total: 0,
          pageSizeOptions: [20, 50, 100],
          loading: false,
          delId: "",
          maxHeight: "",
        };
      },
      mounted() {
        this.maxHeight = document.getElementById("content").clientHeight - 220;
        let timer = null;
        window.onresize = () => {
          if (timer) {
            return;
          }
          timer = setTimeout(() => {
            this.maxHeight =
              document.getElementById("content").clientHeight - 220;
            clearTimeout(timer);
            timer = null;
          }, 300);
        };
      },
      methods: {
        // 获取列表
        async getSaleOderList() {
          try {
            this.loading = true;
            const res = await saleOrder(this.params);
            this.loading = false;
            res.data.data.list.forEach((item) => {
              switch (item.status) {
                case "wait":
                  item.statusText = lang.sale_text29;
                  item.stattusClass = "wait-text";
                  break;
                case "confirm":
                  item.statusText = lang.sale_text30;
                  item.stattusClass = "confirm-text";
                  break;
                case "cancel":
                  item.statusText = lang.sale_text31;
                  item.stattusClass = "cancel-text";
                  break;
                case "change_sale":
                  item.statusText = lang.sale_text32;
                  item.stattusClass = "change_sale-text";
                  break;
                default:
                  item.statusText = "--";
                  item.stattusClass = "default-text";
                  break;
              }
            });
            this.data = res.data.data.list;
            this.total = res.data.data.count;
          } catch (error) {
            this.loading = false;
          }
        },
        jumpHandle(row) {
          const fir = location.pathname.split("/")[1];
          location.href = `/${fir}/client_detail.htm?id=${row.client_id}`;
        },
        // 获取销售列表
        async getSaleList() {
          const res = await allSale(this.params);
          this.sale_list = res.data.data.list;
        },
        formatDateAdd0(m) {
          return m < 10 ? "0" + m : m;
        },
        // 时间格式转换
        formatDate(dateStr) {
          if (dateStr === 0 || !dateStr) {
            return "--";
          } else {
            const date = new Date(dateStr * 1000);
            const str1 = [
              date.getFullYear(),
              date.getMonth() + 1,
              date.getDate(),
            ].join("-");
            const str2 = [
              this.formatDateAdd0(date.getHours()),
              this.formatDateAdd0(date.getMinutes()),
            ].join(":");
            return str1 + " " + str2;
          }
        },
        // 作废弹窗
        toVoid(row) {
          this.delId = row.id;
          this.delVisible = true;
        },
        async sureDel() {
          await deleteSaleOrder(this.delId)
            .then((res) => {
              this.$message.success(res.data.msg);
            })
            .catch((err) => {
              this.$message.error(err.data.msg);
            });
          this.getSaleOderList();
          this.delVisible = false;
        },
        // 切换分页
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.getSaleOderList();
        },
        clearKey() {
          this.params.keywords = "";
          this.seacrh();
        },
        seacrh() {
          this.params.page = 1;
          this.getSaleOderList();
        },
        // 是否是销售
        getIsSale() {
          isSale().then((res) => {
            if (res.data.data.sale_id === 0) {
              // 不是销售
              this.isSaleFlag = true;
              this.columns.splice(4, 0, {
                colKey: "name",
                title: lang.sale_text26,
              });
              this.columns.push({
                colKey: "op",
                title: lang.operation,
                width: 90,
              });
            } else {
              // 是销售
              this.isSaleFlag = false;
            }
          });
        },
      },
      created() {
        this.getSaleOderList();
        this.getSaleList();
        this.getIsSale();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

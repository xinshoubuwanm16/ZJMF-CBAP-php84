(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const help = document.getElementsByClassName("cashback")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    const host = location.origin;
    const fir = location.pathname.split("/")[1];
    const str = `${host}/${fir}/`;
    new Vue({
      components: {
        comConfig,
        comTreeSelect
      },
      data() {
        return {
          baseUrl: str,
          params: {
            page: 1,
            limit: 20,
          },
          proParams: {
            page: 1,
            limit: 99999,
            keywords: "",
          },
          proList: [],
          pageSizeOptions: [20, 50, 100],
          total: 0,
          loading: false,
          searchLoading: false,
          list: [],
          columns: [
            {
              width: 400,
              colKey: "product_name",
              title: lang.product_name,
              ellipsis: true,
            },
            {
              width: 200,
              colKey: "type",
              cell: "type",
              title: lang.cashback_type,
            },
            {
              width: 300,
              colKey: "price",
              cell: "price",
              title: lang.cashback,
            },
            {
              width: 300,
              colKey: "period",
              cell: "period",
              title: lang.period,
            },
            {
              width: 150,
              colKey: "status",
              title: lang.status,
              cell: "status",
            },
            {
              colKey: "op",
              width: 100,
              title: lang.operation,
              cell: "op",
            },
          ],
          typeList: [{ value: "fixed", label: lang.fixed_money }],
          materialVisble: false,
          formData: {
            product_id: "",
            type: "fixed",
            price: null,
            period: null,
          },
          editId: null,
          rules: {
            product_id: [
              {
                required: true,
                message: `${lang.select}${lang.product}`,
                type: "error",
              },
            ],
            type: [
              {
                required: true,
                message: `${lang.select}${lang.cashback_type}`,
                type: "error",
              },
            ],
            price: [
              {
                required: true,
                message: `${lang.input}${lang.cashback_money}`,
                type: "error",
              },
            ],
            period: [
              {
                required: true,
                message: `${lang.input}${lang.period}`,
                type: "error",
              },
            ],
          },
          delVisible: false,
          delId: null,
          popupProps: {
            overlayInnerStyle: (trigger) => ({
              width: `${trigger.offsetWidth}px`,
              "max-height": "362px",
            }),
          },
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix || "¥",
          submitLoading: false,
        };
      },
      filters: {
        filterMoney(money) {
          if (isNaN(money)) {
            return "0.00";
          } else {
            const temp = `${money}`.split(".");
            return parseInt(temp[0]).toLocaleString() + "." + (temp[1] || "00");
          }
        },
      },
      created() {
        this.getlist();
      },
      mounted() {},
      computed: {
        calcType() {
          return (type) => {
            return this.typeList.filter((item) => item.value === type)[0]
              ?.label;
          };
        },
      },
      methods: {
        choosePro(val) {
          this.formData.product_id = val;
        },
        onChange(row) {
          const params = { id: row.id, status: row.status };
          editCashbackStatus(params).then((res) => {
            this.$message.success(res.data.msg);
            this.getlist();
          });
        },
        handADDmaterial() {
          this.materialVisble = true;
          this.formData.product_id = "";
          this.formData.type = "fixed";
          this.formData.price = null;
          this.formData.period = null;
        },
        getlist() {
          this.loading = true;
          productCashbackList(this.params)
            .then((res) => {
              this.list = res.data.data.list;
              this.total = res.data.data.count;
              this.loading = false;
            })
            .catch((err) => {
              this.loading = false;
              this.$message.error(err.data.msg);
            });
        },
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.getlist();
        },
        sureDelUser() {
          this.submitLoading = true
          delCashback(this.delId)
            .then((res) => {
              this.$message.success(res.data.msg);
              this.getlist();
              this.delId = null;
              this.delVisible = false;
            })
            .catch((err) => {
              this.$message.error(err.data.msg);
            }).finally(() => {
              this.submitLoading = false;
            });
        },
        edit(row) {
          this.editId = row.id;
          this.formData.product_id = row.product_id;
          this.formData.type = row.type;
          this.formData.price = row.price * 1;
          this.formData.period = row.period;
          this.materialVisble = true;
        },
        deletes(id) {
          this.delId = id;
          this.delVisible = true;
        },
        materialDiaClose() {
          this.editId = null;
          this.proParams.keywords = "";
          this.$refs.userDialog && this.$refs.userDialog.reset();
          this.materialVisble = false;
        },
        onSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            this.submitLoading = true;
            if (this.editId !== null) {
              editCashback({ id: this.editId, ...this.formData })
                .then((res) => {
                  this.$message.success(res.data.msg);
                  this.materialVisble = false;
                  this.getlist();
                })
                .catch((err) => {
                  this.$message.error(err.data.msg);
                })
                .finally(() => {
                  this.submitLoading = false;
                });
            } else {
              addCashback(this.formData)
                .then((res) => {
                  this.$message.success(res.data.msg);
                  this.materialVisble = false;
                  this.getlist();
                })
                .catch((err) => {
                  this.$message.error(err.data.msg);
                })
                .finally(() => {
                  this.submitLoading = false;
                });
            }
          }
        },
      },
    }).$mount(help);
    typeof old_onload == "function" && old_onload();
  };
})(window);

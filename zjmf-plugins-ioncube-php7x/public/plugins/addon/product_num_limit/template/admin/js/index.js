(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const help = document.getElementsByClassName("stock")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        comConfig,
        comTreeSelect
      },
      data() {
        return {
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
              width: 500,
              colKey: "product_name",
              title: lang.single_product_text14,
              ellipsis: true,
            },
            {
              width: 300,
              colKey: "num",
              cell: "num",
              title: lang.single_product_text23,
            },
            {
              width: 300,
              colKey: "status",
              title: lang.single_product_text15,
              cell: "status",
            },
            {
              colKey: "op",
              width: 100,
              title: lang.single_product_text32,
              cell: "op",
            },
          ],
          materialVisble: false,
          formData: {
            product_id: "",
            num: null,
          },
          editId: null,
          rules: {
            product_id: [
              { required: true, message: lang.single_product_text33, type: "error" },
            ],
            num: [{ required: true, message: lang.single_product_text33, type: "error" }],
          },
          delVisible: false,
          delId: null,
          popupProps: {
            overlayInnerStyle: (trigger) => ({
              width: `${trigger.offsetWidth}px`,
              "max-height": "362px",
            }),
          },
          submitLoading: false,
        };
      },
      created() {
        this.getlist();
      },
      mounted() {},
      methods: {
        choosePro (val) {
          this.formData.product_id = val
        },
        onChange(row) {
          const params = { id: row.id, status: row.status };
          editProductNnumStatus(params).then((res) => {
            this.$message.success(res.data.msg);
            this.getlist();
          });
        },
        handADDmaterial() {
          this.materialVisble = true;
          this.formData.product_id = "";
          this.formData.num = null;
        },
        getlist() {
          this.loading = true;
          productNnumList(this.params)
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
          this.submitLoading = true;
          delProductNnum(this.delId)
            .then((res) => {
              this.$message.success(res.data.msg);
              this.getlist();
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
        edit(row) {
          this.editId = row.id;
          this.formData.product_id = row.product_id;
          this.formData.num = row.num * 1;
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
              editProductNnum({ id: this.editId, ...this.formData })
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
              addProductNnum(this.formData)
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

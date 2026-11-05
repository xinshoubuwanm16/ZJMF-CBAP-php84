(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const help = document.getElementsByClassName("stock")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        comConfig,
        comTreeSelect,
      },
      data() {
        return {
          params: {
            page: 1,
            limit: 20,
          },
          proParams: {
            page: 1,
            limit: 20,
          },
          proList: [],
          pageSizeOptions: [20, 50, 100],
          total: 0,
          loading: false,
          searchLoading: false,
          allProducts: [],
          list: [],
          columns: [
            {
              width: 300,
              colKey: "product_name",
              title: lang.single_product_text4,
              ellipsis: true,
            },
            {
              minwidth: 300,
              colKey: "related_product_name",
              cell: "related_product_name",
              title: lang.single_product_text5,
              ellipsis: true,
            },
            {
              width: 120,
              colKey: "type",
              title: lang.single_product_text6,
              cell: "type",
              ellipsis: true,
            },
            {
              width: 120,
              colKey: "status",
              title: lang.single_product_text7,
              cell: "status",
            },
            {
              colKey: "op",
              width: 100,
              title: lang.single_product_text8,
              cell: "op",
            },
          ],
          typeObj: {
            0: lang.single_product_text9,
            1: lang.single_product_text10,
            2: lang.single_product_text11,
          },
          materialVisble: false,
          formData: {
            product_id: "",
            related_product_id: [],
            type: 0,
          },
          editId: null,
          rules: {
            product_id: [
              {
                required: true,
                message: lang.single_product_text12,
                type: "error",
              },
            ],
            related_product_id: [
              {
                required: true,
                message: lang.single_product_text12,
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
          submitLoading: false,
        };
      },
      computed: {},
      created() {
        this.getlist();
        this.getProductList();
      },
      methods: {
        choosePro(val) {
          this.formData.product_id = val;
        },
        choosePro2(val) {
          this.formData.related_product_id = val;
        },
        onChange(row) {
          const params = { id: row.id, status: row.status };
          editProductNnumStatus(params).then((res) => {
            this.$message.success(res.data.msg);
            this.getlist();
          });
        },
        handADDmaterial() {
          this.formData.product_id = "";
          this.formData.related_product_id = [];
          this.formData.type = 0;
          this.materialVisble = true;
        },
        calcProductName(item = []) {
          return item.join("、");
        },
        getProductList() {
          getCloudProduct().then((res) => {
            // 递归设置 item.children 为  item.child
            const setChildren = (item) => {
              if (item.child && item.child.length > 0) {
                item.children = item.child;
                item.children.forEach((child) => {
                  child.key = "t-" + child.id;
                  setChildren(child);
                });
              } else {
              }
            };
            this.allProducts = res.data.data.list.map((item) => {
              item.key = "t-" + item.id;
              setChildren(item);
              return item;
            });
          });
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
          this.formData.related_product_id = row.related_product_id;
          this.formData.type = row.type;
          this.materialVisble = true;
        },
        deletes(id) {
          this.delId = id;
          this.delVisible = true;
        },
        materialDiaClose() {
          this.editId = null;
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

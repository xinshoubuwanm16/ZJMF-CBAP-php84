(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const help = document.getElementsByClassName("stock")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        comConfig,
      },
      data() {
        return {
          params: {
            page: 1,
            limit: 20,
          },
          pageSizeOptions: [20, 50, 100],
          total: 0,
          loading: false,
          list: [],
          columns: [
            {
              colKey: "drag", // 列拖拽排序必要参数
              title: lang.client_custom_label36,
              cell: "drag",
              width: 90,
            },
            {
              minWidth: 300,
              colKey: "name",
              title: lang.client_custom_label9,
              ellipsis: true,
            },
            {
              width: 120,
              colKey: "type",
              cell: "type",
              title: lang.client_custom_label10,
            },
            {
              minWidth: 200,
              colKey: "description",
              cell: "description",
              title: lang.client_custom_label33,
            },
            {
              minWidth: 350,
              colKey: "watch",
              title: lang.client_custom_label34,
              cell: "watch",
              ellipsis: true,
            },
            {
              width: 100,
              colKey: "before_settle",
              title: lang.client_custom_label37,
              cell: "before_settle",
            },
            {
              width: 100,
              colKey: "status",
              title: lang.client_custom_label16,
              cell: "status",
            },
            {
              colKey: "op",
              width: 90,
              title: lang.client_custom_label20,
              cell: "op",
            },
          ],
          typeList: [
            {
              value: "text",
              label: lang.client_custom_label27,
            },
            {
              value: "dropdown",
              label: lang.client_custom_label4,
            },
            {
              value: "link",
              label: lang.client_custom_label23,
            },
            {
              value: "password",
              label: lang.client_custom_label24,
            },
            {
              value: "tickbox",
              label: lang.client_custom_label25,
            },
            {
              value: "textarea",
              label: lang.client_custom_label26,
            },
            {
              value: "dropdown_text",
              label: lang.client_custom_label35,
            },
          ],
          pagination: {
            current: 1,
            pageSize: 10,
            total: 0,
            showJumper: true,
          },
          materialVisble: false,
          formData: {
            options: "",
            type: "",
            name: "",
            description: "",
            regexpr: "",
            admin_only: true,
            required: false,
            before_settle: false,
            show_register: true,
          },
          editId: null,
          rules: {
            name: [
              {
                required: true,
                message: lang.client_custom_label19,
                type: "error",
              },
            ],
            type: [
              {
                required: true,
                message: lang.client_custom_label19,
                type: "error",
              },
            ],
            options: [
              {
                required: true,
                message: lang.client_custom_label19,
                type: "error",
              },
            ],
          },
          pageView: {
            admin_only: lang.client_custom_label21,
            show_register: lang.client_custom_label22,
          },
          delVisible: false,
          delId: null,
          submitLoading: false,
        };
      },
      created() {
        this.getlist();
      },
      computed: {},
      mounted() {},
      methods: {
        calcWatch(row) {
          let str = "";
          // 遍历arr
          for (let key in this.pageView) {
            if (row[key] === 1) {
              str += this.pageView[key] + " / ";
            }
          }
          str = str.slice(0, -2);
          return str;
        },
        calcTypeText(row) {
          return this.typeList.filter((item) => row.type === item.value)[0]
            .label;
        },
        onChange(row) {
          const params = { id: row.id, status: row.status };
          editclientStatus(params).then((res) => {
            this.$message.success(res.data.msg);
            this.getlist();
          });
        },
        // 搜索框 搜索
        seacrh() {
          this.params.page = 1;
          // 重新拉取申请列表
          this.getlist();
        },
        // 清空搜索框
        clearKey() {
          this.params.keywords = "";
          this.params.page = 1;
          // 重新拉取申请列表
          this.getlist();
        },
        handADDmaterial() {
          this.editId = null;
          this.formData.name = "";
          this.formData.type = "";
          this.formData.description = "";
          this.formData.regexpr = "";
          this.formData.options = "";
          this.formData.admin_only = true;
          this.formData.required = false;
          this.formData.before_settle = false;
          this.formData.show_register = true;
          this.materialVisble = true;
        },
        onEnter() {},
        getlist() {
          this.loading = true;
          clientCustomList(this.params)
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
        // 分页变化时触发该事件
        onPageChange(pageInfo, newData) {
          // 受控用法所需
          this.pagination.current = pageInfo.current;
          this.pagination.pageSize = pageInfo.pageSize;
        },
        sureDelUser() {
          this.submitLoading = true;
          delclientCustom(this.delId)
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
          this.formData.name = row.name;
          this.formData.type = row.type;
          this.formData.description = row.description;
          this.formData.regexpr = row.regexpr;
          this.formData.options = row.options;
          this.formData.admin_only = row.admin_only === 1;
          this.formData.required = row.required === 1;
          this.formData.before_settle = row.before_settle === 1;
          this.formData.show_register = row.show_register === 1;
          this.materialVisble = true;
        },
        deletes(id) {
          this.delId = id;
          this.delVisible = true;
        },
        opTypeDia() {
          this.getTypeList();
          this.typeVisible = true;
        },
        materialDiaClose() {
          this.editId = null;
          this.$refs.userDialog.reset();
          this.formData.options = "";
          this.materialVisble = false;
        },
        onDragSort({ targetIndex, newData }) {
          this.data = newData;
          dragSelfDefinedField({
            id: newData[targetIndex].id,
            prev_id: targetIndex === 0 ? 0 : newData[targetIndex - 1].id,
          }).then((res) => {
            this.$message.success(res.data.msg);
          });
        },

        onSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            this.submitLoading = true;
            const params = { ...this.formData };
            params.admin_only = params.admin_only ? 1 : 0;
            params.show_register = params.show_register ? 1 : 0;
            if (this.editId !== null) {
              editclientCustom({ id: this.editId, ...params })
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
              addclientCustom(params)
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

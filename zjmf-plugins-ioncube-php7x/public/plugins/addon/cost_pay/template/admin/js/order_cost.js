(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("order-details")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.module_lang);
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
          baseUrl: str,
          rootRul: url,
          id: "",
          loading: false,
          delVisible: false,
          delId: null,
          delFieldId: null,
          editId: null,
          currency_prefix: "",
          submitLoading: false,
          delLoading: false,
          materialVisble: false,
          fieldManagementVisible: false,
          list: [],
          fieldLoading: false,
          costFieldList: [],
          formData: {
            name: "",
            owner: "",
            cost: "",
            cost_time: "",
            notes: "",
            self_defined_field: {},
          },
          editFieldId: null,
          rules: {
            name: [
              { required: true, message: lang.cost_text2 + lang.cost_text21 },
            ],
            owner: [
              { required: true, message: lang.cost_text3 + lang.cost_text21 },
            ],
            cost: [
              { required: true, message: lang.cost_text4 + lang.cost_text21 },
            ],
            cost_time: [
              { required: true, message: lang.cost_text1 + lang.cost_text21 },
            ],
            description: [{ required: false }],
          },
          columns: [],
          initColumns: [
            {
              width: 150,
              colKey: "name",
              cell: "name",
              title: lang.cost_text2,
              ellipsis: true,
              fixed: "left",
            },
            {
              width: 150,
              colKey: "cost_time",
              cell: "cost_time",
              title: lang.cost_text1,
              ellipsis: true,
            },

            {
              width: 150,
              colKey: "owner",
              cell: "owner",
              title: lang.cost_text3,
              ellipsis: true,
            },
            {
              width: 100,
              colKey: "cost",
              cell: "cost",
              title: lang.cost_text4,
              ellipsis: true,
            },
            {
              width: 280,
              colKey: "create_time",
              cell: "create_time",
              title: `${lang.cost_text6}(${lang.cost_text16})`,
              ellipsis: true,
            },
            {
              width: 150,
              colKey: "notes",
              cell: "notes",
              title: lang.cost_text7,
              ellipsis: true,
            },
            {
              colKey: "op",
              width: 90,
              title: lang.cost_text8,
              cell: "op",
              fixed: "right",
            },
          ],
          fieldColumns: [
            {
              colKey: "drag", // 列拖拽排序必要参数
              title: lang.sort,
              cell: "drag",
              width: 90,
            },
            {
              minWidth: 150,
              colKey: "field_name",
              cell: "field_name",
              title: lang.cost_text22,
              ellipsis: true,
            },
            {
              width: 100,
              colKey: "field_type",
              cell: "field_type",
              title: lang.cost_text24,
              ellipsis: true,
            },
            {
              width: 100,
              colKey: "show_list",
              cell: "show_list",
              title: lang.cost_text31,
              ellipsis: true,
            },
            {
              colKey: "op",
              width: 90,
              title: lang.cost_text8,
              cell: "op",
            },
          ],
          total: 0,
          params: {
            page: 1,
            limit: 10,
            keywords: "",
            owner: "",
            start_cost_time: "",
            end_cost_time: "",
            start_create_time: "",
            end_create_time: "",
          },
          ownerList: [],
          costTime: [],
          fieldFormData: {
            field_name: "",
            field_type: "",
            is_required: false,
            field_option: "",
          },
          presets: {
            [lang.cost_text12]: [new Date(), new Date()],
            [lang.cost_text10]: [
              new Date(+new Date() - 86400000 * 6),
              new Date(),
            ],
            [lang.cost_text11]: [
              new Date(+new Date() - 86400000 * 2),
              new Date(),
            ],
            [lang.cost_text15]: [
              new Date(+new Date() - 86400000 * 30),
              new Date(),
            ],
          },

          creatTime: [],
          pageSizeOptions: [10, 20, 50, 100],
          orderDetail: {}
        };
      },
      created() {
        this.id = location.href.split("?")[1].split("=")[1];
        this.currency_prefix =
          JSON.parse(localStorage.getItem("common_set")).currency_prefix || "¥";
        document.title =
          lang.piece_cost + "-" + localStorage.getItem("back_website_name");
        this.getCostCustomFieldList();
        this.getlist();
        this.getOrderDetail();
      },
      mounted() {},
      watch: {
        costTime() {
          if (this.costTime.length > 0) {
            this.params.start_cost_time = this.costTime[0] / 1000;
            this.params.end_cost_time = this.costTime[1] / 1000;
          } else {
            this.params.start_cost_time = "";
            this.params.end_cost_time = "";
          }
        },
        creatTime() {
          if (this.creatTime.length > 0) {
            this.params.start_create_time = this.creatTime[0] / 1000;
            this.params.end_create_time = this.creatTime[1] / 1000;
          } else {
            this.params.start_create_time = "";
            this.params.end_create_time = "";
          }
        },
      },
      methods: {
        async getOrderDetail() {
          try {
            const res = await getOrderDetails({ id: this.id });
            this.orderDetail = res.data.data.order;
          } catch (error) {}
        },
        getCostCustomFieldList() {
          costCustomFieldList().then((res) => {
            this.costFieldList = res.data.data.list.map((item) => {
              item.options = item.field_option.split(",").map((item) => {
                return {
                  value: item,
                  label: item,
                };
              });
              this.$set(this.formData.self_defined_field, item.id, "");
              item.loading = false;
              return item;
            });
          });
        },
        handeladd() {
          this.materialVisble = true;
          this.formData = {
            name: "",
            owner: "",
            cost: "",
            cost_time: "",
            notes: "",
            self_defined_field: {},
          };
          this.costFieldList.forEach((item) => {
            this.$set(this.formData.self_defined_field, item.id, "");
          });
          setTimeout(() => {
            this.$refs.formRef.clearValidate();
          }, 0);
        },
        initForm() {},
        closeDialog() {
          this.formData = {
            name: "",
            owner: "",
            cost: "",
            cost_time: "",
            notes: "",
            self_defined_field: {},
          };
          this.materialVisble = false;
          setTimeout(() => {
            this.$refs.formRef.clearValidate();
          }, 0);
        },
        handelDel(row) {
          setTimeout(() => {
            this.$refs.formRef.clearValidate();
          }, 0);
          this.delId = row.id;
        },
        thousandth(num) {
          if (!num) {
            num = 0.0;
          }
          let str = num.toString(); // 数字转字符串
          let str2 = "00";
          // 如果带小数点
          if (str.indexOf(".") !== -1) {
            // 带小数点只需要处理小数点左边的
            const strArr = str.split("."); // 根据小数点切割字符串
            str = strArr[0]; // 小数点左边
            str2 = strArr[1]; // 小数点右边
            //如12345.678  str=12345，str2=678
          }
          let result = ""; // 结果
          while (str.length > 3) {
            // while循环 字符串长度大于3就得添加千分位
            // 切割法 ，从后往前切割字符串 ⬇️
            result = "," + str.slice(str.length - 3, str.length) + result;
            // 切割str最后三位，用逗号拼接 比如12345 切割为 ,345
            // 用result接收，并拼接上一次循环得到的result
            str = str.slice(0, str.length - 3); // str字符串剥离上面切割的后三位，比如 12345 剥离成 12
          }

          if (str.length <= 3 && str.length > 0) {
            // 长度小于等于3 且长度大于0，直接拼接到result
            // 为什么可以等于3 因为上面result 拼接时候在前面带上了‘,’
            // 相当于123456 上一步处理完之后 result=',456' str='123'
            result = str + result;
          }
          // 最后判断是否带小数点（str2是小数点右边的数字）
          // 如果带了小数点就拼接小数点右边的str2 ⬇️
          result = result + "." + str2;
          return result;
        },
        materialDiaClose() {},
        goOrder() {
          sessionStorage.removeItem("orderListParams");
          sessionStorage.removeItem("currentOrderUrl");
          location.href = "order.htm";
        },
        goBack() {
          const url = sessionStorage.currentOrderUrl || "";
          sessionStorage.removeItem("currentOrderUrl");
          if (url) {
            location.href = url;
          } else {
            window.history.back();
          }
        },
        openFieldManagement() {
          this.editFieldId = null;
          this.fieldManagementVisible = true;
          this.$refs.fieldManagement.clearValidate();
          this.$refs.fieldManagement.reset();
        },
        getlist() {
          this.loading = true;
          costList({ id: this.id, ...this.params })
            .then((res) => {
              const pushArr = [];
              this.list = res.data.data.list.map((item) => {
                res.data.data.self_defined_field.forEach((key) => {
                  // 判断columns是否加入过了
                  if (!pushArr.some((item) => item.colKey === key.id)) {
                    pushArr.push({
                      width: 120,
                      colKey: key.id,
                      cell: key.id,
                      title: key.field_name,
                      ellipsis: true,
                    });
                  }
                  item[key.id] = item.self_defined_field[key.id] || "--";
                });
                return item;
              });
              const initArr = [...this.initColumns];
              initArr.splice(4, 0, ...pushArr);
              this.columns = initArr;
              this.ownerList = res.data.data.owner.map((item) => {
                return {
                  value: item,
                  label: item,
                };
              });
              this.total = res.data.data.count;
              this.loading = false;
            })
            .catch((err) => {
              console.log(err);
              this.loading = false;
              this.$message.error(err.data.msg);
            });
        },
        deletes(id) {
          this.delFieldId = null;
          this.delId = id;
          this.delVisible = true;
        },
        deleteField(id) {
          this.delFieldId = id;
          this.delId = null;
          this.delVisible = true;
          this.editFieldId = null;
          this.$refs.fieldManagement.clearValidate();
          this.$refs.fieldManagement.reset();
        },
        editField(row) {
          this.editFieldId = row.id;
          this.fieldFormData.field_name = row.field_name;
          this.fieldFormData.is_required = row.is_required === 1;
          this.fieldFormData.field_type = row.field_type;
          this.fieldFormData.field_option = row.field_option;
        },
        edit(row) {
          this.editId = row.id;
          costDetail(row.id).then((res) => {
            this.formData = res.data.data;
            this.formData.cost_time = res.data.data.cost_time * 1000;
            this.formData.cost = res.data.data.cost * 1;
          });
          this.materialVisble = true;
          setTimeout(() => {
            this.$refs.formRef.clearValidate();
          }, 0);
        },
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.getlist();
        },
        onDragSort({ current, targetIndex, newData }) {
          this.costFieldList = newData;
          costDrag({
            id: current.id,
            prev_id: targetIndex === 0 ? 0 : newData[targetIndex - 1].id,
          }).then((res) => {
            this.$message.success(res.data.msg);
            this.getCostCustomFieldList();
            this.getlist();
          });
        },
        searchData() {
          this.params.page = 1;
          this.getlist();
        },
        onSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            this.submitLoading = true;
            const params = { id: this.editId || this.id, ...this.formData };
            params.cost_time = params.cost_time / 1000;
            const subApi = this.editId ? updateCost : addCost;
            subApi(params)
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
        },
        showList(row) {
          row.loading = true;
          changeCostCustomFieldShow({
            id: row.id,
            show_list: row.show_list,
          }).then((res) => {
            this.$message.success(res.data.msg);
            row.loading = false;
            this.getCostCustomFieldList();
            this.getlist();
          });
        },
        onFieldSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            this.submitLoading = true;
            const params = { id: this.editFieldId, ...this.fieldFormData };
            const subApi = this.editFieldId
              ? updateCostCustomField
              : addCostCustomField;
            subApi(params)
              .then((res) => {
                this.$message.success(res.data.msg);
                this.editFieldId = null;
                this.$refs.fieldManagement.clearValidate();
                this.$refs.fieldManagement.reset();
                this.getCostCustomFieldList();
                this.getlist();
              })
              .catch((err) => {
                this.$message.error(err.data.msg);
              })
              .finally(() => {
                this.submitLoading = false;
              });
          }
        },

        sureDelUser() {
          this.delLoading = true;
          const id = this.delFieldId || this.delId;
          const delApi = this.delFieldId ? deleteCostCustomField : deleteCost;
          delApi(id)
            .then((res) => {
              this.$message.success(res.data.msg);
              this.getCostCustomFieldList();
              this.getlist();
              this.delId = null;
              this.delFieldId = null;
              this.delVisible = false;
            })
            .catch((err) => {
              this.$message.error(err.data.msg);
            })
            .finally(() => {
              this.delLoading = false;
            });
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

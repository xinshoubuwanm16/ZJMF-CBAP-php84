(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("invoice-config")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = moment;
    new Vue({
      data() {
        return {
          maxHeight: 0,
          configData: {
            invoice_manage: "0",
            pre_invoice: "0",
            across_year_invoice: "0",
          },
          customValue: ["1", "0"],
          columns: [
            {
              colKey: "id",
              title: "ID",
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "name",
              title: lang.invoice_label27,
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "price",
              title: lang.invoice_label28,
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "operation",
              title: lang.invoice_tab10,
              width: 100,
            },
          ],
          index: 1,
          saveLoading: false,
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          /* 项目 */
          projectLoading: false,
          projectData: [],
          projectColumns: [
            {
              colKey: "name",
              title: lang.invoice_btn9,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "normal_tax_rate",
              title: `${lang.invoice_btn15}(%)`,
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "normal_tax_price",
              title: `${lang.invoice_btn16}(%)`,
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "special_tax_rate",
              title: `${lang.invoice_btn17}(%)`,
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "special_tax_price",
              title: `${lang.invoice_btn18}(%)`,
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "operation",
              title: lang.invoice_tab10,
              width: 100,
            },
          ],
          projectDialog: false,
          projectForm: {
            name: "",
            normal_tax_rate: undefined,
            normal_tax_price: undefined,
            special_tax_switch: 0,
            special_tax_rate: undefined,
            special_tax_price: undefined,
          },
          rules: {
            name: [
              {
                required: true,
                message: `${lang.input}${lang.invoice_btn9}`,
                type: "error",
                trigger: "blur",
              },
            ],
            normal_tax_rate: [
              {
                required: true,
                message: `${lang.input}${lang.invoice_text18}`,
                type: "error",
                trigger: "blur",
              },
            ],
            normal_tax_price: [
              {
                required: true,
                message: `${lang.input}${lang.invoice_label29}`,
                type: "error",
                trigger: "blur",
              },
            ],
            special_tax_rate: [
              {
                required: true,
                message: `${lang.input}${lang.invoice_text18}`,
                type: "error",
                trigger: "blur",
              },
            ],
            special_tax_price: [
              {
                required: true,
                message: `${lang.input}${lang.invoice_label29}`,
                type: "error",
                trigger: "blur",
              },
            ],
          },
          optType: "",
          submitLoading: false,
          delVisible: false,
          curId: "",
        };
      },
      components: {
        comConfig
      },
      methods: {
        /* 发票项目 */
        addProject() {
          this.optType = "add";
          this.projectForm = {
            name: "",
            normal_tax_rate: undefined,
            normal_tax_price: undefined,
            special_tax_switch: 0,
            special_tax_rate: undefined,
            special_tax_price: undefined,
          };
          this.projectDialog = true;
        },
        editPorject(row) {
          this.optType = "update";
          let temp = JSON.parse(JSON.stringify(row));
          temp.normal_tax_rate = Number(temp.normal_tax_rate);
          temp.normal_tax_price = Number(temp.normal_tax_price);
          temp.special_tax_rate = Number(temp.special_tax_rate);
          temp.special_tax_price = Number(temp.special_tax_price);
          this.projectForm = temp;
          this.projectDialog = true;
        },
        delProject(row) {
          this.curId = row.id;
          this.delVisible = true;
        },
        async sureDel() {
          try {
            this.submitLoading = true;
            const res = await delProject({ id: this.curId });
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.success(res.data.msg);
            this.getProjectList();
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        async projectSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              const params = JSON.parse(JSON.stringify(this.projectForm));
              if (this.optType === "add") {
                delete params.id;
              }
              this.submitLoading = true;
              const res = await addAndEditProject(this.optType, params);
              this.submitLoading = false;
              this.projectDialog = false;
              this.$message.success(res.data.msg);
              this.getProjectList();
            } catch (error) {
              this.$message.error(error.data.msg);
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },
        async getProjectList() {
          try {
            this.projectLoading = true;
            const res = await getProject();
            this.projectData = res.data.data.list;
            this.projectLoading = false;
          } catch (error) {
            this.projectLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        /* 发票项目 end */

        getInvoiceConfig() {
          invoiceConfig().then((res) => {
            let data = {
              ...res.data,
            };

            data.parcel.map((item) => {
              item.index = this.index;
              this.index += 1;
              item.newName = item.name;
              item.newPrice = Number(item.price);
              item.isEdit = false;
            });

            this.configData = data;
          });
        },
        addParcel() {
          const item = {
            index: this.index,
            name: "",
            price: "0",
            newName: "",
            newPrice: 0.0,
            isEdit: true,
          };
          this.index += 1;
          this.configData.parcel.push(item);
        },
        // 单行保存
        save(row) {
          if (!row.newName) {
            this.$message.warning(lang.invoice_tips8);
            return;
          }
          if (!row.newPrice && row.newPrice != 0) {
            console.log(row.newPrice);
            this.$message.warning(lang.invoice_tips9);
            return;
          }
          const index = row.index;
          this.configData.parcel.map((item) => {
            if (item.index == index) {
              item.name = item.newName;
              item.price = item.newPrice.toFixed(2);
              item.isEdit = false;
            }
          });
        },
        edit(row) {
          const index = row.index;
          this.configData.parcel.map((item) => {
            if (item.index == index) {
              item.newName = item.name;
              item.newPrice = Number(item.price);
              item.isEdit = true;
            }
          });
        },
        // 删除行
        del(row) {
          const index = row.index;
          this.configData.parcel = this.configData.parcel.filter((item) => {
            return item.index != index;
          });
        },
        // 保存提交
        submit() {
          const params = this.configData;

          let isPass = true;
          let errText = "";
          params.parcel.map((item) => {
            if (!item.newName) {
              errText = lang.invoice_tips10;
              isPass = false;
            }
            if (!item.newPrice && item.newPrice != 0) {
              errText = lang.invoice_tips11;
              isPass = false;
            }
          });

          if (isPass) {
            params.parcel.map((item) => {
              if (item.isEdit) {
                item.name = item.newName;
                item.price = item.newPrice.toFixed(2);
              }
            });

            this.saveLoading = true;
            editInvoiceConfig(params)
              .then((res) => {
                if (res.data.status == 200) {
                  this.$message.success(res.data.msg);
                  this.getInvoiceConfig();
                }
                this.saveLoading = false;
              })
              .catch((error) => {
                this.$message.error(error.data.msg);
                this.saveLoading = false;
              });
          } else {
            this.$message.warning(errText);
          }
        },
      },
      created() {
        this.getInvoiceConfig();
        this.getProjectList();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

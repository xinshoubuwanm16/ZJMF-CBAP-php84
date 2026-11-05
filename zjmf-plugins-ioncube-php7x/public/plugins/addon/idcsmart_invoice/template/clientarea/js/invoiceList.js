(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("template")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        asideMenu,
        topMenu,
        pagination,
        payDialog,
      },
      async created() {
        this.getCommonData();
        this.getInvoicelTitleIist();
        this.getInvoicelAddress();
        // await this.getInvoicelTable();
      },
      mounted() {},
      updated() {
        // // 关闭loading
        // document.getElementById('mainLoading').style.display = 'none';
        // document.getElementsByClassName('template')[0].style.display = 'block'
      },
      destroyed() {},
      data() {
        return {
          params: {
            page: 1,
            limit: 20,
            pageSizes: [20, 50, 100],
            total: 200,
            orderby: "id",
            sort: "desc",
            keywords: "",
          },
          citys: citys,
          commonData: {},
          //   私有属性
          dialogVisible: false,
          invoiceSet: {},
          activeName: "invoiceList",
          stateList: [
            {
              classTypeName: "state-text-error",
              text: lang.invoice_text12,
              type: "reject",
            },
            {
              classTypeName: "state-text-success",
              text: lang.invoice_text121,
              type: "sent",
            },
            {
              classTypeName: "state-text-primary",
              text: lang.invoice_text122,
              type: "pending",
            },
            {
              classTypeName: "state-text-warning",
              text: lang.invoice_text123,
              type: "wait_send",
            },
            {
              classTypeName: "state-text-info",
              text: lang.invoice_text124,
              type: "unpaid",
            },
            {
              classTypeName: "flushed-text-info",
              text: lang.invoice_text146,
              type: "flushed",
            },
          ],
          //   发票列表数据
          tableList: [],
          detaliVisible: false, // 详情弹窗
          showImg: false, // 快递单号弹窗
          imgUrl: "",
          //发票详情
          backgroudImg:
            "/plugins/addon/idcsmart_invoice/template/clientarea/img/invoice/invoice_sy.png",
          invoiceDetails: {
            host: [],
          },

          //   发票抬头数据
          invoicelTitleIist: [],
          //   发票收件地址列表
          addressList: [],
          //   发票抬头弹窗
          invoiceTitleVisible: false,
          addInvoiceForm: {
            title_type: "company",
            title: "",
            invoice_type: "normal",
            company_address: "",
            tax: "",
            bank: "",
            bank_user: "",
          },
          isEditInvoiceTitle: false,

          //
          invoiceAddressVisible: false,

          addInvoiceAddressForm: {
            rec_type: "paper",
            rec_name: "",
            address: "",
            phone: "",
            is_default: false,
            cityArr: [],
            email: "",
            rec_url: "",
            notes: "",
          },
          validateEmail: (rule, value, callback) => {
            // const mailReg =
            //   /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            if (!value) {
              callback(new Error(lang.invoice_text125));
              return;
            }
            // if (!mailReg.test(value)) {
            //   callback(new Error(lang.invoice_text126));
            //   return;
            // }
            callback();
          },
          validateUrl(rule, value, callback) {
            if (!value) {
              callback();
            }
            let valid = true;
            try {
              new URL(value);
            } catch (error) {
              valid = false;
            }
            if (valid) {
              callback();
            } else {
              callback(new Error(lang.invoice_text127));
            }
          },
          isEditInvoiceAddress: false,
        };
      },
      filters: {
        formateTime(time) {
          if (time && time !== 0) {
            return formateDate(time * 1000);
          } else {
            return "--";
          }
        },
      },
      methods: {
        handleDown(id) {
          downloadInvoice(id)
            .then((res) => {
              window.open(res.data.data.url);
            })
            .catch((err) => {
              this.$message.error(err.data.msg);
            });
        },
        showImgBtn(url) {
          this.showImg = true;
          // const m = (e) => {
          //   e.preventDefault();
          // };
          // document.body.style.overflow = "hidden";
          this.imgUrl = url;
          // document.addEventListener("touchmove", m, false); // 禁止页面滑动
        },
        closeImgViewer() {
          this.showImg = false;
          const m = (e) => {
            e.preventDefault();
          };
          document.body.style.overflow = "auto";
          document.removeEventListener("touchmove", m, true);
        },
        // 每页展示数改变
        sizeChange(e) {
          this.params.limit = e;
          this.params.page = 1;
          // 获取列表
          this.getInvoicelTable();
        },
        // 当前页改变
        currentChange(e) {
          this.params.page = e;
          this.getInvoicelTable();
        },

        // 获取通用配置
        getCommonData() {
          this.commonData = JSON.parse(
            localStorage.getItem("common_set_before")
          );
          document.title =
            this.commonData.website_name + "-" + lang.invoice_text128;
        },
        // 自己得逻辑
        handleClick(tab, e) {
          //   console.log(tab, e, "--->");
        },
        // 发票列表
        async getInvoicelTable() {
          const res = await queryInvoicelIistAPI(this.params);
          //   console.log(res);
          if (res.status === 200) {
            const { data } = res.data;
            this.params.total = data.count;
            this.tableList = data.list.map((item) => {
              let obj = this.stateList.find(
                (stateItem) => item.status === stateItem.type
              );
              if (obj) {
                return { ...item, ...obj };
              } else {
                return {
                  ...item,
                  classTypeName: "state-text-cancel",
                  text: lang.invoice_text129,
                };
              }
            });
          }
        },
        // 显示快递单号图片
        // showImgBtn(url) {
        //   this.showImg = true;
        //   this.imgUrl = url;
        // },
        // 删除发票API
        async delInvoicel({ id }) {
          const res = await delInvoicelAPI({ id });
          if (res.status === 200) {
            await this.getInvoicelTable();
            this.$message({
              type: "success",
              message: lang.invoice_text130,
            });
          }
        },

        handleDelete(id) {
          this.$confirm(lang.invoice_text131, lang.invoice_text147, {
            confirmButtonText: lang.invoice_text148,
            cancelButtonText: lang.invoice_text149,
            type: "warning",
          })
            .then(async () => {
              await this.delInvoicel({ id });
            })
            .catch((err) => {
              console.warn(err);
            });
        },
        // 获取发票详情API
        async getInvoicelDetalis({ id }) {
          const res = await queryInvoicelDetailsAPI({ id });
          if (res.status === 200) {
            this.invoiceDetails = res.data.data;
            if (this.invoiceDetails.invoice_type === "normal") {
              this.backgroudImg =
                "/plugins/addon/idcsmart_invoice/template/clientarea/img/invoice/invoice_pt.png";
            }
          }
        },

        // 显示详情
        async handleDetail(id) {
          this.detaliVisible = true;
          await this.getInvoicelDetalis({ id });
        },
        // 获取发票设置
        async getInvoicelSet() {
          const res = await queryInvoicelSetAPI();
          if (res.status == 200) {
            const { data } = res;
            this.invoiceSet = data;
          }
        },
        openInvoiceBtn() {
          if (
            this.invoicelTitleIist.length === 0 ||
            this.addressList.length === 0
          ) {
            return this.$message.warning(lang.invoice_text132);
          }
          if (this.invoiceSet.invoice_manage == 0) {
            this.dialogVisible = true;
          } else {
            location.href = "issuedInvoice.htm";
          }
        },
        // 发票设置
        /**获取发票抬头 */
        async getInvoicelTitleIist() {
          const res = await queryInvoicelTitleIistAPI();
          if (res.status === 200) {
            const { data } = res.data;
            this.invoicelTitleIist = data.list;
          }
        },
        editInvoicelTitle(obj) {
          this.invoiceTitleVisible = true;
          let cloneObj = JSON.parse(JSON.stringify(obj));
          this.addInvoiceForm = cloneObj;
          this.isEditInvoiceTitle = true;
          console.log(this.addInvoiceForm);
        },
        // 切换发票类型时 去掉验证等待下次验证
        selectChange() {
          this.$refs.addInvoiceFormRef.clearValidate();
        },
        titleTypeChange(e) {
          if (e === "person") {
            this.addInvoiceForm.company_address = "";
            this.addInvoiceForm.tax = "";
            this.addInvoiceForm.bank = "";
            this.addInvoiceForm.bank_user = "";
          }
          this.addInvoiceForm.invoice_type = "";
        },
        handleSave() {
          this.$refs.addInvoiceFormRef.validate(async (valid) => {
            if (valid) {
              let API = this.isEditInvoiceTitle
                ? editInvoicelTitleIistAPI
                : addInvoicelTitleIistAPI;
              const res = await API(this.addInvoiceForm);
              if (res.status === 200) {
                let message = this.isEditInvoiceTitle
                  ? lang.invoice_text150
                  : lang.invoice_text133;
                await this.getInvoicelTitleIist();
                this.$message.success(message);
                this.invoiceTitleVisible = false;
              }
            } else {
              console.log("error submit!!");
              return false;
            }
          });
        },
        //删除发票抬头列表
        delInvoicelTitle(obj) {
          this.$confirm(lang.invoice_text131, lang.invoice_text147, {
            confirmButtonText: lang.invoice_text148,
            cancelButtonText: lang.invoice_text149,
            type: "warning",
          }).then(async () => {
            const res = await delInvoicelTitleIistAPI(obj.id);
            if (res.status === 200) {
              await this.getInvoicelTitleIist();
              this.$message.success(lang.invoice_text130);
            }
          });
        },
        // 获取发票收件地址列表
        async getInvoicelAddress() {
          const res = await queryInvoicelAddressAPI();
          if (res.status === 200) {
            const { data } = res.data;
            this.addressList = data.list;
          }
        },
        editInvoiceAddress(obj) {
          this.isEditInvoiceAddress = true;
          let cloneObj = JSON.parse(JSON.stringify(obj));
          this.addInvoiceAddressForm = cloneObj;
          if (this.addInvoiceAddressForm.is_default) {
            this.addInvoiceAddressForm.is_default = true;
          } else {
            this.addInvoiceAddressForm.is_default = false;
          }
          console.log(this.addInvoiceAddressForm, obj);
          this.addInvoiceAddressForm.cityArr = [
            cloneObj.province,
            cloneObj.city,
            cloneObj.region,
          ];
          this.invoiceAddressVisible = true;
        },
        delInvoiceAddress(obj) {
          this.$confirm(lang.invoice_text134, lang.invoice_text147, {
            confirmButtonText: lang.invoice_text148,
            cancelButtonText: lang.invoice_text149,
            type: "warning",
          }).then(async () => {
            const res = await delInvoicelAddressAPI(obj);
            if (res.status === 200) {
              await this.getInvoicelAddress();
              this.$message.success(lang.invoice_text130);
            }
          });
        },
        changeAddressType() {
          console.log(1111);
        },
        handleSaveAddress() {
          this.$refs.addInvoiceAddressFormRef.validate(async (valid) => {
            if (valid) {
              //   province = ""; //省
              //   city = ""; //市
              //   region = ""; //区
              [province, city, region] = this.addInvoiceAddressForm.cityArr;
              this.addInvoiceAddressForm = {
                ...this.addInvoiceAddressForm,
                ...{ province, city, region },
              };
              let newAddInvoiceAddressForm = JSON.parse(
                JSON.stringify(this.addInvoiceAddressForm)
              );
              delete newAddInvoiceAddressForm.cityArr;
              let API = this.isEditInvoiceAddress
                ? editInvoicelAddressAPI
                : addInvoicelAddressAPI;
              const res = await API(newAddInvoiceAddressForm);
              if (res.status === 200) {
                let message = this.isEditInvoiceAddress
                  ? lang.invoice_text150
                  : lang.invoice_text133;
                await this.getInvoicelAddress();
                this.$message.success(message);
                this.invoiceAddressVisible = false;
              } else {
                console.log(res);
                // this.$message.error(res.msg);
              }
            } else {
              return false;
            }
          });
        },
        // 支付
        goPay(obj) {
          this.$refs.payDialog.showPayDialog(obj.invoice_order_id);
        },
        // 支付成功
        async paySuccess(obj) {
          console.log(obj);
          await this.getInvoicelTable();
        },
        async payCancel(obj) {
          // location.href = "/finance.htm";
          await this.getInvoicelTable();
        },
      },
      watch: {
        activeName: {
          async handler(newValue, oldValue) {
            if (newValue === "invoiceList") {
              await this.getInvoicelTable();
              await this.getInvoicelSet();
            } else {
              // 在发票设置页面 获取发票抬头列表和发票收件地址列表
              await this.getInvoicelTitleIist();
              await this.getInvoicelAddress();
            }
          },
          immediate: true,
        },
        invoiceTitleVisible: {
          handler(newValue) {
            if (!newValue) {
              (this.addInvoiceForm = {
                title_type: "company",
                title: "",
                invoice_type: "normal",
                company_address: "",
                tax: "",
                bank: "",
                bank_user: "",
              }),
                this.$refs.addInvoiceFormRef.resetFields();
              this.isEditInvoiceTitle = false;
            }
          },
        },
        invoiceAddressVisible: {
          handler(newValue) {
            if (!newValue) {
              for (const key in this.addInvoiceAddressForm) {
                this.addInvoiceAddressForm[key] = "";
              }
              this.$refs.addInvoiceAddressFormRef.resetFields();
              this.isEditInvoiceAddress = false;
              this.addInvoiceAddressForm = {
                rec_type: "paper",
                rec_name: "",
                address: "",
                phone: "",
                is_default: false,
                cityArr: [],
                email: "",
                rec_url: "",
              };
            }
          },
        },
        detaliVisible: {
          handler(newValue) {
            if (!newValue) {
              this.invoiceDetails = {
                host: [],
              };
            }
          },
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

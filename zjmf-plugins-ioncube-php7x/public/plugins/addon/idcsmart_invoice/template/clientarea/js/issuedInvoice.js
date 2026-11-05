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
        this.getProjectList();
        await this.getCourierList();
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
          commonData: {},
          //   私有属性
          activeName: "Paid", // Paid = 后开票 Unpaid = 预开票
          tableList: [],
          openInvoiceVisible: false,
          openInvoiceForm: {
            invoice_title_id: "",
            invoice_address_id: "",
            parcel_id: "",
            order_id: [],
            rec_type: "paper",
            invoice_project_id: "",
            invoice_format: "pdf",
          },
          invoicTitleList: [],
          invoicAddressList: [],
          courierList: [],
          orderIDList: [],
          priceArr: [
            {
              str: "",
              price: "",
              tax_rate: "",
              tax_price: "",
              total: "",
              parcel_price: "",
            },
          ],
          isOk: false,
          haveArr: [],
          projectList: [],
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
      computed: {
        filterProject() {
          if (!this.openInvoiceForm.invoice_title_id) {
            return [];
          }
          const curType = this.invoicTitleList.filter(
            (item) => item.id === this.openInvoiceForm.invoice_title_id
          )[0]?.invoice_type;
          if (curType === "special") {
            return this.projectList.filter(
              (item) => item.special_tax_switch === 1
            );
          } else {
            return this.projectList;
          }
        },
      },
      methods: {
        closeDialog() {
          this.orderIDList = [];
        },
        changeTitle() {
          this.openInvoiceForm.invoice_project_id = this.filterProject[0]?.id;
          this.getPrice();
        },
        changeFormat(e) {
          if (e === "ofd" || e === "xml") {
            this.openInvoiceForm.rec_type = "email";
          }
          this.filterAddressList();
        },
        async getProjectList() {
          try {
            const res = await getProject();
            this.projectList = res.data.data.list;
          } catch (error) {}
        },
        // 每页展示数改变
        sizeChange(e) {
          this.params.limit = e;
          this.params.page = 1;
          // 获取列表
          this.getTableData();
        },
        // 当前页改变

        currentChange(e) {
          this.params.page = e;
          this.getTableData();
        },

        // 获取通用配置
        getCommonData() {
          this.commonData = JSON.parse(
            localStorage.getItem("common_set_before")
          );
          document.title =
            this.commonData.website_name + "-" + lang.invoice_text135;
        },
        back() {
          history.back();
        },
        async getTableData() {
          const res = await queryInvoicelAfterAPI({
            ...this.params,
            status: this.activeName,
          });
          if (res.status == 200) {
            const { data } = res.data;
            this.params.total = data.count;
            let productName = "";
            this.tableList = data.list.map((item) => {
              if (item.host && item.host.length > 0) {
                if (item.host.length > 2) {
                  productName =
                    item.host[0]["product_name"] +
                    "、" +
                    item.host[1]["product_name"] +
                    " " +
                    lang.invoice_text151 +
                    item.host.length +
                    lang.invoice_text152;
                } else {
                  productName = item.host
                    .map((item) => {
                      return item.product_name || "--";
                    })
                    .join("、");
                }
              } else {
                productName = "--";
              }
              return { ...item, productName };
            });
          }
        },
        async getInvoicTitleList() {
          const res = await queryInvoicelTitleIistAPI();
          if (res.status === 200) {
            const { data } = res.data;
            this.invoicTitleList = data.list.map((item) => {
              if (item.invoice_type === "normal") {
                item.title = item.title + "/" + lang.invoice_text74;
              } else {
                item.title = item.title + "/" + lang.invoice_text75;
              }
              return item;
            });
          }
        },
        async getInvoicAddressList() {
          const res = await queryInvoicelAddressAPI();
          if (res.status === 200) {
            const { data } = res.data;
            this.haveArr = data.list.map((item) => {
              let str = "";
              if (item.rec_type === "paper") {
                str = `${item.rec_name}/${item.province}/${item.city}/${item.region}/${item.address}/${item.phone}`;
              } else {
                if (item.email) {
                  str = item.email;
                } else {
                  str = item.rec_url;
                }
              }
              return { ...item, str };
            });
          }
        },
        // 获取发票配置
        async getCourierList() {
          const res = await queryInvoicelSetAPI();
          if (res.status === 200) {
            const { data } = res;
            this.courierList = data;
          }
        },
        async getInvoicelPrice() {
          try {
            const res = await queryInvoicelPriceAPI({
              ...this.openInvoiceForm,
              order_id: this.orderIDList,
            });
            // if (res.status !== 200) {
            //   // this.$message.error(res.msg);
            // }
            if (res.status === 200) {
              const { data } = res.data;
              this.priceArr = [data];
              let ar = [data].map((item) => {
                str = "";
                if (item.host.length > 0) {
                  item.host.map((obj) => {
                    str += obj.product_name + ",";
                  });
                }
                str = str.slice(0, -1);
                item.price = this.commonData.currency_prefix + item.price;
                item.tax_price =
                  this.commonData.currency_prefix +
                  item.tax_price +
                  lang.invoice_text136;
                item.parcel_price =
                  this.commonData.currency_prefix + item.parcel_price;
                item.total = this.commonData.currency_prefix + item.total;
                return { ...item, str };
              });
              this.priceArr = ar;
              // 获取到了价格 保存一下状态
              this.isOk = true;
            }
          } catch (err) {
            this.$message.error(err.data.msg);
          }
        },
        checkbox(row) {
          if (
            row.invoice_id > 0 ||
            (row.is_cross_year && this.courierList.across_year_invoice == "0")
          ) {
            // 根据你的条件来设置
            return false; //不可选择
          } else {
            return true; //可选择
          }
        },
        getPrice() {
          const { rec_type, invoice_title_id, invoice_address_id, parcel_id } =
            this.openInvoiceForm;
          this.priceArr = [];
          // 判断是否都选择了快递，抬头，地址才发获取价格
          const canGetPrice =
            rec_type === "email"
              ? invoice_title_id && invoice_address_id
              : invoice_title_id && invoice_address_id && parcel_id;
          if (canGetPrice) {
            this.getInvoicelPrice();
          }
        },
        handleSelectionChange(orderList) {
          if (orderList.length > 0) {
            this.orderIDList = orderList.map((item) => item.id);
          }
        },
        async handleOpenInvoice() {
          if (this.orderIDList.length > 0) {
            this.openInvoiceVisible = true;
          } else {
            this.$message.info(lang.invoice_text137);
          }
        },
        editInvoicelTitle(obj) {
          // 不可开具跨年发票
          if (
            obj.is_cross_year &&
            this.courierList.across_year_invoice == "0"
          ) {
            return this.$message.error(lang.invoice_text143);
          }
          this.openInvoiceVisible = true;
          this.orderIDList = [obj.id];
        },
        handlePay() {
          this.$refs.openInvoiceFormRef.validate(async (valid) => {
            if (valid) {
              if (this.isOk) {
                const res = await addInvoicelAPI({
                  ...this.openInvoiceForm,
                  order_id: this.orderIDList,
                });
                if (res.status == 200) {
                  const { data } = res.data;
                  this.$message.success(lang.invoice_text138);
                  this.openInvoiceVisible = false;
                  await this.getTableData();
                  this.$refs.payDialog.showPayDialog(data.id);
                }
              }
            } else {
              console.log("error submit!!");
              return false;
            }
          });
        },
        filterAddressList() {
          let arr = JSON.parse(JSON.stringify(this.haveArr));
          this.openInvoiceForm.invoice_address_id = "";
          // 一进来先把 地址清空 在判断走的纸质发票还是电子发票，再判断是否含有默认地址
          if (this.openInvoiceForm.rec_type === "paper") {
            this.invoicAddressList = arr.filter(
              (item) => item.rec_type === "paper"
            );
          } else {
            this.invoicAddressList = arr.filter(
              (item) => item.rec_type === "email"
            );
          }
          let obj = this.invoicAddressList.find((opt) => opt.is_default == 1);
          if (obj) {
            this.openInvoiceForm.invoice_address_id = obj.id;
          } else {
            this.openInvoiceForm.invoice_address_id = "";
          }
          this.getPrice();
        },
        // 支付成功
        async paySuccess(obj) {
          console.log(obj);
          await this.getTableData();
        },
        payCancel(obj) {
          console.log(obj);
          // location.href = "/finance.htm";
          this.getTableData();
        },
      },
      watch: {
        activeName: {
          async handler(newValue) {
            this.tableList = [];
            this.params = {
              page: 1,
              limit: 20,
              pageSizes: [20, 50, 100],
              total: 200,
              orderby: "id",
              sort: "desc",
              keywords: "",
            };
            await this.getTableData();
          },
          immediate: true,
        },
        openInvoiceVisible: {
          async handler(newValue) {
            if (newValue) {
              await this.getInvoicTitleList();
              await this.getInvoicAddressList();
              // await this.getCourierList();
              this.filterAddressList();
            } else {
              this.$refs.openInvoiceFormRef.clearValidate();
              this.$refs.openInvoiceFormRef.resetFields();
              this.isOk = false;
              this.priceArr = [
                {
                  str: "",
                  price: "",
                  tax_rate: "",
                  tax_price: "",
                  total: "",
                  parcel_price: "",
                },
              ];
              // await this.getTableData();
            }
          },
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

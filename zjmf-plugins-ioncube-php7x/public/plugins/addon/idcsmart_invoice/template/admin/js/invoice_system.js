(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("invoice-system")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = moment;
    const host = location.origin;
    const fir = location.pathname.split("/")[1];
    const str = `${host}/${fir}/`;
    new Vue({
      data() {
        return {
          baseUrl: str,
          maxHeight: 0,
          params: {
            keywords: "",
            // 开票类型
            type: "",
            // 状态
            status: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
          },
          total: 100,
          uploadHeaders: {
            Authorization: "Bearer" + " " + localStorage.getItem("backJwt"),
          },
          pageSizeOptions: [20, 50, 100],
          // 开票类型
          invoiceType: [
            {
              id: 1,
              label: lang.invoice_type1,
              value: "after",
            },
            {
              id: 2,
              label: lang.invoice_type2,
              value: "prev",
            },
          ],
          // 开票状态
          invoiceStatus: [
            {
              id: 1,
              label: lang.invoice_status1,
              value: "pending",
            },
            {
              id: 2,
              label: lang.invoice_status2,
              value: "unpaid",
            },
            {
              id: 3,
              label: lang.invoice_status3,
              value: "wait_send",
            },
            {
              id: 4,
              label: lang.invoice_status4,
              value: "sent",
            },
            {
              id: 5,
              label: lang.invoice_status5,
              value: "reject",
            },
            {
              id: 6,
              label: lang.invoice_status6,
              value: "cancel",
            },
            {
              id: 7,
              label: lang.invoice_btn8,
              value: "flushed",
            },
          ],
          statusText: {
            pending: lang.invoice_status1,
            unpaid: lang.invoice_status2,
            wait_send: lang.invoice_status3,
            sent: lang.invoice_status4,
            reject: lang.invoice_status5,
            cancel: lang.invoice_status6,
            flushed: lang.invoice_btn8,
          },
          invoiceList: [],
          loading: false,
          columns: [
            {
              colKey: "id",
              title: "ID",
              width: 50,
            },
            {
              colKey: "username",
              title: lang.invoice_tab5,
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "title",
              title: lang.invoice_tab6,
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "invoice_format",
              title: lang.invoice_btn10,
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "invoice_project",
              title: lang.invoice_btn9,
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "price",
              title: lang.invoice_tab7,
              width: 180,
              ellipsis: true,
            },
            {
              colKey: "create_time",
              title: lang.invoice_tab8,
              width: 180,
            },
            {
              colKey: "type",
              title: lang.invoice_label2,
              width: 100,
            },
            {
              colKey: "status",
              title: lang.invoice_tab9,
              width: 120,
            },
            {
              colKey: "operation",
              title: lang.invoice_tab10,
              width: 140,
            },
          ],
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          rejectVisible: false,
          rejectData: {
            id: null,
            reject_reason: "",
          },
          rejectRules: {
            reject_reason: [
              { required: true, message: lang.invoice_text8, type: "error" },
              // { validator: val => val.length <= 100, message: lang.verify3 + 100, type: 'warning' },
            ],
          },
          passVisible: false,
          passData: {
            id: null,
            review_notes: "",
          },
          detailVisible: false,
          // 发票详情数据
          detailData: {},
          // 发出发票
          sendVisible: false,
          sendData: {
            id: null,
            parcel_id: null,
            parcel_number: "",
            filename: "",
            rec_type: "",
          },
          // 快递列表
          parcel: [],
          isShowPre: 0,
          sendRules: {
            parcel_id: [
              { required: true, message: lang.invoice_tips12, type: "error" },
            ],
            parcel_number: [
              { required: true, message: lang.invoice_tips13, type: "error" },
            ],
            // filename: [
            //     { required: true, message: lang.invoice_tips14, type: 'error' },
            // ]
          },
          sizeLimit: {
            size: 5,
            unit: "MB",
            message: lang.invoice_tips15,
          },
          fileList: [],
          /* 冲红 */
          blushVisible: false,
          curId: "",
          // 图片上传相关
          uploadUrl: str + "/v1/upload",
          uploadHeaders: {
            Authorization: "Bearer" + " " + localStorage.getItem("backJwt"),
          },
          uploadForm: {
            id: "",
            files: [],
          },
          showProject: false,
          lookProject: false,
          tempObj: {},
          isComfirm: false,
          // 申请开票
          openInvoiceVisible: false,
          openInvoiceForm: {
            client_id: "",
            order_id: [],
            invoice_title_id: "",
            invoice_address_id: "",
            parcel_id: "",
            rec_type: "paper",
            invoice_project_id: "",
            invoice_format: "pdf",
            status: "Paid",
          },
          invoicTitleList: [],
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
          userTotal: 0,
          userList: [],
          userForm: {
            keywords: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
          },
          orderList: [],
          searchLoading: false,
          InvoiceRules: {
            client_id: [
              {
                required: true,
                message: `${lang.select}${lang.user}`,
                type: "error",
              },
            ],
            status: [
              {
                required: true,
                message: `${lang.select}${lang.invoice_text2}`,
                type: "error",
              },
            ],
            order_id: [
              {
                required: true,
                message: `${lang.select}${lang.invoice_btn21}`,
                type: "error",
              },
            ],
            invoice_title_id: [
              {
                required: true,
                message: `${lang.select}${lang.invoice_btn22}`,
                type: "error",
              },
            ],
            invoice_project_id: [
              {
                required: true,
                message: `${lang.select}${lang.invoice_btn9}`,
                type: "error",
              },
            ],
            invoice_format: [
              {
                required: true,
                message: `${lang.select}${lang.invoice_btn23}`,
                type: "error",
              },
            ],
            rec_type: [
              {
                required: true,
                message: `${lang.select}${lang.invoice_label5}`,
                type: "error",
              },
            ],
            parcel_id: [
              {
                required: true,
                message: `${lang.select}${lang.invoice_title9}`,
                type: "error",
              },
            ],
            invoice_address_id: [
              {
                required: true,
                message: `${lang.select}${lang.invoice_title12}`,
                type: "error",
              },
            ],
          },
          infoColumns: [
            {
              colKey: "str",
              title: lang.sale_text23,
              ellipsis: true,
              width: 150,
            },
            {
              colKey: "price",
              title: lang.money,
              ellipsis: true,
            },
            {
              colKey: "tax_rate",
              title: lang.invoice_title7,
              ellipsis: true,
              width: 100,
            },
            {
              colKey: "tax_price",
              title: lang.invoice_title8,
              ellipsis: true,
            },
          ],
          submitLoading: false,
        };
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
        calcLable() {
          return (item) => {
            if (item.type === "recharge") {
              return lang.recharge;
            } else if (item.type === "artificial") {
              return lang.artificial;
            } else {
              return item.host[0]?.product_name || "--";
            }
          };
        },
        calcShow() {
          return (data) => {
            return (
              `#${data.id}-` +
              (data.username
                ? data.username
                : data.phone
                ? data.phone
                : data.email) +
              (data.company ? `(${data.company})` : "")
            );
          };
        },
        invoicAddressList() {
          let arr = JSON.parse(JSON.stringify(this.haveArr));
          let temp = [];
          // 一进来先把 地址清空 在判断走的纸质发票还是电子发票，再判断是否含有默认地址
          if (this.openInvoiceForm.rec_type === "paper") {
            temp = arr.filter((item) => item.rec_type === "paper");
          } else {
            temp = arr.filter((item) => item.rec_type === "email");
          }
          let obj = temp.find((opt) => opt.is_default == 1);
          if (obj) {
            this.openInvoiceForm.invoice_address_id = obj.id;
          } else {
            this.openInvoiceForm.invoice_address_id = "";
          }
          return temp;
        },
      },
      watch: {
        "openInvoiceForm.invoice_address_id"() {
          this.getPrice();
        },
      },
      components: {
        comConfig,
        comChooseUser,
      },
      methods: {
        changeUser(val) {
          this.openInvoiceForm.client_id = val;
          this.getInvoiceData();
        },
        /* 申请开票 */
        handleAdd() {
          this.openInvoiceVisible = true;
          this.openInvoiceForm = {
            client_id: "",
            order_id: [],
            invoice_title_id: "",
            invoice_address_id: "",
            parcel_id: "",
            rec_type: "paper",
            invoice_project_id: "",
            invoice_format: "pdf",
            status: "Paid",
          };
          this.priceArr = [];
          this.userList = [];
          this.userTotal = 0;
          this.userForm.keywords = "";
          this.getUserList();
        },
        changeType() {
          this.openInvoiceForm.order_id = [];
          this.getInvoiceData();
        },
        // 用户
        async getUserList() {
          try {
            if (this.userTotal > 0 && this.userList.length === this.userTotal) {
              return;
            }
            const res = await client(this.userForm);
            const list = res.data.data.list.map((item) => {
              item.value = item.id;
              item.label = item.username;
              return item;
            });
            if (list.length === 0) {
              return;
            }
            this.userList = this.userList.concat(list);
            this.userTotal = res.data.data.count;
            this.searchLoading = false;
            return true;
          } catch (error) {
            this.searchLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        // 远程搜素
        remoteMethod(key) {
          this.userForm.page = 1;
          // console.log('@@@@', this.openInvoiceForm.client_id)
          // if (this.openInvoiceForm.client_id) {
          //   this.userList = this.userList.filter((item) =>
          //     this.openInvoiceForm.client_id.includes(item.id)
          //   );
          // } else {
          //   this.userList = [];
          // }
          this.userList = [];
          this.userForm.keywords = key;
          this.searchLoading = true;
          this.getUserList();
        },
        async handleScroll({ e }) {
          const { scrollTop, clientHeight, scrollHeight } = e.target;
          if (scrollHeight - scrollTop === clientHeight) {
            this.userForm.page++;
            await Promise.resolve(this.getUserList()).then((res) => {
              this.$nextTick(() => {
                document.querySelector(".client-pup").scrollTop = scrollHeight;
              });
            });
          }
        },
        changeTitle() {
          this.openInvoiceForm.invoice_project_id = this.filterProject[0]?.id;
          this.getPrice();
        },
        async handlePay({ validateResult, firstError }) {
          if (validateResult === true) {
            if (this.isOk) {
              this.submitLoading = true;
              const res = await addInvoicelAPI({
                ...this.openInvoiceForm,
              });
              if (res.status == 200) {
                this.$message.success(res.data.msg);
                this.openInvoiceVisible = false;
                this.submitLoading = false;
                this.getInvoiceList();
              }
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },
        closeDialog() {
          this.orderIDList = [];
        },
        changeFormat(e) {
          if (e === "ofd" || e === "xml") {
            this.openInvoiceForm.rec_type = "email";
          }
        },
        // 发票项目
        async getProjectList() {
          try {
            const res = await getProject();
            this.projectList = res.data.data.list;
          } catch (error) {}
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
        async getInvoicelPrice() {
          try {
            const res = await queryInvoicelPriceAPI(this.openInvoiceForm);
            if (res.status === 200) {
              const { data } = res.data;
              this.priceArr = [data];
              let str = "";
              let ar = [data].map((item) => {
                if (item.host.length > 0) {
                  item.host.map((obj) => {
                    str += obj.product_name + ",";
                  });
                }
                str = str.slice(0, -1);
                item.price = this.currency_prefix + item.price;
                item.tax_price =
                  this.currency_prefix + item.tax_price + lang.invoice_btn28;
                return { ...item, str };
              });
              this.priceArr = ar;
              // 获取到了价格 保存一下状态
              this.isOk = true;
            }
          } catch (err) {
            console.log("@@@@err", err);
            this.$message.error(err.data.msg);
          }
        },
        // 获取可选订单
        async getInvoiceData() {
          try {
            if (!this.openInvoiceForm.client_id) {
              return;
            }
            this.orderList = [];
            const res = await getInvoiceRequest({
              page: 1,
              limit: 1000,
              client_id: this.openInvoiceForm.client_id,
              status: this.openInvoiceForm.status,
            });
            this.orderList = res.data.data.list;
            this.getInvoicTitleList();
          } catch (error) {}
        },
        // 发票抬头
        async getInvoicTitleList() {
          const res = await invoiceTitle({
            client_id: this.openInvoiceForm.client_id,
          });
          if (res.status === 200) {
            const { data } = res.data;
            this.invoicTitleList = data.list.map((item) => {
              if (item.invoice_type === "normal") {
                item.title = item.title + "/" + lang.invoice_btn27;
              } else {
                item.title = item.title + "/" + lang.invoice_btn26;
              }
              return item;
            });
            this.getInvoiceAddress();
          }
        },
        // 收件地址
        async getInvoiceAddress() {
          try {
            if (!this.openInvoiceForm.client_id) {
              return;
            }
            const res = await invoiceAddress({
              client_id: this.openInvoiceForm.client_id,
            });
            const { data } = res.data;
            this.haveArr = data.list.map((item) => {
              let str = "";
              if (item.rec_type === "paper") {
                str = `${item.address}/${item.phone}`;
              } else {
                if (item.email) {
                  str = item.email;
                } else {
                  str = item.rec_url;
                }
              }
              return { ...item, str };
            });
          } catch (error) {}
        },
        /* 申请开票 end */
        handleProject(row) {
          this.lookProject = false;
          this.tempObj = JSON.parse(JSON.stringify(row));
          this.lookProject = true;
        },
        async delProject() {
          try {
            this.isComfirm = !this.isComfirm;
            if (this.isComfirm) {
              return;
            }
            this.submitLoading = true;
            const res = await deleteInvoice({
              id: this.tempObj.id,
            });
            this.getInvoiceList();
            this.lookProject = false;
            this.isComfirm = false;
            this.$message.success(res.data.msg);
            this.submitLoading = false;
          } catch (error) {
            this.submitLoading = false;
            this.isComfirm = false;
            this.$message.error(error.data.msg);
          }
        },

        handleDown(row) {
          downInvoice({
            id: row.id,
          })
            .then((res) => {
              window.open(res.data.data.url);
              this.lookProject = false;
            })
            .catch((err) => {
              this.$message.error(err.data.msg);
            });
        },
        handleUpload(row) {
          this.uploadForm.id = row.id;
        },
        //文件上传成功
        async onSuccess({ file }) {
          try {
            const res = await uploadInvoice({
              id: this.uploadForm.id,
              invoice_filename: file.url,
            });
            this.$message.success(res.data.msg);
            this.lookProject = false;
            this.uploadForm.id = "";
            this.uploadForm.files = [];
            this.getInvoiceList();
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        //上传失败
        handleFail({ file }) {
          this.$message.error(
            `${lang.file} ${file.name} ${lang.invoice_text23}`
          );
        },
        filterMethod() {
          return true;
        },
        //上传文件之前
        beforeUploadfile(e) {},
        formatImgResponse(res) {
          if (res.status === 200) {
            return { url: res.data.save_name };
          } else {
            return this.$message.error(res.msg);
          }
        },
        // 冲红
        handleBlush(row) {
          this.curId = row.id;
          this.blushVisible = true;
        },
        async submitBlush() {
          try {
            this.submitLoading = true;
            const res = await blushInvoice({ id: this.curId });
            this.$message.success(res.data.msg);
            this.blushVisible = false;
            this.getInvoiceList();
            this.submitLoading = false;
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        jumpUser(row) {
          location.href = str + `client_detail.htm?client_id=${row.client_id}`;
        },
        // 切换分页
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.params.keywords = "";
          this.getInvoiceList();
        },
        // 获取发票列表
        getInvoiceList() {
          this.invoiceList = [];
          this.total = 0;
          this.loading = true;
          invoice(this.params)
            .then((res) => {
              if (res.data.status == 200) {
                this.invoiceList = res.data.data.list;
                this.total = res.data.data.count;
              }
              this.loading = false;
            })
            .catch((error) => {
              this.loading = false;
            });
        },
        seacrh() {
          this.getInvoiceList();
        },
        clearKey() {
          this.params.keywords = "";
          this.seacrh();
        },
        // 通过点击
        confirm(row) {
          this.passData.id = row.id;
          this.passData.review_notes = "";
          this.passVisible = true;
        },
        // 驳回点击
        reject(row) {
          this.rejectData.id = row.id;
          this.rejectData.reject_reason = "";
          this.rejectVisible = true;
        },
        // 发票详情点击
        detail(row) {
          const params = {
            id: row.id,
          };
          invoiceDetail(params)
            .then((res) => {
              if (res.data.status == 200) {
                this.detailData = res.data.data;
                this.detailVisible = true;
              }
            })
            .catch((error) => {
              this.$message.error(error.data.msg);
            });
        },
        // 发出 点击
        send(row) {
          const params = {
            id: row.id,
          };
          // 获取发票详情
          invoiceDetail(params)
            .then((res) => {
              if (res.data.status == 200) {
                this.detailData = res.data.data;
                // 纸质发票
                if (this.detailData.rec_type == "paper") {
                  const parcelName = this.detailData.parcel;
                  this.sendData = {
                    id: this.detailData.id,
                    parcel_id: null,
                    parcel_number: this.detailData.parcel_number,
                    filename: this.detailData.filename,
                    rec_type: this.detailData.rec_type,
                  };
                  this.fileList = [];

                  // 获取发票设置
                  this.parcel.map((item) => {
                    if (item.name == parcelName) {
                      this.sendData.parcel_id = item.id;
                    }
                  });
                }

                // 电子发票
                if (this.detailData.rec_type == "email") {
                  this.sendData = {
                    id: this.detailData.id,
                  };
                }

                this.sendVisible = true;
              }
            })
            .catch((error) => {
              this.$message.error(error.data.msg);
            });
        },
        // 驳回弹窗 关闭
        rejectClose(row) {
          this.rejectVisible = false;
        },
        // 驳回弹窗 提交
        rejectSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            const params = { ...this.rejectData };
            rejectInvoice(params)
              .then((res) => {
                if (res.data.status == 200) {
                  this.$message.success(lang.invoice_text9);
                  this.getInvoiceList();
                  this.rejectVisible = false;
                }
              })
              .catch((error) => {
                this.$message.error(error.data.msg);
              });
          } else {
            this.$message.warning(firstError);
          }
        },
        // 通过弹窗 确定
        passSubmit() {
          const params = { ...this.passData };
          confirmInvoice(params)
            .then((res) => {
              if (res.data.status == 200) {
                this.$message.success(lang.invoice_text10);
                this.getInvoiceList();
                this.passVisible = false;
              }
            })
            .catch((error) => {
              this.$message.error(error.data.msg);
            });
        },
        // 纸质发票发出 提交
        sendSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            this.sendSubmit1();
          } else {
            this.$message.warning(firstError);
          }
        },
        // 电子发票发出提交
        sendSubmit1() {
          const params = {
            ...this.sendData,
          };
          this.submitLoading = true;
          sendInvoice(params)
            .then((res) => {
              if (res.data.status === 200) {
                this.$message.success(res.data.msg);
                this.getInvoiceList();
                this.sendVisible = false;
              } else {
                this.$message.error(res.data.msg);
              }
            })
            .catch((error) => {
              this.$message.error(error.data.msg);
            })
            .finally(() => {
              this.submitLoading = false;
            });
        },
        // 上传成功
        handleSuccess(response, file, fileList) {
          console.log(response);
          if (response.response.status == 200) {
            this.sendData.filename = response.response.data.save_name;
          } else {
            this.$message.error(response.response.msg);
            this.fileList = [];
          }
        },
        // 上传失败
        handleFail(response, file, fileList) {
          console.log(response);
          this.$message.error(
            `${lang.invoice_text22} ${file.name} ${lang.invoice_text23}`
          );
        },
        async getParcelList() {
          try {
            // 获取发票设置
            invoiceConfig().then((res) => {
              this.isShowPre = res.data.pre_invoice;
              this.parcel = res.data.parcel;
            });
          } catch (error) {}
        },
      },
      created() {
        this.getInvoiceList();
        this.getProjectList();
        this.getParcelList();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

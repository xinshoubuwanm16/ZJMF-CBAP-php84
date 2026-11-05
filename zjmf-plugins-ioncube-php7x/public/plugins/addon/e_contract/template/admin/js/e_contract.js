(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("e_contract")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
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
          hover: true,
          tableLayout: false,
          delVisible: false,
          loading: false,
          list: [],
          typeColumns: [
            {
              colKey: "id",
              title: lang.contract + "ID",
              ellipsis: true,
              width: 140,
            },
            {
              colKey: "username",
              title: lang.user,
              ellipsis: true,
              width: 200,
            },
            {
              colKey: "tailorism",
              title: `${lang.tailorism}${lang.content}`,
              ellipsis: true,
              width: 500,
              className: "table-product",
            },
            {
              colKey: "pay_time",
              title: lang.pay_time,
              ellipsis: true,
              width: 180,
            },
            {
              colKey: "status",
              title: `${lang.contract}${lang.status}`,
              ellipsis: true,
              className: "contract-status",
              width: 150,
            },
            {
              colKey: "op",
              title: lang.operation,
              width: 80,
            },
          ],
          params: {
            keywords: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
            status: "",
          },
          total: 0,
          pageSizeOptions: [20, 50, 100],
          statusList: [
            { value: "no_sign", label: lang.no_sign },
            { value: "review", label: lang.review },
            { value: "complete", label: lang.complete },
            { value: "wait_mail", label: lang.wait_mail },
            { value: "reject", label: lang.invoice_status5 },
            // { value: 'cancel', label: lang.sale_text20 },
          ],
          payStatus: [
            { value: "Pending", label: lang.Pending },
            { value: "Unpaid", label: lang.Unpaid },
            { value: "Active", label: lang.opened_notice },
            { value: "Deleted", label: lang.Deleted },
            { value: "Failed", label: lang.Failed },
            { value: "Suspended", label: lang.Suspended },
          ],
          mailParams: {
            id: "",
            courier_company: "",
            post_number: "",
            status: "",
            rec_person: "",
            rec_phone: "",
            rec_address: "",
          },
          mailVisible: false,
          mailRules: {
            courier_company: [
              {
                required: true,
                message: lang.input + lang.courier_company,
                type: "error",
              },
            ],
            post_number: [
              {
                required: true,
                message: lang.input + lang.post_number,
                type: "error",
              },
            ],
            status: [
              {
                required: true,
                message: lang.select + lang.status,
                type: "error",
              },
            ],
          },
          mailTitle: "",
          submitLoading: false,
          isMail: false, // 邮寄/信息展示
          wrap: "；\n",
        };
      },
      computed: {
        calcPayStatus() {
          return (val) => {
            return this.payStatus.filter((item) => item.value === val)[0]
              ?.label;
          };
        },
        calcStatus() {
          return (val) => {
            return this.statusList.filter((item) => item.value === val)[0]
              ?.label;
          };
        },
      },
      methods: {
        clearSearch() {
          this.params.keywords = "";
          this.seacrh();
        },
        async submitInfo({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.submitLoading = true;
              const params = JSON.parse(JSON.stringify(this.mailParams));
              delete params.rec_person;
              delete params.rec_phone;
              delete params.rec_address;
              const res = await sendContract(params);
              this.$message.success(res.data.msg);
              this.mailVisible = false;
              this.submitLoading = false;
              this.getContractList();
            } catch (error) {
              console.log(error);
              this.submitLoading = false;
              this.$message.error(error.data.msg);
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },
        lookDetail(row) {
          location.href = `contract_details.htm?id=${row.id}`;
        },
        mailContract(row, bol) {
          const {
            id,
            courier_company,
            post_number,
            status,
            rec_person,
            rec_phone,
            rec_address,
          } = row;
          this.mailParams = {
            id,
            courier_company,
            post_number,
            status,
            rec_person,
            rec_phone,
            rec_address,
          };
          this.isMail = bol;
          this.mailTitle = bol ? `${lang.mail}${lang.manage}` : lang.box_title6;
          this.mailVisible = true;
        },
        async getContractList() {
          try {
            this.loading = true;
            const res = await getContract(this.params);
            this.list = res.data.data.list;
            this.total = res.data.data.count;
            this.loading = false;
          } catch (error) {
            console.log("error", error);
            this.loading = false;
            this.$message.error(error.data.msg);
          }
        },
        // 切换分页
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.getContractList();
        },
        clearKey() {
          this.params.keywords = "";
          this.seacrh();
        },
        seacrh() {
          this.params.page = 1;
          this.getContractList();
        },
      },
      created() {
        this.getContractList();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

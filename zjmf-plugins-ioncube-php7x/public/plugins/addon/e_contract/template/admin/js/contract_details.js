(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("template")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        comConfig,
      },
      data() {
        return {
          id: "",
          info: {},
          loading: false,
          delVisible: false,
          optType: "", //complete reject
          formData: {
            id: "",
            reason: "",
            cancel_reason: "",
          },
          rules: {
            reason: [
              { required: true, message: `${lang.input}${lang.reject_reason}` },
            ],
            cancel_reason: [
              {
                required: true,
                message: `${lang.input}${lang.nullify_reason}`,
              },
            ],
          },
        };
      },
      computed: {
        calcHeader() {
          switch (this.optType) {
            case "complete":
              return lang.pass_review + "？";
            case "reject":
              return lang.reject_reason;
            case "cancel":
              return lang.nullify_reason;
          }
        },
      },
      methods: {
        back() {
          location.href = "index.htm";
        },
        async getDetails() {
          try {
            const res = await getContractDetails({ id: this.id });
            this.info = res.data.data;
          } catch (error) {}
        },
        optHandler(type) {
          this.optType = type;
          this.delVisible = true;
        },
        async onSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.loading = true;
              const res = await changeContract(this.optType, this.formData);
              this.$message.success(res.data.msg);
              this.delVisible = false;
              this.getDetails();
              this.loading = false;
            } catch (error) {
              this.loading = false;
              this.$message.error(error.data.msg);
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },
        async sureHandler() {
          try {
            this.loading = true;
            const res = await changeContract("complete", { id: this.id });
            this.$message.success(res.data.msg);
            this.delVisible = false;
            this.getDetails();
            this.loading = false;
          } catch (error) {
            this.loading = false;
            this.$message.error(error.data.msg);
          }
        },
        // 下载PDF
        async downPdf() {
          try {
            this.loading = true;
            const res = await downloadPDF({ id: this.id * 1 });
            window.open(res.data.data.url);
            this.loading = false;
          } catch (error) {
            this.loading = false;
            error.data?.msg && this.$message.error(error.data.msg);
          }
        },
      },
      created() {
        this.formData.id = this.id = location.href.split("?")[1].split("=")[1];
        this.getDetails();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

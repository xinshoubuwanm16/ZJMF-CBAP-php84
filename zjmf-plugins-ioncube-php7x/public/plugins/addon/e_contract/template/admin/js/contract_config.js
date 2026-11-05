(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("contract_config")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = window.moment;
    const origin = location.origin;
    const host = origin + "/" + location.pathname.split("/")[1];
    new Vue({
      components: {
        comConfig,
      },
      data() {
        return {
          hover: true,
          tableLayout: false,
          delVisible: false,
          loading: false,
          typeRules: {
            switch: [{ required: true, message: lang.selct, type: "error" }],
            day_limit: [
              {
                required: true,
                message: lang.input + lang.limit_day,
                type: "error",
              },
              {
                pattern: /^[0-9]*$/,
                message: lang.input + "1-9999" + lang.verify18,
                type: "warning",
              },
              {
                validator: (val) => val >= 1 && val <= 9999,
                message: lang.input + "1-9999" + lang.verify18,
                type: "warning",
              },
            ],
            my_unit: [
              {
                required: true,
                message: lang.input + lang.my_unit,
                type: "error",
              },
            ],
            social_credit_code: [
              {
                required: true,
                message: lang.input + lang.social_credit_code,
                type: "error",
              },
            ],
            contact: [
              {
                required: true,
                message: lang.input + lang.contact_user,
                type: "error",
              },
            ],
            contact_phone: [
              {
                required: true,
                message: lang.input + lang.contact_phone,
                type: "error",
              },
              {
                pattern: /^[\d-?]{1,}$/,
                message: lang.verify20,
                type: "warning",
              },
            ],
            contact_email: [
              {
                required: true,
                message: lang.input + lang.contact_email,
                type: "error",
              },
              {
                pattern:
                  /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z_])*@(([0-9a-zA-Z])+([-\w]*[0-9a-zA-Z])*\.)+[a-zA-Z]{1,9})$/,
                message: lang.email_tip,
                type: "warning",
              },
            ],
            contact_address: [
              {
                required: true,
                message: lang.input + lang.contact_address,
                type: "error",
              },
            ],
            postcode: [
              {
                required: true,
                message: lang.input + lang.postcode,
                type: "error",
              },
              {
                pattern:
                  /^(0[1-7]|1[0-356]|2[0-7]|3[0-6]|4[0-7]|5[1-7]|6[1-7]|7[0-5]|8[013-6])\d{4}$/,
                message: lang.contract_tip3,
                type: "warning",
              },
            ],
            contract_number_start: [
              {
                required: true,
                message: lang.input + lang.contract_number_start,
                type: "error",
              },
              {
                pattern: /^\d+$/,
                message: lang.input + lang.verify16,
                type: "warning",
              },
              {
                validator: (val) => val >= 1,
                message: lang.input + lang.verify16,
                type: "warning",
              },
            ],
            logo: [
              {
                required: true,
                message: lang.upload + lang.contract_logo,
                type: "error",
                trigger: "change",
              },
            ],
            company_chop: [
              {
                required: true,
                message: lang.upload + lang.company_chop,
                type: "error",
              },
            ],
          },
          submitLoading: false,
          infoParams: {
            switch: "0",
            day_limit: "",
            my_unit: "",
            social_credit_code: "",
            contact: "",
            contact_phone: "",
            contact_email: "",
            contact_address: "",
            postcode: "",
            contract_number_prefix: "",
            contract_number_start: "",
            logo: [],
            company_chop: [],
            pic_prefix: "",
          },
          // 图片上传相关
          uploadUrl: host + "/v1/upload",
          uploadHeaders: {
            Authorization: "Bearer" + " " + localStorage.getItem("backJwt"),
          },
        };
      },
      computed: {},
      created() {
        this.getConfigInfo();
      },
      methods: {
        // 获取反馈
        async getConfigInfo() {
          try {
            const res = await getContractConfig();
            const temp = res.data.data;
            temp.logo = [temp.logo];
            temp.company_chop = [temp.company_chop];
            this.infoParams = temp;
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        formatResponse(res) {
          if (res.status !== 200) {
            this.$message.error(res.msg);
            this.infoParams.logo = [];
            return { error: res.msg, url: res.url };
          }
          return { save_name: res.data.save_name, url: res.data.image_url };
        },
        async submitSystemGroup({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.submitLoading = true;
              const params = JSON.parse(JSON.stringify(this.infoParams));
              params.logo =
                params.logo[0].save_name || params.logo[0].response.save_name;
              params.company_chop =
                params.company_chop[0].save_name ||
                params.company_chop[0].response.save_name;
              const res = await saveContractConfig(params);
              this.$message.success(res.data.msg);
              this.getConfigInfo();
              this.submitLoading = false;
            } catch (error) {
              this.submitLoading = false;
              this.$message.error(error.data.msg);
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

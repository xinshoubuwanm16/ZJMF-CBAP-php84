(function (window, undefined) {
  var old_onload = window.onload
  window.onload = function () {
    const template = document.getElementsByClassName('credit_limit_setting')[0]
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        comConfig
      },
      data() {
        return {
          loading: false,
          formData: {
            addon_credit_limit_repayment_notice: null,
            addon_credit_limit_overdue_notice: null,
            addon_credit_limit_overdue_suspend_host: null,
          },
          rules: {
            addon_credit_limit_repayment_notice: [
              { required: true, message: lang.input + lang.credit_tip, type: 'error' },
              // { pattern: /[\d,]/g, message: '请输入正确的天数', type: 'error' }
            ],
            addon_credit_limit_overdue_notice: [
              { required: true, message: lang.input + lang.credit_tip3, type: 'error' },
              // { pattern: /[\d,]/g, message: '请输入正确的天数', type: 'error' }
            ],
            addon_credit_limit_overdue_suspend_host: [
              { required: true, message: lang.input + lang.credit_tip7, type: 'error' },
            ],
          }
        }
      },
      methods: {
        async getConfig() {
          try {
            const res = await getCreditSetting()
            const temp = res.data.data
            temp.addon_credit_limit_overdue_suspend_host = temp.addon_credit_limit_overdue_suspend_host * 1
            this.formData = temp
          } catch (error) {
            this.$message.error(error.data.msg)
          }
        },
        async onSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.loading = true
              const res = await saveCreditSetting(this.formData)
              this.$message.success(res.data.msg)
              this.getConfig()
              this.loading = false
            } catch (error) {
              this.loading = false
              this.$message.error(error.data.msg)
            }
          } else {
            console.log('Errors: ', validateResult);
            this.$message.warning(firstError);
          }
        },
      },
      created() {
        this.getConfig()
      },
    }).$mount(template)
    typeof old_onload == 'function' && old_onload()
  };
})(window);

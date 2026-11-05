(function (window, undefined) {
  var old_onload = window.onload
  window.onload = function () {
    const template = document.getElementsByClassName('domain_setting')[0]
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);

    new Vue({
      components: {
        comConfig,
      },
      data () {
        return {
          formData: {
            domain_register_agreement_url: '',
            domain_information_service_agreement_url: '',
            default_search_domain: '',
            specify_search_domain: [],
            number_limit: null,
            // phone: ''
          },
          suffixList: [],
          rules: {
            domain_register_agreement_url: [
              { required: true, message: `${lang.input}${lang.domain_agree_adress}`, type: 'error' },
              {
                pattern: /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/, message: lang.auth_tip7, type: 'warning'
              }
            ],
            domain_information_service_agreement_url: [
              { required: true, message: `${lang.input}${lang.domain_service_adress}`, type: 'error' },
              {
                pattern: /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/, message: lang.auth_tip7, type: 'warning'
              }
            ],
            phone: [
              { required: true, message: lang.input + lang.phone, type: 'error' },
              { pattern: /^\d{0,11}$/, message: lang.verify11, type: 'warning' }
            ],
            default_search_domain: [
              { required: true, message: `${lang.select}${lang.default_domain}`, type: 'error' },
            ],
            specify_search_domain: [
              { required: true, message: `${lang.select}${lang.appoint_domain}`, type: 'error' },
            ],
            number_limit: [
              { required: true, message: lang.verify7, type: 'error' },
              {
                pattern: /^[0-9]*$/, message: lang.verify7, type: 'warning'
              },
              {
                validator: val => val >= 0, message: lang.verify7, type: 'warning'
              }
            ],
          },
          submitLoading: false
        }
      },
      methods: {
        async onSubmit ({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.submitLoading = true
              const res = await saveDomainSetting(this.formData)
              this.$message.success(res.data.msg)
              this.getDomainConfig()
              this.submitLoading = false
            } catch (error) {
              this.submitLoading = false
              this.$message.error(error.data.msg)
            }
          } else {
            console.log('Errors: ', validateResult)
            this.$message.warning(firstError)
          }
        },
        async getDomainConfig () {
          try {
            const res = await getDomainSetting()
            this.formData = Object.assign(this.formData, res.data.data)
          } catch (error) {
            this.$message.error(error.data.msg)
          }
        },
        async getSuffixList () {
          try {
            const res = await getDomainSuffix()
            this.suffixList = res.data.data.list
          } catch (error) {
            this.$message.error(error.data.msg)
          }
        }
      },
      created () {
        this.getDomainConfig()
        this.getSuffixList()
      },
    }).$mount(template)
    typeof old_onload == 'function' && old_onload()
  }
})(window)

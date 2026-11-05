const template = document.getElementsByClassName("common_config")[0];
Vue.prototype.lang = Object.assign(window.lang, window.module_lang);
Vue.prototype.moment = window.moment;
new Vue({
  components: {
    comConfig,
  },
  data() {
    return {
      // 模块相关
      host: location.origin,
      id: "",
      client_id: "",
      configArr: [],
      isLoading: false,
      configForm: {},
      configRules: {
        disk: [
          {
            required: true,
            message: lang.input + lang.disk_space,
            type: "error",
          },
        ],
        flow: [
          {
            required: true,
            message: lang.input + lang.cloud_flow,
            type: "error",
          },
        ],
        email: [
          {
            required: true,
            message: lang.input + lang.da_email,
            type: "error",
          },
        ],
        domain_num: [
          {
            required: true,
            message: lang.input + lang.domain_num,
            type: "error",
          },
        ],
        sub_domain_num: [
          {
            required: true,
            message: lang.input + lang.sub_domain_num,
            type: "error",
          },
        ],
      },
      unitArr: [
        { value: "MB", label: "MB" },
        { value: "GB", label: "GB" },
        { value: "TB", label: "TB" },
      ],
      popupProps: {
        overlayInnerStyle: (trigger) => ({ width: `${trigger.offsetWidth}px` }),
      },
      popupPropsUnit: {
        overlayClassName: "unit-pup",
      },
    };
  },
  created() {
    const query = location.href.split("?")[1].split("&");
    this.client_id = this.getQuery(query[0]);
    this.id = this.getQuery(query[1]);
    this.getproModule();
  },
  methods: {
    getQuery(val) {
      return val.split("=")[1];
    },

    // 获取模块接口
    async getproModule() {
      try {
        const res = await getproModule(this.id);
        if (res.data.data.content) {
          this.getProductInfo();
        }
      } catch (error) {}
    },
    // 获取模块配置
    async getProductInfo() {
      try {
        const res = await getDaHostDetails({
          id: this.id,
        });
        const temp = res.data.data.detail;
        temp.disk = temp.disk * 1;
        temp.flow = temp.flow * 1;
        this.configForm = temp;
      } catch (error) {
        console.log(error);
      }
    },
    // 提交
    async submitConfig({ validateResult, firstError }) {
      if (validateResult === true) {
        try {
          this.isLoading = true;
          const params = JSON.parse(JSON.stringify(this.configForm));
          params.id = this.id;
          const res = await saveDaHostDetails(params);
          this.$message.success(res.data.msg);
          this.getProductInfo();
          this.isLoading = false;
        } catch (error) {
          this.isLoading = false;
          this.$message.error(error.data.msg);
        }
      } else {
        console.log("Errors: ", validateResult);
        this.$message.warning(firstError);
      }
    },
  },
}).$mount(template);

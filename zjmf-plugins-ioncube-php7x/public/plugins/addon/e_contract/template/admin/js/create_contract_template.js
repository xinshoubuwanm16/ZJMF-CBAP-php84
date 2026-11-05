(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("template-details")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = window.moment;
    const origin = location.origin;
    const host = origin + "/" + location.pathname.split("/")[1];
    new Vue({
      components: {
        comConfig,
        comTreeSelect,
        comTinymce
      },
      data() {
        return {
          id: "",
          delVisible: false,
          loading: false,
          typeRules: {
            name: [
              {
                required: true,
                message: `${lang.input}${lang.contract_template_name}`,
                type: "error",
              },
            ],
            status: [
              {
                required: true,
                message: `${lang.select}${lang.template_status}`,
                type: "error",
              },
            ],
            force_sign: [
              { required: true, message: lang.select, type: "error" },
            ],
            sign_day_out: [
              {
                required: true,
                message: `${lang.input}${lang.sign_day_out}`,
                type: "error",
              },
            ],
            timeout_act: [
              { required: true, message: lang.select, type: "error" },
            ],
            base_contract: [
              { required: true, message: lang.select, type: "error" },
            ],
            product_id: [
              {
                required: true,
                message: `${lang.select}${lang.product}`,
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
          },
          submitLoading: false,
          infoParams: {
            name: "",
            status: 0,
            force_sign: 0,
            sign_day_out: 1,
            timeout_act: "suspend",
            base_contract: 0,
            product_id: [],
            notes: "",
            detail: "",
          },
          // 图片上传相关
          uploadUrl: host + "/v1/upload",
          uploadHeaders: {
            Authorization: "Bearer" + " " + localStorage.getItem("backJwt"),
          },
          productList: [],
          treeProps: {
            keys: {
              label: "name",
              value: "key",
              children: "children",
            },
          },
          baseContract: false,
          hover: true,
          tableLayout: false,
          temArr: [],
          temColumns: [
            {
              colKey: "name",
              title: lang.vars_name,
              ellipsis: true,
            },
            {
              colKey: "var",
              title: lang.vars,
              ellipsis: true,
            },
          ],
        };
      },
      created() {
        this.id = location.href.split("?")[1]?.split("=")[1];
        if (this.id) {
          // 编辑时获取详情
          this.getTemplateInfo();
          // 是否存在基础合同
        }
        this.getTemVars();
        this.isExist();
      },
      methods: {
        choosePro (val) {
          this.infoParams.product_id = val
        },
        // 预览
        goView() {
          const contract_view = this.$refs.comTinymce.getContent();
          sessionStorage.setItem(
            "contract_view",
            JSON.stringify(contract_view)
          );
          // 新窗口打开 view.htm
          window.open("view.htm");
        },
        setContent() {
          this.infoParams.detail = this.$refs.comTinymce.getContent();
        },
        submit() {
          this.setContent();
          this.$refs.userDialog.validate().then(
            async (res) => {
              try {
                this.submitLoading = true;
                const type = this.id ? "update" : "add";
                const params = JSON.parse(JSON.stringify(this.infoParams));
                params.sign_day_out = params.sign_day_out || "";
                const res = await addAndUpdateContractTemplate(type, params);
                this.$message.success(res.data.msg);
                this.submitLoading = false;
                setTimeout(() => {
                  location.href = "contract_template.htm";
                }, 500);
              } catch (error) {
                this.submitLoading = false;
                this.$message.error(error.data.msg);
              }
            },
            (error) => {
              console.log(error);
            }
          );
        },
        back() {
          location.href = "contract_template.htm";
        },
        async getTemplateInfo() {
          try {
            const res = await getContractTemplateDetails({ id: this.id });
            Object.assign(this.infoParams, res.data.data);
            this.infoParams.sign_day_out = this.infoParams.sign_day_out * 1;
            this.$nextTick(() => {
              this.$refs.comTinymce.setContent(this.infoParams.detail);
            });
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        async isExist() {
          try {
            const res = await isExistBaseContract({ template_id: this.id });
            this.baseContract = res.data.data.base_contract ? true : false;
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        async getTemVars() {
          try {
            const res = await getTemplateVars();
            this.temArr = res.data.data.vars;
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

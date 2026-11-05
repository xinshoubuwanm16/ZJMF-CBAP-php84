(function (window, undefined) {
  var old_onload = window.onload;

  window.onload = function () {
    const template = document.getElementsByClassName("email_notice_admin")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);

    new Vue({
      components: {
        comConfig,
      },
      data() {
        return {
          loading: false,
          columns: [
            { colKey: "name_lang", title: lang.action_name },
            {
              colKey: "email_name",
              title: lang.email_interface,
              ellipsis: true,
            },
            {
              colKey: "email_template",
              title: lang.email_temp,
              ellipsis: true,
            },
            {
              colKey: "notify_personnel",
              title: lang.notify_personnel,
              ellipsis: true,
            },
            {
              colKey: "email_enable",
              title: lang.isOpen,
              width: 120,
            },
          ],
          data: [],
          emailList: [], // 邮件接口
          emailTemplateList: [], // 邮件模板列表
          formData: {},
          submitLoading: false,
          canSend: false,
          adminList: [],
          value: [],
          treeProps: {
            keys: {
              label: "nickname",
              value: "id",
              children: "children",
            },
          },
        };
      },
      methods: {
        async getAdminList() {
          try {
            const res = await getAdminList({
              page: 1,
              limit: 10000,
            });
            const temp = res.data.data.list;
            this.adminList = temp
              .reduce((all, cur) => {
                if (!all.includes(cur.roles)) {
                  all.push(cur.roles);
                }
                return all;
              }, [])
              .reduce((all, cur, index) => {
                all.push({
                  id: cur + index,
                  nickname: cur,
                  children: [...temp.filter((item) => item.roles === cur)],
                });
                return all;
              }, []);
          } catch (error) {}
        },
        async save() {
          try {
            const params = JSON.parse(JSON.stringify(this.formData));
            for (const item in params) {
              if (params[item].email_template === "") {
                params[item].email_template = 0;
              }
            }
            this.canSend = true;
            // 提交前验证，选择了接口的必填
            Object.keys(params).forEach((item) => {
              try {
                if (
                  params[item].email_name &&
                  params[item].email_template === 0
                ) {
                  // 选择了邮件未选择模板
                  this.canSend = false;
                  throw new Error(`${lang.select}${lang.email_temp}`);
                }
                // if (params[item].email_name && params[item].admin.length === 0) { // 选择了邮件未选管理员
                //   this.canSend = false
                //   throw new Error(lang.select + lang.notify_personnel)
                // }
              } catch (e) {
                this.$message.error(e.message);
              }
            });
            if (this.canSend) {
              const temp = Object.values(params);
              this.submitLoading = true;
              const res = await saveNoticeList({ list: temp });
              this.$message.success(res.data.msg);
              this.submitLoading = false;
            }
          } catch (error) {
            this.$message.error(error.data.msg);
            this.submitLoading = false;
          }
        },
        async getEmailList() {
          try {
            const res = await getEmailInterface();
            this.emailList = res.data.data.list;
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        async getEmailTemList() {
          try {
            const res = await getEmailTemplate();
            this.emailTemplateList = res.data.data.list;
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        // 获取列表
        async getManageList() {
          try {
            this.loading = true;
            const res = await getNoticeList();
            const temp = res.data.data.list.map((item) => {
              item.email_enable = item.email_enable || 0;
              item.email_name = item.email_name || "";
              item.email_template = item.email_template || "";
              item.admin = item.admin
                .filter((el) => el)
                .map((item) => item * 1);
              return item;
            });
            this.data = temp;
            this.loading = false;
            // 动态渲染成响应式数据会很卡
            temp.forEach((item) => {
              this.formData[item.name] = item;
            });
          } catch (error) {
            this.loading = false;
            console.log(error);
          }
        },
      },
      created() {
        this.getAdminList();
        this.getEmailList();
        this.getEmailTemList();
        this.getManageList();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

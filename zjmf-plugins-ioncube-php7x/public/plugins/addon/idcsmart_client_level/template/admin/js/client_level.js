(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("client-level")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    const host = location.origin;
    const fir = location.pathname.split("/")[1];
    const str = `${host}/${fir}/`;
    new Vue({
      components: {
        comConfig,
      },
      data() {
        let checkPwd2 = (val) => {
          if (val !== this.formData.password) {
            return {
              result: false,
              message: window.lang.password_tip,
              type: "error",
            };
          }
          return { result: true };
        };
        return {
          data: [],
          configData: {
            configuration_addon_idcsmart_client_level_home_show: 0,
          },
          tableLayout: false,
          bordered: true,
          visible: false,
          delVisible: false,
          statusVisble: false,
          hover: true,
          jumpUrl: str,
          columns: [
            {
              colKey: "id",
              title: lang.order_index,
              width: 100,
              sortType: "all",
              ellipsis: true,
              sorter: true,
            },
            {
              colKey: "name",
              title: lang.clinet_level,
              width: 300,
              ellipsis: true,
            },
            {
              colKey: "background_color",
              title: lang.representative_color,
              ellipsis: true,
            },
            {
              colKey: "client_num",
              title: lang.customer,
              ellipsis: true,
            },
            {
              colKey: "notes",
              title: lang.notes,
              ellipsis: true,
              width: 300,
            },
            {
              colKey: "op",
              title: lang.operation,
              width: 100,
            },
          ],
          hideSortTips: true,
          params: {
            keywords: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
          },
          total: 0,
          pageSizeOptions: [20, 50, 100],
          formData: {
            // 添加用户
            username: "",
            email: "",
            phone_code: 86,
            phone: "",
            password: "",
            repassword: "",
          },
          rules: {
            username: [
              {
                required: true,
                message: lang.input + lang.name,
                type: "error",
              },
            ],
            password: [
              {
                required: true,
                message: lang.input + lang.password,
                type: "error",
              },
              {
                pattern: /^[\w@!#$%^&*()+-_]{6,32}$/,
                message: lang.verify8 + "6~32" + "，" + lang.verify14,
                type: "warning",
              },
            ],
            repassword: [
              {
                required: true,
                message: lang.input + lang.surePassword,
                type: "error",
              },
              { validator: checkPwd2, trigger: "blur" },
            ],
          },
          loading: false,
          country: [],
          delId: "",
          curStatus: 1,
          statusTip: "",
          maxHeight: "",
          crumbOptions: [],
          submitLoading: false,
          authList: JSON.parse(
            JSON.stringify(localStorage.getItem("backAuth"))
          ),
        };
      },
      mounted() {
        this.maxHeight = document.getElementById("content").clientHeight - 180;
        let timer = null;
        window.onresize = () => {
          if (timer) {
            return;
          }
          timer = setTimeout(() => {
            this.maxHeight =
              document.getElementById("content").clientHeight - 180;
            clearTimeout(timer);
            timer = null;
          }, 300);
        };
      },
      created() {
        this.getLevel();
        this.getLevelConfig();
      },
      methods: {
        getLevelConfig() {
          apiConfiInfo().then((res) => {
            this.configData.configuration_addon_idcsmart_client_level_home_show =
              res.data.data.configuration_addon_idcsmart_client_level_home_show;
          });
        },
        uodateConfig() {
          apiSaveConfig({
            configuration_addon_idcsmart_client_level_home_show:
              this.configData
                .configuration_addon_idcsmart_client_level_home_show,
          })
            .then((res) => {
              this.$message.success(res.data.msg);
              this.getLevelConfig();
            })
            .catch((err) => {
              this.$message.error(err.data.msg);
            });
        },
        // 获取列表
        async getLevel() {
          try {
            this.loading = true;
            const res = await getLevelList(this.params);
            this.loading = false;
            this.data = res.data.data.list;
            this.total = res.data.data.count;
          } catch (error) {
            this.loading = false;
            this.$message.error(error.data.msg);
          }
        },
        // 获取已激活插件
        getActive_plugin() {
          active_plugin().then((res) => {
            const arr = res.data.data.list.map((item) => {
              return item.name;
            });
            if (arr.includes("BaiduCloud")) {
              this.columns.splice(4, 0, {
                colKey: "baidu_cloud_discount",
                title: lang.baidu_price_num,
              });
              this.columns.splice(5, 0, {
                colKey: "discount",
                title: lang.baidu_total,
              });
            }
          });
        },
        // 切换分页
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.params.keywords = "";
          this.getLevel();
        },
        // 排序
        sortChange(val) {
          if (!val) {
            this.params.orderby = "id";
            this.params.sort = "desc";
          } else {
            this.params.orderby = val.sortBy;
            this.params.sort = val.descending ? "desc" : "asc";
          }
          this.getLevel();
        },
        clearKey() {
          this.params.keywords = "";
          this.seacrh();
        },
        seacrh() {
          this.params.page = 1;
          this.getLevel();
        },
        close() {
          this.visible = false;
          this.$refs.userDialog.reset();
        },
        // 添加用户等级
        addLevel() {
          location.href = `add_client_level.htm`;
        },
        updateLevel(row) {
          location.href = `add_client_level.htm?id=${row.id}`;
        },
        // 删除用户
        deleteLevel(row) {
          this.delVisible = true;
          this.delId = row.id;
        },
        async sureDel() {
          try {
            this.submitLoading = true;
            const res = await delLevel(this.delId);
            this.params.page =
              this.data.length > 1 ? this.params.page : this.params.page - 1;
            this.delVisible = false;
            this.getLevel();
            this.submitLoading = false;
            this.$message.success(res.data.msg);
          } catch (error) {
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.error(error.data.msg);
          }
        },
        cancelDel() {
          this.delVisible = false;
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

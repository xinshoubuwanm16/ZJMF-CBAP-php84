(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("contract_template")[0];
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
          imgUrl: url,
          baseUrl: str,
          hover: true,
          tableLayout: false,
          delVisible: false,
          loading: false,
          list: [],
          typeColumns: [
            {
              colKey: "id",
              title: "ID",
              ellipsis: true,
              width: 100,
            },
            {
              colKey: "name",
              title: `${lang.contract}${lang.nickname}`,
              ellipsis: true,
              width: 150,
            },
            {
              colKey: "product",
              title: lang.order_hosts,
              ellipsis: true,
              width: 500,
            },
            {
              colKey: "force_sign",
              title: lang.is_force_sign,
              ellipsis: true,
              width: 150,
            },
            {
              colKey: "status",
              title: `${lang.contract}${lang.status}`,
              ellipsis: true,
              width: 100,
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
          params: {
            keywords: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
            status: "",
            force_sign: "",
          },
          total: 0,
          pageSizeOptions: [20, 50, 100],
          curId: "",
          confirmTitle: "",
          optType: "", // del copy
          submitLoading: false
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
        copyTem(row) {
          this.curId = row.id;
          this.optType = "copy";
          this.delVisible = true;
          this.confirmTitle = `${lang.confirm}${lang.copy}？`;
        },
        clearSearch() {
          this.params.keywords = "";
          this.seacrh();
        },
        createTemplate() {
          location.href = "create_contract_template.htm";
        },
        updateItem(row) {
          location.href = `create_contract_template.htm?id=${row.id}`;
        },
        delteItem(row) {
          this.optType = "del";
          this.delVisible = true;
          this.curId = row.id;
          this.confirmTitle = lang.sureDelete;
        },
        async sureDelete() {
          try {
            this.submitLoading = true
            if (this.optType === "del") {
              const res = await delContractTemplate({ id: this.curId });
              this.$message.success(res.data.msg);
              this.delVisible = false;
              this.getTemplateList();
              this.submitLoading = false
            } else if (this.optType === "copy") {
              const res = await copyTemplate({ id: this.curId });
              this.$message.success(res.data.msg);
              this.delVisible = false;
              this.getTemplateList();
              this.submitLoading = false
            }
          } catch (error) {
            this.submitLoading = false
            this.delVisible = false;
            this.$message.error(error.data.msg);
          }
        },
        async changeStatus(item) {
          try {
            const type = item.status ? "disable" : "enable";
            const res = await changeTemplate(type, { id: item.id });
            this.$message.success(res.data.msg);
            this.getTemplateList();
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        async getTemplateList() {
          try {
            this.loading = true;
            const res = await getContractTemplate(this.params);
            this.list = res.data.data.list;
            this.total = res.data.data.count;
            this.loading = false;
          } catch (error) {
            this.loading = false;
            console.log(error);
            this.$message.error(error.data.msg);
          }
        },
        // 切换分页
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.getTemplateList();
        },
        clearKey() {
          this.params.keywords = "";
          this.seacrh();
        },
        seacrh() {
          this.params.page = 1;
          this.getTemplateList();
        },
      },
      created() {
        this.getTemplateList();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

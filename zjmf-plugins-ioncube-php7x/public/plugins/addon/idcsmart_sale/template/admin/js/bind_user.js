(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("admin")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    const host = location.origin;
    const fir = location.pathname.split("/")[1];
    const str = `${host}/${fir}/`;
    new Vue({
      components: {
        comConfig,
        comChooseUser,
      },
      data() {
        return {
          data: [],
          tableLayout: false,
          bordered: true,
          visible: false,
          delVisible: false,
          hover: true,
          listLoading: false,
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          currency_suffix:
            JSON.parse(localStorage.getItem("common_set")).currency_suffix ||
            "元",
          columns: [
            {
              colKey: "id",
              title: "ID",
              width: 90,
            },
            {
              colKey: "username",
              title: lang.sale_text10,
              width: 200,
              cell: "username",
              ellipsis: true,
            },
            {
              colKey: "name",
              title: lang.sale_text11,
              width: 180,
              ellipsis: true,
            },
            {
              colKey: "sale_number",
              title: lang.sale_text12,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "create_time",
              title: lang.sale_text13,
              width: 150,
              cell: "create_time",
              ellipsis: true,
            },
            {
              colKey: "op",
              title: lang.operation,
              width: 130,
              ellipsis: true,
            },
          ],
          params: {
            keywords: "",
            page: 1,
            limit: 20,
          },
          sale_list: [],
          bind_list: [],
          client_list: [],
          select_list: [],
          total: 0,
          pageSizeOptions: [20, 50, 100],
          formData: {
            // 添加销售
            client_id: "",
            sale_id: "",
          },
          rules: {
            client_id: [
              {
                required: true,
                message: lang.please_search_order_user,
              },
            ],
            sale_id: [
              { required: true, message: lang.sale_text14,},
            ],
          },
          loading: false,
          delId: "",
          addTip: "",
          maxHeight: "",
          noBindParams: {
            keywords: "",
            page: 1,
            limit: 100,
            count: 0,
          },
          submitLoading: false,
        };
      },
      methods: {
        changeUser(val) {
          this.formData.client_id = val;
        },
        // 获取已绑定用户列表
        async getClientSaleList() {
          try {
            this.loading = true;
            const res = await saleClientList(this.params);
            this.bind_list = res.data.data.list.map((item) => {
              return {
                id: item.client_id,
                company: item.company,
                username: item.username,
              };
            });
            this.data = res.data.data.list;
            this.total = res.data.data.count;
            this.loading = false;
          } catch (error) {
            this.loading = false;
          }
        },
        // 获取可绑定用户列表
        async getNoBindClientList() {
          const { data } = await noBindClientList(this.noBindParams);
          this.noBindParams.count = data.data.count;
          this.select_list = this.select_list.concat(...data.data.list);
          this.listLoading = false;
        },
        remoteMethod(search) {
          this.listLoading = true;
          this.formData.client_id = "";
          this.select_list = [];
          this.noBindParams.keywords = search;
          this.noBindParams.page = 1;
          this.getNoBindClientList();
        },
        goUserDetail(row) {
          location.href = str + `client_detail.htm?client_id=${row.client_id}`;
        },
        // 获取销售列表
        async getSaleList() {
          try {
            const res = await saleList(this.params);
            this.sale_list = res.data.data.list.filter((item) => {
              return item.status === 1;
            });
          } catch (error) {}
        },
        formatDateAdd0(m) {
          return m < 10 ? "0" + m : m;
        },
        // 时间格式转换
        formatDate(dateStr) {
          if (dateStr === 0 || !dateStr) {
            return "--";
          } else {
            const date = new Date(dateStr * 1000);
            const str1 = [
              date.getFullYear(),
              date.getMonth() + 1,
              date.getDate(),
            ].join("-");
            const str2 = [
              this.formatDateAdd0(date.getHours()),
              this.formatDateAdd0(date.getMinutes()),
            ].join(":");
            return str1 + " " + str2;
          }
        },
        // 切换分页
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.getClientSaleList();
        },
        clearKey() {
          this.params.keywords = "";
          this.seacrh();
        },
        seacrh() {
          this.params.page = 1;
          this.getClientSaleList();
        },
        close() {
          this.visible = false;
          this.$nextTick(() => {
            this.$refs.userDialog && this.$refs.userDialog.reset();
          });
        },
        filterMethod() {
          return true;
        },
        handleScrollToBottom({ e }) {
          const { scrollTop, clientHeight, scrollHeight } = e.target;
          if (scrollHeight - scrollTop === clientHeight) {
            if (this.noBindParams.count > this.select_list.length) {
              this.noBindParams.page++;
              this.getNoBindClientList();
            }
          }
        },
        // 添加管理员
        handelAddSale() {
          this.noBindParams.page = 1;
          this.noBindParams.keywords = "";
          this.select_list = [];
          // this.getNoBindClientList();
          this.addTip = lang.sale_text15;
          this.visible = true;
          this.formData.client_id = ""
          this.formData.sale_id = ""
        },
        // 新增销售
        async onSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              const params = { ...this.formData };
              let res = {};
              this.submitLoading = true;
              if (this.addTip === lang.sale_text15) {
                res = await addClientSale(params);
              }
              if (this.addTip === lang.sale_text16) {
                res = await editClientSale(params);
              }
              this.$message.success(res.data.msg);
              this.getClientSaleList();
              this.visible = false;
              this.$refs.userDialog.reset();
              this.submitLoading = false;
            } catch (error) {
              this.submitLoading = false;
              this.$message.error(error.data.msg);
            }
          } else {
            this.$message.warning(firstError);
          }
        },
        // 编辑管理员
        updateAdmin(row) {
          this.select_list = [...this.bind_list];
          this.$refs.userDialog && this.$refs.userDialog.reset();
          this.addTip = lang.sale_text16;
          this.formData.client_id = row.client_id;
          this.formData.sale_id = row.sale_id;
          this.visible = true;
        },
        // 删除销售
        deleteUser(row) {
          this.delVisible = true;
          this.delId = row.client_id;
        },
        // 删除销售
        async sureDel() {
          try {
            this.submitLoading = true;
            const res = await deleteClientSale(this.delId);
            this.$message.success(res.data.msg);
            this.params.page =
              this.data.length > 1 ? this.params.page : this.params.page - 1;
            this.delVisible = false;
            this.getClientSaleList();
            this.submitLoading = false;
          } catch (error) {
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.error(error.data.msg);
          }
        },
      },
      created() {
        this.getClientSaleList();
        this.getSaleList();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

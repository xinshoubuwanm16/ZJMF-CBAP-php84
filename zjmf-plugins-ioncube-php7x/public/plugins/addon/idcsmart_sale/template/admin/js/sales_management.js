(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("admin")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        comConfig,
      },
      data() {
        return {
          data: [],
          tableLayout: false,
          bordered: true,
          visible: false,
          delVisible: false,
          statusVisble: false,
          hover: true,
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
              colKey: "admin_name",
              title: lang.sale_text116,
              ellipsis: true,
            },
            {
              colKey: "name",
              title: lang.sale_text117,
              ellipsis: true,
            },
            {
              colKey: "sale_number",
              title: lang.sale_text118,
              ellipsis: true,
            },
            {
              colKey: "op",
              fixed: "right",
              title: lang.operation,
              width: 120,
            },
          ],
          params: {
            keywords: "",
            page: 1,
            limit: 20,
          },
          admin_list: [],
          select_admin_list: [],
          total: 0,
          pageSizeOptions: [20, 50, 100],
          formData: {
            // 添加销售
            admin_id: "",
            name: "",
            sale_number: "",
            email: "",
            // telegram: '',
            skype: "",
            url: "",
            // telegram_id: ''
          },
          rules: {
            admin_id: [
              { required: true, message: lang.sale_text119, trigger: "blur" },
            ],
            name: [
              { required: true, message: lang.sale_text120, trigger: "blur" },
            ],
            sale_number: [
              { required: true, message: lang.sale_text121, trigger: "blur" },
              { pattern: /^\d+$/, message: lang.sale_text122 },
            ],
            email: [
              { required: false },
              {
                pattern:
                  /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@(([0-9a-zA-Z])+([-\w]*[0-9a-zA-Z])*\.)+[a-zA-Z]{1,9})$/,
                message: lang.email_tip,
                type: "warning",
              },
            ],
          },
          loading: false,
          country: [],
          delId: "",
          curStatus: 1,
          statusTip: "",
          addTip: "",
          use_admin_list: [],
          submitLoading: false,
        };
      },
      methods: {
        // 获取列表
        async getSaleList() {
          try {
            this.loading = true;
            const res = await saleList(this.params);
            this.loading = false;
            this.data = res.data.data.list;
            this.use_admin_list = this.data.map((item) => {
              return item.admin_id;
            });
            this.total = res.data.data.count;
          } catch (error) {
            this.loading = false;
          }
        },
        // 切换分页
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.getSaleList();
        },
        clearKey() {
          this.params.keywords = "";
          this.seacrh();
        },
        seacrh() {
          this.params.page = 1;
          this.getSaleList();
        },
        close() {
          this.visible = false;
          this.$nextTick(() => {
            this.$refs.userDialog && this.$refs.userDialog.reset();
          });
        },
        // 添加管理员
        handelAddSale() {
          this.selectAdminList();
          this.addTip = lang.sale_text123;
          this.visible = true;
        },
        // 选择管理员数据处理函数
        selectAdminList() {
          this.select_admin_list = [];
          this.admin_list.forEach((item) => {
            if (!this.use_admin_list.includes(item.id)) {
              this.select_admin_list.push(item);
            }
          });
        },
        // 获取人员数据
        getAdminList() {
          adminList({ page: 1, limit: 10000 })
            .then((result) => {
              this.admin_list = result.data.data.list;
            })
            .catch();
        },
        // 新增销售
        async onSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              const params = { ...this.formData };
              let res = {};
              this.submitLoading = true;
              if (this.addTip === lang.sale_text123) {
                res = await addSale(params);
              }
              if (this.addTip === lang.sale_text124) {
                res = await editSale(params);
              }
              this.$message.success(res.data.msg);
              this.getSaleList();
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
          this.addTip = lang.sale_text124;
          this.formData = { ...row };
          this.selectAdminList();
          this.select_admin_list.push({
            id: row.admin_id,
            name: row.admin_name,
          });
          this.visible = true;
          this.$refs.userDialog.reset();
        },
        async getAdminDetail(id) {
          try {
            const res = await getAdminDetail(id);
            Object.assign(this.formData, res.data.data.admin);
          } catch (error) {}
        },
        // 停用/启用
        changeStatus(row) {
          this.delId = row.id;
          this.curStatus = row.status;
          this.statusTip = this.curStatus
            ? window.lang.sureDisable
            : window.lang.sure_Open;
          this.statusVisble = true;
        },
        async sureChange() {
          try {
            let res = {};
            this.submitLoading = true
            if (this.curStatus === 1) {
              res = await disableSale(this.delId);
            }
            if (this.curStatus === 0) {
              res = await enableSale(this.delId);
            }
            this.$message.success(res.data.msg);
            this.statusVisble = false;
            this.getSaleList();
            this.submitLoading = false;
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
            this.statusVisble = false;
          }
        },
        closeDialog() {
          this.statusVisble = false;
        },
        // 删除销售
        deleteUser(row) {
          this.delVisible = true;
          this.delId = row.id;
        },
        // 删除销售
        async sureDel() {
          try {
            this.submitLoading = true;
            const res = await deleteSale(this.delId);
            this.$message.success(res.data.msg);
            this.params.page =
              this.data.length > 1 ? this.params.page : this.params.page - 1;
            this.delVisible = false;
            this.getSaleList();
            this.submitLoading = false;
          } catch (error) {
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.error(error.data.msg);
          }
        },
        // 获取国家列表
        async getCountry() {
          try {
            const res = await getCountry();
            this.country = res.data.data.list;
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
      },
      created() {
        this.getSaleList();
        this.getAdminList();
        this.getCountry();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

(function (window, undefined) {
  var old_onload = window.onload;
  function getToDay() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    return new Date(year + "-" + month + "-" + day).getTime();
  }
  window.onload = function () {
    const template = document.getElementsByClassName("template")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    const host = location.origin;
    const fir = location.pathname.split("/")[1];
    const str = `${host}/${fir}/`;
    new Vue({
      components: {
        comConfig,
        comTinymce,
      },
      data() {
        return {
          delId: null,
          delVisible: false,
          editVisible: false,
          dataLoading: false,
          departmentList: [],
          params: {
            page: 1,
            limit: 20,
          },
          dataList: [],
          total: 0,
          // 时间为昨天
          nowTime: new Date(getToDay()),
          presets: {
            [lang.order_text92]: [
              new Date(getToDay()),
              new Date(getToDay() + 86400000),
            ],
            [lang.order_text90]: [
              new Date(getToDay() + 86400000 * 6),
              new Date(),
            ],
            [lang.order_text91]: [
              new Date(getToDay() + 86400000 * 2),
              new Date(),
            ],
            [lang.order_text93]: [
              new Date(getToDay() + 86400000 * 30),
              new Date(),
            ],
          },
          treeProps: {
            valueMode: "onlyLeaf",
          },
          pageSizeOptions: [10, 20, 50, 100],
          formData: {
            id: null,
            title: "",
            cycle_period: undefined,
            unit: "", //周期类型(day=天,month=自然月,year=年)
            start_time: "",
            end_time: "",
            trigger_time: "",
            type_id: "",
            admin_id: "",
            content: "",
          },
          rules: {
            title: [{ required: true, message: lang.order_text146 }],
            unit: [{ required: true, message: lang.order_text155 }],
            start_time: [{ required: true, message: lang.order_text148 }],
            trigger_time: [{ required: true, message: lang.order_text157 }],
            type_id: [{ required: true, message: lang.order_text150 }],
          },
          typeOption: [
            {
              label: lang.order_text143,
              value: "day",
            },
            {
              label: lang.order_text144,
              value: "month",
            },
            {
              label: lang.order_text145,
              value: "year",
            },
          ],
          cycleObj: {
            day: lang.order_text143,
            month: lang.order_text144,
            year: lang.order_text145,
            oneTime: lang.order_text158,
          },
          adminList: [],
          timeData: "",
          range: [],
          columns: [
            {
              colKey: "id",
              title: "ID",
              cell: "id",
              width: "90",
            },
            {
              colKey: "title",
              title: lang.order_text146,
              cell: "title",
              minWidth: "200",
              ellipsis: true,
            },
            {
              colKey: "cycle_period",
              title: lang.order_text147,
              cell: "cycle_period",
              width: "100",
              ellipsis: true,
            },
            {
              colKey: "start_time",
              title: lang.order_text148,
              cell: "start_time",
              width: "320",
              ellipsis: true,
              align: "center",
            },
            {
              colKey: "next_create_time",
              title: lang.order_text149,
              cell: "next_create_time",
              width: "180",
              ellipsis: true,
              align: "center",
            },
            {
              colKey: "department_name",
              title: lang.order_text150,
              cell: "department_name",
              width: "180",
              ellipsis: true,
            },
            {
              colKey: "admin_name",
              title: lang.order_text151,
              cell: "admin_name",
              width: "120",
              ellipsis: true,
            },
            {
              colKey: "create_admin_name",
              title: lang.order_text152,
              cell: "create_admin_name",
              width: "120",
              ellipsis: true,
            },
            {
              colKey: "status",
              title: lang.order_text153,
              cell: "status",
              width: "100",
              ellipsis: true,
            },
            {
              colKey: "op",
              title: lang.order_text67,
              cell: "op",
              width: "90",
              align: "center",
            },
          ],
          submitLoading: false,
          delLoading: false,
        };
      },
      computed: {
        calcAdminList() {
          let arr = [];
          this.departmentList.forEach((item) => {
            item.children.forEach((is) => {
              if (is.id === this.formData.type_id) {
                arr = item.admin;
              }
            });
          });
          return arr;
        },
      },
      filters: {
        // 时间格式转换   2019-08-08
        formatDate(dateStr) {
          if (!dateStr || dateStr == 0) {
            return "--";
          }
          const dateAdd0 = (m) => {
            return m < 10 ? "0" + m : m;
          };
          const date = new Date(dateStr * 1000);
          const str1 = [
            date.getFullYear(),
            dateAdd0(date.getMonth() + 1),
            dateAdd0(date.getDate()),
          ].join("-");
          const str2 = [
            dateAdd0(date.getHours()),
            dateAdd0(date.getMinutes()),
            dateAdd0(date.getSeconds()),
          ].join(":");
          return str1;
        },
        formatTime(dateStr) {
          if (!dateStr || dateStr == 0) {
            return "--";
          }
          const dateAdd0 = (m) => {
            return m < 10 ? "0" + m : m;
          };
          const date = new Date(dateStr * 1000);
          const str1 = [
            date.getFullYear(),
            dateAdd0(date.getMonth() + 1),
            dateAdd0(date.getDate()),
          ].join("-");
          const str2 = [
            dateAdd0(date.getHours()),
            dateAdd0(date.getMinutes()),
            dateAdd0(date.getSeconds()),
          ].join(":");
          return str1 + " " + str2;
        },
      },
      created() {
        this.getCronData();
        this.getTicketDepartment();
        // this.initAdminList();
      },
      mounted() {},
      watch: {
        range(val) {
          if (val && val.length > 0) {
            this.formData.start_time = Number(val[0] / 1000).toFixed(0) * 1;
            this.formData.end_time = Number(val[1] / 1000).toFixed(0) * 1;
          } else {
            this.formData.start_time = "";
            this.formData.end_time = "";
          }
        },
      },
      methods: {
        // 获取人员数据
        initAdminList() {
          getAdminList({ page: 1, limit: 10000 })
            .then((result) => {
              this.adminList = result.data.data.list;
            })
            .catch((err) => {
              this.$message.error(err.msg);
            });
        },
        onChange(row) {
          ticketCronStatus({ id: row.id, status: row.status })
            .then((res) => {
              this.$message.success(res.data.msg);
              this.getCronData();
            })
            .catch((err) => {
              this.$message.error(err.msg);
            });
        },
        // 工单部门列表
        getTicketDepartment() {
          this.adminList = [];
          const arr = [];
          ticketDepartment().then((res) => {
            this.departmentList = res.data.data.list.map((item) => {
              item.label = item.name;
              item.value = "f-" + item.id;
              item.admin.forEach((is) => {
                if (!arr.includes(is.id)) {
                  arr.push(is.id);
                  this.adminList.push(is);
                }
              });
              item.children = item.type.map((i) => {
                i.label = i.name;
                i.value = i.id;
                return i;
              });
              return item;
            });
          });
        },
        getCronData() {
          this.dataLoading = true;
          ticketCronList(this.params)
            .then((res) => {
              this.dataList = res.data.data.list;
              this.total = res.data.data.count;
              this.dataLoading = false;
            })
            .catch((err) => {
              this.dataLoading = false;
              this.$message.error(err.msg);
            });
        },
        // 工单-列表-切换分页
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.getCronData();
        },
        formSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            this.submitLoading = true;
            const subApi = this.formData.id ? ticketCronEdit : ticketCronAdd;
            this.formData.content = this.$refs.comTinymce.getContent();
            subApi(this.formData)
              .then((res) => {
                this.submitLoading = false;
                this.editDiaClose();
                this.$message.success(res.data.msg);
                this.getCronData();
              })
              .catch((err) => {
                this.submitLoading = false;
                this.$message.error(err.data.msg);
              });
          } else {
            this.$message.warning(firstError);
          }
        },
        adminChange(val) {
          this.formData.admin_id = "";
        },
        editDiaClose() {
          this.formData.id = null;
          this.formData.title = "";
          this.formData.cycle_period = undefined;
          this.formData.unit = "";
          this.formData.trigger_time = "";
          this.formData.type_id = "";
          this.formData.admin_id = "";
          this.formData.content = "";
          if (this.$refs.comTinymce) {
            this.$nextTick(() => {
              this.$refs.comTinymce.setContent(this.formData.content);
            });
          }
          this.range = [];
          this.editVisible = false;
        },
        handelAdd() {
          this.editDiaClose();
          this.editVisible = true;
          this.$nextTick(() => {
            this.$refs.comTinymce.setContent(this.formData.content);
          });
        },
        handelEdit(row) {
          ticketCronDetail(row.id)
            .then((res) => {
              this.formData = Object.assign(this.formData, res.data.data);
              this.editVisible = true;
              if (this.formData.admin_id === 0) {
                this.formData.admin_id = "";
              }
              this.range = [
                this.formData.start_time * 1000,
                this.formData.end_time * 1000,
              ];
              this.$nextTick(() => {
                this.$refs.comTinymce.setContent(this.formData.content);
              });
            })
            .catch((err) => {
              this.$message.error(err.msg);
            });
        },

        handelDel(id) {
          this.delId = id;
          this.delVisible = true;
        },

        // 删除
        handelDelete() {
          this.delLoading = true;
          ticketCronDelete(this.delId)
            .then((res) => {
              this.$message.success(res.data.msg);
              this.getCronData();
              this.delVisible = false;
              this.delId = null;
              this.delLoading = false;
            })
            .catch((err) => {
              this.delLoading = false;
              this.$message.error(err.data.msg);
            });
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

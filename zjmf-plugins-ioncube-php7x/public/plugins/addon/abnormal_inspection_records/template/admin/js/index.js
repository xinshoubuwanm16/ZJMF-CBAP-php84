(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("admin")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = window.moment;
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
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          currency_suffix:
            JSON.parse(localStorage.getItem("common_set")).currency_suffix ||
            "元",
          params: {
            start_time: "",
            end_time: "",
            keywords: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
          },
          uploadHeaders: {
            Authorization: "Bearer" + " " + localStorage.getItem("backJwt"),
          },
          dataTime: [],
          pageSizeOptions: [20, 50, 100],
          total: 0,
          tableList: [],
          columns: [
            {
              width: 80,
              colKey: "id",
              title: "ID",
            },
            {
              width: 150,
              cell: "user_name",
              title: lang.abnormal_text4,
              ellipsis: true,
            },
            {
              width: 150,
              cell: "phone",
              title: lang.abnormal_text5,
              ellipsis: true,
            },
            {
              width: 80,
              cell: "order_id",
              title: lang.abnormal_text6,
            },
            {
              width: 130,
              cell: "pay_time",
              title: lang.abnormal_text7,
              ellipsis: true,
            },
            {
              width: 120,
              colKey: "ip",
              title: lang.abnormal_text8,
              ellipsis: true,
            },
            {
              width: 150,
              colKey: "matter",
              title: lang.abnormal_text9,
              ellipsis: true,
            },
            {
              width: 120,
              colKey: "measure",
              title: lang.abnormal_text10,
              ellipsis: true,
            },
            {
              width: 130,
              cell: "process_time",
              title: lang.abnormal_text11,
              ellipsis: true,
            },
            {
              width: 100,
              cell: "admin_name",
              title: lang.abnormal_text12,
              ellipsis: true,
            },
            {
              colKey: "op",
              width: 120,
              cell: "op",
              align: "center",
              title: lang.operation,
            },
          ],
          loading: false,
          delId: null,
          delVisible: false,
          editId: null,
          addVisible: false,
          searchLoading: false,
          formData: {
            id: "",
            client_id: "",
            host_id: "",
            ip: "",
            measure: "",
            process_time: "",
            matter: "",
            img: [],
          },
          addRules: {
            client_id: [
              {
                required: true,
                message: `${lang.select}${lang.abnormal_text15}`,
                type: "error",
              },
            ],
            host_id: [
              {
                required: true,
                message: `${lang.select}${lang.abnormal_text16}`,
                type: "error",
              },
            ],
            ip: [
              {
                required: true,
                message: `${lang.input}${lang.abnormal_text8}`,
                type: "error",
              },
              {
                pattern: /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/,
                message: lang.abnormal_text20,
                type: "error",
              },
            ],
            measure: [
              {
                required: true,
                message: `${lang.input}${lang.abnormal_text10}`,
                type: "error",
              },
            ],
            process_time: [
              {
                required: true,
                message: `${lang.select}${lang.abnormal_text11}`,
                type: "error",
              },
            ],
            matter: [
              {
                required: true,
                message: `${lang.input}${lang.abnormal_text9}`,
                type: "error",
              },
            ],
          },
          userParams: {
            keywords: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
          },
          userTotal: 0,
          userForm: {
            page: 1,
            limit: 20,
            keywords: "",
          },
          uploadUrl: `${host}/${fir}/v1/upload`,
          clientList: [],
          // 关联产品下拉框数据
          hostOptions: [],
          popupProps: {
            overlayInnerStyle: (trigger) => ({
              width: `${trigger.offsetWidth}px`,
              "max-height": "362px",
            }),
          },
          loop_img: [],
          process_time: "",
          subLoading: false,
          detailVisible: false,
          detailInfo: {},
          preImg: "",
          viewer: null,
          downLoading: false,
        };
      },
      created() {
        this.getList();
      },
      methods: {
        changeUser(val) {
          this.formData.client_id = val;
          this.clientChange(val);
        },
        goclient_detail(row) {
          location.href = str + `client_detail.htm?client_id=${row.client_id}`;
        },
        goOrder(id) {
          window.open(str + `order_details.htm?client_id=${id}`);
        },
        filterMethod() {
          return true;
        },
        clientChange(val) {
          // 清除已选产品数据
          this.formData.host_id = "";
          getHost({ client_id: val, page: 1, limit: 10000 }).then((result) => {
            result.data.data.list.forEach((item) => {
              item.showName = item.product_name + "(" + item.name + ")";
            });
            this.hostOptions = result.data.data.list;
          });
        },
        detailDiaClose() {
          this.detailInfo = {};
          this.detailVisible = false;
        },
        changeLoopFile(res) {
          res.response.forEach((item) => {
            this.formData.img.push(item.save_name);
          });
        },
        formatResponse(res) {
          if (res.data?.save_name) {
            return {
              save_name: res.data?.save_name,
              url: res.data?.image_url,
            };
          }
          this.$message.error(res.msg);
          this.loop_img = [];
          console.log(res);
          return { error: res.msg, url: res.url };
        },
        removeLoopFile(e) {
          this.formData.img = this.loop_img.map((item) => {
            return (item.response && item.response.save_name) || item.name;
          });
        },

        seacrh() {
          this.params.page = 1;
          this.getCycleOrderList();
        },
        addSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            this.subLoading = true;
            const subApi = this.editId ? editAbnormal : addAbnormal;
            subApi(this.formData)
              .then((res) => {
                this.$message.success(res.data.msg);
                this.addDiaClose();
                this.getList();
                this.subLoading = false;
              })
              .catch((err) => {
                this.$message.error(err.data.msg);
                this.subLoading = false;
              });
          }
        },
        handEdit(row) {
          this.editId = row.id;
          this.formData = Object.assign({}, row);
          this.formData.img = row.img.map((item) => {
            return item.name;
          });
          this.process_time = row.process_time * 1000;
          this.loop_img = row.img.map((item) => {
            return {
              url: item.url,
              name: item.name,
            };
          });
          this.addVisible = true;
        },
        handAdd() {
          this.editId = null;
          this.addVisible = true;
        },
        handDetail(row) {
          row.img = row.img.map((item) => {
            item.mainImage = item.url;
            return item;
          });
          this.detailInfo = row;
          this.detailVisible = true;
        },
        addDiaClose() {
          this.$refs.addForm.reset();
          this.editId = null;
          this.loop_img = [];
          this.hostOptions = [];
          this.process_time = "";
          this.addVisible = false;
        },
        // 搜索框 搜索
        seacrh() {
          this.params.page = 1;
          this.getList();
        },
        // 获取列表
        getList() {
          this.loading = true;
          abnormalList(this.params).then((res) => {
            this.loading = false;
            this.tableList = res.data.data.list;
            this.total = res.data.data.count;
          });
        },
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.getList();
        },
        onChange(value, context) {
          const arr = context.dayjsValue.map((d) => d.valueOf());
          if (arr.length != 0) {
            this.params.start_time = arr[0] / 1000;
            this.params.end_time = arr[1] / 1000 + 86399;
          } else {
            this.params.start_time = "";
            this.params.end_time = "";
          }
        },
        onTimeChange(value, context) {
          this.formData.process_time = context.dayjsValue.valueOf() / 1000;
        },

        dowloadFile() {
          this.downLoading = true;
          // 导出excel
          exportAbnormal()
            .then((result) => {
              const blob = result.data;
              //创建标签
              const link = document.createElement("a");
              link.style.display = "none";
              //设置标签href属性为文件路径
              link.href = URL.createObjectURL(blob);
              //截取文件名
              const fileName = decodeURI(
                result.headers["content-disposition"].split("=")[1]
              );
              //设置下载文件名
              link.download = fileName;
              document.body.appendChild(link);
              this.downLoading = false;
              //点击触发下载
              link.click();
              this.$message.success(lang.abnormal_text34);
              //移除标签
              document.body.removeChild(link);
              // 释放掉blob对象
              URL.revokeObjectURL(blob);
            })
            .catch((err) => {
              this.downLoading = false;
              this.$message.error(err.data.msg);
            });
        },
        deletes(id) {
          this.delId = id;
          this.delVisible = true;
        },
        sureDelUser() {
          delAbnormal(this.delId)
            .then((res) => {
              this.$message.success(res.data.msg);
              this.delId = null;
              this.delVisible = false;
              this.getList();
            })
            .catch((err) => {
              this.$message.error(err.data.msg);
            });
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

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
          isSaleFlag: false,
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          currency_suffix:
            JSON.parse(localStorage.getItem("common_set")).currency_suffix ||
            "元",
          defaultDate: this.getDefaultMonth(),
          params: {
            sale_id: "",
            date: "",
          },
          sale_list: [],
          visible: false,
          orderTypeList: [],
          bigOderList: [],
          orderList: [],
          order_list: [],
          order_commission: "",
          commission: "",
          oderTypeVal: "",
          task_commission: "",
          big_commission: "",
          orderColumns: [
            {
              align: "left",
              colKey: "id",
              title: "ID",
              width: 100,
              fixed: "left",
            },
            {
              align: "center",
              colKey: "email",
              title: lang.sales_plugin_text57,
            },
            {
              align: "center",
              colKey: "amount",
              title: `${lang.sales_plugin_text58}(${
                JSON.parse(localStorage.getItem("common_set"))
                  .currency_suffix || "元"
              })`,
            },
            {
              align: "center",
              colKey: "commission",
              title: `${lang.sales_plugin_text59}(${
                JSON.parse(localStorage.getItem("common_set"))
                  .currency_suffix || "元"
              })`,
            },
            {
              align: "center",
              colKey: "pay_time",
              cell: "pay_time",
              title: lang.sales_plugin_text60,
              width: 200,
              fixed: "right",
            },
          ],
          order_list_columns: [
            {
              align: "left",
              colKey: "type",
              title: lang.sales_plugin_text61,
              width: 100,
              fixed: "left",
            },
            {
              align: "center",
              colKey: "count",
              title: lang.sales_plugin_text62,
            },
            {
              align: "center",
              colKey: "amount",
              title: `${lang.sales_plugin_text63}(${
                JSON.parse(localStorage.getItem("common_set"))
                  .currency_suffix || "元"
              })`,
              width: 100,
            },
            {
              align: "right",
              colKey: "commission",
              title: `提成(${
                JSON.parse(localStorage.getItem("common_set"))
                  .currency_suffix || "元"
              })`,
              width: 200,
              fixed: "right",
            },
          ],
          task_columns: [
            {
              align: "left",
              colKey: "description",
              title: lang.sales_plugin_text64,
              width: "80%",
              fixed: "left",
            },
            {
              align: "right",
              colKey: "commission",
              title: `${lang.sales_plugin_text65}(${
                JSON.parse(localStorage.getItem("common_set"))
                  .currency_suffix || "元"
              })`,
              fixed: "right",
            },
          ],
          big_order_list: [],
          task: [],
          submitLoading: false,
        };
      },
      mounted() {
        this.getCommissionData();
      },
      methods: {
        selectTime(val) {
          this.params.date = val;
        },
        // 获取当前默认月
        getDefaultMonth() {
          const date = new Date();
          return `${date.getFullYear()}-${date.getMonth() + 1}`;
        },
        // 获取销售列表
        async getSaleList() {
          const res = await allSale(this.params);
          this.sale_list = res.data.data.list;
        },
        // 获取提成数据
        getCommissionData() {
          commissionData(this.params).then((res) => {
            res.data.data.new.type = lang.sales_plugin_text66;
            res.data.data.renew &&
              (res.data.data.renew.type = lang.sales_plugin_text67);
            res.data.data.repurchase.type = lang.sales_plugin_text68;
            res.data.data.other &&
              (res.data.data.other.type = lang.sales_plugin_text69);
            res.data.data.upgrade &&
              (res.data.data.upgrade.type = lang.sale_text129);
            res.data.data.big_order.type = lang.sales_plugin_text70;
            this.orderTypeList = [res.data.data.new, res.data.data.repurchase];
            res.data.data.other && this.orderTypeList.push(res.data.data.other);
            res.data.data.renew && this.orderTypeList.push(res.data.data.renew);
            res.data.data.upgrade &&
              this.orderTypeList.push(res.data.data.upgrade);
            this.bigOderList = [res.data.data.big_order];
            this.order_list = res.data.data.order_list;
            this.big_order_list = res.data.data.big_order_list;
            this.task = res.data.data.task;
            this.big_commission = res.data.data.big_order.commission;
            this.order_commission = res.data.data.order_commission;
            this.commission = res.data.data.commission;
            this.task_commission = res.data.data.task_commission;
            if (!this.monitorContainer) {
              this.monitorContainer =
                document.getElementById("monitorContainer");
            }
            this.countChart = echarts.init(this.monitorContainer);
            const option = {
              title: {
                text: `${this.currency_prefix}${this.commission}`,
                left: "50%",
                top: "45%",
                textAlign: "center",
                // 可以设置显示的样式
                textStyle: {
                  color: "rgba(0, 0, 0, 0.9)",
                  fontSize: 28,
                  fontWeight: "normal",
                  lineHeight: 46,
                },
              },
              color: ["#0594FA", "#00C3D9", "#0052D9"],
              tooltip: {
                trigger: "item",
              },
              legend: {
                bottom: "0%",
                left: "center",
                itemWidth: 12,
                itemHeight: 4,
              },

              series: [
                {
                  name: "",
                  type: "pie",
                  radius: ["48%", "60%"],
                  avoidLabelOverlap: false,
                  label: {
                    show: false,
                    position: "center",
                  },
                  emphasis: {
                    label: {
                      show: false,
                      formatter: [
                        `${this.currency_prefix}{value|{c}}`,
                        "{name|{b}}",
                      ].join("\n"),
                      rich: {
                        value: {
                          color: "rgba(0, 0, 0, 0.9)",
                          fontSize: 28,
                          fontWeight: "normal",
                          lineHeight: 46,
                        },
                        name: {
                          color: "#909399",
                          fontSize: 14,
                          lineHeight: 14,
                        },
                      },
                    },
                  },
                  labelLine: {
                    show: false,
                  },
                  data: [
                    {
                      value: this.order_commission * 1,
                      name: lang.sales_plugin_text19,
                    },
                    {
                      value: this.big_commission * 1,
                      name: lang.sales_plugin_text22,
                    },
                    {
                      value: this.task_commission * 1,
                      name: lang.sales_plugin_text24,
                    },
                  ],
                },
              ],
            };
            this.countChart.setOption(option);
          });
        },
        formatDateAdd0(m) {
          return m < 10 ? "0" + m : m;
        },
        handelDialog(val) {
          this.oderTypeVal = val === "1" ? "order_list" : "big_order_list";
          this.orderList = val === "1" ? this.order_list : this.big_order_list;
          this.visible = true;
        },
        dowloadFile() {
          // 导出excel
          const params = {
            ...this.params,
            action: this.oderTypeVal,
          };
          const hostUrl = location.pathname.split("/")[1];
          const baseURL = `/${hostUrl}/v1`;
          this.submitLoading = true;
          axios
            .post(`/sale/export_excel`, params, {
              baseURL,
              timeout: 12000,
              headers: {
                Authorization: "Bearer" + " " + localStorage.getItem("backJwt"),
              },
              responseType: "blob",
            })
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
              //点击触发下载
              link.click();
              this.$message.success(lang.sales_plugin_text71);
              //移除标签
              document.body.removeChild(link);
              // 释放掉blob对象
              URL.revokeObjectURL(blob);
              this.submitLoading = false;
            });
        },
        search() {
          this.getCommissionData();
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
        // 是否是销售
        getIsSale() {
          isSale().then((res) => {
            if (res.data.data.sale_id === 0) {
              // 不是销售
              this.isSaleFlag = true;
              this.getSaleList();
            } else {
              // 是销售
              this.isSaleFlag = false;
            }
          });
        },
      },
      created() {
        this.params.date = this.getDefaultMonth();
        this.getIsSale();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

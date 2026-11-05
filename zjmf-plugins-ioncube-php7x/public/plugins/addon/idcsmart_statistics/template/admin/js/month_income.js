(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("statistics")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = window.moment;
    new Vue({
      components: {
        comConfig,
      },
      data() {
        return {
          data: [],
          tableLayout: false,
          hover: true,
          columns: [
            {
              colKey: "date",
              title: lang.client_care_label44,
              ellipsis: true,
              align: "center",
            },
            {
              colKey: "amount_in",
              title: lang.amount_in,
              ellipsis: true,
              align: "center",
            },
            {
              colKey: "amount_out",
              title: lang.refund,
              ellipsis: true,
              align: "center",
            },

            {
              colKey: "balance",
              title: lang.balance,
              ellipsis: true,
              align: "center",
            },
          ],
          curYear: new Date().getFullYear(),
          curMonth:
            new Date().getMonth() + 1 < 10
              ? "0" + (new Date().getMonth() + 1)
              : new Date().getMonth(),
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          currency_suffix:
            JSON.parse(localStorage.getItem("common_set")).currency_suffix ||
            "元",
          curData: [],
          lastData: [],
          beforeLastData: [],
        };
      },
      computed: {
        preMonth() {
          if (this.curMonth * 1 - 1 <= 0) {
            return `${this.curYear - 1}-12`;
          } else {
            const m = `0${this.curMonth - 1}`.substr(-2);
            return `${this.curYear}-${m}`;
          }
        },
        nextMonth() {
          if (this.curMonth * 1 + 1 > 12) {
            return `${this.curYear + 1}-01`;
          } else {
            const m = `0${this.curMonth * 1 + 1}`.substr(-2);
            return `${this.curYear}-${m}`;
          }
        },
        isShowNext() {
          const m = `0${new Date().getMonth() + 2}`.substr(-2);
          return `${new Date().getFullYear()}-${m}` !== this.nextMonth;
        },
        formatMoney() {
          return (money) => {
            if (isNaN(money)) {
              return "0.00";
            } else {
              const temp = `${money}`.split(".");
              return (
                parseInt(temp[0]).toLocaleString() + "." + (temp[1] || "00")
              );
            }
          };
        },
      },
      methods: {
        async getAddonList() {
          try {
            const res = await getAddon();
            if (
              res.data.data.list.filter((item) => item.name === "CostPay")
                .length > 0
            ) {
              this.columns.splice(3, 0, {
                colKey: "cost",
                title: lang.amount_out,
                ellipsis: true,
                align: "center",
              });
            }
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        // 获取line图表（中部左侧）
        getSaleChart() {
          if (!this.monitorContainer) {
            this.monitorContainer = document.getElementById("monitorContainer");
          }
          const chartColors = {
            textColor: "rgba(0, 0, 0, 0.9)",
            placeholderColor: "rgba(0, 0, 0, 0.35)",
            borderColor: "#dcdcdc",
            containerColor: "#fff",
          };
          this.monitorChart = echarts.init(this.monitorContainer);
          this.monitorChart.setOption(this.getLineChartDataSet(chartColors));
        },
        getLineChartDataSet({ placeholderColor, borderColor }) {
          // 中部左侧线图配置
          let timeArray = this.curData.list.reduce((all, cur) => {
            all.push(cur.date.substr(-2));
            return all;
          }, []);
          let curPrice = [];
          let outPrice = [];
          let balancePrice = [];
          let refoudPrice = [];
          this.curData.list.forEach((item) => {
            curPrice.push(item.amount_in);
            refoudPrice.push(item.amount_out);
            balancePrice.push(item.balance);
            outPrice.push(item.cost);
          });
          const dataSet = {
            tooltip: {
              trigger: "axis",
              valueFormatter: (value) =>
                this.currency_prefix +
                this.formatMoney(value) +
                " " +
                this.currency_suffix,
            },
            grid: {
              left: "0",
              right: "20px",
              top: "50px",
              bottom: "30px",
              containLabel: true,
            },
            legend: {
              left: "auto",
              top: "0",
              orient: "horizontal", // legend 横向布局。
              textStyle: {
                fontSize: 12,
                color: placeholderColor,
              },
            },
            xAxis: {
              type: "category",
              data: timeArray,
              boundaryGap: false,
              axisLabel: {
                color: placeholderColor,
              },
              axisLine: {
                onZero: false,
                lineStyle: {
                  width: 1,
                },
              },
            },
            yAxis: [
              {
                type: "value",
                axisLabel: {
                  color: placeholderColor,
                },
                splitLine: {
                  lineStyle: {
                    color: borderColor,
                  },
                },
                minInterval: 0,
                //  alignTicks: true, // 多Y轴对齐
              },
              {
                type: "value",
                axisLabel: {
                  color: placeholderColor,
                },
                splitLine: {
                  lineStyle: {
                    color: borderColor,
                  },
                },
                alignTicks: true,
              },
            ],
            series: [
              {
                name: lang.amount_in,
                data: curPrice,
                type: "line",
                smooth: false,
                showSymbol: true,
                symbol: "none",
                itemStyle: {
                  normal: {
                    borderColor,
                    borderWidth: 1,
                  },
                },
                areaStyle: {
                  normal: {
                    opacity: 0.1,
                  },
                },
              },

              {
                name: lang.refund,
                data: refoudPrice,
                type: "line",
                smooth: false,
                showSymbol: true,
                symbol: "none",
                itemStyle: {
                  normal: {
                    borderColor,
                    borderWidth: 1,
                  },
                },
                areaStyle: {
                  normal: {
                    opacity: 0.1,
                  },
                },
              },
              {
                name: lang.amount_out,
                data: outPrice,
                type: "line",
                smooth: false,
                showSymbol: true,
                symbol: "none",
                itemStyle: {
                  normal: {
                    borderColor,
                    borderWidth: 1,
                  },
                },
                areaStyle: {
                  normal: {
                    opacity: 0.1,
                  },
                },
              },
              {
                name: lang.balance,
                data: balancePrice,
                type: "line",
                smooth: false,
                showSymbol: true,
                symbol: "none",
                itemStyle: {
                  normal: {
                    borderColor,
                    borderWidth: 1,
                  },
                },
                areaStyle: {
                  normal: {
                    opacity: 0.1,
                  },
                },
              },
            ],
          };
          return dataSet;
        },
        handelRowClick({ row }) {
          const start_date_parts = row.date.split("-");
          const year = parseInt(start_date_parts[0], 10);
          const month = parseInt(start_date_parts[1], 10) - 1; // JavaScript 中月份是从0开始计数
          // 计算该月的最后一天并设置为23:59:59
          const end_of_month = new Date(year, month + 1, 0); // 这会得到下个月的前一天，即本月的最后一天
          const end_time =
            new Date(
              end_of_month.getFullYear(),
              end_of_month.getMonth(),
              end_of_month.getDate(),
              23,
              59,
              59
            ).getTime() / 1000;
          // 获取指定月份的第一天
          const start_time = new Date(year, month, 1, 0, 0, 0).getTime() / 1000;
          const params = {
            start_time,
            end_time,
          };
          sessionStorage.orderListParams = JSON.stringify(params);
          // 打开新窗口
          window.open(`${str}order.htm`);
        },
        changeNum(type) {
          if (type === "add") {
            this.curMonth += 1;
          } else {
            this.curMonth -= 1;
          }
          if (this.curMonth * 1 === 0) {
            this.curMonth = 12;
            this.curYear -= 1;
          } else if (this.curMonth * 1 === 13) {
            this.curMonth = "01";
            this.curYear += 1;
          }
          this.getIncome();
        },
        async getIncome() {
          try {
            this.loading = true;
            let date = "";
            if (this.curMonth === 0) {
              date = this.curYear * 1 - 1 + "-" + 12;
            } else if (this.curMonth === 13) {
              date = this.curYear * 1 + 1 + "-" + "01";
            } else {
              date = this.curYear + "-" + `0${this.curMonth}`.substr(-2);
            }
            const res = await getMonthIncome({
              date: date,
            });
            this.curData = res.data.data;
            this.loading = false;
            this.getSaleChart();
          } catch (error) {
            console.log("error", error);
            this.loading = false;
            this.$message.error(error.data.msg);
          }
        },
      },
      created() {
        this.getIncome();
        this.getAddonList();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

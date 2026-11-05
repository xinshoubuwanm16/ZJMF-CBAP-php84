(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("statistics")[0];
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
          data: [],
          tableLayout: false,
          hover: true,
          baseUrl: str,
          columns: [
            {
              colKey: "date",
              title: lang.statistics_month,
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
          time: new Date().getFullYear(),
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
        // 监听容器大小变化
        updateContainer() {
          this.monitorChart &&
            this.monitorChart.resize({
              width: this.monitorContainer.clientWidth,
            });
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
        // 绘制柱状图
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
          if (this.monitorChart) {
            this.monitorChart.clear();
          }
          this.monitorChart.setOption(this.getLineChartDataSet(chartColors));
        },
        getLineChartDataSet({ placeholderColor, borderColor }) {
          let timeArray = [];
          for (let i = 1; i <= 12; i++) {
            timeArray.push(i + lang.month);
          }
          let curPrice = [],
            lastPrice = [],
            beforeLasrPrice = [];
          this.curData.list.forEach((item) => {
            curPrice.push((item.amount_in * 1).toFixed(2));
          });
          this.lastData.list.forEach((item) => {
            lastPrice.push((item.amount_in * 1).toFixed(2));
          });
          this.beforeLastData.list.forEach((item) => {
            beforeLasrPrice.push((item.amount_in * 1).toFixed(2));
          });
          const arr = [this.time - 2, this.time - 1, this.time];
          const pArr = [beforeLasrPrice, lastPrice, curPrice];
          const series = arr.reduce((all, cur, index) => {
            all.push({
              name: cur,
              data: pArr[index],
              type: "bar",
              smooth: false,
              showSymbol: true,
              symbol: "circle",
              symbolSize: 8,
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
            });
            return all;
          }, []);
          const dataSet = {
            tooltip: {
              // trigger: 'item',
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
            color: ["#3070cf", "#f9d88c", "#cb4c30"],
            legend: {
              left: "auto",
              top: "0",
              orient: "horizontal", // legend 横向布局。
              textStyle: {
                fontSize: 13,
                lineHeight: 24,
                color: placeholderColor,
              },
            },
            xAxis: {
              type: "category",
              data: timeArray,
              //  boundaryGap: false,
              axisLabel: {
                color: placeholderColor,
              },
              axisLine: {
                lineStyle: {
                  width: 1,
                },
              },
              axisPointer: {
                type: "shadow",
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
                alignTicks: true, // 多Y轴对齐
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
            series,
          };
          return dataSet;
        },
        changeNum(type) {
          if (type === "add") {
            this.time += 1;
          } else {
            this.time -= 1;
          }
          this.getIncome();
        },
        async getIncome() {
          try {
            this.loading = true;
            const res = await getYearIncome({
              year: this.time,
            });
            this.curData = res.data.data.this_year;
            this.lastData = res.data.data.last_year;
            this.beforeLastData = res.data.data.before_last_year;
            this.loading = false;
            setTimeout(() => {
              this.getSaleChart();
            }, 0);
          } catch (error) {
            this.loading = false;
            this.$message.error(error.data.msg);
          }
        },
      },
      created() {
        this.getAddonList();
        this.getIncome();
      },
      mounted() {
        window.addEventListener("resize", this.updateContainer, false);
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

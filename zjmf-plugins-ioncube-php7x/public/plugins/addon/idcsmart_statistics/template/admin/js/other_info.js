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
              title: lang.statistics_month,
              ellipsis: true,
              align: "center",
            },
            {
              colKey: "new_order",
              title: lang.new,
              ellipsis: true,
              align: "center",
            },
            {
              colKey: "register_client",
              title: lang.new_signup_user,
              ellipsis: true,
              align: "center",
            },
            {
              colKey: "renew_order",
              title: lang.renew_order,
              ellipsis: true,
              align: "center",
            },
            {
              colKey: "upgrade_order",
              title: lang.upgrade,
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
          curType: "new_order",
          typeArr: [
            {
              value: "new_order",
              label: lang.new,
            },
            {
              value: "register_client",
              label: lang.new_signup_user,
            },
            {
              value: "renew_order",
              label: lang.renew_order,
            },
            {
              value: "upgrade_order",
              label: lang.upgrade,
            },
          ],
        };
      },
      computed: {
        calcName() {
          switch (this.curType) {
            case "new_order":
              return lang.new;
            case "register_client":
              return lang.new_signup_user;
            case "renew_order":
              return lang.renew;
            case "upgrade_order":
              return lang.upgrade;
          }
        },
      },
      methods: {
        chooseType(type) {
          if (this.curType !== type) {
            this.curType = type;
            this.getSaleChart();
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
          let timeArray = [];
          for (let i = 1; i <= 12; i++) {
            timeArray.push(i + lang.month);
          }
          let curPrice = [],
            lastPrice = [];
          this.curData.list.forEach((item) => {
            curPrice.push(item[this.curType]);
          });
          this.lastData.list.forEach((item) => {
            lastPrice.push(item[this.curType]);
          });
          const dataSet = {
            tooltip: {
              // trigger: 'item',
              trigger: "axis",
              // formatter: '{b}<br>{c}'
            },
            grid: {
              left: "0",
              right: "20px",
              top: "50px",
              bottom: "30px",
              containLabel: true,
            },
            legend: {
              right: "0",
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
            series: [
              {
                name: this.time,
                data: curPrice,
                type: "line",
                smooth: false,
                symbol: "none",
                itemStyle: {
                  normal: {
                    borderColor,
                    borderWidth: 1,
                  },
                },
                areaStyle: {
                  normal: {
                    opacity: 0.3,
                  },
                },
              },
              {
                name: this.time - 1,
                data: lastPrice,
                type: "line",
                smooth: false,
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
        changeNum(type) {
          if (type === "add") {
            this.time += 1;
          } else {
            this.time -= 1;
          }
          this.init();
        },
        async getIncome(cur = true, time) {
          try {
            this.loading = true;
            const res = await getOther({
              year: time,
            });
            return res.data.data;
          } catch (error) {
            this.loading = false;
            this.$message.error(error.data.msg);
          }
        },
        async init() {
          try {
            const p = [
              this.getIncome("_", this.time),
              this.getIncome(false, this.time - 1),
            ];
            Promise.all(p)
              .then((res) => {
                this.curData = res[0];
                this.lastData = res[1];
                this.loading = false;
                this.getSaleChart();
              })
              .catch((err) => {
                console.log("err", err);
              });
          } catch (error) {
            console.log("error", error);
          }
        },
      },
      created() {
        this.init();
      },
      // mounted() {
      //   window.addEventListener('resize', this.init());
      // },
      // destroyed() {
      //   window.removeEventListener('resize', this.init());
      // },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

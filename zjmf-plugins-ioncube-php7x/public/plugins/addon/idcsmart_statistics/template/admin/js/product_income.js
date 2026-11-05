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
              colKey: "name",
              title: lang.product_name,
              ellipsis: true,
              align: "center",
            },
            {
              colKey: "units",
              title: lang.units_sold,
              ellipsis: true,
              align: "center",
            },
            {
              colKey: "amount",
              title: lang.amount_in,
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
          group: [],
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
      mounted() {
        window.addEventListener("resize", this.updateContainer, false);
      },
      methods: {
        // 监听容器大小变化
        updateContainer() {
          this.monitorChart &&
            this.monitorChart.resize({
              width: this.monitorContainer.clientWidth,
            });
        },
        renderCharts() {
          const chartColors = {
            textColor: "rgba(0, 0, 0, 0.9)",
            placeholderColor: "rgba(0, 0, 0, 0.35)",
            borderColor: "#dcdcdc",
            containerColor: "#fff",
          };
          this.monitorContainer = document.getElementById("monitorContainer");
          if (this.curData.length === 0) {
            return;
          }
          this.monitorChart = echarts.init(this.monitorContainer);
          this.monitorChart.setOption(this.getPieChartDataSet(chartColors));
          this.updateContainer();
        },
        getPieChartDataSet({
          // 中部右侧饼图配置
          textColor,
          placeholderColor,
          containerColor,
        }) {
          return {
            color: [
              "#0048cd",
              "#5f9bff",
              "#5a1907",
              "#c5c5c5",
              "#e34d59",
              "#00a870",
              "#078d5c",
            ],
            tooltip: {
              trigger: "item",
              position: null,
              valueFormatter: (value) =>
                this.currency_prefix +
                this.formatMoney(value) +
                " " +
                this.currency_suffix,
            },
            grid: {
              top: "0",
              right: "0",
            },
            legend: {
              orient: "horizontal",
              top: "bottom",
            },
            series: [
              {
                //  name: '首次复购比例',
                type: "pie",
                radius: "50%",
                // avoidLabelOverlap: true,
                // selectedMode: true,
                hoverAnimation: true,
                //  silent: true,
                itemStyle: {
                  borderColor: containerColor,
                  borderWidth: 1,
                },
                label: {
                  show: false,
                  position: "left",
                  // formatter: ['{value|{d}%}', '{name|{b}占比}'].join('\n'),
                  rich: {
                    value: {
                      color: "#000",
                      fontSize: 14,
                      fontWeight: "normal",
                      lineHeight: 24,
                    },
                    name: {
                      color: "#909399",
                      fontSize: 12,
                      lineHeight: 14,
                    },
                  },
                },
                emphasis: {
                  // label: {
                  //   show: true,
                  //   formatter: [`{name|{b}}`, `{value|${this.currency_prefix}{c}${this.currency_suffix}}（{value|{d}%}）`].join('\n'),
                  // },
                },
                labelLine: {
                  show: true,
                },
                data: this.curData.reduce((all, cur) => {
                  all.push({
                    name: cur.name,
                    value: cur.totalPrice.toFixed(2),
                  });
                  return all;
                }, []),
              },
            ],
          };
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
          this.init();
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
            const res = await getProductIncome({
              date: date,
            });
            return res.data.data.list;
            //  this.getSaleChart()
          } catch (error) {
            console.log("error", error);
            this.loading = false;
            this.$message.error(error.data.msg);
          }
        },
        async getProductGroup() {
          try {
            const res = await getSecondGroup();
            return res.data.data.list;
          } catch (error) {
            console.log("error", error);
          }
        },
        async init() {
          try {
            const p = [this.getProductGroup(), this.getIncome()];
            Promise.all(p)
              .then((res) => {
                this.curData = res[0]
                  .map((item) => {
                    item.child = [];
                    const child = res[1].filter(
                      (el) => el.product_group_id === item.id
                    );
                    item.child.push(...child);
                    item.totalPrice = child.reduce((all, cur) => {
                      all += cur.amount * 1;
                      return all;
                    }, 0);
                    return item;
                  })
                  .filter((item) => item.child.length > 0);
                this.loading = false;
                this.renderCharts();
              })
              .catch((err) => {
                console.log("err", err);
                this.$message.error(err);
              });
          } catch (error) {
            console.log("####", error);
            this.curData = [];
          }
        },
      },
      created() {
        this.init();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

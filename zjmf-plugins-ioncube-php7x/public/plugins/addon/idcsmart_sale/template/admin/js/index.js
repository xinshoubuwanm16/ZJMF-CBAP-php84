(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("admin")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        comConfig,
      },
      data () {
        return {
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          currency_suffix:
            JSON.parse(localStorage.getItem("common_set")).currency_suffix ||
            "元",
          panelList: [
            {
              title: lang.sales_plugin_text30,
              number: 0,
              bottomTitle: lang.sales_plugin_text31,
              bottomNumbder: 0,
            },
            {
              title: lang.sales_plugin_text32,
              number: 0,
              bottomTitle: lang.sales_plugin_text31,
              bottomNumbder: 0,
            },
            {
              title: lang.sales_plugin_text33,
              number: 0,
              bottomTitle: lang.sales_plugin_text34,
              bottomNumbder: 0,
            },
            {
              title: lang.sales_plugin_text35,
              number: 0,
              bottomTitle: lang.sales_plugin_text36,
              bottomNumbder: 0,
            },
          ],
          resizeTime: 1,
          first_buy: "",
          renew: "",
          currentMonth: "",
          // 消费总金额排名
          buyTendList: [],
          money_week: [],
          money_month: [],
          // 销售订单列表数据
          saleTendList: [],
          // 本周销售订单
          order_week: [],
          // 最近三个月销售订单
          order_month: [],
          saleID: "",
          defaultDate: [],
          // 销售统计图表
          chartList: [],
          saleColumns: [
            {
              align: "center",
              colKey: "index",
              title: lang.sales_plugin_text37,
              width: 100,
              fixed: "left",
            },
            {
              align: "center",
              ellipsis: true,
              colKey: "username",
              title: lang.sales_plugin_text38,
              minWidth: 200,
            },
            {
              align: "center",
              colKey: "amount",
              width: 200,
              title: lang.sales_plugin_text39,
            },
            {
              align: "center",
              colKey: "pay_time",
              width: 140,
              title: lang.sales_plugin_text40,
            },
            {
              align: "center",
              colKey: "typeText",
              title: lang.sales_plugin_text41,
              width: 80,
              fixed: "right",
            },
          ],
          buyColumns: [
            {
              align: "center",
              colKey: "index",
              title: lang.sales_plugin_text37,
              width: 100,
              fixed: "left",
            },
            {
              align: "center",
              ellipsis: true,
              colKey: "username",
              title: lang.sales_plugin_text42,
              minWidth: 200,
            },
            {
              align: "center",
              colKey: "amount",
              title: lang.sales_plugin_text43,
              width: 200,
            },
            {
              align: "center",
              colKey: "register_duration",
              title: lang.sales_plugin_text44,
              fixed: "right",
              width: 100,
            },
          ],
          params: {
            start_time: "",
            end_time: "",
            sale_id: "",
          },
        };
      },
      mounted () {
        window.addEventListener("resize", this.updateContainer, false);
        this.getSaleID();
      },
      methods: {
        selectTime (checkedValues) {
          this.currentMonth =
            checkedValues[0] + lang.sales_plugin_text45 + checkedValues[1];
          const start = new Date(checkedValues[0]).toISOString();
          const end = new Date(checkedValues[1]).toISOString();
          this.params.start_time = new Date(start).getTime() / 1000;
          this.params.end_time = new Date(end).getTime() / 1000 + 60 * 60 * 24;
          this.getSaleChart();
        },
        /** 获取当前选中时间的短时间表达法 */
        getThisMonth (checkedValues = "") {
          let date;
          if (!checkedValues || checkedValues.length === 0) {
            date = new Date();
            return `${date.getFullYear()}-${date.getMonth() + 1}`;
          }
          date = new Date(checkedValues[0]);
          const date2 = new Date(checkedValues[1]);
          const startMonth =
            date.getMonth() + 1 > 9
              ? date.getMonth() + 1
              : `0${date.getMonth() + 1}`;
          const startDay =
            date.getDate() + 1 > 9
              ? date.getDate() + 1
              : `0${date.getDate() + 1}`;
          const endMonth =
            date2.getMonth() + 1 > 9
              ? date2.getMonth() + 1
              : `0${date2.getMonth() + 1}`;
          const endDay =
            date2.getDate() + 1 > 9
              ? date2.getDate() + 1
              : `0${date2.getDate() + 1}`;
          return `${date.getFullYear()}-${startMonth}-${startDay}  ${lang.sales_plugin_text45
            }  ${date2.getFullYear()}-${endMonth}-${endDay}`;
        },
        getLineChartDataSet ({ placeholderColor, borderColor }) {
          let timeArray = [];
          let outArray = [];
          this.chartList.forEach((item) => {
            if (item.date.split("-").length === 3) {
              timeArray.push(
                item.date.split("-")[1] + "-" + item.date.split("-")[2]
              );
            } else {
              timeArray.push(
                item.date.split("-")[0] + "-" + item.date.split("-")[1]
              );
            }
            outArray.push(item.amount);
          });
          const dataSet = {
            tooltip: {
              trigger: "item",
            },
            grid: {
              left: "0",
              right: "20px",
              top: "5px",
              bottom: "36px",
              containLabel: true,
            },
            legend: {
              left: "center",
              bottom: "0",
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
            yAxis: {
              type: "value",
              axisLabel: {
                color: placeholderColor,
              },
              splitLine: {
                lineStyle: {
                  color: borderColor,
                },
              },
            },
            series: [
              {
                name: lang.sales_plugin_text46,
                data: outArray,
                type: "line",
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
              },
            ],
          };
          return dataSet;
        },
        formatDateAdd0 (m) {
          return m < 10 ? "0" + m : m;
        },
        // 时间格式转换
        formatDate (dateStr) {
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
        getPieChartDataSet ({
          radius = 42,
          textColor,
          placeholderColor,
          containerColor,
        }) {
          return {
            color: ["#0048cd", "#5f9bff"],
            tooltip: {
              show: false,
              trigger: "axis",
              position: null,
            },
            grid: {
              top: "0",
              right: "0",
            },
            legend: {
              selectedMode: false,
              itemWidth: 12,
              itemHeight: 4,
              textStyle: {
                fontSize: 12,
                color: placeholderColor,
              },
              left: "center",
              bottom: "0",
              orient: "horizontal", // legend 横向布局。
            },
            series: [
              {
                name: lang.sales_plugin_text47,
                type: "pie",
                radius: ["48%", "60%"],
                avoidLabelOverlap: true,
                selectedMode: true,
                hoverAnimation: true,
                silent: true,
                itemStyle: {
                  borderColor: containerColor,
                  borderWidth: 1,
                },
                label: {
                  show: true,
                  position: "center",
                  formatter: [
                    "{value|{d}%}",
                    `{name|{b}${lang.proportion}}`,
                  ].join("\n"),
                  rich: {
                    value: {
                      color: textColor,
                      fontSize: 28,
                      fontWeight: "normal",
                      lineHeight: 46,
                    },
                    name: {
                      color: "#909399",
                      fontSize: 12,
                      lineHeight: 14,
                    },
                  },
                },
                emphasis: {
                  label: {
                    show: true,
                    formatter: [
                      "{value|{d}%}",
                      `{name|{b}${lang.proportion}}`,
                    ].join("\n"),
                    rich: {
                      value: {
                        color: textColor,
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
                  show: true,
                },
                data: [
                  {
                    value: this.first_buy,
                    name: lang.sales_plugin_text48,
                  },
                  {
                    value: this.renew,
                    name: lang.sales_plugin_text49,
                  },
                ],
              },
            ],
          };
        },
        getRankClass (index) {
          return [
            "dashboard-rank__cell",
            { "dashboard-rank__cell--top": index < 3 },
          ];
        },
        handelThisWeek (val) {
          this.saleTendList = val === "1" ? this.order_week : this.order_month;
        },
        handelMoneyWeek (val) {
          this.buyTendList = val === "1" ? this.money_week : this.money_month;
        },
        // 监听容器大小变化
        updateContainer () {
          if (
            document.documentElement.clientWidth >= 1400 &&
            document.documentElement.clientWidth < 1920
          ) {
            this.resizeTime = (
              document.documentElement.clientWidth / 2080
            ).toFixed(2);
          } else if (document.documentElement.clientWidth < 1080) {
            this.resizeTime = (
              document.documentElement.clientWidth / 1080
            ).toFixed(2);
          } else {
            this.resizeTime = 1;
          }
          this.countChart && this.countChart.resize({
              // 根据父容器的大小设置大小
              width: `${this.resizeTime * 326}px`,
              height: `${this.resizeTime * 326}px`,
            });
          this.monitorChart && this.monitorChart.resize({
            // 根据父容器的大小设置大小
            width: this.monitorContainer.clientWidth,
            height: `${this.resizeTime * 326}px`,
          });
        },
        constructInitDashboardDataset (type) {
          const dateArray = [
            lang.sales_plugin_text50,
            lang.sales_plugin_text51,
            lang.sales_plugin_text52,
            lang.sales_plugin_text53,
            lang.sales_plugin_text54,
            lang.sales_plugin_text55,
            lang.sales_plugin_text56,
          ];
          const datasetAxis = {
            xAxis: {
              type: "category",
              show: false,
              data: dateArray,
            },
            yAxis: {
              show: false,
              type: "value",
            },
            grid: {
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            },
          };
          if (type === "line") {
            const lineDataset = {
              ...datasetAxis,
              color: ["#fff"],
              series: [
                {
                  data: [150, 230, 224, 218, 135, 147, 260],
                  type,
                  showSymbol: true,
                  symbol: "circle",
                  symbolSize: 0,
                  itemStyle: {
                    normal: {
                      lineStyle: {
                        width: 2,
                      },
                    },
                  },
                },
              ],
            };
            return lineDataset;
          }
          if (type === "bar") {
            const barDataset = {
              ...datasetAxis,
              color: "#0052d9",
              series: [
                {
                  data: [
                    100,
                    130,
                    184,
                    218,
                    {
                      value: 135,
                      itemStyle: {
                        opacity: 0.2,
                      },
                    },
                    {
                      value: 118,
                      itemStyle: {
                        opacity: 0.2,
                      },
                    },
                    {
                      value: 60,
                      itemStyle: {
                        opacity: 0.2,
                      },
                    },
                  ],
                  type,
                  barWidth: 9,
                },
              ],
            };
            return barDataset;
          }
        },
        renderCharts () {
          const chartColors = {
            textColor: "rgba(0, 0, 0, 0.9)",
            placeholderColor: "rgba(0, 0, 0, 0.35)",
            borderColor: "#dcdcdc",
            containerColor: "#fff",
          };
          if (!this.moneyContainer)
            this.moneyContainer = document.getElementById("moneyContainer");
          this.moneyCharts = echarts.init(this.moneyContainer);
          this.moneyCharts.setOption(
            this.constructInitDashboardDataset("line")
          );

          if (!this.refundContainer)
            this.refundContainer = document.getElementById("refundContainer");
          this.refundChart = echarts.init(this.refundContainer);
          this.refundChart.setOption(
            this.constructInitDashboardDataset("bar", chartColors)
          );

          if (!this.countContainer) {
            this.countContainer = document.getElementById("countContainer");
          }
          this.countChart = echarts.init(this.countContainer);
          this.countChart.setOption(this.getPieChartDataSet(chartColors));
          this.updateContainer();
        },
        // 获取销售统计
        getSaleData () {
          saleStatistics({ sale_id: this.saleID }).then((res) => {
            this.panelList[0].number = res.data.commission.month;
            this.panelList[1].number = res.data.commission.today;
            this.panelList[2].number = res.data.client_count;
            this.panelList[3].number = res.data.commission.total;
            this.panelList[0].bottomNumbder = res.data.amount.month;
            this.panelList[1].bottomNumbder = res.data.amount.today;
            this.panelList[2].bottomNumbder = res.data.order_count;
            this.panelList[3].bottomNumbder = res.data.amount.total;
            res.data.detail.forEach((item) => {
              if (item.type === "new") {
                this.first_buy = item.price;
              }
              if (item.type === "repurchase") {
                this.renew = item.price;
              }
            });
            this.renderCharts();
          });
        },
        // 获取统计图表
        getSaleChart () {
          saleChart(this.params).then((res) => {
            this.chartList = res.data.data.list;
            if (!this.monitorContainer) {
              this.monitorContainer =
                document.getElementById("monitorContainer");
            }
            const chartColors = {
              textColor: "rgba(0, 0, 0, 0.9)",
              placeholderColor: "rgba(0, 0, 0, 0.35)",
              borderColor: "#dcdcdc",
              containerColor: "#fff",
            };
            this.monitorChart = echarts.init(this.monitorContainer);
            this.monitorChart.setOption(this.getLineChartDataSet(chartColors));
          });
        },
        // 获取销售订单列表
        getOrderRanking () {
          const obj = {
            new: lang.sale_text99,
            renew: lang.sale_text100,
            repurchase: lang.sale_text101,
            other: lang.sale_text102,
            upgrade: lang.sale_text127,
          };
          order_ranking({ sale_id: this.saleID }).then((res) => {
            this.order_week = res.data.data.this_week.map((item) => {
              item.typeText = obj[item.type];
              return item;
            });
            this.order_month = res.data.data.last_three_month.map((item) => {
              item.typeText = obj[item.type];
              return item;
            });
            this.handelThisWeek("1");
          });
        },
        // 	获取消费总金额排名
        getClientRanking () {
          client_ranking({ sale_id: this.saleID }).then((res) => {
            this.money_week = res.data.data.this_week;
            this.money_month = res.data.data.last_three_month;
            this.handelMoneyWeek("1");
          });
        },
        // 判断是否为销售
        getSaleID () {
          isSale().then((res) => {
            this.saleID =
              res.data.data.sale_id === 0 ? "" : res.data.data.sale_id;
            this.getOrderRanking();
            this.getClientRanking();
            this.getSaleData();
            this.params.sale_id = this.saleID;
            this.getSaleChart();
          });
        },
        // 美化金额展示
        thousandth (num) {
          if (!num) {
            num = 0.0;
          }
          let str = num.toString(); // 数字转字符串
          let str2 = null;
          // 如果带小数点
          if (str.indexOf(".") !== -1) {
            // 带小数点只需要处理小数点左边的
            const strArr = str.split("."); // 根据小数点切割字符串
            str = strArr[0]; // 小数点左边
            str2 = strArr[1]; // 小数点右边
            //如12345.678  str=12345，str2=678
          }
          let result = ""; // 结果
          while (str.length > 3) {
            // while循环 字符串长度大于3就得添加千分位
            // 切割法 ，从后往前切割字符串 ⬇️
            result = "," + str.slice(str.length - 3, str.length) + result;
            // 切割str最后三位，用逗号拼接 比如12345 切割为 ,345
            // 用result接收，并拼接上一次循环得到的result
            str = str.slice(0, str.length - 3); // str字符串剥离上面切割的后三位，比如 12345 剥离成 12
          }

          if (str.length <= 3 && str.length > 0) {
            // 长度小于等于3 且长度大于0，直接拼接到result
            // 为什么可以等于3 因为上面result 拼接时候在前面带上了‘,’
            // 相当于123456 上一步处理完之后 result=',456' str='123'
            result = str + result;
          }
          // 最后判断是否带小数点（str2是小数点右边的数字）
          // 如果带了小数点就拼接小数点右边的str2 ⬇️
          str2
            ? (result = result + "." + str2)
            : (result = result + "." + "00");
          return result;
        },
      },
      created () {
        const arr = nowSevenTimetamp();
        this.defaultDate = [format(arr[0]), format(arr[1])];
        const start = new Date(this.defaultDate[0]).toISOString();
        const end = new Date(this.defaultDate[1]).toISOString();
        this.params.start_time = new Date(start).getTime() / 1000;
        this.params.end_time = new Date(end).getTime() / 1000 + 60 * 60 * 24;
        this.currentMonth =
          this.defaultDate[0] + lang.sales_plugin_text45 + this.defaultDate[1];
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

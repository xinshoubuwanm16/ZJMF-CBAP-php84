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
          params: {
            keywords: "",
            page: 1,
            limit: 10000,
          },
          chartParams: {
            start_time: 0, //起始时间(秒级时间戳)
            end_time: 0, //结束时间(秒级时间戳)
          },
          range: [],
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          currency_suffix:
            JSON.parse(localStorage.getItem("common_set")).currency_suffix ||
            "元",
          option1: {},
          option2: {},
          chartDom: null,
          myChart: null,
          pietDom: null,
          myPie: null,
          sale_id: [], //销售ID(不传是全部)
          commission: {},
          total_amount: "",
          detail: [],
          sale_list: [],
          chartOptionL: [],
          rank: [],
          amountList: [],
          pieData: [],
          commissionList: [],
        };
      },
      mounted() {
        this.getSaleChart();
        this.onChange();
        window.addEventListener("resize", () => {
          this.myChart.resize();
        });
      },
      methods: {
        // 获取列表
        async getSaleList() {
          try {
            const res = await saleList(this.params);
            this.sale_list = res.data.data.list;
          } catch (error) {
            console.log(error);
          }
        },
        async onLoadInit() {
          const params1 = { ...this.chartParams, sale_id: this.sale_id };
          await saleChart(params1).then((res) => {
            this.XmonthList = [];
            this.commissionList = [];
            this.amountList = [];
            this.chartOption = res.data.data.list;
            this.total_amount = res.data.data.total_amount;
            this.chartOption.forEach((item) => {
              this.XmonthList.push(item.date);
              this.amountList.push(item.amount);
              this.commissionList.push(item.commission);
            });
          });
          this.chartDom = document.getElementById("echars-box");
          this.myChart = echarts.init(this.chartDom);
          this.option1 = {
            title: {},
            tooltip: {
              trigger: "axis",
            },
            legend: {
              left: "70px",
              bottom: "0px",
            },
            xAxis: {
              type: "category",
              data: this.XmonthList, // x轴
            },
            yAxis: {
              type: "value",
              splitLine: {
                show: true,
                lineStyle: {
                  type: "dashed",
                },
              },
            },
            series: [
              {
                name: lang.sale_text97,
                emphasis: {
                  focus: "series",
                },
                data: this.amountList, // y轴
                type: "bar",
                barWidth: "20px",
                color: ["#009EF7"],
              },
              {
                name: lang.sale_text98,
                emphasis: {
                  focus: "series",
                },
                data: this.commissionList, // y轴
                type: "bar",
                barWidth: "20px",
                color: ["#50CD89"],
                barGap: "-100%",
              },
            ],
          };

          this.option1 && this.myChart.setOption(this.option1);
        },
        getSaleChart() {
          const params2 = { sale_id: this.sale_id };
          saleStatistics(params2).then((res2) => {
            this.commission = res2.data.commission;
            const obj = {
              new: lang.sale_text99,
              renew: lang.sale_text100,
              repurchase: lang.sale_text101,
              other: lang.sale_text102,
            };
            const color = ["#3BA1FF", "#9860E5", "#50CD89", "#e5ff00"];
            res2.data.detail.forEach((item, i) => {
              item.value = item.price;
              item.name = obj[item.type];
              item.color = color[i];
            });
            this.detail = res2.data.detail;
            this.rank = res2.data.rank;
            this.pieData = this.detail;
            this.pietDom = document.getElementById("pie-chars");
            this.myPie = echarts.init(this.pietDom);
            this.option2 = {
              tooltip: {
                trigger: "item",
              },
              color: ["#3BA1FF", "#9860E5", "#50CD89", "#e5ff00"],
              series: [
                {
                  name: lang.sale_text103,
                  type: "pie",
                  radius: ["100%", "75%"],
                  avoidLabelOverlap: false,
                  label: {
                    show: false,
                    position: "center",
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontSize: "16",
                      fontWeight: "bold",
                    },
                  },
                  labelLine: {
                    show: false,
                  },
                  data: this.pieData,
                },
              ],
            };
            this.option2 && this.myPie.setOption(this.option2);
          });
        },
        selectTime(date) {
          if (date.length !== 0) {
            const start = new Date(date[0]).toISOString();
            const end = new Date(date[1]).toISOString();
            this.chartParams.start_time = new Date(start).getTime() / 1000;
            this.chartParams.end_time =
              new Date(end).getTime() / 1000 + 60 * 60 * 24;
            this.onLoadInit();
          } else {
            this.onChange();
          }
        },
        onChange(e) {
          let arr = [];
          if (e === "1") {
            // 本周
            arr = weekStartTimestamp();
          } else if (e === "2") {
            arr = lastWeekTimetamp();
          } else if (e === "3") {
            arr = monthStartTimestamp();
          } else if (e === "4") {
            arr = lastMonthTimetamp();
          } else if (e === "5") {
            arr = nowDayTimestamp();
          } else {
            arr = [];
          }
          this.chartParams.start_time = arr[0];
          this.chartParams.end_time = arr[1];
          this.onLoadInit();
        },
        onSelectChange(val) {
          this.sale_id = val;
          this.getSaleChart();
          this.onChange();
        },
        thousandth(num) {
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
      created() {
        this.getSaleList();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

(function (window, undefined) {
  var old_onload = window.onload
  window.onload = function () {
    const template = document.getElementsByClassName('statistics')[0]
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = window.moment
    new Vue({
      components: {
        comConfig
      },
      data () {
        return {
          data: [],
          tableLayout: false,
          hover: true,
          columns: [
            {
              colKey: 'date',
              title: lang.month,
              ellipsis: true,
              // width: 150,
              align: 'center'
            },
            {
              colKey: 'total',
              title: lang.total_income,
              ellipsis: true,
              align: 'center'
            },
          ],
          curYear: new Date().getFullYear(),
          time: new Date().getFullYear(),
          currency_prefix: JSON.parse(localStorage.getItem('common_set')).currency_prefix || '¥',
          currency_suffix: JSON.parse(localStorage.getItem('common_set')).currency_suffix || '元',
          curData: [],
          total: 0.00
        }
      },
      mounted () {
        window.addEventListener('resize', this.updateContainer, false);
      },
      computed: {
        formatMoney () {
          return money => {
            if (isNaN(money)) {
              return '0.00'
            } else {
              const temp = `${money}`.split('.')
              return parseInt(temp[0]).toLocaleString() + '.' + (temp[1] || '00')
            }
          }
        },
      },
      methods: {
        // 监听容器大小变化
        updateContainer () {
          this.monitorChart && this.monitorChart.resize({
            width: this.monitorContainer.clientWidth,
          });
        },
        // 获取line图表（中部左侧）
        getSaleChart () {
          if (!this.monitorContainer) {
            this.monitorContainer = document.getElementById('monitorContainer');
          }
          const chartColors = {
            textColor: 'rgba(0, 0, 0, 0.9)',
            placeholderColor: 'rgba(0, 0, 0, 0.35)',
            borderColor: '#dcdcdc',
            containerColor: '#fff',
          }
          this.monitorChart = echarts.init(this.monitorContainer);
          this.monitorChart.setOption(this.getLineChartDataSet(chartColors));
        },
        getLineChartDataSet ({ placeholderColor, borderColor, }) { // 中部左侧线图配置
          let timeArray = this.curData.reduce((all, cur) => {
            all.push(cur.date)
            return all
          }, [])
          let curPrice = []
          this.curData.forEach((item) => {
            curPrice.push((item.total * 1).toFixed(2))
          })
          const dataSet = {
            tooltip: {
              // trigger: 'item',
              trigger: 'axis',
              // formatter: '{b}<br>{c}'
              valueFormatter: (value) => this.currency_prefix + this.formatMoney(value) + ' ' + this.currency_suffix
            },
            grid: {
              left: '0',
              right: '20px',
              top: '50px',
              bottom: '30px',
              containLabel: true,
            },
            legend: {
              left: 'auto',
              top: '0',
              orient: 'horizontal', // legend 横向布局。
              textStyle: {
                fontSize: 12,
                color: placeholderColor,
              },
            },
            xAxis: {
              type: 'category',
              data: timeArray,
              axisLabel: {
                color: placeholderColor,
                interval: 0,
                rotate: 30
              },
              boundaryGap: false,
              axisLine: {
                lineStyle: {
                  width: 1,
                },
              }
            },
            yAxis: [
              {
                type: 'value',
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
                type: 'value',
                axisLabel: {
                  color: placeholderColor,
                },
                splitLine: {
                  lineStyle: {
                    color: borderColor,
                  },
                },
                alignTicks: true
              }
            ],
            series: [
              {
                //  name: this.time,
                data: curPrice,
                type: 'line',
                smooth: false,
                showSymbol: true,
                symbol: 'none',
                symbolSize: 8,
                areaStyle: {
                  normal: {
                    opacity: 0.1,
                  },
                }
              }
            ],
          };
          return dataSet;
        },
        changeNum (type) {
          if (type === 'add') {
            this.time += 1
          } else {
            this.time -= 1
          }
          this.getIncome()
        },
        async getIncome () {
          try {
            this.loading = true
            const res = await getExpectIncome()
            this.curData = res.data.data.list
            this.total = res.data.data.total
            this.loading = false
            this.getSaleChart()
          } catch (error) {
            console.log('error', error)
            this.loading = false
            this.$message.error(error.data.msg)
          }
        }
      },
      created () {
        this.getIncome()
      },
    }).$mount(template)
    typeof old_onload == 'function' && old_onload()
  };
})(window);

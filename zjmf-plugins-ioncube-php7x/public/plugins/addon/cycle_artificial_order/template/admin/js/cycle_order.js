(function (window, undefined) {
  var old_onload = window.onload
  window.onload = function () {
    const template = document.getElementsByClassName('cycle_order')[0]
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = window.moment
    const host = location.origin
    const fir = location.pathname.split('/')[1]
    const str = `${host}/${fir}/`
    new Vue({
      components: {
        comConfig,
        comChooseUser
      },
      data() {
        return {
          baseUrl: str,
          hover: true,
          tableLayout: false,
          delVisible: false,
          visible: false,
          loading: false,
          addTip: '',
          list: [],
          currency_prefix: JSON.parse(localStorage.getItem('common_set')).currency_prefix || '¥',
          typeColumns: [
            {
              colKey: 'id',
              title: 'ID',
              ellipsis: true,
              width: 100
            },
            {
              colKey: 'username',
              title: lang.user + '(' + lang.company + ')',
              width: 150,
              ellipsis: true
            },
            {
              colKey: 'description',
              title: `${lang.order}${lang.description}`,
              ellipsis: true,
              width: 200
            },
            {
              colKey: 'amount',
              title: lang.money,
              ellipsis: true,
              width: 100
            },
            {
              colKey: 'renew_amount',
              title: lang.renew_amount,
              ellipsis: true,
              width: 100
            },
            {
              colKey: 'time_range',
              title: lang.time_range,
              ellipsis: true,
              width: 150
            },
            {
              colKey: 'num',
              title: lang.create_period,
              ellipsis: true,
              width: 100
            },
            {
              colKey: 'op',
              title: lang.operation,
              width: 80
            },
          ],
          params: {
            keywords: '',
            page: 1,
            limit: 20,
            orderby: 'id',
            sort: 'desc',
          },
          total: 0,
          pageSizeOptions: [20, 50, 100],
          curId: '',
          optType: '',
          formData: {
            client_id: '',
            description: '',
            amount: null,
            start_time: '',
            end_time: '',
            num: null,
            unit: 'day',
            renew_amount: null
          },
          packageLoading: false,
          submitLoading: false,
          rules: {
            client_id: [
              { required: true, message: lang.select + lang.user, type: 'error' },
            ],
            description: [
              { required: true, message: lang.input + lang.order + lang.description, type: 'error' },
            ],
            num: [
              { required: true, message: lang.input + lang.create_period, type: 'error' },
              {
                pattern: /^([1-9][0-9]*)$/, message: lang.input + lang.verify16, type: 'warning'
              }
            ],
            start_time: [
              { required: true, message: lang.select + lang.start_time, type: 'error' },
            ],
            amount: [
              { required: true, message: lang.input + lang.traffic_price, type: 'error' },
            ],
            renew_amount:[
              { required: true, message: lang.input + lang.renew_amount, type: 'error' },
            ]
          },
          clientList: [],
          selectArr: [
            { value: 'day', label: lang.day },
            { value: 'month', label: lang.month },
            { value: 'year', label: lang.year },
          ],
          searchLoading: false,
          popupProps: {
            overlayInnerStyle: (trigger) => ({
              width: `${trigger.offsetWidth}px`,
              'max-height': '362px'
            }),
          },
          userParams: {
            keywords: '',
            page: 1,
            limit: 20,
            orderby: 'id',
            sort: 'desc'
          },
          userTotal: 0,
          userForm: {
            page: 1,
            limit: 20,
            keywords: ''
          },
        }
      },
      computed: {
        calcUnit() {
          return (val) => {
            return this.selectArr.filter(item => item.value === val)[0]?.label
          }
        }
      },
      filters: {
        filterMoney(money) {
          if (isNaN(money)) {
            return '0.00'
          } else {
            const temp = `${money}`.split('.')
            return parseInt(temp[0]).toLocaleString() + '.' + (temp[1] || '00')
          }
        }
      },
      methods: {
        changeUser (val) {
          this.formData.client_id = val
        },
        toDetails(row) {
          location.href = `cycle_order_details.htm?id=${row.id}&client_id=${row.client_id}`
        },
        // 添加人工订单
        addOrder() {
          this.optType = 'add'
          this.visible = true
          this.addTip = `${lang.create}${lang.cycle}${lang.order}`
          this.$nextTick(() => {
            this.$refs.userDialog && this.$refs.userDialog.reset()
            this.formData.end_time = ''
            this.formData.unit = 'day'
          })
        },
        async onSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.submitLoading = true
              const params = JSON.parse(JSON.stringify(this.formData))
              if (params.start_time) {
                params.start_time = parseInt(new Date(params.start_time).getTime() / 1000)
              }
              if (params.end_time) {
                params.end_time = parseInt(new Date(params.end_time).getTime() / 1000)
              }
              if (this.optType === 'add') {
                delete params.id
              }
              const res = await addAndUpdateCycleOrder(this.optType, params)
              this.$message.success(res.data.msg)
              this.getCycleOrderList()
              this.visible = false
              this.$refs.userDialog.reset()
              this.submitLoading = false
            } catch (error) {
              this.submitLoading = false
              this.$message.error(error.data.msg)
            }
          } else {
            console.log('Errors: ', validateResult)
            this.$message.warning(firstError)
          }
        },
        updateItem(row) {
          this.optType = 'update'
          this.addTip = `${lang.edit}${lang.cycle}${lang.order}`
          const temp = JSON.parse(JSON.stringify(row))
          temp.amount = temp.amount * 1 || 0.00
          temp.renew_amount = temp.renew_amount * 1 || 0.00
          temp.start_time = moment(temp.start_time * 1000).format('YYYY-MM-DD')
          temp.end_time = temp.end_time ? moment(temp.end_time * 1000).format('YYYY-MM-DD') : ''
          this.formData = temp
          setTimeout(() => {
            this.visible = true
          }, 0)
        },
        delteItem(row) {
          this.delVisible = true
          this.curId = row.id
        },
        async sureDelete() {
          try {
            this.submitLoading = true
            const res = await delCycleOrder({ id: this.curId })
            this.$message.success(res.data.msg)
            this.delVisible = false
            this.getCycleOrderList()
            this.submitLoading = false
          } catch (error) {
            this.submitLoading = false
            this.delVisible = false
            this.$message.error(error.data.msg)
          }
        },
        async getCycleOrderList() {
          try {
            this.loading = true
            const res = await getCycleOrder(this.params)
            this.list = res.data.data.list
            this.total = res.data.data.count
            this.loading = false
          } catch (error) {
            this.loading = false
            this.$message.error(error.data.msg)
          }
        },
        // 切换分页
        changePage(e) {
          this.params.page = e.current
          this.params.limit = e.pageSize
          this.getCycleOrderList()
        },
        clearKey() {
          this.params.keywords = ''
          this.seacrh()
        },
        seacrh() {
          this.params.page = 1
          this.getCycleOrderList()
        },
        handlerPro(pro) {
          pro.forEach(cur => {
            if (cur.child) {
              this.handlerPro(cur.child)
            } else {
              this.filterPro.push(cur)
            }
          })
        },
      },
      created() {
        this.getCycleOrderList()
      },
    }).$mount(template)
    typeof old_onload == 'function' && old_onload()
  }
})(window)

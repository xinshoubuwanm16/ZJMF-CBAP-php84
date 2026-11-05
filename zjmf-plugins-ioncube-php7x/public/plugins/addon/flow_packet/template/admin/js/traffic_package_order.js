(function (window, undefined) {
  var old_onload = window.onload
  window.onload = function () {
    const template = document.getElementsByClassName('traffic_package_order')[0]
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = window.moment
    const host = location.origin
    const fir = location.pathname.split('/')[1]
    const str = `${host}/${fir}/`
    new Vue({
      components: {
        comConfig
      },
      data () {
        return {
          baseUrl: str,
          hover: true,
          tableLayout: false,
          delVisible: false,
          loading: false,
          list: [],
          typeColumns: [
            {
              colKey: 'id',
              title: 'ID',
              ellipsis: true,
              width: 100
            },
            {
              colKey: 'username',
              title: lang.user,
              ellipsis: true,
              width: 150
            },
            {
              colKey: 'flow_packet_name',
              title: lang.traffic_product,
              ellipsis: true,
              width: 200
            },
            {
              colKey: 'host_name',
              title: lang.order_hosts,
              ellipsis: true,
              width: 200
            },
            {
              colKey: 'create_time',
              title: lang.order_time,
              ellipsis: true,
              width: 150
            },
            {
              colKey: 'amount',
              title: lang.traffic_order_amount,
              ellipsis: true,
              width: 150
            },
            {
              colKey: 'status',
              title: lang.pay_status,
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
            status: '',
          },
          total: 0,
          pageSizeOptions: [20, 50, 100],
          curId: '',
          delLoading: false,
          currency_prefix: JSON.parse(localStorage.getItem('common_set')).currency_prefix || '¥'
        }
      },
      filters: {
        filterMoney (money) {
          if (isNaN(money)) {
            return '0.00'
          } else if (money === null) {
            return '--'
          } else {
            const temp = `${money}`.split('.')
            return parseInt(temp[0]).toLocaleString() + '.' + (temp[1] || '00')
          }
        }
      },
      computed: {
        calcPayStatus () {
          return (val) => {
            return this.payStatus.filter(item => item.value === val)[0]?.label
          }
        },
        calcStatus () {
          return (val) => {
            return this.statusList.filter(item => item.value === val)[0]?.label
          }
        }
      },
      methods: {
        updateItem (row) {
          location.href = `${this.baseUrl}order_details.htm?id=${row.order_id}`
        },
        delteItem (row) {
          this.delVisible = true
          this.curId = row.id
        },
        async sureDelete () {
          try {
            this.delLoading = true
            const res = await delPacketOrder({ id: this.curId })
            this.$message.success(res.data.msg)
            this.delVisible = false
            this.getPacketOrderList()
            this.delLoading = false
          } catch (error) {
            this.delLoading = false
            this.delVisible = false
            this.$message.error(error.data.msg)
          }
        },
        async getPacketOrderList () {
          try {
            this.loading = true
            const res = await getPacketOrder(this.params)
            this.list = res.data.data.list
            this.total = res.data.data.count
            this.loading = false
          } catch (error) {
            this.loading = false
            this.$message.error(error.data.msg)
          }
        },
        // 切换分页
        changePage (e) {
          this.params.page = e.current
          this.params.limit = e.pageSize
          this.getPacketOrderList()
        },
        clearKey () {
          this.params.keywords = ''
          this.seacrh()
        },
        seacrh () {
          this.params.page = 1
          this.getPacketOrderList()
        }
      },
      created () {
        this.getPacketOrderList()
      },
    }).$mount(template)
    typeof old_onload == 'function' && old_onload()
  }
})(window)

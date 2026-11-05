(function (window, undefined) {
  var old_onload = window.onload
  window.onload = function () {
    const template = document.getElementsByClassName('credit_limit')[0]
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
      data () {
        return {
          baseUrl: str,
          data: [],
          tableLayout: false,
          bordered: true,
          visible: false,
          delVisible: false,
          statusVisble: false,
          hover: true,
          virtualScroll: false,
          currency_prefix: JSON.parse(localStorage.getItem('common_set')).currency_prefix,
          currency_suffix: JSON.parse(localStorage.getItem('common_set')).currency_suffix,
          columns: [
            {
              colKey: 'id',
              title: 'ID',
              width: 90,
              sortType: 'all',
              sorter: true
            },
            {
              colKey: 'username',
              title: lang.user,
              width: 200,
              ellipsis: true
            },
            {
              colKey: 'credit_limit',
              title: lang.credit_line,
              width: 150,
              ellipsis: true
            },
            {
              colKey: 'credit_term',
              title: lang.credit_term,
              width: 200,
              ellipsis: true
            },
            {
              colKey: 'remaining_amount',
              title: lang.remaining_amount,
              width: 150,
              ellipsis: true
            },
            {
              colKey: 'day',
              title: `${lang.billing_date}/${lang.repayment_date}`,
              width: 100,
              ellipsis: true
            },
            {
              colKey: 'status',
              title: lang.credit_status,
              width: 100,
              ellipsis: true
            },
            {
              colKey: 'notes',
              title: lang.notes,
              width: 200,
              ellipsis: true
            },
            {
              colKey: 'op',
              title: lang.operation,
              width: 100,
              ellipsis: true
            },
          ],
          hideSortTips: true,
          params: {
            keywords: '',
            page: 1,
            limit: 20,
            orderby: 'id',
            sort: 'desc',
            status: ''
          },
          total: 0,
          pageSizeOptions: [20, 50, 100],
          formData: { // 添加授信
            client_id: '',
            start_time: '',
            end_time: '',
            credit_limit: null,
            statement_date: null,
            repayment_date: null,
            notes: '',
            range1: [],
            status: 'Suspended',
          },
          rules: {
            client_id: [
              { required: true, message: lang.select + lang.credit_user, type: 'error' },
            ],
            start_time: [
              { required: true, message: lang.select + lang.credit_start_time, type: 'error' },
            ],
            end_time: [
              { required: true, message: lang.select + lang.credit_end_time, type: 'error' },
            ],
            credit_limit: [
              { required: true, message: lang.input + lang.credit_line, type: 'error' },
            ],
            statement_date: [
              { required: true, message: lang.input + lang.billing_date, type: 'error' },
            ],
            repayment_date: [
              { required: true, message: lang.input + lang.repayment_date, type: 'error' },
            ],
          },
          loading: false,
          country: [],
          delId: '',
          curStatus: 1,
          statusTip: '',
          addTip: '',
          langList: [],
          roleTotal: 0,
          roleList: [],
          optType: 'create',
          curId: '',
          roleParams: {
            page: 1,
            limit: 20
          },
          popupProps: {
            overlayInnerStyle: (trigger) => ({ width: `${trigger.offsetWidth}px` })
          },
          maxHeight: '',
          creditStatus: [
            { value: 'Active', label: lang.credit_active },
            { value: 'Suspended', label: lang.Suspended },
            { value: 'Expired', label: lang.promo_expiration },
            { value: 'Overdue', label: lang.credit_overdue },
          ],
          range: [],
          clientList: [],
          userForm: {
            page: 1,
            limit: 20,
            keywords: ''
          },
          userTotal: 0,
          clientLoading: false,
          clientName: '',
          submitLoading: false,
          orderParams: {
            client_id: '',
            page: 1,
            limit: 20
          },
          recordVisble: false,
          recordTotal: 0,
          recordLoading: false,
          recordList: [],
          recordColumns: [
            {
              colKey: 'id',
              title: 'ID',
              width: 100,
            },
            {
              colKey: 'client_name',
              title: lang.user + '(' + lang.company + ')',
              width: 250,
              ellipsis: true
            },
            {
              colKey: 'icon',
              width: 16,
              className: 'icon-width'
            },
            {
              colKey: 'product_names',
              title: lang.product_name,
              // ellipsis: true,
              width: 250,
              className: 'text-overflow'
            },
            {
              colKey: 'amount',
              title: lang.money_cycle,
              ellipsis: true,
              width: 150
            },
            {
              colKey: 'gateway',
              title: lang.pay_way,
              width: 170,
              ellipsis: true
            },
            {
              colKey: 'pay_time',
              title: lang.pay_time,
              width: 170,
              ellipsis: true
            },
            {
              colKey: 'status',
              title: lang.status,
              width: 100,
              ellipsis: true
            },
            // {
            //   colKey: 'op',
            //   title: lang.operation,
            //   width: 120
            // }
          ],
          temp_status: '',
          // 管理员
          adminList: [],
          optSelect: [
            { value: 'credit_limit', label: lang.credit_opt1 },
            { value: 'start_time', label: lang.credit_opt2 },
            { value: 'end_time', label: lang.credit_opt3 },
            { value: 'statement_date', label: lang.credit_opt4 },
            { value: 'repayment_date', label: lang.credit_opt5 },
            { value: 'status', label: lang.credit_opt6 },
          ],
          // 授信操作记录
          optParams: {
            page: 1,
            limit: 20,
            type: '',
            client_id: '',
            admin_id: ''
          },
          optTotal: 0,
          optList: [],
          optLoading: false,
          optColumns: [
            {
              colKey: 'type',
              title: lang.opt_type,
              width: 100,
              ellipsis: true
            },
            {
              colKey: 'admin_name',
              title: lang.operator,
              width: 100,
              ellipsis: true
            },
            {
              colKey: 'create_time',
              title: lang.opt_date,
              width: 150,
              ellipsis: true
            },
            {
              colKey: 'old',
              title: lang.before_change,
              width: 100,
              ellipsis: true
            },
            {
              colKey: 'new',
              title: lang.after_change,
              width: 100,
              ellipsis: true
            }
          ],
          father_order_id: '',
          disableDate: {}
        }
      },
      computed: {
        hideEdit () {
          return this.formData.status === 'Overdue'
        },
        calcType () {
          return (type) => {
            return this.optSelect.filter(item => item.value === type)[0]?.label
          }
        }
      },
      filters: {
        filterMoney (money) {
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
        focusDate (e) {
          if (!e.value[0]) {
            this.disableDate = { after: moment().subtract(0, 'day').format() }
          }
        },
        changeDate (e) {
          this.disableDate = {}
        },
        changeState (val) {
          if (val < 1) {
            this.formData.statement_date = 1
          }
        },
        changeRepayment (val) {
          if (val < 1) {
            this.formData.repayment_date = 1
          }
        },
        /* 查看订单记录 */
        lookRecord (row) {
          this.orderParams.client_id = row.client_id
          this.recordVisble = true
          this.getOrderList()
        },
        async getOrderList () {
          try {
            this.recordLoading = true
            const res = await getCreditOrder(this.orderParams)
            this.recordList = res.data.data.list.map(item => {
              item.list = []
              item.isExpand = false
              return item
            })
            this.recordTotal = res.data.data.count
            this.recordLoading = false
          } catch (error) {
            this.recordLoading = false
            this.$message.error(error.data.msg)
          }
        },
        // id点击获取订单详情
        itemClick (row) {
          if (row.order_item_count < 2) {
            return
          }
          row.isExpand = row.isExpand ? false : true
          const rowData = this.$refs.table.getData(row.id);
          this.$refs.table.toggleExpandData(rowData);
          if (row.list?.length > 0) {
            return
          }
          this.father_order_id = row.id
          this.getOrderDetail(row.id)
        },
        // 订单详情
        async getOrderDetail (id) {
          try {
            const res = await getOrderDetails(id)
            res.data.data.order.items.forEach(item => {
              item.pId = res.data.data.order.id
              this.$refs.table.appendTo(id, item)
            })
          } catch (error) {
            console.log('error', error)
          }
        },
        // 获取管路员
        async getAdminList () {
          try {
            const res = await getAdmin({ page: 1, limit: 9999 })
            this.adminList = res.data.data.list
          } catch (error) {

          }
        },
        /* 查看订单记录 end */

        // 获取列表
        async getCreditList () {
          try {
            this.loading = true
            const res = await getCreditLimit(this.params)
            this.loading = false
            this.data = res.data.data.list
            this.total = res.data.data.count
          } catch (error) {
            this.loading = false
          }
        },

        // 切换分页
        changePage (e) {
          this.params.page = e.current
          this.params.limit = e.pageSize
          this.getCreditList()
        },
        changePageRecord (e) {
          this.orderParams.page = e.current
          this.orderParams.limit = e.pageSize
          this.getOrderList()
        },
        changePageOpt (e) {
          this.optParams.page = e.current
          this.optParams.limit = e.pageSize
          this.getCreditLogs()
        },
        // 排序
        sortChange (val) {
          if (val === undefined) {
            this.params.orderby = 'id'
            this.params.sort = 'desc'
          } else {
            this.params.orderby = val.sortBy
            this.params.sort = val.descending ? 'desc' : 'asc'
          }
          this.getCreditList()
        },
        clearKey () {
          this.params.keywords = ''
          this.seacrh()
        },
        seacrh () {
          this.params.page = 1
          if (this.range.length > 0) {
            this.params.start_time = new Date(this.range[0].replace(/-/g, '/')).getTime() / 1000 || ''
            this.params.end_time = (new Date(this.range[1].replace(/-/g, '/')).getTime() + 24 * 3600 * 1000) / 1000 || ''
          } else {
            this.params.start_time = ''
            this.params.end_time = ''
          }
          this.getCreditList()
        },
        // 添加授信
        addUser () {
          this.optType = 'add'
          this.visible = true
          this.addTip = lang.add_credit
          this.formData = {
            client_id: '',
            start_time: '',
            end_time: '',
            credit_limit: null,
            statement_date: null,
            repayment_date: null,
            notes: '',
            range1: [],
            status: 'Suspended',
          }
          this.$refs.userDialog && this.$refs.userDialog.reset()
          this.userForm.page = 1
          this.userForm.keywords = ''
          this.clientList = []
        },
        async onSubmit ({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.submitLoading = true
              const params = JSON.parse(JSON.stringify(this.formData))
              params.start_time = new Date( params.start_time.replace(/-/g, '/')).getTime() / 1000 || ''
              params.end_time = (new Date(params.end_time.replace(/-/g, '/')).getTime() + 24 * 3600 * 1000 - 1000) / 1000 || ''
              if (this.optType === 'add') {
                delete params.status
              }
              delete params.range1
              const res = await addAndUpdateCredit(this.optType, params)
              this.$message.success(res.data.msg)
              this.getCreditList()
              this.visible = false
              this.$refs.userDialog.reset()
              this.submitLoading = false
            } catch (error) {
              this.submitLoading = false
              this.$message.error(error.data.msg)
            }
          } else {
            console.log('Errors: ', validateResult);
            this.$message.warning(firstError);
          }
        },
        // 编辑授信
        updateAdmin (row) {
          this.optType = 'update'
          this.temp_status = row.status
          let temp_status = ''
          switch (row.status) {
            case 'Active':
              temp_status = lang.credit_active
              break;
            case 'Suspended':
              temp_status = lang.Suspended
              break;
            case 'Expired':
              temp_status = lang.promo_expiration
              break;
            case 'Overdue':
              temp_status = lang.credit_overdue
              break;
          }
          // 获取授信详情
          this.getCredDetail({ id: row.id })
          // 获取授信日志
          this.optParams.client_id = row.client_id
          this.optParams.type = ''
          this.getCreditLogs()
          this.visible = true
          this.addTip = `${lang.credit_details}-${temp_status}`
        },
        filterMethod() {
          return true;
        },
        async getCredDetail (id) {
          try {
            const res = await getCreditLimitDetails(id)
            const temp = res.data.data.credit_limit
            temp.range1 = []
            temp.client_id = String(temp.client_id)
            temp.start_time = moment(temp.start_time * 1000).format('YYYY-MM-DD')
            temp.end_time = moment(temp.end_time * 1000).format('YYYY-MM-DD')
            temp.credit_limit = temp.credit_limit * 1
            temp.status = temp.status === 'Active' ? 'Active' : 'Suspended'
            this.formData = temp
          } catch (error) {
            console.log('error', error)
          }
        },
        async getCreditLogs () {
          try {
            this.optLoading = true
            const res = await getCreditLog(this.optParams)
            this.optList = res.data.data.list
            this.optTotal = res.data.data.count
            this.optLoading = false
          } catch (error) {
            this.optLoading = false
          }
        },
        closeDialog () {
          this.statusVisble = false
        },
      },
      created () {
        this.getCreditList()
        this.getAdminList()
      },
    }).$mount(template)
    typeof old_onload == 'function' && old_onload()
  };
})(window);

(function (window, undefined) {
  var old_onload = window.onload
  window.onload = function () {
    const template = document.getElementsByClassName('traffic_package_manage')[0]
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
              colKey: 'name',
              title: lang.traffic_package_name,
              ellipsis: true,
              width: 150
            },
            {
              colKey: 'capacity',
              title: `${lang.cloud_flow}（GB）`,
              ellipsis: true,
              width: 100
            },
            {
              colKey: 'price',
              title: lang.traffic_price,
              ellipsis: true,
              width: 100
            },
            {
              colKey: 'product',
              title: lang.traffic_association,
              ellipsis: true,
              width: 350
            },
            {
              colKey: 'status',
              title: lang.status,
              ellipsis: true,
              width: 100
            },
            {
              colKey: 'stock',
              title: lang.inventory,
              ellipsis: true,
              width: 100
            },
            {
              colKey: 'notes',
              title: lang.notes,
              ellipsis: true,
              width: 200
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
            status: ''
          },
          total: 0,
          pageSizeOptions: [20, 50, 100],
          curId: '',
          optType: '',
          formData: {
            name: '',
            capacity: null,
            price: null,
            stock: null,
            stock_enable: 0,
            product_id: [],
            notes: ''
          },
          packageLoading: false,
          submitLoading: false,
          rules: {
            name: [
              { required: true, message: lang.input + lang.nickname, type: 'error' },
            ],
            capacity: [
              { required: true, message: lang.input + lang.cloud_flow, type: 'error' },
            ],
            price: [
              { required: true, message: lang.input + lang.traffic_price, type: 'error' },
            ],
            product_id: [
              { required: true, message: lang.select + lang.traffic_association, type: 'error' },
            ],
          },
          productList: [],
          filterPro: []
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
        // 添加包
        addPackage () {
          this.optType = 'add'
          this.visible = true
          this.addTip = `${lang.order_new}${lang.traffic_package}`
          this.formData.stock = null
          this.formData.stock_enable = 0
          this.formData.notes = ''
          this.$refs.userDialog && this.$refs.userDialog.reset()
        },
        async onSubmit ({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.submitLoading = true
              const params = JSON.parse(JSON.stringify(this.formData))
              if (this.optType === 'add') {
                delete params.id
              }
              if (!params.stock) {
                params.stock = 0
              }
              const res = await addAndUpdatePacket(this.optType, params)
              this.$message.success(res.data.msg)
              this.getPackageList()
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
        updateItem (row) {
          this.optType = 'update'
          this.addTip = `${lang.edit}${lang.traffic_package}`
          const temp = JSON.parse(JSON.stringify(row))
          temp.product_id = temp.product.reduce((all, cur) => {
            all.push(cur.id)
            return all
          }, [])
          temp.price = temp.price * 1 || 0
          delete temp.product
          this.formData = temp
          this.visible = true
        },
        delteItem (row) {
          this.delVisible = true
          this.curId = row.id
        },
        async sureDelete () {
          try {
            this.submitLoading = true
            const res = await delPacket({ id: this.curId })
            this.$message.success(res.data.msg)
            this.delVisible = false
            this.getPackageList()
            this.submitLoading = false
          } catch (error) {
            this.submitLoading = false
            this.delVisible = false
            this.$message.error(error.data.msg)
          }
        },
        changeStock (val) {
          if (val && !this.formData.stock) {
            this.formData.stock = 1
          }
        },
        async changeStatus (item) {
          try {
            const res = await changePacketStatus({
              id: item.id,
              status: item.status ? 0 : 1
            })
            this.$message.success(res.data.msg)
            this.getPackageList()
          } catch (error) {
            this.$message.error(error.data.msg)
          }
        },
        async getPackageList () {
          try {
            this.loading = true
            const res = await getPacket(this.params)
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
          this.getPackageList()
        },
        clearKey () {
          this.params.keywords = ''
          this.seacrh()
        },
        seacrh () {
          this.params.page = 1
          this.getPackageList()
        },
        handlerPro (pro) {
          pro.forEach(cur => {
            if (cur.child) {
              this.handlerPro(cur.child)
            } else {
              this.filterPro.push(cur)
            }
          })
        },
        async getProductList () {
          try {
            const res = await getProduct({
              module: ['mf_cloud', 'mf_dcim']
            })
            const temp = res.data.data.list
            this.handlerPro(temp)
          } catch (error) {
            this.$message.error(error.data.msg)
          }
        }
      },
      created () {
        this.getProductList()
        this.getPackageList()
      },
    }).$mount(template)
    typeof old_onload == 'function' && old_onload()
  }
})(window)

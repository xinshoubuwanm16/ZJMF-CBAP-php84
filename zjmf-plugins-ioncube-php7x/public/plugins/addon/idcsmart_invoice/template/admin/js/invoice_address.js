(function (window, undefined) {
  var old_onload = window.onload
  window.onload = function () {
    const template = document.getElementsByClassName('invoice-address')[0]
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang)
    Vue.prototype.moment = moment
    const host = location.origin
    const fir = location.pathname.split('/')[1]
    new Vue({
      components: {
        comConfig
      },
      data () {
        return {
          maxHeight: 0,
          params: {
            keywords: '',
            page: 1,
            limit: 20,
            orderby: 'id',
            sort: 'desc'
          },
          baseUrl: `${host}/${fir}/`,
          total: 100,
          pageSizeOptions: [20, 50, 100],
          data: [],
          loading: false,
          columns: [
            {
              colKey: 'row-select',
              type: 'multiple',
              className: 'demo-multiple-select-cell',
              width: 30,
            },

            {
              colKey: 'username',
              title: lang.invoice_tab5,
              width: 200,
              ellipsis: true
            },

            {
              colKey: 'rec_type',
              title: lang.invoice_label5,
              width: 200,
              ellipsis: true
            },
            {
              colKey: 'address',
              title: lang.invoice_label22,
              width: 400,
              ellipsis: true
            },
            {
              colKey: 'operation',
              title: lang.invoice_tab10,
              width: 50
            },
          ],
          selectedRowKeys: [],
          delVisible: false,
          delId: null,
          // true 单独删除 false 批量删除
          isOne: false,
          submitLoading: false
        }
      },
      methods: {
        // 切换分页
        changePage (e) {
          this.params.page = e.current
          this.params.limit = e.pageSize
          this.params.keywords = ''
          this.seacrh()
        },
        seacrh () {
          this.getData()
        },
        clearKey () {
          this.params.keywords = ''
          this.seacrh()
        },
        getData () {
          this.loading = true
          const params = {
            ...this.params
          }
          invoiceAddress(params).then(res => {
            if (res.data.status == 200) {
              this.data = res.data.data.list
              this.total = res.data.data.count
            }
            this.loading = false
          }).catch(error => {
            this.loading = false
            this.$message.error(error.data.msg)
          })
        },
        del (row) {
          this.isOne = true
          this.delId = row.id
          this.delVisible = true
        },
        // 批量删除
        delTitles () {
          if (this.selectedRowKeys.length == 0) {
            this.$message.warning(lang.invoice_tips2)
            return
          }
          this.isOne = false
          this.delVisible = true

        },
        // 确认删除
        delSubmit () {
          const params = {
            id: []
          }
          if (this.isOne) {
            let id = []
            id.push(this.delId)
            params.id = id
          } else {
            params.id = this.selectedRowKeys
          }
          this.submitLoading = true
          delInvoiceAddress(params).then(res => {
            if (res.data.status == 200) {
              this.$message.success(res.data.msg)
              this.getData()
              this.delVisible = false
            }
          }).catch(error => {
            this.$message.error(error.data.msg)
          }).finally(() => {
            this.submitLoading = false;
          });
        },
        rehandleSelectChange (value, { selectedRowData }) {
          this.selectedRowKeys = value
        },
      },
      created () {
        this.getData()
      },
    }).$mount(template)
    typeof old_onload == 'function' && old_onload()
  }
})(window);

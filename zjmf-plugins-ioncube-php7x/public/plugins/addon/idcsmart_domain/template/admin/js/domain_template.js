(function (window, undefined) {
  var old_onload = window.onload
  window.onload = function () {
    const template = document.getElementsByClassName('domain_list')[0]
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = window.moment
    const host = location.origin
    const fir = location.pathname.split('/')[1]
    const str = `${host}/${fir}/`
    new Vue({
      components: {
        comConfig,
      },
      data () {
        return {
          baseUrl: str,
          data: [],
          tableLayout: false,
          bordered: true,
          visible: false,
          tempVisible: false,
          delVisible: false,
          hover: true,
          virtualScroll: false,
          currency_prefix: JSON.parse(localStorage.getItem('common_set')).currency_prefix,
          currency_suffix: JSON.parse(localStorage.getItem('common_set')).currency_suffix,
          columns: [
            {
              colKey: 'drag',
              width: 40,
              className: 'drag-icon'
            },
            {
              colKey: 'id',
              title: 'ID',
              width: 90,
              // sortType: 'all',
              // sorter: true
            },
            {
              colKey: 'module_name',
              title: lang.web_address_module,
              width: 250,
              ellipsis: true
            },
            {
              colKey: 'increase_percent',
              title: lang.price_float,
              ellipsis: true,
            },
            {
              colKey: 'transfer',
              title: lang.acounts_transfer,
              ellipsis: true
            },
            {
              colKey: 'certification',
              title: lang.need_real_name,
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
          loading: false,
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
          domainName: '',
          /* 后缀 */
          suffixData: [],
          suffixForm: {
            id: '',
            module_id: '',
            suffix: '',
            description: '',
            allow_zh: 0
          },
          suffixColumns: [
            {
              colKey: 'suffix',
              title: lang.suffix,
              ellipsis: true
            },
            {
              colKey: 'description',
              title: lang.suffix_profile,
              ellipsis: true
            },
            {
              colKey: 'allow_zh',
              title: lang.allow_chinese,
              ellipsis: true
            },
            {
              colKey: 'op',
              title: lang.operation,
              width: 100,
              ellipsis: true
            }
          ],
          delId: '',
          tempData: {
            id: '',
            increase_percent: null,
            transfer: 0,
            certification: 0
          },
          suffixTitle: lang.add,
          rules: {
            suffix: [
              { required: true, message: `${lang.input}${lang.suffix}`, type: 'error', trigger: 'blur' },
              {
                pattern: /^\.(?:[a-zA-Z0-9\u4e00-\u9fa5]+\.)*[a-zA-Z0-9\u4e00-\u9fa5]+$/i, message: lang.domain_tip6, type: 'warning'
              }
            ],
          },
          tempRules: {
            APIKey: [
              { required: true, message: `${lang.input}APIKey`, type: 'error' },
            ],
          },
          optType: '',
          showSuffix: false, // 是否展示后缀
          suffixLoading: false,
          curModuleId: ''
        }
      },
      computed: {
        calcWidth () {
          return localStorage.getItem('backLang') === 'zh-cn' ? '500' : '600'
        }
      },
      methods: {
        /* 新增后缀 */
        addSuffix () {
          this.optType = 'add'
          this.visible = true
          this.suffixTitle = `${lang.order_text53}${lang.suffix}`
          this.suffixForm = {
            module_id: this.curModuleId,
            suffix: '',
            description: '',
            allow_zh: 0
          }
          this.$nextTick(() => {
            this.$refs.suffixDialog && this.$refs.suffixDialog.clearValidate()
          })
        },
        editItem (row) {
          this.optType = 'update'
          this.visible = true
          this.suffixTitle = `${lang.edit}${lang.suffix}`
          this.suffixForm = JSON.parse(JSON.stringify(row))
        },
        delItem (row) {
          this.delId = row.id
          this.delVisible = true
        },
        async sureDelete () {
          try {
            this.submitLoading = true
            const res = await deleteSuffix({
              module_id: this.curModuleId,
              id: this.delId
            })
            this.$message.success(res.data.msg)
            this.getSuffixList()
            this.delVisible = false
            this.submitLoading = false
          } catch (error) {
            this.submitLoading = false
            this.$message.error(error.data.msg)
          }
        },
        async submitSuffix ({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.submitLoading = true
              const params = JSON.parse(JSON.stringify(this.suffixForm))
              if (this.optType === 'add') {
                delete params.id
              } else {
                delete params.module_id
                delete params.suffix
              }
              const res = await addAndUpdateSuffix(this.optType, params)
              this.$message.success(res.data.msg)
              this.getSuffixList()
              this.visible = false
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
        async changeZh (row) {
          try {
            const res = await addAndUpdateSuffix('update', {
              id: row.id,
              description: row.description,
              allow_zh: row.allow_zh ? 0 : 1
            })
            this.$message.success(res.data.msg)
            this.getSuffixList()
          } catch (error) {
            this.$message.error(error.data.msg)
          }
        },
        async submitTemp ({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.submitLoading = true
              const res = await changeDomainModule(this.tempData)
              this.$message.success(res.data.msg)
              this.tempVisible = false
              this.getTempList()
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
        // 展示后缀
        suffixManage (row) {
          this.showSuffix = true
          this.curModuleId = row.id
          this.getSuffixList()
        },
        lookDetails (row) {
          this.domainName = row.module_name
          this.tempVisible = true
          const temp = JSON.parse(JSON.stringify(row))
          temp.increase_percent = temp.increase_percent * 1 || 0
          this.tempData = temp
        },
        close () {
          this.visible = false
        },
        // 拖拽排序
        async changeSort (e) {
          try {
            if (this.data.length < 2) {
              return
            }
            this.data = e.newData
            const tempArr = e.newData.reduce((all, cur) => {
              all.push(cur.id)
              return all
            }, [])
            const params = {
              id: tempArr
            }
            const res = await changeDomainModuleSort(params)
            this.$message.success(res.data.msg)
            this.getTempList()
          } catch (error) {
            this.$message.error(error.data.msg)
          }
        },
        async changeStatus (row, type) {
          try {
            const params = JSON.parse(JSON.stringify(row))
            params[type] = params[type] === 1 ? 0 : 1
            delete params.module
            delete params.module_name
            const res = await changeDomainModule(params)
            this.$message.success(res.data.msg)
            this.getTempList()
          } catch (error) {
            this.$message.error(error.data.msg)
          }
        },
        // 后缀列表
        async getSuffixList () {
          try {
            this.suffixLoading = true
            const res = await getDomainSuffix({ module_id: this.curModuleId })
            this.suffixLoading = false
            this.suffixData = res.data.data.list
          } catch (error) {
            this.suffixLoading = false
          }
        },
        // 获取列表
        async getTempList () {
          try {
            this.loading = true
            const res = await getDomainModule(this.params)
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
          this.getTempList()
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
          this.getTempList()
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
          this.getTempList()
        },
        closeDialog () {
          this.statusVisble = false
        }
      },
      created () {
        if (!this.$checkPermission('auth_idcsmart_domain_server_order')) {
          this.columns.splice(0,1)
        }
        this.getTempList()
      },
    }).$mount(template)
    typeof old_onload == 'function' && old_onload()
  }
})(window)

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
        comConfig
      },
      data () {
        return {
          baseUrl: str,
          data: [],
          tableLayout: false,
          bordered: true,
          visible: false,
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
              colKey: 'domain',
              title: lang.domain_name,
              width: 150,
              ellipsis: true
            },
            {
              colKey: 'status',
              title: lang.domain_status,
              width: 130,
              ellipsis: true
            },
            {
              colKey: 'zh_owner',
              title: lang.domain_owner,
              width: 150,
              ellipsis: true
            },
            {
              colKey: 'username',
              title: lang.belong_user,
              width: 200,
              ellipsis: true
            },
            {
              colKey: 'create_time',
              title: lang.register_time,
              width: 150,
              ellipsis: true
            },
            {
              colKey: 'expiredate',
              title: lang.due_time,
              width: 200,
              ellipsis: true
            },
            {
              colKey: 'module_name',
              title: lang.registrant,
              width: 100,
              ellipsis: true
            },
            {
              colKey: 'op',
              title: lang.operation,
              width: 80,
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
            { value: '0', label: lang.no_upload_picture },
            { value: '1', label: lang.examine_pass },
            { value: '2', label: lang.examining },
            { value: '3', label: lang.examine_reject },
            { value: '4', label: lang.examine_abnormal },
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
          curDomain: {},
          certificateType: [
            { value: 0, label: lang.not_certified },
            { value: 1, label: lang.certified },
            { value: 2, label: lang.under_certification }
          ],
          idTypeArr: [
            'SFZ', 'HZ', 'GAJMTX', 'TWJMTX', 'WJLSFZ', 'GAJZZ',
            'ORG', 'YYZZ', 'TYDM', 'BDDM', 'JDDWFW', 'SYDWFR',
            'WGCZJG', 'SHTTFR', 'ZJCS', 'MBFQY', 'JJHFR', 'LSZY',
            'WGZHWH', 'WLCZJG', 'SFJD', 'SHFWJG', 'MBXXBX', 'YLJGZY',
            'JWJG', 'GZJGZY', 'BJWSXX', 'QTTYDM'
          ],
          idType: []
        }
      },
      computed: {
        calcDueTime () {
          return (time) => {
            time = new Date()
            const futureDate = moment(new Date())
            const today = moment()
            const daysUntilFutureDate = futureDate.diff(today, 'days')
            return daysUntilFutureDate
          }
        },
        calcStatus () {
          return status => {
            return this.creditStatus.filter(item => item.value === status)[0]?.label
          }
        },
        calcType () {
          return type => {
            return this.idType.filter(item => item.value === type)[0]?.label
          }
        },
        calcCertificate () {
          return type => {
            return this.certificateType.filter(item => item.value === type)[0]?.label
          }
        }
      },
      methods: {
        async lookDetails (row) {
          try {
            this.visible = true
            const res = await getDomainDetails({ id: row.id })
            this.curDomain = res.data.data.domain
          } catch (error) {
            this.visible = false
            this.$message.error(error.data.msg)
          }
        },
        close () {
          this.visible = false
        },
        // 获取列表
        async getDomainList () {
          try {
            this.loading = true
            const res = await getDomain(this.params)
            this.loading = false
            this.data = res.data.data.list
            this.total = res.data.data.count
          } catch (error) {
            this.$message.error(error.data.msg)
            this.loading = false
          }
        },
        // 切换分页
        changePage (e) {
          this.params.page = e.current
          this.params.limit = e.pageSize
          this.getDomainList()
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
          this.getDomainList()
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
          this.getDomainList()
        },
        closeDialog () {
          this.statusVisble = false
        }
      },
      created () {
        this.idType = this.idTypeArr.reduce((all, cur) => {
          all.push({
            value: cur,
            label: lang[`id_type_${cur}`]
          })
          return all
        }, [])
        this.getDomainList()
      },
    }).$mount(template)
    typeof old_onload == 'function' && old_onload()
  }
})(window)

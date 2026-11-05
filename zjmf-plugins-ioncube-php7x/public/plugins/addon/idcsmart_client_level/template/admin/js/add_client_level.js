(function (window, undefined) {
  var old_onload = window.onload
  window.onload = function () {
    const template = document.getElementsByClassName('add-client-level')[0]
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        comConfig
      },
      data () {
        return {
          id: '',
          formData: {
            name: '',
            background_color: '',
            notes: '',
            discount_status: 1,
            product: [],
          },
          /* 初始化三级数据 */
          shopList: [],
          baiduData: [],
          firstGroup: [],
          tempSecondGroup: [],
          productList: [], // 商品可选列表
          groupList: [], // 一二级分组组装数据
          curNum: 0,
          treeProps: {
            keys: {
              label: 'name',
              value: 'key',
              children: 'children',
            },
          },
          isShowBaidu: false,
          visibleTreeObj: [],
          loading: false,
          swatchColors: [
            '#F9F1BC', '#FDC0AD', '#E6C2FB', '#C0D0FB', '#ACEFD2', '#A8DEF6', '#D2F195', '#F89EC8', '#B6A9F6', '#A7F2FE'
          ],
          rules: {
            name: [
              { required: true, message: `${lang.input}${lang.clinet_level}`, type: 'error' },
              { validator: val => val.length <= 15, message: lang.verify3 + 15, type: 'warning' }
            ],
            background_color: [
              { required: true, message: `${lang.select}${lang.representative_color}`, type: 'error' },
            ],
            discount_percent: [
              { required: true, message: `${lang.input}${lang.discount_ratio}`, type: 'error' },
              { pattern: /^\d{1,2}(\.\d{1,2})?$|^100(\.0{1,2})?$/, message: `${lang.input}0-100${lang.verify2}`, type: 'warning' },
            ],
          },
          hover: true,
          tableLayout: false,
          replayColumns: [
            {
              colKey: 'tailorism',
              title: lang.tailorism,
              ellipsis: true
            },
            {
              colKey: 'ratio',
              title: 'title-slot-name',
              ellipsis: true
            },
            {
              colKey: 'op',
              title: lang.operation,
              width: 120
            }
          ],
          optType: "",
          curProArr: [],
          editStatus: false,
          tempData: [],
          tempIndex: ''
        }
      },
      created () {
        this.id = location.href.split('?')[1]?.split('=')[1]
        if (this.id) { // 编辑状态
          this.getLevelDetail()
        }
        this.getProductList()

      },
      mounted () {
        document.querySelector('.add-client-level').onclick = () => {
          this.visibleTreeObj.forEach(item => {
            item && (item.visibleTree = false)
          })
        }
      },
      watch: {
        shopList (val) {
          if (val) {
            this.formData.product.forEach(item => {
              item.name = val.filter(el => el.id === item.id)[0]?.name
              item.baidu_discont = this.baiduData.filter(i => item.id === i.product_id)[0]?.discount ? this.baiduData.filter(i => item.id === i.product_id)[0]?.discount : 0
              item.total_discont = ((100 - item.discount_percent) * item.baidu_discont) / 100
            })
          }
        }
      },
      methods: {
        choosePro (arr) {
          this.curProArr = arr
        },
        addMore () {
          if (this.editStatus && this.tempData.length > 0) { // 之前有未保存项
            this.tempData.isEdit = false
            this.formData.product.splice(this.tempIndex, 1, this.tempData)
          }
          this.formData.product.push({
            id: '',
            new_id: '',
            name: '',
            new_name: '',
            discount_percent: 1.00,
            new_discount_percent: 1.00,
            isEdit: true
          })
          this.tempData = []
          this.editStatus = true
          this.optType = 'add'
          this.chooseProduct()
        },
        eidtItem (row, index) {
          this.curProArr = []
          if (this.optType === 'add' && this.formData.product.length > 1 && this.formData.product[this.formData.product.length - 1].product_id === "") {
            this.formData.product.splice(this.formData.product.length -1 , 1)
          } else if (this.editStatus && JSON.parse(JSON.stringify(this.tempData).length > 0 )) { // 之前有未保存项
            this.tempData.isEdit = false
            this.formData.product.splice(this.tempIndex, 1, this.tempData)
          }
          row.isEdit = true
          row.new_discount_percent = row.discount_percent * 1
          row.new_id = row.id
          row.new_name = row.name
          this.optType = 'update'
          this.editStatus = true
          this.tempData = JSON.parse(JSON.stringify(row))
          this.tempIndex = index
        },
        saveItem (row) {
          // 批量
          if (this.optType === 'update') {
            if (!row.new_id) {
              return this.$message.warning(`${lang.select}${lang.tailorism}`)
            }
            row.isEdit = false
            row.name = row.new_name
            row.discount_percent = row.new_discount_percent
            row.product_id = row.new_product_id
            this.editStatus = false
          } else {
            if (this.curProArr.length === 0) {
              return this.$message.warning(`${lang.select}${lang.tailorism}`)
            }
            // 批量保存
            const temp = this.formData.product.pop()
            this.curProArr.forEach(item => {
              const res = this.shopList.filter(el => el.id === item.replace('t-', '') * 1)[0]
              if (typeof res !== 'object') {
                return
              }
              this.formData.product.push({
                name: res.name,
                new_name: res.name,
                discount_percent: temp.new_discount_percent,
                new_discount_percent: temp.new_discount_percent,
                id: res.id,
                new_id: res.id,
                isEdit: false
              })
              this.visibleTreeObj.push({
                visibleTree: false
              })
              this.editStatus = false
            })
            this.curProArr = []
          }
        },
        closeItem (row, index) {
          row.isEdit = false
          this.editStatus = false
          if (!row.new_id) {
            this.formData.product.splice(index, 1)
          }
        },
        delItem (row, index) {
          this.formData.product.splice(index, 1)
          this.editStatus = false
        },
        async getLevelDetail () {
          try {
            const res = await getLevelDetail(this.id)
            const temp = res.data.data.client_level
            temp.product = temp.product.map(item => {
              this.visibleTreeObj.push({
                visibleTree: false
              })
              item.isEdit = false
              if (this.shopList) {
                item.new_name = item.name = this.shopList.filter(el => el.id === item.id)[0]?.name
              }
              item.new_discount_percent = item.discount_percent * 1
              item.new_id = item.id
              return item
            })
            this.formData = temp
          } catch (error) {
            console.log(error)
          }
        },
        focusHandler (index) {
          this.visibleTreeObj.forEach(item => {
            item.visibleTree = false
          })
          this.chooseProduct()
          this.curNum = index
          const width = document.getElementById(`myPopup${this.curNum}`).offsetWidth
          this.$set(this.visibleTreeObj[index], 'visibleTree', !this.visibleTreeObj[index].visibleTree)
          // 阻止冒泡关闭弹窗
          this.$nextTick(() => {
            document.getElementById(`myPopup${this.curNum}`).onclick = () => {
              event.stopPropagation()
            }
            document.getElementsByClassName('t-popup__content')[0].style.width = `${width}px`
          })
        },
        changeColor (e) {
          this.formData.background_color = e
        },
        // 获取已激活插件
        getActive_plugin () {

        },
        // 商品选择
        onClick (e) {
          if (!e.node.data.children) {
            const pName = e.node.data.name
            const pId = e.node.data.id
            this.formData.product[this.curNum].new_name = pName
            this.formData.product[this.curNum].new_product_id = pId
            const baiduInfo = this.baiduData.filter((item) => {
              return item.product_id == pId
            })
            this.formData.product[this.curNum].baidu_discont = baiduInfo[0]?.discount
            this.$set(this.visibleTreeObj[this.curNum], 'visibleTree', false)
          }
        },
        // 删除
        deleteLevel (index) {
          this.formData.product.splice(index, 1)
        },
        inputBlur (val, context, item) {
          const reg = /^\d{1,2}(\.\d{1,2})?$|^100(\.0{1,2})?$/
          if (reg.test(val)) {
            item.total_discont = ((100 * 1000 - item.discount_percent * 1000) / 1000 * item.baidu_discont) / 100
          } else {
            item.total_discont = ''
          }
          this.$forceUpdate()
        },
        // 设置产品下拉框名称
        getLabel (createElement, node) {
          const label = node.data.name
          const { data } = node
          data.label = label
          return label
        },
        // 选择商品的时候筛选已选择的商品重新组合数据
        chooseProduct () {
          const hasChoose = this.formData.product.reduce((all, cur) => {
            if (cur.id) {
              all.push(cur.id)
            }
            return all
          }, [])
          const filterShop = this.shopList.filter(item => !hasChoose.includes(item.id))
          const filterData = this.groupList.map(item => {
            item.children.forEach(ele => {
              let temp = []
              filterShop.forEach(e => {
                if (e.product_group_id_second === ele.id) {
                  e.key = 't-' + e.id
                  e.flag = false  // flag切换显示修改
                  temp.push(e)
                }
              })
              ele.children = temp
            })
            return item
          })
          const _temp = filterData.filter(item => item.children.length > 0 && item.children.some(el => el.children.length > 0)).map(item => {
            item.children = item.children.filter(el => el.children.length > 0)
            return item
          })
          this.productList = _temp
        },
        // 获取列表
        async getProductList () {
          try {
            // 获取商品，一级，二级分组
            const shopList = await getProList()
            const firstGroup = await getFirstGroup()
            const secondGroup = await getSecondGroup()
            this.shopList = shopList.data.data.list
            this.firstGroup = firstGroup.data.data.list
            this.tempSecondGroup = secondGroup.data.data.list
            // 组装数据，一级分组装二级分组，二级分组填入符合需求的数据
            firstGroup.data.data.list.forEach(item => {
              item.key = 'f-' + item.id  // 多级Id会重复，故需要设置独一的key
              item.flag = false  // flag切换显示修改
              let secondArr = []
              // item.disabled = true
              secondGroup.data.data.list.forEach(sItem => {
                if (sItem.parent_id === item.id) {
                  sItem.key = 's-' + sItem.id
                  sItem.flag = false  // flag切换显示修改
                  secondArr.push(sItem)
                  //  sItem.disabled = true
                }
              })
              item.children = secondArr
            })
            this.groupList = JSON.parse(JSON.stringify(firstGroup.data.data.list))
            firstGroup.data.data.list.forEach(item => {
              item.children.forEach(ele => {
                let temp = []
                shopList.data.data.list.forEach(e => {
                  if (e.product_group_id_second === ele.id) {
                    e.key = 't-' + e.id
                    e.flag = false  // flag切换显示修改
                    temp.push(e)
                  }
                })
                ele.children = temp
              })
            })
            const temp = firstGroup.data.data.list.filter(item => item.children.length > 0 && item.children.some(el => el.children.length > 0))
            this.productList = temp
          } catch (error) {
            console.log(error)
          }
        },
        close () {
          location.href = 'index.htm'
        },
        async onSubmit ({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.loading = true
              const params = JSON.parse(JSON.stringify(this.formData))
              params.product = params.product.filter(item => item.id).map(item => {
                delete item.name
                delete item.baidu_discont
                delete item.total_discont
                item.discount_percent = item.discount_percent * 1
                item.id = item.product_id || item.id
                return item
              })
              const res = await addAndUpdateLevel(this.id ? 'update' : 'add', params)
              this.$message.success(res.data.msg)
              setTimeout(() => {
                this.loading = false
                location.href = 'index.htm'
              }, 300)

            } catch (error) {
              this.$message.error(error.data.msg)
              this.loading = false
            }
          } else {
            console.log('Errors: ', validateResult)
            this.$message.warning(firstError)
          }
        },
      }
    }).$mount(template)
    typeof old_onload == 'function' && old_onload()
  }
})(window)

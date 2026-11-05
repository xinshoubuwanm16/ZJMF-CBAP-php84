(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("recommend-config")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      data() {
        return {
          id: "",
          formData: {
            awards: "",
            day: "",
            withdraw_min: "",
            withdraw_handling_fee: 0,
            system_url: "",
            default_url: "",
            ratios: [],
            products: [],
          },
          baseURL: url,
          hover: true,
          tableLayout: false,
          /* 初始化三级数据 */
          shopList: [],
          firstGroup: [],
          tempSecondGroup: [],
          productList: [], // 商品可选列表
          groupList: [], // 一二级分组组装数据
          curNum: 0,
          visibleTreeObj: [],
          loading: false,
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          replayColumns: [
            {
              colKey: "tailorism",
              title: lang.tailorism,
              ellipsis: true,
            },
            {
              colKey: "ratio",
              title: lang.reward_proportion,
              ellipsis: true,
            },
            {
              colKey: "amount",
              title: "title-slot-name",
              ellipsis: true,
            },
            {
              colKey: "renew_ratio",
              title: lang.recommend_text5,
              ellipsis: true,
            },
            {
              colKey: "renew_amount",
              title: lang.recommend_text6,
              ellipsis: true,
            },
            {
              colKey: "op",
              title: lang.operation,
              width: 120,
            },
          ],
          recProColums: [
            {
              colKey: "drag", // 列拖拽排序必要参数
              title: lang.sort,
              cell: "drag",
              width: 100,
            },
            {
              width: 300,
              colKey: "tailorism",
              title: lang.tailorism,
              ellipsis: true,
            },
            {
              colKey: "url",
              cell: "url",
              title: "title-slot-name",
            },
            {
              colKey: "op",
              title: lang.operation,
              width: 120,
            },
          ],

          replayLoading: false,
          submitLoading: false,
          rules: {
            awards: [
              {
                required: true,
                message: lang.input + lang.recommend_awards,
                type: "error",
              },
              {
                pattern: /^\d+(\.\d{0,2})?$/,
                message: lang.verify12,
                type: "warning",
              },
              {
                validator: (val) => val >= 0,
                message: lang.verify12,
                type: "warning",
              },
            ],
            day: [
              { required: true, message: lang.recommend_tip4, type: "error" },
              {
                pattern: /^[0-9]*$/,
                message: lang.verify7,
                type: "warning",
              },
            ],
            withdraw_min: [
              {
                required: true,
                message: lang.input + lang.withdraw_min,
                type: "error",
              },
              {
                pattern: /^\d+(\.\d{0,2})?$/,
                message: lang.verify12,
                type: "warning",
              },
              {
                validator: (val) => val >= 0,
                message: lang.verify12,
                type: "warning",
              },
            ],
          },
          popupProps: {
            overlayInnerStyle: (trigger) => ({
              width: `${trigger.offsetWidth}px`,
            }),
          },
          optType: "",
          curProArr: [],
          editStatus: false,
          tempData: [],
          tempIndex: "",
        };
      },
      created() {
        this.getRecommend();
        this.getProductList();
      },
      components: {
        comConfig,
      },
      mounted() {
        document.querySelector(".recommend-config").onclick = () => {
          this.visibleTreeObj.forEach((item) => {
            item && (item.visibleTree = false);
          });
        };
      },
      watch: {
        shopList: {
          handler(val) {
            if (val) {
              this.formData.ratios = this.formData.ratios.map((item) => {
                item.new_name = item.name = val.filter(
                  (el) => el.id === item.product_id
                )[0]?.name;
                return item;
              });
              this.formData.products = this.formData.products.map((item) => {
                item.name = val.filter(
                  (el) => el.id === item.product_id
                )[0]?.name;
                return item;
              });
            }
          },
          immediate: true,
        },
      },
      computed: {
        addProList() {
          return this.formData.ratios.map((item) => {
            if (
              this.formData.products
                .map((i) => i.product_id)
                .includes(item.product_id)
            ) {
              item.disabled = true;
            } else {
              item.disabled = false;
            }
            return item;
          });
        },
      },
      methods: {
        eidtItem(row, index) {
          this.curProArr = [];
          if (
            this.optType === "add" &&
            this.formData.ratios.length > 1 &&
            this.formData.ratios[this.formData.ratios.length - 1].product_id ===
              ""
          ) {
            this.formData.ratios.splice(this.formData.ratios.length - 1, 1);
          } else if (
            this.editStatus &&
            JSON.parse(JSON.stringify(this.tempData).length > 0)
          ) {
            // 之前有未保存项
            this.tempData.isEdit = false;
            this.formData.ratios.splice(this.tempIndex, 1, this.tempData);
          }
          row.isEdit = true;
          row.new_amount = row.amount * 1;
          row.new_renew_amount = row.renew_amount * 1;
          row.new_ratio = row.ratio;
          row.new_renew_ratio = row.renew_ratio;
          row.new_product_id = row.product_id;
          row.new_name = row.name;
          this.optType = "update";
          this.editStatus = true;
          this.tempData = JSON.parse(JSON.stringify(row));
          this.tempIndex = index;
        },
        saveItem(row) {
          // 批量
          if (this.optType === "update") {
            if (!row.new_product_id) {
              return this.$message.warning(lang.select + lang.tailorism);
            }
            row.isEdit = false;
            row.name = row.new_name;
            row.amount = row.new_amount.toFixed(2);
            row.renew_amount = row.new_renew_amount.toFixed(2);
            row.ratio = row.new_ratio;
            row.renew_ratio = row.new_renew_ratio;
            row.product_id = row.new_product_id;
            this.editStatus = false;
          } else {
            if (this.curProArr.length === 0) {
              return this.$message.warning(lang.select + lang.tailorism);
            }
            // 批量保存
            const temp = this.formData.ratios.pop();
            this.curProArr.forEach((item) => {
              const res =
                this.shopList.filter(
                  (el) => el.id === item.replace("t-", "") * 1
                )[0] || [];
              if (res.name) {
                this.formData.ratios.push({
                  name: res.name,
                  amount: temp.new_amount.toFixed(2),
                  renew_amount: temp.new_renew_amount.toFixed(2),
                  ratio: temp.new_ratio,
                  renew_ratio: temp.new_renew_ratio,
                  product_id: res.id,
                  isEdit: false,
                });
                this.visibleTreeObj.push({
                  visibleTree: false,
                });
              }
              this.editStatus = false;
            });
            this.curProArr = [];
          }
        },
        closeItem(row, index) {
          this.curProArr = [];
          row.isEdit = false;
          this.editStatus = false;
          if (!row.new_product_id) {
            this.formData.ratios.splice(index, 1);
          }
        },
        addMore() {
          if (this.editStatus && this.tempData.length > 0) {
            // 之前有未保存项
            this.tempData.isEdit = false;
            this.formData.ratios.splice(this.tempIndex, 1, this.tempData);
          }
          this.formData.ratios.push({
            name: "",
            amount: 0.0,
            ratio: 1,
            product_id: "",
            new_name: "",
            new_amount: 0.0,
            renew_amount: 0.0,
            new_renew_amount: 0.0,
            new_ratio: 1,
            renew_ratio: 0,
            new_renew_ratio: 0,
            new_product_id: "",
            isEdit: true,
          });
          this.tempData = [];
          this.editStatus = true;
          this.optType = "add";
          this.chooseProduct();
        },
        delItem(row, index) {
          this.formData.ratios.splice(index, 1);
          this.editStatus = false;
        },
        async getRecommend() {
          try {
            this.loading = true;
            const res = await getRecommendConfig(this.id);
            const temp = res.data.data.config;
            temp.awards = Number(temp.awards).toFixed(2);
            temp.withdraw_min = Number(temp.withdraw_min).toFixed(2);
            this.visibleTreeObj = [];

            temp.ratios = temp.ratios.map((item) => {
              this.visibleTreeObj.push({
                visibleTree: false,
              });
              item.isEdit = false;
              if (this.shopList) {
                item.new_name = item.name = this.shopList.filter(
                  (el) => el.id === item.product_id
                )[0]?.name;
              }
              item.new_amount = item.amount * 1;
              item.new_renew_amount = item.renew_amount * 1;
              item.new_product_id = item.product_id;
              item.new_ratio = item.ratio;
              item.new_renew_ratio = item.renew_ratio;
              return item;
            });
            this.formData = temp;
            this.formData.ratios = this.formData.ratios.map((item) => {
              item.new_name = item.name = this.shopList.filter(
                (el) => el.id === item.product_id
              )[0]?.name;
              return item;
            });
            this.formData.products = this.formData.products.map((item) => {
              item.name = this.shopList.filter(
                (el) => el.id === item.product_id
              )[0]?.name;
              return item;
            });
            this.loading = false;
          } catch (error) {
            console.log(error);
          }
        },
        onDragSort({ newData }) {
          this.formData.products = newData;
        },
        focusHandler(index) {
          this.visibleTreeObj.forEach((item) => {
            item.visibleTree = false;
          });
          this.chooseProduct();
          this.curNum = index;
          const width = document.getElementById(
            `myPopup${this.curNum}`
          ).offsetWidth;
          this.$set(
            this.visibleTreeObj[index],
            "visibleTree",
            !this.visibleTreeObj[index].visibleTree
          );
          // 阻止冒泡关闭弹窗
          this.$nextTick(() => {
            document.getElementById(`myPopup${this.curNum}`).onclick = () => {
              event.stopPropagation();
            };
            document.getElementsByClassName(
              "t-popup__content"
            )[0].style.width = `${width}px`;
          });
        },
        changeColor(e) {
          this.formData.background_color = e;
        },
        // 复制
        copyUrl(text) {
          if (navigator.clipboard && window.isSecureContext) {
            // navigator clipboard 向剪贴板写文本
            this.$message.success(lang.copy + lang.success);
            return navigator.clipboard.writeText(text);
          } else {
            // 创建text area
            const textArea = document.createElement("textarea");
            textArea.value = text;
            // 使text area不在viewport，同时设置不可见
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            this.$message.success(lang.copy + lang.success);
            return new Promise((res, rej) => {
              // 执行复制命令并移除文本框
              document.execCommand("copy") ? res() : rej();
              textArea.remove();
            });
          }
        },
        // 商品选择
        onClick(e) {
          if (!e.node.data.children) {
            const pName = e.node.data.name;
            const pId = e.node.data.id;
            this.formData.ratios[this.curNum].new_name = pName;
            this.formData.ratios[this.curNum].new_product_id = pId;
            this.$set(this.visibleTreeObj[this.curNum], "visibleTree", false);
          }
        },
        // 删除
        deletePro(index) {
          this.formData.products.splice(index, 1);
        },
        addPro() {
          this.formData.products.push({
            product_id: "",
            isAdd: true,
          });
        },
        // 设置产品下拉框名称
        getLabel(createElement, node) {
          const label = node.data.name;
          const { data } = node;
          data.label = label;
          return label;
        },
        // 选择商品的时候筛选已选择的商品重新组合数据
        chooseProduct() {
          const hasChoose = this.formData.ratios.reduce((all, cur) => {
            all.push(cur.product_id);
            return all;
          }, []);
          const filterShop = this.shopList.filter(
            (item) => !hasChoose.includes(item.id)
          );
          const filterData = this.groupList.map((item) => {
            item.children.forEach((ele) => {
              let temp = [];
              filterShop.forEach((e) => {
                if (e.product_group_id_second === ele.id) {
                  e.key = "t-" + e.id;
                  e.flag = false; // flag切换显示修改
                  temp.push(e);
                }
              });
              ele.children = temp;
            });
            return item;
          });
          const _temp = filterData
            .filter(
              (item) =>
                item.children.length > 0 &&
                item.children.some((el) => el.children.length > 0)
            )
            .map((item) => {
              item.children = item.children.filter(
                (el) => el.children.length > 0
              );
              return item;
            });
          this.productList = _temp;
        },
        // 获取列表
        async getProductList() {
          try {
            // 获取商品，一级，二级分组
            const shopList = await getProduct();
            const firstGroup = await getFirstGroup();
            const secondGroup = await getSecondGroup();
            this.shopList = shopList.data.data.list;
            this.firstGroup = firstGroup.data.data.list;
            this.tempSecondGroup = secondGroup.data.data.list;
            // 组装数据，一级分组装二级分组，二级分组填入符合需求的数据
            firstGroup.data.data.list.forEach((item) => {
              item.key = "f-" + item.id; // 多级Id会重复，故需要设置独一的key
              item.flag = false; // flag切换显示修改
              let secondArr = [];
              // item.disabled = true
              secondGroup.data.data.list.forEach((sItem) => {
                if (sItem.parent_id === item.id) {
                  sItem.key = "s-" + sItem.id;
                  sItem.flag = false; // flag切换显示修改
                  secondArr.push(sItem);
                  //  sItem.disabled = true
                }
              });
              item.children = secondArr;
            });
            this.groupList = JSON.parse(
              JSON.stringify(firstGroup.data.data.list)
            );
            firstGroup.data.data.list.forEach((item) => {
              item.children.forEach((ele) => {
                let temp = [];
                shopList.data.data.list.forEach((e) => {
                  if (e.product_group_id_second === ele.id) {
                    e.key = "t-" + e.id;
                    e.flag = false; // flag切换显示修改
                    temp.push(e);
                  }
                });
                ele.children = temp;
              });
            });
            const temp = firstGroup.data.data.list.filter(
              (item) =>
                item.children.length > 0 &&
                item.children.some((el) => el.children.length > 0)
            );
            this.productList = temp;
          } catch (error) {
            console.log(error);
          }
        },
        addProduct() {
          this.formData.product.push({
            id: "",
            discount_percent: "",
          });
          this.visibleTreeObj.push({
            visibleTree: false,
          });
          this.$nextTick(() => {
            document.getElementById(`myPopup${this.curNum}`).onclick = () => {
              event.stopPropagation();
            };
          });
        },
        close() {
          location.href = "index.htm";
        },
        async onSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              const params = JSON.parse(JSON.stringify(this.formData));
              params.ratios = params.ratios.map((item) => {
                delete item.name;
                delete item.isEdit;
                delete item.new_amount;
                delete item.new_ratio;
                delete item.new_product_id;
                delete item.new_renew_amount;
                return item;
              });
              params.products = params.products
                .map((item) => {
                  return item.product_id;
                })
                .filter((item) => {
                  if (item) {
                    return item;
                  }
                });
              const isCom = params.ratios.every((item) => item.product_id);
              if (!isCom) {
                return this.$message.warning(lang.recommend_tip6);
              }
              this.submitLoading = true;
              const res = await saveRecommendConfig(params);
              this.$message.success(res.data.msg);
              this.getRecommend();
              this.submitLoading = false;
            } catch (error) {
              this.submitLoading = false;
              this.$message.error(error.data.msg);
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

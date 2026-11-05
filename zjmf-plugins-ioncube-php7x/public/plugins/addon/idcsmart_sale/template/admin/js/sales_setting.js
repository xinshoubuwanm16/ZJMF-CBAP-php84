(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("admin")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        comConfig,
        comTreeSelect
      },
      data() {
        return {
          product_commission: [], // 商品提成设置
          big_order: [], // 大额订单奖励
          isShowFlag: false,
          isShowFlag2: false,
          confirm_wait_day: 0, // 销售提成确认时长
          telegram_bot_token: "", // telegram id
          price: 0, // 单次订单金额
          month_over: [], // 单月超出奖励
          first_recharge: {}, // 首次充值提成
          other_recharge: {}, // 后续充值提成
          saveLoading: false,
          showALi: false,
          subLodign: false,
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          currency_suffix:
            JSON.parse(localStorage.getItem("common_set")).currency_suffix ||
            "元",
          treeProps: {
            keys: {
              label: "name",
              value: "key",
              children: "children",
            },
          },
          columns: [
            {
              colKey: "product",
              title: lang.sale_text62,
              cell: "product",
              align: "center",
              ellipsis: true,
            },
            {
              colKey: "new_value",
              title: lang.sale_text63,
              width: 250,
              cell: "new_value",
              align: "center",
            },
            {
              colKey: "renew_value",
              title: lang.sale_text64,
              width: 250,
              cell: "renew_value",
              align: "center",
            },
            {
              colKey: "repurchase_value",
              title: lang.sale_text65,
              width: 250,
              cell: "repurchase_value",
              align: "center",
            },
            {
              colKey: "upgrade_value",
              title: lang.sale_text127,
              width: 250,
              cell: "upgrade_value",
              align: "center",
            },
            {
              colKey: "op",
              title: lang.operation,
              width: 100,
              align: "center",
            },
          ],
          columns2: [
            {
              colKey: "mode",
              title: lang.sale_text66,
              cell: "first_recharge",
              align: "center",
            },
            {
              colKey: "value",
              title: lang.sale_text67,
              width: "250",
              cell: "other_recharge",
              align: "center",
            },
            {
              colKey: "op",
              title: lang.operation,
              width: 100,
              align: "center",
            },
          ],
          columns3: [
            {
              colKey: "max_price",
              title: lang.sale_text68,
              cell: "first_recharge",
              align: "center",
              cell: "price_range",
            },
            {
              colKey: "value",
              title: lang.sale_text69,
              width: "250",
              cell: "mode_value",
              align: "center",
            },
            {
              colKey: "op",
              title: lang.operation,
              width: 100,
              align: "center",
            },
          ],
          modeOption: [
            {
              label: lang.sale_text70,
              value: "fixed",
            },
            {
              label: lang.sale_text71,
              value: "percent",
            },
          ],
          visible: false,
          visible1: false,
          visible2: false,
          delVisible: false,
          delId: 0,
          delType: "",
          product_status: "",
          addTip: "",
          addAllTip: "",
          orderTip: "",
          rules: {
            product: [
              { required: true, message: lang.sale_text72,  },
            ],
          },
          all_commission: [],
          hostOptions: [],
          selectHostList: [],
          add_product_obj: {
            new_mode: "fixed",
            new_value: 0,
            renew_mode: "fixed",
            renew_value: 0,
            repurchase_mode: "fixed",
            repurchase_value: 0,
            product: [],
            product_name: "",
            upgrade_mode: "fixed",
            upgrade_value: 0,
          },
          secObj: {
            first_mode: "",
            first_value: 0,
            other_rmode: "",
            other_value: 0,
          },
          money_data: {
            min_price: 0,
            max_price: 0,
            mode: "fixed",
            value: 0,
          },
          submitLoading: false,
          formWidth: localStorage.getItem("backLang") === "en-us" ? 800 : 600,
        };
      },
      mounted() {},
      methods: {
        choosePro(val) {
          this.add_product_obj.product = val;
        },
        // 点击添加商品按钮
        handelAddSale() {
          this.produncObgInit();
          this.addTip = lang.sale_text73;
          this.product_status = "add";
          this.visible = true;
        },
        // 初始化商品弹窗
        produncObgInit() {
          this.add_product_obj.new_mode = "fixed";
          this.add_product_obj.new_value = 0;
          this.add_product_obj.renew_mode = "fixed";
          this.add_product_obj.renew_value = 0;
          this.add_product_obj.repurchase_mode = "fixed";
          this.add_product_obj.repurchase_value = 0;
          this.add_product_obj.upgrade_mode = "fixed";
          this.add_product_obj.upgrade_value = 0;
          this.add_product_obj.product_name = "";
          this.add_product_obj.product = [];
        },
        // 添加/编辑商品提交
        async addProduct({ validateResult, firstError }) {
          if (validateResult === true) {
            this.add_product_obj.product_id = this.add_product_obj.product.filter((item) => item);
            const subApi =
              this.product_status === "add"
                ? addPrductConfig
                : editPrductConfig;
            this.submitLoading = true;
            if (this.product_status === "add") {
              delete this.add_product_obj.id
            }
            await subApi(this.add_product_obj)
              .then((res) => {
                this.$message.success(res.data.msg);
                this.produncObgInit();
                this.visible = false;
                this.getSaleConfig();
              })
              .catch((err) => {
                this.$message.error(err.data.msg);
              })
              .finally(() => {
                this.submitLoading = false;
              });
          } else {
            this.$message.warning({
              content: firstError,
              placement: "top-right",
            });
          }
        },
        // 关闭商品弹窗
        close() {
          this.produncObgInit();
          this.visible = false;
        },
        // 奖励弹窗
        moneyDialogShow(type, op, row) {
          // type：类型(big_order=大额订单,month_over=单月超出) // op: add 新增 edit 编辑
          if (op === "add") {
            this.money_data.op = "add";
            this.money_data.type = type;
            this.orderTip = lang.sale_text74;
            this.money_data.min_price = 0;
            this.money_data.max_price = 0;
            this.money_data.mode = "fixed";
            this.money_data.value = 0;
          } else {
            this.money_data.op = "edit";
            this.orderTip = lang.sale_text75;
            this.money_data.id = row.id;
            this.money_data.type = type;
            this.money_data.min_price = Number(row.min_price);
            this.money_data.max_price = Number(row.max_price);
            this.money_data.mode = row.mode;
            this.money_data.value = row.value;
          }
          this.visible2 = true;
        },
        addMoney() {
          // if (this.money_data.min_price === 0 || this.money_data.max_price === 0) {
          //     this.$message.warning({ content: lang.sale_text76, placement: 'top-right' });
          //     return
          // }
          if (
            this.money_data.min_price === "" ||
            !this.money_data.max_price === ""
          ) {
            this.$message.warning({
              content: lang.sale_text77,
              placement: "top-right",
            });
            return;
          }
          if (this.money_data.max_price == this.money_data.min_price) {
            this.$message.warning({
              content: lang.sale_text78,
              placement: "top-right",
            });
            return;
          }
          if (this.money_data.max_price < this.money_data.min_price) {
            this.$message.warning({
              content: lang.sale_text79,
              placement: "top-right",
            });
            return;
          }
          this.submitLoading = true;
          if (this.money_data.op === "add") {
            addCommissionConfig(this.money_data)
              .then((res) => {
                this.$message.success(res.data.msg);
                this.visible2 = false;
                this.getSaleConfig();
              })
              .catch((err) => {
                this.$message.error(err.data.msg);
              })
              .finally(() => {
                this.submitLoading = false;
              });
          } else if (this.money_data.op === "edit") {
            editCommissionConfig(this.money_data)
              .then((res) => {
                this.$message.success(res.data.msg);
                this.visible2 = false;
                this.getSaleConfig();
              })
              .catch((err) => {
                this.$message.error(err.data.msg);
              })
              .finally(() => {
                this.submitLoading = false;
              });
          }
        },
        inSection(num, sectionArr) {
          if (num <= sectionArr[1] && num >= sectionArr[0]) {
            return true;
          }
          return false;
        },
        // 获取已激活插件
        getActive_plugin() {
          active_plugin().then((res) => {
            const arr = res.data.data.list.map((item) => {
              return item.name;
            });
            if (arr.includes("AliyunAgency")) {
              this.showALi = true;
            }
          });
        },
        saveModeEdit() {
          if (this.addAllTip === lang.sale_text59) {
            this.submitLoading = true;
            saveConfig({
              first_recharge: {
                value: this.secObj.first_value,
                mode: this.secObj.first_mode,
              },
            })
              .then((res) => {
                this.$message.success(res.data.msg);
                this.visible1 = false;
                this.getSaleConfig();
              })
              .catch((err) => {
                this.$message.error(err.data.msg);
              })
              .finally(() => {
                this.submitLoading = false;
              });
          } else {
            this.submitLoading = true;
            saveConfig({
              other_recharge: {
                value: this.secObj.other_value,
                mode: this.secObj.other_rmode,
              },
            })
              .then((res) => {
                this.$message.success(res.data.msg);
                this.visible1 = false;
                this.getSaleConfig();
              })
              .catch((err) => {
                this.$message.error(err.data.msg);
              })
              .finally(() => {
                this.submitLoading = false;
              });
          }
        },
        updateRecharge(row) {
          this.addAllTip = `${row.type}${lang.sale_text80}`;
          this.secObj = {
            first_mode: this.first_recharge.mode
              ? this.first_recharge.mode
              : "fixed",
            first_value: this.first_recharge.value
              ? this.first_recharge.value
              : 0,
            other_rmode: this.other_recharge.mode
              ? this.other_recharge.mode
              : "fixed",
            other_value: this.other_recharge.value
              ? this.other_recharge.value
              : 0,
          };
          this.visible1 = true;
        },
        // 编辑商品提成
        updateAdmin(row) {
          this.add_product_obj.new_mode = row.new_mode;
          this.add_product_obj.new_value = row.new_value;
          this.add_product_obj.renew_mode = row.renew_mode;
          this.add_product_obj.renew_value = row.renew_value;
          this.add_product_obj.repurchase_mode = row.repurchase_mode;
          this.add_product_obj.repurchase_value = row.repurchase_value;
          this.add_product_obj.upgrade_mode = row.upgrade_mode;
          this.add_product_obj.upgrade_value = row.upgrade_value;
          this.add_product_obj.product = row.product.map((item) => {
            return item.id;
          });
          this.add_product_obj.id = row.id;
          this.product_status = "edit";
          this.addTip = lang.sale_text81;
          this.visible = true;
          this.$nextTick(() => {
            this.$refs.productSelect.isInit = true
          })
        },
        // 删除商品
        deleteUser(id, type) {
          this.delType = type;
          this.delId = id;
          this.delVisible = true;
        },
        delGood() {
          this.submitLoading = true;
          if (this.delType === "1") {
            delPrductConfig(this.delId)
              .then((res) => {
                this.$message.success(res.data.msg);
                this.delVisible = false;
                this.getSaleConfig();
              })
              .catch((err) => {
                this.$message.error(err.data.msg);
              })
              .finally(() => {
                this.submitLoading = false;
              });
          } else if (this.delType === "2") {
            delCommissionConfig(this.delId)
              .then((res) => {
                this.$message.success(res.data.msg);
                this.delVisible = false;
                this.getSaleConfig();
              })
              .catch((err) => {
                this.$message.error(err.data.msg);
              })
              .finally(() => {
                this.submitLoading = false;
              });
          }
        },
        editSaleConfig() {
          this.saveLoading = true;
          saveConfig({
            price: this.price,
            confirm_wait_day: this.confirm_wait_day,
            telegram_bot_token: this.telegram_bot_token,
          })
            .then((res) => {
              this.$message.success(res.data.msg);
              this.getSaleConfig();
            })
            .catch((err) => {
              this.$message.error(err.data.msg);
            })
            .finally(() => {
              this.saveLoading = false;
            });
        },
        // 获取设置
        async getSaleConfig() {
          const { data } = await saleConfig();
          this.isShowFlag = false;
          this.isShowFlag2 = false;
          let left_price = 0;
          let left_price2 = 0;
          data.big_order.forEach((item) => {
            item.value = Number(item.value);
            if (left_price !== 0 && item.min_price !== left_price) {
              this.isShowFlag = true;
            }
            left_price = item.max_price;
          });
          data.month_over.forEach((item) => {
            item.value = Number(item.value);
            if (left_price2 !== 0 && item.min_price !== left_price2) {
              this.isShowFlag2 = true;
            }
            left_price2 = item.max_price;
          });
          this.big_order = data.big_order;
          this.first_recharge = data.first_recharge;
          this.other_recharge = data.other_recharge;
          data.first_recharge.type = lang.sale_text82;
          data.other_recharge.type = lang.sale_text83;
          this.all_commission = [data.first_recharge, data.other_recharge];
          data.product_commission.forEach((item) => {
            let arr = [];
            arr = item.product.map((items) => {
              //items.id = "t-" + items.id;
              return items.name;
            });
            item.product_name = arr.join("、");
          });
          this.product_commission = data.product_commission;
          this.month_over = data.month_over;
          this.price = Number(data.price);
          this.confirm_wait_day = Number(data.confirm_wait_day);
          this.telegram_bot_token = data.telegram_bot_token;
        },
      },
      created() {
        this.getActive_plugin();
        this.getSaleConfig();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

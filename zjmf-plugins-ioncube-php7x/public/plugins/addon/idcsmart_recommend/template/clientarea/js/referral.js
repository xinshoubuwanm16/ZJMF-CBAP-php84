(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("template")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        asideMenu,
        topMenu,
        pagination,
        withdrawDialog,
      },
      created() {
        this.getCommonData();
        this.getPromoterInfo();
        this.getDescription();
        this.getSystemUrl();
        this.getCustomerUrl();
      },
      mounted() {},
      updated() {
        // 关闭loading
        // document.getElementById('mainLoading').style.display = 'none';
        // document.getElementsByClassName('template')[0].style.display = 'block'
      },
      destroyed() {},
      data() {
        return {
          recommendProducts: [],
          recProLoading: false,
          commonData: {},
          activeIndex: "1",
          promoterData: {},
          descriptionData: {
            awards: 0.0,
            max_ratio: 0.0,
          },
          isOpen: true,
          systemUrlData: [],
          urlData: {
            system_url: "",
            custom_url: "",
          },
          // 自定义链接列表
          customerUrlData: [],
          recommendStatus: [
            {
              id: 1,
              value: "Pending",
              label: lang.referral_status5,
            },
            {
              id: 2,
              value: "Active",
              label: lang.referral_status6,
            },
            {
              id: 3,
              value: "Invalid",
              label: lang.referral_status7,
            },
            {
              id: 4,
              value: "Frozen",
              label: lang.referral_status8,
            },
          ],
          params1: {
            page: 1,
            limit: 20,
            pageSizes: [20, 50, 100],
            total: 200,
            orderby: "id",
            sort: "desc",
            keywords: "",
            status: "",
          },
          loading1: false,
          // 推介记录
          recommendData: [],
          params2: {
            page: 1,
            limit: 20,
            pageSizes: [20, 50, 100],
            total: 200,
            orderby: "id",
            sort: "desc",
            keywords: "",
            status: "",
            source: "IdcsmartRecommend",
          },
          loading2: false,
          withdrawStatus: [
            {
              id: 1,
              value: "0",
              label: lang.referral_status1,
            },
            {
              id: 2,
              value: "1",
              label: lang.referral_status2,
            },
            {
              id: 3,
              value: "2",
              label: lang.referral_status3,
            },
            {
              id: 4,
              value: "3",
              label: lang.referral_status4,
            },
          ],
          withdrawData: [],
          isPlan: false,
          loading3: false,
          dataList3: [],
          openVisible: false,
          delId: null,
          delVisible: false,

          // 提现弹窗开始

          ruler: {
            // 可提现金额
            withdrawable_amount: "",
            // 单次提现最提金额
            withdraw_min: "",
            // 单次提现最高金额
            withdraw_max: "",
            // 提现手续费 百分比的带上“%” 固定金额 保留两位数
            withdraw_handling_fee: "",
            // 最低提现手续费
            percent_min: "",
          },
          withdraw_handling_fee: null,
        };
      },
      filters: {
        formateTime(time) {
          if (time && time !== 0) {
            return formateDate(time * 1000);
          } else {
            return "--";
          }
        },
        formateDms(diff) {
          if (diff) {
            // 天
            var days = Math.floor(diff / (24 * 3600));
            // 小时
            var leave1 = diff % (24 * 3600); //计算天数后剩余的毫秒数
            var hours = Math.floor(leave1 / 3600);
            // 分钟
            var leave2 = leave1 % 3600; //计算小时数后剩余的毫秒数
            var minutes = Math.floor(leave2 / 60);
            return (
              days + lang.day + hours + lang.hours + minutes + lang.minutes
            );
          } else {
            return "--";
          }
        },
      },
      methods: {
        // 获取通用配置
        getCommonData() {
          this.commonData = JSON.parse(
            localStorage.getItem("common_set_before")
          );
          document.title =
            this.commonData.website_name + "-" + lang.recommend_title;
        },
        // tab切换
        handleClick(tab) {
          if (tab.name == "1") {
            this.getCommonData();
            this.getPromoterInfo();
            this.getDescription();
            this.getSystemUrl();
            this.getCustomerUrl();
          }

          if (tab.name == 2) {
            this.params1 = {
              page: 1,
              limit: 20,
              pageSizes: [20, 50, 100],
              total: 200,
              orderby: "id",
              sort: "desc",
              keywords: "",
              status: "",
            };
            this.getRecommendList();
          }

          if (tab.name == 3) {
            this.params2 = {
              page: 1,
              limit: 20,
              pageSizes: [20, 50, 100],
              total: 200,
              orderby: "id",
              sort: "desc",
              keywords: "",
              status: "",
              source: "IdcsmartRecommend",
            };
            this.getWithdrawList();
          }
        },
        // 获取推广者基础信息
        getPromoterInfo() {
          this.recProLoading = true;
          promoterInfo().then((res) => {
            if (res.data.status == 200) {
              this.promoterData = res.data.data.promoter;
              this.ruler.withdrawable_amount =
                this.promoterData.withdrawable_amount;
              if (JSON.stringify(this.promoterData) == "{}") {
                this.isOpen = false;
              } else {
                this.isOpen = true;
              }
            }
          });
          getRecProduct().then((res) => {
            this.recommendProducts = res.data.data.products;
            this.recProLoading = false;
          });
        },
        // 开启推介计划
        openReferral() {
          openRecommend()
            .then((res) => {
              if (res.data.status == 200) {
                this.$message.success(res.data.msg);
                this.openVisible = false;
                this.getPromoterInfo();
                this.getDescription();
                this.getSystemUrl();
                this.getCustomerUrl();
              }
            })
            .catch((error) => {
              this.$message.error(error.data.msg);
            });
        },
        // 未开启推介计划描述
        getDescription() {
          description().then((res) => {
            if (res.data.status == 200) {
              this.descriptionData = res.data.data;
            }
          });
        },
        // 复制
        copyUrl(text) {
          if (navigator.clipboard && window.isSecureContext) {
            // navigator clipboard 向剪贴板写文本
            this.$message.success(lang.pay_text17);
            return navigator.clipboard.writeText(text);
          } else {
            // 创建text area
            const textArea = document.createElement("textarea");
            textArea.value = text;
            // 使text area不在viewport，同时设置不可见
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            this.$message.success(lang.pay_text17);
            return new Promise((res, rej) => {
              // 执行复制命令并移除文本框
              document.execCommand("copy") ? res() : rej();
              textArea.remove();
            });
          }
        },
        // 获取推广页面链接
        getSystemUrl() {
          systemUrl().then((res) => {
            if (res.data.status == 200) {
              this.systemUrlData = res.data.data.system_url;
              this.urlData.system_url = this.systemUrlData[0]
                ? this.systemUrlData[0]
                : "";
            }
          });
        },
        // 获取自定义链接列表
        getCustomerUrl() {
          customerUrl().then((res) => {
            if (res.data.status == 200) {
              this.customerUrlData = res.data.data.list;
            }
          });
        },
        // 删除链接
        delCustomer() {
          const params = {
            id: this.delId,
          };
          delUrl(params)
            .then((res) => {
              if (res.data.status == 200) {
                this.$message.success(lang.referral_tips4);
                this.getCustomerUrl();
                this.delVisible = false;
              }
            })
            .catch((error) => {
              this.$message.error(error.data.msg);
            });
        },
        // 生成自定义链接
        generateUrl() {
          const data = this.urlData;
          if (!data.system_url) {
            this.$message.warning(lang.referral_tips1);
            return;
          }
          if (!data.custom_url) {
            this.$message.warning(lang.referral_tips2);
            return;
          }

          postUrl(data)
            .then((res) => {
              if (res.data.status == 200) {
                this.$message.success(lang.referral_tips3);
                this.urlData.custom_url = "";
                this.getCustomerUrl();
              }
            })
            .catch((error) => {
              this.$message.error(error.data.msg);
            });
        },
        // 获取推介记录列表
        getRecommendList() {
          this.loading1 = true;
          recommendList(this.params1)
            .then((res) => {
              this.loading1 = false;
              if (res.data.status == 200) {
                this.recommendData = res.data.data.list;
                this.params1.total = res.data.data.count;
              }
            })
            .catch((error) => {
              this.loading1 = false;
            });
        },
        // 每页展示数改变
        sizeChange1(e) {
          this.params1.limit = e;
          this.params1.page = 1;
          // 获取列表
          this.getRecommendList();
        },
        // 当前页改变
        currentChange1(e) {
          this.params1.page = e;
          this.getRecommendList();
        },
        search1() {
          this.params1.page = 1;
          this.getRecommendList();
        },
        // 每页展示数改变
        sizeChange2(e) {
          this.params2.limit = e;
          this.params2.page = 1;
          // 获取列表
          this.getWithdrawList();
        },
        // 当前页改变
        currentChange2(e) {
          this.params2.page = e;
          this.getWithdrawList();
        },
        search2() {
          this.params2.page = 1;
          this.getWithdrawList();
        },
        // 提现记录
        getWithdrawList() {
          this.loading2 = true;
          withdrawList(this.params2)
            .then((res) => {
              if (res.data.status == 200) {
                this.withdrawData = res.data.data.list;
                this.params2.total = res.data.data.count;
              }
              this.loading2 = false;
            })
            .catch((error) => {
              this.loading2 = false;
            });
        },
        // 展示完整推介策略
        showPlan() {
          this.isPlan = true;
          this.getRecommendConfig();
        },
        handelCopyUrl(row) {
          if (row.copyLoading) {
            return;
          }
          row.copyLoading = true;
          getRecUrl({ product_id: row.product_id })
            .then((res) => {
              this.copyUrl(res.data.data.url);
              row.copyLoading = false;
            })
            .catch((err) => {
              row.copyLoading = false;
              this.$message.error(err.data.msg);
            });
        },

        // 获取推介政策
        getRecommendConfig() {
          this.loading3 = true;
          recommendConfig()
            .then((res) => {
              if (res.data.status == 200) {
                this.dataList3 = res.data.data.list.map((item) => {
                  item.copyLoading = false;
                  return item;
                });
                this.ruler.withdraw_min = res.data.data.config.withdraw_min;

                this.ruler.withdraw_handling_fee =
                  res.data.data.config.withdraw_handling_fee + "%";
              }
              this.loading3 = false;
            })
            .catch((error) => {
              this.loading3 = false;
            });
        },
        showDel(id) {
          this.delId = id;
          this.delVisible = true;
        },
        keepTwoDecimalFull(num) {
          var result = parseFloat(num);
          if (isNaN(result)) {
            return false;
          }
          result = Math.round(num * 100) / 100;
          var s_x = result.toString(); //将数字转换为字符串

          var pos_decimal = s_x.indexOf("."); //小数点的索引值

          // 当整数时，pos_decimal=-1 自动补0
          if (pos_decimal < 0) {
            pos_decimal = s_x.length;
            s_x += ".";
          }

          // 当数字的长度< 小数点索引+2时，补0
          while (s_x.length <= pos_decimal + 2) {
            s_x += "0";
          }
          return s_x;
        },
        shwoWithdrawal() {
          const ruler = {
            // 提现来源
            source: "IdcsmartRecommend",
            // 提现方式
            method: [],
            // 第一个提现方式
            method_id: "",
            // 可提现金额
            withdrawable_amount: this.promoterData.withdrawable_amount,
            // 单次提现最小金额
            withdraw_min: "",
            // 单次提现最高金额
            withdraw_max: "",
            // 提现手续费 百分比的带上“%” 固定金额 保留两位数
            withdraw_handling_fee: "",
            // 最低提现手续费
            percent_min: "",
          };
          // 提现方式
          withdrawConfig().then((res) => {
            if (res.data.status == 200) {
              ruler.method = res.data.data.method;
              ruler.method_id = res.data.data.method[0]
                ? res.data.data.method[0].id
                : "";
              // 提现规则

              recommendConfig().then((res) => {
                if (res.data.status == 200) {
                  const config = res.data.data.config;
                  ruler.withdraw_min = config.withdraw_min;
                  ruler.withdraw_handling_fee =
                    config.withdraw_handling_fee + "%";

                  this.withdraw_handling_fee =
                    res.data.data.config.withdraw_handling_fee;
                  this.$refs.withdrawDialog.shwoWithdrawal(ruler);
                }
              });
            }
          });
        },
        dowithdraw(params) {
          params = {
            ...params,
            fee: this.withdraw_handling_fee,
          };
          // 推介计划提现
          recommendWithDraw(params)
            .then((res) => {
              if (res.data.status == 200) {
                this.$message.success(lang.finance_text124);
                // 关闭提现弹窗
                this.$refs.withdrawDialog.withdrawCancel();

                this.getPromoterInfo();
              }
            })
            .catch((error) => {
              this.$message.error(error.data.msg);
              // 关闭提现提交按钮的加载状态
              this.$refs.withdrawDialog.withdrawLoading = false;
            });
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

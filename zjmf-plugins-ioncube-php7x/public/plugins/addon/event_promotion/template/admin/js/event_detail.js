(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("voucher-detail")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = window.moment;
    new Vue({
      components: {
        comConfig,
        comTreeSelect,
        comChooseUser
      },
      data() {
        return {
          id: "",
          currency_suffix: JSON.parse(localStorage.getItem("common_set"))?.currency_suffix,
          formData: {
            id: "",
            name: "",
            type: "percent", // percent百分比,reduce满减
            full: 0, // 类型为满减时必填
            value: 0, // 类型为百分比时必填
            client_type: "",
            start_time: "",
            end_time: "",
            products: [],
            clients: [],
            notes: "",
            new_user: 0,
            old_user: 0,
            single_user_once: 0,
            cycle_limit: 0,
            cycle: []
          },
          time_diff: "",
          curTime: "",
          optTit: "",
          searchLoading: false,
          hasPlugin: false,
          timeOpt: [
            {
              value: "1-d",
              label: `1${lang.event_promotion_text56}`
            },
            {
              value: "3-d",
              label: `3${lang.event_promotion_text56}`
            },
            {
              value: "7-d",
              label: `7${lang.event_promotion_text56}`
            },
            {
              value: "15-d",
              label: `15${lang.event_promotion_text56}`
            },
            {
              value: "1-M",
              label: `1${lang.event_promotion_text57}`
            },
            {
              value: "3-M",
              label: `3${lang.event_promotion_text57}`
            },
            {
              value: "6-M",
              label: `6${lang.event_promotion_text57}`
            },
            {
              value: "1-y",
              label: `1${lang.event_promotion_text58}`
            },
            {
              value: "2-y",
              label: `2${lang.event_promotion_text58}`
            }
          ],
          levelList: [],
          clientList: [],
          clientTotal: 0,
          clinetParams: {
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc"
          },
          popupProps: {
            overlayInnerStyle: (trigger) => ({ width: `${trigger.offsetWidth}px` }),
            "on-scroll": this.handleScrollToBottom
          },
          rules: {
            name: [
              {
                required: true,
                message: lang.event_promotion_text34,
                type: "error"
              }
            ],
            type: [
              {
                required: true,
                message: lang.event_promotion_text35,
                type: "error"
              }
            ],
            value: [
              {
                required: true,
                message: lang.event_promotion_text36,
                type: "error"
              },
              {
                validator: this.checkMoney
              }
            ],
            full: [
              {
                required: true,
                message: lang.event_promotion_text37,
                type: "error"
              },
              {
                validator: this.checkMoney
              }
            ],
            start_time: [
              {
                required: true,
                message: lang.event_promotion_text38,
                type: "error"
              },
              {
                validator: this.checkTime
              }
            ],
            end_time: [
              {
                required: true,
                message: lang.event_promotion_text39,
                type: "error"
              },
              {
                validator: this.checkTime1
              }
            ],
            products: [
              {
                required: true,
                message: lang.event_promotion_text40,
                type: "error"
              }
            ],
            cycle: [
              {
                required: true,
                message: lang.select + lang.cycle,
                type: "error"
              }
            ]
          },
          cycleOpt: [
            {
              value: "monthly",
              label: lang.month
            },
            {
              value: "quarterly",
              label: lang.promo_quarterly
            },
            {
              value: "semiannually",
              label: lang.promo_semiannually
            },
            {
              value: "annually",
              label: lang.promo_annually
            },
            {
              value: "biennially",
              label: lang.promo_biennially
            },
            {
              value: "triennially",
              label: lang.promo_triennially
            }
          ],
          productList: [],
          treeProps: {
            keys: {
              label: "name",
              value: "key",
              children: "children"
            }
          },
          loading: false,
          optType: "",
          isRepeat: false
        };
      },
      watch: {
        "formData.start_time"(val) {
          if (val) {
            const res = this.calculateDiffTime(
              parseInt(val / 1000),
              parseInt(this.formData.end_time / 1000)
            );
            if (this.formData.end_time - val) {
              this.time_diff = res;
            }
          }
        },
        "formData.end_time"(val) {
          if (val) {
            const res = this.calculateDiffTime(
              parseInt(this.formData.start_time / 1000),
              parseInt(val / 1000)
            );
            if (val - this.formData.start_time) {
              this.time_diff = res;
            }
          }
        }
      },
      computed: {
        calcShow() {
          return (data) => {
            return (
              `#${data.id}-` +
              (data.username
                ? data.username
                : data.phone
                ? data.phone
                : data.email) +
              (data.company ? `(${data.company})` : "")
            );
          };
        }
      },
      created() {
        this.id = location.href.split("?")[1]?.split("=")[1];
        if (!this.id) {
          this.formData.start_time = new Date().getTime();
          this.optType = "add";
          this.optTit = lang.event_promotion_text41;
        } else {
          this.optTit = lang.event_promotion_text42;
          this.getDetail();
        }
      },
      methods: {
        choosePro(val) {
          this.formData.products = val;
        },
        changeUser (val) {
          this.formData.clients = val;
        },
        filterMethod(search, option) {
          return option;
        },
        async checkRepeat(e) {
          const check = await this.$refs.formValidatorStatus.validate({
            fields: ["code"]
          });
          if (e.trim().length === 8 && check) {
            try {
              const res = await checkVoucher({ code: e });
            } catch (error) {
              this.isRepeat = true;
              this.$refs.formValidatorStatus.setValidateMessage({
                code: [
                  {
                    type: "error",
                    message: error.data.msg
                  }
                ]
              });
            }
          }
        },
        calculateDiffTime(startTime, endTime) {
          const diff = (endTime - startTime) * 1000;
          // 天
          const days = Math.floor(diff / (24 * 3600 * 1000));
          // 小时
          const leave1 = diff % (24 * 3600 * 1000);
          const hours = Math.floor(leave1 / (3600 * 1000));
          // 分钟
          const leave2 = leave1 % (3600 * 1000);
          const minutes = Math.floor(leave2 / (60 * 1000));
          // 秒
          const leave3 = leave2 % (60 * 1000);
          const seconds = Math.round(leave3 / 1000);
          return (
            days + lang.event_promotion_text56 +
            hours + lang.event_promotion_text60 +
            minutes + lang.event_promotion_text61 +
            seconds + lang.event_promotion_text62
          );
        },
        changeStart(e) {
          this.formData.start_time = parseInt(moment(e).valueOf());
          this.curTime = "";
          this.$refs.formValidatorStatus.validate({
            fields: ["start_time", "end_time"]
          });
        },
        changeEnd(e) {
          this.formData.end_time = parseInt(moment(e).valueOf());
          this.time_diff = this.formData.end_time - this.formData.start_time;
          this.$refs.formValidatorStatus.validate({
            fields: ["start_time", "end_time"]
          });
        },
        checkTime(val) {
          if (moment(val).unix() > moment(this.formData.end_time).unix()) {
            return { result: false, message: lang.promo_tip10, type: "error" };
          }
          return { result: true };
        },
        // 金额大于0
        checkMoney(val) {
          if (val <= 0) {
            return {
              result: false,
              message: lang.event_promotion_text43,
              type: "error"
            };
          }
          return { result: true };
        },
        checkTime1(val) {
          if (moment(val).unix() < moment(this.formData.start_time).unix()) {
            return { result: false, message: lang.promo_tip10, type: "error" };
          }
          return { result: true };
        },
        changeType() {
          this.$nextTick(() => {
            this.$refs.formValidatorStatus.clearValidate({
              fields: ["value"]
            });
            this.formData.value = "";
          });
        },
        // 快速选择时长
        fastClick(e) {
          if (!e) {
            return false;
          }
          const start = new Date(
            moment(this.formData.start_time).format("YYYY/MM/DD HH:mm:ss")
          );
          const time = e.split("-");
          const end_time = moment(start).add(time[0], time[1])._d.getTime();
          this.formData.end_time = end_time;
          this.$refs.formValidatorStatus.validate({
            fields: ["start_time", "end_time"]
          });
        },
        // 获取优惠码详情
        async getDetail() {
          try {
            const res = await getVoucherDetail({ id: this.id });
            const temp = res.data.data.event_promotion;
            temp.start_time = temp.start_time * 1000;
            if (temp.end_time) {
              temp.end_time = temp.end_time * 1000;
            } else {
              temp.end_time = "";
            }
            temp.full = Number(temp.full);
            temp.value = Number(temp.value);
            this.formData = temp;
          } catch (error) {}
        },
        chooseCycle(e) {
          this.formData.cycle = e;
        },
        back() {
          location.href = "index.htm";
        },
        checkMin(val) {
          if (val > this.formData.recharge_max) {
            return {
              result: false,
              message: lang.currency_tip,
              type: "warning"
            };
          }
          return { result: true };
        },
        checkMax(val) {
          if (val < this.formData.recharge_min) {
            return {
              result: false,
              message: lang.currency_tip,
              type: "warning"
            };
          }
          return { result: true };
        },
        changeMoney() {
          this.$refs.formValidatorStatus.validate({
            fields: ["recharge_min", "recharge_max"]
          });
        },
        async onSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.loading = true;
              const params = JSON.parse(JSON.stringify(this.formData));
              params.products = params.products.filter((item) => item);
              params.start_time = parseInt(params.start_time / 1000);
              if (params.end_time) {
                params.end_time = parseInt(params.end_time / 1000);
              }
              if (this.optType === "add") {
                delete params.id;
              } else {
                params.id = this.id;
              }
              if (params.clients.length > 0) {
                params.client_type = "appoint";
              } else {
                params.client_type = "all";
              }
              const res = await addAndUpdateVoucher(this.optType, params);
              this.$message.success(res.data.msg);
              this.loading = false;
              this.back();
            } catch (error) {
              console.log(error);
              this.loading = false;
              this.$message.error(error.data.msg);
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },

        async getCommonSetting() {
          try {
            const res = await Axios.get("/common");
            localStorage.setItem("common_set", JSON.stringify(res.data.data));
          } catch (error) {}
        },
      }
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

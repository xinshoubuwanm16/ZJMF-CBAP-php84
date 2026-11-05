const template = document.getElementsByClassName("template")[0];
Vue.prototype.lang = Object.assign(window.lang, window.module_lang);

new Vue({
  components: {
    asideMenu,
    topMenu,
    eventCode,
  },
  mixins: [mixin],
  mounted() {
    this.getConfig();
    this.isShowPromo = this.addons_js_arr.includes("PromoCode");
    this.isShowLevel = this.addons_js_arr.includes("IdcsmartClientLevel");
    // 开启活动满减
    this.isShowFull = this.addons_js_arr.includes("EventPromotion");
    window.addEventListener("message", (event) => this.submitOrder(event));
  },
  destroyed() {},
  data() {
    return {
      id: "",
      tit: "",
      baseConfig: {},
      isShowPromo: false,
      isShowLevel: false,
      isShowFull: false,
      commonData: {},
      eventData: {
        id: "",
        discount: 0,
      },
      country: "",
      city: "",
      curImage: 0,
      imageName: "",
      version: "",
      curImageId: "",
      dataList: [], // 数据中心
      memMarks: {},
      cloudIndex: 0,
      cycle: "", // 周期
      cycleList: [],
      qty: 1,
      // 区域
      area_name: "",
      isChangeArea: true,
      lineList: [], // 线路
      lineDetail: {}, // 线路详情：bill_type, flow, bw, defence , ip
      lineName: "",
      lineType: "",
      bwName: "",
      defenseName: "",
      cpuName: "",
      memoryName: "",
      bwArr: [],
      bwMarks: {},
      bwTip: "",
      bwType: "",
      params: {
        // 配置参数
        meal_id: "",
        gift_domain: 0,
        duration_id: "",
        email: "",
        auto_renew: 0,
        second_domain: "",
      },
      rules: {
        name: [
          {
            pattern: /^[A-Za-z][a-zA-Z0-9_.-]{5,24}$/,
            message: lang.mf_tip16,
          },
        ],
      },
      sshList: [],
      dis_visible: false,
      // 配置价格
      loadingPrice: false,
      totalPrice: 0.0,
      preview: [],
      discount: "",
      duration: "",
      /* 优惠码 */
      promo: {
        scene: "new",
        promo_code: "",
        billing_cycle_time: "",
      },
      cartDialog: false,
      isInit: true,
      // 回调相关
      isUpdate: false,
      isConfig: false,
      position: 0,
      backfill: {},
      isLogin: localStorage.getItem("jwt"),
      lineChange: false,
      showErr: false,
      showImage: false,
      isHide: true,
      isChangeAreaId: false,
      levelNum: 0,
      aloneSwitch: false,
      calcBwList: [],
      calcBwRange: [],
      bwList: [],
      curCycle: 0,
      calcTotalPrice: 0,
      submitLoading: false,
      os: "",
      os_detail: "",
      domain_type: lang.exist_domain,
      isChangeMeal: false,
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
    filterMoney(money) {
      if (isNaN(money) || money * 1 < 0) {
        return "0.00";
      } else {
        return formatNuberFiexd(money);
      }
    },
  },
  created() {
    // 回显配置
    let temp = {};
    const params = getUrlParams();
    this.id = params.id;
    if (params.config || sessionStorage.getItem("product_information")) {
      try {
        temp = JSON.parse(params.config);
        this.isUpdate = true;
        this.isConfig = true;
      } catch (e) {
        temp = JSON.parse(sessionStorage.getItem("product_information")) || {};
        this.isUpdate = params.change;
      }
    }

    this.getGoodsName();
    this.getCommonData();
    // 回显配置
    if (this.isUpdate && temp.config_options) {
      this.backfill = temp.config_options;
      this.isChangeArea = false;
      const {
        country,
        city,
        curImage,
        cloudIndex,
        area_name,
        domain_type,
        os,
        os_detail,
      } = this.backfill;
      this.promo = temp.customfield;
      this.qty = temp.qty;
      this.position = temp.position;
      this.country = country;
      this.curImage = curImage;
      this.city = city;
      this.cloudIndex = cloudIndex;
      this.area_name = area_name;
      this.domain_type = domain_type;
      (this.os = os), (this.os_detail = os_detail);
    }
  },
  computed: {
    calcAreaList() {
      // 计算区域列表
      const temp =
        this.dataList
          .filter((item) => item.country_id === this.country * 1)[0]
          ?.cites.filter((item) => item.city === this.city)[0]?.areas || [];
      if (!this.isChangeArea) {
        return temp;
      }
      if (this.isUpdate && this.isInit) {
      } else {
        this.area_name = temp[0]?.area;
        // this.params.data_center_id = temp[0]?.id;
      }
      return temp;
    },
    calcMeals() {
      // 筛选套餐
      const temp =
        this.dataList
          .filter((item) => item.country_id === this.country * 1)[0]
          ?.cites.filter((item) => item.city === this.city)[0]
          ?.areas.filter((item) => item.area === this.area_name)[0]?.meals ||
        [];
      if (this.isUpdate && !this.isChangeArea) {
        // 首次回填
        this.getCycleList();
        return temp;
      }
      this.params.meal_id = temp[0]?.id;
      this.params.gift_domain = temp[0]?.gift_domain;
      this.os = temp[0]?.os;
      this.os_detail = temp[0]?.os_detail;
      // 计算价格
      setTimeout(() => {
        if (this.params.meal_id) {
          this.getCycleList();
        }
      }, 0);
      return temp;
    },
    // 加入购物车/确认修改
    calcCartName() {
      return this.isUpdate && !this.isConfig
        ? lang.product_sure_check
        : lang.product_add_cart;
    },
  },

  watch: {
    "params.meal_id"() {
      if (this.isUpdate && this.isInit) {
        return;
      }
      this.curCycle = 0;
      this.params.duration_id = this.cycleList[0]?.id;
    },
  },
  methods: {
    getGoodsName() {
      productInfo(this.id).then((res) => {
        this.tit = res.data.data.product.name;
        document.title =
          this.commonData.website_name + "-" + res.data.data.product.name;
      });
    },
    // iframe buy
    async handelIframeBuy(e) {
      this.$refs.orderForm.validate(async (res) => {
        if (res) {
          const bol = this.formatData();
          if (bol !== true) {
            return;
          }
          try {
            const params = {
              product_id: this.id,
              config_options: {
                ...this.params,
              },
              qty: this.qty,
              customfield: this.promo,
            };
            if (this.lineDetail.bill_type === "bw") {
              delete params.flow;
            } else {
              delete params.bw;
            }
            if (params.config_options.bw === lang.actual_bw) {
              params.config_options.bw = "NC";
            }
            const postObj = {
              type: "iframeBuy",
              params,
              price: this.calcTotalPrice,
            };
            if (e.data.type === "iframeBuy") {
              window.parent.postMessage(postObj, "*");
            }
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        }
      });
    },
    getQuery(name) {
      const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      const r = window.location.search.substr(1).match(reg);
      if (r != null) return decodeURI(r[2]);
      return null;
    },
    // 配置数据
    async getConfig() {
      try {
        this.isInit = true;
        const params = {
          id: this.id,
        };
        this.loadingPrice = true;
        const res = await getOrderConfig(params);
        const temp = res.data.data;
        // 通用数据处理
        this.dataList = temp.countries;
        this.baseConfig = temp.config;
        // 初始化数据
        if (!this.isUpdate) {
          let email = "";
          if (this.isLogin) {
            const account = await accountDetail();
            email = account.data.data.account.email;
          }
          // 不是回填
          this.params = {
            meal_id: "",
            gift_domain: 0,
            duration_id: "",
            email,
            auto_renew: 0,
            second_domain: "",
          };
          this.qty = 1;
          this.country = String(this.dataList[0]?.country_id);
          this.city = String(this.dataList[0]?.cites[0]?.city);
          this.cloudIndex = 0;
        } else {
          // 回填数据
          this.params = this.backfill;
        }
        this.totalPrice = 0.0;
        //  this.getBwDetails(this.params.data_center_id);
      } catch (error) {
        console.log("@@@", error);
      }
    },
    // 切换套餐
    changeRecommend(item, index) {
      this.cloudIndex = index;
      if (this.params.meal_id === item.id) {
        return;
      }
      this.params.meal_id = item.id;
      this.params.gift_domain = item.gift_domain;
      this.os = item.os;
      this.os_detail = item.os_detail;
      this.getCycleList();
    },
    // 选择区域
    changeArea(e) {
      this.isChangeArea = true;
      this.area_name = this.calcAreaList.filter(
        (item) => item.area === e
      )[0]?.area;
      // 重置套餐
      this.cloudIndex = 0;
    },
    // 切换城市
    changeCity(e, city) {
      this.isChangeArea = true;
      this.cloudIndex = 0;
    },
    tableRowClassName({ row, rowIndex }) {
      row.index = rowIndex;
    },
    // 商品购买数量减少
    delQty() {
      if (this.qty > 1) {
        this.qty--;
        this.loadingPrice = true;
        this.changeConfig();
      }
    },
    // 商品购买数量增加
    addQty() {
      this.qty++;
      this.loadingPrice = true;
      this.changeConfig();
    },
    // 提交前格式化数据
    formatData() {
      return true;
    },
    // 立即购买
    async submitOrder(e) {
      if (e.data && e.data.type !== "iframeBuy") {
        return;
      }
      if (
        Boolean(
          (JSON.parse(localStorage.getItem("common_set_before")) || {})
            .custom_fields?.before_settle === 1
        )
      ) {
        window.open("/account.htm");
        return;
      }

      this.$refs.orderForm.validate(async (res) => {
        if (res) {
          const bol = this.formatData();
          if (bol !== true) {
            return;
          }

          try {
            const params = {
              product_id: this.id,
              config_options: {
                ...JSON.parse(JSON.stringify(this.params)),
              },
              qty: this.qty,
              customfield: this.promo,
            };
            if (!params.config_options.email) {
              return this.$message.error(lang.da_tip4);
            }

            if (e.data && e.data.type === "iframeBuy") {
              const postObj = {
                type: "iframeBuy",
                params,
                price: this.calcTotalPrice,
              };
              window.parent.postMessage(postObj, "*");
              return;
            }
            // 直接传配置到结算页面
            sessionStorage.setItem(
              "product_information",
              JSON.stringify(params)
            );
            location.href = `/cart/settlement.htm?id=${params.product_id}`;
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        }
      });
    },
    handlerCart() {
      if (this.isUpdate && !this.isConfig) {
        this.changeCart();
      } else {
        this.addCart();
      }
    },
    // 加入购物车
    addCart() {
      this.$refs.orderForm.validate(async (res) => {
        if (res) {
          const bol = this.formatData();
          if (bol !== true) {
            return;
          }
          try {
            const params = {
              product_id: this.id,
              config_options: {
                ...JSON.parse(JSON.stringify(this.params)),
                // 其他需要回显的页面数据
                country: this.country,
                city: this.city,
                cloudIndex: this.cloudIndex,
                area_name: this.area_name,
                domain_type: this.domain_type,
                os: this.os,
                os_detail: this.os_detail,
              },
              qty: this.qty,
              customfield: this.promo,
            };
            if (!params.config_options.email) {
              return this.$message.error(lang.da_tip4);
            }
            const res = await addToCart(params);
            if (res.data.status === 200) {
              this.cartDialog = true;
              const result = await getCart();
              localStorage.setItem(
                "cartNum",
                "cartNum-" + result.data.data.list.length
              );
            }
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        }
      });
    },
    // 修改购物车
    async changeCart() {
      this.$refs.orderForm.validate(async (res) => {
        if (res) {
          const bol = this.formatData();
          if (bol !== true) {
            return;
          }
          try {
            const params = {
              position: this.position,
              product_id: this.id,
              config_options: {
                ...JSON.parse(JSON.stringify(this.params)),
                // 其他需要回显的页面数据
                country: this.country,
                city: this.city,
                cloudIndex: this.cloudIndex,
                domain_type: this.domain_type,
                os: this.os,
                os_detail: this.os_detail,
              },
              qty: this.qty,
              customfield: this.promo,
            };
            if (!params.config_options.email) {
              return this.$message.error(lang.da_tip4);
            }
            this.dataLoading = true;
            const res = await updateCart(params);
            this.$message.success(res.data.msg);
            setTimeout(() => {
              location.href = "/cart/shoppingCar.htm";
            }, 300);
            this.dataLoading = false;
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        }
      });
    },
    goToCart() {
      location.href = "/cart/shoppingCar.htm";
      this.cartDialog = false;
    },
    changeCountry() {
      this.isChangeArea = true;
      this.city = this.dataList.filter(
        (item) => item.country_id === this.country * 1
      )[0].cites[0]?.city;
      this.cloudIndex = 0;
      if (this.activeName === "fast") {
        this.handlerFast();
      }
      this.isChangeMeal = true;
    },
    changQty() {
      this.loadingPrice = true;
      this.changeConfig();
    },
    eventChange(evetObj) {
      if (this.eventData.id !== evetObj.id) {
        this.eventData.id = evetObj.id || "";
        this.promo.event_promotion = this.eventData.id;
        this.changeConfig();
      }
    },
    // 使用优惠码
    async useDiscount() {
      try {
        if (this.promo.promo_code.length !== 9) {
          this.showErr = true;
          return;
        }
        const params = JSON.parse(JSON.stringify(this.promo));
        params.product_id = this.id;
        params.qty = this.qty;
        params.amount = this.totalPrice;
        params.billing_cycle_time = this.duration;
        const res = await usePromo(params);
        this.$message.success(res.data.msg);
        this.changeConfig();
        this.dis_visible = false;
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    canclePromo() {
      this.discount = 0;
      this.promo.promo_code = "";
      this.changeConfig();
    },
    changeDuration() {
      this.loadingPrice = true;
      this.promo.promo_code = "";
      this.discount = 0;
      this.changeConfig();
    },
    // 切换周期
    changeCycle(item, index) {
      this.params.duration_id = item.id;
      this.curCycle = index;
      this.changeConfig();
    },
    // 获取周期
    async getCycleList(bol = false) {
      try {
        this.lineChange = false;
        this.loadingPrice = true;
        const params = {
          product_id: this.id,
          id: this.params.meal_id,
        };
        const hasDuration = params.duration_id;
        if (this.isUpdate && this.isInit) {
          this.params.meal_id = params.meal_id = this.backfill.meal_id;
        }
        if (hasDuration || bol) {
          this.changeConfig();
        }
        const res = await getDuration(params);
        this.cycleList = res.data.data;
        this.params.duration_id =
          this.params.duration_id || this.cycleList[0]?.id;
        this.curCycle = this.cycleList.findIndex(
          (item) => item.id === this.params.duration_id
        );
        if (!hasDuration) {
          this.changeConfig();
        }
      } catch (error) {}
    },
    // 更改配置计算价格
    async changeConfig() {
      try {
        const params = {
          id: this.id,
          config_options: {
            ...this.params,
            promo_code: this.promo.promo_code,
            event_promotion: this.promo.event_promotion,
          },
          qty: this.qty,
        };
        if (this.isUpdate && this.isInit) {
          params.config_options.meal_id = this.backfill.meal_id;
        }
        this.loadingPrice = true;
        const res = await calcPrice(params);
        this.totalPrice = res.data.data.price * 1;
        this.calcTotalPrice = res.data.data.price_total * 1;
        this.eventData.discount =
          res.data.data.price_event_promotion_discount * 1 || 0;
        this.discount = res.data.data.price_promo_code_discount * 1 || 0;
        this.levelNum = res.data.data.price_client_level_discount * 1 || 0;
        this.preview = res.data.data.preview;
        this.duration = res.data.data.duration;
        this.isInit = false;
        this.loadingPrice = false;
      } catch (error) {
        this.loadingPrice = false;
        this.$message.error(error.data.msg);
      }
    },
    // 获取通用配置
    getCommonData() {
      this.commonData = JSON.parse(localStorage.getItem("common_set_before"));
      document.title = this.commonData.website_name + "-" + this.tit;
    },
  },
}).$mount(template);

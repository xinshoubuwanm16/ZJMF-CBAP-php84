const template = document.getElementsByClassName("template")[0];
Vue.prototype.lang = Object.assign(window.lang, window.module_lang);
new Vue({
  components: {
    asideMenu,
    topMenu,
    eventCode,
    customGoods,
    discountCode,
  },
  mixins: [mixin],
  mounted() {
    this.getConfig();
    this.isShowPromo = this.addons_js_arr.includes("PromoCode");
    this.isShowLevel = this.addons_js_arr.includes("IdcsmartClientLevel");
    this.isShowFull = this.addons_js_arr.includes("EventPromotion");

    window.addEventListener("message", (event) => this.submitOrder(event));
  },
  destroyed() {},
  data() {
    return {
      id: "",
      tit: "",
      is_show_custom: false,
      isShowPromo: false,
      self_defined_field: {}, // 自定义字段
      isShowLevel: false,
      isShowFull: false,
      commonData: {},
      eventData: {
        id: "",
        discount: 0,
      },
      country: "",
      countryName: "",
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
        data_center_id: "",
        bw: "",
        duration_id: "",
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
      calcTotalPrice: 0,
      preview: [],
      discount: "",
      duration: "",
      /* 优惠码 */
      promo: {
        scene: "new",
        promo_code: "",
        billing_cycle_time: "",
        event_promotion: "",
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
      submitLoading: false,
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
    // 回显配置
    if (this.isUpdate && temp.config_options) {
      this.backfill = temp.config_options;
      this.isChangeArea = false;
      const { country, countryName, city, curImage, cloudIndex, aloneSwitch } =
        this.backfill;
      this.promo = temp.customfield;
      this.self_defined_field = temp.self_defined_field || {};
      this.qty = temp.qty;
      this.position = temp.position;
      this.country = country;
      this.countryName = countryName;
      this.curImage = curImage;
      this.city = city;
      this.cloudIndex = cloudIndex;
      this.aloneSwitch = aloneSwitch;
    }
    this.getCommonData();
    this.getGoodsName();
  },
  watch: {
    "params.data_center_id"(id) {
      if (this.isUpdate && this.isInit) {
        return;
      }
      this.getBwDetails(id);
    },
  },
  computed: {
    calcArea() {
      const c = this.dataList.filter((item) => item.id === this.country * 1)[0]
        ?.name;
      return c + this.city;
    },
    calcAreaList() {
      // 计算区域列表
      const temp =
        this.dataList
          .filter((item) => item.id === this.country * 1)[0]
          ?.city.filter((item) => item.name === this.city)[0]?.area || [];
      if (!this.isChangeArea) {
        return temp;
      }
      if (this.isUpdate && this.isInit) {
      } else {
        this.area_name = temp[0]?.name;
        this.params.data_center_id = temp[0]?.id;
      }
      return temp;
    },
    calcUsable() {
      return this.dataList
        .filter((item) => item.id === this.country * 1)[0]
        ?.city.filter((item) => item.name === this.city)[0]
        ?.area.filter((item) => item.id === this.params.data_center_id)[0]
        ?.name;
    },
    calcCartName() {
      return this.isUpdate && !this.isConfig
        ? lang.product_sure_check
        : lang.product_add_cart;
    },
  },

  methods: {
    getQuery(name) {
      const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      const r = window.location.search.substr(1).match(reg);
      if (r != null) return decodeURI(r[2]);
      return null;
    },
    // 配置数据
    async getConfig() {
      try {
        const params = {
          id: this.id,
        };
        const res = await getOrderConfig(params);
        const temp = res.data.data;
        // 通用数据处理
        this.dataList = temp.data_center;
        // 初始化数据
        if (!this.isUpdate) {
          // 不是回填
          this.params = {
            data_center_id: "",
            bw: "",
            duration_id: "",
          };
          this.qty = 1;
          this.country = String(this.dataList[0]?.id);
          this.countryName = String(this.dataList[0]?.name);
          this.city = String(this.dataList[0]?.city[0]?.name);
          this.cloudIndex = 0;
        } else {
          // 回填数据
          this.params = this.backfill;
          this.area_name = this.calcAreaList.filter(
            (item) => item.id === this.params.data_center_id
          )[0]?.name;
        }
        this.totalPrice = 0.0;
        this.isInit = true;
        this.getBwDetails(this.params.data_center_id);
      } catch (error) {
        console.log("@@@", error);
      }
    },
    // 获取独立带宽详情
    async getBwDetails(id) {
      try {
        if (!id) {
          return;
        }
        const res = await getBwDetail({
          id: this.id,
          data_center_id: id,
        });
        const temp = res.data.data.list;
        this.bwList = temp;
        if (temp.length > 0) {
          // 单选
          this.bwType = temp[0].type;
          if (temp[0].type === "radio") {
            this.calcBwList = temp;
            if (this.isUpdate && this.isInit) {
              this.params.bw = this.params.bw * 1;
            } else {
              this.params.bw = this.calcBwList[0].value;
            }
            this.bwName =
              this.params.bw === "NC" ? lang.actual_bw : this.params.bw + "M";
          } else {
            // 多选
            let fArr = [];
            temp.forEach((item) => {
              fArr.push(
                ...this.createArr([item.min_value * 1, item.max_value * 1])
              );
            });
            fArr = Array.from(new Set(fArr));
            this.calcBwRange = fArr;
            this.bwMarks = this.createMarks(fArr);
            this.bwTip = this.createTip(fArr);
            if (this.isUpdate && this.isInit) {
              this.params.bw = this.params.bw * 1;
            } else {
              this.params.bw = this.calcBwRange[0] * 1 || 1;
            }
            this.bwName =
              this.params.bw === "NC" ? lang.actual_bw : this.params.bw + "M";
          }
        } else {
          this.aloneSwitch = false;
          this.params.bw = 0;
        }
        setTimeout(() => {
          this.getCycleList();
        }, 0);
      } catch (error) {
        console.log("error", error);
        this.$message.error(error.data.msg);
      }
    },
    changeBw(e) {
      if (e === lang.actual_bw) {
        this.params.bw = "NC";
      } else {
        this.params.bw = e.replace("M", "");
      }
      // 计算价格
      setTimeout(() => {
        this.getCycleList();
      }, 0);
    },
    changeBwNum(num) {
      if (!this.calcBwRange.includes(num)) {
        this.calcBwRange.forEach((item, index) => {
          if (num > item && num < this.calcBwRange[index + 1]) {
            this.params.bw =
              num - item > this.calcBwRange[index + 1] - num
                ? this.calcBwRange[index + 1]
                : item;
          }
        });
      }
      this.getCycleList();
    },
    createArr([m, n]) {
      // 生成数组
      let temp = [];
      for (let i = m; i <= n; i++) {
        temp.push(i * 1);
      }
      return temp;
    },
    createTip(arr) {
      // 生成范围提示
      let tip = "";
      let num = [];
      arr.forEach((item, index) => {
        if (arr[index + 1] - item > 1) {
          num.push(index);
        }
      });
      if (num.length === 0) {
        tip = `${arr[0]}-${arr[arr.length - 1]}`;
      } else {
        tip += `${arr[0]}-${arr[num[0]]},`;
        num.forEach((item, ind) => {
          tip +=
            arr[item + 1] +
            "-" +
            (arr[num[ind + 1]] ? arr[num[ind + 1]] + "," : arr[arr.length - 1]);
        });
      }
      return tip;
    },
    createMarks(data) {
      const obj = {
        0: "",
        25: "",
        50: "",
        75: "",
        100: "",
      };
      const range = data[data.length - 1] - data[0];
      obj[0] = `${data[0]}`;
      obj[25] = `${data[0] + Math.ceil(range * 0.25)}`;
      obj[50] = `${data[0] + Math.ceil(range * 0.5)}`;
      obj[75] = `${data[0] + Math.ceil(range * 0.75)}`;
      obj[100] = `${data[data.length - 1]}`;
      return obj;
    },
    // 选择区域
    changeArea(e) {
      this.isChangeArea = false;
      // 手动切换区域不初始化第一个区域
      this.params.data_center_id = this.calcAreaList.filter(
        (item) => item.name === e
      )[0]?.id;
      this.area_name = this.calcAreaList.filter(
        (item) => item.name === e
      )[0]?.name;
      // this.lineList = this.calcAreaList.filter(
      //   (item) => item.name === e
      // )[0]?.line;
      // this.params.line_id = this.lineList[0].id;
      // this.lineName = this.lineList[0].name;
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
          const flag = this.$refs.customGoodRef.getSelfDefinedField();
          if (!flag) return;
          try {
            const params = {
              product_id: this.id,
              config_options: {
                ...this.params,
              },
              qty: this.qty,
              customfield: this.promo,
              self_defined_field: this.self_defined_field,
            };
            if (params.config_options.bw === lang.actual_bw) {
              params.config_options.bw = "NC";
            }
            if (!this.aloneSwitch) {
              params.config_options.bw = 0;
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
          const flag = this.$refs.customGoodRef.getSelfDefinedField();
          if (!flag) return;
          try {
            const params = {
              product_id: this.id,
              config_options: {
                ...this.params,
                // 其他需要回显的页面数据
                activeName: this.activeName,
                country: this.country,
                countryName: this.countryName,
                city: this.city,
                curImage: this.curImage,
                curImageId: this.curImageId,
                imageName: this.imageName,
                version: this.version,
                cloudIndex: this.cloudIndex,
                aloneSwitch: this.aloneSwitch,
              },
              qty: this.qty,
              customfield: this.promo,
              self_defined_field: this.self_defined_field,
            };
            if (params.config_options.bw === lang.actual_bw) {
              params.config_options.bw = "NC";
            }
            if (!this.aloneSwitch) {
              params.config_options.bw = 0;
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
          const flag = this.$refs.customGoodRef.getSelfDefinedField();
          if (!flag) return;
          try {
            const params = {
              position: this.position,
              product_id: this.id,
              config_options: {
                ...this.params,
                // 其他需要回显的页面数据
                activeName: this.activeName,
                country: this.country,
                countryName: this.countryName,
                city: this.city,
                curImage: this.curImage,
                curImageId: this.curImageId,
                imageName: this.imageName,
                version: this.version,
                cloudIndex: this.cloudIndex,
                login_way: this.login_way,
                aloneSwitch: this.aloneSwitch,
              },
              qty: this.qty,
              customfield: this.promo,
              self_defined_field: this.self_defined_field,
            };
            if (params.config_options.bw === lang.actual_bw) {
              params.config_options.bw = "NC";
            }
            if (!this.aloneSwitch) {
              params.config_options.bw = 0;
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
      this.countryName = this.dataList.filter(
        (item) => item.id === this.country * 1
      )[0]?.name;
      this.isChangeArea = true;
      this.city = this.dataList.filter(
        (item) => item.id === this.country * 1
      )[0].city[0]?.name;
      this.cloudIndex = 0;
      if (this.activeName === "fast") {
        this.handlerFast();
      }
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
    getDiscount(data) {
      this.promo.promo_code = data[1];
      this.changeConfig();
    },
    removeDiscountCode() {
      this.promo.promo_code = "";
      this.discount = 0;
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
        const params = JSON.parse(JSON.stringify(this.params));
        if (!this.aloneSwitch) {
          params.bw = 0;
        } else {
          if (this.params.bw) {
            params.bw = this.params.bw;
          } else {
            // 赋值初始值
            if (this.bwList[0].type === "radio") {
              params.bw = this.calcBwList[0].value;
            } else {
              params.bw = this.calcBwRange[0] * 1 || 1;
            }
            this.bwName = params.bw === "NC" ? lang.actual_bw : params.bw + "M";
          }
        }
        params.id = this.id;
        const hasDuration = params.duration_id;
        const res = await getDuration(params);
        this.cycleList = res.data.data;
        this.params.duration_id =
          this.params.duration_id || this.cycleList[0]?.id;
        this.curCycle = this.cycleList.findIndex(
          (item) => item.id === this.params.duration_id
        );
        if (hasDuration || bol) {
          this.changeConfig();
        }
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
        if (params.config_options.bw === lang.actual_bw) {
          params.config_options.bw = "NC";
        }
        if (!this.aloneSwitch) {
          params.config_options.bw = 0;
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
    getGoodsName() {
      productInfo(this.id).then((res) => {
        this.tit = res.data.data.product.name;
        document.title =
          this.commonData.website_name + "-" + res.data.data.product.name;
      });
    },
    // 获取通用配置
    getCommonData() {
      this.commonData = JSON.parse(localStorage.getItem("common_set_before"));
    },
  },
}).$mount(template);

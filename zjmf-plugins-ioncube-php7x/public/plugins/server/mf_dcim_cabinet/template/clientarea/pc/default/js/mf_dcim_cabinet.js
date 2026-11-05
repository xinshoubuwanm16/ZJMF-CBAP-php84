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
    this.hasDiscount = this.addons_js_arr.includes("PromoCode");
    this.isShowFull = this.addons_js_arr.includes("EventPromotion");
    window.addEventListener("message", (event) => this.submitOrder(event));
  },
  destroyed() {},
  data() {
    return {
      id: "",
      tit: "",
      activeName: "fixed", // fixed flex
      hasDiscount: false,
      commonData: {},
      isShowFull: false,
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
      self_defined_field: {},
      dataList: [], // 数据中心
      memMarks: {},
      limitList: [], // 限制
      configLimitList: [], // 限制规则
      cloudIndex: 0,
      cycle: "", // 周期
      cycleList: [],
      qty: 1,
      recommendList: [], // 推荐套餐
      // 区域
      area_name: "",
      isChangeArea: true,
      lineList: [], // 线路
      lineDetail: {}, // 线路详情：bill_type, flow, bw, defence , ip
      lineName: "",
      lineType: "",
      bwArr: [],
      bwMarks: {},
      bwTip: "",
      bwType: "",
      params: {
        // 配置参数
        data_center_id: "",
        package_id: "",
        bw: "",
        flow: "",
        peak_defence: "",
        ip_num: "",
        duration_id: "",
      },
      hover: false,
      rules: {},
      dis_visible: false,
      // 配置价格
      loadingPrice: false,
      totalPrice: 0.0,
      preview: [],
      discount: 0,
      calcTotalPrice: 0,
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
      position: 0,
      backfill: {},
      // 公网ip
      ipData: [],
      isLogin: localStorage.getItem("jwt"),
      lineChange: false,
      showErr: false,
      showImage: false,
      isHide: true,
      isChangeAreaId: false,
      levelNum: 0,
      cloudIndex: 0,
      /* 机柜套餐 */
      isChangeLine: false,
      cabinetType: {
        1: lang.mf_full,
        2: lang.mf_half,
        4: "1/4",
      },
      isGetLine: false, // 是否获取线路（展示增值）
      ipSwitch: false,
      bwSwitch: false,
      flowSwitch: false,
      defenceSwitch: false,
      isManual: false,
      ipName: "",
      order_check_u: "",
    };
  },
  filters: {
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
      const {
        country,
        countryName,
        city,
        curImage,
        version,
        curImageId,
        cloudIndex,
        activeName,
        ip_num,
        bw,
        flow,
        peak_defence,
      } = this.backfill;
      this.promo = temp.customfield;
      this.self_defined_field = temp.self_defined_field || {};
      this.qty = temp.qty;
      this.position = temp.position;
      this.activeName = activeName;
      this.country = country;
      this.countryName = countryName;
      this.curImage = curImage;
      this.city = city;
      this.version = version;
      this.curImageId = curImageId;
      this.cloudIndex = cloudIndex;
      if (ip_num) {
        this.ipSwitch = true;
      }
      if (bw) {
        this.bwSwitch = true;
      }
      if (flow) {
        this.flowSwitch = true;
      }
      if (peak_defence) {
        this.defenceSwitch = true;
      }
    }
    this.getGoodsName();
    this.getCommonData();
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

        this.isManual = true;
      }
      return temp;
    },
    calcPackage() {
      const temp = this.dataList
        .filter((item) => item.id === this.country * 1)[0]
        ?.city.filter((item) => item.name === this.city)[0]
        ?.area.filter((item) => item.id === this.params.data_center_id)[0];
      const result = (temp || {}).package || [];
      if (this.isUpdate && this.isInit) {
      } else {
        this.params.package_id = result[0]?.id;
      }
      if (this.params.package_id) {
        this.isGetLine =
          result.filter((item) => item.id === this.params.package_id)[0]
            ?.cannot_add_value === 0;
        this.getLineDetails(this.params.package_id);
      } else {
        this.isGetLine = false;
      }
      return result;
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
    calcBwList() {
      // 根据区域，机型以及 线路来判断计算可选带宽  单选
      const temp =
        this.configLimitList.filter(
          (item) =>
            this.params.data_center_id === item.data_center_id &&
            this.params.line_id === item.line_id &&
            item.model_config_id.includes(String(this.params.model_config_id))
        ) || [];
      const bw = temp.reduce((all, cur) => {
        if (cur.min_bw) {
          all.push(...this.createArr([cur.min_bw * 1, cur.max_bw * 1]));
        }
        return all;
      }, []);
      return this.lineDetail.bw.filter((item) => !bw.includes(item.value * 1));
    },
    calcBwRange() {
      // 根据区域，线路来判断计算可选带宽  范围
      const temp =
        this.configLimitList.filter(
          (item) =>
            this.params.data_center_id === item.data_center_id &&
            this.params.line_id === item.line_id &&
            item.model_config_id.includes(String(this.params.model_config_id))
        ) || [];
      if (temp.length === 0) {
        // 没有匹配到限制条件
        this.bwTip = this.createTip(this.bwArr);
        this.bwMarks = this.createMarks(this.bwArr);
        return this.bwArr || [];
      }
      let fArr = [];
      temp.forEach((item) => {
        fArr.push(...this.createArr([item.min_bw * 1, item.max_bw * 1]));
      });
      fArr = Array.from(new Set(fArr));
      const filterArr = this.bwArr.filter((item) => !fArr.includes(item));
      this.bwTip = this.createTip(filterArr);
      this.bwMarks = this.createMarks(filterArr); // data 原数据，目标marks
      return filterArr.filter((item) => !fArr.includes(item));
    },
    calcFlowList() {
      // 根据区域，线路来判断计算可选带宽  单选
      const temp =
        this.configLimitList.filter(
          (item) =>
            this.params.data_center_id === item.data_center_id &&
            this.params.line_id === item.line_id &&
            item.model_config_id.includes(String(this.params.model_config_id))
        ) || [];

      const flow = temp.reduce((all, cur) => {
        if (cur.min_flow) {
          all.push(...this.createArr([cur.min_flow * 1, cur.max_flow * 1]));
        }
        return all;
      }, []);
      return this.lineDetail.flow.filter(
        (item) => !flow.includes(item.value * 1)
      );
    },
    calcIpUnit() {
      return (val) => {
        if (val === "NC") {
          const isNc = this.ipData.filter((item) => item.value === "NC");
          return isNc[0].desc || lang.actual_ip;
        }
        let temp = "";
        if (String(val).includes("_")) {
          temp = val.split(",").reduce((all, cur) => {
            all += cur.split("_")[0] * 1;
            return all;
          }, 0);
        } else {
          temp = val;
        }
        return `${temp}${lang.mf_one}`;
      };
    },
    calcBwShow() {
      if (this.params.bw === "NC") {
        const isNc = this.calcBwList.filter((item) => item.value === "NC");
        return isNc[0].value_show || lang.actual_bw;
      } else {
        return this.params.bw && this.params.bw !== "NC"
          ? this.params.bw + "Mbps"
          : "--";
      }
    },
  },

  methods: {
    changeSwitch(e, type) {
      if (!e) {
        this.params[type] = "";
      } else {
        switch (type) {
          case "ip_num":
            this.params.ip_num = this.ipData[0]?.value;
            this.ipName = this.ipData[0]?.desc;
            break;
          case "bw":
            if (this.bwType === "radio") {
              this.params.bw = this.calcBwRange[0]?.value || "";
            } else {
              this.params.bw = this.calcBwRange[0] * 1 || 1;
            }
            break;
          case "flow":
            this.params.flow = this.lineDetail.flow[0]?.value;
            break;
          case "peak_defence":
            this.params.peak_defence = this.lineDetail.defence[0]?.value;
            break;
        }
      }
      this.changeConfig();
    },
    // 切换套餐
    changeRecommend(item, index) {
      this.cloudIndex = index;
      if (this.params.package_id === item.id) {
        return;
      }
      this.isManual = true;
      // 赋值
      this.params.package_id = item.id;
      this.isGetLine = item.cannot_add_value === 0;
      this.getLineDetails(this.params.package_id);
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
        const params = {
          id: this.id,
        };
        const res = await getOrderConfig(params);
        const temp = res.data.data;
        // 通用数据处理
        this.dataList = temp.data_center;
        this.order_check_u = temp.order_check_u;
        // 初始化数据
        if (!this.isUpdate) {
          // 不是回填
          this.params = {
            data_center_id: "",
            line_id: "",
            bw: "",
            flow: "",
            peak_defence: "",
            ip_num: "",
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
        }
        this.totalPrice = 0.0;
        this.handlerCustom();
      } catch (error) {
        console.log("@@@", error);
      }
    },
    // 切换自定义配置
    handlerCustom() {
      if (this.isUpdate) {
        // 回填
        this.area_name = this.calcAreaList.filter(
          (item) => item.id === this.params.data_center_id
        )[0]?.name;
      }
    },
    /* 线路 */
    async getLineDetails(id) {
      try {
        if (!id) {
          return;
        }
        // 获取线路详情
        const res = await getLineDetail({ id: this.id, package_id: id });
        this.lineDetail = res.data.data || {
          bill_type: "",
          bw: [],
          flow: [],
          ip: [],
          defence: [],
        };
        // 公网IP
        this.ipData = this.lineDetail.ip || [];
        if (this.lineDetail.bw) {
          this.bwType = this.lineDetail.bw[0]?.type;
          // 循环生成带宽可选数组
          const fArr = [];
          this.lineDetail.bw.forEach((item) => {
            fArr.push(...this.createArr([item.min_value, item.max_value]));
          });
          this.bwArr = fArr;
          this.bwTip = this.createTip(fArr);
          this.bwMarks = this.createMarks(this.bwArr);
        }
        if (this.isManual) {
          this.ipSwitch = false;
          this.bwSwitch = false;
          this.flowSwitch = false;
          this.defenceSwitch = false;
          this.params.ip_num = "";
          this.params.bw = "";
          this.params.flow = "";
          this.params.peak_defence = "";
        }
        setTimeout(() => {
          this.getCycleList();
        }, 10);
      } catch (error) {
        console.log("####", error);
      }
    },
    changeBw(e) {
      // 判读e是否为带NC
      const isNc = this.calcBwList.filter((item) => item.value_show === e);
      if (isNc.length > 0 || e === lang.actual_bw) {
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
    // 切换IP
    changeIp(e) {
      // 判读e是否为带NC
      const isNc = this.ipData.filter(
        (item) => item.desc === e && item.value === "NC"
      );
      if (isNc.length > 0 || e === lang.actual_ip) {
        this.params.ip_num = "NC";
      } else {
        let temp = e.replace(lang.mf_one, "") * 1;
        this.params.ip_num =
          this.ipData.filter((item) => {
            if (item.value !== "NC") {
              return (
                (item.value,
                item.value.split(",").reduce((all, cur) => {
                  all += cur.split("_")[0] * 1;
                  return all;
                }, 0)) === temp
              );
            }
          })[0]?.value || "";
      }
      setTimeout(() => {
        this.getCycleList();
      }, 0);
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
      this.lineList = this.calcAreaList.filter(
        (item) => item.name === e
      )[0]?.line;
      this.params.line_id = this.lineList[0].id;
      this.lineName = this.lineList[0].name;
    },
    // 选择先线路
    chooseLine(item) {
      this.params.data_center_id = item.data_center_id;
      this.params.line_id = item.id;
    },
    // 切换城市
    changeCity(e, city) {
      this.isChangeArea = true;
      this.cloudIndex = 0;
    },
    tableRowClassName({ row, rowIndex }) {
      row.index = rowIndex;
    },

    // 提交前格式化数据
    formatData() {
      // if (!this.params.image_id) {
      //   document.getElementById('image').scrollIntoView({ behavior: "smooth" })
      //   this.showImage = true
      //   return
      // }
      // ssh
      if (this.login_way === lang.security_tab1 && !this.params.ssh_key_id) {
        return this.$message.warning(
          `${lang.placeholder_pre2}${lang.security_tab1}`
        );
      }
      return true;
    },
    // 立即购买
    async submitOrder(iframeEvent) {
      if (iframeEvent.data && iframeEvent.data.type !== "iframeBuy") {
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
            if (this.lineDetail.bill_type === "bw") {
              delete params.flow;
            } else {
              delete params.bw;
            }
            if (iframeEvent.data && iframeEvent.data.type === "iframeBuy") {
              const postObj = {
                type: "iframeBuy",
                params,
                price: this.calcTotalPrice,
              };
              window.parent.postMessage(postObj, "*");
              return;
            }
            // 下单前检测U位
            if (this.order_check_u) {
              const checkResult = await checkU(params);
              if (checkResult.status === "400") {
                return;
              }
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
                cloudIndex: this.cloudIndex,
              },
              qty: this.qty,
              customfield: this.promo,
              self_defined_field: this.self_defined_field,
            };
            if (params.config_options.bw === lang.actual_bw) {
              params.config_options.bw = "NC";
            }
            if (this.lineDetail.bill_type === "bw") {
              delete params.flow;
            } else {
              delete params.bw;
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
                cloudIndex: this.cloudIndex,
              },
              qty: this.qty,
              customfield: this.promo,
              self_defined_field: this.self_defined_field,
            };
            if (this.lineDetail.bill_type === "bw") {
              delete params.flow;
            } else {
              delete params.bw;
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
      // 切换国家的时候，先重置机型id
      this.countryName = this.dataList.filter(
        (item) => item.id === this.country * 1
      )[0]?.name;
      this.isChangeArea = true;
      this.city = this.dataList.filter(
        (item) => item.id === this.country * 1
      )[0].city[0]?.name;
      this.cloudIndex = 0;
    },
    changQty() {
      this.loadingPrice = true;
      this.changeConfig();
    },
    eventChange(evetObj) {
      if (this.eventData.id !== evetObj.id) {
        this.eventData.id = evetObj.id || "";
        this.promo.event_promotion = this.eventData.id;
        if (this.params.data_center_id) {
          this.changeConfig();
        }
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
    // 获取周期
    async getCycleList() {
      try {
        this.lineChange = false;
        this.loadingPrice = true;
        const params = JSON.parse(JSON.stringify(this.params));
        params.id = this.id;
        const hasDuration = params.duration_id;
        if (params.bw === lang.actual_bw) {
          params.bw = "NC";
        }
        if (hasDuration) {
          this.changeConfig();
        }
        if (!this.isGetLine) {
          params.ip_num = "";
          params.bw = "";
          params.flow = "";
          params.peak_defence = "";
        }
        const res = await getDuration(params);
        this.cycleList = res.data.data;
        this.params.duration_id =
          this.params.duration_id || this.cycleList[0]?.id;
        if (!hasDuration) {
          this.changeConfig();
        }
      } catch (error) {
        console.log("#####cycle", error);
      }
    },
    formatConfig(data) {
      if (data.length === 0) {
        return;
      }
      return data.reduce((all, cur) => {
        all[Number(cur.id)] = cur.num;
        return all;
      }, {});
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
        this.loadingPrice = true;
        if (!this.isGetLine) {
          params.ip_num = "";
          params.bw = "";
          params.flow = "";
          params.peak_defence = "";
        }
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
        console.log("###error", error);
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
    mouseenter(index) {
      // if (index === this.curImage) {
      //   this.hover = true
      // }
      this.curImage = index;
      this.hover = true;
    },
    changeImage(item, index) {
      this.imageName = item.name;
      this.curImage = index;
      this.hover = true;
    },
    chooseVersion(ver, id) {
      this.curImageId = id;
      this.version = ver.name;
      this.params.image_id = ver.id;
      this.getCycleList();
    },
  },
}).$mount(template);

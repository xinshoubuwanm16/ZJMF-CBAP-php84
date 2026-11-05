const template = document.getElementById("product_detail_cloud");
Vue.prototype.lang = Object.assign(window.lang, window.module_lang);
new Vue({
  components: {
    asideMenu,
    topMenu,
    payDialog,
    pagination,
    discountCode,
    cashCoupon,
    cashBack,
    flowPacket,
  },
  mixins: [mixin],
  created() {
    // 获取产品id
    this.id = location.href.split("?")[1].split("=")[1];
    // 获取通用信息
    this.getCommonData();
    this.getIpDetail();
    // 获取产品详情
    this.getHostDetail();
    this.getRenewPrice();
  },
  mounted() {
    this.addons_js_arr = JSON.parse(
      document.querySelector("#addons_js").getAttribute("addons_js")
    ); // 插件列表
    const arr = this.addons_js_arr.map((item) => {
      return item.name;
    });
    this.addonsArr = arr;
    if (arr.includes("PromoCode")) {
      // 开启了优惠码插件
      this.isShowPromo = true;
      // 优惠码信息
      this.getPromoCode();
    }
    if (arr.includes("IdcsmartClientLevel")) {
      // 开启了等级优惠
      this.isShowLevel = true;
    }
    if (arr.includes("IdcsmartVoucher")) {
      // 开启了代金券
      this.isShowCash = true;
    }
    // 开启了插件才拉取接口
    // 退款相关
    arr.includes("IdcsmartRefund") && this.getRefundMsg();
    arr.includes("IdcsmartRenew") && this.getRenewStatus();
  },
  destroyed() {
    clearInterval(this.codeTimer);
    this.codeTimer = null;
  },
  updated() {
    // // 关闭loading
    // document.getElementById('mainLoading').style.display = 'none';
    // document.getElementById('product_detail_cloud').style.display = 'block'
    // document.getElementsByClassName('product_detail_cloud')[0].style.display = 'block'
  },
  computed: {
    calcBwList () {
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
    calcBwRange () {
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
    calcFlowList () {
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
        let temp = "";
        if (val.includes("_")) {
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
    showRenewPrice() {
      let p = this.hostData.renew_amount;
      this.renewPriceList.forEach((item) => {
        if (
          item.billing_cycle === this.hostData.billing_cycle_name &&
          this.hostData.renew_amount * 1 < item.price * 1
        ) {
          p = item.price * 1;
        }
      });
      return p;
    },
  },
  watch: {
    renewParams: {
      handler() {
        let n = 0;
        // l:当前周期的续费价格
        const l = this.hostData.renew_amount;
        if (this.isShowPromo && this.renewParams.customfield.promo_code) {
          // n: 算出来的价格
          n =
            (this.renewParams.base_price * 1000 -
              this.renewParams.clDiscount * 1000 -
              this.renewParams.code_discount * 1000) /
              1000 >
            0
              ? (this.renewParams.base_price * 1000 -
                  this.renewParams.clDiscount * 1000 -
                  this.renewParams.code_discount * 1000) /
                1000
              : 0;
        } else {
          //  n: 算出来的价格
          n =
            (this.renewParams.original_price * 1000 -
              this.renewParams.clDiscount * 1000 -
              this.renewParams.code_discount * 1000) /
              1000 >
            0
              ? (this.renewParams.original_price * 1000 -
                  this.renewParams.clDiscount * 1000 -
                  this.renewParams.code_discount * 1000) /
                1000
              : 0;
        }
        let t = n;
        // 如果当前周期和选择的周期相同，则和当前周期对比价格
        if (
          this.hostData.billing_cycle_time === this.renewParams.duration ||
          this.hostData.billing_cycle_name === this.renewParams.billing_cycle
        ) {
          // 谁大取谁
          t = n;
        }
        this.renewParams.totalPrice =
          t * 1000 - this.renewParams.cash_discount * 1000 > 0
            ? (
                (t * 1000 - this.renewParams.cash_discount * 1000) /
                1000
              ).toFixed(2)
            : 0;
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      addonsArr: [],
      initLoading: true,
      commonData: {
        currency_prefix: "",
        currency_suffix: "",
      },
      activeName: "2",
      configLimitList: [], // 限制规则
      configObj: {},
      backup_config: [],
      snap_config: [],
      // 实例id
      id: null,
      // 产品id
      product_id: 0,
      // 实例状态
      status: "operating",
      // 实例状态描述
      statusText: "",
      cpu_realData: {},
      // 代金券对象
      cashObj: {},
      // 是否救援系统
      isRescue: false,
      // 是否开启代金券
      isShowCash: false,
      // 产品详情
      hostData: {
        billing_cycle_name: "",
        status: "Active",
        first_payment_amount: "",
        renew_amount: "",
      },
      cloudConfig: {},
      // 实例详情
      cloudData: {
        data_center: {
          iso: "CN",
        },
        image: {
          icon: "",
        },
        config: {
          reinstall_sms_verify: 0,
          reset_password_sms_verify: 0,
        },
        package: {
          cpu: "",
          memory: "",
          out_bw: "",
          system_disk_size: "",
        },
        system_disk: {},
        iconName: "Windows",
        model_config: {},
      },
      // 是否显示支付信息
      isShowPayMsg: false,
      imgBaseUrl: "",
      // 是否显示添加备注弹窗
      isShowNotesDialog: false,
      // 备份输入框内容
      notesValue: "",
      // 错误提示信息
      errText: "",
      // 镜像优惠码价格
      payCodePrice: 0,
      onOffvisible: false,
      rebotVisibel: false,
      codeString: "",
      isShowIp: false,
      renewLoading: false, // 续费计算折扣loading
      // 停用信息
      refundData: {},
      // 停用状态
      refundStatus: {
        Pending: lang.common_cloud_text234,
        Suspending: lang.common_cloud_text235,
        Suspend: lang.common_cloud_text236,
        Suspended: lang.common_cloud_text237,
        Refund: lang.common_cloud_text238,
        Reject: lang.common_cloud_text239,
        Cancelled: lang.common_cloud_text240,
      },

      // 停用相关
      // 是否显示停用弹窗
      isShowRefund: false,
      // 停用页面信息
      refundPageData: {
        host: {
          create_time: 0,
          first_payment_amount: 0,
        },
      },
      // 停用页面参数
      refundParams: {
        host_id: 0,
        suspend_reason: null,
        type: "Expire",
      },

      addons_js_arr: [], // 插件列表
      isShowPromo: false, // 是否开启优惠码
      isShowLevel: false, // 是否开启等级优惠
      // 续费
      // 显示续费弹窗
      isShowRenew: false, // 续费的总计loading
      renewBtnLoading: false, // 续费按钮的loading
      // 续费页面信息
      renewPageData: [],
      renewPriceList: [],
      renewActiveId: "",
      renewOrderId: 0,
      isShowRefund: false,
      hostStatus: {
        Unpaid: {
          text: lang.common_cloud_text88,
          color: "#F64E60",
          bgColor: "#FFE2E5",
        },
        Pending: {
          text: lang.common_cloud_text89,
          color: "#3699FF",
          bgColor: "#E1F0FF",
        },
        Active: {
          text: lang.common_cloud_text90,
          color: "#1BC5BD",
          bgColor: "#C9F7F5",
        },
        Suspended: {
          text: lang.common_cloud_text91,
          color: "#F0142F",
          bgColor: "#FFE2E5",
        },
        Deleted: {
          text: lang.common_cloud_text92,
          color: "#9696A3",
          bgColor: "#F2F2F7",
        },
        Failed: {
          text: lang.common_cloud_text93,
          color: "#FFA800",
          bgColor: "#FFF4DE",
        },
      },
      isRead: false,
      isShowPass: false,
      passHidenCode: "",
      rescueStatusData: {},
      loading1: false,
      loading2: false,
      loading3: false,
      loading4: false,
      loading5: false,
      ipValueData: [],
      // 重置密码弹窗数据
      rePassData: {
        password: "",
        code: "",
        checked: false,
      },
      codeTimer: null,
      sendTime: 60,
      isSendCodeing: false,
      sendFlag: false,
      // 是否展示重置密码弹窗
      isShowRePass: false,
      // 救援模式弹窗数据
      rescueData: {
        type: "1",
        password: "",
      },
      // 是否展示救援模式弹窗
      isShowRescue: false,
      // 是否展示退出救援模式弹窗
      isShowQuit: false,
      ipValue: null,

      /* 升降级相关*/
      // 升降级套餐列表
      upgradeList: [],
      // 升降级表单
      upgradePackageId: "",
      // 当前切换的升降级套餐
      changeUpgradeData: {},
      // 是否展示升降级弹窗
      isShowUpgrade: false,
      // 升降级参数
      upParams: {
        customfield: {
          promo_code: "", // 优惠码
          voucher_get_id: "", // 代金券码
        },
        duration: "", // 周期
        isUseDiscountCode: false, // 是否使用优惠码
        clDiscount: 0, // 用户等级折扣价
        code_discount: 0, // 优惠码折扣价
        cash_discount: 0, // 代金券折扣价
        original_price: 0, // 原价
        totalPrice: 0, // 现价
      },

      // 续费参数
      renewParams: {
        id: 0, //默认选中的续费id
        isUseDiscountCode: false, // 是否使用优惠码
        customfield: {
          promo_code: "", // 优惠码
          voucher_get_id: "", // 代金券码
        },
        duration: "", // 周期
        billing_cycle: "", // 周期时间
        clDiscount: 0, // 用户等级折扣价
        cash_discount: 0, // 代金券折扣价
        code_discount: 0, // 优惠码折扣价
        original_price: 0, // 原价
        base_price: 0,
        totalPrice: 0, // 现价
      },

      // 磁盘 开始
      diskLoading: false,
      isSubmitEngine: false,
      ipName: "",
      // 实例磁盘列表
      // 过滤后
      diskList: [],
      // 未过滤
      allDiskList: [],
      // 订购/扩容标识
      isOrderOrExpan: true,
      // 订购磁盘参数
      orderDiskData: {
        id: 0,
        remove_disk_id: [],
        add_disk: [],
      },
      // 新增磁盘数据
      moreDiskData: [],
      // 订购磁盘弹窗相关
      isShowDg: false,
      // 其他配置信息
      configData: {},
      systemDiskList: [],
      dataDiskList: [],
      // 磁盘总价格
      moreDiskPrice: 0,
      // 磁盘优惠价格
      moreDiscountkDisPrice: 0,
      // 磁盘优惠码优惠价格
      moreCodePrice: 0,
      // 订购磁盘弹窗 中 当前配置磁盘
      oldDiskList: [],
      oldDiskList2: [],
      orderTimer: null,
      expanTimer: null,
      // 磁盘订单id
      diskOrderId: 0,
      // 订购/扩容标识
      isOrderOrExpan: true,
      // 是否显示扩容弹窗
      isShowExpansion: false,
      // 扩容磁盘参数
      expanOrderData: {
        id: 0,
        resize_data_disk: [],
      },
      // 扩容价格
      expansionDiskPrice: 0,
      // 扩容折扣
      expansionDiscount: 0,
      // 扩容优惠码优惠
      expansionCodePrice: 0,
      // 网络开始
      netLoading: false,
      netDataList: [],
      netParams: {
        page: 1,
        limit: 20,
        pageSizes: [20, 50, 100],
        total: 200,
        orderby: "id",
        sort: "desc",
        keywords: "",
      },
      // 网络流量
      flowData: {},
      // 日志开始
      logDataList: [],
      logParams: {
        page: 1,
        limit: 20,
        pageSizes: [20, 50, 100],
        total: 200,
        orderby: "id",
        sort: "desc",
        keywords: "",
      },
      logLoading: false,
      self_defined_field: [],
      isBs: true,
      // 弹窗表单数据
      createBsData: {
        id: 0,
        name: "",
        disk_id: 0,
      },
      // 实例磁盘列表
      // 是否显示弹窗
      isShwoCreateBs: false,
      cgbsLoading: false,
      isShowhyBs: false,
      safeDialogShow: false,
      // 还原显示数据
      restoreData: {
        restoreId: 0,
        // 实例名称
        cloud_name: "",
        // 创建时间
        time: "",
      },
      // 是否显示删除快照弹窗
      isShowDelBs: false,
      // 删除显示数据
      delData: {
        delId: 0,
        // 实例名称
        cloud_name: "",
        // 创建时间
        time: "",
        // 快照名称
        name: "",
      },
      bsDataLoading: false,
      // 获取快照/备份升降级价格 参数 生成快照/备份数量升降级订单参数

      // 是否显示开启备份弹窗
      isShowOpenBs: false,
      // 快照备份订单id
      bsOrderId: 0,
      chartSelectValue: "1",
      // 统计图表开始
      echartLoading: false,
      echartLoading1: false,
      echartLoading2: false,
      echartLoading3: false,
      echartLoading4: false,
      isShowPowerChange: false,
      powerTitle: "",
      diskPriceLoading: false,
      ipPriceLoading: false,
      ipMoney: 0.0,
      ipDiscountkDisPrice: 0.0,
      ipCodePrice: 0.0,
      upgradePriceLoading: false,
      trueDiskLength: 0,
      isShowAutoRenew: false,
      vpcDataList: [],
      vpcLoading: false,
      vpcParams: {
        page: 1,
        limit: 20,
        pageSizes: [20, 50, 100],
        total: 200,
        orderby: "id",
        sort: "desc",
        keywords: "",
      },
      isShowengine: false,
      engineID: "",
      curEngineId: "",
      engineSearchLoading: false,
      productOptions: [],
      productParams: {
        page: 1,
        limit: 20,
        keywords: "",
        status: "Active",
        orderby: "id",
        sort: "desc",
        data_center_id: "",
      },
      isShowAddVpc: false,
      ips: "",
      safeOptions: [],
      safeID: "",
      upData: {
        cpuName: "",
      },

      cpuName: "",
      memoryName: "",
      bwName: "",
      flowName: "",
      defenseName: "",
      calcIPList: [],
      memoryList: [],
      cpuList: [],
      memoryArr: [], // 范围时内存数组
      activeName1: "custom", // fast, custom
      memoryType: false,
      memoryTip: "",
      params: {
        // 配置参数
        data_center_id: "",
        cpu: "",
        memory: 1,
        image_id: 0,
        system_disk: {
          size: "",
          disk_type: "",
        },
        data_disk: [],
        backup_num: "",
        snap_num: "",
        line_id: "",
        bw: "",
        flow: "",
        peak_defence: "",
        ip_num: "",
        duration_id: "",
        network_type: "normal",
        // 提交购买
        name: "", // 主机名
        ssh_key_id: "",
        notes: "",
      },
      lineDetail: {
        ip: [],
        bw: [],
        flow: [],
        defence: []
      }, // 线路详情：bill_type, flow, bw, defence , ip
      // 流量包
      showPackage: false,
      packageLoading: false,
      packageList: [],
      ipDetails: {
        dedicate_ip: "",
        assign_ip: "",
        ip_num: 0,
      },
      allIp: [],
      cabinetType: {
        1: lang.mf_full,
        2: lang.mf_half,
        4: '1/4'
      },
      bwType: "",
      bwArr: [],
      submitLoading: false
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
    // 返回剩余到期时间
    formateDueDay(time) {
      return Math.floor((time * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
    },
    filterMoney(money) {
      if (isNaN(money) || money * 1 < 0) {
        return "0.00";
      } else {
        return formatNuberFiexd(money);
      }
    },
  },
  methods: {
    async getIpDetail() {
      try {
        const res = await getHostIpDetails(this.id);
        const temp = res.data.data;
        this.ipDetails = JSON.parse(JSON.stringify(res.data.data));
        this.allIp = (temp.dedicate_ip + "," + temp.assign_ip).split(",");
      } catch (error) {}
    },
    copyIp(ip) {
      if (typeof ip !== "string") {
        ip = ip.join(",");
      }
      const textarea = document.createElement("textarea");
      textarea.value = ip.replace(/,/g, "\n");
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      this.$message.success(lang.index_text32);
    },
    cancleDialog() {
      this.showPackage = false;
      this.isShowCashDialog = false;
    },

    async getLineDetails() {
      try {
        // 获取线路详情，
        const res = await getLineDetail({
          id: this.product_id,
          package_id: this.cloudData.package_id,
          scene: "upgrade"
        });
        this.lineDetail = res.data.data;
        // 默认选择带宽
        if (this.lineDetail.bw) {
          this.bwType = this.lineDetail.bw[0]?.type;
          if (this.cloudData?.bw !== 0) {
            // 初次回填
            this.params.bw = this.cloudData.bw === "NC" ? "NC" :
            (this.bwType === 'radio' ? this.cloudData.bw : this.cloudData.bw * 1);
          } else {
            this.params.bw =
              this.lineDetail.bw[0]?.value || this.lineDetail.bw[0]?.min_value;
          }
          if (this.params.bw === "NC") {
            // 判断
            const isNc = this.lineDetail.bw.filter(
              (item) => item.value === "NC"
            );
            if (isNc.length > 0 && isNc[0].value_show) {
              this.bwName = isNc[0].value_show;
            } else {
              this.bwName = lang.actual_bw;
            }
          } else {
            this.bwName = this.params.bw + "M";
          }
          // 循环生成带宽可选数组
          if (this.bwType !== 'radio') {
            let fArr = [];
            this.lineDetail.bw.forEach((item) => {
              fArr.push(...this.createArr([item.min_value, item.max_value]));
            });
            this.bwArr = fArr;
            this.bwTip = this.createTip(fArr);
            this.bwMarks = this.createMarks(this.bwArr);
            if (!this.bwArr.includes(this.params.bw * 1)) {
              this.params.bw = this.bwArr[0]
            }
          }
        }
        // 默认选择流量
        if (this.lineDetail.flow) {
          if (this.cloudData?.flow) {
            // 初次回填
            this.params.flow = this.cloudData.flow;
          } else {
            this.params.flow = this.lineDetail.flow[0]?.value;
          }
        }
        // 默认选择ip数量
        if (this.lineDetail.ip) {
          const temp_ip =
            this.cloudData.ip_num === "NC" ? "NC" : this.cloudData.ip_num;
          if (this.cloudData?.ip_num !== 0) {
            // 初次回填
            this.params.ip_num = temp_ip;
          } else {
            this.params.ip_num = this.lineDetail.ip[0]?.value || temp_ip;
          }
          this.ipName = this.lineDetail.ip.filter(
            (item) => item.value == this.params.ip_num
          )[0]?.desc;
          // 循环生成IP可选数组
          this.calcIPList = this.lineDetail.ip.map((item) => {
            return item;
          });
        }
        // 默认选择防御
        this.params.peak_defence = this.cloudData.peak_defence || '';
        this.getCycleList();
      } catch (error) {
        console.log("####", error);
      }
    },

    // 切换IP
    changeIp(e) {
      // 判读e是否为带NC
      const isNc = this.calcIPList.filter(
        (item) => item.desc === e && item.value === "NC"
      );
      if (isNc.length > 0) {
        this.params.ip_num = "NC";
      } else {
        let temp = e.replace(lang.mf_one, "") * 1;
        this.params.ip_num = this.calcIPList.filter((item) => {
          if (item.value !== "NC") {
            return (
              (item.value,
              item.value.split(",").reduce((all, cur) => {
                all += cur.split("_")[0] * 1;
                return all;
              }, 0)) === temp
            );
          }
        })[0]?.value;
      }
      setTimeout(() => {
        this.getCycleList();
      }, 0);
    },
    // 切换防御
    changeDefence(e) {
      if (e === lang.no_defense) {
        this.params.peak_defence = 0;
      } else {
        this.params.peak_defence = e.replace("G", "");
      }
      setTimeout(() => {
        this.getCycleList();
      }, 0);
    },
    changeBw(e) {
      // 判读e是否为带NC
      const isNc = this.lineDetail.bw.filter((item) => item.value_show === e);
      if (isNc.length > 0) {
        this.params.bw = "NC";
      } else {
        this.params.bw = e.replace("M", "");
      }
      // 计算价格
      setTimeout(() => {
        this.getCycleList();
      }, 0);
    },
    // 切换流量
    changeFlow(e) {
      if (e === lang.mf_tip28) {
        this.params.flow = 0;
      } else {
        this.params.flow = e.replace("G", "") * 1;
      }

      setTimeout(() => {
        this.getCycleList();
      }, 0);
    },

    createArr([m, n]) {
      // 生成数组
      let temp = [];
      for (let i = m; i <= n; i++) {
        temp.push(i);
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
    changeBwNum(num) {
      if (!this.bwArr.includes(num)) {
        this.bwArr.forEach((item, index) => {
          if (num > item && num < this.bwArr[index + 1]) {
            this.params.bw =
              num - item > this.bwArr[index + 1] - num
                ? this.bwArr[index + 1]
                : item;
          }
        });
      }
      this.getCycleList();
    },
    createMarks(data) {
      const obj = {
        0: "",
        // 25: '',
        // 50: '',
        // 75: '',
        100: "",
      };
      const range = data[data.length - 1] - data[0];
      obj[0] = `${data[0]}`;
      obj[100] = `${data[data.length - 1]}`;
      return obj;
    },

    // 获取通用配置
    getCommonData() {
      this.commonData = JSON.parse(localStorage.getItem("common_set_before"));
      document.title =
        this.commonData.website_name + "-" + lang.common_cloud_text43;
    },
    // 获取自动续费状态
    getRenewStatus() {
      const params = {
        id: this.id,
      };
      renewStatus(params).then((res) => {
        if (res.data.status === 200) {
          const status = res.data.data.status;
          this.isShowPayMsg = status == 1 ? true : false;
        }
      });
    },
    autoRenewChange() {
      this.isShowAutoRenew = true;
    },
    autoRenewDgClose() {
      this.isShowPayMsg = !this.isShowPayMsg;
      this.isShowAutoRenew = false;
    },
    doAutoRenew() {
      const params = {
        id: this.id,
        status: this.isShowPayMsg ? 1 : 0,
      };
      this.submitLoading = true;
      rennewAuto(params)
        .then((res) => {
          if (res.data.status === 200) {
            this.$message.success(lang.common_cloud_text44);
            this.isShowAutoRenew = false;
            this.getRenewStatus();
          }
        })
        .catch((error) => {
          this.$message.error(error.data.msg);
        }).finally(() => {
          this.submitLoading = false;
        })
    },
    // 获取产品详情
    getHostDetail() {
      const params = {
        id: this.id,
      };
      hostDetail(params).then((res) => {
        if (res.data.status === 200) {
          this.hostData = res.data.data.host;
          this.self_defined_field = res.data.data.self_defined_field.map(
            (item) => {
              item.hidenPass = false;
              return item;
            }
          );
          this.hostData.status_name =
            this.hostStatus[res.data.data.host.status].text;

          // 判断下次缴费时间是否在十天内
          if (
            (this.hostData.due_time * 1000 - new Date().getTime()) /
              (24 * 60 * 60 * 1000) <=
            10
          ) {
            this.isRead = true;
          }
          this.product_id = this.hostData.product_id;
          this.getCloudDetail();
          // 获取镜像数据
          this.getConfigData();
          // 获取其它配置
        }
      });
    },
    // 获取实例详情
    getCloudDetail() {
      const params = {
        id: this.id,
      };
      cloudDetail(params).then((res) => {
        if (res.data.status === 200) {
          this.cloudData = res.data.data;
         // this.productParams.data_center_id = res.data.data.data_center.id;
          this.$emit("getclouddetail", this.cloudData);
          setTimeout(() => {
            this.initLoading = false;
          }, 300);
        }
      });
    },
    // 关闭备注弹窗
    notesDgClose() {
      this.isShowNotesDialog = false;
    },
    // 显示 修改备注 弹窗
    doEditNotes() {
      this.isShowNotesDialog = true;
      this.notesValue = this.hostData.notes;
    },
    // 修改备注提交
    subNotes() {
      const params = {
        id: this.id,
        notes: this.notesValue,
      };
      this.submitLoading = true;
      editNotes(params)
        .then((res) => {
          if (res.data.status === 200) {
            // 重新拉取产品详情
            this.getHostDetail();
            this.$message({
              message: lang.appstore_text359,
              type: "success",
            });
            this.isShowNotesDialog = false;
          }
        })
        .catch((err) => {
          this.$message.error(err.data.msg);
        }).finally(() => {
          this.submitLoading = false;
        })
    },
    // 返回产品列表页
    goBack() {
      window.history.back();
    },
    // 获取产品停用信息
    getRefundMsg() {
      const params = {
        id: this.id,
      };
      refundMsg(params)
        .then((res) => {
          if (res.data.status === 200) {
            this.refundData = res.data.data.refund;
          }
        })
        .catch((err) => {
          this.refundData = null;
        });
    },
    // 支付成功回调
    paySuccess(e) {
      if (e == this.renewOrderId) {
        // 刷新实例详情
        this.getHostDetail();
        return true;
      }
      if (e == this.diskOrderId) {
        // this.doGetDiskList()
      }
      if (e == this.bsOrderId) {
        this.getConfigData();
        this.getCloudDetail();
      }
      this.getCloudDetail();
      // this.doGetDiskList()
      this.getHostDetail();
      this.getConfigData();
      this.getIpDetail();
    },
    // 取消支付回调
    payCancel(e) {
      console.log(e);
    },
    // 获取优惠码信息
    getPromoCode() {
      const params = {
        id: this.id,
      };
      promoCode(params).then((res) => {
        if (res.data.status === 200) {
          let codes = res.data.data.promo_code;
          let code = "";
          codes.map((item) => {
            code += item + ",";
          });
          code = code.slice(0, -1);
          this.codeString = code;
        }
      });
    },
    // 升降级使用优惠码
    getUpDiscount(data) {
      this.upParams.customfield.promo_code = data[1];
      this.upParams.isUseDiscountCode = true;
      this.upParams.code_discount = Number(data[0]);
      this.getCycleList();
    },
    // 移除升降级优惠码
    removeUpDiscountCode(falg = true) {
      this.upParams.isUseDiscountCode = false;
      this.upParams.customfield.promo_code = "";
      this.upParams.code_discount = 0;
      if (falg) {
        this.getCycleList();
      }
    },
    // 升降级使用代金券
    upUseCash(val) {
      this.cashObj = val;
      const price = val.price ? Number(val.price) : 0;
      this.upParams.cash_discount = price;
      this.upParams.customfield.voucher_get_id = val.id;
      this.getCycleList();
    },

    // 升降级移除代金券
    upRemoveCashCode() {
      this.$refs.cashRef.closePopver();
      this.cashObj = {};
      this.upParams.cash_discount = 0;
      this.upParams.customfield.voucher_get_id = "";
      this.upParams.totalPrice =
        (this.upParams.original_price * 1000 -
          this.upParams.clDiscount * 1000 -
          this.upParams.cash_discount * 1000 -
          this.upParams.code_discount * 1000) /
          1000 >
        0
          ? (
              (this.upParams.original_price * 1000 -
                this.upParams.cash_discount * 1000 -
                this.upParams.clDiscount * 1000 -
                this.upParams.code_discount * 1000) /
              1000
            ).toFixed(2)
          : 0;
    },

    // 续费使用代金券
    reUseCash(val) {
      this.cashObj = val;
      const price = val.price ? Number(val.price) : 0;
      this.renewParams.cash_discount = price;
      this.renewParams.customfield.voucher_get_id = val.id;
    },
    // 续费移除代金券
    reRemoveCashCode() {
      this.$refs.cashRef.closePopver();
      this.cashObj = {};
      this.renewParams.cash_discount = 0;
      this.renewParams.customfield.voucher_get_id = "";
    },
    // 续费使用优惠码
    async getRenewDiscount(data) {
      this.renewParams.customfield.promo_code = data[1];
      this.renewParams.isUseDiscountCode = true;
      this.renewParams.code_discount = Number(data[0]);
      const price = this.renewParams.base_price;
      const discountParams = { id: this.product_id, amount: price };
      // 开启了等级折扣插件
      if (this.isShowLevel) {
        // 获取等级抵扣价格
        await clientLevelAmount(discountParams)
          .then((res2) => {
            if (res2.data.status === 200) {
              this.renewParams.clDiscount = Number(res2.data.data.discount); // 客户等级优惠金额
            }
          })
          .catch((error) => {
            this.renewParams.clDiscount = 0;
          });
      }
    },
    // 移除续费的优惠码
    removeRenewDiscountCode() {
      this.renewParams.isUseDiscountCode = false;
      this.renewParams.customfield.promo_code = "";
      this.renewParams.code_discount = 0;
      this.renewParams.clDiscount = 0;
      const price = this.renewParams.original_price;
    },

    // 显示续费弹窗
    showRenew() {
      if (this.renewBtnLoading) return;
      this.renewBtnLoading = true;
      // 获取续费页面信息
      const params = {
        id: this.id,
      };
      this.isShowRenew = true;
      this.renewLoading = true;
      renewPage(params)
        .then(async (res) => {
          if (res.data.status === 200) {
            this.renewBtnLoading = false;
            this.renewPageData = res.data.data.host;
            this.renewActiveId = this.renewPageData[0].id;
            this.renewParams.billing_cycle =
              this.renewPageData[0].billing_cycle;
            this.renewParams.duration = this.renewPageData[0].duration;
            this.renewParams.original_price = this.renewPageData[0].price;
            this.renewParams.base_price = this.renewPageData[0].base_price;
          }
          this.renewLoading = false;
        })
        .catch((err) => {
          this.renewBtnLoading = false;
          this.renewLoading = false;
          this.$message.error(err.data.msg);
        });
    },
    getRenewPrice() {
      renewPage({ id: this.id })
        .then(async (res) => {
          if (res.data.status === 200) {
            this.renewPriceList = res.data.data.host;
          }
        })
        .catch((err) => {
          this.renewPriceList = [];
        });
    },
    // 续费弹窗关闭
    renewDgClose() {
      this.isShowRenew = false;
      this.removeRenewDiscountCode();
      this.reRemoveCashCode();
    },
    // 续费提交
    subRenew() {
      const params = {
        id: this.id,
        billing_cycle: this.renewParams.billing_cycle,
        customfield: this.renewParams.customfield,
      };
      this.submitLoading = true;
      renew(params)
        .then((res) => {
          if (res.data.status === 200) {
            if (res.data.code == "Paid") {
              this.$message.success(res.data.msg);
              this.getHostDetail();
            } else {
              this.isShowRenew = false;
              this.renewOrderId = res.data.data.id;
              const orderId = res.data.data.id;
              const amount = this.renewParams.totalPrice;
              this.$refs.topPayDialog.showPayDialog(orderId, amount);
            }
          }
        })
        .catch((err) => {
          this.$message.error(err.data.msg);
        }).finally(() => {
          this.submitLoading = false;
        })
    },
    // 续费周期点击
    async renewItemChange(item) {
      this.reRemoveCashCode();
      this.renewLoading = true;
      this.renewActiveId = item.id;
      this.renewParams.duration = item.duration;
      this.renewParams.billing_cycle = item.billing_cycle;
      let price = item.price;
      this.renewParams.original_price = item.price;
      this.renewParams.base_price = item.base_price;

      // 开启了优惠码插件
      if (this.isShowPromo && this.renewParams.isUseDiscountCode) {
        const discountParams = { id: this.product_id, amount: item.base_price };
        // 开启了等级折扣插件
        if (this.isShowLevel) {
          // 获取等级抵扣价格
          await clientLevelAmount(discountParams)
            .then((res2) => {
              if (res2.data.status === 200) {
                this.renewParams.clDiscount = Number(res2.data.data.discount); // 客户等级优惠金额
              }
            })
            .catch((error) => {
              this.renewParams.clDiscount = 0;
            });
        }
        // 更新优惠码
        await applyPromoCode({
          // 开启了优惠券
          scene: "renew",
          product_id: this.product_id,
          amount: item.base_price,
          billing_cycle_time: this.renewParams.duration,
          promo_code: this.renewParams.customfield.promo_code,
        })
          .then((resss) => {
            price = item.base_price;
            this.renewParams.isUseDiscountCode = true;
            this.renewParams.code_discount = Number(resss.data.data.discount);
          })
          .catch((err) => {
            this.$message.error(err.data.msg);
            this.removeRenewDiscountCode();
          });
      }
      this.renewLoading = false;
    },
    // 升降级点击
    showUpgrade() {
      this.getLineDetails();
      this.isShowUpgrade = true;
      this.$message({
        showClose: true,
        message: lang.common_cloud_text54,
        type: "warning",
        duration: 10000,
      });
    },
    goPay() {
      if (this.hostData.status === "Unpaid") {
        this.$refs.topPayDialog.showPayDialog(this.hostData.order_id);
      }
    },
    // 关闭升降级弹窗
    upgradeDgClose() {
      this.isShowUpgrade = false;
      this.removeUpDiscountCode(false);
      this.reRemoveCashCode();
    },
    // 获取升降级价格
    getCycleList() {
      this.upgradePriceLoading = true;
      let params = new URLSearchParams();
      const obj = {
        id: this.id,
        bw: this.params.bw,
        ip_num: this.params.ip_num,
        flow: this.params.flow,
        peak_defence: this.params.peak_defence,
      };
      Object.entries(obj).forEach(([key, value]) => {
        params.append(key, value);
      });
      upgradePackagePrice(this.id, params)
        .then(async (res) => {
          if (res.data.status == 200) {
            let price = res.data.data.price; // 当前产品的价格
            if (price < 0) {
              this.upParams.original_price = 0;
              this.upParams.totalPrice = 0;
              this.upgradePriceLoading = false;
              return;
            }
            this.upParams.original_price =
              price * 1 + res.data.data.discount * 1;
            this.upParams.totalPrice = price + res.data.data.discount * 1;
            // 开启了等级优惠
            if (this.isShowLevel) {
              await clientLevelAmount({ id: this.product_id, amount: price })
                .then((ress) => {
                  this.upParams.clDiscount = Number(ress.data.data.discount);
                })
                .catch(() => {
                  this.upParams.clDiscount = 0;
                });
            }
           // this.upParams.clDiscount = res.data.data.discount * 1;
            // 开启了优惠码插件
            if (this.isShowPromo) {
              // 更新优惠码
              await applyPromoCode({
                // 开启了优惠券
                scene: "upgrade",
                product_id: this.product_id,
                amount: this.upParams.original_price,
                billing_cycle_time: this.hostData.billing_cycle_time,
                promo_code: this.upParams.customfield.promo_code,
                host_id: this.id,
              })
                .then((resss) => {
                  this.upParams.isUseDiscountCode = true;
                  this.upParams.code_discount = Number(
                    resss.data.data.discount
                  );
                })
                .catch((err) => {
                  this.upParams.isUseDiscountCode = false;
                  this.upParams.customfield.promo_code = "";
                  this.upParams.code_discount = 0;
                  this.$message.error(err.data.msg);
                });
            }
            this.upParams.totalPrice =
              (this.upParams.original_price * 1000 -
                this.upParams.clDiscount * 1000 -
                this.upParams.cash_discount * 1000 -
                this.upParams.code_discount * 1000) /
                1000 >
              0
                ? (
                    (this.upParams.original_price * 1000 -
                      this.upParams.cash_discount * 1000 -
                      this.upParams.clDiscount * 1000 -
                      this.upParams.code_discount * 1000) /
                    1000
                  ).toFixed(2)
                : 0;
            this.upgradePriceLoading = false;
            // this.upParams.totalPrice = this.upParams.totalPrice * 1 + res.data.data.discount * 1
          } else {
            this.upParams.original_price = 0;
            this.upParams.clDiscount = 0;
            this.upParams.isUseDiscountCode = false;
            this.upParams.customfield.promo_code = "";
            this.upParams.code_discount = 0;
            this.upParams.totalPrice = 0;
            this.upgradePriceLoading = false;
          }
        })
        .catch((error) => {
          this.upParams.original_price = 0;
          this.upParams.clDiscount = 0;
          this.upParams.isUseDiscountCode = false;
          this.upParams.customfield.promo_code = "";
          this.upParams.code_discount = 0;
          this.upParams.totalPrice = 0;
          this.upgradePriceLoading = false;
        });
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
    // 升降级提交
    upgradeSub() {
      const params = {
        id: this.id,
        bw: this.params.bw,
        ip_num: this.params.ip_num,
        flow: this.params.flow,
        peak_defence: this.params.peak_defence,
        customfield: this.upParams.customfield,
      };
      this.loading4 = true;
      upgradeOrder(params)
        .then((res) => {
          if (res.data.status === 200) {
            this.$message.success(lang.common_cloud_text56);
            this.isShowUpgrade = false;
            const orderId = res.data.data.id;
            // 调支付弹窗
            this.$refs.topPayDialog.showPayDialog(orderId, 0);
          } else {
            this.$message.error(err.data.msg);
          }
        })
        .catch((err) => {
          this.$message.error(err.data.msg);
        }).finally (() => {
          this.loading4 = false;
        })
    },
    // 升降级弹窗 套餐选择框变化
    upgradeSelectChange(e) {
      this.upgradeList.map((item) => {
        if (item.id == e) {
          // 获取当前套餐的周期
          let duration = this.cloudData.duration;
          // 该周期新套餐的价格
          let money = item[duration];

          switch (duration) {
            case "month_fee":
              duration = lang.appstore_text54;
              break;
            case "quarter_fee":
              duration = lang.appstore_text55;
              break;
            case "year_fee":
              duration = lang.appstore_text57;
              break;
            case "two_year":
              duration = lang.biennially;
              break;
            case "three_year":
              duration = lang.triennially;
              break;
            case "onetime_fee":
              duration = lang.onetime;
              break;
          }
          this.changeUpgradeData = {
            id: item.id,
            money,
            duration,
            description: item.description,
          };
        }
      });
      this.reRemoveCashCode();
      this.getCycleList();
    },

    // 取消停用
    quitRefund() {
      const params = {
        id: this.refundData.id,
      };
      cancel(params)
        .then((res) => {
          if (res.data.status == 200) {
            this.$message.success(lang.common_cloud_text57);
            this.getRefundMsg();
          }
        })
        .catch((err) => {
          this.$message.error(err.data.msg);
        });
    },
    // 关闭停用
    refundDgClose() {},
    // 删除实例点击
    showRefund() {
      const params = {
        host_id: this.id,
      };
      // 获取停用页面信息
      this.refundParams.suspend_reason = null;
      this.refundParams.type = "Expire";
      refundPage(params).then((res) => {
        if (res.data.status == 200) {
          this.refundPageData = res.data.data;
          this.isShowRefund = true;
        }
      });
    },
    // 关闭停用弹窗
    refundDgClose() {
      this.isShowRefund = false;
    },
    // 停用弹窗提交
    subRefund() {
      const params = {
        host_id: this.id,
        suspend_reason: this.refundParams.suspend_reason,
        type: this.refundParams.type,
      };
      if (!params.suspend_reason) {
        this.$message.error(lang.common_cloud_text58);
        return false;
      }
      if (!params.type) {
        this.$message.error(lang.common_cloud_text59);
        return false;
      }
      this.submitLoading = true;
      refund(params)
        .then((res) => {
          if (res.data.status == 200) {
            this.$message.success(lang.common_cloud_text60);
            this.isShowRefund = false;
            this.getRefundMsg();
          }
        })
        .catch((err) => {
          this.$message.error(err.data.msg);
        }).finally(() => {
          this.submitLoading = false;
        })
    },

    // 获取其他配置
    getConfigData() {
      const params = {
        id: this.product_id,
      };
      getOrderConfig(params).then((res) => {
        if (res.data.status === 200) {
          this.configData = res.data.data;
          this.systemDiskList = res.data.data.system_disk || [];
          this.dataDiskList = res.data.data.data_disk || [];
          this.memoryList = res.data.data.memory || [];
          this.cpuList = res.data.data.cpu || [];
          this.configLimitList = res.data.data.config_limit || [];
          this.configObj = res.data.data.config || {};
          this.backup_config = res.data.data.backup_config || [];
          this.snap_config = res.data.data.snap_config || [];
          if (
            res.data.data.memory &&
            res.data.data.memory.length > 0 &&
            res.data.data.memory[0].type !== "radio"
          ) {
            // 范围的时候生成默认范围数组
            this.memoryArr = res.data.data.memory.reduce((all, cur) => {
              all.push(...this.createArr([cur.min_value, cur.max_value]));
              return all;
            }, []);
          }
          if (this.memoryList.length > 0) {
            if (this.memoryList[0].type === "radio") {
              this.memoryType = true;
            } else {
              this.memoryType = false;
            }
          }
        }
      });
    },

  },
}).$mount(template);

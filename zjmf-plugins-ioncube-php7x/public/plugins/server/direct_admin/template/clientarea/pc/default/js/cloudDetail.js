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
    safeConfirm,
  },
  created() {
    // 获取产品id
    this.id = location.href.split("?")[1].split("=")[1];
    // 获取通用信息
    this.getCommonData();
    // 获取产品详情
    this.getHostDetail();
    // 获取实例详情
    this.getCloudDetail();
  },
  mixins: [mixin],
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
    calcProtocol() {
      return (protocol) => {
        return this.protocolArr.filter((item) => item.value === protocol)[0]
          ?.label;
      };
    },
    calcNat() {
      if (this.cloudData.nat_acl_limit && this.cloudData.nat_web_limit) {
        return `${lang.nat_acl}${lang.nat_web}`;
      } else if (
        this.cloudData.nat_acl_limit &&
        !this.cloudData.nat_web_limit
      ) {
        return lang.nat_acl;
      } else {
        return lang.nat_web;
      }
    },
    vpcIps() {
      if (
        this.vpc_ips.vpc2 !== undefined &&
        this.vpc_ips.vpc3 !== undefined &&
        this.vpc_ips.vpc4 !== undefined
      ) {
        const str =
          this.vpc_ips.vpc1.value +
          "." +
          this.vpc_ips.vpc2 +
          "." +
          this.vpc_ips.vpc3 +
          "." +
          this.vpc_ips.vpc4 +
          "/" +
          this.vpc_ips.vpc6.value;
        return str;
      } else {
        return "";
      }
    },
    calcCpu() {
      return this.params.cpu + lang.mf_cores;
    },
    calcCpuList() {
      // 根据区域来判断计算可选cpu数据
      if (this.activeName1 === "fast") {
        return;
      }
      const temp =
        this.configLimitList.filter(
          (item) =>
            item.type === "data_center" &&
            this.params.data_center_id === item.data_center_id
        ) || [];
      const cpu = temp.reduce((all, cur) => {
        all.push(...cur.cpu.split(","));
        return all;
      }, []);
      return this.cpuList.filter((item) => !cpu.includes(String(item.value)));
    },
    calaMemoryList() {
      // 计算可选内存，根据 cpu + 区域
      if (this.activeName1 === "fast") {
        return;
      }
      const temp = this.configLimitList.filter((item) =>
        item.cpu.split(",").includes(String(this.params.cpu))
      );
      if (temp.length === 0) {
        // 没有匹配到限制条件
        if (this.memoryList[0]?.type === "radio") {
          return this.memoryList;
        } else {
          this.memoryTip = this.createTip(this.memoryArr);
          this.memMarks = this.createMarks(this.memoryArr); // data 原数据，目标marks
          return this.memoryArr;
        }
      }
      // 分两种情况，单选和范围，单选：memory 范围，min_memory，max_memory
      if (temp[0].memory) {
        const memory = Array.from(
          new Set(
            temp.reduce((all, cur) => {
              all.push(...cur.memory.split(","));
              return all;
            }, [])
          )
        );
        const filMem = this.memoryList.filter(
          (item) => !memory.includes(String(item.value))
        );
        return filMem;
      } else {
        // 范围
        let fArr = [];
        temp.forEach((item) => {
          fArr.push(...this.createArr([item.min_memory, item.max_memory]));
        });
        fArr = Array.from(new Set(fArr));
        const filterArr = this.memoryArr.filter((item) => !fArr.includes(item));
        this.memoryTip = this.createTip(filterArr);
        this.memMarks = this.createMarks(filterArr); // data 原数据，目标marks
        return filterArr.filter((item) => !fArr.includes(item));
      }
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
    // 获取订购页磁盘的价格/扩容页磁盘的价格
    moreDiskData: {
      handler(newValue, oldValue) {
        if (this.isOrderOrExpan) {
          // 获取订购磁盘 总价格
          this.getOrderDiskPrice();
        } else {
          // 获取扩容磁盘弹窗 总价格
        }
      },
      deep: true,
    },
    oldDiskList: {
      handler(newValue, oldValue) {
        if (this.isOrderOrExpan) {
          // 获取订购磁盘 总价格
          this.getOrderDiskPrice();
        } else {
          // 获取扩容磁盘弹窗 总价格
          this.getExpanDiskPrice();
        }
      },
      deep: true,
    },
    vpcIps: {
      handler(newVal) {
        this.ips = newVal;
      },
      immediate: true,
      deep: true,
    },
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

    // bsData: {
    //     handler(newValue, oldValue) {
    //         // 开启备份/快照的价格
    //         this.getBsPrice()
    //     },
    //     deep: true
    // }
  },
  data() {
    return {
      client_operate_password: "",
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
      },
      // 是否显示支付信息
      isShowPayMsg: false,
      imgBaseUrl: "",
      // 是否显示添加备注弹窗
      isShowNotesDialog: false,
      // 备份输入框内容
      notesValue: "",
      // 显示重装系统弹窗
      isShowReinstallDialog: false,
      // 重装系统弹窗内容
      reinstallData: {
        image_id: null,
        password: null,
        ssh_key_id: null,
        port: null,
        osGroupId: null,
        osId: null,
        code: "",
        type: "pass",
      },
      // 镜像数据
      osData: [],
      // 镜像版本选择框数据
      osSelectData: [],
      // 镜像图片地址
      osIcon: "",
      // Shhkey列表
      sshKeyData: [],
      // 错误提示信息
      errText: "",
      // 镜像是否需要付费
      isPayImg: false,
      payMoney: 0,
      // 镜像优惠价格
      payDiscount: 0,
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

      // 管理开始
      // 开关机状态
      powerStatus: "on",
      powerList: [
        {
          id: 1,
          label: lang.common_cloud_text10,
          value: "on",
        },
        {
          id: 2,
          label: lang.common_cloud_text11,
          value: "off",
        },
        {
          id: 3,
          label: lang.common_cloud_text13,
          value: "rebot",
        },
        {
          id: 4,
          label: lang.common_cloud_text41,
          value: "hardRebot",
        },
        {
          id: 5,
          label: lang.common_cloud_text42,
          value: "hardOff",
        },
      ],
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

      // 备份与快照开始
      dataList1: [],
      // 备份列表数据
      dataList1: [],
      // 快照列表数据
      dataList2: [],
      backLoading: false,
      snapLoading: false,
      params1: {
        page: 1,
        limit: 20,
        pageSizes: [20, 50, 100],
        total: 200,
        orderby: "id",
        sort: "desc",
        keywords: "",
      },
      params2: {
        page: 1,
        limit: 20,
        pageSizes: [20, 50, 100],
        total: 200,
        orderby: "id",
        sort: "desc",
        keywords: "",
      },
      // true 标记为备份  false 标记为快照
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
      bsData: {
        id: 0,
        type: "",
        backNum: 0,
        snapNum: 0,
        money: 0,
        moneyDiscount: 0,
        codePrice: 0,
        duration: lang.common_cloud_text110,
      },
      // 是否显示开启备份弹窗
      isShowOpenBs: false,
      // 快照备份订单id
      bsOrderId: 0,
      chartSelectValue: "1",
      // 统计图表开始
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
      plan_way: 0,
      vpc_ips: {
        vpc1: {
          tips: lang.range1,
          value: 10,
          select: [10, 172, 192],
        },
        vpc2: 0,
        vpc3: 0,
        vpc3Tips: "",
        vpc4: 0,
        vpc4Tips: "",
        vpc6: {
          value: 16,
          select: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
        },
        min: 0,
        max: 255,
      },
      vpcName: "",
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
        /* 安全组 */
        security_group_id: "",
        security_group_protocol: [],
        password: "",
        re_password: "",
        vpc: {
          // 新建-系统分配的时候都不传
          id: "", // 选择已有的vc
          ips: "", // 自定义的时候
        },
        notes: "",
      },
      lineDetail: {}, // 线路详情：bill_type, flow, bw, defence , ip
      memory_unit: "",
      // 流量包
      showPackage: false,
      packageLoading: false,
      packageList: [],
      curPackageId: "",
      /* 转发建站 */
      aclLoading: false,
      webLoading: false,
      aclList: [],
      webList: [],
      protocolArr: [
        { value: 1, label: "TCP" },
        { value: 2, label: "UDP" },
        { value: 3, label: "TCP+UDP" },
      ],
      natDialog: false,
      natType: "", // acl, web
      natForm: {
        name: "",
        int_port: undefined,
        protocol: "",
        domain: "",
      },
      submitLoaing: false,
      natRules: {
        name: [
          {
            required: true,
            message: `${lang.placeholder_pre1}${lang.security_label1}`,
            trigger: "blur",
          },
        ],
        domain: [
          {
            required: true,
            message: `${lang.placeholder_pre1}${lang.domain}`,
            trigger: "blur",
          },
        ],
        int_port: [
          {
            required: true,
            message: `${lang.placeholder_pre1}${lang.int_port}`,
            trigger: "blur",
          },
        ],
        protocol: [
          {
            required: true,
            message: `${lang.placeholder_pre2}${lang.protocol}`,
            trigger: "change",
          },
        ],
      },
      urlLoading: false,
      domain_url: "",
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
    hadelSafeConfirm(val) {
      this[val]();
    },
    async getUrl() {
      try {
        this.urlLoading = true;
        const res = await jumpDa({ id: this.id });
        window.open(res.data.data.loginURL);
        this.urlLoading = false;
      } catch (error) {
        this.urlLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    goDomain() {
      window.open(this.domain_url);
    },
    cancleDialog() {
      this.showPackage = false;
      this.isShowCashDialog = false;
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
        });
    },
    // 获取产品详情
    getHostDetail() {
      const params = {
        id: this.id,
      };
      hostDetail(params).then((res) => {
        if (res.data.status === 200) {
          this.hostData = res.data.data.host;
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
          this.resourceLoading = true;
          this.cloudData = res.data.data.detail;
          // this.productParams.data_center_id = res.data.data.data_center.id;
          // this.cloudConfig = res.data.data.config;
          // this.connected_resource = [];
          // if (this.cloudData.rel_host.id) {
          //   this.connected_resource.push(this.cloudData.rel_host);
          // }
          // this.association_resource = this.cloudData.active_host;
          this.$emit("getclouddetail", this.cloudData);
          this.domain_url = this.cloudData.domain_url;
          const length =
            this.cloudData.password.length >= 6
              ? 6
              : this.cloudData.password.length;
          for (let i = 0; i < length; i++) {
            this.passHidenCode += "*";
          }
          this.resourceLoading = false;
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
        });
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
        this.doGetDiskList();
      }
      if (e == this.bsOrderId) {
        this.getConfigData();
        this.getBackupList();
        this.getSnapshotList();
        this.getCloudDetail();
      }
      this.getIpList();
      this.getCloudDetail();
      this.doGetDiskList();
      this.getConfigData();
      this.getHostDetail();
      // 重新检查当前选择镜像是否购买
      this.doCheckImage();

      // 刷新流量
      if (this.activeName === "4") {
        this.doGetFlow();
      }
    },
    // 取消支付回调
    payCancel(e) {
      // console.log(e);
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
    eventChange(evetObj) {
      this.eventData.id = evetObj.id || "";
      this.eventData.discount = evetObj.discount || 0;
      this.promo.event_promotion = this.eventData.id;
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
            if (this.renewPageData.length === 0) {
              this.renewLoading = false;
              return;
            }
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
          console.log("err", err);
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
        });
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

    // 取消停用
    quitRefund() {
      if (!this.client_operate_password) {
        this.$refs.safeRef.openDialog("quitRefund");
        return;
      }
      const client_operate_password = this.client_operate_password;
      this.client_operate_password = "";
      const params = {
        id: this.refundData.id,
        client_operate_password,
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
      // refundMsg(params).then(res => {
      //     if (res.data.status === 200) {
      //         console.log(res);
      //     }
      // })
      // 获取停用页面信息
      refundPage(params).then((res) => {
        if (res.data.status == 200) {
          this.refundPageData = res.data.data;
          // if (this.refundPageData.allow_refund === 0) {
          //     this.$message.warning("不支持退款")
          // } else {
          //     this.isShowRefund = true
          // }
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
      if (!this.client_operate_password) {
        this.$refs.safeRef.openDialog("subRefund");
        return;
      }
      params.client_operate_password = this.client_operate_password;
      this.client_operate_password = "";
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
        });
    },

    // 获取其他配置
    getConfigData() {
      const params = {
        id: this.product_id,
      };
      getOrderConfig(params).then((res) => {
        if (res.data.status === 200) {
          this.configData = res.data.data;
        }
      });
    },
    // 关闭订购页面弹窗
    dgClose() {
      this.isShowDg = false;
    },
    goPay() {
      if (this.hostData.status === "Unpaid") {
        this.$refs.topPayDialog.showPayDialog(this.hostData.order_id);
      }
    },
    copyPass(text) {
      if (navigator.clipboard && window.isSecureContext) {
        // navigator clipboard 向剪贴板写文本
        this.$message.success(lang.index_text32);
        return navigator.clipboard.writeText(text);
      } else {
        // 创建text area
        const textArea = document.createElement("textarea");
        textArea.value = text;
        // 使text area不在viewport，同时设置不可见
        document.body.appendChild(textArea);
        // textArea.focus()
        textArea.select();
        this.$message.success(lang.index_text32);
        return new Promise((res, rej) => {
          // 执行复制命令并移除文本框
          document.execCommand("copy") ? res() : rej();
          textArea.remove();
        });
      }
    },
  },
}).$mount(template);

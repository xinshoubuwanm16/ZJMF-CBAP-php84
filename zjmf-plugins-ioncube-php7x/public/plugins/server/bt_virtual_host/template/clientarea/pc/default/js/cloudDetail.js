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
    this.getFtp();
    this.getDomain();
    this.getSite();
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
    window.addEventListener("resize", this.updateContainer, false);
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
    calcBatchPre() {
      if (this.checkRedirect.length > 0) {
        return `${lang.placeholder_pre2}${lang.batch_opt}（${lang.checked}${this.checkRedirect.length}）`;
      } else {
        this.batchType = "";
        return `${lang.placeholder_pre2}${lang.batch_opt}`;
      }
    },
    formateUnit() {
      return (bytes, type) => {
        if (type === "capacity" && bytes == 0) {
          return lang.not_limit;
        }
        if (bytes < 1024) {
          return bytes + " B";
        } else if (bytes < 1024 * 1024) {
          return (bytes / 1024).toFixed(2) + " KB";
        } else if (bytes < 1024 * 1024 * 1024) {
          return (bytes / (1024 * 1024)).toFixed(2) + " MB";
        } else if (bytes < 1024 * 1024 * 1024 * 1024) {
          return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
        } else {
          return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2) + " TB";
        }
      };
    },
    calcDomain() {
      return this.domainList;
    },
    calcTotal() {
      return (data) => {
        if (!data) {
          return 0;
        }
        return Object.values(data).reduce((all, cur) => {
          all += cur;
          return all;
        }, 0);
      };
    },
    calcX() {
      return (data) => {
        if (!data) {
          return "";
        }
        return Object.values(data).reduce((all, cur) => {
          all += cur;
          return all;
        }, 0);
      };
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
    const validatUrl = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(`${lang.placeholder_pre1}URL${lang.account_label5}`)
        );
      } else {
        const val = value.split("/");
        if (
          /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/.test(
            val
          )
        ) {
          callback();
        } else {
          callback(
            new Error(
              `${lang.placeholder_pre1}${lang.security_tip8}URL${lang.account_label5}`
            )
          );
        }
      }
    };
    return {
      addonsArr: [],
      initLoading: true,
      commonData: {
        currency_prefix: "",
        currency_suffix: "",
      },
      client_operate_password: "",
      activeName: "host", // host site data log
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

      // 续费参数
      isShowAutoRenew: false,
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

      // 日志开始
      logDataList: [],
      logParams: {
        page: 1,
        limit: 20,
        pageSizes: [20, 50, 100],
        total: 0,
        orderby: "id",
        sort: "desc",
        keywords: "",
      },
      logLoading: false,
      /* 基础信息 */
      ftpInfo: {
        quota: {},
      },
      passwordDialog: false,
      comForm: {
        password: "",
        type: 1,
        holdpath: 1,
        redirecttype: "301",
        domainorpath: "domain",
        redirectpath: "",
        redirectdomain: [],
        tourl: "http://",
        // ssl
        key: "",
        csr: "",
        domains: [],
        // chain
        domain: "",
        fix: "",
        return_rule: "",
        status: false,
        http_status: false,
        // auth
        access: "",
      },
      errorType: "/",
      comRules: {
        password: [
          {
            required: true,
            message: `${lang.placeholder_pre1}${lang.login_pass}`,
            trigger: "blur",
          },
        ],
        tourl: [{ validator: validatUrl, trigger: "blur" }],
        redirectpath: [{ validator: validatUrl, trigger: "blur" }],
        redirectdomain: [
          {
            required: true,
            message: `${lang.placeholder_pre2}${lang.redirect_domain}`,
            trigger: "blur",
          },
        ],
        key: [
          {
            required: true,
            message: `${lang.placeholder_pre1}${lang.secret_key}`,
            trigger: "blur",
          },
        ],
        csr: [
          {
            required: true,
            message: `${lang.placeholder_pre1}${lang.certificate_pem}`,
            trigger: "blur",
          },
        ],
        access: [
          {
            required: true,
            message: `${lang.placeholder_pre1}IP`,
            trigger: "blur",
          },
        ],
        tb_name: [
          {
            required: true,
            message: `${lang.choose_table}`,
            trigger: "blur",
          },
        ],
        where1: [
          {
            required: true,
            message: `${lang.placeholder_pre1}`,
            trigger: "blur",
          },
        ],
        hour: [
          {
            required: true,
            message: `${lang.placeholder_pre1}`,
            trigger: "blur",
          },
        ],
        minute: [
          {
            required: true,
            message: `${lang.placeholder_pre1}`,
            trigger: "blur",
          },
        ],
      },
      optType: "",
      passHidenCode: "",
      isShowPass: false,
      domainList: [],
      multipleSelection: [],
      baseDialog: false,
      baseActiveName: "resistant",
      baseFunc: [
        {
          tag: "domain",
          name: lang.bind_domain,
          url: "site_01",
        },
        // {
        //   tag: "home",
        //   name: lang.default_home_setting,
        //   url: "site_02",
        // },
        {
          tag: "host",
          name: lang.host_status_setting,
          url: "site_03",
        },
        {
          tag: "rewrite",
          name: lang.rewrite_setting,
          url: "site_04",
        },
        {
          tag: "php",
          name: lang.php_version_setting,
          url: "site_05",
        },
        {
          tag: "subdirectory",
          name: lang.subdirectory_page,
          url: "site_06",
        },
        {
          tag: "redirect",
          name: lang.redirect,
          url: "site_07",
        },
        {
          tag: "run_directory",
          name: lang.run_directory_setting,
          url: "site_08",
        },
        {
          tag: "monitoring",
          name: lang.monitoring_report,
          url: "site_09",
        },
      ],
      safeFunc: [
        {
          tag: "certificate",
          name: lang.import_certificate,
          url: "site_10",
        },
        {
          tag: "ftp",
          name: lang.ftp_manage,
          url: "site_11",
        },
        {
          tag: "chain",
          name: lang.Anti_theft_chain,
          url: "site_12",
        },
        {
          tag: "resistant",
          name: lang.tamper_resistant,
          url: "site_13",
        },
      ],
      isShowDel: false,
      delId: "",
      delType: "",
      delTile: "",
      delDes: "",
      delLoading: false,
      siteInfo: {},
      tableLoading: false,
      /* domain */
      domainText: "",
      submitLoading: false,
      isBatch: false,
      curDomain: "",
      rewriteText: "",
      phpVersion: [],
      curVersion: "",
      /* 子目录 */
      subDirFrom: {
        domain: "",
        dir: "",
      },
      pathList: [],
      bindList: [],
      subCheckList: [],
      /* 重定向 */
      redirectname: "",
      redirectList: [],
      checkRedirect: [],
      batchType: "",
      batchArr: [
        { type: "on", name: lang.start_rules },
        { type: "off", name: lang.stop_rules },
        { type: "delete", name: lang.del_rules },
      ],
      hasErrorData: false,
      errorDialog: false,
      redirectDialog: false,

      /* 运行目录 */
      dirObj: {
        runPath: {},
      },
      /* 安全设置 */
      // ssl 证书
      safeDialog: false,
      sslActive: "key",
      sslInfo: {
        cert_data: {},
      },
      checkAll: false,
      preDialog: false,
      preContent: "",
      timer: null,
      // ftp
      ftpActiveName: "login",
      ftpLoginParams: {
        keywords: "",
        page: 1,
        limit: 20,
        total: 0,
        pageSizes: [20, 50, 100],
      },
      loginLog: [],
      ftpLogParams: {
        keywords: "",
        page: 1,
        limit: 20,
        type: "all",
        total: 0,
        pageSizes: [20, 50, 100],
      },
      optLog: [],
      optSelect: [
        { value: "all", label: lang.file_all },
        { value: "upload", label: lang.bt_upload },
        { value: "download", label: lang.bt_download },
        { value: "delete", label: lang.bt_delete },
        { value: "rename", label: lang.bt_rename },
      ],
      // 防盗链
      chainInfo: {},
      tamperInfo: {
        total: {
          all: {},
          today: {},
        },
      },
      tamperStatus: 0,
      tamperLog: [],
      tamperActive: "view",
      tamperParams: {
        page: 1,
        limit: 20,
        total: 0,
        pageSizes: [20, 50, 100],
      },
      /* 数据库 */
      databaseInfo: {},
      database: [],
      dataLoading: false,
      passwordType: "", // ftp data
      // 权限
      authDialog: false,
      accessType: "",
      accessSelect: [
        { value: "127.0.0.1", label: lang.local_server },
        { value: "%", label: lang.all_person },
        { value: "specify", label: lang.specify_ip },
      ],
      // 工具
      toolDialog: false,
      dataTableInfo: {
        data_size: "",
        database: "",
        tables: [],
      },
      curTableName: "",
      tableCheck: [],
      // 备份
      backActiveName: "regular",
      backCheck: [],
      backDialog: false,
      regularList: [], // 常规备份
      incrementList: [], // 增量备份
      logDialog: false,
      curCronId: "",
      incrementDialog: false,
      backForm: {
        tb_name: [],
        zip_password: "",
        type: "hour-n",
        hour: 1,
        minute: 30,
        week: 1,
        where1: 3,
      },
      daySelect: [
        { value: "day", label: lang.every_day },
        { value: "day-n", label: `N${lang.domain_day}` },
        { value: "hour", label: lang.every_hour },
        { value: "hour-n", label: `N${lang.bt_hour}` },
        { value: "minute-n", label: `N${lang.bt_minute}` },
        { value: "week", label: lang.every_week },
        { value: "month", label: lang.bt_month },
      ],
      weekSelect: [
        { value: 1, label: lang.monday },
        { value: 2, label: lang.tuesday },
        { value: 3, label: lang.wednesday },
        { value: 4, label: lang.thursday },
        { value: 5, label: lang.friday },
        { value: 6, label: lang.saturday },
        { value: 0, label: lang.sunday },
      ],
      /* 监控报表 */
      timeRange: [],
      monitorForm: {
        query_date: "today",
        target: "pv", // pv,uv,ip,length,req,realtime_traffic,realtime_request
        time_scale: "hour",
        list_display: false,
        compare: true,
        compare_date: "yesterday", // yesterday lw
      },
      sumData: {},
      monitorData: {
        data: [],
        realtime_request: [],
        realtime_traffic: [],
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
      },
      trafficUnit: "KB/s",
      isReal: false,
      tempData: [],
      serviceData: [], // 实时数据
      monitorChart: "",
      monitorContainer: "",
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
    filterNum(num) {
      if (isNaN(num)) {
        return 0;
      } else {
        const temp = `${num}`.split(".");
        return parseInt(temp[0]).toLocaleString();
      }
    },
  },
  methods: {
    hadelSafeConfirm(val) {
      this[val]();
    },
    handleClick() {
      switch (this.activeName) {
        case "site":
          return this.getFtp();
        case "data":
          this.getDataTableList();
          return this.getDatabase();
        case "log":
          return this.getLogList();
      }
    },
    /* 基础信息 */
    closeDialog() {
      this.passwordDialog = false;
      this.password = "";
      this.errorDialog = false;
      this.redirectDialog = false;
      this.authDialog = false;
      this.toolDialog = false;
      this.incrementDialog = false;
    },
    changePassword(type) {
      this.passwordType = type;
      this.passwordDialog = true;
      if (type === "ftp") {
        this.comForm.password = this.ftpInfo.password;
      } else {
        this.comForm.password = this.database[0]?.password;
      }
    },
    subPassword() {
      this.$refs.comForm.validate(async (valid) => {
        if (valid) {
          if (this.passwordType === "ftp") {
            this.handlerFtpPassword();
          } else {
            this.handlerDataPassword();
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    async handlerFtpPassword() {
      try {
        this.submitLoading = true;
        const params = {
          id: this.id,
          password: this.comForm.password,
        };
        const res = await changeFtpPas(params);
        this.submitLoading = false;
        this.$message.success(res.data.msg);
        this.passwordDialog = false;
        this.getFtp();
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    /* 域名绑定 */
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    batchDelete() {
      if (this.multipleSelection.length === 0) {
        return;
      }
      this.delType = "domain";
      this.delTile = lang.del_domain;
      this.isShowDel = true;
      this.isBatch = true;
      this.delDes = lang.bt_tip4;
    },
    delClose() {
      this.isShowDel = false;
      this.curDomain = "";
      if (this.delType === "closeHttps") {
        this.sslInfo.httpTohttps = true;
      }
    },
    checkSelect(row, index) {
      return index !== this.domainList.length - 1;
    },
    async delDomain() {
      try {
        this.delLoading = true;
        const params = {
          id: this.id,
          domain_id: [],
        };
        if (!this.isBatch) {
          params.domain_id = [this.delId];
        } else {
          params.domain_id = this.multipleSelection.reduce((all, cur) => {
            all.push(cur.id);
            return all;
          }, []);
        }
        const res = await deleteDomain(params);
        if (res.data.status === 200) {
          this.$message.success(res.data.msg);
          this.isShowDel = false;
          this.delLoading = false;
          this.getDomain();
        }
      } catch (error) {
        this.delLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    async submitDomain() {
      try {
        if (!this.domainText) {
          return this.$message.error(`${lang.placeholder_pre1}${lang.domain}`);
        }
        const domain = this.domainText.split("\n");
        const params = {
          id: this.id,
          domain,
        };
        this.submitLoading = true;
        const res = await addDomain(params);
        this.$message.success(res.data.msg);
        this.submitLoading = false;
        this.getDomain();
        this.domainText = "";
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    /* 域名绑定 end */
    /* 主机状态设置 */
    async getSite() {
      try {
        const res = await getSiteInfo({ id: this.id });
        this.siteInfo = res.data.data;
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    changeSite(type) {
      this.delType = "site";
      if (type === "start") {
        this.delTile = lang.start_site;
        this.delDes = lang.bt_tip13;
      } else {
        this.delDes = lang.bt_tip12;
        this.delTile = lang.stop_site;
      }
      this.curDomain = this.siteInfo.name;
      this.isShowDel = true;
    },
    async changeSiteStatus() {
      try {
        const params = {
          id: this.id,
        };
        this.delLoading = true;
        const type = this.siteInfo.status == 1 ? "stop" : "start";
        const res = await changeSiteStatus(type, params);
        this.getSite();
        this.$message.success(res.data.msg);
        this.isShowDel = false;
        this.delLoading = false;
      } catch (error) {
        this.delLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    /* 主机状态设置 end */
    /* 伪静态 */
    async getRewriteInfo() {
      try {
        const res = await getRewrite({ id: this.id });
        this.rewriteText = res.data.data.data;
      } catch (error) {}
    },
    async submitRewrite() {
      try {
        const params = {
          id: this.id,
          data: this.rewriteText,
        };
        this.submitLoading = true;
        const res = await saveRewrite(params);
        this.$message.success(res.data.msg);
        this.submitLoading = false;
        this.getRewriteInfo();
        this.rewriteText = "";
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    /* 伪静态 end */
    /* php */
    async getPhpVersion() {
      try {
        const res = await getPhp({ id: this.id });
        this.phpVersion = res.data.data.list;
        this.curVersion = res.data.data.version;
      } catch (error) {}
    },
    async submitPhp() {
      try {
        const params = {
          id: this.id,
          version: this.curVersion,
        };
        this.submitLoading = true;
        const res = await savePhp(params);
        this.$message.success(res.data.msg);
        this.submitLoading = false;
        this.getPhpVersion();
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    /* php end */
    /* 子目录 */
    async getPathList() {
      try {
        this.subDirFrom.domain = "";
        this.subDirFrom.dir = "";
        this.tableLoading = true;
        const res = await getDirPath({ id: this.id });
        this.pathList = res.data.data.dirs;
        this.bindList = res.data.data.binding;
        this.subDirFrom.dir = this.pathList[0];
        this.tableLoading = false;
        this.subCheckList = [];
      } catch (error) {
        this.tableLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    checkSubDir(val) {
      this.subCheckList = val;
    },
    async submitDir() {
      try {
        if (!this.subDirFrom.domain) {
          return this.$message.error(`${lang.placeholder_pre1}${lang.domain}`);
        }
        if (!this.subDirFrom.dir) {
          return this.$message.error(
            `${lang.placeholder_pre2}${lang.subdirectory}`
          );
        }
        const params = {
          id: this.id,
          ...JSON.parse(JSON.stringify(this.subDirFrom)),
        };

        this.submitLoading = true;
        const res = await addDirPath(params);
        this.$message.success(res.data.msg);
        this.submitLoading = false;
        this.getPathList();
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    async delSubDir() {
      try {
        const params = {
          id: this.id,
          binding_id: this.delId,
        };
        this.delLoading = true;
        const res = await delDirPath(params);
        this.$message.success(res.data.msg);
        this.submitLoading = false;
        this.isShowDel = false;
        this.delLoading = false;
        this.getPathList();
      } catch (error) {
        this.delLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    batchDelSub() {
      let delArr = [];
      this.subCheckList.forEach((item, index) => {
        delArr[index] = delDirPath({
          id: this.id,
          binding_id: item.id,
        });
      });
      this.delLoading = true;
      Promise.all(delArr)
        .then((res) => {
          this.$message.success(`${lang.referral_tips4}`);
          this.isShowDel = false;
          this.delLoading = false;
          this.getPathList();
        })
        .catch((error) => {
          this.delLoading = false;
          this.$message.error(error.data.msg);
        });
    },
    batchDeleteSub() {
      if (this.subCheckList.length === 0) {
        return;
      }
      this.delType = "batchSub";
      this.curDomain = "";
      this.delTile = `${lang.security_btn4}${lang.subdirectory}`;
      this.isShowDel = true;
      this.isBatch = true;
      this.delDes = lang.bt_tip14;
    },
    /* 子目录 end */

    /* 重定向 */
    addRedirect() {
      this.optType = "add";
      this.redirectDialog = true;
      this.comForm.type = 1;
      this.comForm.holdpath = 1;
      this.comForm.redirecttype = "301";
      this.comForm.domainorpath = "domain";
      this.comForm.redirectpath = "";
      this.comForm.redirectdomain = [];
      this.comForm.tourl = "http://";
    },
    addError() {
      this.errorDialog = true;
      if (this.hasErrorData) {
        // 编辑
        const temp = this.redirectList.filter((item) => item.errorpage === 1);
        if (temp[0].tourl) {
          this.errorType = "custom";
        }
        console.log("temp", temp[0]);
        this.comForm = Object.assign(temp[0]);
        this.optType = "update";
      } else {
        this.comForm.type = 1;
        this.comForm.redirecttype = "301";
        this.comForm.tourl = "";
        this.errorType = "/";
        this.optType = "add";
      }
    },
    handleSelectRedirect(val) {
      this.checkRedirect = val;
    },
    async getRedirectList() {
      try {
        this.tableLoading = true;
        const res = await getRedirect({
          id: this.id,
        });
        this.tableLoading = false;
        this.redirectList = res.data.data.list;
        this.hasErrorData = this.redirectList.some(
          (item) => item.errorpage === 1
        );
      } catch (error) {
        this.tableLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    async changeRedirectStatus(row) {
      try {
        const params = JSON.parse(JSON.stringify(row));
        params.type = params.type ? 0 : 1;
        params.id = this.id;
        const res = await addAndEditRedirect("update", params);
        this.$message.success(res.data.msg);
        this.getRedirectList();
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    changeRedirectType() {
      this.$refs.redirectForm.clearValidate();
    },
    editRedirect(item) {
      if (item.errorpage === 0) {
        this.redirectDialog = true;
      } else {
        this.errorDialog = true;
        if (item.tourl) {
          this.errorType = "custom";
        }
      }
      this.optType = "update";
      this.comForm = Object.assign(JSON.parse(JSON.stringify(item)));
    },
    // 添加/编辑重定向
    subRedirect() {
      this.$refs.redirectForm.validate(async (valid) => {
        if (valid) {
          try {
            this.submitLoading = true;
            const params = JSON.parse(JSON.stringify(this.comForm));
            params.id = this.id;
            if (params.errorpage === 1) {
              // delete params.domainorpath;
              // params.domainorpath = "domain"
            }
            const res = await addAndEditRedirect(this.optType, params);
            this.submitLoading = false;
            this.$message.success(res.data.msg);
            this.errorDialog = false;
            this.redirectDialog = false;
            this.getRedirectList();
          } catch (error) {
            console.log("error", error);
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    batchHandler() {
      let tip = "";
      switch (this.batchType) {
        case "on":
          tip = lang.start_rules;
          this.delDes = lang.bt_tip24;
          this.delType = "batchOn";
          break;
        case "off":
          tip = lang.stop_rules;
          this.delDes = lang.bt_tip25;
          this.delType = "batchOff";
          break;
        case "delete":
          tip = lang.del_rules;
          this.delDes = lang.bt_tip26;
          this.delType = "batchDelete";
          break;
      }
      this.delTile = `${lang.batch}${tip}`;
      this.isShowDel = true;
    },
    // 添加404重定向
    subErrorRedirect() {
      if (this.hasErrorData) {
        return this.subRedirect();
      }
      this.$refs.redirectForm.validate(async (valid) => {
        if (valid) {
          try {
            this.submitLoading = true;
            const { type, redirecttype, tourl } = JSON.parse(
              JSON.stringify(this.comForm)
            );
            const params = {
              id: this.id,
              type,
              redirecttype,
              tourl,
            };
            const res = await addErrorRedirect(params);
            this.submitLoading = false;
            this.$message.success(res.data.msg);
            this.errorDialog = false;
            this.getRedirectList();
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    async delRedirect() {
      try {
        const params = {
          id: this.id,
          redirectname: this.redirectname,
        };
        this.delLoading = true;
        const res = await delRedirect(params);
        this.$message.success(res.data.msg);
        this.delLoading = false;
        this.isShowDel = false;
        this.getRedirectList();
      } catch (error) {
        this.delLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    // 批量操作 启用/停用/删除
    batchHandleRedir() {
      let delArr = [];
      this.checkRedirect.forEach((item, index) => {
        if (this.delType === "batchOn" || this.delType === "batchOff") {
          const params = {
            id: this.id,
            ...item,
          };
          if (this.delType === "batchOn") {
            params.type = 1;
          } else {
            params.type = 0;
          }
          delArr[index] = addAndEditRedirect("update", params);
        } else if (this.delType === "batchDelete") {
          const params = {
            id: this.id,
            ...item,
          };
          delArr[index] = delRedirect(params);
        }
        if (delArr.length !== this.checkRedirect.length) {
          return;
        }
        this.delLoading = true;
        Promise.all(delArr)
          .then((res) => {
            if (this.delType === "batchOn" || this.delType === "batchOff") {
              this.$message.success(`${lang.bt_edit_suc}`);
            } else {
              this.$message.success(`${lang.referral_tips4}`);
            }
            this.isShowDel = false;
            this.delLoading = false;
            this.getRedirectList();
          })
          .catch((error) => {
            this.delLoading = false;
            this.$message.error(error.data.msg);
          });
      });
    },
    /* 重定向 end */
    /* 运行目录 */
    async getRunDirInfo() {
      try {
        const res = await getRunPath({
          id: this.id,
        });
        this.dirObj = res.data.data;
      } catch (error) {}
    },
    async submitRunDir() {
      try {
        this.submitLoading = true;
        const res = await saveRunPath({
          id: this.id,
          run_path: this.dirObj.runPath.runPath,
        });
        this.$message.success(res.data.msg);
        this.submitLoading = false;
        this.getRunDirInfo();
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    async changeRunSwitch() {
      try {
        const res = await changeRunPath({
          id: this.id,
        });
        this.$message.success(res.data.msg);
        this.getRunDirInfo();
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    /* 运行目录 end */
    /* 监控报表 */
    changeTime(type) {
      if (this.isReal) return;
      this.tempData = [];
      this.serviceData = [];
      this.monitorForm.query_date = type;
      const hourArr = ["today", "yesterday", "h1"];
      if (hourArr.includes(type)) {
        this.monitorForm.time_scale = "hour";
      }
      if (type === "l7" || type === "l30") {
        this.monitorForm.time_scale = "day";
      }
      if (type === "range") {
        this.monitorForm.query_date = `${this.formartTime(
          this.timeRange[0]
        )}-${this.formartTime(this.timeRange[1])}`;
      } else {
        this.timeRange = [];
      }
      this.getMintorData();
    },
    formartTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}${month}${day}`;
    },
    changeTimeWay(type) {
      if (this.isReal) return;
      this.monitorForm.time_scale = type;
      this.getMintorData();
    },
    changeListWay(bol) {
      if (this.isReal) return;
      this.monitorForm.list_display = bol;
      this.getMintorData();
    },
    // 重置默认数据
    initDefault() {
      this.monitorForm.query_date = "today";
      this.monitorForm.time_scale = "hour";
      this.monitorForm.list_display = false;
    },
    changeTarget(type) {
      clearInterval(this.timer);
      this.tempData = [];
      this.serviceData = [];
      if (type === "realtime_traffic" || type === "realtime_request") {
        this.isReal = true;
        this.initDefault();
        this.getMintorData();
        return this.pollingMonitor(type === "realtime_traffic" ? 3000 : 1000);
      }
      this.isReal = false;
      this.getMintorData();
    },
    // 实时流量/每秒请求
    pollingMonitor(time) {
      this.timer = setInterval(() => {
        this.getMintorData(true);
      }, time);
    },
    initCharts() {
      const target = this.monitorData.target;
      let title = "";
      switch (target) {
        case "pv":
          title = lang.page_view;
          break;
        case "uv":
          title = lang.visitor_volume;
          break;
        case "ip":
          title = lang.ip_number;
          break;
        case "length":
          title = lang.mf_flow;
          break;
        case "req":
          title = lang.bt_request;
          break;
        case "realtime_traffic":
          title = lang.real_time_traffic;
          break;
        case "realtime_request":
          title = lang.requests_per_second;
          break;
      }
      if (this.monitorForm.time_scale === "hour") {
        // 按时 并且不是 实时流量和每秒请求
        if (target !== "realtime_traffic" && target !== "realtime_request") {
          this.tempData = this.monitorData.data.reduce((all, cur) => {
            all.push({
              time: cur.time,
              [target]: cur[target],
            });
            return all;
          }, []);
        } else {
          // 实时
          const d = new Date();
          if (this.serviceData.length >= 8)
            this.serviceData.splice(
              0,
              this.monitorData[target].length === 0
                ? 1
                : this.monitorData[target].length
            );
          if (this.tempData.length >= 8)
            this.tempData.splice(
              0,
              this.monitorData[target].length === 0
                ? 1
                : this.monitorData[target].length
            );
          if (this.monitorData[target].length == 0) {
            this.serviceData.push(0);
            this.tempData.push({
              time:
                `0${d.getHours()}`.substr(-2) +
                ":" +
                `0${d.getMinutes()}`.substr(-2) +
                ":" +
                `0${d.getSeconds()}`.substr(-2),
              [target]: 0,
            });
          } else {
            let unit_size = 1024;
            for (var i = 0; i < this.monitorData[target].length; i++) {
              let serData =
                this.monitorData[target][i][
                  target === "realtime_traffic" ? "flow" : "req"
                ];
              if (target === "realtime_traffic") {
                switch (this.trafficUnit) {
                  case "MB/s":
                    unit_size = 1024 * 1024;
                    break;
                  case "GB/s":
                    unit_size = 1024 * 1024 * 1024;
                    break;
                  default:
                    unit_size = 1024;
                }
                serData = serData / unit_size;
              }
              this.serviceData.push(serData);
              // that.xAxisRealTimeArr.push(bt.format_data(res[that.realtime_type][i]['timestamp'], 'hh:mm:ss'))
              this.tempData.push({
                time:
                  `0${d.getHours()}`.substr(-2) +
                  ":" +
                  `0${d.getMinutes()}`.substr(-2) +
                  ":" +
                  `0${d.getSeconds()}`.substr(-2),
                [target]: serData,
              });
            }
          }
        }
      } else {
        // 按天
        this.tempData = this.monitorData.data.reduce((all, cur) => {
          all.push({
            time: cur.time,
            [target]: cur[target],
          });
          return all;
        }, []);
      }
      let x = [];
      let y = [];

      this.tempData.forEach((item) => {
        // 按时
        if (this.monitorForm.time_scale === "hour") {
          if (target !== "realtime_traffic" && target !== "realtime_request") {
            x.push(item.time);
          } else {
            x.push(item.time);
          }
          y.push(item[target]);
        } else {
          const day =
            String(item.time).substr(0, 4) +
            "/" +
            String(item.time).substr(4, 2) +
            "/" +
            String(item.time).substr(6, 2);
          x.push(day);
          y.push(item[target]);
        }
      });
      let tooltip = "";
      const cpuOption = {
        // title: {
        //   text: lang.common_cloud_text73,
        // },
        tooltip: {
          show: true,
          trigger: "axis",
          formatter: (params) => {
            const data = params[0];
            let x = data.axisValue;
            if (this.monitorForm.time_scale === "hour") {
              if (
                target !== "realtime_traffic" &&
                target !== "realtime_request"
              ) {
                tooltip = `
                  <div class="tooltip-box">
                    <div class="time text">
                      <p class="left">${x}:00-${x}:59</p>
                    </div>
                    <div class="time">
                      <p class="txt">
                        <span class="circle"></span>
                        ${title}
                      </p>
                      <p>${data.data}</p>
                    </div>
                  </div>
                `;
              } else {
                let txt = "";
                if (target === "realtime_traffic") {
                  txt = `${data.data.toFixed(2)}${this.trafficUnit}`;
                } else {
                  txt = data.data;
                }
                tooltip = `
                  <div class="tooltip-box">
                    <div class="time text">
                      <p class="left">${lang.finance_label3}：${x}</p>
                    </div>
                    <div class="time">
                      <p class="txt"><span class="circle"></span>${title}</p>
                      <p>${txt}</p>
                    </div>
                  </div>
                `;
              }
            } else {
              tooltip = `
                <div class="tooltip-box">
                  <div class="time text">
                    <p class="left">${x}</p>
                  </div>
                  <div class="time">
                    <p class="txt"><span class="circle"></span>${title}</p>
                    <p>${data.data}</p>
                  </div>
                </div>
              `;
            }
            return tooltip;
          },
        },
        color: ["#3A84FF"],
        legend: {
          data: [title],
          bottom: "0",
        },
        grid: {
          left: "5%",
          right: "4%",
          bottom: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: x,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: title,
            data: y,
            type: "line",
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                {
                  offset: 0,
                  color: "rgba(58,132,255,0)",
                },
                {
                  offset: 1,
                  color: "rgba(58,132,255,0.35)",
                },
              ]),
            },
          },
        ],
      };
      this.monitorContainer = document.getElementById("monitor-echart");
      this.monitorChart = echarts.init(this.monitorContainer);
      this.monitorChart.setOption(cpuOption);
    },
    // 监控数据
    // 监听容器大小变化
    updateContainer() {
      this.monitorChart &&
        this.monitorChart.resize({
          width: this.monitorContainer.clientWidth,
        });
    },
    async getMintorData(noLoading = false) {
      try {
        const params = {
          id: this.id,
          ...this.monitorForm,
        };
        this.dataLoading = noLoading ? false : true;
        const res = await getEcharts(params);
        this.monitorData = res.data.data;
        this.sumData = this.monitorData.sum_data;
        this.dataLoading = false;
        if (!this.monitorForm.list_display) {
          this.initCharts();
        }
      } catch (error) {
        console.log("#####", error);
        this.dataLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    /* 监控报表 end */
    tabBase() {
      this.multipleSelection = [];
      this.subCheckList = [];
      this.checkRedirect = [];
      this.$refs.domainMultiple.clearSelection();
      this.$refs.subMultiple.clearSelection();
      this.$refs.dirMultiple.clearSelection();
      clearInterval(this.timer);
      this.isReal = false;
      switch (this.baseActiveName) {
        case "domain":
          return this.getDomain();
        case "rewrite":
          return this.getRewriteInfo();
        case "php":
          return this.getPhpVersion();
        case "subdirectory":
          return this.getPathList();
        case "redirect":
          return this.getRedirectList();
        case "run_directory":
          return this.getRunDirInfo();
        case "monitoring":
          this.monitorForm = {
            query_date: "today",
            target: "pv",
            time_scale: "hour",
            list_display: false,
            compare: true,
            compare_date: "yesterday",
          };
          return this.getMintorData();
      }
    },

    /* 安全设置 */
    handlerSafe(type) {
      this.safeDialog = true;
      this.baseActiveName = type;
      switch (type) {
        case "certificate":
          this.sslActive = "key";
          return this.getSsl();
        case "ftp":
          return this.getFtpLoginLog();
        case "chain":
          return this.getChainInfo();
        case "resistant":
          return this.getTamperInfo();
      }
    },
    tabSafe() {
      switch (this.baseActiveName) {
        case "certificate":
          this.sslActive = "key";
          return this.getSsl();
        case "ftp":
          return this.getFtpLoginLog();
        case "chain":
          return this.getChainInfo();
        case "resistant":
          return this.getTamperInfo();
      }
    },
    // ssl
    async submitSsl() {
      this.$refs.sslForm.validate(async (valid) => {
        if (valid) {
          try {
            const params = {
              id: this.id,
              key: this.comForm.key,
              csr: this.comForm.csr,
            };
            this.submitLoading = true;
            const res = await saveSslInfo(params);
            this.$message.success(res.data.msg);
            this.getSsl();
            this.submitLoading = false;
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    tabSsl() {
      this.comForm.domains = [];
    },
    // 续费证书
    async handlerRenew() {
      try {
        const res = await renewSsl({
          id: this.id,
          index: this.sslInfo.index,
        });
        if (res.data.status === 200) {
          this.preDialog = true;
          this.pollingSsl();
        }
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    // 申请证书
    async applySsl() {
      try {
        if (this.comForm.domains.length === 0) {
          return this.$message.error(`${lang.placeholder_pre2}${lang.domain}`);
        }
        const params = {
          id: this.id,
          domains: this.comForm.domains,
        };
        this.submitLoading = true;
        this.preContent = "";
        this.pollingSsl();
        this.preDialog = true;
        const res = await applySsl(params);
        if (res.data.status === 200) {
          clearInterval(this.timer);
          this.preDialog = false;
          this.sslActive = "key";
          this.submitSsl();
        }
        this.submitLoading = false;
      } catch (error) {
        this.preDialog = false;
        this.submitLoading = false;
        clearInterval(this.timer);
        this.preContent = "";
        this.$message.error(error.data.msg);
      }
    },
    pollingSsl() {
      try {
        if (!this.timer) {
          this.timer = setInterval(async () => {
            const res = await getSslProcess({ id: this.id });
            this.preContent = res.data.data;
          }, 3000);
        }
      } catch (error) {
        this.preDialog = false;
      }
    },
    async changeForce(e) {
      try {
        if (e) {
          // 开启直接调接口
          const res = await forceHttps({ id: this.id });
          this.$message.success(res.data.msg);
          this.getSsl();
        } else {
          // 关闭二次提醒
          this.delType = "closeHttps";
          this.isShowDel = true;
          this.delTile = `${lang.ticket_btn5}${lang.force_https}`;
          this.delDes = lang.bt_tip39;
        }
      } catch (error) {
        this.sslInfo.httpTohttps = false;
        this.$message.error(error.data.msg);
      }
    },
    async closeHttps() {
      try {
        this.delLoading = true;
        const res = await closeHttps({ id: this.id });
        this.$message.success(res.data.msg);
        this.isShowDel = false;
        this.delLoading = false;
        this.getSsl();
      } catch (error) {
        this.delLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    async closeSsl() {
      try {
        const res = await closeSsl({ id: this.id });
        this.$message.success(res.data.msg);
        this.getSsl();
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    async getSsl() {
      try {
        const res = await getSslInfo({ id: this.id });
        this.sslInfo = res.data.data;
        this.comForm.key = this.sslInfo.key || "";
        this.comForm.csr = this.sslInfo.csr || "";
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    handleCheckAllChange(val) {
      const temp = this.sslInfo.domain.reduce((all, cur) => {
        all.push(cur.name);
        return all;
      }, []);
      this.comForm.domains = val ? temp : [];
    },
    chooseDomain() {
      this.checkAll =
        this.comForm.domains.length === this.sslInfo.domain.length;
    },
    // ftp
    tabFtp() {
      if (this.ftpActiveName === "login") {
        this.getFtpLoginLog();
      } else {
        this.getFtOptLog();
      }
    },
    changeFtp(type) {
      this.delType = "ftp";
      if (type === "start") {
        this.delTile = lang.start_ftp_account;
        this.delDes = lang.bt_tip70;
      } else {
        this.delTile = lang.stop_ftp_account;
        this.delDes = lang.bt_tip71;
      }
      this.isShowDel = true;
    },
    async changeFtpStatus() {
      try {
        const params = {
          id: this.id,
          status: this.ftpInfo.status == 1 ? 0 : 1,
        };
        this.delLoading = true;
        const res = await changeFtpStatus(params);
        this.getFtp();
        this.$message.success(res.data.msg);
        this.isShowDel = false;
        this.delLoading = false;
      } catch (error) {
        this.delLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    refeshLog(type) {
      if (type === "login") {
        this.getFtpLoginLog();
      } else {
        this.getFtOptLog();
      }
    },
    searchLoginLog() {
      this.ftpLoginParams.page = 1;
      this.getFtpLoginLog();
    },
    searchFtpLog() {
      this.ftpLogParams.page = 1;
      this.getFtOptLog();
    },
    async getFtpLoginLog() {
      try {
        const params = {
          id: this.id,
          ...this.ftpLoginParams,
        };
        this.dataLoading = true;
        const res = await ftpLoginLog(params);
        this.loginLog = res.data.data.list;
        this.dataLoading = false;
        this.ftpLoginParams.total = res.data.data.count;
      } catch (error) {
        this.dataLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    async getFtOptLog() {
      try {
        const params = {
          id: this.id,
          ...this.ftpLogParams,
        };
        this.dataLoading = true;
        const res = await ftpActionLog(params);
        this.optLog = res.data.data.list;
        this.dataLoading = false;
        this.ftpLogParams.total = res.data.data.count;
      } catch (error) {
        this.dataLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    sizeChange(e) {
      this.ftpLoginParams.limit = e;
      this.ftpLoginParams.page = 1;
      this.getFtpLoginLog();
    },
    currentChange(e) {
      this.ftpLoginParams.page = e;
      this.getFtpLoginLog();
    },
    logSizeChange(e) {
      this.ftpLogParams.limit = e;
      this.ftpLogParams.page = 1;
      this.getFtOptLog();
    },
    logCurrentChange(e) {
      this.ftpLogParams.page = e;
      this.getFtOptLog();
    },
    tamperSizeChange(e) {
      this.tamperParams.limit = e;
      this.tamperParams.page = 1;
      this.getTamperInfo();
    },
    tamperCurrentChange(e) {
      this.tamperParams.page = e;
      this.getTamperInfo();
    },
    // 防盗链
    changeChain(e) {
      if (!e) {
        this.comForm.http_status = false;
      }
    },
    async getChainInfo() {
      try {
        const res = await getSecurity({ id: this.id });
        const temp = res.data.data;
        this.comForm.return_rule = temp.return_rule;
        this.comForm.status = temp.status;
        this.comForm.http_status = temp.http_status;
        this.comForm.fix = temp.fix.join();
        this.comForm.domain = temp.domains.join("\n");
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    async submitChain() {
      this.$refs.chainForm.validate(async (valid) => {
        if (valid) {
          try {
            const params = {
              id: this.id,
              domains: this.comForm.domain.split("\n"),
              fix: this.comForm.fix.split(","),
              return_rule: this.comForm.return_rule,
              status: String(this.comForm.status),
              http_status: String(this.comForm.http_status),
            };
            this.submitLoading = true;
            const res = await saveSecurity(params);
            this.$message.success(res.data.msg);
            this.getChainInfo();
            this.submitLoading = false;
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    // 防篡改
    async getTamperInfo() {
      try {
        const res = await getTamper({ id: this.id });
        let temp = res.data.data;
        if (!temp.total) {
          temp = {
            total: {
              all: {},
              today: {},
            },
          };
        }
        this.tamperStatus = temp.status;
        this.tamperInfo = temp;
        const params = {
          id: this.id,
          ...this.tamperParams,
        };
        const result = await getTamperLog(params);
        this.tamperLog = result.data.data.list;
        this.tamperParams.total = result.data.data.count;
      } catch (error) {
        console.log("tamper", error);
        this.$message.error(error.data.msg);
      }
    },
    async changeTamper(e) {
      try {
        const res = await saveTamper({
          id: this.id,
          status: e,
        });
        this.$message.success(res.data.msg);
        this.getTamperInfo();
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    /* 安全设置 end */

    /* 数据库 start */
    // 修改数据库密码
    async handlerDataPassword() {
      try {
        this.submitLoading = true;
        const params = {
          id: this.id,
          password: this.comForm.password,
        };
        const res = await changeDataPassword(params);
        this.submitLoading = false;
        this.$message.success(res.data.msg);
        this.passwordDialog = false;
        this.getDatabase();
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    radomPassword() {
      const pass = randomCoding(1) + 0 + genEnCode(9, 1, 1, 0, 1, 0);
      this.comForm.password = pass;
      this.backForm.zip_password = pass;
    },
    // 数据库信息
    async getDatabase() {
      try {
        this.tableLoading = true;
        const res = await getDataList({ id: this.id });
        this.database = [res.data.data];
        this.databaseInfo = res.data.data;
        this.tableLoading = false;
      } catch (error) {
        this.tableLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    // 备份
    tabBackup(e) {
      if (e.paneName === this.backActiveName) {
        return;
      }
      this.backActiveName = e.paneName;
      if (this.backActiveName === "regular") {
        this.getRegularList();
      } else {
        this.getIncrementList();
      }
    },
    openBackup() {
      this.backDialog = true;
      this.backActiveName = "regular";
      this.getRegularList();
    },
    // 添加增量备份
    addIncrement() {
      this.optType = "add";
      this.incrementDialog = true;
      this.backForm = {
        tb_name: [],
        zip_password: "",
        type: "hour-n",
        hour: 1,
        minute: 30,
        week: 1,
        where1: 3,
      };
    },
    editBack(row) {
      this.optType = "update";
      this.incrementDialog = true;
      const temp = JSON.parse(JSON.stringify(row));
      temp.tb_name = temp.tb_name.split(",");
      Object.assign(this.backForm, temp);
    },
    /* 保存增量备份 */
    subIncrement() {
      this.$refs.backForm.validate(async (valid) => {
        if (valid) {
          try {
            this.submitLoading = true;
            const params = JSON.parse(JSON.stringify(this.backForm));
            params.id = this.id;
            if (this.optType === "add") {
              delete params.cron_id;
            }
            params.tb_name = params.tb_name.join();
            if (params.tb_name.indexOf("all") !== -1) {
              params.tb_name = "";
            }
            const res = await addAndEditIncrementBack(this.optType, params);
            this.submitLoading = false;
            this.$message.success(res.data.msg);
            this.incrementDialog = false;
            this.getIncrementList();
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    async deleteIncrement() {
      try {
        this.delLoading = true;
        const res = await delIncrementBack({
          id: this.id,
          cron_id: this.delId,
        });
        this.delLoading = false;
        this.$message.success(res.data.msg);
        this.getIncrementList();
        this.isShowDel = false;
      } catch (error) {
        this.delLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    async getRegularList() {
      try {
        this.dataLoading = true;
        const res = await getDataBackup({ id: this.id });
        this.regularList = res.data.data.list;
        this.dataLoading = false;
      } catch (error) {
        this.dataLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    async getIncrementList() {
      try {
        this.dataLoading = true;
        const res = await getIncrementBack({ id: this.id });
        this.incrementList = res.data.data.list;
        this.dataLoading = false;
      } catch (error) {
        this.dataLoading = false;
        this.$message.error(error.data.msg);
      }
    },

    // 执行
    async handleExecute(row) {
      try {
        const res = await startTask({
          id: this.id,
          cron_id: row.cron_id,
        });
        this.$message.success(res.data.msg);
        this.getRegularList();
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    async lookLog(row) {
      try {
        this.curCronId = row.cron_id;
        const res = await taskLog({
          id: this.id,
          cron_id: row.cron_id,
        });
        this.logDialog = true;
        this.preContent = res.data.data.msg;
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    async clearLog() {
      try {
        this.submitLoading = true;
        const res = await cleartaskLog({
          id: this.id,
          cron_id: this.curCronId,
        });
        this.submitLoading = false;
        this.$message.success(res.data.msg);
        this.logDialog = false;
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    // 新增常规备份
    async handleBack() {
      try {
        this.submitLoading = true;
        const res = await addDataBackup({ id: this.id });
        this.submitLoading = false;
        this.$message.success(res.data.msg);
        this.getRegularList();
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    closeBackDialog() {
      this.backDialog = false;
      this.getDatabase();
    },
    /* 选择表 */
    chooseAll() {
      const hasAll = this.backForm.tb_name.some((item) => item === "all");
      if (hasAll) {
        const arr = this.dataTableInfo.tables.reduce((all, cur) => {
          all.push(cur.table_name);
          return all;
        }, []);
        arr.unshift("all");
        this.backForm.tb_name = arr;
      } else {
        this.backForm.tb_name = [];
      }
    },
    chooseSingle(item) {
      if (!this.backForm.tb_name.includes(item.table_name)) {
        this.backForm.tb_name = this.backForm.tb_name.filter(
          (item) => item !== "all"
        );
      }
      if (this.backForm.tb_name.length === this.dataTableInfo.tables.length) {
        this.backForm.tb_name.push("all");
      }
    },
    // 恢复/导入数据库
    importBackup(row) {
      this.delType = "import";
      this.delId = row.filename;
      this.delTile = lang.import_database;
      this.delDes = `<span class="com-red">${this.dataTableInfo.database}${lang.bt_tip53}</span>`;
      this.isShowDel = true;
    },
    async handleImport() {
      try {
        this.delLoading = true;
        const res = await recoverDataBackup({
          id: this.id,
          filename: this.delId,
        });
        this.$message.success(res.data.msg);
        this.delLoading = false;
        this.isShowDel = false;
        this.getRegularList();
      } catch (error) {
        this.delLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    handleBackChange(val) {
      this.backCheck = val;
    },
    async deleteBackup() {
      try {
        this.delLoading = true;
        const res = await delDataBackup({
          id: this.id,
          backup_id: this.delId,
        });
        this.$message.success(res.data.msg);
        this.delLoading = false;
        this.isShowDel = false;
        this.getRegularList();
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    batchDeleteBackup() {
      if (this.backCheck.length === 0) {
        return;
      }
      let delArr = [];
      this.backCheck.forEach((item, index) => {
        delArr[index] = delDataBackup({
          id: this.id,
          backup_id: item.id,
        });
      });
      this.delLoading = true;
      Promise.all(delArr)
        .then((res) => {
          this.$message.success(`${lang.referral_tips4}`);
          this.isShowDel = false;
          this.delLoading = false;
          this.getRegularList();
        })
        .catch((error) => {
          this.delLoading = false;
          this.$message.error(error.data.msg);
        });
    },
    // 权限
    async handleAuth() {
      try {
        const res = await getDataAccess({ id: this.id });
        const access = (this.comForm.access = res.data.data.access);
        switch (access) {
          case "127.0.0.1":
          case "%":
            this.accessType = access;
            break;
          default:
            this.accessType = "specify";
        }
        this.authDialog = true;
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    changeAccessType() {
      this.comForm.access = "";
    },
    submitAuth() {
      this.$refs.comForm.validate(async (valid) => {
        if (valid) {
          try {
            let access = "";
            if (this.accessType === "127.0.0.1" || this.accessType === "%") {
              access = this.accessType;
            } else {
              access = this.comForm.access;
            }
            const params = {
              id: this.id,
              access,
            };
            this.submitLoading = true;
            const res = await saveDataAccess(params);
            this.$message.success(res.data.msg);
            this.authDialog = false;
            this.submitLoading = false;
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    // 工具
    handleTool() {
      this.toolDialog = true;
      this.tableCheck = [];
      this.$refs.tableMultiple && this.$refs.tableMultiple.clearSelection();
    },
    async getDataTableList() {
      try {
        this.dataLoading = true;
        const res = await getDataTable({ id: this.id });
        this.dataTableInfo = res.data.data;
        this.dataLoading = false;
      } catch (error) {
        this.dataLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    handleTableChange(val) {
      this.tableCheck = val;
    },
    handleBatch(opt, type) {
      switch (opt) {
        case "repair":
          return this.repairTable();
        case "optimize":
          return this.optimizeTable();
        case "turn":
          return this.turnTable("", type);
      }
    },
    handleTable(row, type) {
      if (type === "repair") {
        this.repairTable(row);
      } else if (type === "optimize") {
        this.optimizeTable(row);
      } else {
        this.turnTable(row);
      }
    },
    // 修复
    async repairTable(val) {
      try {
        let params = {
          id: this.id,
          tables: [],
        };
        if (val) {
          params.tables = [val.table_name];
        } else {
          params.tables = this.tableCheck.reduce((all, cur) => {
            all.push(cur.table_name);
            return all;
          }, []);
        }
        const res = await repairDataTable(params);
        this.$message.success(res.data.msg);
        this.getDataTableList();
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    // 优化
    async optimizeTable(val) {
      try {
        let params = {
          id: this.id,
          tables: [],
        };
        if (val) {
          params.tables = [val.table_name];
        } else {
          params.tables = this.tableCheck.reduce((all, cur) => {
            all.push(cur.table_name);
            return all;
          }, []);
        }
        const res = await optimizeDataTable(params);
        this.$message.success(res.data.msg);
        this.getDataTableList();
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    // 转换
    async turnTable(val, type) {
      try {
        let params = {
          id: this.id,
          tables: [],
        };
        if (val) {
          params.tables = [val.table_name];
          params.table_type = val.type === "InnoDB" ? "MyISAM" : "InnoDB";
        } else {
          params.tables = this.tableCheck.reduce((all, cur) => {
            all.push(cur.table_name);
            return all;
          }, []);
          params.table_type = type;
        }
        const res = await changeDataTable(params);
        this.$message.success(res.data.msg);
        this.getDataTableList();
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    /* 数据库 end */

    /* 站点信息 Tab */
    handlerBase(type) {
      this.baseDialog = true;
      this.baseActiveName = type;
      clearInterval(this.timer);
      this.isReal = false;
      switch (type) {
        case "rewrite":
          return this.getRewriteInfo();
        case "php":
          return this.getPhpVersion();
        case "subdirectory":
          return this.getPathList();
        case "redirect":
          return this.getRedirectList();
        case "run_directory":
          return this.getRunDirInfo();
        case "monitoring":
          this.monitorForm = {
            query_date: "today",
            target: "pv",
            time_scale: "hour",
            list_display: false,
            compare: true,
            compare_date: "yesterday",
          };
          return this.getMintorData();
      }
    },
    comDel(type, item, isBatch = false) {
      this.isBatch = isBatch;
      this.delType = type;
      this.delId = item.id;
      this.redirectname = item.redirectname;
      this.isShowDel = true;
      switch (type) {
        case "domain":
          this.curDomain = item.name;
          this.delDes = lang.bt_tip4;
          this.delTile = lang.del_domain;
          break;
        case "sub":
          this.curDomain = "";
          this.delTile = `${lang.security_btn4}${lang.subdirectory}`;
          this.delDes = lang.bt_tip14;
          break;
        case "redirect":
          this.curDomain = "";
          this.delTile = `${lang.security_btn4}${lang.redirect}`;
          this.delDes = lang.bt_tip15;
          break;
        case "back":
          this.delTile = lang.delete_data_backup;
          this.delDes = `${lang.bt_tip54}，<span class="com-red">${lang.bt_tip55}</span>，${lang.bt_tip56}？`;
          break;
        case "increment":
          this.delId = item.cron_id;
          this.delTile = lang.delete_backup_task;
          this.delDes = `${lang.bt_tip61}，<span class="com-red">${lang.bt_tip62}</span>，${lang.bt_tip56}？`;
          break;
      }
    },
    delSub() {
      switch (this.delType) {
        case "domain":
          return this.delDomain();
        case "site":
          return this.changeSiteStatus();
        case "ftp":
          return this.changeFtpStatus();
        case "sub":
          return this.delSubDir();
        case "batchSub":
          return this.batchDelSub();
        case "redirect":
          return this.delRedirect();
        case "batchOn":
        case "batchOff":
        case "batchDelete":
          return this.batchHandleRedir();
        case "closeHttps":
          return this.closeHttps();
        case "back":
          return this.deleteBackup();
        case "import":
          return this.handleImport();
        case "increment":
          return this.deleteIncrement();
      }
    },
    // 获取FTP信息
    async getFtp() {
      try {
        const res = await getFtpInfo({ id: this.id });
        this.ftpInfo = res.data.data;
        this.passHidenCode = "";
        const length =
          this.ftpInfo.password.length >= 6 ? 6 : this.ftpInfo.password.length;
        for (let i = 0; i < length; i++) {
          this.passHidenCode += "*";
        }
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    // 域名列表
    async getDomain() {
      try {
        this.tableLoading = true;
        const res = await getDomainList({ id: this.id });
        this.domainList = res.data.data.list;
        this.tableLoading = false;
      } catch (error) {
        this.tableLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    baseDgClose() {
      this.baseDialog = false;
      this.safeDialog = false;
      clearInterval(this.timer);
      this.comForm.domains = [];
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
    /* 日志 */
    async getLogList() {
      try {
        this.logLoading = true;
        const params = {
          ...this.logParams,
          id: this.id,
        };
        const res = await getLog(params);
        this.logParams.total = res.data.data.count;
        this.logDataList = res.data.data.list;
        this.logLoading = false;
      } catch (error) {
        this.logLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    logSizeChange(e) {
      this.logParams.limit = e;
      this.logParams.page = 1;
      // 获取列表
      this.getLogList();
    },
    logCurrentChange(e) {
      this.logParams.page = e;
      this.getLogList();
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
          // this.cloudCobaseFuncnfig = res.data.data.config;
          // this.connected_resource = [];
          // if (this.cloudData.rel_host.id) {
          //   this.connected_resource.push(this.cloudData.rel_host);
          // }
          // this.association_resource = this.cloudData.active_host;
          this.$emit("getclouddetail", this.cloudData);
          this.domain_url = this.cloudData.domain_url;
          // const length =
          //   this.cloudData.password.length >= 6
          //     ? 6
          //     : this.cloudData.password.length;
          // for (let i = 0; i < length; i++) {
          //   this.passHidenCode += "*";
          // }
          // this.resourceLoading = false;
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

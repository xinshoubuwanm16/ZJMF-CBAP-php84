// 验证码通过
function captchaCheckSuccsss(bol, captcha, token) {
  if (bol) {
    // 验证码验证通过
    getData(captcha, token);
    $("#captchaHtml").hide(300);
  }
}
// 取消验证码验证
function captchaCheckCancel() {
  captchaCancel();
}

const template = document.getElementsByClassName("domain_details")[0];

Vue.prototype.lang = Object.assign(window.lang, window.module_lang);
new Vue({
  components: {
    asideMenu,
    topMenu,
    pagination,
    countDownButton,
    captchaDialog,
    payDialog,
  },
  created() {
    this.id = this.getQuery("id");
    const commonData = JSON.parse(localStorage.getItem("common_set_before"));
    document.title = commonData.website_name + "-" + lang.domain_details;
    this.getDomainDetail();
    this.getDomainConfig();
    this.getCommon();
  },
  mounted() {
    window.captchaCancel = this.captchaCancel;
    window.getData = this.getData;
  },
  updated() {
    // // 关闭loading
    // document.getElementById('mainLoading').style.display = 'none'
    // document.getElementsByClassName('domain_details')[0].style.display = 'block'
  },
  destroyed() {},
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(`${lang.placeholder_pre1}${lang.transfer_password}`)
        );
      } else {
        const reg = /^[0-9a-zA-Z]{1,10}$/;
        if (reg.test(value)) {
          callback();
        } else {
          callback(new Error(`${lang.placeholder_pre1}${lang.domain_tip17}`));
        }
      }
    };
    return {
      baseUrl:
        location.origin +
        "/plugins/server/west_domain/template/clientarea/pc/default/",
      initLoading: true,
      id: "",
      downloadUrl: "",
      activeName: "basic", // basic dns
      /* 域名详情 */
      details: {},
      domainConfig: {},
      creditStatus: [
        { value: "0", label: lang.no_upload_picture },
        { value: "1", label: lang.examine_pass },
        { value: "2", label: lang.examining },
        { value: "3", label: lang.examine_reject },
        { value: "4", label: lang.examine_abnormal },
      ],
      authForm: {
        id: "",
        type: "",
        keywords: "",
      },
      tempLoading: false,
      authType: [
        { value: "", label: `${lang.file_all}${lang.finance_label11}` },
        { value: "personal", label: lang.personal },
        { value: "enterprise", label: lang.business },
      ],
      autoRenew: 0,
      commonConfig: {},
      template_id: "",
      authData: [],
      isShowAuth: false,
      agree: false,
      // 域名转移
      isShowTransfer: false,
      tansferForm: {
        id: "",
        domain: "",
        transfer_client: "",
        password: "",
        code: "",
      },
      tranferRules: {
        transfer_client: [
          {
            required: true,
            message: `${lang.placeholder_pre1}${lang.target_concat}`,
            trigger: "blur",
          },
        ],
        password: [{ validator: validatePass, trigger: "blur" }],
        code: [
          {
            required: true,
            message: `${lang.placeholder_pre1}${lang.account_label16}`,
            trigger: "blur",
          },
        ],
      },
      errorText: "",
      isShowCaptcha: false,
      isShowDns: false,
      // 修改DNS
      dnsForm: {
        id: "",
        dns1: "",
        dns2: "",
        other: [],
      },
      dnsType: "1",
      // 自动续费
      isShowRenew: false,
      formRenew: {
        id: "",
        domain: "",
        duration: "",
      },
      durationArr: [],
      renewLoading: false,
      /* 解析记录 */
      optType: "",
      recordParams: {
        pageno: 1,
        limit: 20,
        pageSizes: [20, 50, 100],
        total: 10,
        host_id: "",
        domain: "",
      },
      delType: "", // 删除/ 取消转移  del ,  transfer
      curId: "",
      isShowDel: false,
      calcDelTit: "",
      delName: "",
      submitLoading: false,
      showEdit: false,
      isExpand: false, // 是否展开
      curHoverType: "",
      curItemIndex: "", // 鼠标移动索引
      clickItemIndex: "", // 点击索引
      hoverTip: {},
      recordLoading: false,
      recordList: [],
      analysisForm: {
        // 域名解析表单
        id: "",
        host_id: "",
        domain: "",
        host: "",
        value: "",
        type: "A",
        level: "",
        ttl: "",
        line: "",
      },
      isShowCombin: false,
      ipCombination: {
        ip1: undefined,
        ip2: undefined,
        ip3: undefined,
        ip4: undefined,
      },
      fastArr: [
        { host: "@", type: "A", line: "", value: "", ttl: 900, level: 10 },
        { host: "www", type: "A", line: "", value: "", ttl: 900, level: 10 },
      ],
      isShowFast: false,
      typeSelect: [
        { value: "A", label: "A" },
        { value: "CNAME", label: "CNAME" },
        { value: "MX", label: "MX" },
        { value: "TXT", label: "TXT" },
        { value: "AAAA", label: "AAAA" },
        { value: "SRV", label: "SRV" },
      ],
      lineSelect: [
        { value: "", label: lang.mf_no },
        { value: "LTEL", label: lang.telecom },
        { value: "LCNC", label: lang.unicom },
        { value: "LMOB", label: lang.domain_mobile },
        { value: "LEDU", label: lang.edu },
        { value: "LSEO", label: lang.search_engines },
      ],
      // 提示信息
      hostTip: {
        tit: lang.analysis_tip1,
        list: [
          { option: "www", des: lang.analysis_tip2 },
          { option: "@", des: lang.analysis_tip3 },
          { option: "mail", des: lang.analysis_tip4 },
          { option: "*", des: lang.analysis_tip5 },
        ],
      },
      typeTip: {
        tit: lang.analysis_tip6,
        list: [
          { option: "A", des: lang.analysis_tip7 },
          { option: "CNAME", des: lang.analysis_tip8 },
          { option: "MX", des: lang.analysis_tip9 },
          { option: "TXT", des: lang.analysis_tip10 },
          { option: "AAAA", des: lang.analysis_tip11 },
          { option: "SRV", des: lang.analysis_tip12 },
        ],
      },
      lineTip: {
        tit: lang.analysis_tip13,
        list: [
          { option: lang.mf_no, des: lang.analysis_tip14 },
          { option: lang.unicom, des: lang.analysis_tip15 },
          { option: lang.search_engines, des: lang.analysis_tip16 },
        ],
      },
      valueTip: {
        tit: lang.analysis_tip17,
        list: [
          { option: "", tag: "A", des: lang.analysis_tip18 },
          { option: "", tag: "CNAME", des: lang.analysis_tip19 },
          { option: "", tag: "MX", des: lang.analysis_tip20 },
          { option: "", tag: "TXT", des: lang.analysis_tip21 },
          { option: "", tag: "AAAA", des: lang.analysis_tip22 },
          { option: "", tag: "SRV", des: lang.analysis_tip23 },
        ],
      },
      levelTip: {
        tit: lang.analysis_tip24,
        list: [
          { option: 5, des: lang.analysis_tip26 },
          { option: 10, des: lang.analysis_tip25 },
        ],
      },
      ttlTip: {
        tit: lang.analysis_tip27,
        list: [
          { option: 900, des: lang.analysis_tip28 },
          { option: 3600, des: lang.analysis_tip29 },
          { option: 60, des: lang.analysis_tip30 },
        ],
      },
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
  },
  computed: {
    calcStatus() {
      return (status) => {
        return this.creditStatus.filter((item) => item.value === status)[0]
          ?.label;
      };
    },
    calcTip() {
      return this.valueTip.list.filter(
        (item) => item.tag === this.recordList[this.curItemIndex].type
      )[0]?.des;
    },
    calcLine() {
      return (line) => {
        return this.lineSelect.filter((item) => item.value === line)[0]?.label;
      };
    },
  },
  watch: {
    ipCombination: {
      deep: true,
      handler(val) {
        this.isShowCombin = Object.keys(val).every(
          (item) => val[item] !== "" && val[item] >= 0 && val[item] <= 255
        );
        let value = "";
        if (val.ip1 === undefined) {
          value = "";
        } else {
          value = `${val.ip1}.${val.ip2}.${val.ip3}.${val.ip4}`;
        }
        this.fastArr = this.fastArr.map((item) => {
          item.value = value;
          return item;
        });
      },
    },
  },
  methods: {
    paySuccess() {
      this.getDomainDetail();
    },
    payCancel(e) {},
    async getCommon() {
      try {
        const res = await getCommonConfig();
        this.commonConfig = res.data.data;
      } catch (error) {}
    },
    async getAutoRenew() {
      try {
        const res = await getAutoRenewStatus({ id: this.id });
        this.autoRenew = res.data.data.status;
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    async handlerAutoRenew(e) {
      try {
        const res = await autoRenewDomain({
          id: this.id,
          status: e,
        });
        this.$message.success(res.data.msg);
        this.getDomainDetail();
      } catch (error) {
        this.details.auto_renew = e ? 0 : 1;
        this.$message.error(error.data.msg);
      }
    },
    // 修改域名配置开关
    async changeConfig(e, type) {
      try {
        if (type === "auto_renew") {
          return this.handlerAutoRenew(e);
        }
        const params = {
          id: this.id,
          lock_status: this.details.lock_status,
          expiration_reminder: this.details.expiration_reminder,
          auto_renew: this.details.auto_renew,
        };
        Object.assign(params, { [type]: e });
        const res = await changeDomainConfig(params);
        this.$message.success(res.data.msg);
        this.getDomainDetail();
      } catch (error) {
        this.details[type] = e ? 0 : 1;
        this.$message.error(error.data.msg);
      }
    },
    renewClose() {
      this.isShowRenew = false;
    },
    // 手动续费
    async handlerRenew() {
      try {
        this.renewLoading = true;
        const res = await getRenewInfo({
          id: this.id,
        });
        const totalDay = 365 * 10;
        const endDay = this.details.expireday;
        this.durationArr = res.data.data.host.map((item) => {
          item.label = item.billing_cycle;
          item.value = item.billing_cycle;
          item.disabled = item.billing_cycle * 365 + endDay > totalDay;
          return item;
        });
        this.isShowRenew = true;
        this.renewLoading = false;
      } catch (error) {
        console.log("@@@@", error);
      }
    },
    submitRenew() {
      this.$refs.formRenew.validate(async (valid) => {
        if (valid) {
          try {
            const params = {
              id: this.id,
              billing_cycle: this.formRenew.duration,
              customfield: {},
            };
            this.submitLoading = true;
            const res = await saveRenew(params);
            this.isShowRenew = false;
            this.submitLoading = false;
            this.orderId = res.data.data.id;
            // 打开支付弹窗
            const orderId = res.data.data.id;
            const amount = this.durationArr.filter(
              (item) => item.billing_cycle === this.curId
            )[0]?.renew_amount;
            this.$refs.topPayDialog.showPayDialog(orderId, amount);
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
    // 下载域名证书
    async downDomainPdf() {
      try {
        const res = await downDomain({
          id: this.id,
        });
        // const str = res.data.data.html
        // const decodedString = atob(str)
        // const textDecoder = new TextDecoder('utf-8')
        // const decodedText = textDecoder.decode(new Uint8Array([...decodedString].map(c => c.charCodeAt(0))))
        // this.downloadUrl = decodedText
        //   .replaceAll('src="/js2016/lib', `src="${this.baseUrl}js`)
        //   .replace('loadding = showLoading();', '')
        //   .replace('/newimages/Manager', '/images2016/manager/domaincert')
        //   .replace('<script src="/jquery/jquery-1.11.3.min.js"></script>', '')
        //   .replace('<script type="text/javascript" src="/jquery/plugin/lhgdialognew.min.js?skin=west&self=true"></script>', '')
        // $('#pdf').html(this.downloadUrl)
        // setTimeout(() => {
        //   $(document).scrollTop(0)
        //   html2canvas(document.getElementById("J_cerContent")).then(function (canvas) {
        //     document.getElementById('J_tmpContainer').appendChild(canvas)
        //     document.getElementById('J_tmpContainer').appendChild(convertCanvasToImage(canvas))
        //     cerCanvas = canvas
        //   })
        //   setTimeout(() => {
        //     downloadCer1()
        //   }, 0)
        // }, 500)
        const downloadUrl = res.data.data.certurl;
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = downloadUrl;
        a.download = this.details.domain;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.append(a);
        a.click();
        setTimeout(() => {
          a.remove();
        }, 1000);
      } catch (error) {
        console.log("error", error);
        this.$message.error(error.data.msg);
      }
    },
    // 重新认证
    handlerAuth() {
      this.isShowAuth = true;
      this.authForm = {
        id: this.id,
        type: "",
        keywords: "",
      };
      this.template_id = "";
      this.getAuthList();
    },
    async getAuthList() {
      try {
        this.tempLoading = true;
        const res = await getSupportTemplate(this.authForm);
        this.authData = res.data.data.list;
        this.template_id = "";
        this.tempLoading = false;
      } catch (error) {
        this.tempLoading = false;
      }
    },
    async submitAuth() {
      try {
        if (!this.template_id) {
          return this.$message.error(
            `${lang.placeholder_pre2}${lang.domain_template}`
          );
        }
        if (!this.agree) {
          return this.$message.error(
            `${lang.domain_check}${lang.domain_tip16}`
          );
        }
        this.submitLoading = true;
        const res = await recertificationDomain({
          id: this.id,
          template_id: this.template_id,
        });
        this.$message.success(res.data.msg);
        this.isShowAuth = false;
        this.submitLoading = false;
        this.getDomainDetail();
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    // 账户间转移
    handlerTranfer() {
      this.isShowTransfer = true;
      this.tansferForm = {
        id: this.id,
        domain: this.details.domain,
        transfer_client: "",
        password: "",
        code: "",
      };
    },
    cancleTranfer() {
      this.delType = "transfer";
      this.isShowDel = true;
      this.calcDelTit = `${lang.referral_btn6}${lang.cancle_transfer}？`;
    },
    randomPassword() {
      this.tansferForm.password = genEnCode(9, 1, 1, 0, 1, 0);
    },
    sendPhoneCode() {
      // 点击发送验证码
      this.$refs.tansferForm.validateField(
        "transfer_client",
        (errorMessage) => {
          if (errorMessage) {
            return;
          } else {
            this.isShowCaptcha = true;
            this.$refs.captcha.doGetCaptcha();
          }
        }
      );
    },
    async getData(captchaCode, token) {
      try {
        // 验证成功，发送验证码
        const res = await sendTranferCode({
          id: this.id,
          token,
          captcha: captchaCode,
        });
        // 进入倒计时
        this.$refs.phoneCodebtn.countDown();
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    captchaCancel() {
      this.isShowCaptcha = false;
    },
    submitTranfer() {
      this.$refs.tansferForm.validate(async (valid) => {
        if (valid) {
          try {
            const res = await submitTranfer(this.tansferForm);
            this.$message.success(res.data.msg);
            this.isShowTransfer = false;
            this.getDomainDetail();
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    async getDomainConfig() {
      try {
        const res = await getDomainConfig();
        this.domainConfig = res.data.data;
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    // 修改DNS服务器
    changeDns() {
      this.isShowDns = true;
      this.dnsType = "1";
      const other =
        this.details.dns_host_ext.split(",").filter((item) => item) || [];
      this.dnsForm = {
        id: this.id,
        dns1: this.details.dns_host1,
        dns2: this.details.dns_host2,
        other,
      };
    },
    handelAddParse() {
      this.activeName = "dns";
      this.addRecord();
    },
    addDns() {
      this.dnsForm.other.push(null);
    },
    subDns(index) {
      this.dnsForm.other.splice(index, 1);
    },
    submitDns() {
      this.$refs.dnsForm.validate(async (valid) => {
        if (valid) {
          try {
            this.submitLoading = true;
            const params = JSON.parse(JSON.stringify(this.dnsForm));
            params.other = params.other.filter((item) => item);
            params.other.forEach((item, index) => {
              params[`dns${index + 3}`] = item;
            });
            delete params.other;
            const res = await changeDnsServer(params);
            this.$message.success(res.data.msg);
            this.isShowDns = false;
            this.getDomainDetail();
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
    // 域名详情
    async getDomainDetail() {
      try {
        const res = await getDomainDetails({ id: this.id });
        this.details = res.data.data.domain;
        this.recordParams.host_id = this.details.id;
        this.recordParams.domain = this.details.domain;
        this.initLoading = false;
        this.getAutoRenew();
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    handleClick() {
      if (this.activeName === "basic") {
        this.getDomainDetail();
      } else {
        this.getRecordList();
      }
    },
    /* 解析记录 */
    addRecord() {
      this.optType = "add";
      this.recordList.forEach((item) => {
        item.edit = false;
        this.$refs.recordTale.toggleRowExpansion(item, false);
      });
      this.isExpand = false;
      if (this.recordList.length > 0 && !this.recordList[0].id) {
        return (this.recordList[0].edit = true);
      }
      this.recordList.unshift({
        id: "",
        item: "",
        value: "",
        type: "A",
        level: 10,
        ttl: 900,
        line: "",
        pause: 1,
        edit: true,
      });
    },
    updateItem(row, index) {
      // 如果先过滤 会导致索引错误，从而导致不能保留之前的数据
      const temp = JSON.parse(JSON.stringify(this.recordList));
      this.recordList = this.recordList.filter((item) => item.id);
      if (temp.length !== this.recordList.length) {
        index = index - 1;
      }
      if (this.clickItemIndex !== index && this.analysisForm.id) {
        this.recordList.splice(this.clickItemIndex, 1, this.analysisForm);
      }
      this.analysisForm = JSON.parse(JSON.stringify(row));
      this.clickItemIndex = index;
      this.optType = "update";
      this.recordList = this.recordList
        .filter((item) => item.id)
        .map((item) => {
          if (item.id === row.id) {
            item.edit = true;
          } else {
            item.edit = false;
          }
          this.$refs.recordTale.toggleRowExpansion(item, false);
          return item;
        });
      this.isExpand = false;
    },
    changeStatus(row) {},
    noteItem(row) {},
    deleteItem(row) {
      this.isShowDel = true;
      this.delType = "del";
      this.curId = row.id;
      this.calcDelTit = lang.domain_tip8;
    },
    // 快速解析
    fastParse() {
      this.isShowFast = true;
      this.ipCombination = {
        ip1: undefined,
        ip2: undefined,
        ip3: undefined,
        ip4: undefined,
      };
    },
    submitBatch() {
      try {
        if (
          !this.fastArr[0].value ||
          this.fastArr[0].value.includes("undefined")
        ) {
          return this.$message.error(`${lang.placeholder_pre1}${lang.host_ip}`);
        }
        this.submitLoading = true;
        let tempAll = [];
        let temp = JSON.parse(JSON.stringify(this.fastArr));
        temp = temp.map((item) => {
          item.host_id = this.id;
          item.domain = this.details.domain;
          return item;
        });
        temp.forEach((item) => {
          tempAll.push(addAndUpdateDnsRecord("add", item));
        });
        Promise.all(tempAll)
          .then((res) => {
            setTimeout(() => {
              this.submitLoading = false;
              this.isShowFast = false;
              this.getRecordList();
              this.$message.success(lang.fast_add_success);
            }, 1000);
          })
          .catch((err) => {
            this.submitLoading = false;
            this.$message.error(err.data.msg);
          });
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    // 新增/ 修改 域名解析
    async saveRecord(row) {
      try {
        const params = JSON.parse(JSON.stringify(row));
        params.host = params.item;
        if (!params.host) {
          return this.$message.error(
            `${lang.placeholder_pre1}${lang.host_record}`
          );
        }
        if (!params.value) {
          return this.$message.error(
            `${lang.placeholder_pre1}${lang.record_value}`
          );
        }
        if (this.optType === "add") {
          delete params.id;
        }
        params.host_id = this.id;
        delete params.item;
        this.submitLoading = true;
        const res = await addAndUpdateDnsRecord(this.optType, params);
        this.$message.success(res.data.msg);
        this.submitLoading = false;
        this.getRecordList();
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    handlerDelete() {
      if (this.delType === "del") {
        this.delSub();
      } else if (this.delType === "transfer") {
        this.cancleTranferDomain();
      }
    },
    async cancleTranferDomain() {
      try {
        this.submitLoading = true;
        const res = await cancleTranfer({
          id: this.id,
        });
        this.$message.success(res.data.msg);
        this.isShowDel = false;
        this.submitLoading = false;
        this.getDomainDetail();
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    // 删除
    async delSub() {
      try {
        this.submitLoading = true;
        const res = await deleteDnsRecord({
          id: this.curId,
          host_id: this.id,
          domain: this.details.domain,
        });
        this.$message.success(res.data.msg);
        this.isShowDel = false;
        this.submitLoading = false;
        this.getRecordList();
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    cancleEidt(row, index) {
      if (!row.id) {
        return this.recordList.shift();
      }
      this.recordList.splice(index, 1, this.analysisForm);
      row.edit = false;
      this.$refs.recordTale.toggleRowExpansion(row, false);
      this.isExpand = false;
    },
    toggleMore(row) {
      // 展开说明
      this.$refs.recordTale.toggleRowExpansion(row);
      this.hoverTip = this.hostTip;
      this.isExpand = !this.isExpand;
    },
    hoverItem(index, type) {
      this.hoverTip = this[`${type}Tip`];
      this.curHoverType = type;
      this.curItemIndex = index;
      this.showEdit = true;
    },
    mouseLeave() {
      this.showEdit = false;
    },
    // 解析记录
    async getRecordList() {
      try {
        this.recordLoading = true;
        const res = await getDnsRecord(this.recordParams);
        this.recordList = res.data.data.items.map((item) => {
          item.edit = false;
          return item;
        });
        this.recordParams.total = res.data.data.total;
        this.recordLoading = false;
      } catch (error) {
        this.recordLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    sizeChange(e) {
      this.recordParams.limit = e;
      this.recordParams.page = 1;
      this.getRecordList();
    },
    // 当前页改变
    currentChange(e) {
      this.recordParams.page = e;
      this.getRecordList();
    },
    back() {
      history.go(-1);
    },
    getQuery(name) {
      const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      const r = window.location.search.substr(1).match(reg);
      if (r != null) return decodeURI(r[2]);
      return null;
    },
  },
}).$mount(template);
typeof old_onload == "function" && old_onload();

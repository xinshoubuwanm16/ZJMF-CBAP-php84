(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementById("domain");
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);

    new Vue({
      components: {
        asideMenu,
        topMenu,
        pagination,
        countDownButton,
        payDialog,
      },

      updated() {
        // // 关闭loading
        // document.getElementById('mainLoading').style.display = 'none'
        // document.getElementsByClassName('template')[0].style.display = 'block'
      },
      destroyed() {},
      filters: {},
      data() {
        return {
          activeName: "list", // list template verify
          isShowDel: false,
          calcDelTit: "", // 删除标题
          delName: "",
          submitLoading: false,
          jwt: `Bearer ${localStorage.jwt}`,
          curId: "",
          /* domain_list start */
          listParams: {
            page: 1,
            limit: 20,
            pageSizes: [20, 50, 100],
            total: 0,
            orderby: "id",
            sort: "desc",
            keywords: "",
            time: "",
          },
          listLoading: false,
          domainList: [],
          creditStatus: [
            { value: "0", label: lang.no_upload_picture },
            { value: "1", label: lang.examine_pass },
            { value: "2", label: lang.examining },
            { value: "3", label: lang.examine_reject },
            { value: "4", label: lang.examine_abnormal },
          ],
          selectIdTypeOption: [
            { label: lang.id_type_SFZ, value: "SFZ" },
            { label: lang.id_type_HZ, value: "HZ" },
            { label: lang.id_type_GAJMTX, value: "GAJMTX" },
            { label: lang.id_type_TWJMTX, value: "TWJMTX" },
            { label: lang.id_type_WJLSFZ, value: "WJLSFZ" },
            { label: lang.id_type_GAJZZ, value: "GAJZZ" },
          ],
          isShowRenew: false,
          formRenew: {
            id: "",
            domain: "",
            duration: "",
          },
          durationArr: [],
          isShowTransfer: false,
          curIndex: 1,
          domain_total: 0,
          transferDomain: [],
          transferForm: {
            id: "",
            password: "",
          },
          /* domain_list end */

          /* domain_template start */
          infoParams: {
            page: 1,
            limit: 20,
            pageSizes: [20, 50, 100],
            total: 0,
            orderby: "id",
            sort: "desc",
            keywords: "",
          },
          templateList: [],
          isShowTemp: false,
          isShowReal: false,
          image_url: "",
          infoDetails: {},
          formReal: {
            id: "",
            img: "",
            idtype: "",
            idnum: "",
            img2: "",
            idtype2: "",
            idnum2: "",
          },
          /* domain_template end */
          /* verify start */
          verifyType: "", // phone email
          isShowPhone: false,
          phoneData: {},
          rePhoneData: {
            countryCode: 86,
            phone: "",
          },
          countryList: [],
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
        calcIDtype() {
          return (type) => {
            return lang[`id_type_${type}`];
          };
        },
        calcCountry() {
          return (name) => {
            return this.countryList.filter((item) => item.iso === name)[0]
              ?.name_zh;
          };
        },
        calcRealWidth() {
          return localStorage.getItem("lang") === "zh-cn" ? "6.8rem" : "8rem";
        },
      },
      mounted() {},
      created() {
        for (let i = 1; i <= 9; i++) {
          this.durationArr.push({
            value: i,
            label: `${i}`,
          });
        }
        this.getCountry();
        this.getCommonData();
        this.getTransferList();
        this.getDomainList();
      },
      methods: {
        paySuccess() {
          this.getDomainList();
        },
        payCancel(e) {},
        /* domain_list start */
        searchDomain() {
          this.listParams.page = 1;
          this.getDomainList();
        },
        async getTransferList() {
          try {
            const res = await getTransferDomain();
            this.transferDomain = res.data.data.list;
            this.domain_total = this.transferDomain.length;
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        async getDomainList() {
          try {
            this.listLoading = true;
            const params = JSON.parse(JSON.stringify(this.listParams));
            if (params.time && params.time.length > 0) {
              params.start_time = new Date(params.time[0]).getTime() / 1000;
              params.end_time =
                new Date(params.time[1]).getTime() / 1000 + 24 * 3600 - 1;
            } else {
              params.start_time = params.end_time = "";
            }
            delete params.time;
            const res = await getDomain(params);
            this.domainList = res.data.data.list;
            this.listParams.total = res.data.data.count;
            this.listLoading = false;
          } catch (error) {
            this.listLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        handlerAccept() {
          this.$refs.transferForm.validate(async (valid) => {
            if (valid) {
              try {
                this.submitLoading = true;
                const params = {
                  id: this.transferDomain[this.curIndex - 1].id,
                  password: this.transferForm.password,
                };
                const res = await acceptTransferDomain(params);
                this.$message.success(res.data.msg);
                this.isShowTransfer = false;
                this.submitLoading = false;
                this.getDomainList();
                this.getTransferList();
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
        goDetails(row) {
          location.href = `/productdetail.htm?id=${row.id}`;
        },
        async renewItem(row) {
          // 续费按钮
          try {
            this.curId = row.id;
            this.formRenew.domain = row.domain;
            const res = await getRenewInfo({
              id: row.id,
            });
            const totalDay = 365 * 10;
            const endDay = row.expireday;
            this.durationArr = res.data.data.host.map((item) => {
              item.label = item.billing_cycle;
              item.value = item.billing_cycle;
              item.disabled = item.billing_cycle * 365 + endDay > totalDay;
              return item;
            });
            this.isShowRenew = true;
          } catch (error) {}
        },
        renewClose() {
          this.isShowRenew = false;
        },
        handlerRenew() {
          // 提交续费
          this.$refs.formRenew.validate(async (valid) => {
            if (valid) {
              try {
                const params = {
                  id: this.curId,
                  billing_cycle: this.formRenew.duration,
                  customfield: {},
                };
                this.submitLoading = true;
                const res = await saveRenew(params);
                this.isShowRenew = false;
                this.submitLoading = false;
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
        sizeChange(e) {
          this.listParams.limit = e;
          this.listParams.page = 1;
          this.getDomainList();
        },
        // 当前页改变
        currentChange(e) {
          this.listParams.page = e;
          this.getDomainList();
        },
        acceptDomain() {
          this.isShowTransfer = true;
          this.$nextTick(() => {
            this.$refs.transferCarousel.setActiveItem(0);
            this.curIndex = 1;
            this.$refs.transferForm && this.$refs.transferForm.clearValidate();
          });
        },
        handlerPrev() {
          this.$refs.transferCarousel.prev();
          setTimeout(() => {
            this.curIndex = this.$refs.transferCarousel.activeIndex + 1;
          }, 0);
          this.$refs.transferForm.clearValidate();
        },
        handlerNext() {
          this.$refs.transferCarousel.next();
          setTimeout(() => {
            this.curIndex = this.$refs.transferCarousel.activeIndex + 1;
          }, 0);
          this.$refs.transferForm.clearValidate();
        },
        /* domain_list end */

        /* template start */
        searchTemplate() {
          this.infoParams.page = 1;
          this.getTemplateList();
        },
        createTemplate() {
          location.href = "creatTemplate.htm";
        },
        lookItem(row) {
          // 查看详情
          this.curId = row.id;
          this.isShowTemp = true;
          this.getInfoDetails();
        },
        delItem(row) {
          this.curId = row.id;
          this.isShowDel = true;
          this.calcDelTit = `${lang.delete_template}？`;
        },
        handlerReal(row) {
          this.curId = row.id;
          this.getInfoDetails();
          setTimeout(() => {
            this.isShowReal = true;
          }, 0);
        },
        handleCardSuccess(e) {
          this.formReal.img = "";
          this.formReal.img = e.data.image_url;
        },
        handleCardSuccess2(e) {
          this.formReal.img2 = "";
          this.formReal.img2 = e.data.image_url;
        },
        submitReal() {
          // 提交实名认证
          this.$refs.formReal.validate(async (valid) => {
            if (valid) {
              try {
                const params = JSON.parse(JSON.stringify(this.formReal));
                delete params.idtype;
                delete params.idnum;
                params.img = params.img.split("/upload/common/default/")[1];
                if (this.infoDetails.type === "enterprise") {
                  params.img2 = params.img2.split("/upload/common/default/")[1];
                }
                this.submitLoading = true;
                const res = await infoTemplateAuth(params);
                this.$message.success(res.data.msg);
                this.submitLoading = false;
                this.isShowReal = false;
                this.getTemplateList();
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
        async getTemplateList() {
          try {
            this.listLoading = true;
            const res = await getInfoTemplate(this.infoParams);
            this.templateList = res.data.data.list;
            this.infoParams.total = res.data.data.count;
            this.listLoading = false;
          } catch (error) {
            this.listLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        async getInfoDetails() {
          try {
            const res = await getInfoTemplateDetails({ id: this.curId });
            this.infoDetails = res.data.data.info_template;
            this.formReal = {
              id: this.infoDetails.id,
              img: this.infoDetails.img,
              img2: this.infoDetails.img2,
              idtype: this.infoDetails.idtype,
              idnum: this.infoDetails.idnum,
              idtype2: this.infoDetails.idtype2,
              idnum2: this.infoDetails.idnum2,
            };
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        /* template end */

        doPhoneEdit() {},
        sendPhoneCode() {
          console.log(1111);
          this.$refs.verifyForm.validateField("phone", (errorMessage) => {
            if (errorMessage) {
              return;
            } else {
              this.$message.success("验证通过");
            }
          });
          // 验证原手机 验证码按钮 执行倒计时
          // this.$refs.phoneCodebtn.countDown()
        },
        /* common */
        // 获取国家列表
        getCountry() {
          getCountry().then((res) => {
            if (res.data.status === 200) {
              this.countryList = res.data.data.list;
              this.rePhoneData.countryCode = 86;
            }
          });
        },
        delClose() {
          this.isShowDel = false;
        },
        delSub() {
          if (this.activeName === "template") {
            // 删除模板
            this.deleteTemplate();
          } else if (this.activeName === "verify") {
            // 删除手机/邮箱验证
            this.deleteVerify();
          }
        },
        async deleteTemplate() {
          try {
            this.submitLoading = true;
            const res = await deleteInfoTemplate({ id: this.curId });
            this.$message.success(res.data.msg);
            this.isShowDel = false;
            this.submitLoading = false;
            this.getTemplateList();
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        async deleteVerify() {
          try {
            const res = await delVerify();
          } catch (error) {}
        },
        handleClick() {
          switch (this.activeName) {
            case "list":
              this.getTransferList();
              this.getDomainList();
            case "template":
              this.getTemplateList();
          }
        },
        // 获取通用配置
        getCommonData() {
          this.commonData = JSON.parse(
            localStorage.getItem("common_set_before")
          );
          document.title =
            this.commonData.website_name + "-" + lang.domain_manage;
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

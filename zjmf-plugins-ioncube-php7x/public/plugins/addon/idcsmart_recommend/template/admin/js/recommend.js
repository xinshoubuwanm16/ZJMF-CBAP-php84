(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("recommend")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = window.moment;
    const host = location.origin;
    const fir = location.pathname.split("/")[1];
    new Vue({
      components: {
        comConfig,
        comTreeSelect,
        comChooseUser,
      },
      data() {
        return {
          baseURL: url,
          data: [],
          tableLayout: false,
          bordered: true,
          visible: false,
          delVisible: false,
          statusVisble: false,
          hover: true,
          baseUrl: `${host}/${fir}/`,
          columns: [
            {
              colKey: "promoter",
              title: lang.promoter,
              width: 150,
              className: "code-item",
              ellipsis: true,
            },
            {
              colKey: "username",
              title: lang.recommend_user,
              className: "code-item",
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "product_name",
              title: lang.product_name,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "type",
              title: lang.recommend_text8,
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "buy_amount",
              title: lang.purchase_amount,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "ratio",
              title: lang.reward_proportion,
              width: 100,
            },
            {
              colKey: "awards_amount",
              title: lang.reward_money,
              width: 140,
            },
            {
              colKey: "surplus_time",
              title: lang.surplus_time,
              width: 100,
            },
            {
              colKey: "status",
              title: lang.current_state,
              width: 120,
            },
            {
              colKey: "op",
              title: lang.operation,
              width: 120,
            },
          ],
          hideSortTips: true,
          params: {
            client_id: "",
            product_id: "",

            status: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
          },
          curLevelId: "",
          total: 0,
          pageSizeOptions: [20, 50, 100],
          formData: {
            // 无效推介
            id: "",
            invalid_reason: "",
            custom_reason: "",
          },
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          rules: {
            invalid_reason: [
              {
                required: true,
                message: `${lang.select}${lang.invalid_reason}`,
                type: "error",
              },
            ],
            custom_reason: [
              {
                required: true,
                message: `${lang.input}${lang.invalid_reason}`,
                type: "error",
              },
            ],
          },
          replayRules: {
            content: [
              {
                required: true,
                message: `${lang.input}${lang.reply_content}`,
                type: "error",
              },
            ],
          },
          loading: false,
          delId: "",
          curStatus: 1,
          statusTip: "",
          maxHeight: "",
          /* 用户等级 */
          levelList: [],
          hasPlugin: false,
          authList: JSON.parse(
            JSON.stringify(localStorage.getItem("backAuth"))
          ),
          optType: "", // 操作类型 frozen,unfrozen,delete
          optTitle: "",
          recommendVisible: false,
          submitLoading: false,
          replayDialog: false,
          replayLoading: false,
          replayList: [], // 预设回复列表
          replayColumns: [
            {
              colKey: "content",
              title: lang.reply_content,
              ellipsis: true,
            },
            {
              colKey: "op",
              title: lang.operation,
              width: 120,
            },
          ],
          replayParams: {
            content: "",
          },
          replayOpt: "", // add , update
          userList: [], // 用户列表
          statusList: [
            {
              value: "Pending",
              label: lang.confirming,
            },
            {
              value: "Active",
              label: lang.confirmed,
            },
            {
              value: "Invalid",
              label: lang.invalid_promotion,
            },
            {
              value: "Frozen",
              label: lang.frozen,
            },
          ],
          /* 初始化三级数据 */
          shopList: [],
          firstGroup: [],
          tempSecondGroup: [],
          productList: [], // 商品可选列表
          groupList: [], // 一二级分组组装数据
          visibleTreeObj: [
            {
              visibleTree: false,
            },
          ],
        };
      },
      computed: {
        filterColor() {
          return (level) => {
            if (level) {
              return this.levelList.filter(
                (item) => item.id * 1 === level[0]?.value * 1
              )[0]?.background_color;
            }
          };
        },
        filterName() {
          return (level) => {
            if (level) {
              return (
                this.levelList.filter(
                  (item) => item.id * 1 === level[0]?.value * 1
                )[0]?.name || ""
              );
            }
          };
        },
      },
      mounted() {
        // this.maxHeight = document.getElementById('content').clientHeight - 220
        // let timer = null
        // window.onresize = () => {
        //   if (timer) {
        //     return
        //   }
        //   timer = setTimeout(() => {
        //     this.maxHeight = document.getElementById('content').clientHeight - 220
        //     clearTimeout(timer)
        //     timer = null
        //   }, 300)
        // }
        /*  document.onclick = (e) => {
          const className = e.path[5].getAttribute("class")
          if (className === 't-popup' || className === 't-popup__content') {
            return
          }
          this.visibleTreeObj.forEach(item => {
            item && (item.visibleTree = false)
          })
        } */
        document.addEventListener("click", () => {
          this.visibleTreeObj.forEach((item) => {
            item.visibleTree = false;
          });
        });
      },
      created() {
        this.getRecommendList();
        this.getPrereplyList();
      },
      computed: {
        calcTime() {
          // 计算时间
          return (time) => {
            return this.calculateDiffTime(time * 1000);
          };
        },
      },
      filters: {
        formatSecondsToMin(second) {
          if (!second) {
            return "--";
          }
          const days = Math.floor(second / 86400);
          const hours = Math.floor((second % 86400) / 3600);
          const minutes = Math.floor(((second % 86400) % 3600) / 60);
          const seconds = Math.floor(((second % 86400) % 3600) % 60);
          // 格式化时间 输出大于0的值
          return `${days > 0 ? `${days}${lang.day}` : ""}${
            hours > 0 ? `${hours}${lang.promo_hour}` : ""
          }${minutes > 0 ? `${minutes}${lang.minutes}` : ""}`;
        },
      },
      methods: {
        choosePro(val) {
          this.params.product_id = val;
        },
        changeUser(val) {
          this.params.client_id = val;
        },
        clearId() {
          this.params.product_id = "";
        },
        jumpUser(id) {
          location.href = `${this.baseUrl}client_detail.htm?client_id=${id}`;
        },
        jumpProduct(id, upstream) {
          if (upstream === 1) {
            location.href = `${this.baseUrl}upstream_goods.htm?id=${id}`;
          } else {
            location.href = `${this.baseUrl}product_detail.htm?id=${id}`;
          }
        },
        // 获取预设回复
        async getPrereplyList() {
          try {
            this.replayList = [];
            this.replayLoading = true;
            const res = await getPrereply();
            const temp = res.data.data.list;
            this.replayList = temp;
            this.replayLoading = false;
          } catch (error) {}
        },
        // 预设无效回复
        presets() {
          this.replayOpt = "add";
          this.replayParams.content = "";
          this.replayDialog = true;
        },
        eidtReplay(row) {
          this.replayParams = JSON.parse(JSON.stringify(row));
          this.replayOpt = "update";
        },
        async replaySubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              const params = JSON.parse(JSON.stringify(this.replayParams));
              if (this.replayOpt === "add") {
                delete params.id;
              }
              if (!params.content.trim()) {
                return this.$message.warning(lang.input + lang.reply_content);
              }
              this.submitLoading = true;
              const res = await addAndUpdatePrereply(this.replayOpt, params);
              if (this.replayOpt === "add") {
                this.$message.success(lang.create + lang.success);
              } else {
                this.$message.success(lang.edit + lang.success);
              }
              this.replayParams.content = "";
              this.replayOpt = "add";
              this.getPrereplyList();
              this.submitLoading = false;
            } catch (error) {
              this.$message.error(error.data.msg);
              this.submitLoading = false;
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },
        // 无效推介
        invalidOpt(row) {
          this.recommendVisible = true;
          this.formData = { ...row };
        },
        async invaliSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              const params = {
                id: this.formData.id,
                invalid_reason:
                  this.formData.invalid_reason === 0
                    ? this.formData.custom_reason
                    : this.replayList.filter(
                        (item) => item.id === this.formData.invalid_reason
                      )[0]?.content,
              };
              this.submitLoading = true;
              const res = await sureInvalid(params);
              this.submitLoading = false;
              this.$message.success(lang.hold + lang.success);
              this.submitLoading = false;
              this.recommendVisible = false;
              this.getRecommendList();
            } catch (error) {
              this.submitLoading = false;
              this.$message.error(error.data.msg);
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },
        calculateDiffTime(diff) {
          // 天
          var days = Math.floor(diff / (24 * 3600 * 1000));
          // 小时
          var leave1 = diff % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
          var hours = Math.floor(leave1 / (3600 * 1000));
          // 分钟
          var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
          var minutes = Math.floor(leave2 / (60 * 1000));
          return (
            days + lang.day + hours + lang.promo_hour + minutes + lang.minutes
          );
        },
        // 获取列表
        async getRecommendList(params = this.params) {
          try {
            this.loading = true;
            const res = await getRecommend(params);
            this.loading = false;
            let temp = res.data.data.list;
            temp = temp.map((item) => {
              item.isEdit = false;
              item.awards_amount = item.awards_amount * 1;
              return item;
            });
            this.data = temp;
            this.total = res.data.data.count;
          } catch (error) {
            this.loading = false;
            this.$message.error(error.data.msg);
          }
        },
        async saveItem(row) {
          try {
            const res = await changeMoney({
              id: row.id,
              awards_amount: row.awards_amount,
            });
            this.$message.success(lang.edit + lang.success);
            this.getRecommendList();
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        eidtItem(row) {
          row.isEdit = true;
        },
        filterTable(row) {
          const params = {
            client_id: "",
            product_id: "",
            host_id: row.host_id,
            status: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
          };
          this.getRecommendList(params);
        },
        // 切换分页
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.params.keywords = "";
          this.getRecommendList();
        },
        // 排序
        sortChange(val) {
          if (!val) {
            this.params.orderby = "id";
            this.params.sort = "desc";
          } else {
            this.params.orderby = val.sortBy;
            this.params.sort = val.descending ? "desc" : "asc";
          }
          this.getRecommendList();
        },
        clearKey() {
          this.params.keywords = "";
          this.seacrh();
        },
        seacrh() {
          this.params.page = 1;
          this.getRecommendList();
        },
        close() {
          this.visible = false;
          this.$refs.userDialog.reset();
        },
        // 统一二次确认弹窗
        optItem(row, type) {
          this.optType = type;
          this.delId = row.id;
          this.delVisible = true;
          switch (type) {
            case "sure":
              return (this.optTitle = lang.confirm + lang.confirm_now + "?");
            case "delete":
            case "deleteReplay":
              return (this.optTitle = lang.sureDelete);
            case "frozen":
              return (this.optTitle = lang.confirm + lang.frozen + "?");
            case "unfrozen":
              return (this.optTitle = lang.confirm + lang.thaw + "?");
          }
        },
        sureOpt() {
          // sure,delete,frozen,unfrozen
          switch (this.optType) {
            case "sure":
              return this.sureSubmit();
            case "delete":
              return this.sureDel();
            case "frozen":
              return this.sureFrozen();
            case "unfrozen":
              return this.sureUnFrozen();
            case "deleteReplay":
              return this.sureDeleteReplay();
          }
        },
        async sureSubmit() {
          try {
            this.submitLoading = true;
            const res = await sureActive(this.delId);
            this.$message.success(res.data.msg);
            this.delVisible = false;
            this.getRecommendList();
            this.submitLoading = false;
          } catch (error) {
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.error(error.data.msg);
          }
        },
        async sureDel() {
          try {
            this.submitLoading = true;
            await delRecommend(this.delId);
            this.$message.success(lang.delete + lang.success);
            this.params.page =
              this.data.length > 1 ? this.params.page : this.params.page - 1;
            this.delVisible = false;
            this.getRecommendList();
            this.submitLoading = false;
          } catch (error) {
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.error(error.data.msg);
          }
        },
        async sureFrozen() {
          try {
            this.submitLoading = true;
            await frozenRecommend(this.delId);
            this.$message.success(`${lang.frozen}${lang.success}`);
            this.delVisible = false;
            this.getRecommendList();
            this.submitLoading = false;
          } catch (error) {
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.error(error.data.msg);
          }
        },
        async sureUnFrozen() {
          try {
            this.submitLoading = true;
            await unfrozenRecommend(this.delId);
            this.$message.success(`${lang.thaw}${lang.success}`);
            this.delVisible = false;
            this.getRecommendList();
            this.submitLoading = false;
          } catch (error) {
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.error(error.data.msg);
          }
        },
        async sureDeleteReplay() {
          try {
            await delPrereply(this.delId);
            this.$message.success(lang.delete + lang.success);
            this.delVisible = false;
            this.getPrereplyList();
            this.replayOpt = "add";
            this.replayParams.content = "";
          } catch (error) {
            this.delVisible = false;
            this.$message.error(error.data.msg);
          }
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

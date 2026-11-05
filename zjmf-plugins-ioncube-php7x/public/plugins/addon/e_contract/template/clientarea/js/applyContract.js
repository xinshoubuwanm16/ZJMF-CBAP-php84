(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("template")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);

    new Vue({
      components: {
        asideMenu,
        pagination,
        topMenu,
      },
      data() {
        return {
          commonData: {},
          loading: false,
          dataList: [],
          params: {
            page: 1,
            limit: 20,
            pageSizes: [20, 50, 100],
            total: 200,
          },
          statusObj: {
            Unpaid: {
              label: lang.contract_text26,
              color: "rgba(240, 20, 47, 1)",
              background: "rgba(240, 20, 47, 0.08)",
            },
            Paid: {
              label: lang.contract_text27,
              color: "rgba(61, 213, 152, 1)",
              background: "rgba(61, 213, 152, 0.12)",
            },
            Cancelled: {
              label: lang.contract_text28,
              color: "rgba(249, 150, 0, 1)",
              background: "rgba(249, 150, 0, 0.12)",
            },
            Refunded: {
              label: lang.contract_text35,
              color: "rgba(249, 150, 0, 1)",
              background: "rgba(249, 150, 0, 0.12)",
            },
          },
        };
      },
      created() {
        this.commonData = JSON.parse(localStorage.getItem("common_set_before"));
        document.title =
          this.commonData.website_name + "-" + lang.contract_text29;
        this.getorderList();
      },
      mounted() {
        const addons = document.querySelector("#addons_js");
        this.addons_js_arr = JSON.parse(addons.getAttribute("addons_js")).map(
          (item) => {
            return {
              name: item.name,
              id: item.id,
            };
          }
        );
      },
      destroyed() {},
      updated() {
        // 关闭loading
        document.getElementById("mainLoading").style.display = "none";
        document.getElementsByClassName("template")[0].style.display = "block";
      },

      filters: {
        formateTime(time) {
          if (time && time !== 0) {
            const date = new Date(time * 1000);
            Y = date.getFullYear() + "-";
            M =
              (date.getMonth() + 1 < 10
                ? "0" + (date.getMonth() + 1)
                : date.getMonth() + 1) + "-";
            D =
              (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) +
              " ";
            h =
              (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) +
              ":";
            m =
              date.getMinutes() < 10
                ? "0" + date.getMinutes()
                : date.getMinutes();
            return Y + M + D + h + m;
          } else {
            return "--";
          }
        },
      },
      methods: {
        goBack() {
          sessionStorage.financeActiveIndex = "5";
          location.href = `/finance.htm?isActive=true`;
        },
        sizeChange(e) {
          this.params.limit = e;
          this.getorderList();
        },
        currentChange(e) {
          this.params.page = e;
          this.getorderList();
        },
        getorderList() {
          this.loading = true;
          contractOrder(this.params).then((res) => {
            this.dataList = res.data.data.list;
            this.params.total = res.data.data.count;
            this.loading = false;
          });
        },
        handelHostName(hostArr) {
          return hostArr.join("、");
        },
        handelSign(id) {
          location.href = `signContract.htm?id=${id}`;
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

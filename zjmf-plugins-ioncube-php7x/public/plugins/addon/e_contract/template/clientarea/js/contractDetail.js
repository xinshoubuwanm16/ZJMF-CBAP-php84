(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("template")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);

    new Vue({
      components: {
        asideMenu,
        topMenu,
      },
      data() {
        return {
          commonData: {},
          id: "",
          infoData: {},
        };
      },
      created() {
        this.commonData = JSON.parse(localStorage.getItem("common_set_before"));
        document.title =
          this.commonData.website_name + "-" + lang.contract_text25;
        this.id = location.href.split("?")[1].split("=")[1];
        this.getInfo();
      },
      mounted() {},
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
        getInfo() {
          contractInfo(this.id).then((res) => {
            this.infoData = res.data.data;
          });
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

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
      created() {
        const params = getUrlParams();
        this.id = params.id || "";
        this.getMsgDetail();
        this.getCommonData();
      },
      mounted() {},
      updated() {},
      destroyed() {},
      data() {
        return {
          commonData: {},
          id: "",
          msgDetail: {},
          msgType: {
            official: lang.client_care_text6,
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
      methods: {
        // 获取通用配置
        getCommonData() {
          this.commonData = JSON.parse(
            localStorage.getItem("common_set_before")
          );
          document.title =
            this.commonData.website_name + "-" + lang.client_care_text7;
        },
        // 获取站内信详情
        getMsgDetail() {
          msgDetail(this.id).then((res) => {
            this.msgDetail = res.data.data.mail;
          });
        },
        goBack() {
          window.history.go(-1);
        },
        goOtherPage(id) {
          location.href = `/plugin/${getPluginId(
            "ClientCare"
          )}/msgDetail.htm?id=${id}`;
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

(function () {
  const plugin_lang = {
    "zh-cn": {
      client_care_text1: "接收时间",
      client_care_text2: "消息详情",
      client_care_text3: "消息类型",
      client_care_text4: "上一篇",
      client_care_text5: "下一篇",
      client_care_text6: "官方推送",
      client_care_text7: "站内信",
    },
    "en-us": {
      client_care_text1: "Receive time",
      client_care_text2: "Message details",
      client_care_text3: "Message type",
      client_care_text4: "Previous article",
      client_care_text5: "Next article",
      client_care_text6: "Official push",
      client_care_text7: "Site message",
    },
    "zh-hk": {
      client_care_text1: "接收時間",
      client_care_text2: "訊息詳情",
      client_care_text3: "訊息類型",
      client_care_text4: "上一篇",
      client_care_text5: "下一篇",
      client_care_text6: "官方推播",
      client_care_text7: "站內信",
    },
  };
  const DEFAULT_LANG = localStorage.getItem("lang") || "zh-cn";
  window.plugin_lang = plugin_lang[DEFAULT_LANG];
  checkLangFun(plugin_lang);
})();

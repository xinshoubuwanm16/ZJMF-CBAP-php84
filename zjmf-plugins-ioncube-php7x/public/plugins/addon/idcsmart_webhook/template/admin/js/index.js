(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementById("content");
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = window.moment;
    const host = location.origin;
    const fir = location.pathname.split("/")[1];
    const str = `${host}/${fir}/`;
    new Vue({
      components: {
        comConfig,
      },
      data() {
        return {
          columns: [
            {
              colKey: "id",
              title: "ID",
              width: 90,
            },
            {
              colKey: "name",
              title: lang.webhook_text3,
              cell: "name",
              ellipsis: true,
            },
            {
              colKey: "software",
              title: lang.webhook_text4,
              cell: "software",
              ellipsis: true,
            },
            {
              colKey: "url",
              title: "url",
              cell: "url_mame",
              ellipsis: true,
            },

            {
              colKey: "op",
              title: lang.oss_text6,
              cell: "op",
              width: 120,
            },
          ],
          noticeColumns: [
            {
              colKey: "id",
              title: "ID",
              width: 90,
            },
            {
              colKey: "name_lang",
              title: lang.webhook_text12,
              cell: "name_lang",
              ellipsis: true,
            },
            {
              colKey: "software",
              title: lang.webhook_text13,
              cell: "software",
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "personnel",
              title: lang.webhook_text14,
              cell: "personnel",
              ellipsis: true,
            },
            {
              colKey: "status",
              title: lang.webhook_text15,
              cell: "status",
              width: 200,
            },
            {
              colKey: "op",
              title: lang.oss_text6,
              cell: "op",
              width: 120,
            },
          ],
          editId: null,
          noticeEditId: null,
          webhookForm: {
            name: "",
            software: "",
            url: "",
            token: "",
          },
          webNoticeForm: {
            notice_setting_name: "",
            webhook_id: "",
            chat_id: "",
            content: "",
            personnel: "",
          },
          data: [],
          sendList: [],
          noticeData: [],
          noticeLoading: false,
          software: {
            dingtalk: lang.webhook_text1,
            work_weixin: lang.webhook_text2,
            telegram: "Telegram",
          },
          loading: false,
          webNoticeVisble: false,
          delVisible: false,
          submitLoading: false,
          webhookVisble: false,
          delTip: lang.webhook_text26,
          delId: null,
          rules: {
            name: [
              {
                required: true,
                message: lang.webhook_text28 + lang.webhook_text3,
                type: "error",
              },
            ],
            software: [
              {
                required: true,
                message: lang.webhook_text29 + lang.webhook_text4,
                type: "error",
              },
            ],
            url: [
              {
                required: true,
                message: lang.webhook_text28 + "url",
                type: "error",
              },
            ],
            token: [
              {
                required: true,
                message: lang.webhook_text28 + "token",
                type: "error",
              },
            ],
            notice_setting_name: [
              {
                required: true,
                message: lang.webhook_text29 + lang.webhook_text12,
                type: "error",
              },
            ],
            webhook_id: [
              {
                required: true,
                message: lang.webhook_text29 + lang.webhook_text13,
                type: "error",
              },
            ],
            chat_id: [
              {
                required: true,
                message: lang.webhook_text28 + lang.webhook_text19,
                type: "error",
              },
            ],
            content: [
              {
                required: true,
                message: lang.webhook_text28 + lang.webhook_text20,
                type: "error",
              },
            ],
          },
        };
      },
      created() {
        document.title =
          lang.oss_setting + "-" + localStorage.getItem("back_website_name");
        this.getWebhookList();
        this.getWebNoticeList();
        this.getSendList();
      },
      computed: {
        softwareOptions() {
          return Object.keys(this.software).map((item) => {
            return {
              label: this.software[item],
              value: item,
            };
          });
        },
        isShowChatid() {
          return (
            this.data.filter(
              (item) =>
                item.id === this.webNoticeForm.webhook_id &&
                item.software === "telegram"
            ).length !== 0
          );
        },
      },
      methods: {
        goHelp() {
          window.open(
            "https://wiki.idcsmart.com/web/#/p/f0c54b4c62f7b9ae7f56cc13b6837985"
          );
        },
        addWebhookNotice() {
          this.noticeEditId = null;
          this.webNoticeVisble = true;
          this.$refs.noticeDialog && this.$refs.noticeDialog.reset();
          this.webNoticeForm.chat_id = "";
        },
        editWebhookNotice(row) {
          this.noticeEditId = row.id;
          this.webNoticeForm = {
            notice_setting_name: row.notice_setting_name,
            webhook_id: row.webhook_id,
            chat_id: row.chat_id,
            content: row.content,
            personnel: row.personnel,
          };
          this.webNoticeVisble = true;
        },
        changeStatus(row) {
          apiWebhookNoticeStatus({ id: row.id, status: row.status })
            .then((res) => {
              this.$message.success(res.data.msg);
              this.getWebNoticeList();
            })
            .catch((err) => {
              this.$message.error(err.data.msg);
            });
        },
        delWebhookNotice(row) {
          this.delTip = lang.webhook_text27;
          this.delId = row.id;
          this.delVisible = true;
        },
        getSendList() {
          apiSendList()
            .then((res) => {
              this.sendList = res.data.data.list;
            })
            .catch((err) => {
              this.$message.error(err.data.msg);
            });
        },
        addWebhook() {
          this.editId = null;
          this.webhookVisble = true;
          this.$refs.userDialog && this.$refs.userDialog.reset();
        },
        editWebhook(row) {
          this.editId = row.id;
          this.webhookForm = {
            name: row.name,
            software: row.software,
            url: row.url,
            token: row.token,
          };
          this.webhookVisble = true;
        },
        // 删除
        delWebhook(row) {
          this.delTip = lang.webhook_text26;
          this.delId = row.id;
          this.delVisible = true;
        },
        noticeDiaClose() {
          this.editId = null;
          this.$refs.noticeDialog && this.$refs.noticeDialog.reset();
          this.webNoticeVisble = false;
        },
        materialDiaClose() {
          this.noticeEditId = null;
          this.$refs.userDialog && this.$refs.userDialog.reset();
          this.webhookVisble = false;
        },
        onWebhookSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            this.submitLoading = true;
            const subApi =
              this.editId !== null ? apiEditWebhook : apiAddWebhook;
            subApi({ id: this.editId, ...this.webhookForm })
              .then((res) => {
                this.$message.success(res.data.msg);
                this.materialDiaClose();
                this.getWebhookList();
                this.getWebNoticeList();
              })
              .catch((err) => {
                this.$message.error(err.data.msg);
              })
              .finally(() => {
                this.submitLoading = false;
              });
          }
        },
        onWebNoticeSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            this.submitLoading = true;
            const subApi =
              this.noticeEditId == null
                ? apiAddWebhookNotice
                : apiEditWebhookNotice;
            subApi({ id: this.noticeEditId, ...this.webNoticeForm })
              .then((res) => {
                this.$message.success(res.data.msg);
                this.noticeDiaClose();
                this.getWebNoticeList();
              })
              .catch((err) => {
                this.$message.error(err.data.msg);
              })
              .finally(() => {
                this.submitLoading = false;
              });
          }
        },

        async sureDel() {
          try {
            const params = {
              id: this.delId,
            };
            this.submitLoading = true;
            const delApi =
              this.delTip === lang.webhook_text26
                ? apiDelWebhook
                : apiDelWebhookNotice;
            const res = await delApi(params);
            this.$message.success(res.data.msg);
            this.delVisible = false;
            this.getWebhookList();
            this.getWebNoticeList();
            this.submitLoading = false;
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        getWebNoticeList() {
          this.noticeLoading = true;
          apiWebhookNoticeList()
            .then((res) => {
              this.noticeLoading = false;
              this.noticeData = res.data.data.list;
            })
            .catch((err) => {
              this.noticeLoading = false;
              this.$message.error(err.data.msg);
            });
        },
        async getWebhookList() {
          this.loading = true;
          apiWebhookList()
            .then((res) => {
              this.loading = false;
              this.data = res.data.data.list;
            })
            .catch((err) => {
              this.loading = false;
              this.$message.error(err.data.msg);
            });
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

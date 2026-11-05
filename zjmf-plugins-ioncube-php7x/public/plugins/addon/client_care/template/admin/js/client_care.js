(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("client-care")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = moment;
    new Vue({
      data() {
        return {
          params: {
            keywords: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
            status: "",
          },
          total: 100,
          pageSizeOptions: [20, 50, 100],
          dataList: [],
          loading: false,
          columns: [
            {
              colKey: "title",
              title: lang.client_care_label8,
              width: 100,
            },
            {
              colKey: "content",
              title: lang.client_care_label2,
              width: 500,
              ellipsis: true,
            },
            {
              colKey: "push_start_time",
              title: lang.client_care_message17,
              width: 200,
            },
            {
              colKey: "send_cycle",
              title: lang.client_care_label15,
              width: 100,
              ellipsis: true,
            },
            // {
            //   colKey: 'send_num',
            //   title: lang.client_care_label4,
            //   width: 200,
            //   ellipsis: true
            // },

            {
              colKey: "status",
              title: lang.push_status,
              width: 100,
            },
            {
              colKey: "operation",
              title: lang.client_care_label7,
              width: 80,
            },
          ],
          statusVisble: false,
          statusTip: "",
          statusParams: {
            id: 0,
            status: 0,
          },
          delVisble: false,
          delId: 0,
          statusArr: [
            { value: "Wait", label: lang.to_be_executed },
            { value: "Exec", label: lang.client_exec },
            { value: "Suspended", label: lang.client_suspended },
            { value: "Expired", label: lang.promo_expiration },
            { value: "Finish", label: lang.app_finish },
          ],
          submitLoading: false,
        };
      },
      components: {},
      methods: {
        // 切换分页
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.params.keywords = "";
          this.getData();
        },
        getData() {
          this.loading = true;
          clientCareList(this.params)
            .then((res) => {
              if (res.data.status == 200) {
                this.dataList = res.data.data.list;
                this.total = res.data.data.count;
              }
              this.loading = false;
            })
            .catch((error) => {
              this.loading = false;
            });
        },
        seacrh() {
          this.getData();
        },
        clearKey() {
          this.params.keywords = "";
          this.seacrh();
        },
        add() {
          location.href = "client_care_add.htm";
        },
        sureChange() {
          this.statusVisble = false;
          const params = {
            ...this.statusParams,
          };
          this.submitLoading = true
          statusChange(params)
            .then((res) => {
              if (res.data.status == 200) {
                this.$message.success(res.data.msg);
                this.getData();
              }
            })
            .catch((error) => {
              this.$message.error(error.data.msg);
            })
            .finally(() => {
              this.submitLoading = false;
            });
        },
        closeDialog() {
          this.statusVisble = false;
        },
        showStatusDialog(row) {
          if (row.status === "Suspended") {
            this.statusTip = lang.client_care_title5;
          } else {
            this.statusTip = lang.client_care_title6;
          }
          this.statusParams = {
            id: row.id,
            status: row.status === "Suspended" ? 1 : 0,
          };
          this.statusVisble = true;
        },
        showDelDialog(row) {
          this.delVisble = true;
          this.delId = row.id;
        },
        sureDel() {
          const params = {
            id: this.delId,
          };
          this.submitLoading = true;
          delClientCare(params)
            .then((res) => {
              if (res.data.status == 200) {
                this.$message.success(res.data.msg);
                this.getData();
                this.delVisble = false;
              }
            })
            .catch((error) => {
              this.$message.error(error.data.msg);
            })
            .finally(() => {
              this.submitLoading = false;
            });
        },
        toDetail(e) {
          const row = e.row;
          const tempHour = row.hour * 1 < 10 ? `0${row.hour}` : row.hour;
          const tempMin = row.minute * 1 < 10 ? `0${row.minute}` : row.minute;
          let params = {
            title: row.title,
            subject: "",
            sms_template_id:
              row.sms_template_id == 0 ? "" : row.sms_template_id,
            sms_name: row.sms_name,
            send_cycle: row.send_cycle,
            repeat_send: row.repeat_send == 0 ? false : true,
            push_start_time: row.push_start_time * 1000,
            push_end_time: row.push_end_time * 1000,
            push_object: row.push_object,
            message: "",
            email_template_id:
              row.email_template_id == 0 ? "" : row.email_template_id,
            email_name: row.email_name,
            type: row.type,
            week_day: row.week_day,
            month_day: row.month_day,
            range: [row.push_start_time * 1000, row.push_end_time * 1000],
            timeHourMin: `${tempHour}:${tempMin}`,
            content: row.content,
          };

          const push_object = JSON.stringify(row.push_object);
          params = JSON.stringify(params);
          location.href = `client_care_detail.htm?params=${params}&push_object=${push_object}`;
        },
        stopPop(event) {
          event.stopPropagation();
        },
      },
      created() {
        this.getData();
      },
      components: {
        comConfig,
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

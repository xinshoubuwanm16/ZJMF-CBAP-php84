(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("client-care-add")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = moment;
    const host = location.origin;
    const fir = location.pathname.split("/")[1];
    const str = `${host}/${fir}/`;
    new Vue({
      components: {
        comConfig,
      },
      data() {
        const smsNameValidator = (val) => {
          if (!this.formData.sms_name && !this.formData.email_name) {
            return {
              result: false,
              message: lang.client_care_message1,
              type: "error",
            };
          }
          return { result: true };
        };

        const smsTemplateValidator = (val) => {
          if (this.formData.sms_name && !val) {
            return {
              result: false,
              message: lang.client_care_message2,
              type: "error",
            };
          }
          return { result: true };
        };

        // 邮件模板
        const emailTemplateValidator = (val) => {
          if (this.formData.email_name && !val && !this.formData.subject) {
            return {
              result: false,
              message: lang.client_care_message3,
              type: "error",
            };
          }
          return { result: true };
        };

        // 邮件标题
        const subjectValidator = (val) => {
          if (
            this.formData.email_name &&
            !val &&
            !this.formData.email_template_id
          ) {
            return {
              result: false,
              message: lang.client_care_message4,
              type: "error",
            };
          }
          return { result: true };
        };
        // 邮件内容
        const messageValidator = (val) => {
          if (this.formData.subject && !val) {
            return {
              result: false,
              message: lang.client_care_message5,
              type: "error",
            };
          }
          return { result: true };
        };
        const condition1Validator = (val) => {
          if (!this.formData.push_object.condition1) {
            return {
              result: false,
              message: lang.client_care_message6,
              type: "error",
            };
          }
          return { result: true };
        };
        const condition2Validator = (val) => {
          if (
            this.formData.push_object.condition1 &&
            !this.formData.push_object.condition2
          ) {
            return {
              result: false,
              message: lang.client_care_message6,
              type: "error",
            };
          }
          return { result: true };
        };
        const condition3Validator = (val) => {
          if (
            this.formData.push_object.condition2 &&
            !this.formData.push_object.condition3 &&
            this.thirdType == "one"
          ) {
            return {
              result: false,
              message: lang.client_care_message6,
              type: "error",
            };
          }
          return { result: true };
        };
        const condition4Validator = (val) => {
          if (
            this.formData.push_object.condition5 == "day" &&
            !this.formData.push_object.condition4
          ) {
            return {
              result: false,
              message: lang.client_care_message7,
              type: "error",
            };
          }
          if (
            this.formData.push_object.condition5 == "date" &&
            !this.formData.push_object.condition4
          ) {
            return {
              result: false,
              message: lang.client_care_message6,
              type: "error",
            };
          }
          if (this.isDay && !this.formData.push_object.condition4) {
            return {
              result: false,
              message: lang.client_care_message8,
              type: "error",
            };
          }
          if (this.isNum && !this.formData.push_object.condition4) {
            return {
              result: false,
              message: lang.client_care_message9,
              type: "error",
            };
          }
          return { result: true };
        };
        const condition5Validator = (val) => {
          if (!this.formData.push_object.condition5 && this.isFifth) {
            return {
              result: false,
              message: lang.client_care_message6,
              type: "error",
            };
          }
          return { result: true };
        };

        const emailValidator = (val) => {
          if (this.formData.email_name && !val) {
            return {
              result: false,
              message: lang.client_care_message10,
              type: "error",
            };
          }
          return { result: true };
        };

        const phoneValidator = (val) => {
          if (this.formData.sms_name && !val) {
            return {
              result: false,
              message: lang.client_care_message11,
              type: "error",
            };
          }
          if (this.formData.sms_name && val.length != 11) {
            return {
              result: false,
              message: lang.client_care_message12,
              type: "error",
            };
          }
          return { result: true };
        };

        return {
          maxHeight: 400,
          formData: {
            title: "",
            type: 1,
            content: "", // 站内信内容，和邮件内容通用一个富文本
            sms_name: "",
            sms_template_id: "",
            email_name: "",
            email_template_id: "",
            subject: "",
            message: "",
            push_object: {
              condition1: "",
              condition2: "",
              condition3: "",
              condition3Arr: [],
              condition4: 0,
              condition5: "",
              productArr: [],
            },
            repeat_send: false,
            send_cycle: "", //  onetime一次性day每天week每周month每月
            push_start_time: "",
            push_end_time: "",
            week_day: "", // week 必填 1-7
            month_day: "", // month 必填 1-28
            hour: "",
            minute: "",
            range: [],
            timeHourMin: "",
          },
          rules: {
            title: [
              {
                required: true,
                message: lang.client_care_message13,
                type: "error",
              },
            ],
            sms_name: [{ validator: smsNameValidator, }],
            email_name: [{ validator: smsNameValidator,  }],
            sms_template_id: [
              { validator: smsTemplateValidator,  },
            ],
            email_template_id: [
              { validator: emailTemplateValidator,  },
            ],
            subject: [{ validator: subjectValidator,  }],
            // message: [
            //     { validator: messageValidator, trigger: 'blur' },
            // ],
            send_cycle: [
              {
                required: true,
                message: lang.client_care_message14,
                type: "error",
              },
            ],
            push_start_time: [
              {
                required: true,
                message: lang.client_care_message15,
                type: "error",
              },
            ],
            condition1: [{ validator: condition1Validator,  }],
            condition2: [{ validator: condition2Validator,  }],
            condition3: [{ validator: condition3Validator,  }],
            condition4: [{ validator: condition4Validator,  }],
            condition5: [{ validator: condition5Validator,  }],
            "push_object.productArr": [
              { required: true, message: lang.select, type: "error" },
            ],
          },
          smsList: [],
          smsTemplateList: [],
          emailList: [],
          emailTemplateList: [],
          sendCycleList: [
            {
              id: 1,
              value: "onetime",
              label: lang.onetime,
            },
            {
              id: 2,
              value: "day",
              label: lang.client_care_label19,
            },
            {
              id: 3,
              value: "week",
              label: lang.client_care_label20,
            },
            {
              id: 4,
              value: "month",
              label: lang.client_care_label21,
            },
          ],
          // 推送目标开始
          selectFirst: [
            {
              id: 1,
              label: lang.client_care_label22,
              value: "client",
            },
            {
              id: 2,
              label: lang.client_care_label23,
              value: "host",
            },
            {
              id: 3,
              label: lang.client_care_label24,
              value: "server",
            },
          ],
          selectSecond: [],
          // 指定用户 后 二级选择
          clientSecond: [
            {
              id: 1,
              value: "client",
              label: lang.client_care_label22,
            },
            {
              id: 2,
              value: "register_time",
              label: lang.client_care_label25,
            },
            {
              id: 3,
              value: "active_host_num",
              label: lang.client_care_label26,
            },
            {
              id: 4,
              value: "host_num",
              label: lang.client_care_label27,
            },
            {
              id: 5,
              value: "last_login_time",
              label: lang.client_care_label28,
            },
            {
              id: 6,
              value: "owner_special_product",
              label: lang.client_care_label50,
            },
          ],
          // 指定产品 后 二级选择
          hostSecond: [
            {
              id: "1",
              value: "status",
              label: lang.client_care_label29,
            },
            {
              id: "2",
              value: "purchase_time",
              label: lang.client_care_label30,
            },
            {
              id: "3",
              value: "termination_time",
              label: lang.client_care_label31,
            },
            // {
            //     id: "4",
            //     value: "config",
            //     label: lang.client_care_label32
            // },
          ],
          // 指定接口 后 二级选择
          serverSecond: [
            {
              id: 1,
              value: "product",
              label: lang.client_care_label33,
            },
          ],
          // 三级选择框
          selectThird: [],
          // 三级 大于等于小于选择框
          compareSelect: [
            {
              id: 1,
              value: ">=",
              label: lang.client_care_label34,
            },
            {
              id: 2,
              value: "<",
              label: lang.client_care_label35,
            },
          ],
          // 商品状态选择框
          hostStatusSelect: [
            {
              id: 1,
              value: "Cancelled",
              label: lang.client_care_label36,
            },
            {
              id: 2,
              value: "Unpaid",
              label: lang.client_care_label37,
            },
            {
              id: 3,
              value: "Pending",
              label: lang.client_care_label38,
            },
            {
              id: 4,
              value: "Active",
              label: lang.client_care_label39,
            },
            {
              id: 5,
              value: "Suspended",
              label: lang.client_care_label40,
            },
            {
              id: 6,
              value: "Deleted",
              label: lang.client_care_label41,
            },
            {
              id: 7,
              value: "Failed",
              label: lang.client_care_label42,
            },
          ],
          // 三级选择框是否显示
          thirdType: "",
          // 五级选择框
          fifthSelect: [
            {
              id: 1,
              value: "day",
              label: lang.client_care_label43,
            },
            {
              id: 2,
              value: "date",
              label: lang.client_care_label44,
            },
          ],
          isFifth: false,

          isDay: false,
          isNum: false,
          postClientData: {
            count: 0,
            list: [],
          },
          timer: null,
          // 推送名单
          listVisible: false,
          loading: false,
          nameColumns: [
            {
              colKey: "username",
              title: lang.client_care_label45,
              width: 300,
              ellipsis: true,
            },
            {
              colKey: "send_num",
              title: lang.client_care_label46,
              width: 100,
              ellipsis: true,
            },
          ],
          previewVisible: false,
          previewParams: {
            email: "",
            phone_code: 86,
            phone: "",
          },
          country: [],
          previewRules: {
            email: [
              { validator: emailValidator,  },
              {
                email: { ignore_max_length: true },
                message: lang.client_care_message16,
              },
            ],
            phone: [{ validator: phoneValidator,  }],
          },
          /* 2023-07-13 新增 */
          typeList: [
            { value: 1, label: lang.in_station_mes },
            { value: 2, label: `${lang.client_sms}/${lang.client_email}` },
          ],
          weekArr: [],
          monthArr: [],
          timeHourMin: "",
          userForm: {
            keywords: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
            client_id: "",
          },
          userTotal: 0,
          /* 2023-07-13 新增 end */
          /* 初始化三级数据 */
          shopList: [],
          firstGroup: [],
          tempSecondGroup: [],
          productList: [], // 商品可选列表
          groupList: [], // 一二级分组组装数据
        };
      },
      computed: {
        calcTit() {
          return this.formData.type === 1
            ? lang.notice_content
            : lang.client_care_label14;
        },
      },
      watch: {
        formData: {
          handler(newValue, oldValue) {
            this.getPostClientList();
          },
          deep: true,
        },
      },
      methods: {
        // 获取列表
        async getProductList() {
          try {
            // 获取商品，一级，二级分组
            const shopList = await getProduct();
            const firstGroup = await getFirstGroup();
            const secondGroup = await getSecondGroup();
            // 组装数据，一级分组装二级分组，二级分组填入符合需求的数据
            firstGroup.data.data.list.forEach((item) => {
              item.key = "f-" + item.id; // 多级Id会重复，故需要设置独一的key
              item.flag = false; // flag切换显示修改
              let secondArr = [];
              // item.disabled = true
              secondGroup.data.data.list.forEach((sItem) => {
                if (sItem.parent_id === item.id) {
                  sItem.key = "s-" + sItem.id;
                  sItem.flag = false; // flag切换显示修改
                  secondArr.push(sItem);
                  //  sItem.disabled = true
                }
              });
              item.children = secondArr;
            });
            this.groupList = JSON.parse(
              JSON.stringify(firstGroup.data.data.list)
            );
            firstGroup.data.data.list.forEach((item) => {
              item.children.forEach((ele) => {
                let temp = [];
                shopList.data.data.list.forEach((e) => {
                  if (e.product_group_id_second === ele.id) {
                    e.key = "t-" + e.id;
                    e.flag = false; // flag切换显示修改
                    temp.push(e);
                  }
                });
                ele.children = temp;
              });
            });
            const temp = firstGroup.data.data.list.filter(
              (item) =>
                item.children.length > 0 &&
                item.children.some((el) => el.children.length > 0)
            );
            this.productList = temp;
          } catch (error) {
            console.log(error);
          }
        },
        // 短信接口
        getSms() {
          sms().then((res) => {
            if (res.data.status == 200) {
              this.smsList = res.data.data.list;
            }
          });
        },
        // 邮件接口
        getEmail() {
          email().then((res) => {
            if (res.data.status == 200) {
              this.emailList = res.data.data.list;
            }
          });
        },
        // 短信接口变更 获取对应短信模板
        smsChange(e) {
          // 清空 短信模板
          // this.formData.sms_template_id = ""
          if (e) {
            const params = {
              name: e,
            };
            smsTemplate(params)
              .then((res) => {
                if (res.data.status == 200) {
                  this.smsTemplateList = res.data.data.list;
                }
              })
              .catch((error) => {
                this.smsTemplateList = [];
              });
          } else {
            this.smsTemplateList = [];
          }
        },
        emailChange(e) {
          this.formData.email_template_id = "";
        },
        // 邮件模板
        getEmailTemplate() {
          emailTemplate().then((res) => {
            if (res.data.status == 200) {
              this.emailTemplateList = res.data.data.list;
            }
          });
        },
        showPreview() {
          this.$refs.form
            .validate({
              fields: [
                "sms_name",
                "sms_template_id",
                "email_name",
                "email_template_id",
                "subject",
                "message",
              ],
            })
            .then((res) => {
              console.log(res);
              if (res == true) {
                this.previewParams = {
                  email: "",
                  phone_code: 86,
                  phone: "",
                };
                this.previewVisible = true;
              } else {
                this.$message.warning(res[Object.keys(res)[0]][0].message);
              }
            });
        },
        // 预览
        preview({ validateResult, firstError }) {
          if (validateResult === true) {
            const params = {
              sms_name: this.formData.sms_name,
              sms_template_id: this.formData.sms_template_id,
              email_name: this.formData.email_name,
              email_template_id: this.formData.email_template_id,
              subject: this.formData.subject,
              message: this.formData.subject
                ? tinymce.editors["emailTemp"].getContent()
                : "",
              email: this.previewParams.email,
              phone_code: this.previewParams.phone_code,
              phone: this.previewParams.phone,
            };
            postPreview(params)
              .then((res) => {
                if (res.data.status == 200) {
                  this.$message.success(res.data.msg);
                  this.previewVisible = false;
                }
              })
              .catch((error) => {
                this.$message.error(error.data.msg);
              });
          } else {
            this.$message.warning(firstError);
          }
        },
        // 保存
        sub({ validateResult, firstError }) {
          if (validateResult === true) {
            let params = {
              ...this.formData,
              push_object: {
                ...this.formData.push_object,
                condition3:
                  this.thirdType == "one"
                    ? this.formData.push_object.condition3
                    : this.formData.push_object.condition3Arr,
                condition5: this.isFifth
                  ? this.formData.push_object.condition5
                  : null,
                condition4:
                  this.formData.push_object.condition5 == "date"
                    ? moment(this.formData.push_object.condition4).format(
                        "YYYY-MM-DD HH:mm:ss"
                      )
                    : this.formData.push_object.condition4,
              },
              repeat_send: this.formData.repeat_send ? 1 : 0,
              push_start_time: moment(this.formData.push_start_time).format(
                "YYYY-MM-DD HH:mm:ss"
              ),
              message: this.formData.subject
                ? tinymce.editors["emailTemp"].getContent()
                : "",
            };
            delete params.push_object.condition3Arr;
            addClientCare(params)
              .then((res) => {
                if (res.data.status == 200) {
                  this.$message.success(res.data.msg);
                  this.back();
                }
              })
              .catch((error) => {
                this.$message.error(error.data.msg);
              });
          } else {
            this.$message.warning(firstError);
          }
        },
        // 推送目标
        // 一级选择框变化
        firstChange(e) {
          // this.formData.push_object.condition3Arr = []
          // this.formData.push_object.condition3 = ""
          // this.formData.push_object.condition4 = null
          // this.formData.push_object.condition5 = null
          this.isFifth = false;
          this.isDay = false;
          this.isNum = false;
          this.thirdType = "";
          if (e == "client") {
            this.selectSecond = this.clientSecond;
          }

          if (e == "host") {
            this.selectSecond = this.hostSecond;
          }

          if (e == "server") {
            this.selectSecond = this.serverSecond;
          }
        },
        // 二级选择框变化
        secondChange(e) {
          // this.formData.push_object.condition3Arr = []
          // this.formData.push_object.condition3 = ""
          // this.formData.push_object.condition4 = null
          // this.formData.push_object.condition5 = null
          this.isDay = false;
          this.isNum = false;
          this.isFifth = false;
          this.thirdType = "";
          // 商品接口
          if (e == "product") {
            this.thirdType = "more";
            // 拉取商品接口
            server().then((res) => {
              if (res.data.status == 200) {
                let list = res.data.data.list;
                list.map((item) => {
                  item.value = item.id;
                  item.label = item.name;
                });
                this.selectThird = list;
              }
            });
            return;
          }

          // 产品状态
          if (e == "status") {
            this.thirdType = "more";
            this.selectThird = this.hostStatusSelect;
            return;
          }

          // 使第三级选择框 显示大于等于小于的情况
          const arr = ["purchase_time", "termination_time"];
          if (arr.includes(e)) {
            this.thirdType = "one";
            this.selectThird = this.compareSelect;
            this.isFifth = true;
            // this.formData.push_object.condition5 = "day"
            return;
          }

          // 天
          const arr1 = ["register_time", "last_login_time"];
          // 个
          const arr2 = ["active_host_num", "host_num"];
          if (arr1.includes(e)) {
            this.thirdType = "one";
            this.selectThird = this.compareSelect;
            this.isDay = true;
            this.isNum = false;
          }
          if (arr2.includes(e)) {
            this.thirdType = "one";
            this.selectThird = this.compareSelect;
            this.isDay = false;
            this.isNum = true;
          }

          // 指定用户
          if (e == "client") {
            this.thirdType = "more";
            this.userForm.client_id =
              this.formData.push_object.condition3Arr[0];
            client(this.userForm).then((res) => {
              if (res.data.status == 200) {
                let list = res.data.data.list;
                list.map((item) => {
                  item.value = item.id;
                  item.label = item.username;
                });
                this.selectThird = list;
              }
            });
            return;
          }

          if (e == "config") {
            this.thirdType = "config";
          }
          // 拥有特定产品
          if (e === "owner_special_product") {
            this.thirdType = "owner_special_product";
            if (this.productList.length === 0) {
              this.getProductList();
            }
          }
        },
        // 三级选择框变化
        thirdChange(e) {
          console.log(e);
        },
        fifthChange(e) {
          // this.formData.push_object.condition4 = null
        },
        getPostClientList() {
          if (this.timer != null) {
            clearTimeout(this.timer);
          }

          this.timer = setTimeout(() => {
            const params = {
              push_object: {
                ...this.formData.push_object,
                condition3:
                  this.thirdType == "one"
                    ? this.formData.push_object.condition3
                    : this.formData.push_object.condition3Arr,
                condition5: this.isFifth
                  ? this.formData.push_object.condition5
                  : null,
                condition4:
                  this.formData.push_object.condition5 == "date"
                    ? moment(this.formData.push_object.condition4).format(
                        "YYYY-MM-DD"
                      )
                    : this.formData.push_object.condition4,
              },
            };
            postClientList(params)
              .then((res) => {
                if (res.data.status == 200) {
                  this.postClientData = res.data.data;
                }
              })
              .catch((error) => {
                this.postClientData = {
                  count: 0,
                };
              });
          }, 500);
        },
        back() {
          location.href = "index.htm";
        },
        // 获取国家列表
        async getCountry() {
          try {
            const res = await getCountry();
            this.country = res.data.data.list;
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        emailTemplateChange(e) {
          if (e) {
            const params = {
              id: e,
            };

            templateOne(params).then((res) => {
              if (res.data.status == 200) {
                this.formData.subject = res.data.data.email_template.subject;
                this.formData.message = res.data.data.email_template.message;

                setTimeout(() => {
                  this.$refs.comTinymce.setContent(this.formData.message);
                  // tinymce.editors["emailTemp"].setContent(
                  //   this.formData.message
                  // );
                }, 1000);
              }
            });
          }
        },
        initTemplate() {
          let curLang = "";
          switch (localStorage.getItem("backLang")) {
            case "zh-cn":
              curLang = "zh_CN";
              break;
            case "zh-hk":
              curLang = "zh_HK";
              break;
            default:
              curLang = "en_US";
          }
          tinymce.init({
            selector: "#emailTemp",
            language_url: `/tinymce/langs/${curLang}.js`,
            language: curLang,
            min_height: 400,
            width: "100%",
            plugins:
              "link lists image code table colorpicker textcolor wordcount contextmenu fullpage",
            toolbar:
              "bold italic underline strikethrough | fontsizeselect | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent blockquote | undo redo | link unlink image fullpage code | removeformat",
            images_upload_url: str + "v1/upload",
            images_upload_handler: this.handlerAddImg,
            // 只读
            readonly: true,
            deprecation_warnings: false,
            init_instance_callback: (editor) => {
              setTimeout(() => {
                if (this.formData.content) {
                  editor.setContent(this.formData.content);
                }
              }, 100);
            },
          });
        },
        handlerAddImg(blobInfo, success, failure) {
          return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("file", blobInfo.blob());
            axios
              .post(str + "v1/upload", formData, {
                headers: {
                  Authorization:
                    "Bearer" + " " + localStorage.getItem("backJwt"),
                },
              })
              .then((res) => {
                const json = {};
                if (res.status !== 200) {
                  failure("HTTP Error: " + res.msg);
                  return;
                }
                // json = JSON.parse(res)
                // ?.
                json.location = res.data.data?.image_url;

                if (!json || typeof json.location !== "string") {
                  failure("Error:" + res.data.msg);
                  return;
                }
                success(json.location);
              });
          });
        },
      },
      created() {
        for (let i = 1; i <= 7; i++) {
          this.weekArr.push({
            value: i,
            label: lang[`care_week${i}`],
          });
        }
        for (let i = 1; i <= 28; i++) {
          this.monthArr.push({
            value: i,
            label: `${i}`,
          });
        }
        this.getSms();
        this.getEmail();
        this.getEmailTemplate();
        this.getCountry();
      },
      mounted() {
        this.initTemplate();
        const url = window.location.href;
        const getqyinfo = url.split("?")[1];
        const getqys = new URLSearchParams("?" + getqyinfo);
        const params = JSON.parse(getqys.get("params"));
        const push_object = JSON.parse(getqys.get("push_object"));

        if (push_object.condition3 instanceof Array) {
          params.push_object.condition3Arr = push_object.condition3;
          params.push_object.condition3 = "";
        }
        this.formData = Object.assign(this.formData, params);
        // 短信接口
        if (params.sms_name) {
          this.smsChange(params.sms_name);
        }
        // 邮件模板
        if (params.email_template_id) {
          this.emailTemplateChange(params.email_template_id);
        }
        // 一级选择
        if (push_object.condition1) {
          this.firstChange(push_object.condition1);
        }

        // 二级选择
        if (push_object.condition2) {
          this.secondChange(push_object.condition2);
        }
        if (params.push_object.condition2 === "owner_special_product") {
          this.formData.push_object.productArr =
            params.push_object.condition3Arr.map((item) => {
              item = `t-${item}`;
              return item;
            });
        }
      },
      updated() {},
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

/* 用户信息-订单管理 */
(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("order")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    Vue.prototype.moment = window.moment;
    const host = location.host;
    const fir = location.pathname.split("/")[1];
    const str = `${host}/${fir}/`;
    new Vue({
      components: {
        comConfig,
      },
      data() {
        return {
          data: [],
          hover: true,
          currency_prefix: JSON.parse(localStorage.getItem("common_set")).currency_prefix || "¥",
          currency_suffix: JSON.parse(localStorage.getItem("common_set")).currency_suffix || "元",
          columns: [
            {
              colKey: "dedicated_ip",
              cell: "dedicated_ip",
              title: "IP",
              width: 120,
            },
            {
              colKey: "power_status",
              title: lang.manual_text5,
              width: 90,
              ellipsis: true,
            },

            {
              colKey: "machine_op",
              title: lang.manual_text6,
              width: 250,
            },
            {
              cell: "config",
              title: lang.manual_text7,
              width: 320,
            },
            {
              cell: "username",
              colKey: "username",
              title: lang.manual_text9,
              width: 150,
              ellipsis: true,
            },
            {
              cell: "cost",
              colKey: "cost",
              title: lang.manual_text10 + "/" + lang.manual_text11,
              width: 120,
              ellipsis: true,
            },
            {
              cell: "client_name",
              colKey: "client_name",
              title: lang.manual_text12,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "due_time",
              title: lang.manual_text13,
              width: 150,
              ellipsis: true,
            },
            {
              cell: "notes",
              colKey: "notes",
              title: lang.manual_text8,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "op",
              title: lang.operation,
              width: 90,
            },
          ],
          pagination: {
            current: 1,
            pageSize: 5,
            showJumper: true,
            total: 0,
          },
          params: {
            id: "",
            keywords: "",
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
            addon_manual_resource_supplier_id: "",
          },

          statusObj: {
            on: lang.manual_text14,
            off: lang.manual_text15,
            error: lang.manual_text16,
          },
          total: 0,
          pageSizeOptions: [20, 50, 100],
          loading: false,
          supplierList: [],
          addManualShow: false,
          manualForm: {
            dedicated_ip: "",
            addon_manual_resource_supplier_id: "",
            assigned_ips: "",
            notes: "",
            configuration: "",
            cost: "",
            username: "",
            password: "",
            control_mode: "",
            ipmi_ip: "",
            ipmi_version: "",
            dcim_client_url: "",
            dcim_client_id: "",
            control_username: "",
            control_password: "",
            due_time: "",
            port: "",
          },
          osRules: {
            password: [
              {
                required: true,
                message: lang.input + lang.manual_text10,
                type: "error",
              },
            ],
            os: [
              {
                required: true,
                message: lang.input + lang.manual_text10,
                type: "error",
              },
            ],
            port: [
              {
                required: true,
                message: lang.input + lang.manual_text10,
                type: "error",
              },
            ],
            part_type: [
              {
                required: true,
                message: lang.select + lang.manual_text10,
                type: "error",
              },
            ],
          },
          productRules: {
            due_time: [
              {
                required: true,
                message: lang.select + lang.manual_text27,
                type: "error",
              },
            ],
            dedicated_ip: [
              {
                required: true,
                message: lang.input + lang.manual_text18,
                type: "error",
              },
            ],
            addon_manual_resource_supplier_id: [
              {
                required: true,
                message: lang.select + lang.manual_text10,
                type: "error",
              },
            ],
            control_mode: [
              {
                required: true,
                message: lang.select + lang.manual_text26,
                type: "error",
              },
            ],
            ipmi_ip: [
              {
                required: true,
                message: lang.input + lang.manual_text33,
                type: "error",
              },
            ],
            ipmi_version: [
              {
                required: true,
                message: lang.select + lang.manual_text34,
                type: "error",
              },
            ],
            dcim_client_url: [
              {
                required: true,
                message: lang.input + lang.manual_text35,
                type: "error",
              },
            ],
            dcim_client_id: [
              {
                required: true,
                message: lang.input + lang.manual_text36,
                type: "error",
              },
            ],
            control_username: [
              {
                required: true,
                message: lang.input + lang.manual_text31,
                type: "error",
              },
            ],
            control_password: [
              {
                required: true,
                message: lang.input + lang.manual_text32,
                type: "error",
              },
            ],
          },
          editId: null,
          delVisible: false,
          delId: null,
          supplierShow: false,
          supplierlForm: {
            name: "",
            contact: "",
            notes: "",
          },
          supplierRules: {
            name: [
              {
                required: true,
                message: lang.input + lang.manual_text38,
                type: "error",
              },
            ],
          },
          supplierColumns: [
            {
              cell: "name",
              title: lang.manual_text38,
              ellipsis: true,
            },

            {
              cell: "contact",
              colKey: "contact",
              title: lang.manual_text39,
              ellipsis: true,
            },
            {
              cell: "notes",
              colKey: "notes",
              title: lang.manual_text40,
              ellipsis: true,
            },
            {
              colKey: "op",
              title: lang.operation,
              width: 90,
            },
          ],
          supplierEditData: {
            id: "",
            name: "",
            contact: "",
            notes: "",
          },
          supplierEdit: false,
          optType: "reinstall", // reinstall reset rescue
          reinstallDialog: false,
          resetDialog: false,
          reinstallData: {
            // 重装系统
            id: "",
            password: "",
            os: "",
            system: "",
            port: "",
            part_type: 0,
            system: 1,
            other_user: 0,
            user: "",
          },
          curVersion: "",
          curId: "",
          systemTit: "",
          systemArr: [],
          systemRules: {
            password: [
              {
                required: true,
                message: `${lang.input}${lang.password}`,
                type: "error",
              },
            ],
            port: [
              {
                required: true,
                message: `${lang.input}${lang.auth_port}`,
                type: "error",
              },
            ],
            user: [
              {
                required: true,
                message: `${lang.input}${lang.user}`,
                type: "error",
              },
            ],
          },
          submitLoading: false,
          optTimer: null,
          opting: false,
          powerStatus: "off",
          checked: false,
        };
      },
      created() {
        this.getSupplierList();
        this.getProductList();
      },
      computed: {
        calcPasTit() {
          return this.optType === "rescue" ? lang.temp_password : lang.password;
        },
        calcPasTip() {
          if (this.optType === "rescue") {
            return lang.rescue_tip;
          } else if (this.optType === "reset") {
            return lang.reset_tip;
          }
        },
        calcSystem() {
          return this.systemArr.filter((item) => item.id === this.curVersion)[0]
            ?.os;
        },
        calcImg() {
          return this.systemArr.filter((item) => item.id === this.curVersion)[0]
            ?.name;
        },
      },
      methods: {
        /* 系统操作 */
        optSystem(row, type) {
          this.checked = false;
          this.optType = type;
          this.curId = row.id;
          this.reinstallDialog = true;
          this.reinstallData.part_type = 0;
          this.reinstallData.other_user = 0;
          this.reinstallData.user = "";
          this.reinstallData.port = "";
          this.reinstallData.password = "";
          switch (type) {
            case "reinstall":
              this.systemTit = lang.reinstall_system;
              this.getSystemList();
              break;
            case "rescue":
              this.systemTit = lang.rescue;
              break;
            case "reset":
              this.systemTit = lang.reset_password;
              break;
          }
          this.$refs.reinstallForm && this.$refs.reinstallForm.clearValidate();
        },
        // 随机生成密码
        autoPass() {
          let pass =
            this.randomCoding(1) + 0 + this.genEnCode(9, 1, 1, 0, 1, 0);
          this.reinstallData.password = pass;
        },
        onSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            if (
              this.powerStatus === "off" &&
              !this.checked &&
              this.optType === "reset"
            ) {
              return this.$message.error(lang.check_agree_force);
            }
            this.submitLoading = true;
            if (this.optType === "reinstall") {
              this.handlerReinstall();
            } else if (this.optType === "reset") {
              this.handlerReset();
            } else if (this.optType === "rescue") {
              this.handlerRescue();
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },
        // 重装
        async handlerReinstall() {
          try {
            const params = JSON.parse(JSON.stringify(this.reinstallData));
            delete params.system;
            params.id = this.curId;
            const res = await reinstallSystem(params);
            this.$message.success(res.data.msg);
            this.submitLoading = false;
            this.reinstallDialog = false;
            this.queryProgress();
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        // 重置
        async handlerReset() {
          try {
            const params = {
              id: this.curId,
              password: this.reinstallData.password,
              other_user: this.reinstallData.other_user,
              user: this.reinstallData.user,
            };
            const res = await resetPassword(params);
            this.$message.success(res.data.msg);
            this.submitLoading = false;
            this.reinstallDialog = false;
            this.queryProgress();
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        // 救援
        async handlerRescue() {
          try {
            const params = {
              id: this.curId,
              system: this.reinstallData.system,
              password: this.reinstallData.password,
            };
            const res = await rescueSystem(params);
            this.$message.success(res.data.msg);
            this.submitLoading = false;
            this.reinstallDialog = false;
            this.queryProgress();
          } catch (error) {
            console.log(error);
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        // 轮询进度
        queryProgress() {
          try {
            if (!this.optTimer) {
              this.optTimer = setInterval(async () => {
                this.opting = true;
                const res = await getOptProcess({ id: this.curId });
                if (!res.data.data.task_type) {
                  clearInterval(this.optTimer);
                  this.opting = false;
                  this.optTimer = null;
                  this.getProductList();
                }
              }, 500);
            }
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        changeVersion(e) {
          this.reinstallData.os = this.systemArr.filter(
            (item) => item.id === e
          )[0]?.os[0]?.id;
        },
        async getSystemList() {
          try {
            const res = await getOptSystem({ id: this.curId });
            this.systemArr = res.data.data.os || [];
            this.curVersion = this.systemArr[0]?.id;
            this.reinstallData.os = this.systemArr[0]?.os[0]?.id;
          } catch (error) {}
        },
        randomCoding(n) {
          //创建26个字母数组
          var arr = [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "M",
            "N",
            "O",
            "P",
            "Q",
            "R",
            "S",
            "T",
            "U",
            "V",
            "W",
            "X",
            "Y",
            "Z",
          ];
          var idvalue = "";
          for (var i = 0; i < n; i++) {
            idvalue += arr[Math.floor(Math.random() * 26)];
          }
          return idvalue;
        },
        genEnCode(length, hasNum, hasChar, hasSymbol, caseSense, lowerCase) {
          var m = "";
          if (hasNum == 0 && hasChar == 0 && hasSymbol == 0) return m;
          for (var i = length; i >= 0; i--) {
            var num = Math.floor(Math.random() * 94 + 33);
            if (
              (hasNum == 0 && num >= 48 && num <= 57) ||
              (hasChar == 0 &&
                ((num >= 65 && num <= 90) || (num >= 97 && num <= 122))) ||
              (hasSymbol == 0 &&
                ((num >= 33 && num <= 47) ||
                  (num >= 58 && num <= 64) ||
                  (num >= 91 && num <= 96) ||
                  (num >= 123 && num <= 127)))
            ) {
              i++;
              continue;
            }
            m += String.fromCharCode(num);
          }
          if (caseSense == "0") {
            m = lowerCase == "0" ? m.toUpperCase() : m.toLowerCase();
          }
          return m;
        },
        autoPort() {
          this.reinstallData.port = this.genEnCode(3, 1, 0, 0, 0, 0);
        },

        /* 系统操作 end */
        clearKey() {
          this.params.keywords = "";
          this.seacrh();
        },
        goClient(row) {
          if (row.client_id !== 0) {
            const url =
              "http://" + str + `client_detail.htm?client_id=${row.client_id}`;
            window.open(url);
          }
        },
        goProduct(row) {
          if (row.host_id !== 0) {
            const url =
              "http://" +
              str +
              `host_detail.htm?client_id=${row.client_id}&id=${row.host_id}`;
            window.open(url);
          }
        },
        seacrh() {
          this.params.page = 1;
          this.getProductList();
        },
        // 分页变化时触发该事件
        onPageChange(pageInfo, newData) {
          this.pagination.current = pageInfo.current;
          this.pagination.pageSize = pageInfo.pageSize;
        },
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.getProductList();
        },
        closeProduct() {
          this.addManualShow = false;
          this.$refs.productForm.reset();
        },
        // 开机/关机
        handelOpen(row, type) {
          const opObj = {
              on: {
                  text: lang.manual_text52,
                  api: ApiOpenManual
              },
              off: {
                  text: lang.manual_text46,
                  api: ApiOffManual
              },
              re: {
                  text: lang.manual_text47,
                  api: ApiRebootManual
              }
          }
          const confirmDialog = this.$dialog.confirm({
              header: `${lang.manual_text53}${opObj[type].text}?`,
              confirmBtn: {
                  theme: 'primary',
                  content: lang.manual_text53,
                  loading: false,
              },
              cancelBtn: {
                  content: lang.cancel,
                  theme: 'default'
              },

              theme: 'warning',
               onClose: () => {
                  confirmDialog.hide()
              },
              onConfirm: () => {
                  confirmDialog.update({
                     confirmBtn: {
                          loading: true,
                      }
                  })
                  const subApi = opObj[type].api
                  subApi(row.id).then((res) => {
                      this.$message.success(res.data.msg)
                      this.getProductList()
                      confirmDialog.hide()
                  }).catch((err) => {
                      this.$message.error(err.data.msg)
                  }).finally(() => {
                      confirmDialog.update({
                        confirmBtn: {
                              loading: false,
                          }
                      })
                  })
              },
          })
      },
        // 开启控制台
        handelVnc(row) {
          const confirmDialog = this.$dialog.confirm({
            header: lang.manual_text54,
            confirmBtn: {
              content: lang.manual_text53,
              theme: "primary",
              loading: false,
            },
            cancelBtn: {
              theme: "default",
              content: lang.cancel,
            },
            theme: "warning",
            onClose: () => {
              confirmDialog.hide();
            },
            onConfirm: () => {
              confirmDialog.update({ confirmBtn: { loading: true } });
              ApiManualVnc(row.id)
                .then((res) => {
                  window.open(res.data.data.vnc_url, "_blank", "location=yes");
                  confirmDialog.hide();
                })
                .catch((err) => {
                  this.$message.error(err.data.msg);
                })
                .finally(() => {
                  confirmDialog.update({ confirmBtn: { loading: false } });
                });
            },
          });
        },
        // 获取操作系统
        handelOs(row) {
          ApiManualOs(row.id).then((res) => {
            console.log(res.data.data);
          });
        },
        controlChange() {
          this.manualForm.ipmi_ip = "";
          this.manualForm.ipmi_version = "";
          this.manualForm.dcim_client_url = "";
          this.manualForm.dcim_client_id = "";
          this.manualForm.control_username = "";
          this.manualForm.control_password = "";
        },
        closeSupplier() {
          this.supplierShow = false;
          this.$refs.supplierForm.reset();
        },
        async editManual(id) {
          this.editId = id;
          const res = await ApiManualDetail(this.editId);
          const editRow = { ...res.data.data.resource };
          editRow.due_time =
            this.moment(res.data.data.resource.due_time * 1000).format(
              "YYYY-MM-DD HH:mm:ss"
            ) || "";
          this.manualForm = Object.assign(this.manualForm, editRow);
          this.addManualShow = true;
        },
        editSupplier(row) {
          if (this.supplierEdit) {
            this.$message.error(lang.manual_text42);
            return;
          }
          this.supplierEdit = true;
          const { id, name, contact, notes } = row;
          this.supplierEditData.id = id;
          this.supplierEditData.name = name;
          this.supplierEditData.contact = contact;
          this.supplierEditData.notes = notes;
          row.isEdit = true;
        },
        delSupplier(e, row) {
          ApiDelSupplier(row.id)
            .then((res) => {
              this.$message.success(res.data.msg);
              this.getSupplierList();
            })
            .catch((err) => {
              this.$message.error(err.data.msg);
            });
        },
        saveSupplier(row) {
          if (!this.supplierEditData.name) {
            this.$message.error(lang.manual_text43);
            return;
          }
          ApiEditSupplier(this.supplierEditData).then((res) => {
            row.isEdit = false;
            this.supplierEdit = false;
            this.$message.success(res.data.msg);
            this.getSupplierList();
          });
        },
        async addSuplier({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.submitLoading = true
              const params = { ...this.supplierlForm };
              const res = await ApiAddSupplier(params);
              this.$message.success(res.data.msg);
              this.$refs.supplierForm.reset();
              this.supplierEdit = false;
              this.getSupplierList();
              this.submitLoading = false;
            } catch (error) {
              this.submitLoading = false;
              this.$message.error(error.data.msg);
            }
          } else {
            console.log("Errors: ", validateResult);
          }
        },
        cancelEdit(row) {
          this.supplierEdit = false;
          row.isEdit = false;
        },
        getManualStatus() {
          this.data.forEach((item) => {
            ApiManualStatus(item.id)
              .then((res) => {
                item.power_status = res.data.data.status;
              })
              .catch((err) => {
                item.power_status = err.data.data.status;
              });
          });
        },
        handelAddMantal() {
          this.editId = null;
          this.addManualShow = true;
        },
        async submitProduct({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.submitLoading = true;
              const params = { ...this.manualForm };
              params.due_time =
                new Date(this.manualForm.due_time).getTime() / 1000;
              const subApi = this.editId ? ApiEditManual : ApiAddManual;
              const res = await subApi(params);
              this.$message.success(res.data.msg);
              this.closeProduct();
              this.getProductList();
              this.submitLoading = false;
            } catch (error) {
              this.submitLoading = false;
              this.$message.error(error.data.msg);
            }
          } else {
            console.log("Errors: ", validateResult);
          }
        },
        delManual(id) {
          this.delId = id;
          this.delVisible = true;
        },
        sureDel() {
          this.submitLoading = true
          ApiDelManual(this.delId).then((res) => {
            this.$message.success(res.data.msg);
            this.delVisible = false;
            this.getProductList();
          }).finally(() => {
            this.submitLoading = false;
          });
        },
        async getSupplierList() {
          const res = await ApiSupplier({ all: 1 });
          this.pagination.total = res.data.data.count;
          this.supplierList = res.data.data.list.map((item) => {
            item.isEdit = false;
            return item;
          });
        },
        async getProductList() {
          try {
            this.loading = true;
            const res = await ApiManualList(this.params);
            this.data = res.data.data.list;
            this.getManualStatus();
            this.total = res.data.data.count;
            this.loading = false;
          } catch (error) {
            this.loading = false;
          }
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

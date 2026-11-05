(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("template")[0];
    Vue.prototype.lang = window.lang;
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
          theme: "",
          tab: "template/mf101/default_page.htm",
          backUrl: `${str}configuration_theme.htm?name=web_switch`,
          id: "",
          name: "",
          data: [],
          tabList: [],
          tableLayout: false,
          bordered: true,
          visible: false,
          delVisible: false,
          submitLoading: false,
          hover: true,
          loading: false,
          // 图片上传相关
          uploadUrl: str + "v1/upload",
          // uploadUrl: 'https://kfc.idcsmart.com/admin/v1/upload',
          uploadHeaders: {
            Authorization: "Bearer" + " " + localStorage.getItem("backJwt"),
          },
          // banner
          bannerName: "cloud_server_partner",
          bannerColumns: [
            {
              colKey: "drag",
              width: 30,
              className: "drag-icon",
            },
            { colKey: "img", title: lang.partner_logo, width: "300" },
            {
              colKey: "url",
              title: lang.tem_jump_link,
              width: "200",
              ellipsis: true,
            },
            {
              colKey: "time",
              title: lang.tem_time_range,
              width: "230",
              ellipsis: true,
            },
            {
              colKey: "show",
              title: lang.tem_show,
              width: "100",
              ellipsis: true,
            },
            {
              colKey: "notes",
              title: lang.tem_notes,
              width: "150",
              ellipsis: true,
            },
            { colKey: "op", title: lang.tem_opt, width: "120" },
          ],
          isDelBanner: false,
          tempBanner: [],
          editFile: [],
          editItem: {
            id: "",
            url: "",
            img: [],
            show: false,
            notes: "",
            edit: false,
            timeRange: [],
          },
          delLoading: false,
          curId: "",
          optType: "",
          optTitle: "",
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          /* 侧边栏 */
          curValue: "",
          sliderArr: [
            {
              value: "index",
              label: lang.home,
            },
            {
              value: "active",
              label: lang.new_active,
            },
            {
              value: "cloud",
              label: lang.temp_host_cloud,
            },
            {
              value: "dcim",
              label: lang.temp_host_dcim,
            },
          ],
          // 基础表格
          baseColumns: [
            { colKey: "title", title: lang.temp_title, ellipsis: true },
            { colKey: "description", title: lang.mf_101_text7, ellipsis: true },
            { colKey: "op", title: lang.tem_opt, width: "120" },
          ],
          // 首页表格
          indexColumns: [
            { colKey: "summary", title: lang.mf_101_text6, ellipsis: true },
            { colKey: "description", title: lang.description, ellipsis: true },
            { colKey: "op", title: lang.tem_opt, width: "120" },
          ],
          activeColumns: [
            { colKey: "title", title: lang.product_name, ellipsis: true },
            {
              colKey: "description",
              title: lang.temp_product_descript,
              ellipsis: true,
            },
            { colKey: "product_id", title: lang.temp_product, ellipsis: true },
            { colKey: "op", title: lang.tem_opt, width: "120" },
          ],
          baseFormData: {
            id: "",
            title: "",
            price: null,
            description: "",
            product_id: "",
            price_unit: "month",
            url: "",
            cpu: "",
            memory: "",
            disk: "",
            bandwidth: "",
            image: "",
            duration: "",
            data_center: "",
          },
          iconArr: [],
          baseRules: {
            summary: [
              {
                required: true,
                message: `${lang.tem_input}${lang.mf_101_text6}`,
                type: "error",
              },
            ],
            title: [
              {
                required: true,
                message: `${lang.tem_input}${lang.temp_title}`,
                type: "error",
              },
            ],
            price: [
              {
                required: true,
                message: `${lang.tem_input}${lang.temp_price}`,
                type: "error",
              },
            ],
            description: [
              {
                required: true,
                message: `${lang.tem_input}${lang.temp_description}`,
                type: "error",
              },
            ],
            product_id: [
              {
                required: true,
                message: `${lang.tem_input}${lang.temp_product}`,
                type: "error",
              },
            ],
            icon: [
              {
                required: true,
                message: `${lang.attachment}${lang.mf_101_text8}`,
                type: "error",
              },
            ],
            image: [
              {
                required: true,
                message: `${lang.tem_input}${lang.mf_101_text9}`,
                type: "error",
              },
            ],
            duration: [
              {
                required: true,
                message: `${lang.tem_input}${lang.mf_101_text10}`,
                type: "error",
              },
            ],
            data_center: [
              {
                required: true,
                message: `${lang.tem_input}${lang.mf_101_text11}`,
                type: "error",
              },
            ],
            ip_num: [
              {
                required: true,
                message: `${lang.tem_input}${lang.temp_ip_num}`,
                type: "error",
              },
            ],
            bandwidth: [
              {
                required: true,
                message: `${lang.tem_input}${lang.temp_bw}`,
                type: "error",
              },
            ],
            cpu: [
              {
                required: true,
                message: `${lang.tem_input}${lang.temp_cpu}`,
                type: "error",
              },
            ],
            memory: [
              {
                required: true,
                message: `${lang.tem_input}${lang.temp_memory}`,
                type: "error",
              },
            ],
            disk: [
              {
                required: true,
                message: `${lang.tem_input}${lang.temp_disk}`,
                type: "error",
              },
            ],
            price: [
              {
                required: true,
                message: `${lang.tem_input}${lang.temp_sell_price}`,
                type: "error",
              },
            ],
            url: [
              {
                required: true,
                message: `${lang.tem_input}${lang.tem_jump_link}`,
                type: "error",
              },
              {
                pattern:
                  /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/,
                message: lang.tem_tip1,
                type: "warning",
              },
            ],
          },
          baseVisible: false,
          baseList: [],
          icp_product_id: "",
          deleteType: "",
          // 更多优惠 | 商标延申服务
          moreName: "",
          moreList: [],
          moreColumns: [
            { colKey: "title", title: lang.temp_title, ellipsis: true },
            { colKey: "description", title: lang.description, ellipsis: true },
            { colKey: "product_id", title: lang.temp_product, ellipsis: true },
            { colKey: "op", title: lang.tem_opt, width: "120" },
          ],
          moreLoadng: false,
          unitSelect: [
            { value: "month", label: lang.temp_month },
            { value: "year", label: lang.temp_year },
          ],
          bwUnitSelect: [
            { value: "month", label: `M/${lang.temp_month}` },
            { value: "year", label: `M/${lang.temp_year}` },
          ],
          isDelMore: false,
          // 区域
          areaName: "",
          areaForm: {
            first_area: "",
            second_area: "",
          },
          areaVisble: false,
          areaList: [],
          hostAreaSelect: [], // cloud dicm
          areaLoading: false,
          areaColumns: [
            { colKey: "id", title: "ID", ellipsis: true },
            {
              colKey: "first_area",
              title: lang.temp_first_area,
              ellipsis: true,
            },
            {
              colKey: "second_area",
              title: lang.temp_second_area,
              ellipsis: true,
            },
            { colKey: "op", title: lang.tem_opt, width: "120" },
          ],
          isDelArea: false,
          // 服务器托管
          serverList: [],
          serverLoading: false,
          serverColumns: [
            { colKey: "first_area", title: lang.temp_area, ellipsis: true },
            { colKey: "title", title: lang.temp_title, ellipsis: true },
            { colKey: "product_id", title: lang.temp_product, ellipsis: true },
            { colKey: "op", title: lang.tem_opt, width: "120" },
          ],
          // 产品弹窗
          hostVisible: false,
          hostFormData: {
            title: "",
            ip_num: "",
            bandwidth: "",
            price: null,
            price_unit: "month",
            product_id: "",
            // cloud dcim 专属
            description: "",
            // dcim 专属
            cpu: "",
            memory: "",
            disk: "",
            icon: "",
          },
          hostColumns: [
            {
              colKey: "first_area",
              title: lang.temp_first_area,
              ellipsis: true,
            },
            {
              colKey: "second_area",
              title: lang.temp_second_area,
              ellipsis: true,
            },
            { colKey: "title", title: lang.temp_product_name, ellipsis: true },
            {
              colKey: "description",
              title: lang.temp_product_descript,
              ellipsis: true,
            },
            {
              colKey: "product_id",
              title: lang.temp_product,
              width: "150",
              ellipsis: true,
            },
            { colKey: "op", title: lang.tem_opt, width: "120" },
          ],
          hostName: "",
          hostConfig: {
            cloud_server_more_offers: 0,
            physical_server_more_offers: 0,
          },
          calcHostArea: [],
          delDialog: false,
          upgradeDialog: false,
          themeInfo: {},
          cloudList: [],
          dcimList: [],
          commonList: [],
        };
      },
      created() {
        this.theme = getQuery().theme || "";
        this.getTabList();
        this.getThemeInfo();
        this.changeSlider("index");
        this.getProductList("mf_dcim");
        this.getProductList("mf_cloud");
        this.getProductList("idcsmart_common");
      },
      watch: {
        iconArr(val) {
          if (val.length > 0) {
            this.hostFormData.icon = val[0].url;
          } else {
            this.hostFormData.icon = "";
          }
        },
      },
      filters: {
        filterMoney(money) {
          if (isNaN(money)) {
            return "0.00";
          } else {
            const temp = `${money}`.split(".");
            return parseInt(temp[0]).toLocaleString() + "." + (temp[1] || "00");
          }
        },
      },
      computed: {
        calcTit() {
          switch (this.curValue) {
            case "index":
              return lang.mf_101_text5;
            case "active":
              return lang.mf_101_text1;
          }
        },
        calcColumns() {
          switch (this.curValue) {
            case "index":
              return this.indexColumns;
            case "active":
              return this.activeColumns;
            case "cloud":
            case "dcim":
              return this.hostColumns;
            default:
              return this.baseColumns;
          }
        },
        hostList() {
          switch (this.curValue) {
            case "index":
              return this.cloudList;
            case "cloud":
              return this.cloudList;
            case "dcim":
              return this.dcimList;
            default:
              return [...this.commonList, ...this.dcimList, ...this.cloudList];
          }
        },
      },
      methods: {
        getProductList(module) {
          getHostProductList(module).then((res) => {
            const list = [];
            res.data.data.list.forEach((item) => {
              if (item.child.length > 0) {
                item.child.forEach((item1) => {
                  if (item1.child.length > 0) {
                    item1.child.forEach((item2) => {
                      list.push(item2);
                    });
                  }
                });
              }
            });
            if (module === "idcsmart_common") {
              this.commonList = list;
            } else if (module === "mf_dcim") {
              this.dcimList = list;
            } else if (module === "mf_cloud") {
              this.cloudList = list;
            }
          });
        },
        sureUpgrade() {
          this.submitLoading = true;
          upgradeTheme({ theme: this.theme })
            .then((res) => {
              this.submitLoading = false;
              this.upgradeDialog = false;
              this.$message.success(res.data.msg);
              window.location.reload();
            })
            .catch((err) => {
              this.submitLoading = false;
              this.$message.error(err.data.msg);
            });
        },
        sureDel() {
          this.delLoading = true;
          uninstallTheme(this.theme)
            .then((res) => {
              this.$message.success(res.data.msg);
              this.delLoading = false;
              this.delDialog = false;
              location.href = this.backUrl;
            })
            .catch((err) => {
              this.delLoading = false;
              this.$message.error(err.data.msg);
            });
        },
        handleUpgrade() {
          this.upgradeDialog = true;
        },
        getThemeInfo() {
          getThemeLatestVersion(this.theme).then((res) => {
            this.themeInfo = res.data.data;
          });
        },
        handleDelete() {
          this.delDialog = true;
        },
        changeFir(val) {
          this.calcHostArea = this.hostAreaSelect[val]?.children;
        },
        changeTab(val) {
          const curPath = location.pathname
            .split("/")
            .find((item) => item.indexOf("htm") !== -1);
          if (val === curPath) {
            return;
          }
          location.href = str + val + `?theme=${this.theme}`;
        },
        changeSlider(val) {
          if (this.curValue === val) {
            return;
          }
          this.baseList = [];
          this.moreList = [];
          this.curValue = val;
          switch (val) {
            case "index":
              this.name = "index_introduce";
              this.getBaseList();
              // 获取热销
              this.moreName = "index_product";
              this.getMoreList();
              break;
            case "active":
              this.name = "activity_flash_sale";
              this.getBaseList();
              // 获取热销
              this.moreName = "activity_hot_sale";
              this.getMoreList();
              break;
            case "cloud":
              // 获取热销
              this.moreName = "cloud_server_product";
              this.getMoreList();
              // 获取合作伙伴
              this.bannerName = `cloud_server_partner`; // banner
              this.getBannerList();
              break;
            case "dcim":
              // 获取热销
              this.moreName = "physical_server_product";
              this.getMoreList();
              // 获取合作伙伴
              this.bannerName = `physical_server_partner`; // banner
              this.getBannerList();
              break;
          }
          this.$refs.baseDialog && this.$refs.baseDialog.reset();
          this.$refs.hostDialog && this.$refs.hostDialog.reset();
        },
        async hostSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.submitLoading = true;
              const params = JSON.parse(JSON.stringify(this.hostFormData));
              if (this.optType === "add") {
                delete params.id;
              }
              const res = await apiEditDataItem(
                this.name,
                this.optType,
                params
              );
              this.$message.success(res.data.msg);
              this.getMoreList();
              this.hostVisible = false;
              this.submitLoading = false;
            } catch (error) {
              this.submitLoading = false;
              this.$message.error(error.data.msg);
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },
        /* host config */
        async getHostConfig() {
          try {
            const res = await getControllerConfig(this.hostName);
            this.hostConfig = Object.assign(this.hostConfig, res.data.data);
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        async changeHostConfig(val) {
          try {
            let params = {};
            if (this.hostName === "cloud_server") {
              params.cloud_server_more_offers = val;
            }
            if (this.hostName === "physical_server") {
              params.physical_server_more_offers = val;
            }
            const res = await saveControllerConfig(this.hostName, params);
            this.$message.success(res.data.msg);
            this.getHostConfig();
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        /* host config end */
        /* area */
        manageArea() {
          this.areaVisble = true;
          this.optType = "add";
        },
        getTabList() {
          getTemplateControllerTab({ theme: this.theme }).then((res) => {
            this.tabList = res.data.data.list;
          });
        },

        /* area end */
        /* more */
        async getMoreList() {
          try {
            this.moreLoadng = true;
            const res = await apiDataList(this.moreName);
            this.moreList = res.data.data.list;
            this.moreLoadng = false;
          } catch (error) {
            this.moreLoadng = false;
            this.$message.error(error.data.msg);
          }
        },
        editMore(row) {
          this.handleMoreName();
          this.optType = "update";
          this.optTitle = lang.tem_edit;
          this.baseVisible = true;
          this.baseFormData = JSON.parse(JSON.stringify(row));
        },
        handleMoreAdd() {
          this.optTitle = lang.tem_add;
          this.baseVisible = true;
          this.baseFormData.price_unit = "month";
          this.optType = "add";
          this.handleMoreName();
          this.$refs.baseDialog && this.$refs.baseDialog.reset();
        },
        /* more end */
        // 处理多个表格name
        handleBaseName() {
          switch (
            this.curValue // 存在多个表格： cloud dcim brand
          ) {
            case "cloud":
              this.name = "cloud_server_product";
              break;
            case "dcim":
              this.name = "physical_server_product";
              break;
            case "active":
              this.name = "activity_hot_sale";
              break;
            case "index":
              this.name = "index_product";
              break;
          }
        },
        handleMoreName() {
          switch (
            this.curValue // 存在多个表格： cloud dcim brand
          ) {
            case "cloud":
              this.name = "cloud_server_product";
              break;
            case "dcim":
              this.name = "physical_server_product";
              break;
            case "active":
              this.name = "activity_flash_sale";
              break;
            case "index":
              this.name = "index_introduce";
              break;
          }
        },
        handelIndexDes() {
          this.optTitle = lang.tem_add;
          this.name = "index_introduce";
          this.baseVisible = true;
          this.baseFormData.price_unit = "month";
          this.optType = "add";
          this.$refs.baseDialog && this.$refs.baseDialog.reset();
          this.$refs.hostDialog && this.$refs.hostDialog.reset();
        },
        /* base */
        handleBaseAdd() {
          this.optTitle = lang.tem_add;
          this.handleBaseName();
          this.hostVisible = true;
          this.optTitle = `${lang.tem_add}${lang.temp_host}`;
          this.hostFormData.price_unit = "month";
          this.optType = "add";
          this.iconArr = [];
          this.$refs.baseDialog && this.$refs.baseDialog.reset();
          this.$refs.hostDialog && this.$refs.hostDialog.reset();
        },
        editBase(row) {
          this.handleBaseName();
          this.optType = "update";
          this.optTitle = lang.tem_edit;
          this.hostVisible = true;
          this.optTitle = `${lang.tem_edit}${lang.temp_host}`;
          this.hostFormData = JSON.parse(JSON.stringify(row));
          if (row.icon) {
            this.iconArr = [{ url: row.icon }];
          }
        },

        changePrice(val) {
          if (val < 0) {
            this.baseFormData.price = 0;
          }
        },
        async getBaseList() {
          try {
            this.loading = true;
            const res = await apiDataList(this.name);
            this.baseList = res.data.data.list;
            this.loading = false;
          } catch (error) {
            this.loading = false;
            this.$message.error(error.data.msg);
          }
        },
        async baseSubmit({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.submitLoading = true;
              const params = JSON.parse(JSON.stringify(this.baseFormData));
              if (this.optType === "add") {
                delete params.id;
              }
              const res = await apiEditDataItem(
                this.name,
                this.optType,
                params
              );
              this.$message.success(res.data.msg);
              this.getBaseList(this.name);
              this.baseVisible = false;
              this.submitLoading = false;
            } catch (error) {
              this.submitLoading = false;
              this.$message.error(error.data.msg);
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },
        /* base end */
        /* icp */
        async getIcpConfig() {
          try {
            const res = await getControllerConfig("icp");
            this.icp_product_id = res.data.data.icp_product_id;
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        async deleteBase() {
          try {
            this.delLoading = true;
            const res = await apiDelDataItem(this.name, {
              id: this.curId,
            });
            this.$message.success(res.data.msg);
            // 删除更多
            if (this.isDelMore) {
              this.isDelMore = false;
              this.getBaseList(this.name);
            } else {
              this.getMoreList(this.name);
            }
            this.delVisible = false;
            this.delLoading = false;
          } catch (error) {
            this.delVisible = false;
            this.delLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        async saveIcp() {
          try {
            if (!this.icp_product_id) {
              return this.$message.error(`${lang.tem_input}ID`);
            }
            this.submitLoading = true;
            const res = await saveControllerConfig("icp", {
              icp_product_id: this.icp_product_id,
            });
            this.submitLoading = false;
            this.$message.success(res.data.msg);
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        comDel(type, row) {
          this.handleBaseName();
          this.deleteType = type;
          this.curId = row.id;
          this.delVisible = true;
          this.isDelMore = false;
        },
        comMoreDel(type, row) {
          this.deleteType = type;
          this.curId = row.id;
          this.delVisible = true;
          this.isDelMore = true;
          this.handleMoreName();
        },
        sureDelete() {
          if (this.isDelBanner) {
            this.isDelBanner = false;
            this.deleteBanner();
          } else {
            this.deleteBase();
          }
        },
        /* banner */
        addBanner() {
          this.tempBanner = this.tempBanner
            .filter((item) => item.id)
            .map((item) => {
              item.edit = false;
              return item;
            });
          this.tempBanner.push({
            url: "",
            img: "",
            start_time: "",
            end_time: "",
            show: 0,
            notes: "",
            edit: true,
            timeRange: [],
          });
          this.editItem = {
            id: "",
            url: "",
            img: [],
            show: 0,
            notes: "",
            edit: false,
            timeRange: [],
          };
          this.optType = "add";
        },
        handlerEdit(row) {
          this.tempBanner = this.tempBanner
            .filter((item) => item.id)
            .map((item) => {
              item.edit = false;
              return item;
            });
          row.edit = true;
          this.optType = "update";
          this.editItem = JSON.parse(JSON.stringify(row));
          this.editItem.img = [{ url: row.img }];
          this.editItem.timeRange = [
            moment.unix(row.start_time).format("YYYY/MM/DD"),
            moment.unix(row.end_time).format("YYYY/MM/DD"),
          ];
        },
        delBanner(row) {
          this.delVisible = true;
          this.isDelBanner = true;
          this.curId = row.id;
        },
        async changeShow(e, row) {
          try {
            if (row.edit) {
              return false;
            }
            const res = await apiChangeStatus(this.bannerName, {
              id: row.id,
              show: e,
            });
            this.$message.success(res.data.msg);
            this.getBannerList();
          } catch (error) {
            this.$message.error(error.data.msg);
            this.getBannerList();
          }
        },
        async deleteBanner() {
          try {
            this.delLoading = true;
            const res = await apiDelDataItem(this.bannerName, {
              id: this.curId,
            });
            this.$message.success(res.data.msg);
            this.delVisible = false;
            this.getBannerList();
            this.delLoading = false;
          } catch (error) {
            this.delLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        cancelItem(row, index) {
          if (!row.id) {
            this.tempBanner.splice(index, 1);
          }
          row.edit = false;
        },
        changeFile(file) {
          this.editItem.img = [
            {
              url: file.response.data.image_url,
            },
          ];
        },
        async saveBannerItem(row, index) {
          try {
            const temp = JSON.parse(JSON.stringify(this.editItem));
            if (temp.img.length === 0) {
              return this.$message.error(`${lang.upload}${lang.picture}`);
            }
            if (temp.timeRange.length === 0) {
              return this.$message.error(`${lang.select}${lang.time}`);
            }
            if (!temp.url) {
              return this.$message.error(`${lang.input}${lang.feed_link}`);
            }
            const reg =
              /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/;
            if (temp.url && !reg.test(temp.url)) {
              return this.$message.error(`${lang.input}${lang.feed_tip}`);
            }
            temp.start_time = parseInt(
              new Date(temp.timeRange[0].replaceAll("-", "/")).getTime() / 1000
            );
            temp.end_time = parseInt(
              new Date(temp.timeRange[1].replaceAll("-", "/")).getTime() / 1000
            );
            if (temp.lastModified) {
              temp.img = temp.img[0]?.response.data.image_url;
            } else {
              temp.img = temp.img[0].url;
            }
            temp.edit = false;
            if (this.optType === "add") {
              delete temp.id;
            }
            temp.show = row.show;
            const res = await apiEditDataItem(
              this.bannerName,
              this.optType,
              temp
            );
            this.$message.success(res.data.msg);
            this.getBannerList();
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        deleteTabLogo(e) {
          this.iconArr = [];
          e.stopPropagation();
        },
        async onDragSort(params) {
          try {
            this.tempBanner = params.currentData;
            const arr = this.tempBanner.reduce((all, cur) => {
              all.push(cur.id);
              return all;
            }, []);
            const res = await apiSrotOrder(this.bannerName, {
              id: arr,
              theme: this.theme,
            });
            this.$message.success(res.data.msg);
            this.getBannerList();
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        formatImgResponse(res) {
          if (res.status === 200) {
            return { url: res.data.image_url };
          } else {
            return this.$message.error(res.msg);
          }
        },
        // 获取banner数据
        async getBannerList() {
          try {
            this.loading = true;
            const res = await apiDataList(this.bannerName);
            this.tempBanner = res.data.data.list.map((item) => {
              item.edit = false;
              return item;
            });
            this.loading = false;
          } catch (error) {
            this.loading = false;
            this.$message.error(error.data.msg);
          }
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

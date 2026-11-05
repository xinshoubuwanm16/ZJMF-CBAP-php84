(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("wanyun-ip")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang)
    new Vue({
      components: {
        comConfig
      },
      data () {
        return {
          data: [],
          tableLayout: false,
          bordered: true,
          visible: false,
          delVisible: false,
          statusVisble: false,
          hover: true,
          syncLoading: false,
          columns: [
            {
              colKey: "ips",
              title: lang.wy_ip_segment,
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "group_name",
              title: lang.wy_group,
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "ip_num",
              title: lang.wy_ip_num,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "ip_num_enable",
              title: lang.wy_usable,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "ip_num_used",
              title: lang.wy_used,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "notes",
              title: lang.wy_notes,
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "op",
              title: lang.wy_opt,
              width: 120,
              ellipsis: true,
            },
          ],
          subColumns: [
            {
              colKey: "ips",
              title: lang.wy_subnet,
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "subnet_mask",
              title: lang.wy_subnet_mask,
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "group_name",
              title: lang.wy_group,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "ip_num_enable",
              title: lang.wy_usable,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "ip_num_used",
              title: lang.wy_used,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "notes",
              title: lang.wy_notes,
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "op",
              title: lang.wy_opt,
              width: 120,
              ellipsis: true,
            },
          ],
          hideSortTips: true,
          params: {
            keywords: "",
            group_id: "",
            page: 1,
            limit: 20
          },
          curLevelId: "",
          total: 0,
          pageSizeOptions: [20, 50, 100],
          loading: false,
          ipGroup: [],
          expandedRowKeys: [],
          submitLoading: false,
          configVisible: false,
          formData: {
            server_id: ""
          },
          rules: {
            server_id: [{ required: true, message: `DCIM${lang.wy_interface}`, type: "error" }],
          },
          serverList: [],
          /* IP段详情 */
          ipColumns: [
            {
              colKey: "ip",
              title: "IP",
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "use_time",
              title: lang.wy_time,
              width: 180,
              ellipsis: true,
            },
            {
              colKey: "notes",
              title: lang.wy_notes,
              width: 200,
              ellipsis: true,
            },
          ],
          curIp: "",
          ipLoading: false,
          ipDialog: false,
          ipList: []
        };
      },
      filters: {
        formateTime (time) {
          if (time && time !== 0) {
            function formateDate (time) {
              const date = new Date(time);
              Y = date.getFullYear() + "-";
              M =
                (date.getMonth() + 1 < 10
                  ? "0" + (date.getMonth() + 1)
                  : date.getMonth() + 1) + "-";
              D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " ";
              h = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
              m = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
              return Y + M + D + h + m;
            }
            return formateDate(time * 1000);
          } else {
            return "--";
          }
        },
      },
      created () {
        this.getWanYunIp();
        this.getServer();
      },
      methods: {
        /* IP段详情 */
        async lookIp (row, sub) {
          try {
            this.ipList = [];
            this.ipDialog = true;
            this.ipLoading = true;
            this.curIp = sub ? sub.ips : row.ips;
            const params = {
              ips_id: row.id
            };
            if (sub) {
              params.ips_sub_id = sub.id;
            }
            const res = await getIpsDetails(params);
            this.ipList = res.data.data.list;
            this.ipLoading = false;
          } catch (error) {
            this.ipLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        /* IP段详情 end */
        async handlerDcim () {
          try {
            this.configVisible = true;
            const res = await getDcimConfig();
            this.formData.server_id = res.data.data.server_id || '';
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        async submitDcim ({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              this.submitLoading = true;
              const res = await saveDcimConfig(this.formData);
              this.$message.success(res.data.msg);
              this.configVisible = false;
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
        async getServer () {
          try {
            const res = await getDcimServer({
              page: 1,
              limit: 1000,
              module: "mf_dcim"
            });
            this.serverList = res.data.data.list;
          } catch (error) {

          }
        },
        handlerExpand (row) {
          row.expand = !row.expand;
          if (row.expand) {
            this.expandedRowKeys = [row.id];
          } else {
            this.expandedRowKeys = [];
          }
        },
        async handlerSync () {
          try {
            this.syncLoading = true;
            const res = await syncDcimConfig();
            this.syncLoading = false;
            this.$message.success(lang.wy_tip2);
            this.getWanYunIp();
          } catch (error) {
            this.syncLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        // 获取列表
        async getWanYunIp () {
          try {
            this.loading = true;
            const res = await getIps(this.params);
            this.loading = false;
            this.data = res.data.data.list.map(item => {
              item.expand = false;
              return item;
            });
            this.total = res.data.data.count;
            this.ipGroup = res.data.data.ip_group;
            this.expandedRowKeys = [];
          } catch (error) {
            this.loading = false;
            this.$message.error(error.data.msg);
          }
        },
        // 切换分页
        changePage (e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.params.keywords = "";
          this.getWanYunIp();
        },
        // 排序
        sortChange (val) {
          if (!val) {
            this.params.orderby = "id";
            this.params.sort = "desc";
          } else {
            this.params.orderby = val.sortBy;
            this.params.sort = val.descending ? "desc" : "asc";
          }
          this.getWanYunIp();
        },
        clearKey () {
          this.params.keywords = "";
          this.seacrh();
        },
        seacrh () {
          this.params.page = 1;
          this.getWanYunIp();
        },
        close () {
          this.visible = false;
          this.$refs.userDialog.reset();
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

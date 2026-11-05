(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("fiber-manage")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        comConfig,
      },
      data() {
        return {
          data: [],
          tableLayout: false,
          bordered: true,
          visible: false,
          delVisible: false,
          statusVisble: false,
          hover: true,
          currency_prefix:
            JSON.parse(localStorage.getItem("common_set")).currency_prefix ||
            "¥",
          columns: [
            {
              colKey: "fiber_num",
              title: lang.wy_fiber_num,
              width: 100,
              ellipsis: true,
              sortType: "all",
              sorter: true,
            },
            {
              colKey: "owner",
              title: lang.wy_fiber_belong,
              width: 100,
              ellipsis: true,
              sortType: "all",
              sorter: true,
            },
            {
              colKey: "core_num",
              title: lang.wy_core,
              width: 80,
              ellipsis: true,
              sortType: "all",
              sorter: true,
            },
            {
              colKey: "path",
              title: lang.wy_path_node,
              width: 150,
            },
            {
              colKey: "open_unit",
              title: lang.wy_open_unit,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "construction_unit",
              title: lang.wy_construction_unit,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "contact",
              title: lang.wy_contact,
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "project",
              title: lang.wy_project,
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "price",
              title: lang.wy_price,
              width: 120,
              ellipsis: true,
              sortType: "all",
              sorter: true,
            },
            {
              colKey: "notes",
              title: lang.wy_notes,
              width: 120,
              ellipsis: true,
            },
            {
              colKey: "op",
              title: lang.wy_opt,
              width: 120,
              ellipsis: true,
            },
          ],
          typeColumns: [
            {
              colKey: "id",
              title: "ID",
              width: 160,
              ellipsis: true,
            },
            {
              colKey: "name",
              title: lang.wy_type,
            },
            {
              colKey: "op",
              title: lang.wy_opt,
              width: 80,
              ellipsis: true,
            },
          ],
          hideSortTips: true,
          params: {
            page: 1,
            limit: 20,
            orderby: "id",
            sort: "desc",
            owner: "",
            keywords: "",
            node_id: "",
          },
          fiberBelong: [],
          curLevelId: "",
          total: 0,
          pageSizeOptions: [20, 50, 100],
          loading: false,
          submitLoading: false,
          rules: {
            fiber_num: [
              {
                required: true,
                message: `${lang.wy_input}${lang.wy_fiber_num}`,
                type: "error",
              },
            ],
            owner: [
              {
                required: true,
                message: `${lang.wy_input}${lang.wy_fiber_belong}`,
                type: "error",
              },
            ],
            core_num: [
              {
                required: true,
                message: `${lang.wy_input}${lang.wy_core}`,
                type: "error",
              },
            ],
            node_id: [
              {
                required: true,
                message: `${lang.wy_select}${lang.wy_path_node}`,
                type: "error",
              },
              {
                validator: (val) => val.length >= 2,
                message: lang.wy_tip4,
                type: "warning",
              },
            ],
          },
          delType: "", // vlan, vlanType
          optType: "",
          optTitle: "",
          fiberVisble: false,
          formData: {
            // fiber
            fiber_num: null,
            owner: "",
            core_num: null,
            open_unit: "",
            construction_unit: "",
            contact: "",
            project: "",
            price: null,
            node_id: [],
            notes: "",
          },
          curId: "",
          /* 途径节点 */
          nodeList: [],
          nodeSelect: [], // 已选节点
          nodeColumns: [
            {
              colKey: "drag",
              width: 30,
            },
            {
              colKey: "text",
              title: "",
            },
          ],
          /* 纤芯概览 */
          viewVisible: false,
          coreNum: "",
          coreLoading: false,
          fiberCoreData: [],
          coreColumns: [
            {
              colKey: "num",
              title: lang.wy_core_num,
              width: 80,
              ellipsis: true,
            },
            {
              colKey: "path",
              title: lang.wy_path_node,
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "notes",
              title: lang.wy_notes,
              width: 200,
              ellipsis: true,
            },
          ],
          isEn: localStorage.getItem("backLang") === "en-us" ? true : false
        };
      },
      computed: {
        calcPath() {
          return (node) => {
            return node.map((item) => item.name).join("->");
          };
        },
        calcDetail() {
          return (node) => {
            return node
              .map((item) => {
                let str = "";
                str += `${item.name}-${item.type_name}`;
                // Object.values(item.self_defined_field).forEach(el => {
                //   str += `-${el}`;
                // });
                return str;
              })
              .join("\n");
          };
        },
        calcNode() {
          const temp = JSON.parse(JSON.stringify(this.nodeList));
          temp.shift();
          return temp;
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
      created() {
        this.getFiberList();
        this.getNodeData();
      },
      methods: {
        jumpNode() {
          location.href = "node_manage.htm";
        },
        /* fiber */
        addFiber() {
          this.fiberVisble = true;
          this.optType = "add";
          this.optTitle = `${lang.wy_add}${lang.wy_fiber}`;
          this.nodeSelect = [];
          this.formData = {
            fiber_num: undefined,
            owner: "",
            core_num: undefined,
            open_unit: "",
            construction_unit: "",
            contact: "",
            project: "",
            price: undefined,
            node_id: [],
            notes: "",
          };
          this.$nextTick(() => {
            this.$refs.valnDialog.reset();
          });
        },
        editFiber(row) {
          this.optType = "update";
          this.fiberVisble = true;
          this.optTitle = `${lang.wy_edit}${lang.wy_fiber}`;
          row.node_id = row.path_node.map((item) => item.id);
          row.price = row.price * 1;
          this.formData = JSON.parse(JSON.stringify(row));
          this.nodeSelect = row.path_node.map((item) => {
            let str = "";
            str += `${item.name}-${item.type_name}`;
            item.self_defined_field.forEach((el) => {
              str += `-${el.value}`;
            });
            item.text = str;
            return item;
          });
        },
        async sureDelete() {
          try {
            this.submitLoading = true;
            const res = await delFiber({
              id: this.curId,
            });
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.success(res.data.msg);
            this.getFiberList();
          } catch (error) {
            this.delVisible = false;
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        handlerDel(row) {
          this.curId = row.id;
          this.delVisible = true;
        },
        async submitFiber({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              const params = JSON.parse(JSON.stringify(this.formData));
              if (this.optType === "add") {
                delete params.id;
              }
              this.submitLoading = true;
              params.node_id = this.nodeSelect.map((item) => item.id);
              const res = await addAndEditFiber(this.optType, params);
              this.$message.success(res.data.msg);
              this.fiberVisble = false;
              this.submitLoading = false;
              this.getFiberList();
            } catch (error) {
              console.log("EEEEerror", error);
              this.submitLoading = false;
              this.$message.error(error.data.msg);
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },
        /* 途径节点 */
        removeItem(row) {
          this.formData.node_id = this.formData.node_id.filter(
            (item) => item !== row.id
          );
          this.nodeSelect = this.nodeSelect.filter(
            (item) => item.id !== row.id
          );
        },
        changeNode(e) {
          this.nodeSelect = [];
          this.nodeSelect = this.nodeList.filter((item) => e.includes(item.id));
        },
        onDragSort(params) {
          this.nodeSelect.splice(0, this.nodeSelect.length, ...params.newData);
        },
        async getNodeData() {
          try {
            const res = await getResourceNode({
              page: 1,
              limit: 9999,
            });
            const temp = res.data.data.list.map((item) => {
              let str = "";
              str += `${item.name}-${item.type_name}`;
              item.self_defined_field.forEach((el) => {
                str += `-${el.value}`;
              });
              item.text = str;
              return item;
            });
            temp.unshift({ text: lang.wy_select_all, checkAll: true });
            this.nodeList = temp;
          } catch (error) {}
        },
        /* 途径节点 end */
        /* 纤芯概览 */
        async lookDetails(row) {
          try {
            this.viewVisible = true;
            this.curId = row.id;
            this.coreNum = row.fiber_num;
            this.coreLoading = true;
            const res = await getFiberCore({
              id: row.id,
              pgae: 1,
              limit: 9999,
            });
            this.coreLoading = false;
            this.fiberCoreData = res.data.data.list;
          } catch (error) {
            this.coreLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        jumpCore(row) {
          location.href = `fiber_core_manage.htm?id=${row.id}&fiber_num=${row.fiber_num}`;
        },
        // 获取列表
        async getFiberList() {
          try {
            this.loading = true;
            const res = await getFiber(this.params);
            this.loading = false;
            this.data = res.data.data.list;
            this.total = res.data.data.count;
            this.fiberBelong = res.data.data.owner;
          } catch (error) {
            this.loading = false;
            this.$message.error(error.data.msg);
          }
        },
        // 切换分页
        changePage(e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.params.keywords = "";
          this.getFiberList();
        },
        // 排序
        sortChange(val) {
          if (!val) {
            this.params.orderby = "id";
            this.params.sort = "desc";
          } else {
            this.params.orderby = val.sortBy;
            this.params.sort = val.descending ? "desc" : "asc";
          }
          this.getFiberList();
        },
        clearKey() {
          this.params.keywords = "";
          this.seacrh();
        },
        seacrh() {
          this.params.page = 1;
          this.getFiberList();
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

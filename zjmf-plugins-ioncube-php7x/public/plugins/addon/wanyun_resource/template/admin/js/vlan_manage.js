(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("vlan-manage")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    const host = location.origin;
    const fir = location.pathname.split("/")[1];
    const str = `${host}/${fir}`;
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
          baseUrl: str,
          columns: [
            {
              colKey: "vlanid",
              title: 'VLAN ID',
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "name",
              title: lang.wy_name,
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "type_name",
              title: lang.wy_type,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "assignor",
              title: lang.wy_assignor,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "user",
              title: lang.wy_user,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "use_unit",
              title: lang.wy_use_unit,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "path",
              title: lang.wy_path_node,
              width: 150,
            },
            {
              colKey: "status",
              title: lang.wy_status,
              width: 120,
              ellipsis: true,
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
              title: 'ID',
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
            keywords: "",
            status: "",
            page: 1,
            limit: 20
          },
          curLevelId: "",
          total: 0,
          pageSizeOptions: [20, 50, 100],
          loading: false,
          vlanStatus: [
            {
              id: '',
              name: lang.wy_all
            },
            {
              id: '0',
              name: lang.wy_deactivate
            },
            {
              id: '1',
              name: lang.wy_enable
            }
          ],
          submitLoading: false,
          rules: {
            vlanid: [{ required: true, message: `${lang.wy_input}VLAN ID`, type: "error" }],
            name: [{ required: true, message: `${lang.wy_input}VLAN${lang.wy_name}`, type: "error" }],
            type_id: [{ required: true, message: `${lang.wy_select}VLAN${lang.wy_type}`, type: "error" }],
            assignor: [{ required: true, message: `${lang.wy_input}${lang.wy_assignor}`, type: "error" }],
            user: [{ required: true, message: `${lang.wy_input}${lang.wy_user}`, type: "error" }],
            use_unit: [{ required: true, message: `${lang.wy_input}${lang.wy_use_unit}`, type: "error" }],
            node_id: [{ required: true, message: `${lang.wy_select}${lang.wy_path_node}`, type: "error" }],
          },
          serverList: [],
          delType: "", // vlan, vlanType
          optType: "",
          optTitle: "",
          vlanVisble: false,
          formData: { // vlan
            vlanid: null,
            name: "",
            type_id: "",
            assignor: "",
            user: "",
            use_unit: "",
            node_id: [],
            notes: ""
          },
          curId: "",
          nodeList: [],
          nodeSelect: [], // 已选节点
          nodeColumns: [
            {
              colKey: 'drag',
              width: 30,
            },
            {
              colKey: "text",
              title: '',
            },
          ],
          /* vlan type */
          vlanTypeVisble: false,
          typeLoading: false,
          vlanTypeList: [],
          typeFormData: {
            id: "",
            name: ""
          },
          isEn: localStorage.getItem("backLang") === "en-us" ? true : false
        };
      },
      computed: {
        calcPath () {
          return node => {
            return node.map(item => item.name).join('->');
          };
        },
        calcDetail () {
          return node => {
            return node.map(item => {
              let str = '';
              str += `${item.name}-${item.type_name}`;
              item.self_defined_field.forEach(el => {
                str += `-${el.value}`;
              });
              return str;
            }).join('\n');
          };
        }
      },
      created () {
        this.getVlanList();
        this.getNodeData();
        this.getVlanTypeData();
      },
      methods: {
        /* vlan type */
        addVlanType () {
          this.vlanTypeVisble = true;
          this.optType = 'add';
        },
        async getVlanTypeData () {
          try {
            this.typeLoading = true;
            const res = await getVlanType();
            this.vlanTypeList = res.data.data.list;
            this.typeLoading = false;
            this.optType = 'add';
            this.typeFormData.name = "";
            this.$refs.vlanType && this.$refs.vlanType.reset();
          } catch (error) {
            this.typeLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        editVlanType (row) {
          this.curId = row.id;
          this.optType = 'update';
          this.typeFormData.name = row.name;
        },
        delVlanType (row) {
          this.curId = row.id;
          this.delVisible = true;
        },
        async submitType ({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              const params = {
                name: this.typeFormData.name
              };
              if (this.optType === 'update') {
                params.id = this.curId;
              }
              this.submitLoading = true;
              const res = await addAndEditVlanType(this.optType, params);
              this.$message.success(res.data.msg);
              this.getVlanTypeData();
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
        async deleteVlanType () {
          try {
            this.submitLoading = true;
            const res = await delVlanType({
              id: this.curId
            });
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.success(res.data.msg);
            this.getVlanTypeData();
          } catch (error) {
            this.delVisible = false;
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        sureDelete () {
          if (this.delType === 'vlan') {
            this.deleteVlan();
          } else {
            this.deleteVlanType();
          }
        },
        /* vlan type end */
        handlerDel (type, row) {
          this.delType = type;
          this.curId = row.id;
          this.delVisible = true;
        },
        /* vlan */
        addVlan () {
          this.vlanVisble = true;
          this.optType = "add";
          this.optTitle = `${lang.wy_add}VLAN`;
          this.nodeSelect = [];
          this.formData = {
            vlanid: null,
            name: "",
            type_id: "",
            assignor: "",
            user: "",
            use_unit: "",
            node_id: [],
            notes: ""
          };
          this.$refs.valnDialog.reset();
        },
        editVlan (row) {
          this.optType = "update";
          this.vlanVisble = true;
          this.optTitle = `${lang.wy_edit}VLAN`;
          row.node_id = row.path_node.map(item => item.id);
          this.formData = JSON.parse(JSON.stringify(row));
          this.nodeSelect = row.path_node.map(item => {
            let str = '';
            str += `${item.name}-${item.type_name}`;
            item.self_defined_field.forEach(el => {
              str += `-${el.value}`;
            });
            item.text = str;
            return item;
          });
        },
        changeId (e) {
          if (e < 1) {
            this.formData.vlanid = 1;
          }
          if (e > 4094) {
            this.formData.vlanid = 4094;
          }
        },
        async changeVlan (e, row) {
          try {
            const res = await changeVlanStatus({
              id: row.id,
              status: e
            });
            this.$message.success(res.data.msg);
            this.getVlanList();
          } catch (error) {
            this.$message.error(error.data.msg);
            this.getVlanList();
          }
        },
        async deleteVlan () {
          try {
            this.submitLoading = true;
            const res = await delVlan({
              id: this.curId
            });
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.success(res.data.msg);
            this.getVlanList();
          } catch (error) {
            this.delVisible = false;
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        removeItem (row) {
          this.formData.node_id = this.formData.node_id.filter(item => item !== row.id);
          this.nodeSelect = this.nodeSelect.filter(item => item.id !== row.id);
        },
        changeNode (e) {
          this.nodeSelect = [];
          this.nodeSelect = this.nodeList.filter(item => e.includes(item.id));
        },
        onDragSort (params) {
          this.nodeSelect.splice(0, this.nodeSelect.length, ...params.newData);
        },
        async getNodeData () {
          try {
            const res = await getResourceNode({
              page: 1,
              limit: 9999
            });
            const temp = res.data.data.list.map(item => {
              let str = '';
              str += `${item.name}-${item.type_name}`;
              item.self_defined_field.forEach(el => {
                str += `-${el.value}`;
              });
              item.text = str;
              return item;
            });
            temp.unshift({ text: lang.wy_select_all, checkAll: true },);
            this.nodeList = temp;
          } catch (error) {

          }
        },
        async submitVlan ({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              const params = JSON.parse(JSON.stringify(this.formData));
              if (this.optType === 'add') {
                delete params.id;
              }
              this.submitLoading = true;
              params.node_id = this.nodeSelect.map(item => item.id);
              const res = await addAndEditVlan(this.optType, params);
              this.$message.success(res.data.msg);
              this.vlanVisble = false;
              this.submitLoading = false;
              this.getVlanList();
            } catch (error) {
              console.log('EEEEerror', error);
              this.submitLoading = false;
              this.$message.error(error.data.msg);
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },
        // 获取列表
        async getVlanList () {
          try {
            this.loading = true;
            const res = await getVlan(this.params);
            this.loading = false;
            this.data = res.data.data.list;
            this.total = res.data.data.count;
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
          this.getVlanList();
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
          this.getVlanList();
        },
        clearKey () {
          this.params.keywords = "";
          this.seacrh();
        },
        seacrh () {
          this.params.page = 1;
          this.getVlanList();
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

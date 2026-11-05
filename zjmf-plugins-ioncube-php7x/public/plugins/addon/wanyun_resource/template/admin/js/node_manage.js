(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("node-manage")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
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
          columns: [
            {
              colKey: "id",
              title: 'ID',
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "name",
              title: lang.wy_node_name,
              width: 180,
              ellipsis: true,
            },
            {
              colKey: "type_name",
              title: lang.wy_node_type,
              width: 150,
              ellipsis: true,
            },
            {
              colKey: "custom",
              title: "title-slot-custom",
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
            name: [{ required: true, message: `${lang.wy_input}${lang.wy_node_name}`, type: "error" }],
            type_id: [{ required: true, message: `${lang.wy_select}${lang.wy_node_type}`, type: "error" }],
            field_name: [{ required: true, message: `${lang.wy_input}${lang.wy_field_name}`, type: "error" }],
            field_type: [{ required: true, message: `${lang.wy_select}${lang.wy_field_type}`, type: "error" }],
           // is_required: [{ required: true, message: `${lang.wy_select}`, type: "error" }],
            field_option: [{ required: true, message: `${lang.wy_input}${lang.wy_dropdown_value}`, type: "error" }],
          },
          delType: "", // node, nodeType
          optType: "",
          optTitle: "",
          nodeVisble: false,
          formData: { // node
            name: "",
            type_id: "",
            self_defined_field: {
              1: "",
              2: ""
            }
          },
          curId: "",
          nodeList: [],
          self_defined_field: [],
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
          /* node type */
          nodeTypeVisble: false,
          typeLoading: false,
          nodeTypeList: [],
          typeFormData: {
            id: "",
            name: ""
          },
          /* 自定义字段 */
          filedLoading: false,
          customFiled: [],
          filedVisble: false,
          filedColumns: [
            {
              colKey: 'drag',
              width: 30,
            },
            {
              colKey: "id",
              title: lang.wy_serial,
              width: 80,
              ellipsis: true,
            },
            {
              colKey: "field_name",
              title: lang.wy_field_name,
              width: 160,
              ellipsis: true,
            },
            {
              colKey: "field_type",
              title: lang.wy_field_type,
              width: 120,
              ellipsis: true,
            },
            {
              colKey: "show_list",
              title: lang.wy_show_info,
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "op",
              title: lang.wy_opt,
              width: 80,
              ellipsis: true,
            },
          ],
          filedFormData: {
            field_name: "",
            is_required: false,
            field_type: "", // text dropdown
            field_option: ""
          }
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
              Object.values(item.self_defined_field).forEach(el => {
                str += `-${el}`;
              });
              return str;
            }).join('\n');
          };
        },
        calcOptions () {
          return str => {
            return str.split(',');
          };
        },
        calcFiledOptions () {
          return str => {
            return str.replaceAll(',', '\n');
          };
        }
      },
      created () {
        this.getNodeList();
        this.getNodeTypeData();
        this.getCustomFiled();
      },
      methods: {
        back () {
          location.href = 'fiber_manage.htm';
        },
        /* 自定义字段 */
        addCustomFiled () {
          this.filedVisble = true;
          this.filedFormData = {
            field_name: "",
            is_required: false,
            field_type: "",
            field_option: ""
          };
          this.optType = "add";
          this.$refs.filedDialog && this.$refs.filedDialog.reset();
        },
        editCustomFiled (row) {
          this.optType = "update";
          const temp = JSON.parse(JSON.stringify(row));
          temp.is_required = temp.is_required ? true : false;
          this.filedFormData = temp;
        },
        async deleteFiled () {
          try {
            this.submitLoading = true;
            const res = await delNodeField({
              id: this.curId
            });
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.success(res.data.msg);
            this.getCustomFiled();
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        async onDragSort ({ targetIndex, newData }) {
          try {
            const res = await sortNodeField({
              id: newData[targetIndex].id,
              prev_id: targetIndex === 0 ? 0 : newData[targetIndex - 1].id,
            });
            this.$message.success(res.data.msg);
            this.getCustomFiled();
            this.getNodeList();
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        async changeShowFiled (e, row) {
          try {
            const res = await changeNodeFieldShow({
              id: row.id,
              show_list: e
            })
            this.$message.success(res.data.msg);
            this.getCustomFiled();
            this.getNodeList();
          } catch (error) {
            this.$message.error(error.data.msg);
            this.getCustomFiled();
          }
        },
        async getCustomFiled () {
          try {
            this.filedLoading = true;
            const res = await getNodeField();
            this.customFiled = res.data.data.list;
            this.filedLoading = false;
            this.optType = "add";
            this.$refs.filedDialog && this.$refs.filedDialog.reset();
          } catch (error) {
            this.filedLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        async submitFiled ({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              const params = JSON.parse(JSON.stringify(this.filedFormData));
              if (this.optType === 'add') {
                delete params.id;
              }
              params.is_required = params.is_required ? 1 : 0;
              this.submitLoading = true;
              const res = await addAndEditNodeField(this.optType, params);
              this.$message.success(res.data.msg);
              this.getCustomFiled();
              this.submitLoading = false;
            } catch (error) {
              console.log('##', error);
              this.submitLoading = false;
              this.$message.error(error.data.msg);
            }
          } else {
            console.log("Errors: ", validateResult);
            this.$message.warning(firstError);
          }
        },
        /* 自定义字段 end */
        /* node type */
        addNodeType () {
          this.nodeTypeVisble = true;
          this.optType = 'add';
        },
        async getNodeTypeData () {
          try {
            this.typeLoading = true;
            const res = await getNodeType();
            this.nodeTypeList = res.data.data.list;
            this.typeLoading = false;
            this.optType = 'add';
            this.typeFormData.name = "";
            this.$refs.vlanType && this.$refs.vlanType.reset();
          } catch (error) {
            this.typeLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        editNodeType (row) {
          this.curId = row.id;
          this.optType = 'update';
          this.typeFormData.name = row.name;
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
              const res = await addAndEditNodeType(this.optType, params);
              this.$message.success(res.data.msg);
              this.getNodeTypeData();
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
        async deleteNodeType () {
          try {
            this.submitLoading = true;
            const res = await delNodeType({
              id: this.curId
            });
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.success(res.data.msg);
            this.getNodeTypeData();
          } catch (error) {
            this.delVisible = false;
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        /* node type end */
        handlerDel (type, row) {
          this.delType = type;
          this.curId = row.id;
          this.delVisible = true;
        },
        sureDelete () {
          if (this.delType === 'node') {
            this.deleteNode();
          } else if (this.delType === 'nodeType') {
            this.deleteNodeType();
          } else if (this.delType === 'filed') {
            this.deleteFiled();
          }
        },
        /* node */
        addNode () {
          this.nodeVisble = true;
          this.optType = "add";
          this.optTitle = `${lang.wy_add}${lang.wy_node}`;
          this.nodeSelect = [];
          // 处理自定义字段
          const self_defined_field = this.customFiled.reduce((all, cur) => {
            all[`${cur.id}`] = "";
            return all;
          }, {});
          this.formData = {
            name: "",
            type_id: "",
            self_defined_field
          };
          this.$refs.nodeDialog && this.$refs.nodeDialog.reset();
        },
        async editNode (row) {
          try {
            this.optType = "update";
            this.nodeVisble = true;
            const res = await getResourceNodeDetails({
              id: row.id
            });
            this.optTitle = `${lang.wy_edit}${lang.wy_node}`;
            this.formData = JSON.parse(JSON.stringify(res.data.data));
          } catch (error) {
            this.$message.error(error.data.msg);
          }
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
            this.getNodeList();
          } catch (error) {
            this.$message.error(error.data.msg);
            this.getNodeList();
          }
        },
        async deleteNode () {
          try {
            this.submitLoading = true;
            const res = await delResourceNode({
              id: this.curId
            });
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.success(res.data.msg);
            this.getNodeList();
          } catch (error) {
            this.delVisible = false;
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        async submitNode ({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              const params = JSON.parse(JSON.stringify(this.formData));
              if (this.optType === 'add') {
                delete params.id;
              }
              this.submitLoading = true;
              const res = await addAndEditResourceNode(this.optType, params);
              this.$message.success(res.data.msg);
              this.nodeVisble = false;
              this.submitLoading = false;
              this.getNodeList();
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
        async getNodeList () {
          try {
            this.loading = true;
            const res = await getResourceNode(this.params);
            this.loading = false;
            this.data = res.data.data.list;
            this.total = res.data.data.count;
            this.self_defined_field = res.data.data.self_defined_field || [];
          } catch (error) {
            this.loading = false;
            this.$message.error(error.data.msg);
          }
        },
        // 切换分页
        changePage (e) {
          this.params.page = e.current;
          this.params.limit = e.pageSize;
          this.getNodeList();
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
          this.getNodeList();
        },
        clearKey () {
          this.seacrh();
        },
        seacrh () {
          this.params.page = 1;
          this.getNodeList();
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

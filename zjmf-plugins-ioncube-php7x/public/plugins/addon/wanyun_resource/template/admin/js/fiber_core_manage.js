(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("fiber-core-manage")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang)
    new Vue({
      components: {
        comConfig
      },
      data () {
        return {
          data: [],
          fiber_num: "",
          tableLayout: false,
          bordered: true,
          visible: false,
          delVisible: false,
          statusVisble: false,
          hover: true,
          columns: [
            {
              colKey: "num",
              title: lang.wy_core_num,
              width: 100,
              ellipsis: true,
            },
            {
              colKey: "path",
              title: lang.wy_path_node,
              width: 200,
              ellipsis: true,
            },
            {
              colKey: "custom",
              title: "title-slot-custom",
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
              width: 100,
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
            id: "",
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
            node_id: [{ required: true, message: `${lang.wy_select}${lang.wy_path_node}`, type: "error", trigger: "change" }],
            field_name: [{ required: true, message: `${lang.wy_input}${lang.wy_field_name}`, type: "error" }],
            field_type: [{ required: true, message: `${lang.wy_select}${lang.wy_field_type}`, type: "error" }],
           // is_required: [{ required: true, message: `${lang.wy_select}`, type: "error" }],
            field_option: [{ required: true, message: `${lang.wy_input}${lang.wy_dropdown_value}`, type: "error" }],
          },
          delType: "", // node, nodeType
          optType: "",
          optTitle: "",
          coreVisble: false,
          formData: { // node
            id: "",
            node_id: "",
            self_defined_field: {},
            notes: ""
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
              item.self_defined_field.forEach(el => {
                str += `-${el.value}`;
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
        },
        calcFiledName () {
          return (filed, item) => {
            return filed.filter(el => el.id === item.id)[0]?.value || '--';
          };
        }
      },
      created () {
        this.params.id = this.getQuery('id') * 1;
        this.fiber_num = this.getQuery('fiber_num');
        this.getCoreList();
        this.getCustomFiled();
      },
      methods: {
        getQuery (name) {
          const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
          const r = window.location.search.substr(1).match(reg);
          if (r != null) return decodeURI(r[2]);
          return null;
        },
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
            const res = await delCoreField({
              id: this.curId
            });
            this.submitLoading = false;
            this.delVisible = false;
            this.$message.success(res.data.msg);
            this.getCustomFiled();
            this.getCoreList();
          } catch (error) {
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
        async onDragSort ({ targetIndex, newData }) {
          try {
            const res = await sortCoreField({
              id: newData[targetIndex].id,
              prev_id: targetIndex === 0 ? 0 : newData[targetIndex - 1].id,
            });
            this.$message.success(res.data.msg);
            this.getCustomFiled();
            this.getCoreList();
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },
        async changeShowFiled (e, row) {
          try {
            const res = await changeCoreFieldShow({
              id: row.id,
              show_list: e
            });
            this.$message.success(res.data.msg);
            this.getCustomFiled();
            this.getCoreList();
          } catch (error) {
            this.$message.error(error.data.msg);
            this.getCustomFiled();
          }
        },
        async getCustomFiled () {
          try {
            this.filedLoading = true;
            const res = await getCoreField();
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
              const res = await addAndEditCoreField(this.optType, params);
              this.$message.success(res.data.msg);
              this.getCustomFiled();
              this.getCoreList();
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
        handlerDel (type, row) {
          this.delType = type;
          this.curId = row.id;
          this.delVisible = true;
        },
        sureDelete () {
          this.deleteFiled();
        },
        /* node */
        async editCore (row) {
          try {
            this.optType = "update";
            this.coreVisble = true;
            const res = await getFiberCoreDetails({
              id: row.id
            });
            const temp = JSON.parse(JSON.stringify(res.data.data));
            const tempNode = temp.path_node.map(item => {
              let str = '';
              str += `${item.name}-${item.type_name}`;
              item.self_defined_field.forEach(el => {
                str += `-${el.value}`;
              });
              item.text = str;
              return item;
            });
            tempNode.unshift({ text: lang.wy_select_all, checkAll: true });
            this.nodeList = tempNode;
            const params = {
              id: temp.id,
              node_id: temp.node_id,
              self_defined_field: temp.self_defined_field,
              notes: temp.notes
            };
            this.optTitle = `「${this.fiber_num}」-「${row.num}」${lang.wy_fiber_core}`;
            this.formData = params;
            this.$nextTick(() => {
              this.$refs.coreDialog && this.$refs.coreDialog.clearValidate();
            });
          } catch (error) {
            this.$message.error(error.data.msg);
          }
        },

        async submitNode ({ validateResult, firstError }) {
          if (validateResult === true) {
            try {
              const params = JSON.parse(JSON.stringify(this.formData));
              this.submitLoading = true;
              const res = await editFiberCore(params);
              this.$message.success(res.data.msg);
              this.coreVisble = false;
              this.submitLoading = false;
              this.getCoreList();
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
        async getCoreList () {
          try {
            this.loading = true;
            const res = await getFiberCore(this.params);
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
          this.getCoreList();
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
          this.getCoreList();
        },
        clearKey () {
          this.seacrh();
        },
        seacrh () {
          this.params.page = 1;
          this.getCoreList();
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

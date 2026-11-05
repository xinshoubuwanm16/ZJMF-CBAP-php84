(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName(
      "product_drop_down_select"
    )[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        comConfig,
      },
      data() {
        return {
          submitLoading: false,
          config: "",
          cur: 0,
          focusIndex: "",
          chooseArr: [1, 11, 11, 21],
          list: [
            {
              value: "default",
              cur: 1,
              data: [
                { value: 1, label: lang.product_examples + 1 },
                { value: 2, label: lang.product_examples + 2 },
                { value: 3, label: lang.product_examples + 3 },
                { value: 4, label: lang.product_examples + 4 },
                { value: 5, label: lang.product_examples + 5 },
              ],
            },
            {
              value: "first_group",
              cur: 11,
              data: [
                {
                  value: 1,
                  label: lang.product_first_group,
                  children: [
                    { value: 11, label: lang.product_examples + 1 },
                    { value: 12, label: lang.product_examples + 2 },
                    { value: 13, label: lang.product_examples + 3 },
                  ],
                },
                {
                  value: 2,
                  label: lang.product_first_group,
                  children: [
                    { value: 14, label: lang.product_examples + 4 },
                    { value: 15, label: lang.product_examples + 5 },
                    { value: 16, label: lang.product_examples + 6 },
                  ],
                },
              ],
            },
            {
              value: "second_group",
              cur: [11],
              data: [
                {
                  value: 1,
                  label: lang.product_second_group,
                  children: [
                    { value: 11, label: lang.product_examples + 1 },
                    { value: 12, label: lang.product_examples + 2 },
                    { value: 13, label: lang.product_examples + 3 },
                  ],
                },
                {
                  value: 2,
                  label: lang.product_second_group,
                  children: [
                    { value: 14, label: lang.product_examples + 4 },
                    { value: 15, label: lang.product_examples + 5 },
                    { value: 16, label: lang.product_examples + 6 },
                  ],
                },
              ],
            },
            {
              value: "first_second_group",
              cur: [21],
              data: [
                {
                  value: 1,
                  label: lang.product_first_group,
                  children: [
                    {
                      value: 11,
                      label: lang.product_second_group,
                      children: [
                        { value: 21, label: lang.product_examples + 1 },
                        { value: 22, label: lang.product_examples + 2 },
                        { value: 23, label: lang.product_examples + 3 },
                      ],
                    },
                  ],
                },
                {
                  value: 2,
                  label: lang.product_first_group,
                  children: [
                    {
                      value: 12,
                      label: lang.product_second_group,
                      children: [
                        { value: 24, label: lang.product_examples + 4 },
                        { value: 25, label: lang.product_examples + 5 },
                        { value: 26, label: lang.product_examples + 6 },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          treeProps: {
            valueMode: "onlyLeaf",
            expandAll: true,
          },
          popupProps: {
            overlayInnerStyle: (trigger) => ({
              width: `${trigger.offsetWidth}px`,
            }),
          },
        };
      },
      methods: {
        async getConfig() {
          try {
            const res = await getSelectConfig();
            this.config = res.data.data.config;
            this.cur = this.list.findIndex(
              (item) => item.value === this.config
            );
          } catch (error) {
            console.log("error", error);
          }
        },
        choose(item, index) {
          this.config = item.value;
          this.cur = index;
        },
        // 商品选择
        onClick(e) {
          if (!e.node.data.children) {
            const pName = e.node.data.name;
            const pId = e.node.data.id;
            this.chooseArr.splice(this.focusIndex, 1, e.node.data.label);
          }
        },
        async sureOpt() {
          try {
            this.submitLoading = true;
            const res = await saveSelectConfig({
              config: this.config,
            });
            this.$message.success(res.data.msg);
            this.submitLoading = false;
            this.getConfig();
          } catch (error) {
            console.log("error", error);
            this.submitLoading = false;
            this.$message.error(error.data.msg);
          }
        },
      },
      created() {
        if (!this.$checkPermission("auth_product_drop_down_select")) {
          const host = location.origin;
          const fir = location.pathname.split("/")[1];
          const str = `${host}/${fir}/`;
          location.href = str + "404.htm?msg=";
        }
        this.getConfig();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

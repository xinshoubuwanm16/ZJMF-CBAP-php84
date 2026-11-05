const template = document.getElementsByClassName("common_config")[0];
Vue.prototype.lang = Object.assign(window.lang, window.module_lang);
new Vue({
  components: {
    comConfig,
  },
  data () {
    return {
      host: location.origin,
      id: "",
      tabs: "duration", // duration,data_center,model,hardware,flexible,limit,system,other
      hover: true,
      tableLayout: false,
      delVisible: false,
      loading: false,
      currency_prefix: JSON.parse(localStorage.getItem("common_set")).currency_prefix || "¥",
      currency_suffix: JSON.parse(localStorage.getItem("common_set")).currency_suffix || "",
      optType: "add", // 新增/编辑
      comTitle: "",
      delTit: "",
      delType: "",
      delId: "",
      submitLoading: false,
      ipChange: false,
      /* 周期 */
      cycleData: [],
      dataModel: false,
      cycleModel: false,
      cycleForm: {
        product_id: "",
        name: "",
        num: "",
        unit: "month",
        price_factor: null,
        price: null,
      },
      ratioModel: false,
      ratioData: [],
      ratioColumns: [
        {
          colKey: "name",
          title: lang.cycle_name,
          ellipsis: true,
        },
        {
          colKey: "unit",
          title: lang.cycle_time,
          ellipsis: true,
        },
        {
          colKey: "ratio",
          title: lang.mf_ratio,
          ellipsis: true,
        },
      ],
      cycleTime: [
        {
          value: "hour",
          label: lang.hour,
        },
        {
          value: "day",
          label: lang.day,
        },
        {
          value: "month",
          label: lang.natural_month,
        },
      ],
      cycleColumns: [
        {
          colKey: "name",
          title: lang.cycle_name,
          ellipsis: true,
        },
        {
          colKey: "unit",
          title: lang.cycle_time,
          ellipsis: true,
          ellipsis: true,
        },
        {
          colKey: "price_factor",
          title: lang.price_factor,
          ellipsis: true,
        },
        {
          colKey: "price",
          title: lang.cycle_price,
          ellipsis: true,
        },
        {
          colKey: "ratio",
          title: lang.cycle_ratio,
          ellipsis: true,
        },
        {
          colKey: "op",
          title: lang.operation,
          width: 120,
        },
      ],
      cycleRules: {
        name: [
          {
            required: true,
            message: lang.input + lang.cycle_name,
            type: "error",
          },
          {
            validator: (val) => val?.length <= 10,
            message: lang.verify8 + "1-10",
            type: "warning",
          },
        ],
        num: [
          {
            required: true,
            message: lang.input + lang.cycle_time,
            type: "error",
          },
          {
            pattern: /^[0-9]*$/,
            message: lang.input + lang.verify16,
            type: "warning",
          },
          {
            validator: (val) => val > 0 && val <= 999,
            message: lang.cycle_time + "1-999",
            type: "warning",
          },
        ],
        price: [
          { required: true, message: lang.input + lang.price, type: "error" },
          {
            pattern: /^\d+(\.\d{0,2})?$/,
            message: lang.verify12,
            type: "warning",
          },
          {
            validator: (val) => val >= 0,
            message: lang.verify12,
            type: "warning",
          },
        ],
        icon: [
          {
            required: true,
            message: lang.select + lang.mf_icon,
            type: "error",
            trigger: "change",
          },
        ],
      },
      popupProps: {
        overlayClassName: `custom-select`,
        overlayInnerStyle: (trigger) => ({ width: `${trigger.offsetWidth}px` }),
      },
      /* 其他设置 */
      otherForm: {
        product_id: "",
        order_check_u: 0,
      },
      dataRules: {
        data_center_id: [
          {
            required: true,
            message: `${lang.select}${lang.area}`,
            type: "error",
          },
        ],
        line_id: [
          {
            required: true,
            message: `${lang.select}${lang.line_name}`,
            type: "error",
          },
        ],
        flow: [
          { required: true, message: `${lang.input}${lang.cloud_flow}`, type: "error" },
          {
            pattern: /^[0-9]*$/,
            message: lang.input + "0-999999" + lang.verify2,
            type: "warning",
          },
          {
            validator: (val) => val >= 0 && val <= 999999,
            message: lang.input + "0-999999" + lang.verify2,
            type: "warning",
          },
        ],
        host_prefix: [
          {
            required: true,
            message: `${lang.input}${lang.host_prefix}`,
            type: "error",
          },
          {
            pattern: /^[A-Z][a-zA-Z0-9_.]{0,9}$/,
            message: lang.verify8 + "1-10",
            type: "warning",
          },
        ],
        host_length: [
          {
            required: true,
            message: `${lang.input}${lang.mf_tip2}`,
            type: "error",
          },
          {
            pattern: /^[0-9]*$/,
            message: lang.mf_tip2,
            type: "warning",
          },
        ],
        country_id: [
          {
            required: true,
            message: lang.select + lang.country,
            type: "error",
          },
        ],
        city: [
          { required: true, message: lang.input + lang.city, type: "error" },
        ],
        cloud_config: [
          { required: true, message: lang.select + lang.city, type: "error" },
        ],
        cloud_config_id: [
          { required: true, message: lang.input + "ID", type: "error" },
        ],
        area: [
          {
            required: true,
            message: `${lang.input}${lang.area}${lang.nickname}`,
            type: "error",
          },
        ],
        name: [
          {
            required: true,
            message: `${lang.input}${lang.box_label23}`,
            type: "error",
          },
        ],
        description: [
          {
            required: true,
            message: `${lang.input}${lang.description}`,
            type: "error",
          },
        ],
        order: [
          {
            required: true,
            message: `${lang.input}${lang.sort}ID`,
            type: "error",
          },
          {
            pattern: /^[0-9]*$/,
            message: lang.verify7,
            type: "warning",
          },
          {
            validator: (val) => val >= 0,
            message: lang.verify7,
            type: "warning",
          },
        ],
        network_type: [
          {
            required: true,
            message: lang.select + lang.net_type,
            type: "error",
          },
        ],
        bw: [
          { required: true, message: `${lang.input}${lang.bw}`, type: "error" },
          {
            pattern: /^[0-9]*$/,
            message: lang.input + "1-30000" + lang.verify1,
            type: "warning",
          },
          {
            validator: (val) => val >= 1 && val <= 30000,
            message: lang.input + "1-30000" + lang.verify1,
            type: "warning",
          },
        ],
        peak_defence: [
          {
            pattern: /^[0-9]*$/,
            message: lang.input + "1-999999" + lang.verify1,
            type: "warning",
          },
          {
            validator: (val) => val >= 1 && val <= 999999,
            message: lang.input + "1-999999" + lang.verify1,
            type: "warning",
          },
        ],
        min_memory: [
          {
            required: true,
            message: `${lang.input}${lang.memory}`,
            type: "error",
          },
          {
            pattern: /^[0-9]*$/,
            message: lang.input + "1-512" + lang.verify2,
            type: "warning",
          },
          {
            validator: (val) => val >= 1 && val <= 512,
            message: lang.input + "1-512" + lang.verify2,
            type: "warning",
          },
        ],
        max_memory: [
          {
            required: true,
            message: `${lang.input}${lang.memory}`,
            type: "error",
          },
          {
            pattern: /^[0-9]*$/,
            message: lang.input + "1-512" + lang.verify2,
            type: "warning",
          },
          {
            validator: (val) => val >= 1 && val <= 512,
            message: lang.input + "1-512" + lang.verify2,
            type: "warning",
          },
        ],
        line_id: [
          {
            required: true,
            message: `${lang.select}${lang.line_name}`,
            type: "error",
          },
        ],
        min_bw: [
          {
            pattern: /^[0-9]*$/,
            message: lang.input + "1-30000" + lang.verify2,
            type: "warning",
          },
          {
            validator: (val) => val >= 1 && val <= 30000,
            message: lang.input + "1-30000" + lang.verify2,
            type: "warning",
          },
        ],
        max_bw: [
          {
            pattern: /^[0-9]*$/,
            message: lang.input + "1-30000" + lang.verify2,
            type: "warning",
          },
          {
            validator: (val) => val >= 1 && val <= 30000,
            message: lang.input + "1-30000" + lang.verify2,
            type: "warning",
          },
        ],
        model_config_id: [
          {
            required: true,
            message: `${lang.select}${lang.box_title46}`,
            type: "error",
          },
        ],
        group_id: [
          {
            required: true,
            message: `${lang.input}${lang.mf_cabinet}ID`,
            type: "error",
          },
        ],
        u: [
          {
            required: true,
            message: lang.mf_check_tip1,
            type: "error",
          },
        ],
        electric: [
          {
            required: true,
            message: `${lang.input}${lang.mf_electric}`,
            type: "error",
          },
        ]
      },
      calcRules: {
        // 模型配置验证
        name: [
          {
            required: true,
            message: `${lang.input}${lang.config_name}`,
            type: "error",
          },
        ],
        group_id: [
          {
            required: true,
            message: `${lang.input}${lang.sale_group}ID`,
            type: "error",
          },
          {
            pattern: /^[0-9]*$/,
            message: lang.input + lang.verify7,
            type: "warning",
          },
        ],
        cpu: [
          {
            required: true,
            message: `${lang.input}${lang.mf_cpu}`,
            type: "error",
          },
        ],
        cpu_param: [
          {
            required: true,
            message: `${lang.input}${lang.mf_cpu_param}`,
            type: "error",
          },
        ],
        memory: [
          {
            required: true,
            message: `${lang.input}${lang.memory}`,
            type: "error",
          },
        ],
        disk: [
          {
            required: true,
            message: `${lang.input}${lang.disk}`,
            type: "error",
          },
        ],
        value: [
          { required: true, message: `${lang.input}${lang.bw}`, type: "error" },
          {
            pattern: /^[0-9]*$/,
            message: lang.input + "0-30000" + lang.verify2,
            type: "warning",
          },
          {
            validator: (val) => val >= 0 && val <= 30000,
            message: lang.input + "0-30000" + lang.verify2,
            type: "warning",
          },
        ],
        type: [
          {
            required: true,
            message: `${lang.select}${lang.config}${lang.mf_way}`,
            type: "error",
          },
        ],
        price: [
          {
            pattern: /^\d+(\.\d{0,2})?$/,
            message: lang.input + lang.money,
            type: "warning",
          },
          {
            validator: (val) => val >= 0 && val <= 999999,
            message: lang.verify12,
            type: "warning",
          },
        ],
        min_value: [
          {
            required: true,
            message: `${lang.input}${lang.min_value}`,
            type: "error",
          },
          {
            pattern: /^([1-9][0-9]*)$/,
            message: lang.input + "1~1048576" + lang.verify2,
            type: "warning",
          },
          {
            validator: (val) => val >= 1 && val <= 1048576,
            message: lang.input + "1~1048576" + lang.verify2,
            type: "warning",
          },
        ],
        max_value: [
          {
            required: true,
            message: `${lang.input}${lang.max_value}`,
            type: "error",
          },
          {
            pattern: /^([1-9][0-9]*)$/,
            message: lang.input + "2~1048576" + lang.verify2,
            type: "warning",
          },
          {
            validator: (val) => val >= 2 && val <= 1048576,
            message: lang.input + "2~1048576" + lang.verify2,
            type: "warning",
          },
        ],
        step: [
          {
            required: true,
            message: `${lang.input}${lang.min_step}`,
            type: "error",
          },
          {
            pattern: /^([1-9][0-9]*)$/,
            message: lang.input + lang.verify16,
            type: "warning",
          },
        ],
        traffic_type: [
          {
            required: true,
            message: `${lang.select}${lang.traffic_type}`,
            type: "error",
          },
        ],
        bill_cycle: [
          {
            required: true,
            message: `${lang.select}${lang.billing_cycle}`,
            type: "error",
          },
        ],
      },
      isAdvance: false, // 是否展开高级配置
      /* 数据中心 */
      dataList: [],
      dataLoading: false,
      dataColumns: [
        {
          colKey: "order",
          title: lang.index_text8,
          width: 100,
          ellipsis: true,
        },
        {
          colKey: "country_name",
          title: lang.country,
          width: 150,
          ellipsis: true,
          className: "country-td",
        },
        {
          colKey: "city",
          title: lang.city,
          width: 150,
          ellipsis: true,
          className: "city-td",
        },
        {
          colKey: "area",
          title: `${lang.area}${lang.nickname}`,
          width: 150,
          ellipsis: true,
          className: "area-td",
        },
        {
          colKey: "line",
          title: lang.line_name,
          className: "line-td",
          width: 250,
          ellipsis: true,
        },
        {
          colKey: "price",
          title: lang.price,
          className: "line-td",
          ellipsis: true,
        },
        {
          colKey: "op",
          title: lang.operation,
          width: 120,
          className: "line-td",
        },
      ],
      dataForm: {
        // 新建数据中心
        country_id: "",
        city: "",
        area: "",
        group_id: null,
        order: 0,
      },
      countryList: [],
      /* 线路相关 */
      lineType: "", // 新增,编辑线路，新增的时候本地操作，保存一次性提交
      subType: "", // 线路子项类型， line_bw, line_flow, line_defence, line_ip
      lineForm: {
        country_id: "", // 线路国家
        city: "", // 线路城市
        data_center_id: "",
        name: "",
        bill_type: "", // bw, flow
        // bw_ip_group: "",
        defence_ip_group: "",
        defence_enable: 0, // 防护开关
        bw_data: [], // 带宽
        flow_data: [], //流量
        defence_data: [], // 防护
        ip_data: [], // ip
        order: 0,
      },
      configType: [
        { value: "radio", label: lang.mf_radio },
        { value: "step", label: lang.mf_step },
        { value: "total", label: lang.mf_total },
      ],
      bw_ip_show: false, // bw 高级配置
      defence_ip_show: false, // 防护高级配置
      subForm: {
        // 线路子项表单
        type: "",
        value: "",
        price: [],
        min_value: "",
        value_show: "",
        max_value: "",
        step: 1,
        other_config: {
          in_bw: "",
          out_bw: "",
          bill_cycle: "",
        },
      },
      lineModel: false,
      lineRight: false,
      delSubIndex: 0,
      subId: "",
      countrySelect: [], // 国家三级联动
      billType: [
        { value: "bw", label: lang.mf_bw },
        { value: "flow", label: lang.mf_flow },
      ],
      bwColumns: [
        {
          colKey: "fir",
          title: lang.bw,
        },
        {
          colKey: "price",
          title: lang.price,
        },
        {
          colKey: "op",
          title: lang.operation,
          width: 120,
        },
      ],
      trafficTypes: [
        { value: "1", label: lang.in },
        { value: "2", label: lang.out },
        { value: "3", label: lang.in_out },
      ],
      billingCycle: [
        { value: "month", label: lang.natural_month },
        { value: "last_30days", label: lang.last_30days },
      ],
      /* 推荐配置 */
      calcLineType: "",
      recommendList: [],
      systemDiskType: [],
      dataDiskType: [],
      recommendModel: false,
      recommendColumns: [
        {
          colKey: "order",
          title: lang.order_text68,
          width: 100,
        },
        {
          colKey: "name",
          title: lang.mf_package_name,
          minWidth: 100,
          ellipsis: true,
        },
        {
          colKey: "u",
          title: lang.mf_u,
          minWidth: 100,
          ellipsis: true,
        },
        {
          colKey: "electric",
          title: lang.mf_electric,
          minWidth: 100,
          ellipsis: true,
        },
        {
          colKey: "data_center_id",
          title: lang.mf_belong_data,
          minWidth: 100,
          ellipsis: true,
        },
        {
          colKey: "ip_num",
          title: `IP${lang.auth_num}`,
          minWidth: 100,
          ellipsis: true,
        },
        {
          colKey: "bw",
          title: `${lang.bw}/${lang.cloud_flow}`,
          minWidth: 100,
          ellipsis: true,
        },
        {
          colKey: "peak_defence",
          title: lang.mf_defence,
          minWidth: 80,
          ellipsis: true,
        },
        {
          colKey: "price",
          title: lang.price,
          ellipsis: true,
          width: 200,
        },
        {
          colKey: "hidden",
          title: lang.mf_tip40,
          ellipsis: true,
          width: 150,
        },
        {
          colKey: "op",
          title: lang.operation,
          width: 120,
        },
      ],
      hasMultiLanguage: false,
      isEn: localStorage.getItem("backLang") === "en-us" ? true : false,
      cabinetType: [
        { value: 1, label: lang.mf_full },
        { value: 2, label: lang.mf_half },
        { value: 4, label: '1/4' }
      ]
    };
  },
  computed: {
    // 规格单位
    calcUnit () {
      return type => {
        return this.cabinetType.filter(item => item.value === type * 1)[0]?.label;
      };
    },
    calcDisabeld () {
      return key => {
        if ((key === "bw" && this.checkedLimit.includes("flow")) ||
          (key === "flow" && this.checkedLimit.includes("bw"))) {
          return true;
        } else {
          return false;
        }
      };
    },
    calcLimitCol () {
      return (type) => {
        let temp = [];
        type.forEach(item => {
          temp.push({
            colKey: item,
            title: this.limitTypeObj[item]?.name,
            ellipsis: true,
            minWidth: 120
          });
        });
        temp.push({
          colKey: "op",
          title: lang.operation,
          width: 130,
        },);
        return temp;
      };
    },
    showLimitItem () {
      return name => {
        return this.checkedLimit.includes(name);
      };
    },
    calcCheckbox () {
      return Object.values(this.limitTypeObj);
    },
    isShowFill () {
      return (price) => {
        const index = price.findIndex((item) => item.price);
        return index === -1;
      };
    },
    calcName () {
      return (type) => {
        switch (type) {
          case "memory":
            return `${lang.memory_config}`;
          case "system_disk":
            return `${lang.system_disk_size}${lang.capacity}`;
          case "data_disk":
            return `${lang.data_disk}${lang.capacity}`;
          case "line_bw":
            return `${lang.bw}（Mbps）`;
        }
      };
    },
    calcIcon () {
      return (
        this.host +
        "/upload/common/country/" +
        this.countryList.filter(
          (item) => item.id === this.dataForm.country_id
        )[0]?.iso +
        ".png"
      );
    },
    calcIcon1 () {
      if (!this.countrySelect) {
        return;
      }
      return (
        this.host +
        "/upload/common/country/" +
        this.countrySelect.filter(
          (item) => item.id === this.lineForm.country_id
        )[0]?.iso +
        ".png"
      );
    },
    calcCity () {
      if (!this.countrySelect) {
        return;
      }
      const city =
        this.countrySelect.filter(
          (item) => item.id === this.lineForm.country_id
        )[0]?.city || [];
      if (city.length === 1) {
        this.lineForm.city = city[0].name;
      }
      return city || [];
    },
    calcArea () {
      if (!this.countrySelect) {
        return;
      }
      const area =
        this.countrySelect
          .filter((item) => item.id === this.lineForm.country_id)[0]
          ?.city.filter((item) => item.name === this.lineForm.city)[0]?.area ||
        [];
      if (area.length === 1) {
        this.lineForm.data_center_id = area[0].id;
      }
      return area;
    },
    calcSelectLine () {
      if (!this.countrySelect) {
        return;
      }
      const line = this.countrySelect
          .filter((item) => item.id === this.lineForm.country_id)[0]
          ?.city.filter((item) => item.name === this.lineForm.city)[0]
          ?.area.filter((item) => item.id === this.lineForm.data_center_id)[0]
          ?.line || [];
      return line;
    },
    calcColums () {
      return (val) => {
        const temp = JSON.parse(JSON.stringify(this.bwColumns));
        switch (val) {
          case "flow":
            temp[0].title = lang.cloud_flow + "（GB）";
            return temp;
          case "defence":
            temp[0].title = lang.defence + "（GB）";
            return temp;
          case "ip":
            temp[0].title = "IP" + lang.auth_num + `（${lang.one}）`;
            return temp;
        }
      };
    },
    calcSubTitle () {
      // 副标题
      return (data) => {
        if (data.length > 0) {
          return lang[`mf_${data[0].type}`] + lang.mf_way;
        } else {
          return "";
        }
      };
    },
    calcPrice () {
      // 处理本地价格展示
      return (price) => {
        // 找到价格最低的
        const arr = Object.values(price)
          .sort((a, b) => {
            return a - b;
          })
          .filter(Number);
        if (arr.length > 0) {
          let temp = "";
          Object.keys(price).forEach((item) => {
            if (price[item] * 1 === arr[0] * 1) {
              const name = this.cycleData.filter((el) => el.id === item * 1)[0]
                ?.name;
              temp = (arr[0] * 1).toFixed(2) + "/" + name;
            }
          });
          return temp;
        } else {
          return "0.00";
        }
      };
    },
    // 子项的计费方式是否可选
    calcShow () {
      switch (this.subType) {
        case "line_bw":
          return this.lineForm.bw_data.length > 0 ? true : false;
      }
    },
    calcCpu () {
      return (val) => {
        return val.value + lang.cores;
      };
    },
    calcMemory () {
      return (val) => {
        return val.value + "GB";
      };
    },
    calcLine () {
      // 当前线路
      return this.dataList.filter(
        (item) =>
          item.country_id === this.lineForm.country_id &&
          item.city === this.lineForm.city
      )[0]?.line;
    },
    calcMemery () {
      return (data) => {
        return data.split(",");
      };
    },
    calcRange () {
      // 计算验证范围
      return (val) => {
        if (this.calcType === "memory") {
          // 内存
          return val >= 1 && val <= 512;
        } else {
          return val >= 1 && val <= 1048576;
        }
      };
    },

    calcReg () {
      // 动态生成规则
      return (name, min, max, tag) => {
        // tag 标识 NC
        let pattern = "";
        if (tag === "nc") {
          pattern = /^[0-9NC]*$/;
        } else if (tag === "ip") {
          pattern = /(^NC$)|(^\d+$)|(^\d+_\d*)(,(\d+_\d+)|(\d+))+([0-9]|$)/g;
        } else {
          pattern = /^[0-9]*$/;
        }
        const pass = (val) => {
          if (val === "NC") {
            return true;
          } else if (tag === "ip") {
            return true;
          } else {
            return val >= min && val <= max;
          }
        };
        return [
          { required: true, message: `${lang.input}${name}`, type: "error" },
          {
            pattern: pattern,
            message:
              tag === "ip" ? "" : lang.input + `${min}-${max}` + lang.verify18,
            type: "warning",
          },
          {
            validator: (val) => pass(val),
            message:
              tag === "ip" ? "" : lang.input + `${min}-${max}` + lang.verify18,
            type: "warning",
          },
        ];
      };
    },
    calcIpNum () {
      return (value) => {
        if (value.includes("_")) {
          value = value.split(",").reduce((all, cur) => {
            all += cur.split("_")[0] * 1;
            return all;
          }, 0);
          return value;
        } else {
          return value;
        }
      };
    },
    calcOriginData () {
      return (type) => {
        return this[`${type}`].filter((item) => item.id > 0);
      };
    },
    isShowMulTip () {
      return this.hasMultiLanguage ? `(${lang.support_multili_mark})` : "";
    },
  },
  methods: {
    changeLimitRange (val, name, type) {
      if (val < 0) {
        this.limitForm[name][type] = 0;
      }
      if (val > 99999999) {
        this.limitForm[name][type] = 99999999;
      }
      if (typeof this.limitForm[name].max !== 'object' && this.limitForm[name].max !== '') {
        if ((type === "min" && val >= this.limitForm[name].max)) {
          this.limitForm[name].max = this.limitForm[name].min;
        }
        if ((type === "max" && val <= this.limitForm[name].min)) {
          this.limitForm[name].min = this.limitForm[name].max;
        }
      }
    },
    async getPlugin () {
      try {
        const res = await getAddon();
        const temp = res.data.data.list
          .filter((item) => item.status === 1)
          .reduce((all, cur) => {
            all.push(cur.name);
            return all;
          }, []);
        this.hasMultiLanguage = temp.includes("MultiLanguage");
      } catch (error) { }
    },
    handlerAddPrice () {
      // 处理新增周期
      const price = this.cycleData
        .reduce((all, cur) => {
          all.push({
            id: cur.id,
            name: cur.name,
            price: "",
          });
          return all;
        }, [])
        .sort((a, b) => {
          return a.id - b.id;
        });
      return price;
    },
    /* 机柜套餐 */
    changeBillType (e) {
      this.lineForm.bill_type = this.calcLineType = this.calcSelectLine.filter(
        (item) => item.id === e
      )[0]?.bill_type;
    },
    async onChange (row) {
      try {
        const res = await changePackageShow({
          id: row.id,
          hidden: row.hidden,
        });
        this.$message.success(res.data.msg);
        this.getRecommendList();
      } catch (error) {
        this.$message.error(error.data.msg);
        this.getRecommendList();
      }
    },
    async getRecommendList () {
      try {
        this.dataLoading = true;
        const res = await getRecommend({
          product_id: this.id,
          page: 1,
          limit: 1000,
        });
        this.recommendList = res.data.data.list;
        this.dataLoading = false;
      } catch (error) {
        this.dataLoading = false;
      }
    },
    addRecommend () {
      this.lineForm = {
        name: "",
        cannot_add_value: false,
        u: "",
        u_type: "",
        electric: "",
        electric_unit: "A",
        country_id: "",
        city: "",
        data_center_id: "",
        line_id: "",
        ip_num: null,
        bw: null,
        flow: null,
        peak_defence: null,
        order: 0,
        price: this.handlerAddPrice(),
      };
      this.optType = "add";
      this.recommendModel = true;
      this.calcLineType = "";
      this.comTitle = `${lang.order_text53}${lang.package}`;
    },
    blurPackagePrice (val, ind) {
      let temp = String(val).match(/^\d*(\.?\d{0,2})/g)[0] || "";
      if (temp && !isNaN(Number(temp))) {
        temp = Number(temp).toFixed(2);
      }
      if (temp >= 999999) {
        this.lineForm.price[ind].price = Number(999999).toFixed(2);
      } else {
        this.lineForm.price[ind].price = temp;
      }
    },
    // 编辑套餐
    async editRecommend (row) {
      try {
        const res = await getRecommendDetails({
          id: row.id,
        });
        this.comTitle = `${lang.edit}${lang.package}`;
        const temp = res.data.data;
        temp.price = temp.duration;
        temp.cannot_add_value = temp.cannot_add_value === 1 ? true : false;
        delete temp.duration;
        temp.u_type = temp.u_type || "";
        temp.bw = temp.bw || "";
        this.lineForm = temp;
        this.optType = "update";
        this.recommendModel = true;
        const type = this.countrySelect
          .filter((item) => item.id === this.lineForm.country_id)[0]
          ?.city.filter((item) => item.name === this.lineForm.city)[0]
          ?.area.filter((item) => item.id === this.lineForm.data_center_id)[0]
          ?.line.filter(
            (item) => item.id === this.lineForm.line_id
          )[0]?.bill_type;
        this.calcLineType = type;
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    async submitRecommend ({ validateResult, firstError }) {
      if (validateResult === true) {
        try {
          const params = JSON.parse(JSON.stringify(this.lineForm));
          if (this.optType === "add") {
            delete params.id;
          }
          if (this.calcLineType === "bw") {
            delete params.flow;
          } else if (this.calcLineType === "flow") {
            delete params.bw;
          }
          params.cannot_add_value = params.cannot_add_value ? 1 : 0;
          params.price = params.price.reduce((all, cur) => {
            cur.price && (all[cur.id] = cur.price);
            return all;
          }, {});
          this.submitLoading = true;
          const res = await createAndUpdateRecommend(this.optType, params);
          this.$message.success(res.data.msg);
          this.getRecommendList(this.calcType);
          this.recommendModel = false;
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
    async delRecommend () {
      try {
        this.submitLoading = true;
        const res = await delRecommend({ id: this.delId });
        this.$message.success(res.data.msg);
        this.delVisible = false;
        this.getRecommendList();
        this.submitLoading = false;
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    /* 机柜套餐 end */
    async autoFill (name, data) {
      try {
        const price = JSON.parse(JSON.stringify(data)).reduce((all, cur) => {
          if (cur.price) {
            all[cur.id] = cur.price;
          }
          return all;
        }, {});
        const params = {
          product_id: this.id,
          price,
        };
        const res = await fillDurationRatio(params);
        const fillPrice = res.data.data.list;
        this[name].price = this[name].price.map((item) => {
          item.price = fillPrice[item.id];
          return item;
        });
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    changeBw (e, val) {
      setTimeout(() => {
        this.bwValidator = this.$refs[val].errorClasses === "t-is-success";
      }, 0);
    },

    // 切换选项卡
    changeTab (e) {
      this.lineType = "";
      switch (e) {
        case "duration":
          this.getDurationList();
          break;
        case "data_center":
          this.getDataList();
          this.getCountryList();
          this.chooseData();
          this.getDurationList();
          break;
        case "recommend":
          this.getRecommendList();
          this.chooseData();
          break;
        case "other":
          this.getOtherConfig();
          break;
        default:
          break;
      }
    },
    checkLimit (val) {
      const reg = /^[0-9]*$/;
      if (reg.test(val) && val >= 0 && val <= 99999999) {
        return { result: true };
      } else {
        return {
          result: false,
          message: lang.input + "0~99999999" + lang.verify2,
          type: "warning",
        };
      }
    },
    // 处理价格
    blurPrice (val, ind) {
      let temp = String(val).match(/^\d*(\.?\d{0,2})/g)[0] || "";
      if (temp && !isNaN(Number(temp))) {
        temp = Number(temp).toFixed(2);
      }
      if (temp >= 999999) {
        this.calcForm.price[ind].price = Number(999999).toFixed(2);
      } else {
        this.calcForm.price[ind].price = temp;
      }
    },
    blurSubPrice (val, ind) {
      let temp = String(val).match(/^\d*(\.?\d{0,2})/g)[0] || "";
      if (temp && !isNaN(Number(temp))) {
        temp = Number(temp).toFixed(2);
      }
      if (temp >= 999999) {
        val = 999999.0;
        this.subForm.price[ind].price = Number(999999).toFixed(2);
      } else {
        this.subForm.price[ind].price = temp;
      }
    },
    blurHardPrice (val, ind) {
      let temp = String(val).match(/^\d*(\.?\d{0,2})/g)[0] || "";
      if (temp && !isNaN(Number(temp))) {
        temp = Number(temp).toFixed(2);
      }
      if (temp >= 999999) {
        this.hardwareForm.price[ind].price = Number(999999).toFixed(2);
      } else {
        this.hardwareForm.price[ind].price = temp;
      }
    },
    blurFlexPrice (val, ind) {
      let temp = String(val).match(/^\d*(\.?\d{0,2})/g)[0] || "";
      if (temp && !isNaN(Number(temp))) {
        temp = Number(temp).toFixed(2);
      }
      if (temp >= 999999) {
        this.flexForm.price[ind].price = Number(999999).toFixed(2);
      } else {
        this.flexForm.price[ind].price = temp;
      }
    },

    changeAdvance () {
      this.isAdvance = !this.isAdvance;
    },
    /* 线路 */
    addLine () {
      this.lineModel = true;
      this.lineType = "add";
      this.dataForm.country_id = "";
      this.lineForm = {
        id: "",
        country_id: "", // 线路国家
        city: "", // 线路城市
        data_center_id: "",
        name: "",
        bill_type: "bw", // bw, flow
        // bw_ip_group: "",
        defence_ip_group: "",
        ip_enable: 0, // ip开关
        defence_enable: 0, // 防护开关
        bw_data: [], // 带宽
        flow_data: [], //流量
        defence_data: [], // 防护
        ip_data: [], // ip
        order: 0,
      };
      this.lineRight = false;
    },
    async editLine (row) {
      try {
        const res = await getLineDetails({ id: row.id });
        this.lineForm = JSON.parse(JSON.stringify(res.data.data));
        this.lineType = "update";
        this.optType = "update";
        this.lineRight = false;
        this.lineModel = true;
        this.defence_ip_show = this.lineForm.defence_ip_group ? true : false;
        this.subId = row.id;
      } catch (error) { }
    },
    changeCountry () {
      this.lineForm.city = "";
      this.lineForm.data_center_id = "";
      this.lineForm.line_id = "";
    },
    changeCity () {
      this.lineForm.data_center_id = "";
      this.lineForm.line_id = "";
    },
    // 编辑线路子项
    async editSubItem (row, index, type) {
      this.subType = type;
      this.optType = "update";
      this.delSubIndex = index;
      this.lineRight = true;
      let temp = "";
      this.bwValidator = true;
      if (this.lineType === "add") {
        temp = row;
      } else {
        const res = await getLineChildDetails(type, { id: row.id });
        temp = res.data.data;
        this.delId = row.id;
      }
      setTimeout(() => {
        const price = temp.duration
          .reduce((all, cur) => {
            all.push({
              id: cur.id,
              name: cur.name,
              price: cur.price,
            });
            return all;
          }, [])
          .sort((a, b) => {
            return a.id - b.id;
          });
        Object.assign(this.subForm, temp);
        this.subForm.price = price;
        if (
          this.subForm.other_config.in_bw ||
          this.subForm.other_config.advanced_bw
        ) {
          this.isAdvance = true;
        } else {
          this.isAdvance = false;
        }
      }, 0);
    },
    // 删除线路子项
    async delSubItem () {
      try {
        this.lineRight = false;
        if (this.lineType === "add") {
          // 本地删除
          switch (this.delType) {
            case "line_bw":
              return this.lineForm.bw_data.splice(this.delSubIndex, 1);
            case "line_flow":
              return this.lineForm.flow_data.splice(this.delSubIndex, 1);
            case "line_defence":
              return this.lineForm.defence_data.splice(this.delSubIndex, 1);
            case "line_ip":
              return this.lineForm.ip_data.splice(this.delSubIndex, 1);
          }
        } else {
          // 编辑的时候删除
          this.submitLoading = true;
          const res = await delLineChild(this.delType, { id: this.delId });
          this.$message.success(res.data.msg);
          this.delVisible = false;
          // this.editLine({ id: this.subId })
          this.submitLine({ validateResult: true, firstError: "" }, false);
          this.submitLoading = false;
        }
      } catch (error) { }
    },
    // 新增线路子项
    addLineSub (type) {
      this.subType = type;
      if (this.$refs["bw-item"]) {
        this.bwValidator =
          this.$refs["bw-item"].errorClasses === "t-is-success";
      } else if (this.$refs["ip-item"]) {
        this.bwValidator =
          this.$refs["ip-item"].errorClasses === "t-is-success";
      } else {
        this.bwValidator = true;
      }
      this.optType = "add";
      this.isAdvance = false;
      if (type === "line_bw") {
        this.subForm.type = this.lineForm.bw_data[0]?.type || "radio";
      }

      this.subForm.value = "";
      this.subForm.min_value = "";
      this.subForm.max_value = "";
      this.subForm.other_config = {
        in_bw: "",
        bill_cycle: "last_30days",
      };
      this.lineRight = true;
      const price = this.cycleData
        .reduce((all, cur) => {
          all.push({
            id: cur.id,
            name: cur.name,
            price: "",
          });
          return all;
        }, [])
        .sort((a, b) => {
          return a.id - b.id;
        });
      this.subForm.price = price;
      this.bw_ip_show = false;
      this.defence_ip_show = false;
    },
    // 保存线路子项
    async submitSub ({ validateResult, firstError }) {
      if (validateResult === true) {
        try {
          const params = JSON.parse(JSON.stringify(this.subForm));
          params.step = 1;
          params.product_id = this.id;
          this.submitLoading = true;
          const duration = JSON.parse(JSON.stringify(params.price));
          params.price = params.price.reduce((all, cur) => {
            cur.price && (all[cur.id] = cur.price);
            return all;
          }, {});

          // 新增的时候本地处理
          if (this.lineType === "add") {
            params.duration = duration;
            switch (this.subType) {
              case "line_bw":
                this.optType === "add"
                  ? this.lineForm.bw_data.unshift(params)
                  : this.lineForm.bw_data.splice(this.delSubIndex, 1, params);
                break;
              case "line_flow":
                this.optType === "add"
                  ? this.lineForm.flow_data.unshift(params)
                  : this.lineForm.flow_data.splice(this.delSubIndex, 1, params);
                break;
              case "line_defence":
                this.optType === "add"
                  ? this.lineForm.defence_data.unshift(params)
                  : this.lineForm.defence_data.splice(
                    this.delSubIndex,
                    1,
                    params
                  );
                break;
              case "line_ip":
                this.optType === "add"
                  ? this.lineForm.ip_data.unshift(params)
                  : this.lineForm.ip_data.splice(this.delSubIndex, 1, params);
                break;
            }
            this.submitLoading = false;
            this.lineRight = false;
            return;
          }
          // 新增：传线路id，编辑传配置id
          params.id = this.optType === "add" ? this.subId : this.delId;
          const res = await createAndUpdateLineChild(
            this.subType,
            this.optType,
            params
          );
          this.$message.success(res.data.msg);
          // this.editLine({ id: this.subId })
          this.submitLine({ validateResult: true, firstError: "" }, false);
          this.submitLoading = false;
        } catch (error) {
          console.log("@@@@@line", error);
          this.submitLoading = false;
          this.$message.error(error.data.msg);
        }
      } else {
        if (this.$refs["bw-item"]) {
          this.bwValidator =
            this.$refs["bw-item"].errorClasses === "t-is-success";
        }
        console.log("Errors: ", validateResult);
        this.$message.warning(firstError);
      }
    },

    async submitLine ({ validateResult, firstError }, bol = true) {
      if (validateResult === true) {
        try {
          const params = JSON.parse(JSON.stringify(this.lineForm));
          params.product_id = this.id;
          const isAdd = params.id ? "update" : "add";
          this.submitLoading = true;
          const res = await createAndUpdateLine(isAdd, params);
          if (bol) {
            this.$message.success(res.data.msg);
            this.getDataList();
            this.lineModel = false;
            this.lineType = "";
          } else {
            this.editLine({ id: this.subId });
          }
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

    /* 数据中心 */
    async getDataList () {
      try {
        this.dataLoading = true;
        const res = await getDataCenter({
          product_id: this.id,
          page: 1,
          limit: 1000,
        });
        this.dataList = res.data.data.list;
        this.dataLoading = false;
      } catch (error) {
        this.dataLoading = false;
      }
    },
    // 国家列表
    async getCountryList () {
      try {
        const res = await getCountry();
        this.countryList = res.data.data.list;
      } catch (error) { }
    },
    async chooseData () {
      try {
        const res = await chooseDataCenter({
          product_id: this.id,
        });
        this.countrySelect = res.data.data.list;
        if (this.countrySelect.length === 1) {
          this.lineForm.country_id = this.countrySelect[0].id;
        }
      } catch (error) { }
    },
    changeType () {
      this.$refs.dataForm.clearValidate(["cloud_config_id"]);
    },
    addData () {
      this.optType = "add";
      this.dataModel = true;
      this.dataForm.country_id = "";
      this.dataForm.city = "";
      this.dataForm.area = "";
      this.dataForm.group_id = null;
      this.dataForm.order = 0;
      this.comTitle = lang.new_create + lang.data_center;
    },
    async deleteData () {
      try {
        this.submitLoading = true;
        const res = await deleteDataCenter({ id: this.delId });
        this.$message.success(res.data.msg);
        this.delVisible = false;
        this.getDataList();
        this.chooseData();
        this.submitLoading = false;
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    async deleteLine () {
      try {
        this.submitLoading = true;
        const res = await delLine({ id: this.delId });
        this.$message.success(res.data.msg);
        this.delVisible = false;
        this.getDataList();
        this.submitLoading = false;
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    editData (row) {
      this.comTitle = lang.edit + lang.data_center;
      this.optType = "update";
      this.dataModel = true;
      const { id, country_id, city, area, group_id, order } = row;
      this.dataForm = {
        id,
        country_id,
        city,
        area,
        group_id,
        order
      };
    },
    // 保存数据中心
    async submitData ({ validateResult, firstError }) {
      if (validateResult === true) {
        try {
          const params = JSON.parse(JSON.stringify(this.dataForm));
          params.product_id = this.id;
          if (this.optType === "add") {
            delete params.id;
          }
          this.submitLoading = true;
          const res = await createOrUpdateDataCenter(this.optType, params);
          this.$message.success(res.data.msg);
          this.getDataList();
          this.chooseData();
          this.dataModel = false;
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
    /* 型号配置 */
    async getModelList () {
      try {
        this.modelLoading = true;
        const res = await getModel({
          product_id: this.id,
          page: 1,
          limit: 1000,
        });
        this.modelList = res.data.data.list;
        this.modelLoading = false;
      } catch (error) {
        this.modelLoading = false;
      }
    },
    createOptions (value, type) {
      this[`${type}List`].push({
        id: -this[`${type}List`].length,
        value,
      });
      this.calcForm[type] = value;
    },
    // 拖动排序
    async changeModelSort ({ current, targetIndex, newData }) {
      try {
        const targetId =
          targetIndex === 0
            ? 0
            : newData[newData.findIndex((item) => item.id === current.id) - 1]
              .id;
        const params = {
          id: current.id,
          prev_model_config_id: targetId,
        };
        const res = await changeModelSort(params);
        this.$message.success(res.data.msg);
        this.getModelList();
      } catch (error) {
        console.log("error", error);
        this.$message.error(error.data.msg);
      }
    },
    addCalc (type) {
      // 固定机型
      // 添加model
      this.calcType = type;
      this.optType = "add";
      let temp_type = "";
      switch (type) {
        case "model":
          this.comTitle = `${lang.order_text53}${lang.model_specs}`;
          break;
      }
      this.calcModel = true;
      const price = this.cycleData
        .reduce((all, cur) => {
          all.push({
            id: cur.id,
            name: cur.name,
            price: "",
          });
          return all;
        }, [])
        .sort((a, b) => {
          return a.id - b.id;
        });
      this.isAdvance = false;
      this.calcForm = {
        name: "",
        group_id: "",
        cpu: "",
        cpu_param: "",
        memory: "",
        disk: "",
        // 增值选配
        support_optional: 0,
        optional_only_for_upgrade: 0,
        optional_memory_id: [],
        leave_memory: undefined,
        max_memory_num: undefined,
        optional_disk_id: [],
        max_disk_num: undefined,
        optional_gpu_id: [],
        gpu: "",
        max_gpu_num: undefined,
        price,
      };
    },
    // 编辑 model
    async editCalc (row, type) {
      this.calcType = type;
      this.optType = "update";
      this.disabledWay = true;
      this.comTitle = `${lang.edit}${lang.model_specs}`;
      this.editModel(row);
      this.isAdvance = false;
    },
    async editModel (row) {
      try {
        const res = await getModelDetails({
          id: row.id,
        });
        this.calcModel = true;
        const temp = res.data.data;
        let price = temp.duration
          .reduce((all, cur) => {
            all.push({
              id: cur.id,
              name: cur.name,
              price: cur.price,
            });
            return all;
          }, [])
          .sort((a, b) => {
            return a.id - b.id;
          });
        temp.price = price;
        delete temp.duration;
        temp.max_memory_num = temp.max_memory_num || undefined;
        temp.leave_memory = temp.leave_memory || undefined;
        temp.max_disk_num = temp.max_disk_num || undefined;
        temp.max_gpu_num = temp.max_gpu_num || undefined;
        Object.assign(this.calcForm, temp);
        this.optType = "update";
        this.calcModel = true;
      } catch (error) { }
    },
    submitCalc ({ validateResult, firstError }) {
      if (validateResult === true) {
        switch (this.calcType) {
          case "model":
            return this.handlerModel();
        }
      } else {
        console.log("Errors: ", validateResult);
        this.$message.warning(firstError);
      }
    },
    async deleteModel () {
      try {
        this.submitLoading = true;
        const res = await delModel({
          id: this.delId,
        });
        this.$message.success(res.data.msg);
        this.delVisible = false;
        this.getModelList();
        this.submitLoading = false;
      } catch (error) {
        this.submitLoading = false;
        this.delVisible = false;
        this.$message.error(error.data.msg);
      }
    },

    /* 改变最大最小值：内存，系统盘和数据盘
    根据calcType来区分：memory=512， 其他 1048576
     */
    changeMin (e) {
      const num = this.calcType === "memory" ? 512 : 1048576;
      if (e * 1 >= num) {
        this.subForm.min_value = 1;
      } else if (e * 1 >= this.subForm.max_value * 1) {
        if (this.subForm.max_value * 1) {
          this.subForm.max_value = e * 1;
        }
      }
    },
    changeMax (e) {
      const num = this.calcType === "memory" ? 512 : 1048576;
      if (e * 1 > num) {
        this.subForm.max_value = num;
      } else if (e * 1 <= this.subForm.min_value * 1) {
        if (this.subForm.min_value * 1) {
          this.subForm.min_value = e * 1;
        }
      }
    },
    changeStep (e) {
      if (e * 1 > this.calcForm.max_value * 1 - this.calcForm.min_value * 1) {
        this.calcForm.step = 1;
      }
    },
    /* 型号配置 end*/
    /* 周期相关 */
    async changeRadio () {
      try {
        const res = await getDurationRatio({
          product_id: this.id,
        });
        this.ratioData = res.data.data.list.map((item) => {
          item.ratio = item.ratio ? item.ratio * 1 : null;
          return item;
        });
        this.ratioModel = true;
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    async saveRatio () {
      try {
        const isAll = this.ratioData.every((item) => item.ratio);
        if (!isAll) {
          return this.$message.error(`${lang.input}${lang.mf_ratio}`);
        }
        const temp = JSON.parse(JSON.stringify(this.ratioData)).reduce(
          (all, cur) => {
            all[cur.id] = cur.ratio;
            return all;
          },
          {}
        );
        const params = {
          product_id: this.id,
          ratio: temp,
        };
        this.submitLoading = true;
        const res = await saveDurationRatio(params);
        this.submitLoading = false;
        this.ratioModel = false;
        this.$message.success(res.data.msg);
        this.getDurationList();
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    closeData () {
      this.dataModel = false;
      this.lineModel = false;
      this.recommendModel = false;
      this.lineType = "";
    },
    closeDataCenter () {
      this.dataModel = false;
      this.getRecommendList();
    },
    async getDurationList () {
      try {
        this.loading = true;
        const res = await getDuration({
          product_id: this.id,
          page: 1,
          limit: 100,
        });
        this.cycleData = res.data.data.list;
        this.loading = false;
      } catch (error) {
        this.loading = false;
      }
    },
    addCycle () {
      this.optType = "add";
      this.comTitle = lang.add_cycle;
      this.cycleForm.name = "";
      this.cycleForm.unit = "month";
      this.cycleForm.num = "";
      this.cycleForm.price_factor = 1;
      this.cycleForm.price = null;
      this.cycleModel = true;
    },
    editCycle (row) {
      this.optType = "update";
      this.comTitle = lang.update + lang.cycle;
      this.cycleForm = JSON.parse(JSON.stringify(row));
      this.cycleModel = true;
      if (this.cycleForm.price) {
        this.cycleForm.price = this.cycleForm.price * 1;
      }
    },
    async submitCycle ({ validateResult, firstError }) {
      if (validateResult === true) {
        try {
          const params = JSON.parse(JSON.stringify(this.cycleForm));
          params.product_id = this.id;
          if (this.optType === "add") {
            delete params.id;
          }
          if (!params.price_factor && params.price_factor !== 0) {
            params.price_factor = "1.00";
          }
          this.submitLoading = true;
          const res = await createAndUpdateDuration(this.optType, params);
          this.$message.success(res.data.msg);
          this.getDurationList();
          this.cycleModel = false;
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
    // 删除周期
    async deleteCycle () {
      try {
        this.submitLoading = true;
        const res = await delDuration({
          product_id: this.id,
          id: this.delId,
        });
        this.$message.success(res.data.msg);
        this.delVisible = false;
        this.getDurationList();
        this.submitLoading = false;
      } catch (error) {
        this.submitLoading = false;
        this.$message.error(error.data.msg);
      }
    },

    /* 其他设置 */
    async getOtherConfig () {
      try {
        const res = await getCloudConfig({
          product_id: this.id,
        });
        this.otherForm = res.data.data;
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    async submitConfig ({ validateResult, firstError }) {
      if (validateResult === true) {
        try {
          const params = JSON.parse(JSON.stringify(this.otherForm));
          params.product_id = this.id;
          this.submitLoading = true;
          const res = await saveCloudConfig(params);
          this.$message.success(res.data.msg);
          this.submitLoading = false;
          this.dataModel = false;
          this.getOtherConfig();
        } catch (error) {
          this.submitLoading = false;
          this.$message.error(error.data.msg);
        }
      } else {
        console.log("Errors: ", validateResult);
        this.$message.warning(firstError);
      }
    },
    /* 通用删除按钮 */
    comDel (type, row, index, mod) {
      this.batchDelete = false;
      this.hardMode = mod;
      this.delId = row.id;
      if (type === "cycle") {
        this.delTit = lang.sure_del_cycle;
      }
      this.delTit = lang.sureDelete;
      this.delType = type;
      // 新增的时候，本地删除线路子项
      if (
        this.lineType === "add" &&
        (this.subType === "line_bw" ||
          this.subType === "line_flow" ||
          this.subType === "line_defence" ||
          this.subType === "line_ip")
      ) {
        this.delSubIndex = index;
        this.delSubItem();
        return;
      }
      this.delVisible = true;
    },
    // 通用删除
    sureDelete () {
      // cycle, c_line, data, model, hard, limit, system, group, line_bw, line_flow, line_ip, line_defence
      switch (this.delType) {
        case "cycle":
          return this.deleteCycle();
        case "model":
          return this.deleteModel();
        case "system": // 删除镜像
          return this.deleteSystem();
        case "group": // 删除镜像分类
          return this.deleteGroup();
        case "data":
          return this.deleteData();
        case "c_line":
          return this.deleteLine();
        case "line_bw":
        case "line_flow":
        case "line_defence":
        case "line_ip":
          return this.delSubItem();
        case "limit":
          return this.delLimit();
        case "hard":
          return this.delHard();
        case "flex":
          return this.delFlex();
        case 'batchSystem':
          return this.handlerBatchSystem();
        default:
          return null;
      }
    },
    formatPrice (val) {
      return (val * 1).toFixed(2);
    },
  },
  created () {
    this.id = location.href.split("?")[1].split("=")[1];
    // 默认拉取数据
    this.getDurationList();
  },
}).$mount(template);

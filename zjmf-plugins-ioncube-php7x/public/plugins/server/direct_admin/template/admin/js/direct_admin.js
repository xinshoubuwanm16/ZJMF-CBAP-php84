const template = document.getElementsByClassName("common_config")[0];
Vue.prototype.lang = Object.assign(window.lang, window.module_lang);
new Vue({
  components: {
    comConfig,
  },
  data() {
    return {
      host: location.origin,
      id: "",
      tabs: "duration", // duration,host,data_center,other
      hover: true,
      tableLayout: false,
      delVisible: false,
      loading: false,
      currency_prefix:
        JSON.parse(localStorage.getItem("common_set")).currency_prefix || "¥",
      currency_suffix:
        JSON.parse(localStorage.getItem("common_set")).currency_suffix || "",
      optType: "add", // 新增/编辑
      comTitle: "",
      delTit: "",
      delType: "",
      delId: "",
      submitLoading: false,
      /* 周期 */
      cycleData: [],
      dataModel: false,
      cycleModel: false,
      cycleForm: {
        product_id: "",
        name: "",
        num: "",
        unit: "month",
        price_factor: undefined,
        price: undefined,
      },
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
        // 系统相关
        image_group_id: [
          {
            required: true,
            message: lang.select + lang.system_classify,
            type: "error",
          },
        ],
        rel_image_id: [
          {
            required: true,
            message: lang.input + lang.opt_system + "ID",
            type: "error",
          },
          {
            pattern: /^[0-9]*$/,
            message: lang.input + lang.verify16,
            type: "warning",
          },
        ],
        price: [
          {
            required: true,
            message: lang.input + lang.box_title34,
            type: "error",
          },
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
      treeProps: {
        keys: {
          label: "name",
          value: "id",
          children: "data_center",
        },
        minCollapsedNum: 1,
      },
      /* 主机配置 */
      hostData: [],
      hostaModel: false,
      hostLoading: false,
      hostForm: {
        name: "",
        country_id: "",
        city: "",
        area: "",
        url: "",
        username: "",
        password: "",
        port: null,
        ftp_port: null,
      },
      hostColumns: [
        {
          colKey: "name",
          title: `DA${lang.da_host_name}`,
          ellipsis: true,
          width: 200,
        },
        {
          colKey: "da_area",
          title: lang.da_area,
          ellipsis: true,
          width: 200,
        },
        {
          colKey: "username",
          title: lang.username,
          ellipsis: true,
          width: 200,
        },
        {
          colKey: "ssl",
          title: `SSL${lang.feed_link}`,
          ellipsis: true,
          width: 100,
        },
        {
          colKey: "port",
          title: `DA${lang.auth_port}`,
          ellipsis: true,
          width: 150,
          className: "status-item",
        },
        {
          colKey: "ftp_port",
          title: `FTP${lang.auth_port}`,
          ellipsis: true,
          width: 150,
          className: "status-item",
        },
        {
          colKey: "op",
          title: lang.operation,
          width: 120,
        },
      ],
      /* 其他设置 */
      otherForm: {
        gift_domain_value: null,
        gift_domain_suffix: [],
      },
      allSuffixs: [],
      versionArr: [
        { value: "host", label: lang.kvm_major },
        { value: "lightHost", label: lang.kvm_light },
        { value: "hyperv", label: "Hyper-V" },
      ],
      rulesList: [
        // 平衡规则
        { value: 1, label: lang.mf_rule1 },
        { value: 2, label: lang.mf_rule2 },
        { value: 3, label: lang.mf_rule3 },
      ],
      dataRules: {
        gift_domain_value: [
          {
            required: true,
            message: `${lang.input}${lang.da_max_value}`,
            type: "error",
          },
        ],
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
        link_data_center_id: [
          {
            required: true,
            message: `${lang.select}${lang.mf_concat}`,
            type: "error",
          },
        ],
        flow: [
          {
            required: true,
            message: `${lang.input}${lang.cloud_flow}`,
            type: "error",
          },
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
            pattern: /^[A-Za-z][a-zA-Z0-9_.]{0,9}$/,
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
            message: lang.select + lang.country_area,
            type: "error",
          },
        ],
        city: [
          { required: true, message: lang.select + lang.city, type: "error" },
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
        cpu: [
          { required: true, message: `${lang.input}CPU`, type: "error" },
          {
            pattern: /^[0-9]*$/,
            message: lang.input + "1-240" + lang.verify2,
            type: "warning",
          },
          {
            validator: (val) => val >= 1 && val <= 240,
            message: lang.input + "1-240" + lang.verify2,
            type: "warning",
          },
        ],
        memory: [
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
        system_disk_size: [
          {
            required: true,
            message: `${lang.input}${lang.system_disk_size}`,
            type: "error",
          },
          {
            pattern: /^[0-9]*$/,
            message: lang.input + "1-1048576" + lang.verify2,
            type: "warning",
          },
          {
            validator: (val) => val >= 1 && val <= 1048576,
            message: lang.input + "1-1048576" + lang.verify2,
            type: "warning",
          },
        ],
        data_disk_size: [
          {
            pattern: /^[0-9]*$/,
            message: lang.input + "1-1048576" + lang.verify2,
            type: "warning",
          },
          {
            validator: (val) => val >= 1 && val <= 1048576,
            message: lang.input + "1-1048576" + lang.verify2,
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
            message: lang.input + "1-30000" + lang.verify2,
            type: "warning",
          },
          {
            validator: (val) => val >= 1 && val <= 30000,
            message: lang.input + "1-30000" + lang.verify2,
            type: "warning",
          },
        ],
        peak_defence: [
          {
            pattern: /^[0-9]*$/,
            message: lang.input + "1-999999" + lang.verify2,
            type: "warning",
          },
          {
            validator: (val) => val >= 1 && val <= 999999,
            message: lang.input + "1-999999" + lang.verify2,
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
            message: `${lang.select}${lang.bw_line}`,
            type: "error",
          },
        ],
        min_bw: [
          {
            required: true,
            message: `${lang.input}${lang.min_value}`,
            type: "error",
          },
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
            required: true,
            message: `${lang.input}${lang.max_value}`,
            type: "error",
          },
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
        url: [
          {
            required: true,
            pattern:
              /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/,
            message: `${lang.input}${lang.da_host_address}`,
            type: "error",
          },
        ],
        username: [
          {
            required: true,
            message: `${lang.input}${lang.username}`,
            type: "error",
          },
        ],
        password: [
          {
            required: true,
            message: `${lang.input}${lang.password}`,
            type: "error",
          },
        ],
        direct_admin_server_id: [
          {
            required: true,
            message: `${lang.select}${lang.da_host}`,
            type: "error",
          },
        ],
        remote_meal: [
          {
            required: true,
            message: `${lang.select}${lang.package}`,
            type: "error",
          },
        ],
        php_version_low: [
          {
            required: true,
            message: `${lang.input}${lang.version}`,
            type: "error",
          },
        ],
        php_version_high: [
          {
            required: true,
            message: `${lang.input}${lang.version}`,
            type: "error",
          },
        ],
      },
      calcRules: {
        // 计算配置验证
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
        cpuValue: [
          {
            required: true,
            message: `${lang.input}${lang.mf_cores}`,
            type: "error",
          },
          {
            pattern: /^[0-9]*$/,
            message: lang.input + "1-240" + lang.verify2,
            type: "warning",
          },
          {
            validator: (val) => val >= 1 && val <= 240,
            message: lang.input + "1-240" + lang.verify2,
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
        read_bytes: [
          { required: true, message: `${lang.input}`, type: "error" },
          { validator: this.checkLimit },
        ],
        write_bytes: [
          { required: true, message: `${lang.input}`, type: "error" },
          { validator: this.checkLimit },
        ],
        read_iops: [
          { required: true, message: `${lang.input}`, type: "error" },
          { validator: this.checkLimit },
        ],
        write_iops: [
          { required: true, message: `${lang.input}`, type: "error" },
          { validator: this.checkLimit },
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
      dataColumns: [
        {
          colKey: "id",
          title: lang.index_text8,
          width: 80,
          ellipsis: true,
        },
        {
          colKey: "name_zh",
          title: lang.country,
          width: 120,
          ellipsis: true,
        },
        {
          colKey: "city",
          title: lang.city,
          width: 120,
          ellipsis: true,
        },
        {
          colKey: "area",
          title: lang.area,
          width: 120,
          ellipsis: true,
        },
        {
          colKey: "name",
          title: lang.mf_package_name,
          width: 150,
          ellipsis: true,
        },
        {
          colKey: "server_name",
          title: lang.belong_host,
          width: 150,
          ellipsis: true,
        },
        {
          colKey: "price",
          title: `${lang.price}`,
          width: 150,
          ellipsis: true,
        },
        {
          colKey: "description",
          title: lang.description,
          ellipsis: true,
          width: 200,
        },
        {
          colKey: "op",
          title: lang.operation,
          width: 100,
          ellipsis: true,
        },
      ],
      dataForm: {
        // 新建套餐
        name: "",
        country_id: "",
        city: "",
        area: "",
        description: "",
        direct_admin_server_id: "",
        remote_meal: "",
        disk: null,
        disk_unit: "MB",
        email_num: null,
        domain_num: 1,
        sub_domain_num: 1,
        flow: null,
        flow_unit: "MB",
        //  second_domain: "",
        gift_domain: 0,
        independent_ip: 0,
        os: "Linux",
        os_detail: "",
        php_version_low: null,
        php_version_high: null,
        price: [],
      },
      packageLoading: false,
      unitArr: [
        { value: "MB", label: "MB" },
        { value: "GB", label: "GB" },
        { value: "TB", label: "TB" },
      ],
      isInit: false,
      hostList: [], // 主机列表
      packageList: [],
      second_domains: [],
      popupPropsUnit: {
        overlayClassName: "unit-pup",
      },
      sub_domains: [],
      link_area: [],
      countryList: [],
      existCountries: [],
      dataLoading: false,
      /* 线路相关 */
      lineType: "", // 新增,编辑线路，新增的时候本地操作，保存一次性提交
      subType: "", // 线路子项类型， line_bw, line_flow, line_defence, line_ip
      lineForm: {
        bw_data: [], // 带宽
      },
      bw_ip_show: false, // bw 高级配置
      defence_ip_show: false, // 防护高级配置
      subForm: {
        // 线路子项表单
        type: "",
        value: "",
        price: [],
        min_value: "",
        max_value: "",
        step: "",
        other_config: {
          in_bw: "",
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
          title: lang.box_title34,
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
      submitLoading: false,
      isShowDomain: false,
    };
  },
  computed: {
    isShowFill() {
      return (price) => {
        const index = price.findIndex((item) => item.price);
        return index === -1;
      };
    },
    calcCountryName() {
      return (item) => {
        const lang = localStorage.getItem("backLang") || "zh-cn";
        if (lang === "zh-cn") {
          return item.name_zh;
        } else {
          return item.name;
        }
      };
    },
    calcName() {
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
    calcIcon() {
      return (
        this.host +
        "/upload/common/country/" +
        this.countryList.filter(
          (item) => item.id === this.hostForm.country_id
        )[0]?.iso +
        ".png"
      );
    },
    calcIcon1() {
      return (
        this.host +
        "/upload/common/country/" +
        this.existCountries.filter(
          (item) => item.country_id === this.dataForm.country_id
        )[0]?.iso +
        ".png"
      );
    },
    calcCity() {
      return (type) => {
        const city =
          this.existCountries.filter(
            (item) => item.country_id === this[type].country_id
          )[0]?.cites || [];
        if (city.length === 1) {
          this[type].city = city[0];
        }
        return city;
      };
    },
    calcArea() {
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
    calcSelectLine() {
      if (!this.countrySelect) {
        return;
      }
      const line =
        this.countrySelect
          .filter((item) => item.id === this.lineForm.country_id)[0]
          ?.city.filter((item) => item.name === this.lineForm.city)[0]
          ?.area.filter((item) => item.id === this.lineForm.data_center_id)[0]
          ?.line || [];
      if (line.length === 1) {
        this.lineForm.line_id = line[0].id;
        this.calcLineType = line[0].bill_type;
      }
      return line;
    },
    calcColums() {
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
    calcSubTitle() {
      // 副标题
      return (data) => {
        if (data.length > 0) {
          return lang[`mf_${data[0].type}`] + lang.mf_way;
        } else {
          return "";
        }
      };
    },
    calcPrice() {
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
    calcShow() {
      switch (this.subType) {
        case "line_bw":
          return this.lineForm.bw_data.length > 0 ? true : false;
      }
    },
    calcLimitData() {
      return (name) => {
        return this[`${name}_list`];
      };
    },
    calcLimitCol() {
      return (name) => {
        return this[`${name}_columns`];
      };
    },
    calcCpu() {
      return (val) => {
        return val.value + lang.cores;
      };
    },
    calcMemory() {
      return (val) => {
        return val.value + this.memory_unit;
      };
    },
    calcLine() {
      // 当前线路
      return this.dataList.filter(
        (item) =>
          item.country_id === this.lineForm.country_id &&
          item.city === this.lineForm.city
      )[0]?.line;
    },
    calcMemery() {
      return (data) => {
        return data.split(",");
      };
    },
    calcRange() {
      // 计算验证范围
      return (val) => {
        if (this.calcType === "memory") {
          // 内存
          if (this.calcForm.memory_unit === "GB") {
            return val >= 1 && val <= 512;
          } else {
            return val >= 128 && val <= 524288;
          }
        } else {
          return val >= 1 && val <= 1048576;
        }
      };
    },
    calcReg() {
      // 动态生成规则
      return (name, min, max) => {
        return [
          { required: true, message: `${lang.input}${name}`, type: "error" },
          {
            pattern: /^[0-9]*$/,
            message: lang.input + `${min}-${max}` + lang.verify1,
            type: "warning",
          },
          {
            validator: (val) => val >= min && val <= max,
            message: lang.input + `${min}-${max}` + lang.verify1,
            type: "warning",
          },
        ];
      };
    },
    calcUnit() {
      if (this.calcType === "memory") {
        return this.calcForm.memory_unit;
      } else {
        return "GB";
      }
    },
    calcPlaceh() {
      if (this.calcType === "memory") {
        return this.calcForm.memory_unit === "GB"
          ? lang.mf_tip9
          : lang.mf_tip33;
      } else {
        return lang.mf_tip9;
      }
    },
    calcMemeryColumns() {
      if (this.memoryList.length === 0) {
        return this.memoryColumns;
      } else {
        const temp = JSON.parse(JSON.stringify(this.memoryColumns));
        temp[0].title = `${lang.memory}（MB）`;
        return this.memory_unit === "MB" ? temp : this.memoryColumns;
      }
    },
  },
  watch: {
    "dataForm.city"(name) {
      this.hostList = [];
      this.second_domains = [];
      if (name) {
        this.getCurHost();
        this.packageLoading = false;
      }
    },
    "dataForm.direct_admin_server_id"(id) {
      if (id) {
        this.changeHost();
        if (!this.isInit) {
          //  this.dataForm.second_domain = "";
          this.dataForm.remote_meal = "";
        }
      }
    },
  },
  methods: {
    async autoFill(name, data) {
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
    async getPlugin() {
      try {
        const res = await getPluginList();
        const temp = res.data.data.list
          .filter((item) => item.status === 1)
          .reduce((all, cur) => {
            all.push(cur.name);
            return all;
          }, []);
        this.isShowDomain = temp.includes("IdcsmartDomain");
      } catch (error) {
        console.log("error", error);
      }
    },
    async editIp(item) {
      try {
        this.comTitle = `${lang.edit}IP${lang.price}`;
        this.calcForm.data_center_id = item.id;
        const res = await getIpPrice({
          id: item.id,
          product_id: this.id,
        });
        this.calcForm.price = res.data.data.list;
        this.calcModel = true;
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    async changeSort(e) {
      try {
        this.systemGroup = e.newData;
        const image_group_order = e.newData.reduce((all, cur) => {
          all.push(cur.id);
          return all;
        }, []);
        const res = await changeImageGroup({ image_group_order });
        this.$message.success(res.data.msg);
        this.getGroup();
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    // 切换选项卡
    changeTab(e) {
      this.allStatus = false;
      this.backAllStatus = false;
      switch (e) {
        case "duration":
          this.getDurationList();
          break;
        case "host":
          this.getHostList();
          this.getCountryList();
          break;
        case "data_center":
          this.getDataList();
          this.chooseData();
          this.getExistCountries();
          this.getHostList(false);
          this.optType = "";
          // this.getDurationList();
          break;
        case "other":
          this.getOtherConfig();
          this.getDomainSuffix();
          break;
        default:
          break;
      }
    },
    changeMinMemory(val) {
      if (this.lineForm.max_memory) {
        if (val * 1 >= this.lineForm.max_memory * 1) {
          this.lineForm.min_memory = val >= 524288 ? val - 1 : val;
          this.lineForm.max_memory = this.lineForm.min_memory * 1 + 1;
        }
      }
    },
    changeMaxMemory(val) {
      if (this.lineForm.min_memory) {
        if (val * 1 <= this.lineForm.min_memory * 1) {
          this.lineForm.max_memory = this.lineForm.max_memory >= 2 ? val : 2;
          this.lineForm.min_memory = this.lineForm.max_memory * 1 - 1;
        }
      }
    },
    // 处理价格
    blurPrice(val, ind) {
      let temp = String(val).match(/^\d*(\.?\d{0,2})/g)[0] || "";
      if (temp && !isNaN(Number(temp))) {
        temp = Number(temp).toFixed(2);
      }
      if (temp >= 999999) {
        this.dataForm.price[ind].price = Number(999999).toFixed(2);
      } else {
        this.dataForm.price[ind].price = temp;
      }
    },
    blurSubPrice(val, ind) {
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
    /* 主机配置 */
    async getHostList(bol = true) {
      try {
        this.hostLoading = true;
        const res = await getHost({ product_id: this.id });
        const temp = res.data.data.list;
        if (bol) {
          temp.forEach((item) => {
            item.port_status = null;
            item.ftp_port_status = null;
            item.port_reason = "";
            item.ftp_port_reason = "";
            this.getSingleStatus("port", item);
            this.getSingleStatus("ftp_port", item);
          });
        } else {
          // 初次拉取所有状态，新增拉取第一个，修改只刷新自己，删除不刷新
          if (this.optType === "add") {
            this.getSingleStatus("port", temp[0]);
            this.getSingleStatus("ftp_port", temp[0]);
          } else if (this.optType === "update") {
            const row = this.hostData.filter(
              (item) => item.id === this.delId
            )[0];
            this.getSingleStatus("port", row);
            this.getSingleStatus("ftp_port", row);
          }
        }
        this.hostData = temp;
        this.hostLoading = false;
      } catch (error) {
        this.hostLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    // 获取单个状态
    async getSingleStatus(type, row) {
      try {
        row[`${type}_status`] = null;
        row[`${type}_reason`] = "";
        const res = await testHostStatus(type, row.id);
        this.hostData.forEach((item, index) => {
          if (item.id === row.id) {
            item[`${type}_status`] = res.data.status;
          }
        });
      } catch (error) {
        this.hostData.forEach((item, index) => {
          if (item.id === row.id) {
            item[`${type}_status`] = error.data.status;
            item[`${type}_reason`] = error.data.msg;
          }
        });
        this.$message.error(error.data.msg);
      }
    },
    addHost() {
      this.optType = "add";
      this.hostaModel = true;
      this.hostForm.name = "";
      this.hostForm.country_id = "";
      this.hostForm.city = "";
      this.hostForm.area = "";
      this.hostForm.url = "";
      this.hostForm.username = "";
      this.hostForm.password = "";
      this.hostForm.port = null;
      this.hostForm.ftp_port = null;
      this.comTitle = `${lang.new_create}${lang.da_host}`;
    },
    async changeSsl(ssl, row) {
      try {
        const res = await changeSsl({
          id: row.id,
          ssl,
        });
        this.$message.success(res.data.msg);
        this.getHostList();
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    editHost(row) {
      this.optType = "update";
      this.comTitle = lang.update + lang.da_host;
      this.hostForm = JSON.parse(JSON.stringify(row));
      if (row.port) {
        this.hostForm.port = this.hostForm.port * 1;
      }
      if (row.ftp_port) {
        this.hostForm.ftp_port = this.hostForm.ftp_port * 1;
      }
      this.delId = row.id;
      this.hostaModel = true;
    },
    async deleteHost() {
      try {
        this.submitLoading = true;
        const res = await deleteHost({
          id: this.delId,
          product_id: this.id,
        });
        this.$message.success(res.data.msg);
        this.getHostList(false);
        this.delVisible = false;
        this.submitLoading = false;
      } catch (error) {
        this.submitLoading = false;
        this.delVisible = false;
        this.$message.error(error.data.msg);
      }
    },
    // 保存主机配置
    async submitHost({ validateResult, firstError }) {
      if (validateResult === true) {
        try {
          const params = JSON.parse(JSON.stringify(this.hostForm));
          params.product_id = this.id;
          if (this.optType === "add") {
            delete params.id;
          }
          this.submitLoading = true;
          const res = await createOrUpdateHost(this.optType, params);
          this.$message.success(res.data.msg);
          this.getHostList(false);
          this.hostaModel = false;
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
    /* 套餐 */
    addLine() {
      this.lineModel = true;
      this.lineType = "add";
      this.dataForm.country_id = "";
      this.lineForm = {
        country_id: "", // 线路国家
        city: "", // 线路城市
        data_center_id: "",
        name: "",
        order: 0,
        bill_type: "bw", // bw, flow
        bw_ip_group: "",
        defence_ip_group: "",
        ip_enable: 0, // ip开关
        defence_enable: 0, // 防护开关
        bw_data: [], // 带宽
        flow_data: [], //流量
        defence_data: [], // 防护
        ip_data: [], // ip
        link_clone: false,
      };
      this.lineRight = false;
    },
    // 编辑独立带宽
    async editLine(row) {
      try {
        const res = await getAloneBw({
          id: row.id,
          product_id: this.id,
        });
        this.subId = row.id;
        this.lineForm.bw_data = res.data.data.list;
        this.lineType = "update";
        this.optType = "update";
        this.lineRight = false;
        this.lineModel = true;
      } catch (error) {}
    },
    changeCountry() {
      this.lineForm.city = "";
      this.lineForm.data_center_id = "";
    },
    changeCity() {
      this.lineForm.data_center_id = "";
    },
    // 编辑线路子项
    async editSubItem(row, index, type) {
      this.subType = type;
      this.optType = "update";
      this.delSubIndex = index;
      this.lineRight = true;
      let temp = "";
      if (this.lineType === "add") {
        temp = row;
      } else {
        const res = await getAloneBwDetails({ id: row.id });
        temp = res.data.data;
        if (temp.other_config?.traffic_type) {
          temp.other_config.traffic_type = String(
            temp.other_config.traffic_type
          );
        }
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
    async delSubItem() {
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
          const res = await delAloneBw({ id: this.delId });
          this.$message.success(res.data.msg);
          this.delVisible = false;
          this.editLine({ id: this.subId });
          this.getDataList();
          this.submitLoading = false;
          // this.submitLine({ validateResult: true, firstError: "" }, false);
        }
      } catch (error) {
        this.submitLoading = false;
        this.delVisible = false;
        this.$message.error(error.data.msg);
      }
    },
    // 新增线路子项
    addLineSub(type) {
      this.subType = type;
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
    /* 推荐配置 */
    changeBillType(e) {
      this.calcLineType = this.calcSelectLine.filter(
        (item) => item.id === e
      )[0]?.bill_type;
    },
    // 保存线路子项
    async submitSub({ validateResult, firstError }) {
      if (validateResult === true) {
        try {
          const params = JSON.parse(JSON.stringify(this.subForm));
          params.product_id = this.id;
          params.step = 1;
          this.submitLoading = true;
          const duration = JSON.parse(JSON.stringify(params.price));
          params.price = duration.reduce((all, cur) => {
            cur.price && (all[cur.id] = cur.price);
            return all;
          }, {});
          // 新增：传线路id，编辑传配置id
          params.id = this.optType === "add" ? this.subId : this.delId;
          const res = await createAndUpdateAloneBw(this.optType, params);
          this.$message.success(res.data.msg);
          this.editLine({ id: this.subId });
          // this.editLine({ id: this.subId })
          // 保存子项的时候需要保存线路配置，第一次未开启防护/附加IP的时候，开关会被重置
          // this.submitLine({ validateResult: true, firstError: "" }, false);
          this.submitLoading = false;
          this.getDataList();
        } catch (error) {
          this.submitLoading = false;
          this.$message.error(error.data.msg);
        }
      } else {
        console.log("Errors: ", validateResult);
        this.$message.warning(firstError);
      }
    },

    async submitLine({ validateResult, firstError }, bol = true) {
      if (validateResult === true) {
        try {
          const params = JSON.parse(JSON.stringify(this.lineForm));
          params.product_id = this.id;
          params.link_clone = params.link_clone ? 1 : 0;
          // if (params.bill_type === 'bw') {
          //   if (params.bw_data.length === 0) {
          //     return this.$message.warning(lang.mf_tip13)
          //   }
          // }
          // if (params.bill_type === 'flow') {
          //   if (params.flow_data.length === 0) {
          //     return this.$message.warning(lang.mf_tip14)
          //   }
          // }
          const isAdd = params.id ? "update" : "add";
          this.submitLoading = true;
          const res = await createAndUpdateLine(isAdd, params);
          if (bol) {
            this.$message.success(res.data.msg);
            this.getDataList();
            this.lineModel = false;
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

    /* 套餐 */
    async getDataList() {
      try {
        this.dataLoading = true;
        const res = await getDataCenter({
          product_id: this.id,
        });
        this.dataList = res.data.data.list;
        // this.link_area = res.data.data.link_data_center;
        this.dataLoading = false;
      } catch (error) {
        this.dataLoading = false;
      }
    },
    // 国家列表
    async getCountryList() {
      try {
        const res = await getCountry();
        this.countryList = res.data.data.list;
      } catch (error) {}
    },
    /* 获取已添加国家 */
    async getExistCountries() {
      try {
        const res = await getExistCountry({ product_id: this.id });
        this.existCountries = res.data.data.countries;
      } catch (error) {}
    },
    /* 获取已有区域 */
    async chooseData() {
      try {
        const res = await getExistArea({
          product_id: this.id,
        });
        this.countrySelect = res.data.data.areas.reduce((all, cur) => {
          all.push({
            value: cur.area,
            label: cur.area,
          });
          return all;
        }, []);
      } catch (error) {}
    },
    createOptions(value) {
      this.countrySelect.push({
        value,
        label: value,
      });
    },
    changeType() {
      this.$refs.dataForm.clearValidate(["cloud_config_id"]);
    },
    // 切换国家
    changeCurCountry() {
      this.dataForm.city = this.calcCity("dataForm")[0];
    },
    // 获取当前区域下面的主机列表
    async getCurHost() {
      try {
        const res = await getAreaHost({
          product_id: this.id,
          country_id: this.dataForm.country_id,
          city: this.dataForm.city,
        });
        if (!this.isInit) {
          this.dataForm.direct_admin_server_id = "";
        }
        this.isInit = false;
        this.hostList = res.data.data.server;
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    // 切换主机id获取套餐和 二级域名
    async changeHost() {
      try {
        this.packageList = [];
        this.packageLoading = true;
        const res = await getRemotePackage({
          id: this.dataForm.direct_admin_server_id,
          product_id: this.id,
        });
        this.packageList = res.data.data.packages;
        // this.second_domains = res.data.data.second_domains.reduce((all, cur) => {
        //   all.push({
        //     value: cur,
        //     label: cur,
        //   });
        //   return all;
        // }, []);
        this.packageLoading = false;
      } catch (error) {
        this.packageLoading = false;
        this.$message.error(error.data.msg);
      }
    },
    // 添加套餐
    addData() {
      if (this.hostData.length === 0) {
        return this.$message.error(lang.da_tip7);
      }
      this.optType = "add";
      this.dataModel = true;
      this.dataForm = {
        name: "",
        country_id: "",
        city: "",
        area: "",
        description: "",
        direct_admin_server_id: "",
        remote_meal: "",
        disk: null,
        disk_unit: "MB",
        email_num: null,
        domain_num: 1,
        sub_domain_num: 1,
        flow: null,
        flow_unit: "MB",
        // second_domain: "",
        gift_domain: 0,
        independent_ip: 0,
        os: "Linux",
        os_detail: "",
        php_version_low: null,
        php_version_high: null,
        price: [],
      };
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
      this.dataForm.price = price;
      this.comTitle = lang.invoice_btn6 + lang.package;
    },
    editPackage(row) {
      this.isInit = true;
      this.comTitle = lang.edit + lang.package;
      let temp = JSON.parse(JSON.stringify(row));
      temp.disk = temp.disk * 1;
      temp.flow = temp.flow * 1;
      temp.php_version_low = temp.php_version_low * 1;
      temp.php_version_high = temp.php_version_high * 1;
      const price = this.cycleData
        .reduce((all, cur) => {
          all.push({
            id: cur.id,
            name: cur.name,
            price:
              temp.price_duration.filter((item) => item.id * 1 === cur.id)[0]
                ?.price || "",
          });
          return all;
        }, [])
        .sort((a, b) => {
          return a.id - b.id;
        });

      temp.price = price;
      this.dataForm = temp;
      this.optType = "update";
      this.dataModel = true;
    },
    changeLow(e) {
      if (
        this.dataForm.php_version_high &&
        e > this.dataForm.php_version_high
      ) {
        this.dataForm.php_version_high = e;
      }
    },
    changeHigh(e) {
      if (
        this.dataForm.php_version_low &&
        this.dataForm.php_version_low &&
        e < this.dataForm.php_version_low
      ) {
        this.dataForm.php_version_low = e;
      }
    },
    async deleteData() {
      try {
        this.submitLoading = true;
        const res = await deleteDataCenter({
          id: this.delId,
          product_id: this.id,
        });
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
    async deleteLine() {
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
    async editData(row) {
      try {
        this.comTitle = lang.edit + lang.data_center;
        this.optType = "update";
        this.dataModel = true;
        const res = await getDataCenterDetails({ id: row.id });
        const temp = JSON.parse(JSON.stringify(res.data.data));
        temp.price = temp.duration;
        this.dataForm = temp;
      } catch (error) {}
    },
    // 保存数据中心
    async submitData({ validateResult, firstError }) {
      if (validateResult === true) {
        try {
          const params = JSON.parse(JSON.stringify(this.dataForm));
          params.product_id = this.id;
          if (this.optType === "add") {
            delete params.id;
          }
          params.price = params.price.reduce((all, cur) => {
            cur.price && (all[cur.id] = cur.price);
            return all;
          }, {});
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

    /* 计算配置 */
    /* 改变最大最小值：内存，系统盘和数据盘
         根据calcType来区分：memory=512， 其他 1048576
          */
    changeMin(e) {
      const num =
        this.calcType === "memory"
          ? this.calcForm.memory_unit === "GB"
            ? 512
            : 524288
          : 1048576;
      if (e * 1 >= num) {
        this.calcForm.min_value = 1;
      } else if (e * 1 >= this.calcForm.max_value * 1) {
        if (this.calcForm.max_value * 1) {
          this.calcForm.max_value = e * 1 + 1;
        }
      }
    },
    changeMax(e) {
      const num =
        this.calcType === "memory"
          ? this.calcForm.memory_unit === "GB"
            ? 512
            : 524288
          : 1048576;
      if (e * 1 === 1) {
        return (this.calcForm.max_value = 2);
      }
      if (e * 1 > num) {
        this.calcForm.max_value = num;
      } else if (e * 1 <= this.calcForm.min_value * 1 && e * 1 > 1) {
        if (this.calcForm.min_value * 1) {
          this.calcForm.min_value = e * 1 - 1;
        }
      }
    },
    changeAdvance() {
      this.isAdvance = !this.isAdvance;
    },
    /* 计算配置 end*/
    /* 周期相关 */
    async changeRadio() {
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
    async saveRatio() {
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
    closeData() {
      this.hostaModel = false;
      this.dataModel = false;
    },
    async getDurationList() {
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
    addCycle() {
      this.optType = "add";
      this.comTitle = lang.add_cycle;
      this.cycleForm.name = "";
      this.cycleForm.unit = "month";
      this.cycleForm.num = "";
      this.cycleForm.price_factor = 1;
      this.cycleForm.price = undefined;
      this.cycleModel = true;
    },
    editCycle(row) {
      this.optType = "update";
      this.comTitle = lang.update + lang.cycle;
      this.cycleForm = JSON.parse(JSON.stringify(row));
      this.cycleModel = true;
      if (this.cycleForm.price) {
        this.cycleForm.price = this.cycleForm.price * 1;
      }
    },
    async submitCycle({ validateResult, firstError }) {
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
    async deleteCycle() {
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
    async getOtherConfig() {
      try {
        const res = await getCloudConfig({
          product_id: this.id,
        });
        const temp = res.data.data.config;
        if (temp.gift_domain_value === undefined) {
          this.otherForm = {
            gift_domain_value: null,
            gift_domain_suffix: [],
          };
        } else {
          temp.gift_domain_value = temp.gift_domain_value * 1;
          this.otherForm = temp;
        }
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    async submitConfig({ validateResult, firstError }) {
      if (validateResult === true) {
        try {
          this.submitLoading = true;
          const params = JSON.parse(JSON.stringify(this.otherForm));
          params.product_id = this.id;
          const res = await saveCloudConfig(params);
          this.$message.success(res.data.msg);
          this.submitLoading = false;
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
    // 获取所有后缀
    async getDomainSuffix() {
      try {
        const res = await getAllSuffix();
        this.allSuffixs = res.data.data.list;
      } catch (error) {
        this.$message.error(error.data.msg);
      }
    },
    closeDwDialog() {
      this.lineModel = false;
    },
    /* 通用删除按钮 */
    comDel(type, row, index) {
      this.optType = "del";
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
    sureDelete() {
      switch (this.delType) {
        case "cycle":
          return this.deleteCycle();
        case "package":
          return this.deleteData();
        case "c_line":
          return this.deleteLine();
        case "line_bw":
        case "line_flow":
        case "line_defence":
        case "line_ip":
          return this.delSubItem();
        case "recommend":
          return this.delRecommend();
        case "cpu":
        case "data_center":
        case "line":
          return this.delLimit();
        case "host":
          return this.deleteHost();
        default:
          return null;
      }
    },
    formatPrice(val) {
      return (val * 1).toFixed(2);
    },
  },
  created() {
    this.id = location.href.split("?")[1].split("=")[1];
    // 默认拉取数据
    this.getDurationList();
    this.getPlugin();
  },
}).$mount(template);

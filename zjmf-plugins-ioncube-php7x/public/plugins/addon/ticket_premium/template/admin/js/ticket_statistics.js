(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("template")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    const host = location.host;
    const fir = location.pathname.split("/")[1];
    const str = `${host}/${fir}/`;
    new Vue({
      components: {
        comConfig,
        opinionButton,
      },
      data() {
        return {
          nowTableName: "",
          departmentList: [],
          ticketDetail: {},
          params: {
            type: "", //所有部门all,部门department,个人admin
            id: "", // 部门ID或者管理员ID
            start_time: null,
            end_time: null,
          },
          adminList: [],
          range: [],
          timeRank: [],
          scoreRank: [],
          nowDepartment: "",
          presets: {
            [lang.order_text92]: [new Date(), new Date()],
            [lang.order_text90]: [
              new Date(+new Date() - 86400000 * 6),
              new Date(),
            ],
            [lang.order_text91]: [
              new Date(+new Date() - 86400000 * 2),
              new Date(),
            ],
            [lang.order_text93]: [
              new Date(+new Date() - 86400000 * 30),
              new Date(),
            ],
          },
        };
      },
      watch: {
        range(val) {
          if (val[0] && val[1]) {
            this.params.start_time = val[0] / 1000;
            this.params.end_time = val[1] / 1000;
          } else {
            this.params.start_time = null;
            this.params.end_time = null;
          }
        },
      },
      filters: {
        formatSeconds(val) {
          // 把秒数转换为分钟 取整
          return ((val * 1) / 60).toFixed(0);
        },
        formatSecondsToMin(second) {
          const days = Math.floor(second / 86400);
          const hours = Math.floor((second % 86400) / 3600);
          const minutes = Math.floor(((second % 86400) % 3600) / 60);
          const seconds = Math.floor(((second % 86400) % 3600) % 60);
          // 格式化时间 输出大于0的值
          return `${days > 0 ? `${days}${lang.order_text116}` : ""}${
            hours > 0 ? `${hours}${lang.order_text117}` : ""
          }${minutes > 0 ? `${minutes}${lang.order_text118}` : ""}${
            seconds > 0 ? `${seconds}${lang.order_text119}` : ""
          }`;
        },
      },
      computed: {
        getMaxTime() {
          return (time) => {
            let maxTime = 0;
            this.timeRank.forEach((item) => {
              if (item.score * 1 >= maxTime) {
                maxTime = item.score;
              }
            });
            return {
              width: ((time * 1) / maxTime) * 100 + "%",
            };
          };
        },
      },
      methods: {
        getDepartmentName() {
          const id = this.params.id;
          if (!id) {
            return lang.order_text95;
          } else if ((id + "").includes("depart-")) {
            return this.departmentList.filter((item) => {
              return item.id == id;
            })[0].name;
          } else {
            let str;
            this.departmentList.forEach((item) => {
              item.admin.forEach((i) => {
                if (i.id == id) {
                  str = item.name + "-" + i.name;
                }
              });
            });
            return str;
          }
        },
        getTableName() {
          const id = this.params.id;
          const type = this.params.type;
          let str = "";
          this.departmentList.forEach((item) => {
            if (type !== "admin") {
              if (id === item.id) {
                str = item.name;
              }
            } else {
              item.admin.forEach((i) => {
                if (i.id == id && type === "admin") {
                  str = i.name;
                }
              });
            }
          });
          return str;
        },

        getTicketStatistics() {
          const params = { ...this.params };
          if (!params.id) {
            // 全部
            params.type = "all";
            this.params.type = "all";
            this.getTeamStatistics();
            this.getTeamTimeStatistics();
          } else if ((params.id + "").includes("depart-")) {
            // 选中部门
            params.id = params.id.split("-")[1];
            params.type = "department";
            this.params.type = "department";
            this.getUserStatistics(params.id);
            this.getUserTimeStatistics(params.id);
          } else {
            // 选中个人
            params.id = params.id.split("-")[1];
            params.type = "admin";
            this.params.type = "admin";
            this.getUserStatistics();
            this.getUserTimeStatistics();
          }
          this.nowTableName = this.getTableName();
          this.nowDepartment = this.getDepartmentName();
          ticketStatistics(params)
            .then((res) => {
              this.ticketDetail = res.data.data;

              if (
                this.ticketDetail.avgrage_score >
                Math.trunc(this.ticketDetail.avgrage_score * 1)
              ) {
                this.ticketDetail.show_avgrage_score =
                  Math.trunc(this.ticketDetail.avgrage_score * 1) + 0.5;
              } else {
                this.ticketDetail.show_avgrage_score =
                  this.ticketDetail.avgrage_score;
              }
            })
            .catch((err) => {
              this.$message.error(err.msg);
            });
        },
        // 获取工单部门
        // 工单部门列表
        getTicketDepartment() {
          ticketDepartment()
            .then((res) => {
              this.departmentList = res.data.data.list.map((item) => {
                item.admin.forEach((is) => {
                  is.orginId = is.id;
                  is.id = item.id + "-" + is.id;
                });
                item.orginId = item.id;
                item.id = "depart-" + item.id;
                return item;
              });
            })
            .catch((err) => {
              this.$message.error(err.msg);
            });
        },
        //团队平均分排名
        getTeamStatistics() {
          teamStatistics({
            start_time: this.params.start_time,
            end_time: this.params.end_time,
          }).then((res) => {
            this.scoreRank = res.data.data.rank.map((item) => {
              const num = Number(item.score).toFixed(2);
              if (num * 1 > Math.trunc(item.score * 1)) {
                item.show_score = Math.trunc(item.score * 1) + 0.5;
              } else {
                item.show_score = item.score * 1;
              }
              return item;
            });
          });
        },
        //  个人平均分排名
        getUserStatistics(department_id = null) {
          userStatistics({
            start_time: this.params.start_time,
            end_time: this.params.end_time,
            department_id: department_id,
          }).then((res) => {
            this.scoreRank = res.data.data.rank.map((item) => {
              const num = Number(item.score).toFixed(2);
              if (num * 1 > Math.trunc(item.score * 1)) {
                item.show_score = Math.trunc(item.score * 1) + 0.5;
              } else {
                item.show_score = item.score * 1;
              }
              return item;
            });
          });
        },
        // 团队平均处理时长排名
        getTeamTimeStatistics() {
          teamTimeStatistics({
            start_time: this.params.start_time,
            end_time: this.params.end_time,
          }).then((res) => {
            this.timeRank = res.data.data.rank.map((item) => {
              item.score = Number(item.score);
              return item;
            });
          });
        },
        // 个人平均处理时长排名
        getUserTimeStatistics(department_id = null) {
          userTimeStatistics({
            start_time: this.params.start_time,
            end_time: this.params.end_time,
            department_id: department_id,
          }).then((res) => {
            this.timeRank = res.data.data.rank;
          });
        },
      },
      created() {
        this.getTicketDepartment();
        this.getTicketStatistics();
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

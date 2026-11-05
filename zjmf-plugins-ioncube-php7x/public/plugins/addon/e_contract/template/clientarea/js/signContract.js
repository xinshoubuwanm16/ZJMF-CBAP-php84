(function (window, undefined) {
  var old_onload = window.onload;
  window.onload = function () {
    const template = document.getElementsByClassName("template")[0];
    Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
    new Vue({
      components: {
        asideMenu,
        topMenu,
      },
      data() {
        return {
          commonData: {},
          loading: false,
          id: "",
          infoData: {},
          activeName: "",
          checked: false,
          canvas: null,
          ctx: null,
          drawing: false,
          isSign: false,
          lastX: 0,
          lastY: 0,
          lineWidth: 2,
          color: "#000",
          save_name: "",
          isShowSignDia: false,
          isInit: false,
        };
      },
      created() {
        this.commonData = JSON.parse(localStorage.getItem("common_set_before"));
        document.title =
          this.commonData.website_name + "-" + lang.contract_text30;
        this.id = location.href.split("?")[1].split("=")[1];
        this.getInfo();
      },
      mounted() {},
      destroyed() {},
      updated() {
        // 关闭loading
        document.getElementById("mainLoading").style.display = "none";
        document.getElementsByClassName("template")[0].style.display = "block";
      },

      filters: {
        formateTime(time) {
          if (time && time !== 0) {
            const date = new Date(time * 1000);
            Y = date.getFullYear() + "-";
            M =
              (date.getMonth() + 1 < 10
                ? "0" + (date.getMonth() + 1)
                : date.getMonth() + 1) + "-";
            D =
              (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) +
              " ";
            h =
              (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) +
              ":";
            m =
              date.getMinutes() < 10
                ? "0" + date.getMinutes()
                : date.getMinutes();
            return Y + M + D + h + m;
          } else {
            return "--";
          }
        },
      },
      methods: {
        initCancas() {
          this.canvas = document.getElementById("signature-canvas");
          // 设置背景颜色
          this.canvas.style.backgroundColor = "#FAFBFF";
          this.ctx = this.canvas.getContext("2d");
          // 监听鼠标事件
          this.canvas.addEventListener("mousedown", (e) => this.startDraw(e));
          this.canvas.addEventListener("mousemove", (e) => this.draw(e));
          this.canvas.addEventListener("mouseup", (e) => this.endDraw(e));
          this.canvas.addEventListener("mouseout", (e) => this.endDraw(e));
          this.isInit = true;
        },
        startDraw(e) {
          this.drawing = true;
          this.lastX = e.offsetX;
          this.lastY = e.offsetY;
        },
        draw(e) {
          if (!this.drawing) return;
          const currentX = e.offsetX;
          const currentY = e.offsetY;
          this.ctx.beginPath();
          this.ctx.moveTo(this.lastX, this.lastY);
          this.ctx.lineTo(currentX, currentY);
          this.ctx.strokeStyle = this.color;
          this.ctx.lineWidth = this.lineWidth;
          this.ctx.stroke();
          this.lastX = currentX;
          this.lastY = currentY;
          this.isSign = true;
        },
        endDraw(e) {
          this.drawing = false;
        },
        clearCanvas() {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },
        dataURLtoFile(dataURL, fileName, fileType) {
          const arr = dataURL.split(",");
          const bstr = atob(arr[1]);
          let n = bstr.length;
          let u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new File([u8arr], fileName, { type: fileType || "image/png" });
        },
        saveImage() {
          if (!this.isSign) {
            this.$message.warning(lang.contract_text31);
            return;
          }
          this.loading = true;
          html2canvas(document.querySelector("#signature-canvas")).then(
            async (canvas) => {
              const img = canvas.toDataURL("image/png");
              const img_file = this.dataURLtoFile(img, "sign.png", "image/png");
              const formData = new FormData();
              formData.append("file", img_file);
              const fileData = await uploadSign(formData);
              const save_name = fileData.data.data.save_name;
              signContract({ id: this.id, sign_name: save_name })
                .then((res) => {
                  this.$message.success(lang.contract_text32);
                  this.signClose();
                  this.loading = false;
                  sessionStorage.financeActiveIndex = "5";
                  location.href = `/finance.htm?isActive=true`;
                })
                .catch((err) => {
                  this.loading = false;
                  this.$message.error(err.data.msg);
                });
            }
          );
        },
        signClose() {
          this.isShowSignDia = false;
          this.clearCanvas();
          this.isSign = false;
        },
        diaOpen() {
          this.$nextTick(() => {
            this.initCancas();
          });
        },
        handelSign() {
          if (!this.checked) {
            this.$message.warning(lang.contract_text33);
            return;
          }
          this.isShowSignDia = true;
        },
        goBack() {
          history.go(-1);
        },
        getInfo() {
          orderInfo(this.id).then((res) => {
            this.infoData = res.data.data;
            if (res.data.data.template.length > 0) {
              this.activeName = res.data.data.template[0].id.toString();
            }
          });
        },
        handleClick(tab, event) {
          console.log(tab, event);
        },
      },
    }).$mount(template);
    typeof old_onload == "function" && old_onload();
  };
})(window);

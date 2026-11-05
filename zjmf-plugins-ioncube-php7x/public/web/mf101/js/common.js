$(function () {
  const headBgcList = [
    "#3699FF",
    "#57C3EA",
    "#5CC2D7",
    "#EF8BA2",
    "#C1DB81",
    "#F1978C",
    "#F08968",
  ];
  function setHeaderBgc(accountObj) {
    const obj = JSON.parse(JSON.stringify(accountObj));
    const reg = /^[a-zA-Z]+$/;
    obj.firstName = reg.test(obj.username.substring(0, 1))
      ? accountObj.username.substring(0, 1).toUpperCase()
      : accountObj.username.substring(0, 1);
    $("#headImg").text(obj.firstName);
    sessionStorage.headBgc = sessionStorage.headBgc
      ? sessionStorage.headBgc
      : headBgcList[Math.round(Math.random() * (headBgcList.length - 1))];
    $("#headImg").attr("style", `background:${sessionStorage.headBgc}`);
    $(".un-login").attr("style", "display:none");
    $(".login-in").attr("style", "display:block");
    sessionStorage.accountInfo = JSON.stringify(obj);
  }
  // 获取账户信息和实名认证信息
  function initData() {
    if (sessionStorage.accountInfo && localStorage.jwt) {
      setHeaderBgc(JSON.parse(sessionStorage.accountInfo));
      return;
    }
    if (localStorage.jwt) {
      $.ajax({
        url: " /console/v1/account",
        method: "get",
        headers: {
          Authorization: "Bearer" + " " + localStorage.jwt,
        },
        success: function (res) {
          if (res.status === 200) {
            setHeaderBgc(res.data.account);
          } else {
            localStorage.removeItem("jwt");
            initData();
          }
        },
      });
    } else {
      $(".un-login").attr("style", "display:block");
      $(".login-in").attr("style", "display:none");
    }
  }
  // 首页渲染 确保在header.html加载完成后执行操作
  //$("#header").load("/web/mf101/conf/header.html", function () {
  // 获取当前页面路径名（去除查询参数和哈希）
  const nowPathname = window.location.pathname;
  // 遍历所有header-menu-item
  $(".header-menu-list > li").each(function () {
    // 获取当前li的href属性，并提取纯路径名部分
    const href = new URL(
      $(this).children("a").attr("href"),
      window.location.href
    );
    const itemPathname = href.pathname;

    // 如果当前页面路径与菜单项路径完全匹配，则添加active类
    if (nowPathname === itemPathname) {
      $(this).addClass("active");
    } else {
      $(this).removeClass("active");
    }
  });
  initData();
  // 点击
  $(".login-in").click(function () {
    location.href = "/account.htm";
  });
  //});
  // 底部渲染
  //$("#footer").load("/web/mf101/conf/footer.html", function () {});

  const mySwiper = new Swiper(".swiper", {
    loop: false, // 循环模式选项
    autoplay: false,
    // 如果需要分页器
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  AOS.init({
    once: false,
    duration: 800,
    disable: "mobile",
  });
});

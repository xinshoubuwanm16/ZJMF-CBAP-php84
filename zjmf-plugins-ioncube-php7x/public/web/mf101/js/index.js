$(function () {
  const videoText = document.querySelector(".video-right");
  const picBox = document.querySelector(".pic-box");
  let videoIndex = null;
  // 监听window 当该元素滚动到页面顶部时
  window.addEventListener("scroll", function () {
    if (window.timer) {
      clearTimeout(window.timer);
      window.timer = null;
      return;
    }
    window.timer = setTimeout(() => {
      setVideoFn();
    }, 10);
  });
  function setVideoFn() {
    // 获取页面的滚动高度
    const nowHeight = videoText.getBoundingClientRect().top;
    if (nowHeight < 0) {
      const index = Math.round(Math.abs(nowHeight) / 656);
      if (index <= 2 && videoIndex !== index) {
        videoIndex = index;
        picBox.querySelectorAll(".pic-box-item").forEach((item, i) => {
          if (i === videoIndex) {
            item.classList.add("active");
            // 设置里面的video 从0秒播放
            item.querySelector("video").currentTime = 0;
          } else {
            item.classList.remove("active");
          }
        });
        videoText.querySelectorAll(".video-info").forEach((item, i) => {
          if (i === videoIndex) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
      }
    }
  }
});

$(function () {
  // 获取列表
  function getHelpLlis () {
    $.ajax({
      url: "/console/v1/help",
      method: 'get',
      success: function (res) {
        const docMain = $('#doc-main');
        res.data.list.splice(0,3).forEach(item => {
          const ul = $('<ul>').addClass('doc-list');
          const typeLi = $('<li>').addClass('doc-type').text(item.name);
          ul.append(typeLi);
          item.helps.splice(0,4).forEach(help => {
            const itemLi = $('<li>').addClass('doc-item');
            const link = `<a href="/plugin/26/helpTotal.htm?id=${help.id}" target="_blank">${help.title}</a>`
            itemLi.append(link);
            ul.append(itemLi);
          });
          if (item.helps.length > 0) {
            ul.append(`<li class="doc-more"><a href="/plugin/26/source.htm" target="_blank">更多></a></li>`)
          }
          docMain.append(ul);
        });
      }
    });
  }
  getHelpLlis();
});

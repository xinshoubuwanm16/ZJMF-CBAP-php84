(function () {
  if (localStorage.getItem('backLang') == null) {
    document.writeln('<script src="/plugins/addon/cycle_artificial_order/template/admin/lang/zh-cn.js"><\/script>')
  } else {
    document.writeln('<script src="/plugins/addon/cycle_artificial_order/template/admin/lang/' + localStorage.getItem('backLang') + '.js"><\/script>')
  }
}())

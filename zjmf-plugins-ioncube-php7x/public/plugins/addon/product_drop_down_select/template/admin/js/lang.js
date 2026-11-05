(function () {
  if (localStorage.getItem('backLang') == null) {
    document.writeln('<script src="/plugins/addon/product_drop_down_select/template/admin/lang/zh-cn.js"><\/script>')
  } else {
    document.writeln('<script src="/plugins/addon/product_drop_down_select/template/admin/lang/' + localStorage.getItem('backLang') + '.js"><\/script>')
  }
}())

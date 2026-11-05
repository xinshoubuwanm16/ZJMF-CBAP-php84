(function () {
  if (localStorage.getItem('backLang') == null) {
    document.writeln('<script src="/plugins/addon/client_custom_field/template/admin/lang/zh-cn.js"><\/script>')
  } else {
    document.writeln('<script src="/plugins/addon/client_custom_field/template/admin/lang/' + localStorage.getItem('backLang') + '.js"><\/script>')
  }
}())

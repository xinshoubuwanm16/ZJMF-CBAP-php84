(function () {
  if (localStorage.getItem('backLang') == null) {
    document.writeln('<script src="/plugins/addon/credit_limit/template/admin/lang/zh-cn.js"><\/script>')
  } else {
    document.writeln('<script src="/plugins/addon/credit_limit/template/admin/lang/' + localStorage.getItem('backLang') + '.js"><\/script>')
  }
}())

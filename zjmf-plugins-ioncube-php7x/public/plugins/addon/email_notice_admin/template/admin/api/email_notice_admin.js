// 邮件接口
function getEmailInterface () {
  return Axios.get('/email')
}
// 邮件模板
function getEmailTemplate () {
  return Axios.get('/notice/email/template')
}
function getNoticeList() {
  return Axios.get('/email_notice_admin')
}
function saveNoticeList(params) {
  return Axios.put(`/email_notice_admin`, params)
}
function getAdminList () {
  return Axios.get('/admin')
}

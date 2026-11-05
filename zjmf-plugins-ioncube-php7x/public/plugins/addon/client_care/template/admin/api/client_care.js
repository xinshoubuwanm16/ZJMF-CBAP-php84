// 用户关怀列表
function clientCareList (params) {
  return Axios.get(`/client_care`, { params })
}

// 短信接口
function sms () {
  return Axios.get(`/sms`)
}
// 短信模板
function smsTemplate (params) {
  return Axios.get(`/notice/sms/${params.name}/template`, { params })
}

// 邮件接口
function email () {
  return Axios.get(`/email`)
}
// 邮件模板
function emailTemplate () {
  return Axios.get(`/notice/email/template`)
}

// 商品接口列表
function server () {
  const params = {
    keywords: "",
    page: 1,
    limit: 10000,
    orderby: "id",
    sort: "desc"
  }
  return Axios.get(`/server`, { params })
}

// 用户列表
function client (params) {
  return Axios.get(`/client`, { params })
}

// 创建用户关怀
function addClientCare (params) {
  return Axios.post(`/client_care`, params)
}

// 推送名单
function postClientList (params) {
  return Axios.post(`/client_care/client`, params)
}

// 启用./停用用户关怀
function statusChange (params) {
  return Axios.put(`/client_care/${params.id}/status`, params)
}

// 删除用户关怀
function delClientCare (params) {
  return Axios.delete(`/client_care/${params.id}`, params)
}

// 发送预览
function postPreview (params) {
  return Axios.post(`/client_care/preview`, params)
}

// 获取单个邮件模板
function templateOne (params) {
  return Axios.get(`/notice/email/template/${params.id}`, { params })
}

// 获取商品一级分组
function getFirstGroup () {
  return Axios.get(`/product/group/first`)
}
// 获取商品二级分组
function getSecondGroup () {
  return Axios.get(`/product/group/second`)
}
// 获取商品列表
function getProduct (params) {
  return Axios.get(`/product`, { params })
}

// 信用额
function getCreditLimit (params) {
  return Axios.get(`/credit_limit`, { params })
}
function getCreditLimitDetails (params) {
  return Axios.get(`/credit_limit/${params.id}`)
}
// 新增/编辑
function addAndUpdateCredit (type, params) {
  if (type === 'add') {
    return Axios.post(`/credit_limit`, params)
  } else if (type === 'update') {
    return Axios.put(`/credit_limit/${params.id}`, params)
  }
}

// 信用额订单
function getCreditOrder (params) {
  return Axios.get(`/credit_limit/order`, {params})
}
// 获取信用额设置
function getCreditSetting () {
  return Axios.get('/credit_limit/configuration')
}
function saveCreditSetting (params) {
  return Axios.put(`/credit_limit/configuration`, params)
}
function getClientList (params) {
  return Axios.get(`/client`, { params })
}
// 订单管理-订单详情
function getOrderDetails (id) {
  return Axios.get(`/order/${id}`);
}

// 获取管理员
function getAdmin (params) {
  return Axios.get(`/admin`, { params });
}

// 授信日志列表
function getCreditLog (params) {
  return Axios.get(`/credit_limit/log`, { params });
}

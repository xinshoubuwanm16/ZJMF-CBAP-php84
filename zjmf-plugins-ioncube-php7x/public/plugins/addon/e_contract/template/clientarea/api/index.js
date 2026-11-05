/* 申请合同列表 */
function contractOrder(params) {
  return Axios.get(`/e_contract/order`, { params })
}

// 合同签订详情
function orderInfo(id) {
  return Axios.get(`/e_contract/order/${id}`)
}

// 合同详情
function contractInfo(id) {
  return Axios.get(`/e_contract/${id}`)
}

// 文件上传
function uploadSign(formData) {
  return Axios.post(`/upload`, formData)
}

// 签订合同
function signContract(params) {
  return Axios.post(`/e_contract/order/${params.id}/sign`, params)
}

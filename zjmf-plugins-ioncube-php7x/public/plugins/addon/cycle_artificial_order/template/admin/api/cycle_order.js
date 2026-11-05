/*
* 周期人工订单
*/
const postUrl = '/cycle_artificial_order'
// 人工订单列表
function getCycleOrder (params) {
  return Axios.get(`${postUrl}`, { params })
}
// type: add/update
function addAndUpdateCycleOrder (type, params) {
  if (type === 'add') {
    return Axios.post(`${postUrl}`, params)
  } else if (type === 'update') {
    return Axios.put(`${postUrl}/${params.id}`, params)
  }
}
function delCycleOrder (params) {
  return Axios.delete(`${postUrl}/${params.id}`)
}
function getCycleOrderDetails (params) {
  return Axios.get(`${postUrl}/${params.cycle_artificial_order_id}`, { params })
}
// 获取用户列表
function getClientList (params) {
  return Axios.get(`/client`, { params })
}

/*
* 流量包
*/
// 流量包订单列表
function getPacketOrder (params) {
  return Axios.get('/flow_packet_order', { params })
}
function delPacketOrder (params) {
  return Axios.delete(`/flow_packet_order/${params.id}`)
}

// 流量包列表
function getPacket (params) {
  return Axios.get('/flow_packet', { params })
}
// type: add/update
function addAndUpdatePacket (type, params) {
  if (type === 'add') {
    return Axios.post(`/flow_packet`, params)
  } else if (type === 'update') {
    return Axios.put(`/flow_packet/${params.id}`, params)
  }
}
function delPacket (params) {
  return Axios.delete(`/flow_packet/${params.id}`)
}
function changePacketStatus (params) {
  return Axios.put(`/flow_packet/${params.id}/status`, params)
}
// 获取商品列表
function getProduct (params) {
  return Axios.get(`/module/product`, { params })
}

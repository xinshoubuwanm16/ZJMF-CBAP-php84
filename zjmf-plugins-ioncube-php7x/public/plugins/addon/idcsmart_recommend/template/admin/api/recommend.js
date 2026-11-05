/* 推介计划 */
function getRecommendConfig () {
  return Axios.get(`/recommend/config`)
}
function saveRecommendConfig (params) {
  return Axios.post(`/recommend/config`, params)
}
// 奖励记录
function getRecommend (params) {
  return Axios.get(`/recommend`, { params })
}
// 	修改奖励金额
function changeMoney (params) {
  return Axios.put(`/recommend/${params.id}/awards_amount`, params)
}
// 无效推介
function sureInvalid (params) {
  return Axios.put(`/recommend/${params.id}/invalid`, params)
}
// 确认
function sureActive (id) {
  return Axios.put(`/recommend/${id}/active`)
}
// 冻结
function frozenRecommend (id) {
  return Axios.put(`/recommend/${id}/frozen`)
}
// 取消冻结
function unfrozenRecommend (id) {
  return Axios.put(`/recommend/${id}/unfrozen`)
}
// 删除
function delRecommend (id) {
  return Axios.delete(`/recommend/${id}`, id)
}
// 预设回复列表
function getPrereply () {
  return Axios.get('/recommend/prereply')
}
// 预设回复详情
function prereplyDetail (params) {
  return Axios.get(`/recommend/prereply/${params.id}`)
}

// 创建/编辑预设回复
function addAndUpdatePrereply (type, params) {
  if (type === 'add') {
    return Axios.post(`/recommend/prereply`, params)
  } else if (type === 'update') {
    return Axios.put(`/recommend/prereply/${params.id}`, params)
  }
}
// 删除预设回复
function delPrereply (params) {
  return Axios.delete(`/recommend/prereply/${params}`)
}
// 插件列表
function getAddon (params) {
  return Axios.get(`/plugin/addon`, { params })
}
// 用户列表
function getClientList (params) {
  return Axios.get(`/client`, { params })
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
// 获取配置
function getSelectConfig () {
  return Axios.get(`/product_drop_down_select/config`)
}
function saveSelectConfig (params) {
  return Axios.put(`/product_drop_down_select/config`, params)
}
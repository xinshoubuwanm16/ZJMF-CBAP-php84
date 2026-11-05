// 产品列表
function getMfList (params) {
  return Axios.get(`/product/common_cloud`, { params });
}
// 获取订购页面配置
function getOrderConfig (params) {
  return Axios.get(`/product/${params.id}/mf_cloud_disk/order_page`, { params });
}

// 获取商品配置所有周期价格
function getDuration (params) {
  return Axios.post(`/product/${params.id}/mf_cloud_disk/duration`, params);
}
// 修改配置计算价格
function calcPrice (params) {
  return Axios.post(`/product/${params.id}/config_option`, params)
}
function productInfo(id) {
  return Axios.get(`/product/${id}`);
}
// 结算商品
function settle (params) {
  return Axios.post(`/product/settle`, params)
}
// 使用优惠码
function usePromo (params) {
  return Axios.post(`/promo_code/apply`, params)
}
// 加入购物车
function addToCart (params) {
  return Axios.post(`/cart`, params);
}
// 修改购物车
function updateCart (params) {
  return Axios.put(`/cart/${params.position}`, params);
}
// 获取购物车
function getCart () {
  return Axios.get(`/cart`);
}
// 获取独立带宽
function getBwDetail (params) {
  return Axios.get(`/product/${params.id}/mf_cloud_disk/data_center_disk`, {params});
}

// 用户等级折扣
function getLevelDiscount(params) {
  return Axios.get(`/client_level/product/${params.id}/amount`, { params });
}

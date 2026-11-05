// 等级列表
function getLevelList(params) {
  return Axios.get(`/client_level`, { params });
}
// 所有用户等级
function getAllLevel() {
  return Axios.get(`/client_level/all`);
}
// 创建/编辑用户等级
function addAndUpdateLevel(type, params) {
  if (type === "add") {
    return Axios.post(`/client_level`, params);
  } else if (type === "update") {
    return Axios.put(`/client_level/${params.id}`, params);
  }
}
// 等级详情
function getLevelDetail(id) {
  return Axios.get(`/client_level/${id}`);
}
// 删除
function delLevel(id) {
  return Axios.delete(`/client_level/${id}`);
}
// 获取商品一级分组
function getFirstGroup() {
  return Axios.get(`/product/group/first`);
}
// 获取商品一级分组
function getSecondGroup() {
  return Axios.get(`/product/group/second`);
}

// 获取商品列表
function getProList(params) {
  return Axios.get(`/product`, { params });
}
// 获取已激活插件
function active_plugin() {
  return Axios.get(`/active_plugin`);
}
// 百度商品列表
function productList(params) {
  return Axios.get("/baidu_cloud/product", { params });
}

// 获取用户等级设置
function apiConfiInfo(params) {
  return Axios.get(`/client_level/configuration`, { params });
}

// 保存用户等级设置
function apiSaveConfig(params) {
  return Axios.put(`/client_level/configuration`, params);
}

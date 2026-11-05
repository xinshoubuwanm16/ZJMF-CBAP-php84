/* 活动列表 */
function getVoucher(params) {
  return Axios.get(`/event_promotion`, { params });
}
// 活动详情
function getVoucherDetail(params) {
  return Axios.get(`/event_promotion/${params.id}`);
}
//添加编辑活动
function addAndUpdateVoucher(type, params) {
  if (type === "add") {
    return Axios.post(`/event_promotion`, params);
  } else {
    return Axios.put(`/event_promotion/${params.id}`, params);
  }
}
// 所有用户等级
function getAllLevel() {
  return Axios.get(`/client_level/all`);
}
// 插件列表
function getAddon(params) {
  return Axios.get(`/active_plugin`, { params });
}
// 删除活动
function delVoucher(id) {
  return Axios.delete(`/event_promotion/${id}`);
}
// 启用/禁用活动
function changeVoucherStatus(params) {
  return Axios.put(`/event_promotion/${params.id}/status`, params);
}

// 获取商品一级分组
function getFirstGroup() {
  return Axios.get(`/product/group/first`);
}
// 获取商品二级分组
function getSecondGroup() {
  return Axios.get(`/product/group/second`);
}
// 获取商品列表
function getProduct(params) {
  return Axios.get(`/product`, { params });
}
// 用户管理-用户列表
function getClientList(params, id) {
  if (id) {
    return Axios.get(`/client?custom_field[IdcsmartClientLevel_level]=${id}`, {
      params,
    });
  } else {
    return Axios.get(`/client`, { params });
  }
}

// 启用中活动列表
function apiActiveList(params) {
  return Axios.get(`/event_promotion/active`, { params });
}

// 活动排序
function apiActiveSort(params) {
  return Axios.put(`/event_promotion/order`, params);
}

// 活动配置
function apiActiveConfig(params) {
  return Axios.put(`/event_promotion/config`, params);
}

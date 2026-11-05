/* 代金卷 */
function getVoucher (params) {
  return Axios.get(`/voucher`, { params });
}
// 代金券详情
function getVoucherDetail (params) {
  return Axios.get(`/voucher/${params.id}`);
}
// 添加/编辑代金券
function addAndUpdateVoucher (type, params) {
  if (type === 'add') {
    return Axios.post(`/voucher`, params);
  } else if (type === 'update') {
    return Axios.put(`/voucher/${params.id}`, params);
  }
}
// 删除
function delVoucher (params) {
  return Axios.delete(`/voucher/${params.id}`);
}
// 启用/禁用代金券
function changeVoucherStatus (params) {
  if (params.status === 'enable') {
    return Axios.post(`/voucher/${params.id}/disable`, params);
  } else if (params.status === 'disable') {
    return Axios.post(`/voucher/${params.id}/enable`, params);
  }
}
// 代金券使用记录
function useVoucherRecord (params) {
  return Axios.get(`/voucher/record`, { params });
}

// 获取商品一级分组
function getFirstGroup () {
  return Axios.get(`/product/group/first`);
}
// 获取商品二级分组
function getSecondGroup () {
  return Axios.get(`/product/group/second`);
}
// 获取商品列表
function getProduct (params) {
  return Axios.get(`/product`, { params });
}
// 用户列表
function getClientList (params) {
  return Axios.get(`/client`, { params });
}
// 验证代金券码是否使用
function checkVoucher (params) {
  return Axios.get(`/voucher/check`, { params });
}
// 	获取代金卷发放次数
function getVoucherTimes (params) {
  return Axios.post(`/voucher/${params.id}/times`);
}
// 发放代金券
function grantVoucher (params) {
  return Axios.post(`/voucher/${params.id}/send`, params);
}
// 删除代金券使用记录
function deleteVoucher (params) {
  return Axios.delete(`/voucher/record/${params.id}`, { params });
}

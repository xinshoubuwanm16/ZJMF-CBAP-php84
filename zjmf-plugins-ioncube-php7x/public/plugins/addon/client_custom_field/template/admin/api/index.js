// 自定义字段列表
function clientCustomList(params) {
  return Axios.get("/client_custom_field", { params });
}

// 创建自定义字段
function addclientCustom(params) {
  return Axios.post("/client_custom_field", params);
}

// 修改自定义字段
function editclientCustom(params) {
  return Axios.put(`/client_custom_field/${params.id}`, params);
}

// 修改自定义字段状态
function editclientStatus(params) {
  return Axios.put(`/client_custom_field/${params.id}/status`, params);
}

// 删除自定义字段
function delclientCustom(id) {
  return Axios.delete(`/client_custom_field/${id}`);
}

// 获取用户自定义字段和值
function clientCustomDetail(id) {
  return Axios.get(`/client/${id}/client_custom_field_value`);
}

// 拖动排序
function dragSelfDefinedField(params) {
  return Axios.put(`/client_custom_field/${params.id}/drag`, params);
}

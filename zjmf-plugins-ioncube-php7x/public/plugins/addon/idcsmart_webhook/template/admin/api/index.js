// Webhook列表
function apiWebhookList(params) {
  return Axios.get(`/webhook`, { params });
}
// 创建Webhook
function apiAddWebhook(params) {
  return Axios.post(`/webhook`, params);
}

// 编辑Webhook
function apiEditWebhook(params) {
  return Axios.put(`/webhook/${params.id}`, params);
}

// 删除Webhook
function apiDelWebhook(params) {
  return Axios.delete(`/webhook/${params.id}`, { params });
}

// Webhook通知列表
function apiWebhookNoticeList(params) {
  return Axios.get(`/webhook/notice`, { params });
}

// 创建Webhook通知
function apiAddWebhookNotice(params) {
  return Axios.post(`/webhook/notice`, params);
}

// 编辑Webhook通知
function apiEditWebhookNotice(params) {
  return Axios.put(`/webhook/notice/${params.id}`, params);
}

// 删除Webhook通知
function apiDelWebhookNotice(params) {
  return Axios.delete(`/webhook/notice/${params.id}`, { params });
}

// 修改Webhook通知状态
function apiWebhookNoticeStatus(params) {
  return Axios.put(`/webhook/notice/${params.id}/status`, params);
}

// 发送管理
function apiSendList(params) {
  return Axios.get(`/notice/send`, { params });
}

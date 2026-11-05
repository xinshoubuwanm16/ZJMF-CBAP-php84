// 工单统计
function ticketStatistic(params) {
  return Axios.get(`/ticket_premium/statistic`, { params });
}
// 工单列表
function ticketList(params) {
  return Axios.get(`/ticket_premium`, { params });
}

// 工单类型
function ticketType(params) {
  return Axios.get(`/ticket_premium/type`, { params });
}
// 获取产品列表
function hostAll(params) {
  return Axios.get(`/host`, { params });
}

// 创建工单
function createTicket(params) {
  return Axios.post(`/ticket_premium`, params);
}

// 关闭工单
function closeTicket(params) {
  return Axios.put(`/ticket_premium/${params.id}/close`, params);
}
// 催单
function urgeTicket(params) {
  return Axios.put(`/ticket_premium/${params.id}/urge`, params);
}
// 查看工单
function ticketDetail(params) {
  return Axios.get(`/ticket_premium/${params.id}`, { params });
}

// 回复工单
function replyTicket(params) {
  return Axios.post(`/ticket_premium/${params.id}/reply`, params);
}
// 文件下载
function downloadFile(params) {
  return Axios.post(`ticket/download`, params);
}

// 工单状态
function ticketStatus(params) {
  return Axios.get(`/ticket_premium/status`, { params });
}
// 工单部门
function department(params) {
  return Axios.get(`/ticket_premium/department`, { params });
}
// 工单通知设置
function getOrderConfig() {
  return Axios.get(`/ticket_premium/config`);
}

// 工单评分
function ticketScore(params) {
  return Axios.post(`/ticket_premium/${params.id}/score`, params);
}

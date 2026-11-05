// 获取工单列表
function getUserOrder(params) {
  return Axios.get("/ticket_internal_premium", { params: params });
}
// 获取工单详情
function getUserOrderDetail(id) {
  return Axios.get(`/ticket_internal_premium/${id}`);
}
// 回复工单
function replyUserOrder(id, params) {
  return Axios.post(`/ticket_internal_premium/${id}/reply`, params);
}
// 接收工单
function receiveUserOrder(id) {
  return Axios.put(`/ticket_internal_premium/${id}/receive`);
}
// 已解决工单
function resolvedUserOrder(id) {
  return Axios.put(`/ticket_internal_premium/${id}/resolved`);
}

// 获取内部工单列表
function getInternalOrder(params) {
  return Axios.get("/ticket_internal_premium", { params: params });
}
// 获取内部工单详情
function getInternalOrderDetail(id) {
  return Axios.get(`/ticket_internal_premium/${id}`);
}
// 创建内部工单
function newInternalOrder(params) {
  return Axios.post("/ticket_internal_premium", params);
}
// 接收内部工单
function receiveInternalOrder(id) {
  return Axios.put(`/ticket_internal_premium/${id}/receive`);
}
// 回复内部工单
function replyInternalOrder(id, params) {
  return Axios.post(`/ticket_internal_premium/${id}/reply`, params);
}
// 已解决内部工单
function resolvedInternalOrder(id) {
  return Axios.put(`/ticket_internal_premium/${id}/resolved`);
}
// 关闭内部工单
function closeInternalOrder(id) {
  return Axios.put(`/ticket_internal_premium/${id}/close`);
}
// 转发内部工单
function forwardInternalOrder(id, params) {
  return Axios.put(`/ticket_internal_premium/${id}/forward`, params);
}

// 获取工单类型
function getUserOrderType() {
  return Axios.get("/ticket_internal_premium/type");
}
// 获取内部工单类型
function getInternalOrderType(params) {
  return Axios.get("/ticket_internal_premium/type", { params });
}
// 处理完成
function orderHandle(params) {
  return Axios.post(`/ticket_internal_premium/${params.id}/finish`, params);
}

// 设置
function getOrderConfig() {
  return Axios.get(`/ticket_internal_premium/config`);
}
function saveOrderConfig(params) {
  return Axios.put(`/ticket_internal_premium/config`, params);
}

// 新增工单类型
function orderTypeAdd(params) {
  return Axios.post("/ticket_internal_premium/type", params);
}
// 编辑工单类型
function orderTypeEdit(id, params) {
  return Axios.put(`/ticket_internal_premium/type/${id}`, params);
}
// 删除工单类型
function orderTypeDelete(id) {
  return Axios.delete(`/ticket_internal_premium/type/${id}`);
}
// 工单预设回复列表
function ticketPrereply() {
  return Axios.get(`/ticket_internal_premium/prereply`);
}
// 创建工单预设回复
function addTicketPrereply(params) {
  return Axios.post(`/ticket_internal_premium/prereply`, params);
}
// 删除工单预设回复
function deleteTicketPrereply(id) {
  return Axios.delete(`/ticket_internal_premium/prereply/${id}`);
}
// 编辑工单预设回复
function editTicketPrereply(params) {
  return Axios.put(`/ticket_internal_premium/prereply/${params.id}`, params);
}
// 工单部门
function ticketDepartment() {
  return Axios.get("/ticket_internal_premium/department");
}

// 创建工单部门
function newDepartment(params) {
  return Axios.post("/ticket_internal_premium/department", params);
}

// 编辑工单部门
function editDepartment(params) {
  return Axios.put("/ticket_internal_premium/department/" + params.id, params);
}

// 删除工单部门
function deleteDepartment(id) {
  return Axios.delete("/ticket_internal_premium/department/" + id);
}
// 创建工单状态
function addTicketStatus(params) {
  return Axios.post(`/ticket_internal_premium/status`, params);
}
// 编辑工单状态
function editTicketStatus(params) {
  return Axios.put(`/ticket_internal_premium/status/${params.id}`, params);
}
// 删除工单状态
function deleteTicketStatus(id) {
  return Axios.delete(`/ticket_internal_premium/status/${id}`);
}
// 修改工单状态
function editOrderStatus(params) {
  return Axios.put(`/ticket_internal_premium/${params.id}`, params);
}

// 获取管理员分组（部门）数据
function getAdminRole(params) {
  return Axios.get("/admin/role", { params: params });
}
// 获取管理员（人员）数据
function getAdminList(params) {
  return Axios.get("/admin", { params: params });
}
// 获取产品数据
function getHost(params) {
  return Axios.get("/host", { params: params });
}
// 获取用户
function getClient(params) {
  return Axios.get("/client", { params: params });
}
// 文件下载
function downloadFile(data) {
  return Axios.post("/ticket_internal_premium/download", data, {
    responseType: "blob", //设置响应的数据类型为一个包含二进制数据的 Blob 对象，必须设置！！！
  });
}

// 创建用户工单
function newUserOrder(params) {
  return Axios.post("/ticket_internal_premium", params);
}

// 工单状态列表
function ticketStatus() {
  return Axios.get(`/ticket_internal_premium/status`);
}

// 工单备注列表
function ticketNotes(id) {
  return Axios.get(`/ticket_internal_premium/${id}/notes`);
}

// 工单日志
function ticketLog(id) {
  return Axios.get(`/ticket_internal_premium/${id}/log`);
}

// 添加备注
function addTicketNotes(params) {
  return Axios.post(`/ticket_internal_premium/${params.id}/notes`, params);
}
//修改工单回复
function ticketReplyEdit(id, params) {
  return Axios.put(`/ticket_internal_premium/reply/${id}`, params);
}
// 编辑工单备注
function notesReplyEdit(params) {
  return Axios.put(`/ticket_internal_premium/notes/${params.id}`, params);
}
// 删除工单备注
function orderNotesDelete(params) {
  return Axios.delete(`/ticket_internal_premium/notes/${params.id}`);
}
// 删除工单回复
function orderReplyDelete(params) {
  return Axios.delete(`/ticket_internal_premium/reply/${params.id}`);
}

// 工单统计
function ticketStatistics(params) {
  return Axios.get(`/ticket_internal_premium/statistics`, { params: params });
}

// 团队平均分排名统计(只排接过单的人)
function teamStatistics(params) {
  return Axios.get(`/ticket_internal_premium/rank/department_score`, {
    params: params,
  });
}

//个人平均分排名统计(只排接过单的人)
function userStatistics(params) {
  return Axios.get(`/ticket_internal_premium/rank/person_score`, {
    params: params,
  });
}
// 团队平均处理时长排名统计(只排接过单的人)
function teamTimeStatistics(params) {
  return Axios.get(`/ticket_internal_premium/rank/department_time`, {
    params: params,
  });
}
// 个人平均处理时长排名统计(只排接过单的人
function userTimeStatistics(params) {
  return Axios.get(`/ticket_internal_premium/rank/person_time`, {
    params: params,
  });
}

// 接单
function orderAccept(id) {
  return Axios.post(`/ticket_internal_premium/${id}/order`);
}

// 评分
function orderScore(params) {
  return Axios.post(`/ticket_internal_premium/${params.id}/score`, params);
}

// 定时工单列表
function ticketCronList(params) {
  return Axios.get(`/ticket_internal_premium/cron`, { params: params });
}

// 新建定时工单
function ticketCronAdd(params) {
  return Axios.post(`/ticket_internal_premium/cron`, params);
}

// 修改定时工单
function ticketCronEdit(params) {
  return Axios.put(`/ticket_internal_premium/cron/${params.id}`, params);
}

// 修改定时工单状态
function ticketCronStatus(params) {
  return Axios.put(`/ticket_internal_premium/cron/${params.id}/status`, params);
}

// 删除定时工单
function ticketCronDelete(id) {
  return Axios.delete(`/ticket_internal_premium/cron/${id}`);
}

// 定时工单详情
function ticketCronDetail(id) {
  return Axios.get(`/ticket_internal_premium/cron/${id}`);
}

// 发票列表
function invoice(params) {
  return Axios.get("/invoice", { params });
}
// 发票详情
function invoiceDetail(params) {
  return Axios.get(`/invoice/${params.id}`, { params });
}

// 通过发票
function confirmInvoice(params) {
  return Axios.post(`/invoice/${params.id}/confirm`, params);
}

// 驳回发票
function rejectInvoice(params) {
  return Axios.post(`/invoice/${params.id}/reject`, params);
}

// 发出发票
function sendInvoice(params) {
  return Axios.post(`/invoice/${params.id}/send`, params);
}

// 发票抬头列表
function invoiceTitle(params) {
  return Axios.get(`/invoice_title`, { params });
}
// 批量删除发票抬头
function delInvoiceTitle(params) {
  return Axios.delete(`/invoice_title`, { params });
}
// 收件地址列表
function invoiceAddress(params) {
  return Axios.get(`invoice_address`, { params });
}
// 删除收件地址
function delInvoiceAddress(params) {
  return Axios.delete(`/invoice_address`, { params });
}

// 发票设置
function invoiceConfig(params) {
  return Axios.get(`invoice_config`, { params });
}

// 修改发票设置
function editInvoiceConfig(params) {
  return Axios.put(`/invoice_config`, params);
}

// 冲红发票
function blushInvoice(params) {
  return Axios.post(`/invoice/${params.id}/flush`);
}

// 发票项目
function getProject() {
  return Axios.get(`/invoice_project`);
}
function addAndEditProject(type, params) {
  if (type === "add") {
    return Axios.post(`/invoice_project`, params);
  } else if (type === "update") {
    return Axios.put(`/invoice_project/${params.id}`, params);
  }
}
function delProject(params) {
  return Axios.delete(`/invoice_project/${params.id}`);
}
// 上传发票
function uploadInvoice(params) {
  return Axios.post(`/invoice/${params.id}/upload`, params);
}
function downInvoice(params) {
  return Axios.get(`/invoice/${params.id}/invoice_filename`);
}
function deleteInvoice(params) {
  return Axios.delete(`/invoice/${params.id}/invoice_filename`);
}

// 计算发票价格

function queryInvoicelPriceAPI(params) {
  return Axios.post(`/invoice/price`, params);
}

function addInvoicelAPI(params) {
  return Axios.post(`/invoice`, params);
}

// 发票申请列表
function getInvoiceRequest(params) {
  return Axios.get(`/invoice_request`, { params });
}
function client(params) {
  return Axios.get(`/client`, { params });
}

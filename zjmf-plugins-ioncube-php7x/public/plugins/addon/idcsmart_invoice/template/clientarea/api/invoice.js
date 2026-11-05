//  获取发票列表
function queryInvoicelIistAPI(params) {
  return Axios.get(`/invoice`, { params });
}

//  删除发票
function delInvoicelAPI(params) {
  return Axios.delete(`/invoice/${params.id}`, params);
}

//  获取发票详情
function queryInvoicelDetailsAPI(params) {
  return Axios.get(`/invoice/${params.id}`, params);
}

/**  发票设置 tabs */
//
//  获取发票抬头列表
function queryInvoicelTitleIistAPI(params) {
  return Axios.get(`/invoice_title`, { params });
}

//  添加发票抬头列表
function addInvoicelTitleIistAPI(params) {
  return Axios.post(`/invoice_title`, params);
}

//  修改发票抬头列表
function editInvoicelTitleIistAPI(params) {
  return Axios.put(`/invoice_title/${params.id}`, params);
}

//  删除发票抬头列表
function delInvoicelTitleIistAPI(id) {
  return Axios.delete(`/invoice_title/${id}`);
}

//
//  获取发票收件地址列表
function queryInvoicelAddressAPI(params) {
  return Axios.get(`/invoice_address`, { params });
}

//  添加发票收件地址列表
function addInvoicelAddressAPI(params) {
  return Axios.post(`/invoice_address`, params);
}

//  修改发票收件地址列表
function editInvoicelAddressAPI(params) {
  return Axios.put(`/invoice_address/${params.id}`, params);
}

//  删除发票收件地址列表
function delInvoicelAddressAPI(params) {
  return Axios.delete(`/invoice_address/${params.id}`, params);
}

/* 预开票和先开票 */

/**
 *@获取发票申请列表
 * @param {页码，条数，} params
 * @param {Paid=后开票 Unpaid=预开票} status
 * @returns
 */
function queryInvoicelAfterAPI(params) {
  return Axios.get(`/invoice_request`, { params });
}

/**
 *@获取发票配置及快递列表
 * @param {} params
 * @returns
 */
function queryInvoicelSetAPI(params) {
  return Axios.get(`/invoice_config`, { params });
}

/**
 *@获取发票价格或金额
 * @param {} params
 * @returns
 */
function queryInvoicelPriceAPI(params) {
  return Axios.post(`/invoice/price`, params);
}

/**
 *@创建发票
 * @param {} params
 * @returns
 */
function addInvoicelAPI(params) {
  return Axios.post(`/invoice`, params);
}

// 发票项目列表
function getProject(params) {
  return Axios.get(`/invoice_project`, { params });
}

// 下载发票文件

function downloadInvoice(id) {
  return Axios.get(`/invoice/${id}/invoice_filename`);
}

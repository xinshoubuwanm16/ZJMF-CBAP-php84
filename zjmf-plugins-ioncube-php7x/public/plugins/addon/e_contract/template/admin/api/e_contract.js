/*
 * 电子合同
 */

/* 合同列表 */
const base = "e_contract";
function getContract(params) {
  return Axios.get(`${base}`, { params });
}
function getContractDetails(params) {
  return Axios.get(`${base}/${params.id}`);
}
// 邮寄
function sendContract(params) {
  return Axios.post(`${base}/${params.id}/mail`, params);
}
// 通过/驳回/作废 type: complete/reject
function changeContract(type, params) {
  return Axios.post(`${base}/${params.id}/${type}`, params);
}

function createContract(params) {
  return Axios.post(`${base}`, params);
}

/* 合同模板 */
function getContractTemplate(params) {
  return Axios.get(`${base}/template`, { params });
}
function getContractTemplateDetails(params) {
  return Axios.get(`${base}/template/${params.id}`);
}

// type: add/update
function addAndUpdateContractTemplate(type, params) {
  if (type === "add") {
    return Axios.post(`${base}/template`, params);
  } else if (type === "update") {
    return Axios.put(`${base}/template/${params.id}`, params);
  }
}
function delContractTemplate(params) {
  return Axios.delete(`${base}/template/${params.id}`);
}
// 是否存在基础合同
function isExistBaseContract(params) {
  return Axios.get(`${base}/template/base_contract/check`, { params });
}
// 启用停用模板 type: enable/disable
function changeTemplate(type, params) {
  return Axios.post(`${base}/template/${params.id}/${type}`);
}
// 获取模板可用变量
function getTemplateVars() {
  return Axios.get(`${base}/template/vars`);
}
/* 基础设置 */
function getContractConfig() {
  return Axios.get(`${base}/config`);
}
function saveContractConfig(params) {
  return Axios.put(`${base}/config`, params);
}
function downloadPDF(params) {
  return Axios.post(`${base}/${params.id}/download`);
}
// 可用合同模板选择
function getTemplateSelect(params) {
  return Axios.get(`${base}/template/select`, { params });
}
// 获取创建时的关联订单
function getRelevanceOrder(params) {
  return Axios.get(`${base}/order`, { params });
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

// 复制合同模板
function copyTemplate(params) {
  return Axios.post(`${base}/template/${params.id}/copy`);
}

/* 域名管理 */
const _tempUrl = "/idcsmart_domain/";
// 域名列表
function getDomain(params) {
  return Axios.get(`${_tempUrl}domain`, { params });
}
function getDomainDetails(params) {
  return Axios.get(`${_tempUrl}domain/${params.id}`);
}

// 模块管理
function getDomainModule() {
  return Axios.get(`${_tempUrl}module`);
}

function changeDomainModule(params) {
  return Axios.put(`${_tempUrl}module/${params.id}`, params);
}

function changeDomainModuleSort(params) {
  return Axios.put(`${_tempUrl}module/order`, params);
}

// 后缀
function getDomainSuffix(params) {
  return Axios.get(`${_tempUrl}suffix`, { params });
}
// 新增/编辑 后缀
function addAndUpdateSuffix(type, params) {
  if (type === "add") {
    return Axios.post(`${_tempUrl}module/${params.module_id}/suffix`, params);
  } else if (type === "update") {
    return Axios.put(`${_tempUrl}suffix/${params.id}`, params);
  }
}
function deleteSuffix(params) {
  return Axios.delete(
    `${_tempUrl}module/${params.module_id}/suffix/${params.id}`
  );
}

// 域名设置管理
function getDomainSetting() {
  return Axios.get(`${_tempUrl}config`);
}
function saveDomainSetting(params) {
  return Axios.put(`${_tempUrl}config`, params);
}

// 域名列表
function getDomainSetting() {
  return Axios.get(`${_tempUrl}config`);
}

// 信息模板列表
function templateList(params) {
  return Axios.get(`${_tempUrl}info_template`, { params });
}

//信息模板详情
function templateDetail(id) {
  return Axios.get(`${_tempUrl}info_template/${id}`);
}

// 删除信息模板
function delTemplate(id) {
  return Axios.delete(`${_tempUrl}info_template/${id}`);
}

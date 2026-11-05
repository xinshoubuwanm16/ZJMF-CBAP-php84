/* 域名管理 */
const _tempUrl = '/idcsmart_domain/'

/* 域名列表 */
function getDomain(params) {
  return Axios.get(`${_tempUrl}domain`, { params })
}

// 转移域名列表
function getTransferDomain() {
  return Axios.get(`${_tempUrl}transfer_domain`)
}
function acceptTransferDomain(params) {
  return Axios.post(`${_tempUrl}domain/${params.id}/transfer_accept`, params)
}

/* 信息模板 */
function getInfoTemplate(params) {
  return Axios.get(`${_tempUrl}info_template`, { params })
}
function getInfoTemplateDetails(params) {
  return Axios.get(`${_tempUrl}info_template/${params.id}`)
}
function addInfoTemplate(params) {
  return Axios.post(`${_tempUrl}info_template`, params)
}
function deleteInfoTemplate(params) {
  return Axios.delete(`${_tempUrl}info_template/${params.id}`, params)
}
// 信息模板实名认证
function infoTemplateAuth(params) {
  return Axios.post(`${_tempUrl}info_template/${params.id}/certification`, params)
}
// 账户间转移发送验证码
function sendTranferCode(params) {
  return Axios.post(`${_tempUrl}domain/${params.id}/transfer_code`, params)
}
// 提交转移
function submitTranfer(params) {
  return Axios.post(`${_tempUrl}domain/${params.id}/transfer`, params)
}
// 撤销转移
function cancleTranfer(params) {
  return Axios.delete(`${_tempUrl}domain/${params.id}/transfer`, params)
}
// 修改DNS服务器
function changeDnsServer(params) {
  return Axios.put(`${_tempUrl}domain/${params.id}/dns`, params)
}
/* 域名详情 */
function getDomainDetails(params) {
  return Axios.get(`${_tempUrl}domain/${params.id}`)
}
// 下载域名证书
function downDomain(params) {
  return Axios.get(`${_tempUrl}domain/${params.id}/download`)
}
// 重新认证
function recertificationDomain(params) {
  return Axios.post(`${_tempUrl}domain/${params.id}/recertification`, params)
}
// 修改域名设置
function changeDomainConfig(params) {
  return Axios.put(`${_tempUrl}domain/${params.id}`, params)
}
// 修改DNS服务器
function changeDns(params) {
  return Axios.put(`${_tempUrl}domain/${params.id}/dns`, params)
}
// 支持的信息模板
function getSupportTemplate(params) {
  return Axios.get(`${_tempUrl}info_template/support`, { params })
}
// 获取域名设置
function getDomainConfig() {
  return Axios.get(`${_tempUrl}config`)
}

/* 域名解析 */
// 解析记录
function getDnsRecord(params) {
  return Axios.get(`${_tempUrl}get_dns_record`, { params })
}
function addAndUpdateDnsRecord(type, params) {
  if (type === 'add') {
    return Axios.post(`${_tempUrl}add_dns_record`, params)
  } else if (type === 'update') {
    return Axios.post(`${_tempUrl}mod_dns_record`, params)
  }
}
function deleteDnsRecord(params) {
  return Axios.post(`${_tempUrl}del_dns_record`, params)
}
// 暂停
function suspendDnsRecord(params) {
  return Axios.post(`${_tempUrl}suspend_dns_record`, { params })
}
// 解除暂停
function unsuspendDnsRecord(params) {
  return Axios.post(`${_tempUrl}unsuspend_dns_record`, { params })
}
// 备注域名解析
function remarkDnsRecord(params) {
  return Axios.post(`${_tempUrl}remark_dns_record`, { params })
}

// 续费详情
function getRenewInfo(params) {
  return Axios.get(`/host/${params.id}/renew`, { params })
}
function saveRenew(params) {
  return Axios.post(`/host/${params.id}/renew`, params)
}

// 自动续费状态
function getAutoRenewStatus(params) {
  return Axios.get(`host/${params.id}/renew/auto`)
}

// 自动续费开关
function autoRenewDomain(params) {
  return Axios.put(`host/${params.id}/renew/auto`, params)
}

// 通用配置
function getCommonConfig() {
  return Axios.get('/common')
}


// 域名控制台
function getDomainConsole(id) {
  return Axios.get(`/idcsmart_domain/domain/${id}/console`)
}
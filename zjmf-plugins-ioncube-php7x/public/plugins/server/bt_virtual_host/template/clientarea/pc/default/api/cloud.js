// 产品接口
// 获取数据中心
const baseUrl = "bt_virtual_host";
function dataCenter(id) {
  return Axios.get(`/product/${id}/${baseUrl}/data_center`);
}
/* 产品列表 */
function cloudList(params) {
  return Axios.get(`/${baseUrl}/host`, { params });
}
// 产品详情
function hostDetail(params) {
  return Axios.get(`/host/${params.id}`, { params });
}
// 实例详情
function cloudDetail(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}`, { params });
}
// cloud日志
function getLog(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/log`, { params });
}

// 获取其它设置
function config(params) {
  return Axios.get(`/product/${params.product_id}/${baseUrl}/config`, {
    params,
  });
}
// 修改产品备注
function editNotes(params) {
  return Axios.put(`/host/${params.id}/notes`, params);
}
// 获取可用操作系统
function image(params) {
  return Axios.get(`/product/${params.id}/${baseUrl}/image`, { params });
}

// 获取实例状态
function cloudStatus(params) {
  return Axios.get(`/${baseUrl}/${params.id}/status`, { params });
}

/* 续费相关 */
// 续费页面
function renewPage(params) {
  return Axios.get(`/host/${params.id}/renew`, { params });
}
// 续费提交
function renew(params) {
  return Axios.post(`/host/${params.id}/renew`, params);
}

// 网络
// 获取ip列表
function ipList(params) {
  return Axios.get(`/${baseUrl}/${params.id}/ip`, { params });
}

// 产品内页获取优惠码信息
function promoCode(params) {
  return Axios.get(`/promo_code/host/${params.id}/promo_code`, { params });
}

// 统计图表
// 获取图表数据
function chartList(params) {
  return Axios.get(`/${baseUrl}/${params.id}/chart`, { params });
}

// 获取网络流量
function getFlow(params) {
  return Axios.get(`/${baseUrl}/${params.id}/flow`, { params });
}

// 获取套餐所有周期价格

// 获取商品折扣金额
function clientLevelAmount(params) {
  return Axios.get(`/client_level/product/${params.id}/amount`, { params });
}

// 获取自动续费状态
function renewStatus(params) {
  return Axios.get(`/host/${params.id}/renew/auto`, { params });
}
// 自动续费开关
function rennewAuto(params) {
  return Axios.put(`/host/${params.id}/renew/auto`, params);
}

// 获取订购页面配置
function getOrderConfig(params) {
  return Axios.get(`/product/${params.id}/${baseUrl}/order_page`, { params });
}

/* FTP */
function getFtpInfo(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/ftp`);
}
function changeFtpPas(params) {
  return Axios.put(`/${baseUrl}/host/${params.id}/ftp/password`, params);
}
function changeFtpStatus(params) {
  return Axios.put(`/${baseUrl}/host/${params.id}/ftp/status`, params);
}
function ftpLoginLog(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/ftp/login_log`, { params });
}
function ftpActionLog(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/ftp/action_log`, { params });
}
/* 域名 */
function getDomainList(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/domain`);
}
function addDomain(params) {
  return Axios.post(`/${baseUrl}/host/${params.id}/domain`, params);
}
function deleteDomain(params) {
  return Axios.delete(`/${baseUrl}/host/${params.id}/domain`, {
    data: params,
  });
}
/* 子目录 */
function getSubDomain(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/dir_binding`);
}
function addSubDomain(params) {
  return Axios.post(`/${baseUrl}/host/${params.id}/dir_binding`, params);
}
function delSubDomain(params) {
  return Axios.delete(`/${baseUrl}/host/${params.id}/dir_binding`, params);
}
/* 主机状态 */
function getSiteInfo(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/site`);
}
function changeSiteStatus(type, params) {
  // type: start stop
  return Axios.put(`/${baseUrl}/host/${params.id}/site/${type}`);
}
/* 伪静态 */
function getRewrite(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/rewrite`);
}
function saveRewrite(params) {
  return Axios.put(`/${baseUrl}/host/${params.id}/rewrite`, params);
}
/* php */
function getPhp(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/php_version`);
}
function savePhp(params) {
  return Axios.put(`/${baseUrl}/host/${params.id}/php_version`, params);
}
/* 子目录 */
function getDirPath(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/dir_binding`);
}
function addDirPath(params) {
  return Axios.post(`/${baseUrl}/host/${params.id}/dir_binding`, params);
}
function delDirPath(params) {
  return Axios.delete(`/${baseUrl}/host/${params.id}/dir_binding`, {
    data: params,
  });
}
/* 重定向 */
function getRedirect(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/redirect`);
}
function addAndEditRedirect(type, params) {
  if (type === "add") {
    return Axios.post(`/${baseUrl}/host/${params.id}/redirect`, params);
  } else if (type === "update") {
    return Axios.put(`/${baseUrl}/host/${params.id}/redirect`, params);
  }
}
function addErrorRedirect(params) {
  return Axios.post(`/${baseUrl}/host/${params.id}/error_redirect`, params, {
    timeout: 120000,
  });
}
function delRedirect(params) {
  return Axios.delete(`/${baseUrl}/host/${params.id}/redirect`, {
    data: params,
  });
}
/* 运行目录 */
function getRunPath(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/path`);
}
function changeRunPath(params) {
  return Axios.put(`/${baseUrl}/host/${params.id}/path`, params);
}
function saveRunPath(params) {
  return Axios.put(`/${baseUrl}/host/${params.id}/run_path`, params);
}
/* 监控报表 */
function getEcharts(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/site/overview`, { params });
}
/* 证书 */
function getSslInfo(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/ssl`);
}
function saveSslInfo(params) {
  return Axios.put(`/${baseUrl}/host/${params.id}/ssl`, params);
}
// 申请证书（Let's Encrypt）
function applySsl(params) {
  return Axios.post(`/${baseUrl}/host/${params.id}/ssl`, params);
}
// 申请续签SSL证书
function renewSsl(params) {
  return Axios.post(`/${baseUrl}/host/${params.id}/ssl/renew`, params);
}
function getSslProcess(params) {
  return Axios.post(`/${baseUrl}/host/${params.id}/ssl/process`);
}
function forceHttps(params) {
  return Axios.post(`/${baseUrl}/host/${params.id}/http_to_https`);
}
function closeHttps(params) {
  return Axios.post(`/${baseUrl}/host/${params.id}/close_to_https`);
}
function closeSsl(params) {
  return Axios.post(`/${baseUrl}/host/${params.id}/close_ssl_conf`);
}
/* 防盗链 */
function getSecurity(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/security`);
}
function saveSecurity(params) {
  return Axios.put(`/${baseUrl}/host/${params.id}/security`, params);
}
/* 防篡改 */
function getTamper(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/tamper_proof`);
}
function getTamperLog(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/tamper_proof/log`, {
    params,
  });
}
function saveTamper(params) {
  return Axios.put(`/${baseUrl}/host/${params.id}/tamper_proof`, params);
}
/* 数据库 */
function getDataList(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/database`);
}
// 权限
function getDataAccess(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/database/access`);
}
function saveDataAccess(params) {
  return Axios.put(`/${baseUrl}/host/${params.id}/database/access`, params);
}
// 数据表
function getDataTable(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/database/table`);
}
function repairDataTable(params) {
  return Axios.post(`/${baseUrl}/host/${params.id}/database/repair`, params);
}
function optimizeDataTable(params) {
  return Axios.post(`/${baseUrl}/host/${params.id}/database/optimize`, params);
}
function changeDataTable(params) {
  return Axios.put(`/${baseUrl}/host/${params.id}/database/table_type`, params);
}
function changeDataPassword(params) {
  return Axios.put(`/${baseUrl}/host/${params.id}/database/password`, params);
}
// 备份
function getDataBackup(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/database/backup`);
}
function addDataBackup(params) {
  return Axios.post(`/${baseUrl}/host/${params.id}/database/backup`, params);
}
function recoverDataBackup(params) {
  return Axios.put(`/${baseUrl}/host/${params.id}/database/backup`, params, {
    timeout: 120000,
  });
}
function delDataBackup(params) {
  return Axios.delete(`/${baseUrl}/host/${params.id}/database/backup`, {
    data: params,
  });
}
// 增量备份
function getIncrementBack(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/database/backup_setting`);
}
function addAndEditIncrementBack(type, params) {
  if (type === "add") {
    return Axios.post(
      `/${baseUrl}/host/${params.id}/database/backup_setting`,
      params
    );
  } else if (type === "update") {
    return Axios.put(
      `/${baseUrl}/host/${params.id}/database/backup_setting`,
      params
    );
  }
}
function delIncrementBack(params) {
  return Axios.delete(`/${baseUrl}/host/${params.id}/database/backup_setting`, {
    data: params,
  });
}
//任务
function startTask(params) {
  return Axios.post(`/${baseUrl}/host/${params.id}/task/start`, params);
}
function taskLog(params) {
  return Axios.get(`/${baseUrl}/host/${params.id}/task/log`, { params });
}
function cleartaskLog(params) {
  return Axios.delete(`/${baseUrl}/host/${params.id}/task/log`, { params });
}

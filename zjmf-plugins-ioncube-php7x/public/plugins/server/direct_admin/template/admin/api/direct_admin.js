/*
* DA
*/
const base = 'direct_admin'

/* 周期 */
function getDuration (params) {
  return Axios.get(`/${base}/duration`, { params })
}
function createAndUpdateDuration (type, params) {
  if (type === 'add') {
    return Axios.post(`/${base}/duration`, params)
  } else if (type === 'update') {
    return Axios.put(`/${base}/duration/${params.id}`, params)
  }
}
function delDuration (params) {
  return Axios.delete(`/${base}/duration/${params.id}`)
}
// 获取周期比例
function getDurationRatio (params) {
  return Axios.get(`/${base}/duration_ratio`, { params })
}
function saveDurationRatio (params) {
  return Axios.put(`/${base}/duration_ratio`, params)
}
// 周期比例填充
function fillDurationRatio (params) {
  return Axios.post(`/${base}/duration_ratio/fill`, params)
}
/* 主机配置 */
function getHost (params) {
  return Axios.get(`/${base}/server`, { params })
}
// 创建/修改
function createOrUpdateHost (type, params) {
  if (type === 'add') {
    return Axios.post(`/${base}/server`, params)
  } else if (type === 'update') {
    return Axios.put(`/${base}/server/${params.id}`, params)
  }
}
// 删除
function deleteHost (params) {
  return Axios.delete(`/${base}/server/${params.id}`, {
    data: params
  })
}
// 修改主机SSL状态
function changeSsl (params) {
  return Axios.put(`/${base}/server/${params.id}/ssl/${params.ssl}`)
}
// 测试DA端口是否可用 type: port | ftp_port
function testHostStatus (type, id) {
  return Axios.get(`/${base}/server/${id}/${type}/status`)
}

/* 套餐配置 */
function getDataCenter (params) {
  return Axios.get(`/${base}/meal`, { params })
}
function getDataCenterDetails (params) {
  return Axios.get(`/${base}/data_center/${params.id}`, { params })
}
function getCountry () {
  return Axios.get(`/country`)
}

// 获取商品主机配置中所有国家及其城市
function getExistCountry (params) {
  return Axios.get(`/${base}/server/city/list`, { params})
}

// 获取套餐已有区域
function getExistArea (params) {
  return Axios.get(`/${base}/meal/area/list`, { params})
}
// 获取区域下主机
function getAreaHost (params) {
  return Axios.get(`/${base}/meal/city/server`, { params})
}
// 创建/修改
function createOrUpdateDataCenter (type, params) {
  if (type === 'add') {
    return Axios.post(`/${base}/meal`, params)
  } else if (type === 'update') {
    return Axios.put(`/${base}/meal/${params.id}`, params)
  }
}
// 删除
function deleteDataCenter (params) {
  return Axios.delete(`/${base}/meal/${params.id}`, {
    data: params
  })
}
// 根据主机id获取远程套餐
function getRemotePackage (params) {
  return Axios.get(`/${base}/meal/server/${params.id}`, { params})
}


// 获取IP价格
function getIpPrice( params) {
  return Axios.get(`/${base}/data_center/${params.id}/ip_price`, { params })
}
function saveIpPrice( params) {
  return Axios.put(`/${base}/data_center/ip_price`, params)
}

// 获取独立带宽
function getAloneBw (params) {
  return Axios.get(`/${base}/data_center/${params.id}/bw`, { params })
}
function getAloneBwDetails (params) {
  return Axios.get(`/${base}/data_center_bw/${params.id}`, { params })
}
function createAndUpdateAloneBw (type, params) {
  if (type === 'add') {
    return Axios.post(`/${base}/data_center/${params.id}/bw`, params)
  } else if (type === 'update') {
    return Axios.put(`/${base}/data_center_bw/${params.id}`, params)
  }
}
function delAloneBw (params) {
  return Axios.delete(`/${base}/data_center_bw/${params.id}`)
}



/* 其他设置 */
function getCloudConfig (params) {
  return Axios.get(`/${base}/config`, { params })
}
function saveCloudConfig (params) {
  return Axios.post(`/${base}/config`, params)
}
// 所有后缀
function getAllSuffix() {
  return Axios.get(`/idcsmart_domain/suffix`)
}

// 获取插件列表
function getPluginList () {
  return Axios.get(`/plugin/addon`)
}



/* 产品详情页 */
function getDaHostDetails (params) {
  return Axios.get(`/${base}/host/${params.id}`)
}

function saveDaHostDetails (params) {
  return Axios.put(`/${base}/host/${params.id}`, params)
}

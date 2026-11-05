/*
* 弹性IP
*/
const base = 'mf_cloud_disk'

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

/* 数据中心 */
function getDataCenter (params) {
  return Axios.get(`/${base}/data_center`, { params })
}
function getDataCenterDetails (params) {
  return Axios.get(`/${base}/data_center/${params.id}`, { params })
}
function getCountry () {
  return Axios.get(`/country`)
}
// 创建/修改
function createOrUpdateDataCenter (type, params) {
  if (type === 'add') {
    return Axios.post(`/${base}/data_center`, params)
  } else if (type === 'update') {
    return Axios.put(`/${base}/data_center/${params.id}`, params)
  }
}
// 删除
function deleteDataCenter (params) {
  return Axios.delete(`/${base}/data_center/${params.id}`)
}

/* 其他设置 */
function getCloudConfig (params) {
  return Axios.get(`/${base}/config`, { params })
}
function saveCloudConfig (params) {
  return Axios.put(`/${base}/config`, params)
}

// 获取IP价格
function getIpPrice( params) {
  return Axios.get(`/${base}/data_center/${params.id}/ip_price`, { params })
}
function saveIpPrice( params) {
  return Axios.put(`/${base}/data_center/ip_price`, params)
}

// 获取独立磁盘
function getAloneBw (params) {
  return Axios.get(`/${base}/data_center/${params.id}/disk`, { params })
}
function getAloneBwDetails (params) {
  return Axios.get(`/${base}/data_center_disk/${params.id}`, { params })
}
function createAndUpdateAloneBw (type, params) {
  if (type === 'add') {
    return Axios.post(`/${base}/data_center/${params.id}/disk`, params)
  } else if (type === 'update') {
    return Axios.put(`/${base}/data_center_disk/${params.id}`, params)
  }
}
function delAloneBw (params) {
  return Axios.delete(`/${base}/data_center_disk/${params.id}`)
}

// 切换性能开关
function changeCloudSwitch (params) { // 存储tab切换性能
  return Axios.put(`/${base}/config/disk_limit_enable`, params)
}

// 添加磁盘性能限制
function getStoreLimit (name, params) {
  return Axios.get(`/${base}/disk_limit`, { params })
}
function createAndUpdateStoreLimit (name, type, params) {
  if (type === 'add') {
    return Axios.post(`/${base}/disk_limit`, params)
  } else if (type === 'update') {
    return Axios.put(`/${base}/disk_limit/${params.id}`, params)
  }
}
function delStoreLimit (name, params) {
  return Axios.delete(`/${base}/disk_limit/${params.id}`)
}

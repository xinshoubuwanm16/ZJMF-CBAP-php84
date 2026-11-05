/*
* 弹性IP
*/
const base = 'mf_cloud_ip'

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

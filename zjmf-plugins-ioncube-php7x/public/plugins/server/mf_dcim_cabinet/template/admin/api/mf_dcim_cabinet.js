/*
 * mf_dcim_cabinet
 */
const base = "mf_dcim_cabinet";

/* 周期 */
function getDuration(params) {
  return Axios.get(`/${base}/duration`, { params });
}
function createAndUpdateDuration(type, params) {
  if (type === "add") {
    return Axios.post(`/${base}/duration`, params);
  } else if (type === "update") {
    return Axios.put(`/${base}/duration/${params.id}`, params);
  }
}
function delDuration(params) {
  return Axios.delete(`/${base}/duration/${params.id}`);
}
// 获取周期比例
function getDurationRatio(params) {
  return Axios.get(`/${base}/duration_ratio`, { params });
}
function saveDurationRatio(params) {
  return Axios.put(`/${base}/duration_ratio`, params);
}
// 周期比例填充
function fillDurationRatio(params) {
  return Axios.post(`/${base}/duration_ratio/fill`, params);
}


/* 其他设置 */
function getCloudConfig(params) {
  return Axios.get(`/${base}/config`, { params });
}
function saveCloudConfig(params) {
  return Axios.put(`/${base}/config`, params);
}


/* 数据中心 */
function getDataCenter(params) {
  return Axios.get(`/${base}/data_center`, { params });
}
function getCountry() {
  return Axios.get(`/country`);
}
// 创建/修改
function createOrUpdateDataCenter(type, params) {
  if (type === "add") {
    return Axios.post(`/${base}/data_center`, params);
  } else if (type === "update") {
    return Axios.put(`/${base}/data_center/${params.id}`, params);
  }
}
// 删除
function deleteDataCenter(params) {
  return Axios.delete(`/${base}/data_center/${params.id}`);
}
// 数据中心选择
function chooseDataCenter(params) {
  return Axios.get(`/${base}/data_center/select`, { params });
}
/* 线路 */
function getLine(params) {
  return Axios.get(`/${base}/line`, { params });
}
function createAndUpdateLine(type, params) {
  if (type === "add") {
    return Axios.post(`/${base}/line`, params);
  } else if (type === "update") {
    return Axios.put(`/${base}/line/${params.id}`, params);
  }
}
function delLine(params) {
  return Axios.delete(`/${base}/line/${params.id}`);
}
function getLineDetails(params) {
  return Axios.get(`/${base}/line/${params.id}`);
}
/* 线路-子项配置 */
// name：接口名字(line_bw,line_flow,line_defence,line_ip)
// type: 新增，编辑
// parasm：参数
function getLineChiLd(name, params) {
  return Axios.get(`/${base}/${name}/${params.id}`, { params });
}
function createAndUpdateLineChild(name, type, params) {
  if (type === "add") {
    return Axios.post(`/${base}/line/${params.id}/${name}`, params);
  } else if (type === "update") {
    return Axios.put(`/${base}/${name}/${params.id}`, params);
  }
}
function getLineChildDetails(name, params) {
  return Axios.get(`/${base}/${name}/${params.id}`, { params });
}
function delLineChild(name, params) {
  return Axios.delete(`/${base}/${name}/${params.id}`);
}
// 获取系统盘/数据盘类型 system_disk , data_disk
function getDiskType(type, params) {
  return Axios.get(`/${base}/${type}/type`, { params });
}

// 配置限制
function getConfigLimit (params) {
  return Axios.get(`/${base}/limit_rule`, { params });
}
function createAndUpdateConfigLimit (type, params) {
  if (type === 'add' || type === 'copy') {
    return Axios.post(`/${base}/limit_rule`, params);
  } else if (type === 'update') {
    return Axios.put(`/${base}/limit_rule/${params.id}`, params);
  }
}
function delConfigLimit (params) {
  return Axios.delete(`/${base}/limit_rule/${params.id}`);
}


// 插件列表
function getAddon(params) {
  return Axios.get(`/plugin/addon`, { params })
}


/* 机柜套餐 */
function getRecommend(params) {
  return Axios.get(`/${base}/package`, { params });
}
function createAndUpdateRecommend(type, params) {
  if (type === "add") {
    return Axios.post(`/${base}/package`, params);
  } else if (type === "update") {
    return Axios.put(`/${base}/package/${params.id}`, params);
  }
}
function getRecommendDetails(params) {
  return Axios.get(`/${base}/package/${params.id}`, { params });
}
function delRecommend(params) {
  return Axios.delete(`/${base}/package/${params.id}`);
}
// 切换订购是否显示
function changePackageShow(params) {
  return Axios.put(`/${base}/package/${params.id}/hidden`, params);
}

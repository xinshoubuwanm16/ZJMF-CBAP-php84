/*
 * 皖云资源管理
*/
const WYURL = 'wanyun_resource';

/* IP */
function getIps (params) {
  return Axios.get(`/${WYURL}/ips`, { params });
}
function getDcimConfig () {
  return Axios.get(`/${WYURL}/dcim_config`);
}
function saveDcimConfig (params) {
  return Axios.put(`/${WYURL}/dcim_config`, params);
}
function syncDcimConfig () {
  return Axios.get(`/${WYURL}/dcim_config/sync`);
}
function getDcimServer (params) {
  return Axios.get(`/server`, { params });
}
function getIpsDetails (params) {
  return Axios.get(`/${WYURL}/ip`, { params });
}
/* 光纤 */
function getFiber (params) {
  return Axios.get(`/${WYURL}/fiber`, { params });
}
function addAndEditFiber (type, params) {
  if (type === 'add') {
    return Axios.post(`/${WYURL}/fiber`, params);
  } else if (type === 'update') {
    return Axios.put(`/${WYURL}/fiber/${params.id}`, params);
  }
}
function delFiber (params) {
  return Axios.delete(`/${WYURL}/fiber/${params.id}`);
}
function getFiberDetails (params) {
  return Axios.get(`/${WYURL}/fiber/${params.id}`);
}

// 节点自定义字段
function getNodeField () {
  return Axios.get(`/${WYURL}/node/self_defined_field`);
}
function addAndEditNodeField (type, params) {
  if (type === 'add') {
    return Axios.post(`/${WYURL}/node/self_defined_field`, params);
  } else if (type === 'update') {
    return Axios.put(`/${WYURL}/node/self_defined_field/${params.id}`, params);
  }
}
function changeNodeFieldShow (params) {
  return Axios.put(`/${WYURL}/node/self_defined_field/${params.id}/show_list`, params);
}
function delNodeField (params) {
  return Axios.delete(`/${WYURL}/node/self_defined_field/${params.id}`);
}
function sortNodeField (params) {
  return Axios.put(`/${WYURL}/node/self_defined_field/${params.id}/drag`, params);
}

// 节点类型
function getNodeType () {
  return Axios.get(`/${WYURL}/node/type`);
}
function addAndEditNodeType (type, params) {
  if (type === 'add') {
    return Axios.post(`/${WYURL}/node/type`, params);
  } else if (type === 'update') {
    return Axios.put(`/${WYURL}/node/type/${params.id}`, params);
  }
}
function delNodeType (params) {
  return Axios.delete(`/${WYURL}/node/type/${params.id}`);
}

// 节点管理
function getResourceNode (params) {
  return Axios.get(`/${WYURL}/node`, { params });
}
function addAndEditResourceNode (type, params) {
  if (type === 'add') {
    return Axios.post(`/${WYURL}/node`, params);
  } else if (type === 'update') {
    return Axios.put(`/${WYURL}/node/${params.id}`, params);
  }
}
function delResourceNode (params) {
  return Axios.delete(`/${WYURL}/node/${params.id}`);
}
function getResourceNodeDetails (params) {
  return Axios.get(`/${WYURL}/node/${params.id}`);
}

// 纤芯
function getFiberCore (params) {
  return Axios.get(`/${WYURL}/fiber/${params.id}/fiber_core`, { params });
}
function editFiberCore (params) {
  return Axios.put(`/${WYURL}/fiber_core/${params.id}`, params);
}
function delFiberCore (params) {
  return Axios.delete(`/${WYURL}/node/type/${params.id}`);
}
function getFiberCoreDetails (params) {
  return Axios.get(`/${WYURL}/fiber_core/${params.id}`, { params });
}
// 纤芯自定义字段
function getCoreField () {
  return Axios.get(`/${WYURL}/fiber_core/self_defined_field`);
}
function addAndEditCoreField (type, params) {
  if (type === 'add') {
    return Axios.post(`/${WYURL}/fiber_core/self_defined_field`, params);
  } else if (type === 'update') {
    return Axios.put(`/${WYURL}/fiber_core/self_defined_field/${params.id}`, params);
  }
}
function changeCoreFieldShow (params) {
  return Axios.put(`/${WYURL}/fiber_core/self_defined_field/${params.id}/show_list`, params);
}
function delCoreField (params) {
  return Axios.delete(`/${WYURL}/fiber_core/self_defined_field/${params.id}`);
}
function sortCoreField (params) {
  return Axios.put(`/${WYURL}/fiber_core/self_defined_field/${params.id}/drag`, params);
}

/* VLAN */
function getVlan (params) {
  return Axios.get(`/${WYURL}/vlan`, { params });
}
function addAndEditVlan (type, params) {
  if (type === 'add') {
    return Axios.post(`/${WYURL}/vlan`, params);
  } else if (type === 'update') {
    return Axios.put(`/${WYURL}/vlan/${params.id}`, params);
  }
}
function delVlan (params) {
  return Axios.delete(`/${WYURL}/vlan/${params.id}`);
}
function changeVlanStatus (params) {
  return Axios.put(`/${WYURL}/vlan/${params.id}/status`, params);
}
// 类型
function getVlanType () {
  return Axios.get(`/${WYURL}/vlan/type`);
}
function addAndEditVlanType (type, params) {
  if (type === 'add') {
    return Axios.post(`/${WYURL}/vlan/type`, params);
  } else if (type === 'update') {
    return Axios.put(`/${WYURL}/vlan/type/${params.id}`, params);
  }
}
function delVlanType (params) {
  return Axios.delete(`/${WYURL}/vlan/type/${params.id}`);
}

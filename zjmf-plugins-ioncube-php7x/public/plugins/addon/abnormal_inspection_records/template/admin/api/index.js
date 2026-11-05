// 异常巡查记录列表
function abnormalList(params) {
    return Axios.get('/abnormal_inspection_records', { params });
}

// 添加异常巡查记录
function addAbnormal(params) {
    return Axios.post('/abnormal_inspection_records', params);
}

// 修改异常巡查记录
function editAbnormal(params) {
    return Axios.put(`/abnormal_inspection_records/${params.id}`, params);
}

// 删除异常巡查记录
function delAbnormal(id) {
    return Axios.delete(`/abnormal_inspection_records/${id}`);
}

// 导出异常巡查记录
function exportAbnormal() {
    return Axios.get('/abnormal_inspection_records/export_excel', {
        responseType: 'blob',
    });
}

// 用户管理-用户列表
function getClientList(params, id) {
    if (id) {
        return Axios.get(`/client?custom_field[IdcsmartClientLevel_level]=${id}`, {
            params,
        });
    } else {
        return Axios.get(`/client`, { params });
    }
}

// 获取产品数据
function getHost(params) {
    return Axios.get('/host', { 'params': params });
}



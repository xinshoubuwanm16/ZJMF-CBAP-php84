
// 供应商列表
function ApiSupplier(params) {
    return Axios.get(`/manual_resource/supplier`, { params })
}

//手动资源列表
function ApiManualList(params) {
    return Axios.get(`/manual_resource`, { params })
}

// 新增资源
function ApiAddManual(params) {
    return Axios.post(`/manual_resource`, params)
}

//修改资源
function ApiEditManual(params) {
    return Axios.put(`/manual_resource/${params.id}`, params)
}


// 手动资源详情
function ApiManualDetail(id) {
    return Axios.get(`/manual_resource/${id}`)
}

// 删除资源
function ApiDelManual(id) {
    return Axios.delete(`/manual_resource/${id}`)
}

// 修改供应商
function ApiEditSupplier(params) {
    return Axios.put(`/manual_resource/supplier/${params.id}`, params)
}

// 新增供应商
function ApiAddSupplier(params) {
    return Axios.post(`/manual_resource/supplier`, params)
}

//删除供应商
function ApiDelSupplier(id) {
    return Axios.delete(`/manual_resource/supplier/${id}`)
}

// 获取电源状态
function ApiManualStatus(id) {
    return Axios.get(`/manual_resource/${id}/status`)
}

// 开机
function ApiOpenManual(id) {
    return Axios.post(`/manual_resource/${id}/on`)
}

// 关机
function ApiOffManual(id) {
    return Axios.post(`/manual_resource/${id}/off`)
}

// 重启
function ApiRebootManual(id) {
    return Axios.post(`/manual_resource/${id}/reboot`)
}

// 开启控制台
function ApiManualVnc(id) {
    return Axios.post(`/manual_resource/${id}/vnc`)
}

// 重装系统
function ApiManualReinstall(params) {
    return Axios.post(`/manual_resource/${params.id}/reinstall`, params)
}

// 救援系统
function ApiManualRescue(params) {
    return Axios.post(`/manual_resource/${params.id}/rescue`, params)
}

// 破解密码
function ApiManualResetPass(params) {
    return Axios.post(`/manual_resource/${params.id}/reset_password`, params)
}

// 获取操作系统
function ApiManualOs(id) {
    return Axios.get(`/manual_resource/${id}/os`)
}

// 获取操作系统
function getOptSystem(params) {
    return Axios.get(`/manual_resource/${params.id}/os`)
}
// 重装系统
function reinstallSystem(params) {
    return Axios.post(`/manual_resource/${params.id}/reinstall`, params)
}
// 救援系统
function rescueSystem(params) {
    return Axios.post(`/manual_resource/${params.id}/rescue`, params)
}
// 重置密码
function resetPassword(params) {
    return Axios.post(`/manual_resource/${params.id}/reset_password`, params)
}
// 获取操作进度
function getOptProcess(params) {
    return Axios.get(`/manual_resource/${params.id}/task_status`)
}
// 取消操作
function cancelOpt(params) {
    return Axios.post(`/manual_resource/${params.id}/cancel_task`)
}

// 销售列表
function saleList(params) {
    return Axios.get('/sale', { params })
}
// 管理员列表
function adminList(params) {
    return Axios.get('/admin', { params })
}
// 创建销售
function addSale(params) {
    return Axios.post('/sale', params)
}
// 修改销售
function editSale(params) {
    return Axios.put(`/sale/${params.id}`, params)
}
// 启用销售
function enableSale(id) {
    return Axios.post(`/sale/${id}/enable`)
}
// 停用销售
function disableSale(id) {
    return Axios.post(`/sale/${id}/disable`)
}
// 删除销售
function deleteSale(id) {
    return Axios.delete(`/sale/${id}`)
}

// 销售绑定用户列表
function saleClientList(params) {
    return Axios.get('/sale/client', { params })
}

// 获取未绑定销售用户
function noBindClientList(params) {
    return Axios.get('/sale/no_bind_client', { params })
}
// 添加绑定销售
function addClientSale(params) {
    return Axios.post('/sale/client', params)
}
// 修改绑定销售
function editClientSale(params) {
    return Axios.put(`/sale/client/${params.client_id}`, params)
}
// 删除绑定销售
function deleteClientSale(id) {
    return Axios.delete(`/sale/client/${id}`)
}

// 获取销售设置
function saleConfig() {
    return Axios.get('/sale/config')
}
// 获取产品数据
function getHost(params) {
    return Axios.get('/host', { 'params': params });
}

// 获取商品详情
function productDetail(id) {
    return Axios.get(`/product/${id}`);
}
// 获取商品一级分组
function getFirstGroup() {
    return Axios.get(`/product/group/first`)
}
// 添加商品提成设置
function addPrductConfig(params) {
    return Axios.post('/sale/product_commission_config', params)
}
// 修改商品提成设置
function editPrductConfig(params) {
    return Axios.put(`/sale/product_commission_config/${params.id}`, params)
}
//删除商品提成设置
function delPrductConfig(id) {
    return Axios.delete(`/sale/product_commission_config/${id}`)
}
// 添加全局设置
function addCommissionConfig(params) {
    return Axios.post('/sale/commission_config', params)
}
// 修改全局设置
function editCommissionConfig(params) {
    return Axios.put(`/sale/commission_config/${params.id}`, params)
}
// 删除全局设置
function delCommissionConfig(id) {
    return Axios.delete(`/sale/commission_config/${id}`)
}
// 保存销售设置
function saveConfig(params) {
    return Axios.put(`/sale/config`, params)
}
// 获取商品二级分组
function getSecondGroup() {
    return Axios.get(`/product/group/second`)
}
// 获取商品列表
function getProduct() {
    return Axios.get(`/product`)
}
// 销售订单列表
function saleOrder(params) {
    return Axios.get('/sale/order', { 'params': params });
}
//销售订单作废
function deleteSaleOrder(id) {
    return Axios.delete(`/sale/order/${id}`)
}
// 销售统计
function saleStatistics(params) {
    return Axios.get('/sale/statistics', { 'params': params });
}
// 销售统计图表
function saleChart(params) {
    return Axios.get('/sale/chart', { 'params': params });
}
function active_plugin() {
    return Axios.get(`/active_plugin`);
}
// 获取销售ID
function isSale() {
    return Axios.get('/sale/admin');
}
// 获取所有销售
function allSale() {
    return Axios.get('/sale/all');
}
// 销售订单排名
function order_ranking(params) {
    return Axios.get('/sale/order_ranking', { params });
}
// 	消费总金额排名
function client_ranking(params) {
    return Axios.get('/sale/client_ranking', { params });
}
// 提成详情
function commissionData(params) {
    return Axios.get('/sale/commission', { params });
}
//导出EXCEL
function export_excel(params) {
    return Axios.post('/sale/export_excel', params)
}
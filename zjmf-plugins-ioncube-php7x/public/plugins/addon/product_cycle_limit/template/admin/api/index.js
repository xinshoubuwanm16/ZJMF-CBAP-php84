// 商品数量限制列表
function productNnumList(params) {
    return Axios.get('/product_cycle_limit', { params });
}

// 创建商品数量
function addProductNnum(params) {
    return Axios.post('/product_cycle_limit', params);
}

// 修改商品数量
function editProductNnum(params) {
    return Axios.put(`/product_cycle_limit/${params.id}`, params);
}

// 修改商品数量状态
function editProductNnumStatus(params) {
    return Axios.put(`/product_cycle_limit/${params.id}/status`, params);
}

// 删除商品数量
function delProductNnum(id) {
    return Axios.delete(`/product_cycle_limit/${id}`);
}

// 获取商品列表
function getProduct(params) {
    return Axios.get(`/product`, { params });
}

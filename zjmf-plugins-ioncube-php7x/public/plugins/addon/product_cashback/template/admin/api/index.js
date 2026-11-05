// 商品返现列表
function productCashbackList(params) {
    return Axios.get('/product_cashback', { params });
}

// 创建商品数量
function addCashback(params) {
    return Axios.post('/product_cashback', params);
}

// 修改商品数量
function editCashback(params) {
    return Axios.put(`/product_cashback/${params.id}`, params);
}

// 修改商品数量状态
function editCashbackStatus(params) {
    return Axios.put(`/product_cashback/${params.id}/status`, params);
}

// 删除商品数量
function delCashback(id) {
    return Axios.delete(`/product_cashback/${id}`);
}

// 获取商品列表
function getProduct(params) {
  return Axios.get(`/product`, { params });
}

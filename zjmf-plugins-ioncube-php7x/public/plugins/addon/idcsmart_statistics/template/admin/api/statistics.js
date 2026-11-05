/* 统计信息 */

// 年度收入
function getYearIncome (params) {
  return Axios.get(`/statistics/year`, { params })
}

// 预计收入
function getExpectIncome () {
  return Axios.get('/statistics/expect')
}

// 产品收入
function getProductIncome (params) {
  return Axios.get(`/statistics/product`, { params })
}

// 月度收入
function getMonthIncome (params) {
  return Axios.get(`/statistics/month`, { params })
}

// 其他信息
function getOther (params) {
  return Axios.get(`/statistics/other`, { params })
}

// 获取商品二级分组
function getSecondGroup () {
  return Axios.get(`/product/group/second`)
}
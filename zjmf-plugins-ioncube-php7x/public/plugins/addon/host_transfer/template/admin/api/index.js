// 产品转移记录
function hostTransferList(params) {
  return Axios.get("/host_transfer_log", { params });
}

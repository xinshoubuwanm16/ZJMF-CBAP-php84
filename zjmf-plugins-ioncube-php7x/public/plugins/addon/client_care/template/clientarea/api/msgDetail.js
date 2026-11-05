// 站内信详情
function msgDetail(id) {
    return Axios.get(`/client_care/mail/${id}`)
}
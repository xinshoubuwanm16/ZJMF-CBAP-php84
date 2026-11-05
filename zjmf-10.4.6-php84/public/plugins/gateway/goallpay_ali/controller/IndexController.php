<?php
namespace gateway\goallpay_ali\controller;

/**
 * @desc GoallpayAli
 * @author wyh
 * @version 1.0.0
 * @time 2023-11-10
 */
class IndexController extends \app\home\controller\BaseController
{
    public function notifyHandle()
    {
        $param = $this->request->param();
        $GoallpayAli = new \gateway\goallpay_ali\GoallpayAli();
        $config = $GoallpayAli->Config();
        $signData = ["GWTime" => $param["GWTime"], "RespCode" => $param["RespCode"], "RespMsg" => $param["RespMsg"], "acqID" => $param["acqID"], "charSet" => $param["charSet"], "merID" => $param["merID"], "orderAmount" => $param["orderAmount"], "orderCurrency" => $param["orderCurrency"], "orderNum" => $param["orderNum"], "paymentSchema" => $param["paymentSchema"], "signType" => $param["signType"], "transID" => $param["transID"], "transTime" => $param["transTime"], "transType" => $param["transType"], "version" => $param["version"]];
        $signature = $GoallpayAli->goallpayAliSign($signData, $config["key"]);
        if ($param["signature"] != $signature) {
            return "Fail";
        }
        $this->orderHandle($param);
        return "OK";
    }
    private function orderHandle($data)
    {
        $up_data = [];
        $up_data["tmp_order_id"] = $data["orderNum"];
        $up_data["amount"] = $data["orderAmount"];
        $up_data["trans_id"] = $data["transID"];
        $up_data["currency"] = $data["orderCurrency"] ?? "CNY";
        $up_data["paid_time"] = date("Y-m-d H:i:s");
        $up_data["gateway"] = "GoallpayAli";
        order_pay_handle($up_data);
    }
    public function returnHandle()
    {
        $GoallpayAli = new \gateway\goallpay_ali\GoallpayAli();
        $config = $GoallpayAli->Config();
        return redirect($config["url"]);
    }
}

?>
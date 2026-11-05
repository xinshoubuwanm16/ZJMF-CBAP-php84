<?php
namespace gateway\ocgc_pay\controller;

/**
 * @desc Easy Payment Usdt
 * @author wyh
 * @version 1.0
 * @time 2022-07-22
 */
class IndexController extends \app\home\controller\BaseController
{
    public function notifyHandle()
    {
        $param = $this->request->param();
        $OcgcPay = new \gateway\ocgc_pay\OcgcPay();
        $config = $OcgcPay->Config();
        require_once dirname(__DIR__) . "/vendor/QrcodePay.Data.php";
        $QrcodePayDataBase = new \QrcodePayDataBase();
        $verify = $QrcodePayDataBase->verifySign($param["body"], $param["sign"], $config);
        if ($verify) {
            $body = json_decode($param["body"], true);
            $data = ["order_id" => $body["odNo"], "amount" => $body["amount"] / 100, "trade_id" => $body["txnId"], "currency" => "HKD"];
            $this->orderHandle($data);
            echo "SUCCESS";
        } else {
            echo "FAIL";
        }
    }
    private function orderHandle($data)
    {
        $up_data = [];
        $up_data["tmp_order_id"] = $data["order_id"];
        $up_data["amount"] = $data["amount"];
        $up_data["trans_id"] = $data["trade_id"];
        $up_data["currency"] = $data["currency"] ?? "HKD";
        $up_data["paid_time"] = date("Y-m-d H:i:s");
        $up_data["gateway"] = "OcgcPay";
        order_pay_handle($up_data);
    }
    public function returnHandle()
    {
        $OcgcPay = new \gateway\ocgc_pay\OcgcPay();
        $config = $OcgcPay->Config();
        return redirect($config["url"]);
    }
}

?>
<?php
namespace gateway\epusdt\controller;

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
        $Epusdt = new \gateway\epusdt\Epusdt();
        $config = $Epusdt->Config();
        $signData = ["trade_id" => $param["trade_id"], "order_id" => $param["order_id"], "amount" => $param["amount"], "actual_amount" => $param["actual_amount"], "token" => $param["token"], "block_transaction_id" => $param["block_transaction_id"], "signature" => $param["signature"], "status" => $param["status"]];
        $signature = $Epusdt->epusdtSign($signData, $config["api_auth_token"]);
        if ($param["signature"] != $signature) {
            return "fail";
        }
        $this->orderHandle($param);
        return "ok";
    }
    private function orderHandle($data)
    {
        $up_data = [];
        $up_data["tmp_order_id"] = $data["order_id"];
        $up_data["amount"] = $data["amount"];
        $up_data["trans_id"] = $data["trade_id"];
        $up_data["currency"] = $data["currency"] ?? "CNY";
        $up_data["paid_time"] = date("Y-m-d H:i:s");
        $up_data["gateway"] = "Epusdt";
        order_pay_handle($up_data);
    }
    public function returnHandle()
    {
        $Epusdt = new \gateway\epusdt\Epusdt();
        $config = $Epusdt->Config();
        return redirect($config["url"]);
    }
}

?>
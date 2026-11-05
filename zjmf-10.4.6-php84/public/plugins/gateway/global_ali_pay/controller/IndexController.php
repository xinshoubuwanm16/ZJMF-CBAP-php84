<?php
namespace gateway\global_ali_pay\controller;

class IndexController extends \app\home\controller\BaseController
{
    protected $gatewaymodule = "global_ali_pay";
    public function notify_handle()
    {
        $class = new \gateway\global_ali_pay\GlobalAliPay();
        $config = $class->Config();
        $alipayNotify = new \gateway\global_ali_pay\lib\AlipayNotify($config);
        $verify_result = $alipayNotify->verifyNotify();
        if ($verify_result) {
            $data = $_POST;
            $newData = ["tmp_order_id" => $data["out_trade_no"], "gateway" => "GlobalAliPay", "paid_time" => $data["notify_time"], "trans_id" => $data["trade_no"], "amount" => bcdiv($data["total_fee"], $config["rate"] ?? $class->rate, 2), "currency" => $data["currency"]];
            order_pay_handle($newData);
            echo "success";
        } else {
            trace("支付宝支付失败", "info");
            echo "fail";
        }
    }
    public function return_handle()
    {
        $data = $_GET;
        $tmpOrderId = $data["out_trade_no"] ?? "";
        return get_gateway_return_url($tmpOrderId);
    }
    public function aliCheck($params)
    {
        return true;
    }
}

?>
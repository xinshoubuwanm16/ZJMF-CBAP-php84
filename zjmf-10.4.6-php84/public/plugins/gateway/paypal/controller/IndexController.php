<?php
namespace gateway\paypal\controller;

use gateway\paypal\lib\PayPalClient;

class IndexController extends \app\home\controller\BaseController
{
    public function notify_handle()
    {
        $arr = $this->request->param();
        if (!(isset($arr["token"]) && isset($arr["PayerID"]))) {
            exit("fail");
        }
        $token = $arr["token"];
        $payerId = $arr["PayerID"];
        $PayPal = new \gateway\paypal\Paypal();
        $config = $PayPal->config();

        try {
            $client = new PayPalClient($config["clientId"], $config["clientSecret"], $config["mode"]);
            $result = $client->captureOrder($token);
        } catch (\Exception $ex) {
            exit('支付订单失败 '.$ex->getMessage());
        }

        $captures = $result['purchase_units'][0]['payments']['captures'][0];
        $amount = $captures['seller_receivable_breakdown']['gross_amount']['value'];
		$trade_no = $captures['id'];
		$out_trade_no = $captures['invoice_id'];
		$buyer = $result['payer']['email_address'];

        $up_data = [];
        $up_data["tmp_order_id"] = $out_trade_no;
        $up_data["amount"] = $amount ?? 0;
        $up_data["trans_id"] = $trade_no ?? "";
        $up_data["currency"] = "HKD";
        $up_data["paid_time"] = date("Y-m-d H:i:s");
        $up_data["gateway"] = $PayPal->info["name"];
        order_pay_handle($up_data);
        return redirect($config["url"]);
    }
    public function return_handle()
    {
        $PayPal = new \gateway\paypal\Paypal();
        $config = $PayPal->config();
        return redirect($config["url"]);
    }
    public function cancel_handle()
    {
        $PayPal = new \gateway\paypal\Paypal();
        $config = $PayPal->config();
        return redirect($config["url"]);
    }
}

?>
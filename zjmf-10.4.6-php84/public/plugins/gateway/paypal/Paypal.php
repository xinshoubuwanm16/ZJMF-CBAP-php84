<?php
namespace gateway\paypal;

use gateway\paypal\lib\PayPalClient;

require "lib/PayPalClient.php";
/**
 * @desc Paypal支付
 * @author wyh
 * @version 1.0
 * @time 2022-07-13
 */
class Paypal extends \app\common\lib\Plugin
{
    public $info = ["name" => "Paypal", "title" => "Paypal支付", "description" => "Paypal支付,不支持人民币CNY,注意使用", "author" => "智简魔方", "version" => "2.0.0", "help_url" => "", "author_url" => "", "url" => ""];
    public $orderRule = 1;
    public function install()
    {
        return true;
    }
    public function uninstall()
    {
        return true;
    }
    public function PaypalHandle($param)
    {
        $data["currency"] = "HKD";
        $data["body"] = isset($param["product"][0]) ? $param["product"][0] : "订单" . $param["out_trade_no"];
        $data["out_trade_no"] = $param["out_trade_no"];
        $data["subject"] = $data["body"];
        $data["total_amount"] = $param["finance"]["total"];
        $config = $this->config();
        $currency = $data["currency"];
        $out_trade_no = trim($data["out_trade_no"]);
        $subject = trim($data["subject"]);
        $total_amount = trim($data["total_amount"]);
        $body = trim($data["body"]);

        $parameter = [
            'intent'            => 'CAPTURE',
            'purchase_units'    => [
                [
                    'amount'        => [
                        'currency_code' => $currency,
                        'value'         => $total_amount,
                    ],
                    'description'   => $subject,
                    'custom_id'     => $out_trade_no,
                    'invoice_id'    => $out_trade_no,
                ],
            ],
            'application_context'=> [
                'cancel_url'    => $config["cancel_url"],
                'return_url'    => $config["notify_url"],
            ],
        ];

        try {
            $client = new PayPalClient($config["clientId"], $config["clientSecret"], $config["mode"]);
            $result = $client->createOrder($parameter);

            $approvalUrl = null;
            foreach($result['links'] as $link){
                if($link['rel'] == 'approve'){
                    $approvalUrl = $link['href'];
                }
            }
            if(empty($approvalUrl)){
                throw new \Exception('获取支付链接失败');
            }
        }
        catch (\Exception $ex) {
            throw new \Exception('PayPal下单失败：'.$ex->getMessage());
        }

        $html = "<a href='" . $approvalUrl . "' target='_blank'>去支付</a>";
        return $html;
    }
    public function config()
    {
        $config = \think\facade\Db::name("plugin")->where("name", $this->info["name"])->value("config");
        if (!empty($config) && $config != "null") {
            $config = json_decode($config, true);
        } else {
            $config = [];
        }
        $con = (require dirname(__DIR__) . "/paypal/config/config.php");
        $config = array_merge($con, $config);
        return $config;
    }
}

?>
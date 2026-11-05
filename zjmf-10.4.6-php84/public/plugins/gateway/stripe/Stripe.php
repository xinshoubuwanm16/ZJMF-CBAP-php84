<?php
namespace gateway\stripe;

use gateway\stripe\lib\StripeClient;

class Stripe extends \app\common\lib\Plugin
{
    public $info = ["name" => "Stripe", "title" => "Stripe聚合支付", "description" => "Stripe聚合支付", "author" => "智简魔方", "version" => "2.0.0", "help_url" => "", "author_url" => "", "url" => ""];
    public $orderRule = 1;
    public function install()
    {
        return true;
    }
    public function uninstall()
    {
        return true;
    }
    public function StripeHandle($param)
    {
        if ($param["finance"]["total"] < 4) {
            throw new \Exception("金额需大于4且小于999999.99");
        }
        $config = $this->config();
        $subject = isset($param["product"][0]) ? $param["product"][0] : "订单" . $param["out_trade_no"];
        $amount = intval(round($param["finance"]["total"] * 100));

        $stripe = new StripeClient($config['apikey']);
        $data = [
            'success_url'         => $config['return_url'],
            'cancel_url'          => $config['cancel_url'],
            'client_reference_id' => $param["out_trade_no"],
            'line_items' => [[
                'price_data' => [
                    'currency'     => $config["currency"] ? $config["currency"] : "hkd",
                    'product_data' => [
                        'name' => $subject
                    ],
                    'unit_amount'  => $amount
                ],
                'quantity'   => 1
            ]],
            'mode'                => 'payment'
        ];
        try{
            $result = $stripe->request('post', '/v1/checkout/sessions', $data);
            $url = $result['url'];
        }catch(\Exception $e){
            throw new \Exception('Stripe下单失败：'.$e->getMessage());
        }

        $html = "<a id='stripe' href='" . $url . "' target='_blank'>Go to Pay</a>\r\n        <script>\r\n                document.getElementById('stripe').click()\r\n            </script>\r\n        ";
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
        $con = (require dirname(__DIR__) . "/stripe/config/config.php");
        $config = array_merge($con, $config);
        return $config;
    }
}

?>
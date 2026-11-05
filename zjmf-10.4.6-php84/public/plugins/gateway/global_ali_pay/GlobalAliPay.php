<?php
namespace gateway\global_ali_pay;

class GlobalAliPay extends \app\common\lib\Plugin
{
    public $rate = 1;
    public $info = ["name" => "GlobalAliPay", "title" => "支付宝国际支付", "description" => "支付宝国际支付", "author" => "智简魔方", "version" => "2.0.0", "help_url" => "", "author_url" => "", "url" => ""];
    public $orderRule = 1;
    public function install()
    {
        return true;
    }
    public function uninstall()
    {
        return true;
    }
    public function GlobalAliPayHandle($param)
    {
        $alipay_config = $this->Config();
        $data = ["service" => $alipay_config["service"], "partner" => $alipay_config["partner"], "notify_url" => $alipay_config["notify_url"], "return_url" => $alipay_config["return_url"], "refer_url" => $alipay_config["refer_url"]];
        $aliValidate = new validate\AliPayValidate();
        if (!$aliValidate->check($param)) {
            return json(["status" => 400, "msg" => $aliValidate->getError()]);
        }
        $data["body"] = str_replace("服务费", " Service Fee", isset($param["product"][0]) ? $param["product"][0] : "订单" . $param["out_trade_no"]);
        $data["out_trade_no"] = $param["out_trade_no"];
        $data["subject"] = $data["body"];
        $data["currency"] = $alipay_config["currency"] ?? "HKD";
        $data["total_fee"] = bcmul($param["finance"]["total"], $alipay_config["rate"] ?? $this->rate, 2);
        if (request()->isMobile()) {
            $data["product_code"] = "NEW_WAP_OVERSEAS_SELLER";
        } else {
            $data["product_code"] = "NEW_OVERSEAS_SELLER";
        }
        $trade_information = [];
        $trade_information["business_type"] = 5;
        $trade_information["other_business_type"] = $data["body"];
        $trade_information = json_encode($trade_information);
        $data["trade_information"] = $trade_information;
        $data["_input_charset"] = trim(strtolower($alipay_config["input_charset"]));
        $data["qr_pay_mode"] = 4;
        $data["qrcode_width"] = 200;
        $alipaySubmit = new lib\AlipaySubmit($alipay_config);
        $url = $alipaySubmit->buildRequestParaToString($data);
        $html = "<a id='global_ali_pay' href='" . $url . "' target='_blank'>去支付</a><script>\r\n                document.getElementById('global_ali_pay').click()\r\n            </script>";
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
        $con = (require dirname(__DIR__) . "/global_ali_pay/config/config.php");
        $config = array_merge($con, $config);
        return $config;
    }
}

?>
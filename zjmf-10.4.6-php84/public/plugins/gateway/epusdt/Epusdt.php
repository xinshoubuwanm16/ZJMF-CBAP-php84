<?php
namespace gateway\epusdt;

/**
 * @desc Easy Payment Usdt
 * @author wyh
 * @version 1.0
 * @time 2022-07-22
 */
class Epusdt extends \app\common\lib\Plugin
{
    public $info = ["name" => "Epusdt", "title" => "Easy Payment Usdt", "description" => "Easy Payment Usdt是一个由Go语言编写的私有化部署Usdt支付中间件(Trc20网络),站长或开发者可通过Epusdt提供的http api集成至您的任何系统,无需过多的配置,仅仅依赖mysql和redis,可实现USDT的在线支付和消息回调，这一切在优雅和顷刻间完成", "author" => "智简魔方", "version" => "2.0.0", "help_url" => "https://github.com/assimon/epusdt/blob/master/wiki/BT_RUN.md", "author_url" => "", "url" => ""];
    public $orderRule = 1;
    public function install()
    {
        return true;
    }
    public function uninstall()
    {
        return true;
    }
    public function EpusdtHandle($param)
    {
        $outTradeNo = $param["out_trade_no"];
        $totalAmount = $param["finance"]["total"];
        $config = $this->Config();
        if (isset($config["condition"]) && $config["condition"] == "on") {
            $OrderModel = new \app\common\model\OrderModel();
            $noEpusdtOrder = $OrderModel->where("gateway", "<>", "Epusdt")->where("status", "Paid")->find();
            if (empty($noEpusdtOrder)) {
                return ["status" => 400, "msg" => "Please pay by other methods first"];
            }
        }
        $signData = ["amount" => floatval($totalAmount), "notify_url" => $config["notify_url"], "order_id" => $outTradeNo, "redirect_url" => $config["redirect_url"]];
        $signature = $this->epusdtSign($signData, $config["api_auth_token"]);
        $signData["signature"] = $signature;
        $result = $this->curlRequest($config["epusdt_url"], json_encode($signData));
        $resData = json_decode($result, true);
        if (!isset($resData["status_code"]) || $resData["status_code"] != 200) {
            return ["status" => 400, "msg" => $resData["message"] ?? "支付错误"];
        }
        $url = $resData["data"]["payment_url"];
        $html = "<a id='epusdt' href='" . $url . "' target='_blank'>去支付</a>\r\n<script>\r\n                document.getElementById('epusdt').click()\r\n            </script>\r\n";
        return $html;
    }
    public function Config()
    {
        $config = \think\facade\Db::name("plugin")->where("name", $this->info["name"])->value("config");
        if (!empty($config) && $config != "null") {
            $config = json_decode($config, true);
        } else {
            $config = [];
        }
        $con = (require dirname(__DIR__) . "/epusdt/config/config.php");
        $config = array_merge($con, $config);
        return $config;
    }
    public function epusdtSign($parameter, $signKey)
    {
        ksort($parameter);
        reset($parameter);
        $sign = "";
        $urls = "";
        foreach ($parameter as $key => $val) {
            if ($val != "") {
                if ($key != "signature") {
                    if ($sign != "") {
                        $sign .= "&";
                        $urls .= "&";
                    }
                    $sign .= $key . "=" . $val;
                    $urls .= $key . "=" . urlencode($val);
                }
            }
        }
        $sign = md5($sign . $signKey);
        return $sign;
    }
    public function curlRequest($url, $data = NULL, $method = "post", $header = ["content-type: application/json"], $https = true, $timeout = 30)
    {
        $method = strtoupper($method);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        if ($https) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        }
        if ($method != "GET") {
            if ($method == "POST") {
                curl_setopt($ch, CURLOPT_POST, true);
            }
            if ($method == "PUT" || strtoupper($method) == "DELETE") {
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            }
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        }
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        $result = curl_exec($ch);
        curl_close($ch);
        return $result;
    }
}

?>
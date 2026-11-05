<?php
namespace gateway\goallpay_ali;

/**
 * @desc GoAllPayAli
 * @author wyh
 * @version 1.0
 * @description 说明，v5版本文档有问题，参考：https://git.allpayx.com/OpenAPI/common/src/master/AllPay_Integration_Specification_CH.md#22-%E7%AD%BE%E5%90%8D%E8%A7%84%E5%88%99
 * @time 2023-11-10
 */
class GoallpayAli extends \app\common\lib\Plugin
{
    public $info = ["name" => "GoallpayAli", "title" => "GoallpayAli", "description" => "GoAllPay深知安全、合规对金融服务的重要性，在每一项业务的处理服务和方案设计中，资金和信息的安全为最根本的出发点", "author" => "智简魔方", "version" => "2.0.0", "help_url" => "https://goallpayx.com/cn/index.html", "author_url" => "", "url" => ""];
    public $orderRule = 1;
    public function install()
    {
        return true;
    }
    public function uninstall()
    {
        return true;
    }
    public function GoallpayAliHandle($param)
    {
        $config = $this->Config();
        $outTradeNo = $param["out_trade_no"];
        $totalAmount = (string) $param["finance"]["total"];
        $transTime = date("YmdHms", time());
        $goodsInfo = str_replace("服务费", " Service Fee", isset($param["product"][0]) ? $param["product"][0] : "订单" . $param["out_trade_no"]);
        $detailInfo = [["goods_name" => $goodsInfo, "quantity" => "1"]];
        $signData = ["orderNum" => $outTradeNo, "orderCurrency" => $config["currency"] ?? "CNY", "frontURL" => $config["redirect_url"], "backURL" => $config["notify_url"], "merID" => $config["merchant_id"], "transTime" => $transTime, "signType" => "SHA256", "orderAmount" => $totalAmount, "goodsInfo" => $goodsInfo, "detailInfo" => base64_encode(json_encode($detailInfo)), "userIP" => get_client_ip(), "userID" => (string) get_client_id(), "logisticsStreet" => (string) get_client_id(), "paymentMethod" => "alipay_cn", "version" => "VER000000005", "charSet" => "UTF-8", "transType" => "PURC", "acqID" => "99020344", "paymentSchema" => "AP"];
        if (request()->isMobile()) {
            $signData["tradeFrom"] = "H5";
            $signData["osType"] = "ANDROID";
        } else {
            $signData["tradeFrom"] = "WEB";
            $signData["osType"] = "WINDOWS";
        }
        $signature = $this->goallpayAliSign($signData, $config["key"]);
        $signData["signature"] = $signature;
        $url = $config["goallpay_url"] . "/api/createorder";
        $result = $this->curlRequest($url, json_encode($signData));
        $resData = json_decode($result, true);
        if (!isset($resData["RespCode"]) || $resData["RespCode"] != "00") {
            return ["status" => 400, "msg" => $resData["RespMsg"] ?? "支付错误"];
        }
        $url = $resData["parameter"]["payUrl"];
        $html = "<a id='goallpayali' href='" . $url . "' target='_blank'>去支付</a>\r\n<script>\r\n                document.getElementById('goallpayali').click()\r\n            </script>\r\n";
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
        $con = (require dirname(__DIR__) . "/goallpay_ali/config/config.php");
        $config = array_merge($con, $config);
        return $config;
    }
    public function goallpayAliSign($parameter, $signKey)
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
        $sign = $this->encrypt_sha256($sign . $signKey);
        return $sign;
    }
    public function curlRequest($url, $data = NULL, $method = "post", $header = ["accept: application/json", "content-type: application/json"], $https = true, $timeout = 30)
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
    public function encrypt_sha256($str = "")
    {
        return hash("sha256", $str);
    }
}

?>
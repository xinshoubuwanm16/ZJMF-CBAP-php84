<?php
namespace gateway\ocgc_pay;

require_once "vendor/QrcodePay.Config.php";
require_once "vendor/QrcodePay.Exception.php";
require_once "vendor/QrcodePay.Data.php";
/**
 * @desc OcgcPay
 * @author wyh
 * @version 1.0
 * @time 2022-10-19
 */
class OcgcPay extends \app\common\lib\Plugin
{
    public $info = ["name" => "OcgcPay", "title" => "Oriental City Group China Limited (OCGC)支付", "description" => "Oriental City Group China Limited (OCGC)是支付寶及支付寶香港在香港的專業支付服務提供商之一。", "author" => "智简魔方", "version" => "2.0.0", "help_url" => "http://ocghk.com/#pay", "author_url" => "", "url" => ""];
    public $orderRule = 1;
    public function install()
    {
        return true;
    }
    public function uninstall()
    {
        return true;
    }
    public function OcgcPayHandle($param)
    {
        $config = $this->Config();
        $loginRequest = new \loginRequest();
        $loginRequest->action = "msc/user/login";
        $loginRequest->v = \RrcodePayConfig::LOGIN_V;
        $loginRequest->iposSn = \RrcodePayConfig::IPOS_SN;
        $loginRequest->merchId = $config["merch_id"];
        $loginRequest->operator = $config["operator"];
        $loginRequest->pwd = md5($config["login_pwd"]);
        $loginResult = vendor\QrcodePayApi::login($loginRequest, $config);
        $session = $loginResult["header"]["x-apsessionid"] ?? "";
        $CSBPayRequest = new \mscTxnRequest();
        $CSBPayRequest->action = "msc/txn/request";
        $CSBPayRequest->paymentId = \RrcodePayConfig::PAYMENTID_ALIPAY_ONLINE;
        $CSBPayRequest->transType = \RrcodePayConfig::TRANS_TYPE_PAY;
        $CSBPayRequest->batchNo = $loginResult["body"]["batchNo"];
        $CSBPayRequest->traceNo = "000002";
        $CSBPayRequest->transTime = date("YmdHis");
        $CSBPayRequest->transAmount = $param["finance"]["total"] * 100;
        $CSBPayRequest->odNo = $param["out_trade_no"];
        $CSBPayRequest->odDesc = isset($param["product"][0]) ? $param["product"][0] : "订单" . $param["out_trade_no"];
        $CSBPayRequest->currency = $loginResult["body"]["stl_cur"];
        $CSBPayRequest->notifyUrl = $config["notify_url"];
        $CSBPayRequest->dataPayType = \RrcodePayConfig::PAYTYPE_ALIPAY_ONLINE;
        $CSBPayRequest->dataAction = \RrcodePayConfig::CSB_ACTION;
        $CSBPayRequest->dataQrcodeType = \RrcodePayConfig::WALLET_ALIPAYCN;
        $dataJson = json_encode(["payType" => $CSBPayRequest->dataPayType, "action" => $CSBPayRequest->dataAction, "qrcodeType" => $CSBPayRequest->dataQrcodeType]);
        $CSBPayRequest->data = $dataJson;
        $CSBPayResult = vendor\QrcodePayApi::mscTxnRequest($CSBPayRequest, $session, $config);
        if (isset($CSBPayResult["body"]["data"])) {
            $data = json_decode($CSBPayResult["body"]["data"], true);
            if ($data["qrcodeResult"] == "SUCCESS") {
                return "<object data=\"" . $data["qrcodeUrl"] . "\" style=\"width: 200px; height: 210px;\"></object>";
            }
            return ["status" => 400, "msg" => $data["resultMsg"] ?? "配置错误"];
        }
        return ["status" => 400, "msg" => $CSBPayResult["errorMsg"] ?? "配置错误"];
    }
    public function Config()
    {
        $config = \think\facade\Db::name("plugin")->where("name", $this->info["name"])->value("config");
        if (!empty($config) && $config != "null") {
            $config = json_decode($config, true);
        } else {
            $config = [];
        }
        $con = (require dirname(__DIR__) . "/ocgc_pay/config/config.php");
        $config = array_merge($con, $config);
        return $config;
    }
}

?>
<?php
require_once "QrcodePay.Exception.php";
/**
 * QrcodePayDataBase class
 */
class QrcodePayDataBase
{
    public function buildSign($toSign = NULL, $config = [])
    {
        $signature = NULL;
        $priv_key = $config["cert_private_key"];
        $pkeyid = "-----BEGIN RSA PRIVATE KEY-----\n" . wordwrap($priv_key, 64, "\n", true) . "\n-----END RSA PRIVATE KEY-----";
        openssl_sign($toSign, $signature, $pkeyid);
        $hex = bin2hex($signature);
        return $hex;
    }
    public function verifySign($originalStr = NULL, $sign = NULL, $config = [])
    {
        $public_key = $config["cert_public_key"];
        $pkeyid = "-----BEGIN PUBLIC KEY-----\n" . wordwrap($public_key, 64, "\n", true) . "\n-----END PUBLIC KEY-----";
        $ok = openssl_verify($originalStr, hex2bin($sign), $pkeyid);
        return $ok;
    }
    public function doRequest($isLogin = true, $session = NULL, $object = NULL, $config = [])
    {
        $url = $config["api_url"];
        $httpBodyJson = $this->object2json($object);
        $apsignature = strtoupper($this->buildSign($httpBodyJson, $config));
        $httpBody = "params=" . $httpBodyJson;
        $header = ["X-APVersion:1.0", "Content-Type:application/x-www-form-urlencoded;charset=utf-8", "Accept-Language:zh-CN", "X-APFormat:json", "Accept:application/json", "x-appkey:" . $config["merch_id"], "x-apsignature:" . $apsignature];
        if (!$isLogin) {
            $header[] = "x-apsessionid:" . $session;
        }
        $return = $this->httpRequest($url, "post", $header, $httpBody, $config);
        return $return;
    }
    public function object2json($object = NULL)
    {
        if (empty($object)) {
            throw new QrcodePayException("Object to json variable is empty.");
        }
        foreach ($object as $key => $value) {
            if (empty($value)) {
                $object->{$key} = "";
            }
        }
        if (version_compare(PHP_VERSION, "5.4", ">=")) {
            $json = json_encode($object, JSON_UNESCAPED_SLASHES);
        } else {
            $json = str_replace("\\/", "/", json_encode($object));
        }
        return "[" . $json . "]";
    }
    public function httpRequest($url, $method = "get", $header = [], $data = NULL, $config = [])
    {
        $ch = curl_init($url);
        $cookie = "cookie";
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        if ($method == "post") {
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        }
        $response = curl_exec($ch);
        $curl_error_no = curl_errno($ch);
        if (0 < $curl_error_no) {
            throw new QrcodePayException("curl出错，错误码: " . $curl_error_no);
        }
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $response_header = substr($response, 0, $header_size);
        $response_body = substr($response, $header_size);
        $originalS = $response_body;
        $response_body = trim($response_body, "[");
        $response_body = trim($response_body, "]");
        $response_body = json_decode($response_body, 1);
        $response_header_arr = [];
        $response_header_arr = explode("\r\n", $response_header);
        if (json_last_error() != JSON_ERROR_NONE || empty($response_header_arr)) {
            throw new QrcodePayException("Analyze return json error.");
        }
        $response_header_return = [];
        $isVailed = true;
        foreach ($response_header_arr as $loop) {
            if (strpos($loop, "x-apsessionid") !== false) {
                $response_header_return["x-apsessionid"] = str_replace(["\r\n", "\r", "\n", "x-apsessionid", ":", " "], "", $loop);
            }
            if (strpos($loop, "x-apsignature") !== false) {
                $header_sign = str_replace(["\r\n", "\r", "\n", "x-apsignature", ":", " "], "", $loop);
                $isVailed = $this->verifySign($originalS, $header_sign, $config);
            }
        }
        if ($isVailed) {
            return ["header" => $response_header_return, "body" => $response_body];
        }
        return "response的x-apsignature签名认证失败，数据来此非平台方。\n";
    }
}
/**
* loginRequest class
*/
class loginRequest extends QrcodePayDataBase
{
    public $action;
    public $v;
    public $iposSn;
    public $merchId;
    public $operator;
    public $pwd;
}
/**
* mscTxnRequest class
*/
class mscTxnRequest extends QrcodePayDataBase
{
    public $action;
    public $paymentId;
    public $transType;
    public $batchNo;
    public $traceNo;
    public $transTime;
    public $transAmount;
    public $odNo;
    public $odDesc;
    public $notifyUrl;
    public $currency;
    public $transTimeOut;
    public $data;
    public $dataPayType;
    public $dataAction;
    public $dataQrcodeType;
    public $dataPayCode;
    public $dataWalletType;
    public $dataReturnUrl;
    public $dataRefNo;
    public $dataOriTxnId;
    public $dataOpenId;
    public $dataSubAppId;
    public $dataSubOpenId;
}
/**
* PayQueryRequest class
*/
class PayQueryRequest extends QrcodePayDataBase
{
    public $action;
    public $txnId;
    public $batchNo;
    public $traceNo;
    public $odNo;
    public $transType;
}
/**
* RateQueryRequest class
*/
class RateQueryRequest extends QrcodePayDataBase
{
    public $action;
    public $currency;
    public $date;
}

?>
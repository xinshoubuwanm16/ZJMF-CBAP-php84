<?php
namespace oauth\qyweixin;

class Qyweixin extends \app\common\lib\Oauth
{
    public $info = ["name" => "Qyweixin", "title" => "企业微信", "description" => "企业微信", "author" => "idcsmart", "author_url" => "", "help_url" => "https://developer.work.weixin.qq.com/document/path/98170", "version" => "1.0.0", "logo_url" => "qyweixin.svg"];
    public function url($param)
    {
        $keysArr = ["login_type" => "ServiceApp", "appid" => $param["suite_id"], "redirect_uri" => $param["callback"], "state" => $param["system_oauth_state"]];
        $login_url = "https://login.work.weixin.qq.com/wwlogin/sso/login?" . http_build_query($keysArr) . "#wechat_redirect";
        return $login_url;
    }
    public function callback($param)
    {
        if (!isset($param["code"]) || empty($param["code"])) {
            return "error";
        }
        $res = $this->getSuiteAccessToken($param);
        if ($res["status"] != 200) {
            return $res["msg"];
        }
        $suite_access_token = $res["data"]["access_token"];
        $query = ["suite_access_token" => $suite_access_token, "code" => $param["code"]];
        $response = curl("https://qyapi.weixin.qq.com/cgi-bin/service/auth/getuserinfo3rd", $query, 30, "GET");
        $res = json_decode($response["content"] ?? "", true);
        if (!isset($res["errcode"]) || $res["errcode"] !== 0) {
            return $res["errmsg"] ?? "";
        }
        $openid = $res["openid"] ?? $res["open_userid"];
        $data = ["openid" => $openid, "data" => ["username" => ""]];
        return $data;
    }
    public function receive($param)
    {
        $xml = file_get_contents("php://input");
        if (empty($xml)) {
            $res = "";
            $WXBizMsgCrypt = new sdk\WXBizMsgCrypt($param["token"], $param["aes_key"], $param["corp_id"]);
            $errCode = $WXBizMsgCrypt->VerifyURL($param["msg_signature"], $param["timestamp"], $param["nonce"], $param["echostr"], $res);
            if ($errCode == 0) {
                echo $res;
            } else {
                echo "ERR: " . $errCode . "\n\n";
            }
        } else {
            $WXBizMsgCrypt = new sdk\WXBizMsgCrypt($param["token"], $param["aes_key"], $param["suite_id"]);
            $errCode = $WXBizMsgCrypt->DecryptMsg($param["msg_signature"], $param["timestamp"], $param["nonce"], $xml, $res);
            if ($errCode == 0) {
                try {
                    $DOMDocument = new \DOMDocument();
                    $DOMDocument->loadXML($res);
                    $array_e = $DOMDocument->getElementsByTagName("SuiteTicket");
                    $suiteTicket = $array_e->item(0)->nodeValue;
                    if (!empty($suiteTicket)) {
                        idcsmart_cache("QYWEIXIN_SUITE_TICKET_" . md5($param["suite_id"] . $param["token"]), $suiteTicket, 1800);
                    }
                } catch (\Exception $e) {
                }
                echo "success";
            } else {
                echo "ERR: " . $errCode . "\n\n";
            }
        }
        exit;
    }
    protected function getSuiteAccessToken($param)
    {
        $cache_key = "QYWEIXIN_" . md5($param["suite_id"] . $param["secret"]);
        $access_token = idcsmart_cache($cache_key);
        if (!empty($access_token)) {
            $result = ["status" => 200, "msg" => lang("success_message"), "data" => ["access_token" => $access_token]];
            return $result;
        }
        $data = ["suite_id" => $param["suite_id"], "suite_secret" => $param["secret"], "suite_ticket" => idcsmart_cache("QYWEIXIN_SUITE_TICKET_" . md5($param["suite_id"] . $param["token"]))];
        $url = "https://qyapi.weixin.qq.com/cgi-bin/service/get_suite_token";
        $response = curl($url, json_encode($data), 30, "POST", ["Content-Type: aplication/json"]);
        $response = json_decode($response["content"], true);
        if (isset($response["suite_access_token"]) && isset($response["expires_in"]) && !empty($response["suite_access_token"])) {
            $result = ["status" => 200, "msg" => lang("success_message"), "data" => ["access_token" => $response["suite_access_token"]]];
            idcsmart_cache($cache_key, $response["suite_access_token"], max(1, $response["expires_in"] - 120));
        } else {
            $result = ["status" => 400, "msg" => $response["errmsg"] ?? "获取失败"];
        }
        return $result;
    }
}

?>
<?php
namespace oauth\dingtalk;

class Dingtalk extends \app\common\lib\Oauth
{
    public $info = ["name" => "Dingtalk", "title" => "钉钉", "description" => "钉钉", "author" => "idcsmart", "author_url" => "", "help_url" => "https://open.dingtalk.com/document/orgapp/tutorial-obtaining-user-personal-information", "version" => "1.0.0", "logo_url" => "dingtalk.svg"];
    public function url($param)
    {
        $keysArr = ["redirect_uri" => $param["callback"], "response_type" => "code", "client_id" => $param["client_id"], "scope" => "openid", "state" => $param["system_oauth_state"], "prompt" => "consent"];
        $login_url = "https://login.dingtalk.com/oauth2/auth?" . http_build_query($keysArr);
        return $login_url;
    }
    public function callback($param)
    {
        if (!isset($param["authCode"]) || empty($param["authCode"])) {
            return $param["error"] ?? "error";
        }
        $data = ["clientId" => $param["client_id"], "clientSecret" => $param["client_secret"], "code" => $param["authCode"], "grantType" => "authorization_code"];
        $res = curl("https://api.dingtalk.com/v1.0/oauth2/userAccessToken", json_encode($data), 30, "POST", ["Content-Type: application/json"]);
        $res = json_decode($res["content"], true);
        if (!isset($res["accessToken"]) || !isset($res["expireIn"])) {
            return "error";
        }
        $accessToken = $res["accessToken"];
        $header = ["x-acs-dingtalk-access-token: " . $accessToken, "Content-Type: application/json"];
        $res = curl("https://api.dingtalk.com/v1.0/contact/users/me", [], 30, "GET", $header);
        $res = json_decode($res["content"], true);
        if (!isset($res["openId"]) || empty($res["openId"])) {
            return $res["message"] ?? "error";
        }
        $callback = ["openid" => $res["openId"], "data" => ["username" => $res["nick"]]];
        return $callback;
    }
}

?>
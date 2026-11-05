<?php
namespace oauth\weixin;

class Weixin extends \app\common\lib\Oauth
{
    public $info = ["name" => "Weixin", "title" => "微信", "description" => "微信", "author" => "idcsmart", "author_url" => "", "help_url" => "https://open.weixin.qq.com/", "version" => "1.0.0", "logo_url" => "weixin.svg"];
    public function url($params)
    {
        $keysArr = ["response_type" => "code", "appid" => $params["appid"], "redirect_uri" => $params["callback"], "state" => $params["system_oauth_state"], "scope" => "snsapi_login"];
        $login_url = $this->combineURL("https://open.weixin.qq.com/connect/qrconnect", $keysArr);
        return $login_url;
    }
    public function callback($params)
    {
        if (empty($params["code"])) {
            return "error";
        }
        $keysArr = ["code" => $params["code"], "appid" => $params["appid"], "secret" => $params["appSecret"], "grant_type" => "authorization_code"];
        $access_token = $this->get("https://api.weixin.qq.com/sns/oauth2/access_token", $keysArr);
        $access_token = json_decode($access_token, true);
        if (empty($access_token["access_token"])) {
            return $access_token["errmsg"];
        }
        $keysArr = ["access_token" => $access_token["access_token"], "openid" => $access_token["openid"]];
        $userinfo = $this->get("https://api.weixin.qq.com/sns/userinfo", $keysArr);
        $userinfo = json_decode($userinfo, true);
        if (empty($userinfo["openid"])) {
            return $userinfo["errmsg"];
        }
        $callback = ["openid" => $userinfo["openid"], "data" => ["username" => $userinfo["nickname"], "country" => "", "address" => $userinfo["province"] . $userinfo["city"], "avatar" => $userinfo["headimgurl"]]];
        return $callback;
    }
    public function combineURL($baseURL, $keysArr)
    {
        $combined = $baseURL . "?";
        $valueArr = [];
        foreach ($keysArr as $key => $val) {
            $valueArr[] = $key . "=" . $val;
        }
        $keyStr = implode("&", $valueArr);
        $combined .= $keyStr;
        return $combined;
    }
    public function get_contents($url)
    {
        if (ini_get("allow_url_fopen") == "1") {
            $response = file_get_contents($url);
        } else {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_URL, $url);
            $response = curl_exec($ch);
            curl_close($ch);
        }
        return $response;
    }
    public function get($url, $keysArr)
    {
        $combined = $this->combineURL($url, $keysArr);
        return $this->get_contents($combined);
    }
}

?>
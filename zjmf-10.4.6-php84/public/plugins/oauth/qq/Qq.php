<?php
namespace oauth\qq;

class Qq extends \app\common\lib\Oauth
{
    public $info = ["name" => "Qq", "title" => "QQ", "description" => "QQ", "author" => "idcsmart", "author_url" => "", "help_url" => "https://connect.qq.com/", "version" => "1.0.0", "logo_url" => "qq.svg"];
    public function url($params)
    {
        $keysArr = ["response_type" => "code", "client_id" => $params["app_id"], "redirect_uri" => $params["callback"], "state" => $params["system_oauth_state"], "scope" => "snsapi_login"];
        $login_url = $this->combineURL("https://graph.qq.com/oauth2.0/authorize", $keysArr);
        return $login_url;
    }
    public function callback($params)
    {
        if (empty($params["code"])) {
            return "error";
        }
        $keysArr = ["code" => $params["code"], "client_id" => $params["app_id"], "client_secret" => $params["app_secret"], "grant_type" => "authorization_code", "redirect_uri" => $params["callback"]];
        $access_token = $this->get("https://graph.qq.com/oauth2.0/token", $keysArr);
        if (strpos($access_token, "callback(") !== false) {
            $access_token = $this->strCallbackToArray($access_token);
        }
        if (isset($access_token["error"])) {
            return $access_token["error_description"] ?? $access_token["error"];
        }
        parse_str($access_token, $access_token);
        $keysArr = ["access_token" => $access_token["access_token"]];
        $openid = $this->get("https://graph.qq.com/oauth2.0/me", $keysArr);
        if (strpos($openid, "callback(") !== false) {
            $openid = $this->strCallbackToArray($openid);
        }
        if (empty($openid["openid"])) {
            return $openid;
        }
        $keysArr = ["access_token" => $access_token["access_token"], "openid" => $openid["openid"], "oauth_consumer_key" => $params["app_id"]];
        $userinfo = $this->get("https://graph.qq.com/user/get_user_info", $keysArr);
        $userinfo = json_decode($userinfo, true);
        if ($userinfo["ret"] != 0) {
            return $userinfo["msg"];
        }
        $callback = ["openid" => $openid["openid"], "data" => ["username" => $userinfo["nickname"], "country" => "", "address" => $userinfo["province"] . $userinfo["city"], "avatar" => $userinfo["figureurl"]]];
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
    public function strCallbackToArray($string)
    {
        $string = str_replace("callback(", "", $string);
        $string = trim(str_replace(");", "", $string));
        $string = json_decode($string, true);
        return $string;
    }
}

?>
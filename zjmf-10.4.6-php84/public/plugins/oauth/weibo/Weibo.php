<?php
namespace oauth\weibo;

class Weibo extends \app\common\lib\Oauth
{
    public $info = ["name" => "Weibo", "title" => "微博", "description" => "微博", "author" => "idcsmart", "author_url" => "", "help_url" => "https://open.weibo.com/", "version" => "1.0.0", "logo_url" => "weibo.svg"];
    public function url($params)
    {
        $keysArr = ["client_id" => $params["app_key"], "redirect_uri" => $params["callback"], "state" => $params["system_oauth_state"], "scope" => "all"];
        $login_url = $this->combineURL("https://api.weibo.com/oauth2/authorize", $keysArr);
        return $login_url;
    }
    public function callback($params)
    {
        $keysArr = ["code" => $params["code"], "client_id" => $params["app_key"], "client_secret" => $params["app_secret"], "grant_type" => "authorization_code", "redirect_uri" => $params["callback"]];
        $access_token = $this->post("https://api.weibo.com/oauth2/access_token", $keysArr);
        $access_token = json_decode($access_token, true);
        if (isset($access_token["error"])) {
            return $access_token["error_description"] ?? $access_token["error"];
        }
        $keysArr = ["access_token" => $access_token["access_token"], "uid" => $access_token["uid"]];
        $userinfo = $this->get("https://api.weibo.com/2/users/show.json", $keysArr);
        $userinfo = json_decode($userinfo, true);
        if (isset($userinfo["error"])) {
            return $userinfo["error_description"];
        }
        $location = explode(" ", $userinfo["location"]);
        $callback = ["openid" => $access_token["access_token"], "data" => ["username" => $userinfo["screen_name"], "country" => "", "address" => $location[0] . $location[1], "avatar" => $userinfo["profile_image_url"]]];
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
    public function post($url, $keysArr, $flag = 0)
    {
        if ($keysArr) {
            $keysArr = http_build_query($keysArr);
        }
        $ch = curl_init();
        if (!$flag) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        }
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $keysArr);
        curl_setopt($ch, CURLOPT_URL, $url);
        $ret = curl_exec($ch);
        curl_close($ch);
        return $ret;
    }
}

?>
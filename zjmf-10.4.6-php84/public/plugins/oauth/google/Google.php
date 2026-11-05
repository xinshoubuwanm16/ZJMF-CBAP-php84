<?php
namespace oauth\google;

class Google extends \app\common\lib\Oauth
{
    public $info = ["name" => "Google", "title" => "Google", "description" => "Google", "author" => "idcsmart", "author_url" => "", "help_url" => "https://console.cloud.google.com/", "version" => "1.0.0", "logo_url" => "google.svg"];
    public function url($param)
    {
        $keysArr = ["client_id" => $param["client_id"], "redirect_uri" => $param["callback"], "access_type" => "offline", "response_type" => "code", "scope" => "profile email", "state" => $param["system_oauth_state"], "include_granted_scopes" => "true", "prompt" => "consent"];
        $login_url = "https://accounts.google.com/o/oauth2/v2/auth?" . http_build_query($keysArr);
        return $login_url;
    }
    public function callback($param)
    {
        if (!isset($param["code"]) || empty($param["code"])) {
            return $param["error"] ?? "error";
        }
        $access_token = $this->getAccessToken($param);
        if (empty($access_token)) {
            return "error";
        }
        $header = ["Authorization: Bearer " . $access_token];
        $res = curl("https://www.googleapis.com/oauth2/v2/userinfo", [], 30, "GET", $header);
        $res = json_decode($res["content"], true);
        if (!isset($res["id"]) || empty($res["id"])) {
            return "error";
        }
        $callback = ["openid" => $res["id"], "data" => ["username" => $res["name"] ?? $res["email"] ?? ""]];
        return $callback;
    }
    protected function getAccessToken($param)
    {
        $url = "https://www.googleapis.com/oauth2/v4/token";
        $data = ["code" => $param["code"], "client_id" => $param["client_id"], "client_secret" => $param["client_secret"], "redirect_uri" => $param["callback"], "grant_type" => "authorization_code"];
        $result = curl($url, $data, 15, "POST", ["Content-Type: application/x-www-form-urlencoded"]);
        $result = json_decode($result["content"] ?? "", true);
        $access_token = $result["access_token"] ?? "";
        return $access_token;
    }
}

?>
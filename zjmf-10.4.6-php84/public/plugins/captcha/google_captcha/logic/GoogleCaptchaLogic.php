<?php
namespace captcha\google_captcha\logic;

class GoogleCaptchaLogic
{
    public function describe($is_admin = false)
    {
        $config = (new \captcha\google_captcha\GoogleCaptcha())->Config();
        $siteKey = $config["site_key"] ?? "";
        if ($is_admin) {
            $html = "\r\n            <div id=\"g_recaptcha\"></div>\r\n            <script type=\"text/javascript\">\r\n                var verifyCallback = function(response) {\r\n                    var randstr = '@'+ Math.random().toString(36).substr(2);\r\n                    captchaCheckSuccsss(true,randstr,response);\r\n                };\r\n                var onloadCallback = function() {\r\n                    grecaptcha.render('g_recaptcha', {\r\n                        'sitekey' : '" . $siteKey . "',\r\n                        'callback' : verifyCallback,\r\n                    });\r\n                };\r\n            </script>\r\n            <script src=\"https://www.recaptcha.net/recaptcha/api.js?onload=onloadCallback&render=explicit\" async defer></script>";
        } else {
            $html = "\r\n            <style>\r\n                #g_recaptcha{\r\n                    position: fixed;\r\n                    top: 40%;\r\n                    left: 50%;\r\n                    z-index: 9999999999;\r\n                }\r\n            </style>\r\n            <div id=\"g_recaptcha\"></div>\r\n            <script type=\"text/javascript\">\r\n                var verifyCallback = function(response) {\r\n                    var randstr = '@'+ Math.random().toString(36).substr(2);\r\n                    captchaCheckSuccsss(true,randstr,response);\r\n                };\r\n                var onloadCallback = function() {\r\n                    grecaptcha.render('g_recaptcha', {\r\n                        'sitekey' : '" . $siteKey . "',\r\n                        'callback' : verifyCallback,\r\n                    });\r\n                };\r\n            </script>\r\n            <script src=\"https://www.recaptcha.net/recaptcha/api.js?onload=onloadCallback&render=explicit\" async defer></script>";
        }
        return $html;
    }
    public function verify($param)
    {
        try {
            $config = (new \captcha\google_captcha\GoogleCaptcha())->Config();
            $data = ["secret" => $config["secret_key"] ?? "", "response" => $param["token"] ?? "", "remoteip" => get_client_ip(0, true)];
            $res = curl("https://www.recaptcha.net/recaptcha/api/siteverify", $data, 30, "POST");
            file_put_contents(IDCSMART_ROOT . "/1.txt", json_encode($res));
            if ($res["http_code"] == 200) {
                $result = json_decode($res["content"], true);
            }
            if (isset($result["success"]) && $result["success"] === true) {
                return ["status" => 200, "msg" => "验证成功"];
            }
            return ["status" => 400, "msg" => $result["error-codes"][0] ?? "验证失败"];
        } catch (\Exception $e) {
            return ["status" => 400, "msg" => $e->getMessage()];
        }
    }
}

?>
<?php
namespace captcha\tencent_captcha\logic;

class TencentCaptchaLogic
{
    public function describe($is_admin = false)
    {
        $config = (new \captcha\tencent_captcha\TencentCaptcha())->Config();
        $captchaAppId = intval($config["captcha_app_id"] ?? 0);
        if ($is_admin) {
            $html = "\r\n            <style>\r\n                #CaptchaId:hover{\r\n                    background: #ECF3FE !important;\r\n                    color: #0052D9 !important;\r\n                }\r\n            </style>\r\n             <button style='width:400px;height:40px;\r\n             background: #E7E7E7;\r\n             border: 1px solid #DCDCDC;\r\n             border-radius: 3px;\r\n             cursor:pointer;\r\n             color: #000000;' id=\"CaptchaId\" type=\"button\">立即验证</button>\r\n\r\n             <button style='width:400px;height:40px;\r\n             border: 1px solid #DCDCDC;\r\n             border-radius: 3px;\r\n             cursor:pointer;\r\n             background: #BCEBDC;\r\n             color: #00A870;\r\n             display:none' id='CaptchaIdSuccess'>✔验证成功</button>\r\n\r\n             <script src=\"https://turing.captcha.qcloud.com/TCaptcha.js\"></script>\r\n             <script>\r\n\r\n    function callback(res) {\r\n        console.log('callback:', res);\r\n        if (res.ret === 0) {\r\n            var str = '【randstr】->【' + res.randstr + '】      【ticket】->【' + res.ticket + '】';\r\n            var ipt = document.createElement('input');\r\n            ipt.value = str;\r\n            document.body.appendChild(ipt);\r\n            ipt.select();\r\n            //document.execCommand(\"Copy\");\r\n            document.body.removeChild(ipt);\r\n            // 执行系统js\r\n            \$('#CaptchaId').hide()\r\n            \$('#CaptchaIdSuccess').show()\r\n            captchaCheckSuccsss(true,res.randstr,res.ticket);\r\n        }\r\n    }\r\n    // 定义验证码js加载错误处理函数\r\n    function loadErrorCallback() {\r\n      var appid = ''\r\n       // 生成容灾票据或自行做其它处理\r\n      var ticket = 'terror_1001_' + appid + Math.floor(new Date().getTime() / 1000);\r\n      callback({\r\n        ret: 0,\r\n        randstr: '@'+ Math.random().toString(36).substr(2),\r\n        ticket,\r\n        errorCode: 1001,\r\n        errorMessage: 'jsload_error',\r\n      });\r\n    }\r\n    document.getElementById('CaptchaId').onclick = function(){\r\n            try {\r\n                  // 生成一个验证码对象\r\n                  // CaptchaAppId：登录验证码控制台，从【验证管理】页面进行查看。如果未创建过验证，请先新建验证。注意：不可使用客户端类型为小程序的CaptchaAppId，会导致数据统计错误。\r\n                  //callback：定义的回调函数\r\n                  var captcha = new TencentCaptcha('" . $captchaAppId . "', callback, {});\r\n                  // 调用方法，显示验证码\r\n                  captcha.show();\r\n            } catch (error) {\r\n            // 加载异常，调用验证码js加载错误处理函数\r\n                  loadErrorCallback();\r\n            }\r\n        }\r\n</script>\r\n            ";
        } else {
            $html = "\r\n<script src=\"https://turing.captcha.qcloud.com/TCaptcha.js\"></script>\r\n<script>\r\n    const timer = setTimeout(()=>{createCaptcha()},500)\r\n\r\n    function callback(res) {\r\n        console.log('callback:', res);\r\n        if (res.ret === 0) {\r\n            var str = '【randstr】->【' + res.randstr + '】      【ticket】->【' + res.ticket + '】';\r\n            var ipt = document.createElement('input');\r\n            ipt.value = str;\r\n            document.body.appendChild(ipt);\r\n            ipt.select();\r\n           // document.execCommand(\"Copy\");\r\n            document.body.removeChild(ipt);\r\n            // 执行系统js\r\n            captchaCheckSuccsss(true,res.randstr,res.ticket)\r\n        }\r\n    }\r\n    // 定义验证码js加载错误处理函数\r\n    function loadErrorCallback() {\r\n      var appid = ''\r\n       // 生成容灾票据或自行做其它处理\r\n      var ticket = 'terror_1001_' + appid + Math.floor(new Date().getTime() / 1000);\r\n      callback({\r\n        ret: 0,\r\n        randstr: '@'+ Math.random().toString(36).substr(2),\r\n        ticket,\r\n        errorCode: 1001,\r\n        errorMessage: 'jsload_error',\r\n      });\r\n    }\r\n    function createCaptcha(){\r\n        try {\r\n                  clearInterval(timer)\r\n                  // 生成一个验证码对象\r\n                  // CaptchaAppId：登录验证码控制台，从【验证管理】页面进行查看。如果未创建过验证，请先新建验证。注意：不可使用客户端类型为小程序的CaptchaAppId，会导致数据统计错误。\r\n                  //callback：定义的回调函数\r\n                  var captcha = new TencentCaptcha('" . $captchaAppId . "', callback, {type:\"popup\"});\r\n                  // 调用方法，显示验证码\r\n                  captcha.show();\r\n            } catch (error) {\r\n            // 加载异常，调用验证码js加载错误处理函数\r\n                  loadErrorCallback();\r\n            }\r\n    }\r\n</script>";
        }
        return $html;
    }
    public function verify($param)
    {
        $config = (new \captcha\tencent_captcha\TencentCaptcha())->Config();
        $data = [
            "CaptchaType" => 9,
            "Ticket" => $param["token"] ?? "",
            "UserIp" => get_client_ip(0, true),
            "Randstr" => $param["captcha"] ?? "",
            "CaptchaAppId" => intval($config["captcha_app_id"] ?? 0),
            "AppSecretKey" => $config["app_secret_key"]
        ];
        $service = new TencentCaptchaService($config["secret_id"], $config["secret_key"]);
        $resultArray = $service->DescribeCaptchaResult($data);
        if (!$resultArray) {
            return ["status" => 400, "msg" => "请求失败"];
        }
        if (isset($resultArray["CaptchaCode"]) && $resultArray["CaptchaCode"] == 1) {
            return ["status" => 200, "msg" => "验证成功"];
        }
        if (isset($resultArray["Error"]["Message"])) {
            return ["status" => 400, "msg" => $resultArray["Error"]["Message"]];
        }
        return ["status" => 400, "msg" => $resultArray["CaptchaMsg"] ?? "验证失败"];
    }
}

?>
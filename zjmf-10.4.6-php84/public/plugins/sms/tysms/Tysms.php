<?php
namespace sms\tysms;

class Tysms extends \app\common\lib\Plugin
{
    public $info = ["name" => "Tysms", "title" => "通用短信宝式接口", "description" => "支持绝大多数的短信平台", "status" => 1, "author" => "wood17科技", "version" => "1.0.1", "help_url" => ""];
    public function install()
    {
        $smsTemplate = [];
        if (file_exists(__DIR__ . "/config/smsTemplate.php")) {
            $smsTemplate = (require __DIR__ . "/config/smsTemplate.php");
        }
        return $smsTemplate;
    }
    public function uninstall()
    {
        return true;
    }
    public function getCnTemplate($params)
    {
        $data["template"]["template_id"] = $params["template_id"];
        $data["status"] = "success";
        $data["template"]["template_status"] = 2;
        return $data;
    }
    public function createCnTemplate($params)
    {
        $data["template"]["template_id"] = time();
        $data["status"] = "success";
        $data["template"]["template_status"] = 2;
        return $data;
    }
    public function putCnTemplate($params)
    {
        $data["status"] = "success";
        $data["template"]["template_status"] = 2;
        return $data;
    }
    public function deleteCnTemplate($params)
    {
        $data["status"] = "success";
        return $data;
    }
    public function sendCnSms($params)
    {
        $content = $this->templateParam($params["content"], $params["templateParam"]);
        $param["content"] = $this->templateSign($params["config"]["sign"]) . $content;
        $param["mobile"] = trim($params["mobile"]);
        $resultTemplate = $this->APIHttpRequestCURL("cn", $param, $params["config"]);
        if ($resultTemplate["status"] == "success") {
            $data["status"] = "success";
            $data["content"] = $content;
        } else {
            $data["status"] = "error";
            $data["content"] = $content;
            $data["msg"] = $resultTemplate["msg"];
        }
        return $data;
    }
    public function getGlobalTemplate($params)
    {
        $data["template"]["template_id"] = $params["template_id"];
        $data["status"] = "success";
        $data["template"]["template_status"] = 2;
        return $data;
    }
    public function createGlobalTemplate($params)
    {
        $data["template"]["template_id"] = time();
        $data["status"] = "success";
        $data["template"]["template_status"] = 2;
        return $data;
    }
    public function putGlobalTemplate($params)
    {
        $data["status"] = "success";
        $data["template"]["template_status"] = 2;
        return $data;
    }
    public function deleteGlobalTemplate($params)
    {
        $data["status"] = "success";
        return $data;
    }
    public function sendGlobalSms($params)
    {
        $content = $this->templateParam($params["content"], $params["templateParam"]);
        $param["content"] = $this->templateSign($params["config"]["sign"]) . $content;
        $param["mobile"] = trim($params["mobile"]);
        $resultTemplate = $this->APIHttpRequestCURL("global", $param, $params["config"]);
        if ($resultTemplate["status"] == "success") {
            $data["status"] = "success";
            $data["content"] = $content;
        } else {
            $data["status"] = "error";
            $data["content"] = $content;
            $data["msg"] = $resultTemplate["msg"];
        }
        return $data;
    }
    private function APIHttpRequestCURL($sms_type, $params, $config)
    {
        if ($sms_type == "cn") {
            $url = $config["url"];
        } else {
            if ($sms_type == "global") {
                $url = $config["url"];
            }
        }
        $statusStr = ["短信发送成功", "18446744073709551615" => "参数不全", "18446744073709551614" => "服务器空间不支持,请确认支持curl或者fsocket，联系您的空间商解决或者更换空间！", "30" => "密码错误", "40" => "账号不存在", "41" => "余额不足", "42" => "帐户已过期", "43" => "IP地址限制", "50" => "内容含有敏感词", "51" => "手机号码不正确"];
        $user = $config["user"];
        $pass = md5($config["pass"]);
        $content = $params["content"];
        $phone = $params["mobile"];
        $sendurl = $url . "?u=" . $user . "&p=" . $pass . "&m=" . $phone . "&c=" . urlencode($content);
        $result = file_get_contents($sendurl);
        if ($result == "0") {
            return ["status" => "success", "msg" => $statusStr[$result]];
        }
        return ["status" => "error", "msg" => $statusStr[$result] . ". Code: " . $result];
    }
    private function templateParam($content, $templateParam)
    {
        foreach ($templateParam as $key => $para) {
            $content = str_replace("@var(" . $key . ")", $para, $content);
        }
        $content = preg_replace("/@var\\(.*?\\)/is", "", $content);
        return $content;
    }
    private function templateSign($sign)
    {
        $sign = str_replace("【", "", $sign);
        $sign = str_replace("】", "", $sign);
        $sign = "【" . $sign . "】";
        return $sign;
    }
}

?>
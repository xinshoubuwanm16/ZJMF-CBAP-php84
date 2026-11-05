<?php
namespace sms\puddingv10sms;

class Puddingv10sms extends \app\common\lib\Plugin
{
    public $info = ["name" => "Puddingv10sms", "title" => "布丁云短信v3业务v10版", "description" => "布丁云插件", "status" => 1, "author" => "布丁云", "version" => "3.10.7", "help_url" => "https://sms.idcbdy.cn/"];
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
        return ["status" => "success", "template" => ["template_id" => trim($params["template_id"]), "template_status" => 2]];
    }
    public function createCnTemplate($params)
    {
        return ["status" => "success", "template" => ["template_id" => uniqid(), "template_status" => 2]];
    }
    public function putCnTemplate($params)
    {
        return ["status" => "success", "template" => ["template_status" => 2]];
    }
    public function deleteCnTemplate($params)
    {
        return ["status" => "success"];
    }
    public function sendCnSms($params)
    {
        $content = $this->templateParam($params["content"], $params["templateParam"]);
        $param["channel"] = $params["config"]["channel"];
        $param["username"] = $params["config"]["username"];
        $param["key"] = md5($params["config"]["key"]);
        $param["phone"] = trim($params["mobile"]);
        $param["content"] = $this->templateSign($params["config"]["sign"]) . $content;
        $resultTemplate = $this->APIHttpRequestCURL($param);
        if ($resultTemplate["code"] == 1) {
            $data["status"] = "success";
            $data["content"] = $content;
        } else {
            $data["status"] = "error";
            $data["content"] = $content;
            $data["msg"] = $resultTemplate["msg"];
        }
        return $data;
    }
    private function APIHttpRequestCURL($param)
    {
        $url = "https://sms.idcbdy.cn/sendApi";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($param));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $output = curl_exec($ch);
        curl_close($ch);
        return json_decode($output, true);
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
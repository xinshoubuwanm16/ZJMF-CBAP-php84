<?php
namespace sms\aliyun;

class Aliyun extends \app\common\lib\Plugin
{
    public $info = ["name" => "Aliyun", "title" => "阿里云", "description" => "阿里云", "status" => 1, "author" => "智简魔方", "version" => "2.0.0", "help_url" => "https://www.aliyun.com/product/sms"];
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
        $param["TemplateCode"] = trim($params["template_id"]);
        $param["Action"] = "QuerySmsTemplate";
        $resultTemplate = $this->APIHttpRequestCURL("cn", $param, $params["config"], "POST");
        if ($resultTemplate["Code"] == "OK") {
            $data["status"] = "success";
            $data["template"]["template_id"] = $resultTemplate["TemplateCode"];
            if ($resultTemplate["TemplateStatus"] == 0) {
                $template_status = 1;
            } else {
                if ($resultTemplate["TemplateStatus"] == 1) {
                    $template_status = 2;
                } else {
                    if ($resultTemplate["TemplateStatus"] == 2) {
                        $template_status = 3;
                    }
                }
            }
            $data["template"]["template_status"] = $template_status;
            if ($resultTemplate["Reason"]) {
                $data["template"]["msg"] = $resultTemplate["Reason"];
            }
        } else {
            $data["status"] = "error";
            $data["msg"] = $resultTemplate["Message"];
        }
        return $data;
    }
    public function createCnTemplate($params)
    {
        if (strpos($params["content"], "验证码") !== false) {
            $TemplateType = 0;
        } else {
            $TemplateType = 1;
        }
        $param["TemplateType"] = $TemplateType;
        $param["TemplateName"] = trim($params["title"]);
        $param["TemplateContent"] = trim($params["content"]);
        $param["ProductUrl"] = trim($params["product_url"]);
        $param["Remark"] = trim($params["remark"]);
        $param["Action"] = "AddSmsTemplate";
        $resultTemplate = $this->APIHttpRequestCURL("cn", $param, $params["config"], "POST");
        if ($resultTemplate["Code"] == "OK") {
            $data["status"] = "success";
            $data["template"]["template_id"] = $resultTemplate["TemplateCode"];
            $data["template"]["template_status"] = 1;
        } else {
            $data["status"] = "error";
            if ($resultTemplate["Message"] == "创建工单错误") {
                $resultTemplate["Message"] = "每次提交审核一个模板，模板提交间隔建议您控制在30S以上。";
            }
            $data["msg"] = $resultTemplate["Message"];
        }
        return $data;
    }
    public function putCnTemplate($params)
    {
        if (strpos($params["content"], "验证码") !== false) {
            $TemplateType = 0;
        } else {
            $TemplateType = 1;
        }
        $param["TemplateType"] = $TemplateType;
        $param["TemplateCode"] = trim($params["template_id"]);
        $param["TemplateName"] = trim($params["title"]);
        $param["TemplateContent"] = trim($params["content"]);
        $param["ProductUrl"] = trim($params["product_url"]);
        $param["Remark"] = trim($params["remark"]);
        $param["Action"] = "ModifySmsTemplate";
        $resultTemplate = $this->APIHttpRequestCURL("cn", $param, $params["config"], "POST");
        if ($resultTemplate["Code"] == "OK") {
            $data["status"] = "success";
            $data["template"]["template_status"] = 1;
        } else {
            $data["status"] = "error";
            $data["msg"] = $resultTemplate["Message"];
        }
        return $data;
    }
    public function deleteCnTemplate($params)
    {
        $param["TemplateCode"] = trim($params["template_id"]);
        $param["Action"] = "DeleteSmsTemplate";
        $resultTemplate = $this->APIHttpRequestCURL("cn", $param, $params["config"], "POST");
        if ($resultTemplate["Code"] == "OK") {
            $data["status"] = "success";
        } else {
            $data["status"] = "error";
            $data["msg"] = $resultTemplate["Message"];
        }
        return $data;
    }
    public function sendCnSms($params)
    {
        $content = $this->templateParam($params["content"], $params["templateParam"]);
        $param["TemplateCode"] = trim($params["template_id"]);
        $param["PhoneNumbers"] = trim($params["mobile"]);
        $param["TemplateParam"] = $this->templateParamArray($params["content"], $params["templateParam"]);
        $param["Action"] = "SendSms";
        $resultTemplate = $this->APIHttpRequestCURL("cn", $param, $params["config"], "POST");
        if ($resultTemplate["Code"] == "OK") {
            $data["status"] = "success";
            $data["content"] = $content;
        } else {
            $data["status"] = "error";
            $data["content"] = $content;
            $data["msg"] = $resultTemplate["Message"];
        }
        return $data;
    }
    public function getGlobalTemplate($params)
    {
        $param["TemplateCode"] = trim($params["template_id"]);
        $param["Action"] = "QuerySmsTemplate";
        $resultTemplate = $this->APIHttpRequestCURL("cn", $param, $params["config"], "POST");
        if ($resultTemplate["Code"] == "OK") {
            $data["status"] = "success";
            $data["template"]["template_id"] = $resultTemplate["TemplateCode"];
            if ($resultTemplate["TemplateStatus"] == 0) {
                $template_status = 1;
            } else {
                if ($resultTemplate["TemplateStatus"] == 1) {
                    $template_status = 2;
                } else {
                    if ($resultTemplate["TemplateStatus"] == 2) {
                        $template_status = 3;
                    }
                }
            }
            $data["template"]["template_status"] = $template_status;
            if ($resultTemplate["Reason"]) {
                $data["template"]["msg"] = $resultTemplate["Reason"];
            }
        } else {
            $data["status"] = "error";
            $data["msg"] = $resultTemplate["Message"];
        }
        return $data;
    }
    public function createGlobalTemplate($params)
    {
        $param["TemplateType"] = 3;
        $param["TemplateName"] = trim($params["title"]);
        $param["TemplateContent"] = trim($params["content"]);
        $param["ProductUrl"] = trim($params["product_url"]);
        $param["Remark"] = trim($params["remark"]);
        $param["Action"] = "AddSmsTemplate";
        $resultTemplate = $this->APIHttpRequestCURL("cn", $param, $params["config"], "POST");
        if ($resultTemplate["Code"] == "OK") {
            $data["status"] = "success";
            $data["template"]["template_id"] = $resultTemplate["TemplateCode"];
            $data["template"]["template_status"] = 1;
        } else {
            $data["status"] = "error";
            if ($resultTemplate["Message"] == "创建工单错误") {
                $resultTemplate["Message"] = "每次提交审核一个模板，模板提交间隔建议您控制在30S以上。";
            }
            $data["msg"] = $resultTemplate["Message"];
        }
        return $data;
    }
    public function putGlobalTemplate($params)
    {
        $param["TemplateCode"] = trim($params["template_id"]);
        $param["TemplateType"] = 3;
        $param["TemplateName"] = trim($params["title"]);
        $param["TemplateContent"] = trim($params["content"]);
        $param["ProductUrl"] = trim($params["product_url"]);
        $param["Remark"] = trim($params["remark"]);
        $param["Action"] = "ModifySmsTemplate";
        $resultTemplate = $this->APIHttpRequestCURL("cn", $param, $params["config"], "POST");
        if ($resultTemplate["Code"] == "OK") {
            $data["status"] = "success";
            $data["template"]["template_status"] = 1;
        } else {
            $data["status"] = "error";
            $data["msg"] = $resultTemplate["Message"];
        }
        return $data;
    }
    public function deleteGlobalTemplate($params)
    {
        $param["TemplateCode"] = trim($params["template_id"]);
        $param["Action"] = "DeleteSmsTemplate";
        $resultTemplate = $this->APIHttpRequestCURL("cn", $param, $params["config"], "POST");
        if ($resultTemplate["Code"] == "OK") {
            $data["status"] = "success";
        } else {
            $data["status"] = "error";
            $data["msg"] = $resultTemplate["Message"];
        }
        return $data;
    }
    public function sendGlobalSms($params)
    {
        $content = $this->templateParam($params["content"], $params["templateParam"]);
        $params["mobile"] = str_replace("+", "", $params["mobile"]);
        $param["TemplateCode"] = trim($params["template_id"]);
        $param["PhoneNumbers"] = trim($params["mobile"]);
        $param["TemplateParam"] = $this->templateParamArray($params["content"], $params["templateParam"]);
        $param["Action"] = "SendSms";
        $resultTemplate = $this->APIHttpRequestCURL("cn", $param, $params["config"], "POST");
        if ($resultTemplate["Code"] == "OK") {
            $data["status"] = "success";
            $data["content"] = $content;
        } else {
            $data["status"] = "error";
            $data["content"] = $content;
            $data["msg"] = $resultTemplate["Message"];
        }
        return $data;
    }
    private function APIHttpRequestCURL($sms_type = "cn", $params = [], $config = [], $method = "POST")
    {
        $url = "https://dysmsapi.aliyuncs.com/";
        if ($sms_type != "cn") {
            if ($sms_type == "global") {
            }
        }
        $params["SignName"] = $config["SignName"];
        $fixedParams = ["Format" => "json", "RegionId" => "cn-hangzhou", "SignatureMethod" => "HMAC-SHA1", "SignatureNonce" => uniqid(mt_rand(0, 65535), true), "SignatureVersion" => "1.0", "Timestamp" => gmdate("Y-m-d\\TH:i:s\\Z"), "Version" => "2017-05-25", "AccessKeyId" => $config["AccessKeyId"]];
        $apiParams = array_merge($fixedParams, $params);
        ksort($apiParams);
        $sortedQueryStringTmp = "";
        foreach ($apiParams as $key => $value) {
            $sortedQueryStringTmp .= "&" . $this->encode($key) . "=" . $this->encode($value);
        }
        $stringToSign = $method . "&%2F&" . $this->encode(substr($sortedQueryStringTmp, 1));
        $sign = base64_encode(hash_hmac("sha1", $stringToSign, $config["AccessKeySecret"] . "&", true));
        $signature = $this->encode($sign);
        $body = "Signature=" . $signature . $sortedQueryStringTmp;
        try {
            $ch = curl_init();
            if ($method == "POST") {
                curl_setopt($ch, CURLOPT_POST, 1);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
            } else {
                $url .= "?" . $body;
            }
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-sdk-client" => "php/2.0.0"]);
            if (substr($url, 0, 5) == "https") {
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            }
            $result = curl_exec($ch);
            if ($result === false) {
                return false;
            }
            curl_close($ch);
            return json_decode($result, true);
        } catch (\Exception $e) {
            return false;
        }
    }
    private function encode($str)
    {
        $res = urlencode($str);
        $res = preg_replace("/\\+/", "%20", $res);
        $res = preg_replace("/\\*/", "%2A", $res);
        $res = preg_replace("/%7E/", "~", $res);
        return $res;
    }
    private function templateParam($content, $templateParam)
    {
        foreach ($templateParam as $key => $para) {
            $content = str_replace("\${" . $key . "}", $para, $content);
        }
        $content = preg_replace("/\\\$\\{.*?\\}/is", "", $content);
        return $content;
    }
    private function templateParamArray($content, $templateParam)
    {
        $params = [];
        foreach ($templateParam as $key => $val) {
            if (strpos($content, "\${" . $key . "}") !== false) {
                $params[$key] = $val;
            }
        }
        if (!empty($params) && is_array($params)) {
            $params = json_encode($params, JSON_UNESCAPED_UNICODE);
        }
        return $params;
    }
}

?>
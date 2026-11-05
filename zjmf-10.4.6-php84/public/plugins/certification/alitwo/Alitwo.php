<?php
namespace certification\alitwo;

class Alitwo extends \app\common\lib\Plugin
{
    public $info = ["name" => "Alitwo", "title" => "阿里云身份证二要素", "description" => "阿里云身份证二要素", "status" => 1, "author" => "智简魔方", "version" => "1.0.1", "help_url" => "https://market.aliyun.com/products/57000002/cmapi022049.html"];
    public function install()
    {
        return true;
    }
    public function uninstall()
    {
        return true;
    }
    public function AlitwoPerson($certifi)
    {
        $logic = new logic\AlitwoLogic();
        $result = $logic->alitwoHttp($certifi["card"], $certifi["name"]);
        $data = ["status" => 2, "auth_fail" => "", "certify_id" => $result["body"]["traceId"] ?? "", "notes" => "", "client_id" => get_client_id()];
        if ($result["status"] == 200) {
            if ($result["body"]["status"] == "01") {
                $data["status"] = 1;
            }
            $data["auth_fail"] = $result["body"]["msg"] ?? "";
        } else {
            $data["auth_fail"] = $result["msg"] ?: "实名认证接口配置错误,请联系管理员";
        }
        hook("update_certification_person", $data);
        return "<h3 class=\"pt-2 font-weight-bold h2 py-4\"><img src=\"\" alt=\"\"> 正在认证,请稍等...<p style=\"font-size: 13px;color: red;margin-top: 16px;font-weight: normal;\">请勿刷新或关闭该页面，否则可能会导致认证异常或认证失败！</p></h3>";
    }
    public function AlitwoCompany($certifi)
    {
        $logic = new logic\AlitwoLogic();
        $result = $logic->alitwoHttp($certifi["card"], $certifi["name"]);
        $data = ["status" => 2, "auth_fail" => "", "certify_id" => $result["body"]["traceId"] ?? "", "notes" => "", "client_id" => get_client_id()];
        if ($result["status"] == 200) {
            if ($result["body"]["status"] == "01") {
                $data["status"] = 1;
            }
            $data["auth_fail"] = $result["body"]["msg"] ?? "";
        } else {
            $data["auth_fail"] = $result["msg"] ?: "实名认证接口配置错误,请联系管理员";
        }
        hook("update_certification_company", $data);
        return "<h3 class=\"pt-2 font-weight-bold h2 py-4\"><img src=\"\" alt=\"\"> 正在认证,请稍等...<p style=\"font-size: 13px;color: red;margin-top: 16px;font-weight: normal;\">请勿刷新或关闭该页面，否则可能会导致认证异常或认证失败！</p></h3>";
    }
    public function AlitwoCollectionInfo($type)
    {
        if ($type == "person") {
            $data = [];
        } else {
            if ($type == "company") {
                $data = ["name" => ["title" => "姓名", "type" => "text", "value" => "", "tip" => "", "required" => true], "card" => ["title" => "身份证号码", "type" => "text", "value" => "", "tip" => "", "required" => true]];
            } else {
                $data = [];
            }
        }
        return $data;
    }
    public function getStatus($certifi)
    {
        return true;
    }
}

?>
<?php
namespace certification\phonethree;

class Phonethree extends \app\common\lib\Plugin
{
    public $info = ["name" => "Phonethree", "title" => "手机三要素", "description" => "手机三要素", "status" => 1, "author" => "智简魔方", "version" => "1.0.2", "help_url" => "https://market.aliyun.com/products/57000002/cmapi031847.html"];
    public function install()
    {
        return true;
    }
    public function uninstall()
    {
        return true;
    }
    public function PhonethreePerson($certifi)
    {
        if (file_exists(__DIR__ . "/config/config.php")) {
            $con = (require __DIR__ . "/config/config.php");
        } else {
            $con = [];
        }
        $param = ["idcard" => $certifi["card"], "phone" => $certifi["phone"] ?? "", "realname" => $certifi["name"]];
        $config = $this->getConfig();
        $_config = array_merge($con, $config);
        $logic = new logic\PhonethreeLogic();
        $query = $logic->createLinkstrings($param);
        $appcode = $_config["app_code"];
        $result = $logic->httpsPhoneThree($appcode, $query, $_config["phonethree_url"]);
        $data = ["status" => 2, "auth_fail" => "", "certify_id" => $result["ordersign"] ?? "", "notes" => "", "client_id" => get_client_id()];
        if ($result["code"] == 200) {
            $data["status"] = 1;
            $data["auth_fail"] = $result["msg"] ?? "";
        } else {
            $data["auth_fail"] = $result["msg"] ?? "实名认证接口配置错误,请联系管理员";
        }
        hook("update_certification_person", $data);
        return "<h3 class=\"pt-2 font-weight-bold h2 py-4\"><img src=\"\" alt=\"\"> 正在认证,请稍等...<p style=\"font-size: 13px;color: red;margin-top: 16px;font-weight: normal;\">请勿刷新或关闭该页面，否则可能会导致认证异常或认证失败！</p></h3>";
    }
    public function PhonethreeCompany($certifi)
    {
        if (file_exists(__DIR__ . "/config/config.php")) {
            $con = (require __DIR__ . "/config/config.php");
        } else {
            $con = [];
        }
        $param = ["idcard" => $certifi["card"], "phone" => $certifi["phone"] ?? "", "realname" => $certifi["name"]];
        $config = $this->getConfig();
        $_config = array_merge($con, $config);
        $logic = new logic\PhonethreeLogic();
        $query = $logic->createLinkstrings($param);
        $appcode = $_config["app_code"];
        $result = $logic->httpsPhoneThree($appcode, $query, $_config["phonethree_url"]);
        $data = ["status" => 2, "auth_fail" => "", "certify_id" => $result["ordersign"] ?? "", "notes" => "", "client_id" => get_client_id()];
        if ($result["code"] == 200) {
            $data["status"] = 1;
            $data["auth_fail"] = $result["msg"] ?? "";
        } else {
            $data["auth_fail"] = $result["msg"] ?? "实名认证接口配置错误,请联系管理员";
        }
        hook("update_certification_company", $data);
        return "<h3 class=\"pt-2 font-weight-bold h2 py-4\"><img src=\"\" alt=\"\"> 正在认证,请稍等...<p style=\"font-size: 13px;color: red;margin-top: 16px;font-weight: normal;\">请勿刷新或关闭该页面，否则可能会导致认证异常或认证失败！</p></h3>";
    }
    public function PhonethreeCollectionInfo($type)
    {
        $data = [];
        return $data;
    }
    public function getStatus($certifi)
    {
        return true;
    }
}

?>
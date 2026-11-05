<?php
namespace certification\yerzt;

class Yerzt extends \app\common\lib\Plugin
{
    /**
     * 插件标识
     * @var string
     */
    public $info = ["name" => "Yerzt", "title" => "E证通人脸认证", "description" => "E证通人脸认证", "status" => 1, "author" => "云外科技", "version" => "1.2", "help_url" => "https://cloud.tencent.com/product/faceid"];
    public function install()
    {
        return true;
    }
    public function uninstall()
    {
        return true;
    }
    public function YerztPerson($certifi)
    {
        if ($certifi["card_type"] == 1) {
            $cert_type = "IDENTITY_CARD";
        } else {
            if ($certifi["card_type"] == 2) {
                $cert_type = "HOME_VISIT_PERMIT_HK_MC";
            } else {
                if ($certifi["card_type"] == 3) {
                    $cert_type = "HOME_VISIT_PERMIT_TAIWAN";
                } else {
                    if ($certifi["card_type"] == 4) {
                        $cert_type = "RESIDENCE_PERMIT_HK_MC";
                    } else {
                        if ($certifi["card_type"] == 5) {
                            $cert_type = "RESIDENCE_PERMIT_TAIWAN";
                        } else {
                            return "<h3 class=\"pt-2 font-weight-bold h2 py-4\"><img src=\"\" alt=\"\">接口不支持该认证类型</h3>";
                        }
                    }
                }
            }
        }
        $Plugin = \think\facade\Db::name("Plugin")->where("name", "=", "Yerzt")->find();
        $config = json_decode($Plugin["config"], true);
        $params = ["IdCard" => $certifi["card"], "Name" => $certifi["name"], "MerchantId" => $config["MerchantId"], "RedirectUrl" => $config["url"], "Config" => ["InputType" => $config["InputType"]]];
        $SecretId = $config["SecretId"];
        $SecretKey = $config["SecretKey"];
        $faceAuth = new logic\YerzFaceAuth($SecretId, $SecretKey);
        $resp = $faceAuth->Eauth($params);
        $resps = json_decode($resp["data"], true);
        $certifyUrl = htmlspecialchars_decode($resps["Url"]);
        $data = ["status" => 4, "auth_fail" => "", "certify_id" => "", "notes" => "", "refresh" => 0];
        $clientId = get_client_id();
        if ($resps["EidToken"]) {
            $certify_id = $resps["EidToken"];
            $data["certify_id"] = $certify_id;
            $time = date("Y-m-d H:i:s", time());
            $data["notes"] = "认证记录号:" . $certify_id . ";\r\n" . "实名认证方式:" . $this->info["title"] . ";\r\n" . "实名认证接口提交时间:" . $time . "\r\n";
            $response = QRcode::png($certifyUrl, false, 0, 4, 5, false);
            $base64 = "data:png;base64," . base64_encode($response->getData());
            $data["client_id"] = $clientId;
            hook("update_certification_person", $data);
            $CertificationLogModel = new \addon\idcsmart_certification\model\CertificationLogModel();
            $log = $CertificationLogModel->where("client_id", $clientId)->where("type", 1)->order("id", "desc")->find();
            $ClientModel = new \app\common\model\ClientModel();
            $client = $ClientModel->find($clientId);
            $html = "\n            <div class='thirdBox-left'>\n            <div class='left-box1'>\n            <p>\n                <span class='left-title'>用户名：</span>\n                <span>" . $client["username"] . "</span>\n            </p>\n            <p>\n                <span class='left-title'>认证姓名：</span>\n                <span>" . $log["card_name"] . "</span>\n            </p>\n            <p>\n                <span class='left-title'>认证号码：</span>\n                <span>" . $log["card_number"] . "</span>\n            </p>\n            </div>\n            <div id='contentBox'>\n                <img height='200' width='200' src=\"" . $base64 . "\" alt=\"\">\n            </div>\n            <div class='left-box2'>\n                <div class='sao-icon-box'>\n                    <img src='/plugins/addon/idcsmart_certification/template/clientarea/img/account/sao-icon.png' alt=''>\n                </div>\n                <div class='sao-text'>\n                    <p>打开手机微信</p>\n                    <p>扫一扫继续认证</p>\n                </div>\n            </div>\n        </div>\n        <div class='thirdBox-right'>\n        <img src='/plugins/addon/idcsmart_certification/template/clientarea/img/account/zfb-img.png' alt=''>\n        </div>\n            <script src='https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js'></script>\n            <script>\n                var timer = null\n                var captchaTimer = setTimeout(() => { onLoad() }, 500)\n                function getYwkjStatus() {\n                    \$.ajax({\n                        url:'/certification/yerzt/index/status?certify_id=" . $certify_id . "&type=person&client_id=" . $clientId . "',\n                        success:function(result) {\n                          if(result.code === 1){\n                            clearInterval(timer)\n                            timer = null\n                          }\n                        }\n                    })\n                }\n                function onLoad() {\n                    timer = setInterval(() => {\n                        getYwkjStatus()\n                    }, 2000)\n                }\n            </script>\n            ";
            return $html;
        }
        $data["auth_fail"] = $resp["msg"] ?: "实名认证接口配置错误,请联系管理员";
        return "<h3 class=\"pt-2 font-weight-bold h2 py-4\"><img src=\"\" alt=\"\">" . $data["auth_fail"] . "</h3>";
    }
    public function YerztCompany($certifi)
    {
        if ($certifi["card_type"] == 1) {
            $cert_type = "IDENTITY_CARD";
        } else {
            if ($certifi["card_type"] == 2) {
                $cert_type = "HOME_VISIT_PERMIT_HK_MC";
            } else {
                if ($certifi["card_type"] == 3) {
                    $cert_type = "HOME_VISIT_PERMIT_TAIWAN";
                } else {
                    if ($certifi["card_type"] == 4) {
                        $cert_type = "RESIDENCE_PERMIT_HK_MC";
                    } else {
                        if ($certifi["card_type"] == 5) {
                            $cert_type = "RESIDENCE_PERMIT_TAIWAN";
                        } else {
                            return "<h3 class=\"pt-2 font-weight-bold h2 py-4\"><img src=\"\" alt=\"\">接口不支持该认证类型</h3>";
                        }
                    }
                }
            }
        }
        $Plugin = \think\facade\Db::name("Plugin")->where("name", "=", "Yerzt")->find();
        $config = json_decode($Plugin["config"], true);
        $params = ["IdCard" => $certifi["card"], "Name" => $certifi["name"], "MerchantId" => $config["MerchantId"], "RedirectUrl" => $config["url"], "Config" => ["InputType" => $config["InputType"]]];
        $SecretId = $config["SecretId"];
        $SecretKey = $config["SecretKey"];
        $faceAuth = new logic\YerzFaceAuth($SecretId, $SecretKey);
        $resp = $faceAuth->Eauth($params);
        $resps = json_decode($resp["data"], true);
        $certifyUrl = htmlspecialchars_decode($resps["Url"]);
        $data = ["status" => 4, "auth_fail" => "", "certify_id" => "", "notes" => "", "refresh" => 0];
        $clientId = get_client_id();
        if ($resps["EidToken"]) {
            $certify_id = $resps["EidToken"];
            $data["certify_id"] = $certify_id;
            $time = date("Y-m-d H:i:s", time());
            $data["notes"] = "认证记录号:" . $certify_id . ";\r\n" . "实名认证方式:" . $this->info["title"] . ";\r\n" . "实名认证接口提交时间:" . $time . "\r\n";
            $response = QRcode::png($certifyUrl, false, 0, 4, 5, false);
            $base64 = "data:png;base64," . base64_encode($response->getData());
            $data["client_id"] = $clientId;
            hook("update_certification_company", $data);
            $CertificationLogModel = new \addon\idcsmart_certification\model\CertificationLogModel();
            $log = $CertificationLogModel->where("client_id", $clientId)->where("type", 1)->order("id", "desc")->find();
            $ClientModel = new \app\common\model\ClientModel();
            $client = $ClientModel->find($clientId);
            $html = "\n            <div class='thirdBox-left'>\n            <div class='left-box1'>\n           <p>\n                <span class='left-title'>认证企业：</span>\n                <span>" . $log["company"] . "</span>\n            </p>\n            <p>\n                <span class='left-title'>企业信用代码：</span>\n                <span>" . $log["company_organ_code"] . "</span>\n            </p>\n            </div>\n            <div id='contentBox'>\n                <img height='200' width='200' src=\"" . $base64 . "\" alt=\"\">\n            </div>\n            <div class='left-box2'>\n                <div class='sao-icon-box'>\n                    <img src='/plugins/addon/idcsmart_certification/template/clientarea/img/account/sao-icon.png' alt=''>\n                </div>\n                <div class='sao-text'>\n                    <p>打开手机微信</p>\n                    <p>扫一扫继续认证</p>\n                </div>\n            </div>\n        </div>\n        <div class='thirdBox-right'>\n        <img src='/plugins/addon/idcsmart_certification/template/clientarea/img/account/zfb-img.png' alt=''>\n        </div>\n            <script src='https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js'></script>\n            <script>\n                var timer = null\n                var captchaTimer = setTimeout(() => { onLoad() }, 500)\n                function getYwkjStatus() {\n                    \$.ajax({\n                        url:'/certification/yerzt/index/status?certify_id=" . $certify_id . "&type=person&client_id=" . $clientId . "',\n                        success:function(result) {\n                          if(result.code === 1){\n                            clearInterval(timer)\n                            timer = null\n                          }\n                        }\n                    })\n                }\n                function onLoad() {\n                    timer = setInterval(() => {\n                        getYwkjStatus()\n                    }, 2000)\n                }\n            </script>\n            ";
            return $html;
        }
        $data["auth_fail"] = $resp["msg"] ?: "实名认证接口配置错误,请联系管理员";
        return "<h3 class=\"pt-2 font-weight-bold h2 py-4\"><img src=\"\" alt=\"\">" . $data["auth_fail"] . "</h3>";
    }
    public function YerztCollectionInfo($type)
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
    public function Config()
    {
        $config = \think\facade\Db::name("plugin")->where("name", $this->info["name"])->value("config");
        if (!empty($config) && $config != "null") {
            $config = json_decode($config, true);
        } else {
            $config = [];
        }
        $con = (require dirname(__DIR__) . "/yerzt/config/config.php");
        $config = array_merge($con, $config);
        return $config;
    }
    public function getStatus($certifi)
    {
        $Plugin = \think\facade\Db::name("Plugin")->where("name", "=", "Yerzt")->find();
        $config = json_decode($Plugin["config"], true);
        $SecretId = $config["SecretId"];
        $SecretKey = $config["SecretKey"];
        $faceAuth = new logic\YerzFaceAuth($SecretId, $SecretKey);
        $checkdata = ["EidToken" => $certifi["certify_id"]];
        $check = $faceAuth->Echeck($checkdata);
        $checks = json_decode($check["data"], true);
        if ($checks["Status"] == "timeout") {
            return ["status" => 2, "msg" => "本次验证超时，请重新发起验证"];
        }
        $params = ["InfoType" => "0", "EidToken" => $certifi["certify_id"]];
        $res = $faceAuth->Every($params);
        return $res;
    }
}

?>
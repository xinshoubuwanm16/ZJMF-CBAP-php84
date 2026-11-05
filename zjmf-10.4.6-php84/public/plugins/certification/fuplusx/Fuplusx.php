<?php
namespace certification\fuplusx;

class Fuplusx extends \app\common\lib\Plugin
{
    public $info = ["name" => "Fuplusx", "title" => "涪擎实名认证（高级版）", "description" => "涪擎实名认证（高级版）支持选择手机实名认证，银行卡实名认证", "status" => 1, "author" => "WWW.YUNBUYUN.COM", "version" => "1.0.0", "help_url" => "https://market.aliyun.com/products/57000002/cmapi028323.html"];
    public function install()
    {
        return true;
    }
    public function uninstall()
    {
        return true;
    }
    public function FuplusxPerson($certifi)
    {
        if (file_exists(__DIR__ . "/config/config.php")) {
            $con = (require __DIR__ . "/config/config.php");
        } else {
            $con = [];
        }
        $config = $this->getConfig();
        $_config = array_merge($con, $config);
        if ($certifi["card_type"] == 1) {
            $cert_type = "IDENTITY_CARD";
            $type = $_config["type"];
            if ($type == 2) {
                $param = ["idCard" => $certifi["card"], "name" => urlencode($certifi["name"])];
            } else {
                if ($type == 3) {
                    $param = ["idCard" => $certifi["card"], "accountNo" => $certifi["bank"], "name" => urlencode($certifi["name"])];
                } else {
                    if ($type == 4) {
                        $param = ["idCard" => $certifi["card"], "mobile" => $certifi["phone"], "name" => urlencode($certifi["name"])];
                    } else {
                        $param = ["idCard" => $certifi["card"], "accountNo" => $certifi["bank"], "mobile" => $certifi["phone"], "name" => urlencode($certifi["name"])];
                    }
                }
            }
            $types = $_config["type"];
            if ($type == 2) {
                $types = "/IDCard";
            } else {
                if ($type == 3) {
                    $types = "/bankCheck";
                } else {
                    if ($type == 4) {
                        $types = "/phoneCheck";
                    } else {
                        $types = "/bankCheck4";
                    }
                }
            }
            $logic = new logic\FuplusxLogic();
            $query = $logic->createLinkstrings($param);
            $appcode = $_config["app_code"];
            $host = $_config["fuplusx_url"];
            $result = $logic->httpsFuplusx($appcode, $query, $host, $types);
            if ($result["status"] == 200) {
                if ($result["body"]["status"] == "01") {
                    $data["auth_fail"] = $result["body"]["msg"];
                    $data["status"] = 1;
                    $data["certify_id"] = $result["body"]["traceId"];
                    $data["client_id"] = $clientId;
                    $data["notes"] = "请求唯一码:" . $result["body"]["traceId"] . ";\r\n" . "实名认证方式:" . $this->info["title"] . ";\r\n";
                    hook("update_certification_person", $data);
                    $CertificationLogModel = new \addon\idcsmart_certification\model\CertificationLogModel();
                    $log = $CertificationLogModel->where("client_id", $clientId)->where("type", 1)->order("id", "desc")->find();
                    $ClientModel = new \app\common\model\ClientModel();
                    $client = $ClientModel->find($clientId);
                    return "\n              <div class=\"personl-ing\" v-else-if=\"userStatus === 10\">\n                <div class=\"status-img-box\">\n                  <img src=\"/plugins/addon/idcsmart_certification/template/clientarea/img/account/success.png\" alt=\"\">\n                </div>\n                <h3 class=\"title-green\">恭喜您，实名认证成功</h3>\n                <table class=\"table-box mar-top-42\" rules=\"all\">\n                  <tr>\n                    <td>用户ID: " . $log["client_id"] . "</td>\n                    <td>用户名: " . $client["username"] . "</td>\n                  </tr>\n                  <tr>\n                    <td>真实姓名: " . $log["card_name"] . "</td>\n                    <td>证件号码: " . $log["card_number"] . "</td>\n                  </tr>\n                </table>\n                <div class=\"updata-btn mar-top-114\">\n                  <el-button @click=\"backTicket\">请求唯一码：" . $log["certify_id"] . "</el-button>\n                </div>\n              </div>\n                \n                ";
                }
                $data["auth_fail"] = $result["body"]["msg"] ?: "";
                return "\n            \n              <div class=\"personl-ing\" v-else-if=\"userStatus === 50\">\n                <div class=\"status-img-box\">\n                  <img src=\"/plugins/addon/idcsmart_certification/template/clientarea/img/account/error.png\" alt=\"\">\n                </div>\n                <h3 class=\"status-title black-color\">实名认证失败</h3>\n                <p class=\"status-tips\">实名认证未通过</p>\n                <div class=\"btn-box\">\n                  <el-button @click=\"submitAgan\">失败原因：" . $data["auth_fail"] . "</el-button>\n                  \n                </div>\n              </div>\n              \n            ";
            }
            $data["auth_fail"] = $result["msg"] ?: "实名认证接口配置错误,请联系管理员";
            return "<h3 class=\"pt-2 font-weight-bold h2 py-4\"><img src=\"\" alt=\"\">" . $data["auth_fail"] . "</h3>";
        }
        return "\n              <div class=\"personl-ing\" v-else-if=\"userStatus === 50\">\n                <div class=\"status-img-box\">\n                  <img src=\"/plugins/addon/idcsmart_certification/template/clientarea/img/account/error.png\" alt=\"\">\n                </div>\n                <h3 class=\"status-title black-color\">实名认证失败</h3>\n                <p class=\"status-tips\">不支持该证件类型认证，仅支持大陆身份证</p>\n                \n              </div>\n              \n            ";
    }
    public function FuplusxCollectionInfo()
    {
        $config = $this->getConfig();
        $type = $config["type"];
        if ($type == 3) {
            $data = ["bank" => ["title" => "银行卡号", "type" => "text", "value" => "", "tip" => "请输入银行卡号", "required" => true]];
        } else {
            if ($type == 5) {
                $data = ["bank" => ["title" => "银行卡号", "type" => "text", "value" => "", "tip" => "请输入银行卡号", "required" => true], "phone" => ["title" => "手机号", "type" => "text", "value" => "", "tip" => "请输入手机号", "required" => true]];
            } else {
                $data = [];
            }
        }
        return $data;
    }
    public function Fuplusxidcsmartauthorize()
    {
    }
}

?>
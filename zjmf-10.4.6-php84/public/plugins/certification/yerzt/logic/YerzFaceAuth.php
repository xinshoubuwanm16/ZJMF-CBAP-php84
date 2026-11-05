<?php
namespace certification\yerzt\logic;

require __DIR__ . "/vendor/autoload.php";
class YerzFaceAuth
{
    public $secretId;
    public $secretKey;
    public $_config;
    public function __construct()
    {
        $Plugin = \think\facade\Db::name("Plugin")->where("name", "=", "Yerzt")->find();
        $config = json_decode($Plugin["config"], true);
        $SecretId = $config["SecretId"];
        $SecretKey = $config["SecretKey"];
        $this->secretId = $SecretId;
        $this->secretKey = $SecretKey;
    }
    public function Eauth($params)
    {
        try {
            $cred = new \TencentCloud\Common\Credential($this->secretId, $this->secretKey);
            $httpProfile = new \TencentCloud\Common\Profile\HttpProfile();
            $httpProfile->setEndpoint("faceid.tencentcloudapi.com");
            $clientProfile = new \TencentCloud\Common\Profile\ClientProfile();
            $clientProfile->setHttpProfile($httpProfile);
            $client = new \TencentCloud\Faceid\V20180301\FaceidClient($cred, "", $clientProfile);
            $req = new \TencentCloud\Faceid\V20180301\Models\GetEidTokenRequest();
            $req->fromJsonString(json_encode($params));
            $resp = $client->GetEidToken($req);
            return ["code" => 1, "msg" => "success", "data" => $resp->toJsonString()];
        } catch (\TencentCloud\Common\Exception\TencentCloudSDKException $e) {
            return ["code" => 0, "msg" => $e->getMessage(), "data" => ""];
        }
    }
    public function Every($params)
    {
        try {
            $cred = new \TencentCloud\Common\Credential($this->secretId, $this->secretKey);
            $httpProfile = new \TencentCloud\Common\Profile\HttpProfile();
            $httpProfile->setEndpoint("faceid.tencentcloudapi.com");
            $clientProfile = new \TencentCloud\Common\Profile\ClientProfile();
            $clientProfile->setHttpProfile($httpProfile);
            $client = new \TencentCloud\Faceid\V20180301\FaceidClient($cred, "", $clientProfile);
            $req = new \TencentCloud\Faceid\V20180301\Models\GetEidResultRequest();
            $req->fromJsonString(json_encode($params));
            $resp = $client->GetEidResult($req);
            $data = $resp->toJsonString();
            $resps = json_decode($data, true);
            $resultCode = $resps["Text"];
            $status = 4;
            if (!empty($resultCode)) {
                $passed = $resps["Text"]["ErrCode"];
                if ($passed === 0) {
                    $status = 1;
                    $msg = "认证" . $resps["Text"]["LiveMsg"];
                } else {
                    $msg = "认证尚未通过";
                    $status = 2;
                }
            } else {
                $msg = $resps["Text"]["ErrMsg"];
                $status = 2;
            }
            $type = $params["type"];
            $client_id = $params["client_id"];
            if ($type == "person") {
                $data = ["client_id" => $client_id, "status" => $status, "auth_fail" => $msg ?? ""];
                hook("update_certification_person", $data);
            } else {
                $data = ["client_id" => $client_id, "status" => $status, "auth_fail" => $msg ?? ""];
                hook("update_certification_company", $data);
            }
            return ["status" => $status, "msg" => $msg, "code" => $status];
        } catch (\TencentCloud\Common\Exception\TencentCloudSDKException $e) {
            return ["status" => 2, "msg" => $e->getMessage()];
        }
    }
    public function Echeck($checkdata)
    {
        try {
            $cred = new \TencentCloud\Common\Credential($this->secretId, $this->secretKey);
            $httpProfile = new \TencentCloud\Common\Profile\HttpProfile();
            $httpProfile->setEndpoint("faceid.tencentcloudapi.com");
            $clientProfile = new \TencentCloud\Common\Profile\ClientProfile();
            $clientProfile->setHttpProfile($httpProfile);
            $client = new \TencentCloud\Faceid\V20180301\FaceidClient($cred, "", $clientProfile);
            $req = new \TencentCloud\Faceid\V20180301\Models\CheckEidTokenStatusRequest();
            $req->fromJsonString(json_encode($checkdata));
            $resp = $client->CheckEidTokenStatus($req);
            return ["code" => 1, "msg" => "success", "data" => $resp->toJsonString()];
        } catch (\TencentCloud\Common\Exception\TencentCloudSDKException $e) {
            return ["status" => 2, "msg" => $e->getMessage()];
        }
    }
}

?>
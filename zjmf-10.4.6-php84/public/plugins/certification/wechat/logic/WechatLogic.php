<?php
namespace certification\wechat\logic;

class WechatLogic
{
    private $aop;
    public $_config;
    public function __construct()
    {
        $config = (new \certification\wechat\Wechat())->Config();
        $this->_config = $config;
    }
    public function getDetectAuth($realname, $idcard)
    {
        $qcloud = new QcloudFaceid($this->_config["SecretId"], $this->_config["SecretKey"], $this->_config["RuleId"]);
        $result = $qcloud->GetRealNameAuthToken($realname, $idcard, "");
        if(!$result){
            return ["status" => 400, "msg" => "请求失败"];
        }elseif(isset($result['BizToken'])){
            return ["status" => 200, "data" => $result];
        }else{
            return ["status" => 400, "msg" => $result['Error']['Message']];
        }
    }
    public function getWechatAuthStatus($certify_id, $type = "person", $client_id = 0)
    {
        $qcloud = new QcloudFaceid($this->_config["SecretId"], $this->_config["SecretKey"], $this->_config["RuleId"]);
        $result = $qcloud->GetRealNameAuthResult($certify_id);
        if(!$result){
            $status = 2;
            $errorMsg = "请求失败";
        }elseif(isset($result['Text'])){
            if(isset($result['Text']['ErrCode']) && $result['Text']['ErrCode'] == 0){
                $status = 1;
            }else{
                $status = 2;
                $errorMsg = $result["Text"]["ErrMsg"] ?? "未认证";
            }
        }else{
            $errorMsg = $result["Error"]["Message"];
            $status = 2;
        }

        if ($type == "person") {
            $data = ["client_id" => $client_id, "status" => $status, "auth_fail" => $errorMsg ?? 0];
            hook("update_certification_person", $data);
        } else {
            $data = ["client_id" => $client_id, "status" => $status, "auth_fail" => $errorMsg ?? ""];
            hook("update_certification_company", $data);
        }
        return ["status" => 200, "msg" => "请求成功", "code" => $status];
    }
}

?>
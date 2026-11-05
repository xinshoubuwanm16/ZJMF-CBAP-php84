<?php
namespace certification\yerzt\controller;

/**
 * @desc 实名认证控制器
 * @author wyh
 * @version 1.0
 * @time 2022-0924
 */
class IndexController extends \app\home\controller\BaseController
{
    public function status()
    {
        $param = $this->request->param();
        $Plugin = \think\facade\Db::name("Plugin")->where("name", "=", "Yerzt")->find();
        $config = json_decode($Plugin["config"], true);
        $SecretId = $config["SecretId"];
        $SecretKey = $config["SecretKey"];
        $faceAuth = new \certification\yerzt\logic\YerzFaceAuth($SecretId, $SecretKey);
        $checkdata = ["EidToken" => $param["certify_id"]];
        $check = $faceAuth->Echeck($checkdata);
        $checks = json_decode($check["data"], true);
        if ($checks["Status"] == "timeout") {
            return ["status" => 2, "msg" => "本次验证超时，请重新发起验证"];
        }
        $params = ["InfoType" => "0", "EidToken" => $param["certify_id"] ?? "", "type" => $param["type"] ?? "person", "client_id" => $param["client_id"] ?? 0];
        $res = $faceAuth->Every($params);
        return json($res);
    }
}

?>
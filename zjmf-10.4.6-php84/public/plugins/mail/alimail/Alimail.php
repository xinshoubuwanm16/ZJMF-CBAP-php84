<?php
namespace mail\alimail;

use mail\alimail\lib\AliyunDm;

class Alimail extends \app\common\lib\Plugin
{
    public $info = ["name" => "Alimail", "title" => "阿里云", "description" => "阿里云", "status" => 1, "author" => "智简魔方", "version" => "1.0.1", "help_url" => "https://help.aliyun.com/product/29412.html"];
    private $isDebug = 0;
    const ATTACHMENTS_ADDRESS = "./upload/common/email/";
    public function install()
    {
        return true;
    }
    public function uninstall()
    {
        return true;
    }
    public function send($params)
    {
        $mail = new AliyunDm($params['config']['accessKeyId'], $params['config']['accessKeySecret']);
		$result = $mail->send($params['email'], $params['subject'], $params['content'], $params['config']['accountName'], $params['config']['fromAlias']);
        if($result === true){
            return ['status' => 'success'];
        }else{
            return ['status' => 'error', 'msg' => $result];
        }
    }
}

?>
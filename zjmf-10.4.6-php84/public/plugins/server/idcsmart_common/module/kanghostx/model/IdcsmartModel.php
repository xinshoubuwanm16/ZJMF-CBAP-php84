<?php
namespace server\idcsmart_common\module\kanghostx\model;

class IdcsmartModel extends \think\Model
{
    protected $name = "configuration";
    protected $schema = ["setting" => "string", "value" => "string"];
}

?>
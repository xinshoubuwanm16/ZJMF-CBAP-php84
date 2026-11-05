<?php
namespace server\idcsmart_common\module\bthostx\model;

class IdcsmartModel extends \think\Model
{
    protected $name = "configuration";
    protected $schema = ["setting" => "string", "value" => "string"];
}

?>
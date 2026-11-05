<?php
namespace server\idcsmart_common\module\bthostx\model;

class IdcsmartHostModel extends \think\Model
{
    protected $name = "host";
    protected $schema = ["id" => "string", "due_time" => "string"];
}

?>
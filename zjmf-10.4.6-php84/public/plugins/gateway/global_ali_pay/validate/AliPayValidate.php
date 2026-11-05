<?php
namespace gateway\global_ali_pay\validate;

class AliPayValidate extends \think\Validate
{
    protected $rule = ["out_trade_no|订单号" => "alphaDash|length:2,30", "total_fee" => "float|length:1,11", "qrcode_width|尺寸" => "length:100,500", "currency" => "upper|length:3"];
    protected $message = ["total_fee.integer" => "请输入正确的金额", "currency" => "请输入正确的货币"];
}

?>
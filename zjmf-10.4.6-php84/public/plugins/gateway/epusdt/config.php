<?php
return ["module_name" => ["title" => "名称", "type" => "text", "value" => "Easy Payment Usdt", "tip" => "friendly name", "size" => 200], "api_auth_token" => ["title" => "Epusdt自定义密钥", "type" => "text", "value" => "", "tip" => "从epusdt中.env中获取api_auth_token的值", "size" => 200], "epusdt_url" => ["title" => "epusdt支付地址", "type" => "text", "value" => "", "tip" => "地址格式：域名+/api/v1/order/create-transaction", "size" => 200], "condition" => ["title" => "支付条件", "type" => "radio", "options" => ["on" => "开启", "off" => "关闭"], "value" => "off", "tip" => "请选择支付条件"]];

?>
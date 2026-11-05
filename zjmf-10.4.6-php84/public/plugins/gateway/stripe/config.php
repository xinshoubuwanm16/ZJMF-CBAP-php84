<?php
$domain = configuration("website_url");
$webHook = $domain . "/gateway?_plugin=stripe&_controller=Index&_action=index";
return ["module_name" => ["title" => "名称", "type" => "text", "value" => "Stripe聚合支付", "tip" => "Stripe聚合支付"], "apikey" => ["title" => "API密钥", "type" => "text", "value" => "", "tip" => "sk_live_开头的密钥"], "whsec" => ["title" => "Webhook密钥", "type" => "text", "value" => "", "tip" => "whsec_开头的密钥"], "webhook" => ["title" => "Webhook", "type" => "text", "value" => $webHook, "tip" => ""], "currency" => ["title" => "货币类型", "type" => "text", "value" => "hkd", "tip" => ""], "helper" => ["title" => "使用帮助", "type" => "text", "value" => "先到https://dashboard.stripe.com/login注册或者登录帐号\n左侧导航开发者获取API密钥\n左侧导航Webhook，创建或者更新端点为上面WebHook里的地址", "tip" => "使用帮助"]];

?>
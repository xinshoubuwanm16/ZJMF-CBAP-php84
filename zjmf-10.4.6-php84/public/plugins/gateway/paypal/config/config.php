<?php
$domain = configuration("website_url");
return ["mode" => "live", "clientId" => "", "clientSecret" => "", "notify_url" => $domain . "/gateway/paypal/index/notify_handle", "return_url" => $domain . "/gateway/paypal/index/return_handle", "cancel_url" => $domain . "/gateway/paypal/index/cancel_handle", "url" => (string) $domain];

?>
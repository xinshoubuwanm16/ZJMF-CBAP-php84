<?php
$domain = configuration("website_url");
return ["notify_url" => $domain . "/gateway/ocgc_pay/index/notifyHandle", "redirect_url" => $domain . "/gateway/ocgc_pay/index/returnHandle", "url" => (string) $domain, "api_url" => "https://aop.koolyun.com:443/apmp/rest/", "cert_private_key" => "", "cert_public_key" => ""];

?>
<?php
$domain = configuration("website_url");
return ["notify_url" => $domain . "/gateway/goallpay_unionpay/index/notifyHandle", "redirect_url" => $domain . "/gateway/goallpay_unionpay/index/returnHandle", "url" => (string) $domain, "goallpay_url" => "https://api.allpayx.com"];

?>
<?php
$domain = configuration("website_url");
return ["return_url" => $domain . "/gateway/stripe/index/returnHandle", "cancel_url" => $domain . "/gateway/stripe/index/cancelHandle", "url" => $domain];

?>
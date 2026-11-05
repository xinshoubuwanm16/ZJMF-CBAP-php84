<?php
$domain = configuration("website_url");
return ["notify_url" => $domain . "/gateway/epusdt/index/notifyHandle", "redirect_url" => $domain . "/gateway/epusdt/index/returnHandle", "url" => (string) $domain];

?>
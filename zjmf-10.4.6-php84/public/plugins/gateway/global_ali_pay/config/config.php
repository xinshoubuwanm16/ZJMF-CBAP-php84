<?php
$domain = configuration("website_url");
$info = parse_url($domain);
if (isset($info["scheme"]) && $info["scheme"] == "https") {
    $protocol = "https";
} else {
    $protocol = "http";
}
if (request()->isMobile()) {
    $mode = "create_forex_trade_wap";
} else {
    $mode = "create_forex_trade";
}
return ["partner" => "2088621935295134", "key" => "fk03jzhvxqf2ulwzmflyw7ysied2g6tq", "notify_url" => $domain . "/gateway/global_ali_pay/index/notify_handle", "return_url" => $domain . "/gateway/global_ali_pay/index/return_handle", "refer_url" => $domain, "sign_type" => strtoupper("MD5"), "input_charset" => strtoupper("UTF-8"), "cacert" => getcwd() . "/cacert.pem", "transport" => $protocol, "service" => $mode, "url" => $domain];

?>
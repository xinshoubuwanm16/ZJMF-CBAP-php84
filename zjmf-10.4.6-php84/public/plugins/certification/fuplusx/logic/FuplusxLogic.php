<?php
namespace certification\fuplusx\logic;

class FuplusxLogic
{
    public function createLinkstrings($para)
    {
        $arg = "";
        foreach ($para as $key => $val) {
            $arg .= $key . "=" . $val . "&";
        }
        $arg = trim($arg, "&");
        if (function_exists("get_magic_quotes_gpc") && get_magic_quotes_gpc()) {
            $arg = stripslashes($arg);
        }
        return $arg;
    }
    public function httpsFuplusx($appcode, $querys, $host, $types)
    {
        $path = $types;
        $method = "GET";
        $headers = [];
        array_push($headers, "Authorization:APPCODE " . $appcode);
        $url = $host . $path . "?" . $querys;
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_FAILONERROR, false);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HEADER, true);
        if (1 == strpos("\$" . $host, "https://")) {
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        }
        $result = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        list($header, $body) = explode("\r\n\r\n", $result, 2);
        list($header) = explode("\r\n\r\n", $result, 2);
        if ($httpCode == 200) {
            $body = json_decode($body, true);
            $output["status"] = 200;
            $output["msg"] = "请求成功";
            $output["body"] = $body;
            return $output;
        }
        if ($httpCode == 400 && strpos($header, "Invalid Param Location") !== false) {
            $msg = "参数错误";
        } else {
            if ($httpCode == 400 && strpos($header, "Invalid AppCode") !== false) {
                $msg = "AppCode错误";
            } else {
                if ($httpCode == 400 && strpos($header, "Invalid Url") !== false) {
                    $msg = "请求的 Method、Path 或者环境错误";
                } else {
                    if ($httpCode == 403 && strpos($header, "Unauthorized") !== false) {
                        $msg = "服务未被授权（或URL和Path不正确）";
                    } else {
                        if ($httpCode == 403 && strpos($header, "Quota Exhausted") !== false) {
                            $msg = "套餐包次数用完";
                        } else {
                            if ($httpCode == 500) {
                                $msg = "API网关错误";
                            } else {
                                if ($httpCode == 0) {
                                    $msg = "URL错误";
                                } else {
                                    if ($httpCode == 401 && strpos($header, "Unauthorized") !== false) {
                                        $msg = "服务未被授权访问，原因：AppCode错误";
                                    } else {
                                        if (empty($appcode)) {
                                            $msg = "实名认证接口配置错误：AppCode未设置";
                                        } else {
                                            $msg = "实名认证接口配置错误、参数名错误 或 其他错误，请联系站长";
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        $output["status"] = 400;
        $output["msg"] = $msg;
        return $output;
    }
}

?>
<?php
function createLinkstring($para)
{
    $arg = "";
    while (list($key, $val) = func_new_each($para)) {
        $arg .= $key . "=" . $val . "&";
    }
    $arg = substr($arg, 0, func_new_count($arg) - 1);
    return $arg;
}
function createLinkstringUrlencode($para)
{
    $arg = "";
    while (list($key, $val) = func_new_each($para)) {
        $arg .= $key . "=" . urlencode($val) . "&";
    }
    $arg = substr($arg, 0, func_new_count($arg) - 1);
    $arg = stripslashes($arg);
    return $arg;
}
function paraFilter($para)
{
    while (list($key, $val) = func_new_each($para)) {
        if (!($key == "sign" || $key == "sign_type" || $val == "")) {
            $para_filter[$key] = $para[$key];
        }
    }
    return $para_filter;
}
function func_new_each(&$array)
{
    $res = [];
    $key = key($array);
    if ($key !== NULL) {
        next($array);
        $res["value"] = $array[$key];
        $res[1] = $res["value"];
        $res["key"] = $key;
        $res[0] = $res["key"];
    } else {
        $res = false;
    }
    return $res;
}
function func_new_count($array_or_countable, $mode = COUNT_NORMAL)
{
    if (is_array($array_or_countable) || is_object($array_or_countable)) {
        return count($array_or_countable, $mode);
    }
    return 0;
}
function argSort($para)
{
    ksort($para);
    reset($para);
    return $para;
}
function logResult($word = "")
{
    $fp = fopen("log.txt", "a");
    flock($fp, LOCK_EX);
    fwrite($fp, "执行日期executetime：" . date("YmdHis", time()) . "\n" . $word . "\n");
    flock($fp, LOCK_UN);
    fclose($fp);
}
function getHttpResponsePOST($url, $cacert_url, $para, $input_charset = "")
{
    if (trim($input_charset) != "") {
        $url = $url . "_input_charset=" . $input_charset;
    }
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_HEADER, 0);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $para);
    $responseText = curl_exec($curl);
    curl_close($curl);
    return $responseText;
}
function getHttpResponseGET($url, $cacert_url)
{
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_HEADER, 0);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2);
    curl_setopt($curl, CURLOPT_CAINFO, $cacert_url);
    $responseText = curl_exec($curl);
    curl_close($curl);
    return $responseText;
}
function charsetEncode($input, $_output_charset, $_input_charset)
{
    $output = "";
    if (!isset($_output_charset)) {
        $_output_charset = $_input_charset;
    }
    if ($_input_charset == $_output_charset || $input == NULL) {
        $output = $input;
    } else {
        if (function_exists("mb_convert_encoding")) {
            $output = mb_convert_encoding($input, $_output_charset, $_input_charset);
        } else {
            if (function_exists("iconv")) {
                $output = iconv($_input_charset, $_output_charset, $input);
            } else {
                exit("sorry, you have no libs support for charset change.");
            }
        }
    }
    return $output;
}
function charsetDecode($input, $_input_charset, $_output_charset)
{
    $output = "";
    if (!isset($_input_charset)) {
        $_input_charset = $_input_charset;
    }
    if ($_input_charset == $_output_charset || $input == NULL) {
        $output = $input;
    } else {
        if (function_exists("mb_convert_encoding")) {
            $output = mb_convert_encoding($input, $_output_charset, $_input_charset);
        } else {
            if (function_exists("iconv")) {
                $output = iconv($_input_charset, $_output_charset, $input);
            } else {
                exit("sorry, you have no libs support for charset changes.");
            }
        }
    }
    return $output;
}

?>
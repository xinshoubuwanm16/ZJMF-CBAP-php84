<?php
namespace gateway\ocgc_pay\vendor;

require_once "QrcodePay.Config.php";
require_once "QrcodePay.Exception.php";
require_once "QrcodePay.Data.php";
/**
 * 
 * 接口访问类
 * @author MingzhaoLi <260177392@qq.com>
 * @version v1.0
 */
class QrcodePayApi
{
    public static function login($loginRequest = NULL, $config = [])
    {
        $loginResult = $loginRequest->doRequest(true, NULL, $loginRequest, $config);
        return $loginResult;
    }
    public static function mscTxnRequest($MscTxnRequest = NULL, $session = NULL, $config = [])
    {
        $payResult = $MscTxnRequest->doRequest(false, $session, $MscTxnRequest, $config);
        return $payResult;
    }
}

?>
<?php
namespace oauth\qyweixin\sdk;

/**
 * SHA1 class
 *
 * 计算公众平台的消息签名接口.
 */
class SHA1
{
    public function getSHA1($token, $timestamp, $nonce, $encrypt_msg)
    {
        try {
            $array = [$encrypt_msg, $token, $timestamp, $nonce];
            sort($array, SORT_STRING);
            $str = implode($array);
            return [ErrorCode::$OK, sha1($str)];
        } catch (\Exception $e) {
            return [ErrorCode::$ComputeSignatureError, NULL];
        }
    }
}

?>
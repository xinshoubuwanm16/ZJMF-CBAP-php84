<?php
namespace oauth\qyweixin\sdk;

/**
 * 企业微信回调消息加解密示例代码.
 *
 * @copyright Copyright (c) 1998-2014 Tencent Inc.
 */
class WXBizMsgCrypt
{
    private $m_sToken;
    private $m_sEncodingAesKey;
    private $m_sReceiveId;
    public function __construct($token, $encodingAesKey, $receiveId)
    {
        $this->m_sToken = $token;
        $this->m_sEncodingAesKey = $encodingAesKey;
        $this->m_sReceiveId = $receiveId;
    }
    public function VerifyURL($sMsgSignature, $sTimeStamp, $sNonce, $sEchoStr, &$sReplyEchoStr)
    {
        if (strlen($this->m_sEncodingAesKey) != 43) {
            return ErrorCode::$IllegalAesKey;
        }
        $pc = new Prpcrypt($this->m_sEncodingAesKey);
        $sha1 = new SHA1();
        $array = $sha1->getSHA1($this->m_sToken, $sTimeStamp, $sNonce, $sEchoStr);
        $ret = $array[0];
        if ($ret != 0) {
            return $ret;
        }
        $signature = $array[1];
        if ($signature != $sMsgSignature) {
            return ErrorCode::$ValidateSignatureError;
        }
        $result = $pc->decrypt($sEchoStr, $this->m_sReceiveId);
        if ($result[0] != 0) {
            return $result[0];
        }
        $sReplyEchoStr = $result[1];
        return ErrorCode::$OK;
    }
    public function EncryptMsg($sReplyMsg, $sTimeStamp, $sNonce, &$sEncryptMsg)
    {
        $pc = new Prpcrypt($this->m_sEncodingAesKey);
        $array = $pc->encrypt($sReplyMsg, $this->m_sReceiveId);
        $ret = $array[0];
        if ($ret != 0) {
            return $ret;
        }
        if ($sTimeStamp == NULL) {
            $sTimeStamp = time();
        }
        $encrypt = $array[1];
        $sha1 = new SHA1();
        $array = $sha1->getSHA1($this->m_sToken, $sTimeStamp, $sNonce, $encrypt);
        $ret = $array[0];
        if ($ret != 0) {
            return $ret;
        }
        $signature = $array[1];
        $xmlparse = new XMLParse();
        $sEncryptMsg = $xmlparse->generate($encrypt, $signature, $sTimeStamp, $sNonce);
        return ErrorCode::$OK;
    }
    public function DecryptMsg($sMsgSignature, $sTimeStamp = NULL, $sNonce, $sPostData, &$sMsg)
    {
        if (strlen($this->m_sEncodingAesKey) != 43) {
            return ErrorCode::$IllegalAesKey;
        }
        $pc = new Prpcrypt($this->m_sEncodingAesKey);
        $xmlparse = new XMLParse();
        $array = $xmlparse->extract($sPostData);
        $ret = $array[0];
        if ($ret != 0) {
            return $ret;
        }
        if ($sTimeStamp == NULL) {
            $sTimeStamp = time();
        }
        $encrypt = $array[1];
        $sha1 = new SHA1();
        $array = $sha1->getSHA1($this->m_sToken, $sTimeStamp, $sNonce, $encrypt);
        $ret = $array[0];
        if ($ret != 0) {
            return $ret;
        }
        $signature = $array[1];
        if ($signature != $sMsgSignature) {
            return ErrorCode::$ValidateSignatureError;
        }
        $result = $pc->decrypt($encrypt, $this->m_sReceiveId);
        if ($result[0] != 0) {
            return $result[0];
        }
        $sMsg = $result[1];
        return ErrorCode::$OK;
    }
}

?>
<?php
namespace oauth\qyweixin\sdk;

/**
 * XMLParse class
 *
 * 提供提取消息格式中的密文及生成回复消息格式的接口.
 */
class XMLParse
{
    public function extract($xmltext)
    {
        try {
            $xml = new \DOMDocument();
            $xml->loadXML($xmltext);
            $array_e = $xml->getElementsByTagName("Encrypt");
            $encrypt = $array_e->item(0)->nodeValue;
            return [0, $encrypt];
        } catch (\Exception $e) {
            return [ErrorCode::$ParseXmlError, NULL];
        }
    }
    public function generate($encrypt, $signature, $timestamp, $nonce)
    {
        $format = "<xml>\r\n<Encrypt><![CDATA[%s]]></Encrypt>\r\n<MsgSignature><![CDATA[%s]]></MsgSignature>\r\n<TimeStamp>%s</TimeStamp>\r\n<Nonce><![CDATA[%s]]></Nonce>\r\n</xml>";
        return sprintf($format, $encrypt, $signature, $timestamp, $nonce);
    }
}

?>
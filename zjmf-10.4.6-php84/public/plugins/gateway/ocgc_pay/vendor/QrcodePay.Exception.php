<?php
/**
 * 
 * 扫码付异常类
 * @version v1.0
 */
class QrcodePayException extends Exception
{
    public function errorMessage()
    {
        return $this->getMessage();
    }
}

?>
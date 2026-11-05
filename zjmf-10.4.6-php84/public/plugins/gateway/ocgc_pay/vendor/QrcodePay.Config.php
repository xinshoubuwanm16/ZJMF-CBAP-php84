<?php
/**
 * 
 * 配置账号信息
 * @version v2.0
 */
class RrcodePayConfig
{
    const API_URL = "https://aop.koolyun.com:443/apmp/rest/";
    const MERCH_ID = "114816004000027";
    const LOGIN_HEADER_X_APPKEY = "114816004000027";
    const CERT_KEY_PATH = "../key/test_env/3rd_private_key_pkcs1.pem";
    const CERT_PUB_KEY_PATH = "../key/prod_env/koolyun_prod_pub_key.pem";
    const LOGIN_V = "3.0";
    const IPOS_SN = "0000000000000000";
    const OPERATOR = "01";
    const LOGIN_PWD = "111111";
    const PAYTYPE_ALIPAY = "alipayOverSea";
    const PAYTYPE_ALIPAY_ONLINE = "alipayOverSeaOnline";
    const PAYTYPE_WEIXIN = "weixinOverSea";
    const PAYTYPE_UNIONPAYOVERSEA = "unionpayOverSea";
    const PAYMENTID_ALIPAY = "0000000340";
    const PAYMENTID_ALIPAY_ONLINE = "0000000392";
    const PAYMENTID_WEIXIN = "0000000104";
    const PAYMENTID_UNIONPAYOVERSEA = "0000000536";
    const CSB_ACTION = "csbpay";
    const BSC_ACTION = "bscpay";
    const JS_ACTION = "jspay";
    const APP_ACTION = "apppay";
    const H5_ACTION = "h5pay";
    const UPOP_ACTION = "upop";
    const CANCEL_ACTION = "cancel";
    const REFUND_ACTION = "refund";
    const TRANS_TYPE_PAY = "1021";
    const TRANS_TYPE_CANCEL = "3021";
    const TRANS_TYPE_REFUND = "3051";
    const WALLET_ALIPAYHK = "ALIPAYHK";
    const WALLET_ALIPAYCN = "ALIPAYCN";
}

?>
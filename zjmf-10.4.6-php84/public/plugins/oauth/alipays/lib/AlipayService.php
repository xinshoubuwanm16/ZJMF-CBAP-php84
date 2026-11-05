<?php

namespace oauth\alipays\lib;

use oauth\alipays\lib\Aop\AopClient;
use oauth\alipays\lib\Aop\AlipayCertHelper;
use oauth\alipays\lib\Aop\AlipayRequest;
use oauth\alipays\lib\Aop\AlipayResponseException;

class AlipayService
{
    //AopClient
    protected $client;

    //是否公钥证书模式
    protected $isCertMode = false;

    //应用ID
    protected $appId;

    //异步通知回调地址
    protected $notifyUrl;

    //同步通知回调地址
    protected $returnUrl;

    //服务商模式子商户token
    protected $appAuthToken;

    //日志文件夹路径
    protected $logPath;

    //页面跳转接口返回类型
    protected $pageMethod;

    /**
     * @param $config 支付宝配置信息
     * @throws \InvalidArgumentException
     */
    public function __construct($config)
    {
        if (empty($config['app_id'])) {
            throw new \InvalidArgumentException('应用AppID不能为空');
        }
        if (empty($config['app_private_key'])) {
            throw new \InvalidArgumentException("应用私钥不能为空");
        }
        if (empty($config['alipay_public_key']) && empty($config['alipay_cert_path'])) {
            throw new \InvalidArgumentException("支付宝公钥不能为空");
        }
        $this->appId = $config['app_id'];
        if (!empty($config['app_cert_path']) && !empty($config['alipay_cert_path']) && !empty($config['root_cert_path']) && (!isset($config['cert_mode']) || $config['cert_mode'] == 1)) {
            $this->isCertMode = true;
        }
        if (isset($config['app_auth_token'])) {
            $this->appAuthToken = $config['app_auth_token'];
        }
        if (isset($config['logPath'])) {
            $this->logPath = $config['logPath'];
        }
        if (isset($config['pageMethod'])) {
            $this->pageMethod = $config['pageMethod'];
        }

        $this->client = new AopClient();
        $this->client->appId = $config['app_id'];
        if (isset($config['gateway_url']) && !empty($config['gateway_url'])) {
            $this->client->gatewayUrl = $config['gateway_url'];
        }
        if (isset($config['sign_type']) && !empty($config['sign_type'])) {
            $this->client->signType = $config['sign_type'];
        }
        if (isset($config['charset']) && !empty($config['charset'])) {
            $this->client->charset = $config['charset'];
        }

        $this->client->rsaPrivateKey = $config['app_private_key'];
        if ($this->isCertMode) {
            $this->client->rsaPublicKeyFilePath = $config['alipay_cert_path'];
            $this->client->appCertSN = AlipayCertHelper::getCertSN($config['app_cert_path']);
            $this->client->alipayRootCertSN = AlipayCertHelper::getRootCertSN($config['root_cert_path']);
        } else {
            $this->client->rsaPublicKey = $config['alipay_public_key'];
        }
        
    }

    /**
     * 发起接口请求
     * 
     * @param $apiName    接口名称
     * @param $bizContent 请求参数的集合
     * @param $params     其他公共参数
     * @throws AlipayResponseException
     * @return mixed
     */
    public function aopExecute($apiName, $bizContent = null, $params = null)
    {
        $request = new AlipayRequest();
        $request->setApiMethodName($apiName);
        $request->setNotifyUrl($this->notifyUrl);
        $request->setAppAuthToken($this->appAuthToken);
        $request->setBizContent($bizContent);
        if (is_array($params) && count($params) > 0) {
            $request->setOtherParams($params);
        }
        $result = $this->client->execute($request)->getData();
        if ($apiName == 'alipay.system.oauth.token' && isset($result['access_token'])) {
            return $result;
        } elseif (isset($result['code']) && $result['code'] == '10000') {
            return $result;
        } else {
            throw new AlipayResponseException($result);
        }
    }

    /**
     * 页面跳转接口，返回form表单html
     * 
     * @param $apiName    接口名称
     * @param $bizContent 请求参数的集合
     * @param $params     其他公共参数
     * @return string
     */
    public function aopPageExecute($apiName, $bizContent = null, $params = null)
    {
        $request = new AlipayRequest();
        $request->setApiMethodName($apiName);
        $request->setNotifyUrl($this->notifyUrl);
        $request->setReturnUrl($this->returnUrl);
        $request->setAppAuthToken($this->appAuthToken);
        $request->setBizContent($bizContent);
        if (is_array($params) && count($params) > 0) {
            $request->setOtherParams($params);
        }
        if (!empty($this->pageMethod)) {
            switch($this->pageMethod) {
                case '2':$httpmethod = 'REDIRECT';break;
                case '1':$httpmethod = 'GET';break;
                default:$httpmethod = 'POST';break;
            }
            return $this->client->pageExecute($request, $httpmethod);
        } else {
            return $this->client->pageExecute($request);
        }
    }

    /**
     * APP接口，返回收银台SDK的字符串
     * 
     * @param $apiName    接口名称
     * @param $bizContent 请求参数的集合
     * @param $params     其他公共参数
     * @return string
     */
    public function aopSdkExecute($apiName, $bizContent = null, $params = null)
    {
        $request = new AlipayRequest();
        $request->setApiMethodName($apiName);
        $request->setNotifyUrl($this->notifyUrl);
        $request->setAppAuthToken($this->appAuthToken);
        $request->setBizContent($bizContent);
        if (is_array($params) && count($params) > 0) {
            $request->setOtherParams($params);
        }
        return $this->client->sdkExecute($request);
    }

    /**
     * 回调验签
     * @param $params 支付宝返回的信息
     * @return bool
     */
    public function check($params){
        $result = $this->client->verify($params);
        return $result;
    }

    /**
     * 记录日志
     */
    public function writeLog($text) {
        if (empty($this->logPath)) return;
        //$text=iconv("GBK", "UTF-8//IGNORE", $text);
        file_put_contents($this->logPath."log.txt", date ( "Y-m-d H:i:s" ) . "  " . $text . "\r\n", FILE_APPEND);
    }


    /**
     * 跳转支付宝授权页面
     * @param $redirect_uri 回调地址
     * @param $state
     * @param $is_get_url 是否只返回url
     * @return void|string
     */
    public function oauth($redirect_uri, $state, $scope)
    {
        $param = [
            'app_id' => $this->appId,
            'scope' => $scope,
            'redirect_uri' => $redirect_uri,
        ];
        if($state) $param['state'] = $state;

        $url = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?'.http_build_query($param);

        return $url;
    }

    /**
     * 换取授权访问令牌
     * @param $code 授权码或刷新令牌
     * @param $grant_type 授权方式(authorization_code,refresh_token)
     * @return mixed {"user_id":"支付宝用户的唯一标识","open_id":"支付宝用户的唯一标识","access_token":"访问令牌","expires_in":"3600","refresh_token":"刷新令牌","re_expires_in":"3600"}
     */
    public function getToken($code, $grant_type = 'authorization_code')
    {
        $apiName = 'alipay.system.oauth.token';
        $params = [];
        $params['grant_type'] = $grant_type;
        if($grant_type == 'refresh_token'){
            $params['refresh_token'] = $code;
        }else{
            $params['code'] = $code;
        }
        return $this->aopExecute($apiName, null, $params);
    }

    /**
     * 支付宝会员授权信息查询
     * @param $accessToken 用户授权令牌
     * @return mixed {"code":"10000","msg":"Success","user_id":"支付宝用户的userId","avatar":"用户头像地址","city":"市名称","nick_name":"用户昵称","province":"省份名称","gender":"性别MF"}
     */
    public function userinfo($accessToken)
    {
        $apiName = 'alipay.user.info.share';
        $params = [
            'auth_token' => $accessToken
        ];

        return $this->aopExecute($apiName, null, $params);
    }
}
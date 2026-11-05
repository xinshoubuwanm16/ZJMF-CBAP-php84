<?php
namespace oauth\alipays;

use oauth\alipays\lib\AlipayService;

class Alipays extends \app\common\lib\Oauth
{
    public $info = ["name" => "Alipays", "title" => "支付宝登录", "description" => "支付宝登录", "author" => "idcsmart", "logo_url" => "alipay.svg", "version" => "1.0.0", "help_url" => "https://openhome.alipay.com/platform/keyManage.htm"];
    public function url($params)
    {
		$oauth = new AlipayService($params);
		$login_url = $oauth->oauth($params["callback"], $params["system_oauth_state"], 'auth_user,auth_base');
        return $login_url;
    }
    public function callback($params)
    {
        if (empty($params["auth_code"])) {
            return "error";
        }
        try{
            $oauth = new AlipayService($params);
            $res = $oauth->getToken($params["auth_code"]);
            $userinfo = $oauth->userinfo($res['access_token']);
        }catch(\Exception $e){
            return "获取支付宝会员授权信息失败:".$e->getMessage();
        }

        if($params['usertype'] == '1'){
			if(empty($res['open_id'])) return "OpenId字段为空";
			$user_id = $res['open_id'];
		}else{
			if(empty($res['user_id'])) return "UserId字段为空";
			$user_id = $res['user_id'];
		}
        return [
            'openid'=>$user_id,
            'data'=>[
                'username'=>$userinfo['nick_name'],
                'avatar'=>$userinfo['avatar'],
            ]
        ];
    }
}

?>
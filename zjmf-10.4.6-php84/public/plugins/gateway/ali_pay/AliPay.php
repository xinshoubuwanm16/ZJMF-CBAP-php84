<?php
namespace gateway\ali_pay;

use app\common\lib\Plugin;
use gateway\ali_pay\lib\AlipayTradeService;
use think\facade\Db;

class AliPay extends Plugin
{
    // 插件基础信息
    public $info = array(
        'name'        => 'AliPay', // 必填 插件标识(唯一)
        'title'       => '支付宝支付', // 必填 插件显示名称
        'description' => '支付宝支付', // 必填 插件功能描述
        'author'      => '智简魔方', // 必填 插件作者
        'version'     => '1.0.1',  // 必填 插件版本
        'help_url'    => '', // 选填 申请链接
        'author_url'  => '', // 选填 作者链接
        'url'         => '', // 选填 图标地址(可以自定义支付图片地址)
    );

    // 临时订单生成规则,1:毫秒时间戳+8位随机数(21-22位长度订单号,默认规则),2:时间戳+8位随机数(18位长度订单号),3:10位随机数(10位长度订单号)
    public $orderRule=1;

    // 插件安装
    public function install()
    {
        return true;//安装成功返回true，失败false
    }

    // 插件卸载
    public function uninstall()
    {
        return true;//卸载成功返回true，失败false
    }

    public function AliPayHandle($param)
    {
        $config = $this->config();

        if(in_array('wap', $config['product']) && $this->isMobile()){
            return $this->wapPay($config, $param);
        }elseif(in_array('pc', $config['product']) && !$this->isMobile()){
            return $this->pcPay($config, $param);
        }elseif(in_array('qr', $config['product'])){
            return $this->qrPay($config, $param);
        }else{
            throw new \Exception('未选择任何可用的支付产品');
        }
    }

    private function pcPay($config, $param)
    {
        $domain = configuration('website_url');
        $subject = isset($param['product'][0])?$param['product'][0]:('订单'.$param['out_trade_no']);

        $config['notify_url'] = $domain . '/gateway/ali_pay/index/notifyHandle';
        $config['return_url'] = $domain . '/gateway/ali_pay/index/returnHandle';
        $bizContent = [
            'out_trade_no' => $param['out_trade_no'],
            'total_amount' => $param['finance']['total'],
            'subject' => $subject,
        ];
        $bizContent['business_params'] = ['mc_create_trade_ip' => get_client_ip()];

        try{
            $aop = new AlipayTradeService($config);
            $url = $aop->pagePay($bizContent);
        }catch(\Exception $e){
            throw new \Exception('支付宝下单失败:'.$e->getMessage());
        }

        $html_text = '<a href="'.$url.'" target="_blank" class="btn btn-success el-button el-button--success" id="submitpay">立即支付</a>';
        return $html_text;
    }

    private function wapPay($config, $param)
    {
        $domain = configuration('website_url');
        $subject = isset($param['product'][0])?$param['product'][0]:'商品';

        $config['notify_url'] = $domain . '/gateway/ali_pay/index/notifyHandle';
        $config['return_url'] = $domain . '/gateway/ali_pay/index/returnHandle';
        $bizContent = [
            'out_trade_no' => $param['out_trade_no'],
            'total_amount' => $param['finance']['total'],
            'subject' => $subject,
        ];
        $bizContent['business_params'] = ['mc_create_trade_ip' => get_client_ip()];

        try{
            $aop = new AlipayTradeService($config);
            $url = $aop->wapPay($bizContent);
        }catch(\Exception $e){
            throw new \Exception('支付宝下单失败:'.$e->getMessage());
        }

        $html_text = '<a href="'.$url.'" target="_blank" class="btn btn-success el-button el-button--success" id="submitpay">立即支付</a>';
        return $html_text;
    }

    private function qrPay($config, $param)
    {
        $domain = configuration('website_url');
        $subject = isset($param['product'][0])?$param['product'][0]:'商品';

        $config['notify_url'] = $domain . '/gateway/ali_pay/index/notifyHandle';
        $bizContent = [
            'out_trade_no' => $param['out_trade_no'],
            'total_amount' => $param['finance']['total'],
            'subject' => $subject,
        ];
        $bizContent['business_params'] = ['mc_create_trade_ip' => get_client_ip()];

        try{
            $aop = new AlipayTradeService($config);
            $result = $aop->qrPay($bizContent);
        }catch(\Exception $e){
            throw new \Exception('支付宝下单失败:'.$e->getMessage());
        }
        $code_url = $result['qr_code'];

        require_once 'lib/phpqrcode.php';
        $response = \QRcode::png($code_url,false,0,4,0,false);
        $base64 = 'data:png;base64,' . base64_encode($response->getData());

        return '<img src="'. $base64 .'" alt="" width="120" height="120">';
    }

    public function AliPayHandleRefund($param)
    {
        $config = $this->config();

        $bizContent = [
            'trade_no' => $param['transaction_number'],
            'refund_amount' => $param['amount'],
        ];
        if (isset($param['out_request_no']) && !empty($param['out_request_no'])){
            $bizContent['out_request_no'] = $param['out_request_no'];
        }
        try{
            $aop = new AlipayTradeService($config);
            $result = $aop->refund($bizContent);

            return ['status'=>200,'msg'=>'退款成功','data'=>['trade_no'=>$result['trade_no']]];
        }catch(\Exception $e){
            return ['status'=>400,'msg'=>$e->getMessage()];
        }
    }

    // 获取配置
    public function config()
    {
        $config = Db::name('plugin')->where('name', $this->info['name'])->value('config');
        if (!empty($config) && $config != "null") {
            $config = json_decode($config, true);
        } else {
            throw new \Exception('请先将配置好商户信息');
        }
        
        $product = [];
        if($config['product_pc'] == 1) $product[] = 'pc';
        if($config['product_wap'] == 1) $product[] = 'wap';
        if($config['product_qr'] == 1) $product[] = 'qr';

        return [
            'app_id' => $config['app_id'],
            'alipay_public_key' => $config['alipay_public_key'],
            'app_private_key' => $config['merchant_private_key'],
            'pageMethod' => '1',
            'product' => $product
        ];
    }

    private function isMobile()
    {
        $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
        $ualist = array('android', 'midp', 'nokia', 'mobile', 'iphone', 'ipod', 'blackberry', 'windows phone');
        foreach($ualist as $ua){
            if(strpos($useragent, $ua)!==false){
                return true;
            }
        }
        return false;
    }
}
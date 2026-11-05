<?php
namespace gateway\epay_ali;

use app\common\lib\Plugin;
use gateway\epay_ali\lib\EpayCore;
use think\facade\Db;

/**
 * @desc 易支付插件主文件
 */
class EpayAli extends Plugin
{
    // 插件基础信息
    public $info = array(
        'name'        => 'EpayAli', // 必填 插件标识(唯一)
        'title'       => '易支付-支付宝', // 必填 插件显示名称
        'description' => '易支付-支付宝', // 必填 插件功能描述
        'author'      => '消失的彩虹海', // 必填 插件作者
        'version'     => '1.0',  // 必填 插件版本
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

    public function EpayAliHandle($param)
    {
        $config = $this->config();
        $domain = configuration('website_url');
        $subject = isset($param['product'][0])?$param['product'][0]:'商品';
        $totalAmount = $param['finance']['total'];

        $parameter = array(
			"pid" => trim($config['pid']),
			"type" => 'alipay',
			"notify_url"	=> $domain."/gateway/epay_ali/index/notifyHandle",
			"return_url"	=> $domain."/gateway/epay_ali/index/returnHandle",
			"out_trade_no"	=> $param['out_trade_no'],
			"name"	=> $subject,
			"money"	=> $totalAmount
		);

        $epay = new EpayCore($config);
        $url = $epay->getPayLink($parameter);
        $html_text = '<a href="'.$url.'" target="_blank" class="btn btn-success el-button el-button--success" id="submitpay">立即支付</a>';
        return $html_text;
    }

    // 获取配置
    public function config()
    {
        $name = $this->info['name'];
        $config = Db::name('plugin')->where('name', $name)->value('config');
        if (!empty($config) && $config != "null") {
            $config = json_decode($config, true);
        } else {
            $config = [];
        }
        return $config;
    }
}
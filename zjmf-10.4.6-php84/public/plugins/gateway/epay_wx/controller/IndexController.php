<?php
namespace gateway\epay_wx\controller;

use app\home\controller\BaseController;
use gateway\epay_wx\EpayWx;
use gateway\epay_wx\lib\EpayCore;

/**
 * @desc 易支付插件回调处理文件
 */
class IndexController extends BaseController
{
    /**
     * 异步回调
     */
    public function notifyHandle()
    {
        $EpayWx = new EpayWx();
        $config = $EpayWx->getConfig();

        if (!isset($_GET['pid']) || $_GET['pid'] != $config['pid']) {
            echo 'fail';
            exit;
        }

        $epay = new EpayCore($config);
        $verify_result = $epay->verifyNotify();
        if ($verify_result) {
            if ($_GET['trade_status'] == 'TRADE_SUCCESS') {
                //> 逻辑处理
                $this->orderHandle($_GET, $EpayWx->info['name']);
            }
            echo "success";
        } else {
            echo "fail";
        }

    }

    /**
     * 同步回调
     */
    public function returnHandle()
    {
        $EpayWx = new EpayWx();
        $config = $EpayWx->getConfig();

        if (!isset($_GET['pid']) || $_GET['pid'] != $config['pid']) {
            echo '签名校验失败';
            exit;
        }

        $epay = new EpayCore($config);
        $verify_result = $epay->verifyReturn();
        if ($verify_result) {
            if ($_GET['trade_status'] == 'TRADE_SUCCESS') {
                //> 逻辑处理
                $this->orderHandle($_GET, $EpayWx->info['name']);
            }
            return redirect(url('/finance'));
        }else{
            echo '签名校验失败';
        }
    }

    /**
     * 处理订单
     */
    private function orderHandle($data, $gateway)
    {
        $up_data = [];
        $up_data['tmp_order_id'] = $data['out_trade_no'];   // 订单ID
        $up_data['amount'] = $data['money'];         // 订单总价
        $up_data['trans_id'] = $data['trade_no'];           // 交易流水号
        $up_data['currency'] = 'CNY';  // 货币
        $up_data['paid_time'] = date('Y-m-d H:i:s');       // 支付时间
        $up_data['gateway'] = $gateway;                  // 支付网关名称
        order_pay_handle($up_data);
    }

}
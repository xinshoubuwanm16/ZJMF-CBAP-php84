<?php
namespace gateway\ali_pay\controller;

use app\home\controller\BaseController;
use gateway\ali_pay\AliPay;
use gateway\ali_pay\lib\AlipayTradeService;

class IndexController extends BaseController
{
    /**
     * 异步回调
     */
    public function notifyHandle()
    {
        $class = new AliPay();
        $config = $class->config();

        $aop = new AlipayTradeService($config);
        $verify_result = $aop->check($_POST);
        if($verify_result){
            if ($_POST['trade_status'] == 'TRADE_SUCCESS') {
                //> 逻辑处理
                $this->orderHandle($_POST);
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
        $class = new AliPay();
        $config = $class->config();

        $aop = new AlipayTradeService($config);
        $verify_result = $aop->check($_GET);
        if($verify_result){
            return redirect('/finance.htm');
        }else{
            echo '签名校验失败';
        }
    }

    /**
     * 处理订单
     */
    private function orderHandle($data)
    {
        $up_data = [];
        $up_data['tmp_order_id'] = $data['out_trade_no'];   // 订单ID
        $up_data['amount'] = $data['total_amount'];         // 订单总价
        $up_data['trans_id'] = $data['trade_no'];           // 交易流水号
        $up_data['currency'] = $data['currency'] ?? 'CNY';  // 货币
        $up_data['paid_time'] = $data['gmt_payment'];       // 支付时间
        $up_data['gateway'] = 'AliPay';                  // 支付网关名称
        order_pay_handle($up_data);
    }

}
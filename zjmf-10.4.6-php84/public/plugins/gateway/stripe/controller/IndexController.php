<?php
namespace gateway\stripe\controller;

use gateway\stripe\lib\Webhook;

class IndexController extends \app\home\controller\BaseController
{
    public function index()
    {
        $payload = file_get_contents('php://input');
		$data = json_decode($payload, true);
		if(!$data){
			http_response_code(400);
			exit('no data');
		}

        $PayPal = new \gateway\stripe\Stripe();
        $config = $PayPal->config();

		$endpoint_secret = $config['whsec'];
		$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];
		$event = null;

		try {
			$event = Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
		} catch(\Exception $e) {
			http_response_code(400);
			exit($e->getMessage());
		}

        if ($event['type'] == "checkout.session.completed") {
            $session = $event['data']['object'];
            if ($session['payment_status'] == 'paid') {
                $amount = $session["amount_subtotal"] ?? $session["amount"];
                $up_data = [];
                $up_data["tmp_order_id"] = $session["client_reference_id"];
                $up_data["amount"] = $amount / 100;
                $up_data["trans_id"] = $session["payment_intent"];
                $up_data["currency"] = $session["currency"];
                $up_data["paid_time"] = date("Y-m-d H:i:s");
                $up_data["gateway"] = "Stripe";
                order_pay_handle($up_data);
            }
        }
    }
    public function returnHandle()
    {
        $Stripe = new \gateway\stripe\Stripe();
        $config = $Stripe->config();
        return redirect($config["url"]);
    }
    public function cancelHandle()
    {
        $Stripe = new \gateway\stripe\Stripe();
        $config = $Stripe->config();
        return redirect($config["url"]);
    }
}

?>
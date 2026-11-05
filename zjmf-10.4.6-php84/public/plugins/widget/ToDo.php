<?php
namespace widget;

class ToDo extends \app\common\lib\Widget
{
    /* PHP 8.2+ 禁止动态创建属性，此处显式声明原动态属性 */
    public $title;

    protected $weight = 100;
    protected $columns = 2;
    protected $language = ["zh-cn" => ["title" => "待办事项", "pending_work_orders" => "待处理工单", "pending_refunds" => "待处理退款", "pending_real_name_authentication" => "实名认证", "pending_withdrawals" => "待处理提现", "to_be_confirmed_recommend" => "待确认推介", "pending_invoices" => "待处理发票", "pending_host_num" => "开通中产品数量"], "en-us" => ["title" => "To Do", "pending_work_orders" => "pending work orders", "pending_refunds" => "pending refunds", "pending_real_name_authentication" => "real name authentication", "pending_withdrawals" => "pending withdrawals", "to_be_confirmed_recommend" => "to be confirmed recommendation", "pending_invoices" => "pending invoices", "pending_host_num" => "number of products in use"], "zh-hk" => ["title" => "待辦事項", "pending_work_orders" => "待處理工單", "pending_refunds" => "待處理退款", "pending_real_name_authentication" => "實名認證", "pending_withdrawals" => "待處理提現", "to_be_confirmed_recommend" => "待確認推介", "pending_invoices" => "待處理發票", "pending_host_num" => "開通中產品數量"]];
    public function __construct()
    {
        $this->title = $this->lang("title");
    }
    public function getData()
    {
        $PluginModel = new \app\admin\model\PluginModel();
        $addons = $PluginModel->plugins("addon");
        $addons = array_column($addons["list"], "name");
        $data = [];
        if (in_array("TicketPremium", $addons)) {
            $TicketPremiumStatusModel = new \addon\ticket_premium\model\TicketPremiumStatusModel();
            $status = $TicketPremiumStatusModel->where("status", 0)->column("id");
            $TicketPremiumModel = new \addon\ticket_premium\model\TicketPremiumModel();
            $count1 = $TicketPremiumModel->where("finished", 1)->whereIn("status", $status)->count();
            $count2 = $TicketPremiumModel->where("finished", 0)->count();
            $data["pending_work_orders"] = $count1 + $count2;
            $data["pending_work_orders_url"] = request()->domain() . "/" . DIR_ADMIN . "/plugin/ticket_premium/index.htm";
        } else {
            if (in_array("IdcsmartTicket", $addons)) {
                $IdcsmartTicketStatusModel = new \addon\idcsmart_ticket\model\IdcsmartTicketStatusModel();
                $status = $IdcsmartTicketStatusModel->where("status", 0)->column("id");
                $IdcsmartTicketModel = new \addon\idcsmart_ticket\model\IdcsmartTicketModel();
                $data["pending_work_orders"] = $IdcsmartTicketModel->whereIn("status", $status)->count();
                $data["pending_work_orders_url"] = request()->domain() . "/" . DIR_ADMIN . "/plugin/idcsmart_ticket/index.htm";
            }
        }
        if (in_array("IdcsmartRefund", $addons)) {
            $IdcsmartRefundModel = new \addon\idcsmart_refund\model\IdcsmartRefundModel();
            $data["pending_refunds"] = $IdcsmartRefundModel->where("status", "Pending")->count();
            $data["pending_refunds_url"] = request()->domain() . "/" . DIR_ADMIN . "/plugin/idcsmart_refund/index.htm";
        }
        if (in_array("IdcsmartCertification", $addons)) {
            $CertificationLogModel = new \addon\idcsmart_certification\model\CertificationLogModel();
            $idsPerson = $CertificationLogModel->field("max(id) as ids")->where("type", 1)->group("client_id")->order("id", "desc")->select()->toArray();
            $idsPerson && ($idsPerson = array_column($idsPerson, "ids"));
            $idsCompany = $CertificationLogModel->field("max(id) as ids")->whereIn("type", [2, 3])->group("client_id")->order("id", "desc")->select()->toArray();
            $idsCompany && ($idsCompany = array_column($idsCompany, "ids"));
            $ids = array_merge($idsPerson, $idsCompany);
            $data["pending_real_name_authentication"] = $CertificationLogModel->whereIn("status", [3, 4])->whereIn("id", $ids)->count();
            $data["pending_real_name_authentication_url"] = request()->domain() . "/" . DIR_ADMIN . "/plugin/idcsmart_certification/index.htm";
        }
        if (in_array("IdcsmartWithdraw", $addons)) {
            $IdcsmartWithdrawModel = new \addon\idcsmart_withdraw\model\IdcsmartWithdrawModel();
            $data["pending_withdrawals"] = $IdcsmartWithdrawModel->whereIn("status", ["0", "1"])->count();
            $data["pending_withdrawals_url"] = request()->domain() . "/" . DIR_ADMIN . "/plugin/idcsmart_withdraw/index.htm";
        }
        if (in_array("IdcsmartRecommend", $addons)) {
            $RecommendModel = new \addon\idcsmart_recommend\model\RecommendModel();
            $data["to_be_confirmed_recommend"] = $RecommendModel->where("status", "Pending")->count();
            $data["to_be_confirmed_recommend_url"] = request()->domain() . "/" . DIR_ADMIN . "/plugin/idcsmart_recommend/index.htm";
        }
        if (in_array("IdcsmartInvoice", $addons)) {
            $IdcsmartInvoiceModel = new \addon\idcsmart_invoice\model\IdcsmartInvoiceModel();
            $data["pending_invoices"] = $IdcsmartInvoiceModel->whereIn("status", ["pending", "wait_send"])->count();
            $data["pending_invoices_url"] = request()->domain() . "/" . DIR_ADMIN . "/plugin/idcsmart_invoice/index.htm";
        }
        $HostModel = new \app\common\model\HostModel();
        $data["pending_host_num"] = $HostModel->where("status", "Pending")->count();
        $data["pending_host_num_url"] = request()->domain() . "/" . DIR_ADMIN . "/host.htm";
        return $data;
    }
    public function output()
    {
        $data = $this->getData();
        $pendingTitle = $this->lang("title");
        $pendingWorkOrders = $this->lang("pending_work_orders");
        $pendingRefunds = $this->lang("pending_refunds");
        $pendingRealNameAuthentication = $this->lang("pending_real_name_authentication");
        $pendingWithdrawals = $this->lang("pending_withdrawals");
        $toBeConfirmedRecommend = $this->lang("to_be_confirmed_recommend");
        $pendingInvoices = $this->lang("pending_invoices");
        $pendingHostNum = $this->lang("pending_host_num");
        $adminPath = "/" . DIR_ADMIN;
        $content = "";
        if (isset($data["pending_work_orders"])) {
            $content .= "                <a class=\"todo-item\" href=\"" . $data["pending_work_orders_url"] . "\"><div class=\"todo-title\"><div class=\"todo-img todo-img-1\"></div><span>" . $pendingWorkOrders . "</span></div><div class=\"todo-num\">" . $data["pending_work_orders"] . "</div></a>";
        }
        if (isset($data["pending_refunds"])) {
            $content .= "                <a class=\"todo-item\" href=\"" . $data["pending_refunds_url"] . "\"><div class=\"todo-title\"><div class=\"todo-img todo-img-2\"></div><span>" . $pendingRefunds . "</span></div><div class=\"todo-num\">" . $data["pending_refunds"] . "</div></a>";
        }
        if (isset($data["pending_real_name_authentication"])) {
            $content .= "                <a class=\"todo-item\" href=\"" . $data["pending_real_name_authentication_url"] . "\"><div class=\"todo-title\"><div class=\"todo-img todo-img-3\"></div><span>" . $pendingRealNameAuthentication . "</span></div><div class=\"todo-num\">" . $data["pending_real_name_authentication"] . "</div></a>";
        }
        if (isset($data["pending_withdrawals"])) {
            $content .= "                <a class=\"todo-item\" href=\"" . $data["pending_withdrawals_url"] . "\"><div class=\"todo-title\"><div class=\"todo-img todo-img-4\"></div><span>" . $pendingWithdrawals . "</span></div><div class=\"todo-num\">" . $data["pending_withdrawals"] . "</div></a>";
        }
        if (isset($data["to_be_confirmed_recommend"])) {
            $content .= "                <a class=\"todo-item\" href=\"" . $data["to_be_confirmed_recommend_url"] . "\"><div class=\"todo-title\"><div class=\"todo-img todo-img-5\"></div><span>" . $toBeConfirmedRecommend . "</span></div><div class=\"todo-num\">" . $data["to_be_confirmed_recommend"] . "</div></a>";
        }
        if (isset($data["pending_invoices"])) {
            $content .= "                <a class=\"todo-item\" href=\"" . $data["pending_invoices_url"] . "\"><div class=\"todo-title\"><div class=\"todo-img todo-img-6\"></div><span>" . $pendingInvoices . "</span></div><div class=\"todo-num\">" . $data["pending_invoices"] . "</div></a>";
        }
        if (isset($data["pending_host_num"])) {
            $content .= "                <a class=\"todo-item\" href=\"" . $data["pending_host_num_url"] . "\"><div class=\"todo-title\"><div class=\"todo-img todo-img-7\"></div><span>" . $pendingHostNum . "</span></div><div class=\"todo-num\">" . $data["pending_host_num"] . "</div></a>";
        }
        return "        <div class=\"todo-box\">\r\n            <div class=\"todo-name\">" . $pendingTitle . "</div>\r\n            <div class=\"todo-main\">" . $content . "</div>\r\n        </div>";
    }
}

?>
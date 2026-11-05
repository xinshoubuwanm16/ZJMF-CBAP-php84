<?php
echo "\n";
function kanghostx_MetaData()
{
    return ["DisplayName" => "Kangle对接模块（V10版）", "APIVersion" => "1.0.0", "HelpDoc" => "http://bbs.zhuidc.com"];
}
function kanghostx_ConfigOptions()
{
    return [["type" => "yesno", "name" => "【全局】开通方式", "description" => "勾选弹性开通，否则自定义", "key" => "way"], ["type" => "yesno", "name" => "【全局】产品类型", "description" => "勾选CDN，否则主机", "key" => "parameter1"], ["type" => "yesno", "name" => "【全局】绑定子目录", "description" => "勾选开启，否则关闭", "key" => "parameter2"], ["type" => "yesno", "name" => "【全局】FTP功能", "description" => "勾选开启，否则关闭", "key" => "ftp"], ["type" => "text", "name" => "域名绑定数", "description" => "输入-1为不限制", "default" => "-1", "key" => "parameter3"], ["type" => "text", "name" => "子目录数", "description" => "输入0为不限制", "default" => "0", "key" => "parameter4"], ["type" => "text", "name" => "【全局】默认目录", "description" => "默认填wwwroot", "default" => "wwwroot", "key" => "parameter5"], ["type" => "text", "name" => "空间容量", "description" => "MB", "default" => "1024", "key" => "parameter6"], ["type" => "text", "name" => "数据库容量", "description" => "MB - 输入0表示不开通", "default" => "1024", "key" => "parameter7"], ["type" => "text", "name" => "月流量", "description" => "GB - 输入0为不限制", "default" => "1024", "key" => "parameter8"], ["type" => "text", "name" => "限制带宽", "description" => "M - 输入0为不限制", "key" => "parameter9"], ["type" => "text", "name" => "最大连接数", "description" => "输入0为不限制", "key" => "parameter10"], ["type" => "yesno", "name" => "自定义控制", "description" => "勾选开启，否则关闭", "key" => "parameter11"], ["type" => "yesno", "name" => "独立日志", "description" => "勾选开启，否则关闭", "key" => "parameter12"], ["type" => "yesno", "name" => "日志分析", "description" => "勾选开启，否则关闭", "key" => "parameter13"], ["type" => "yesno", "name" => "ssi支持", "description" => "勾选开启，否则关闭", "key" => "parameter14"], ["type" => "yesno", "name" => "伪静态", "description" => "勾选开启，否则关闭", "key" => "parameter15"], ["type" => "text", "name" => "【全局】端口", "description" => "80或80,443s", "key" => "parameter16"]];
}
function kanghostx_CreateSign($a, $skey, $r)
{
    return md5($a . $skey . $r);
}
function kanghostx_GetUrl($params, $info, $skey, $r)
{
    $url = "";
    foreach ($info as $k => $v) {
        $url .= $k . "=" . $v . "&";
    }
    return "http://" . $params["server_ip"] . ":" . $params["port"] . "/api/index.php?" . $url . "r=" . $r . "&s=" . $skey . "&json=1";
}
function kanghostx_TestLink($params)
{
    $a = "info";
    $r = rand(100000, 999999);
    $info = ["c" => "whm", "a" => $a];
    $skey = kanghostx_createsign($a, $params["accesshash"], $r);
    $url = kanghostx_geturl($params, $info, $skey, $r);
    $res = json_decode(file_get_contents($url), true);
    if ($res["result"] == 200) {
        $result["status"] = 200;
        $result["data"]["server_status"] = 1;
    } else {
        $result["status"] = 200;
        $result["data"]["server_status"] = 0;
        $result["data"]["msg"] = "连接失败，请检查密匙是否正确";
    }
    return $result;
}
function kanghostx_getServerIp()
{
    $url = "https://www.bt.cn/Api/getIpAddress";
    $url2 = "http://members.3322.org/dyndns/getip";
    $address = $_SERVER["REMOTE_ADDR"];
    if ($data = file_get_contents($url)) {
        return $data;
    }
    $data = file_get_contents($url2);
    return $data;
}
function kanghostx_CreateAccount($params)
{
    if (empty($params["password"])) {
        $sys_pwd = rand_str(8);
    } else {
        $sys_pwd = $params["password"];
    }
    $a = "add_vh";
    $r = rand(100000, 999999);
    $HostModel = new app\common\model\HostModel();
    $name = $HostModel->where("id", $params["hostid"])->value("name");
    if ($params["configoptions"]["way"] == 0) {
        $info = [];
        if (isset($params["configoptions"]["parameter1"]) && !empty($params["configoptions"]["parameter1"])) {
            $info["cdn"] = $params["configoptions"]["parameter1"];
        }
        if (isset($params["configoptions"]["parameter6"]) && !empty($params["configoptions"]["parameter6"])) {
            $info["web_quota"] = $params["configoptions"]["parameter6"];
        }
        if (isset($params["configoptions"]["parameter7"]) && !empty($params["configoptions"]["parameter7"])) {
            $info["db_quota"] = $params["configoptions"]["parameter7"];
        }
        if (isset($params["configoptions"]["parameter3"]) && !empty($params["configoptions"]["parameter3"])) {
            $info["domain"] = $params["configoptions"]["parameter3"];
        }
        if (isset($params["configoptions"]["parameter2"]) && !empty($params["configoptions"]["parameter2"])) {
            $info["subdir_flag"] = $params["configoptions"]["parameter2"];
        }
        if (isset($params["configoptions"]["parameter4"]) && !empty($params["configoptions"]["parameter4"])) {
            $info["max_subdir"] = $params["configoptions"]["parameter4"];
        }
        if (isset($params["configoptions"]["parameter8"]) && !empty($params["configoptions"]["parameter8"])) {
            $info["flow_limit"] = $params["configoptions"]["parameter8"];
        }
        if (isset($params["configoptions"]["parameter5"]) && !empty($params["configoptions"]["parameter5"])) {
            $info["subdir"] = $params["configoptions"]["parameter5"];
        }
        if (isset($params["configoptions"]["parameter9"]) && !empty($params["configoptions"]["parameter9"])) {
            $info["speed_limit"] = $params["configoptions"]["parameter9"] * 128;
        }
        if (isset($params["configoptions"]["ftp"]) && !empty($params["configoptions"]["ftp"])) {
            $info["ftp"] = $params["configoptions"]["ftp"];
        }
        if (isset($params["configoptions"]["parameter10"]) && !empty($params["configoptions"]["parameter10"])) {
            $info["max_connect"] = $params["configoptions"]["parameter10"];
        }
        if (isset($params["configoptions"]["parameter11"]) && !empty($params["configoptions"]["parameter11"])) {
            $info["access"] = $params["configoptions"]["parameter11"];
        }
        if (isset($params["configoptions"]["parameter15"]) && !empty($params["configoptions"]["parameter15"])) {
            $info["htaccess"] = $params["configoptions"]["parameter15"];
        }
        if (isset($params["configoptions"]["parameter12"]) && !empty($params["configoptions"]["parameter12"])) {
            $info["log_file"] = $params["configoptions"]["parameter12"];
        }
        if (isset($params["configoptions"]["parameter13"]) && !empty($params["configoptions"]["parameter13"])) {
            $info["log_handle"] = $params["configoptions"]["parameter13"];
        }
        if (isset($params["configoptions"]["parameter14"]) && !empty($params["configoptions"]["parameter14"])) {
            $info["ssi"] = $params["configoptions"]["parameter14"];
        }
        if (isset($params["configoptions"]["parameter16"]) && !empty($params["configoptions"]["parameter16"])) {
            $info["port"] = $params["configoptions"]["parameter16"];
        }
        $info["c"] = "whm";
        $info["a"] = $a;
        $info["init"] = 1;
        $info["name"] = $name;
        $info["passwd"] = $sys_pwd;
        $info["module"] = "php";
        $info["db_type"] = "mysql";
    } else {
        if ($params["configoptions"]["way"] == 1) {
            $info = [];
            if (isset($params["configoptions"]["parameter1"]) && !empty($params["configoptions"]["parameter1"])) {
                $info["cdn"] = $params["configoptions"]["parameter1"];
            }
            if (isset($params["configoptions"]["kl_site"]) && !empty($params["configoptions"]["kl_site"])) {
                $info["web_quota"] = $params["configoptions"]["kl_site"];
            }
            if (isset($params["configoptions"]["kl_sql"]) && !empty($params["configoptions"]["kl_sql"])) {
                $info["db_quota"] = $params["configoptions"]["kl_sql"];
            }
            if (isset($params["configoptions"]["kl_domain"]) && !empty($params["configoptions"]["kl_domain"])) {
                $info["domain"] = $params["configoptions"]["kl_domain"];
            }
            if (isset($params["configoptions"]["parameter2"]) && !empty($params["configoptions"]["parameter2"])) {
                $info["subdir_flag"] = $params["configoptions"]["parameter2"];
            }
            if (isset($params["configoptions"]["kl_zi"]) && !empty($params["configoptions"]["kl_zi"])) {
                $info["max_subdir"] = $params["configoptions"]["kl_zi"];
            }
            if (isset($params["configoptions"]["kl_flow"]) && !empty($params["configoptions"]["kl_flow"])) {
                $info["flow_limit"] = $params["configoptions"]["kl_flow"];
            }
            if (isset($params["configoptions"]["parameter5"]) && !empty($params["configoptions"]["parameter5"])) {
                $info["subdir"] = $params["configoptions"]["parameter5"];
            }
            if (isset($params["configoptions"]["kl_speed"]) && !empty($params["configoptions"]["kl_speed"])) {
                $info["speed_limit"] = $params["configoptions"]["kl_speed"] * 128;
            }
            if (isset($params["configoptions"]["ftp"]) && !empty($params["configoptions"]["ftp"])) {
                $info["ftp"] = $params["configoptions"]["ftp"];
            }
            if (isset($params["configoptions"]["kl_connect"]) && !empty($params["configoptions"]["kl_connect"])) {
                $info["max_connect"] = $params["configoptions"]["kl_connect"];
            }
            if (isset($params["configoptions"]["kl_access"]) && !empty($params["configoptions"]["kl_access"])) {
                $info["access"] = $params["configoptions"]["kl_access"];
            }
            if (isset($params["configoptions"]["kl_htaccess"]) && !empty($params["configoptions"]["kl_htaccess"])) {
                $info["htaccess"] = $params["configoptions"]["kl_htaccess"];
            }
            if (isset($params["configoptions"]["kl_log_file"]) && !empty($params["configoptions"]["kl_log_file"])) {
                $info["log_file"] = $params["configoptions"]["kl_log_file"];
            }
            if (isset($params["configoptions"]["kl_log_handle"]) && !empty($params["configoptions"]["kl_log_handle"])) {
                $info["log_handle"] = $params["configoptions"]["kl_log_handle"];
            }
            if (isset($params["configoptions"]["kl_ssi"]) && !empty($params["configoptions"]["kl_ssi"])) {
                $info["ssi"] = $params["configoptions"]["kl_ssi"];
            }
            if (isset($params["configoptions"]["parameter16"]) && !empty($params["configoptions"]["parameter16"])) {
                $info["port"] = $params["configoptions"]["parameter16"];
            }
            $info["c"] = "whm";
            $info["a"] = $a;
            $info["init"] = 1;
            $info["name"] = $name;
            $info["passwd"] = $sys_pwd;
            $info["module"] = "php";
            $info["db_type"] = "mysql";
        }
    }
    $skey = kanghostx_createsign($a, $params["accesshash"], $r);
    $url = kanghostx_geturl($params, $info, $skey, $r);
    $result = json_decode(file_get_contents($url), true);
    if ($result["result"] == 200) {
        $HostModel = new app\common\model\HostModel();
        $HostModel->where("id", $params["hostid"])->update(["status" => "Active"]);
        $IdcsmartCommonServerHostLinkModel = new server\idcsmart_common\model\IdcsmartCommonServerHostLinkModel();
        $update["dedicatedip"] = $params["server_ip"];
        $update["username"] = $name;
        $update["password"] = password_encrypt($sys_pwd);
        $IdcsmartCommonServerHostLinkModel->where("host_id", $params["hostid"])->update($update);
        return "success";
    }
    if ($result["result"] == 500) {
        return ["status" => "error", "msg" => "主机名已存在，请修改主机名"];
    }
    return ["status" => "error", "msg" => "未知错误"];
}
function kanghostx_ChangePackage($params)
{
    if (empty($params["password"])) {
        $sys_pwd = rand_str(8);
    } else {
        $sys_pwd = $params["password"];
    }
    $HostModel = new app\common\model\HostModel();
    $name = $HostModel->where("id", $params["hostid"])->value("name");
    $a = "add_vh";
    $r = rand(100000, 999999);
    if (isset($params["configoptions"]["parameter1"]) && !empty($params["configoptions"]["parameter1"])) {
        $info["cdn"] = $params["configoptions"]["parameter1"];
    }
    if (isset($params["configoptions"]["kl_site"]) && !empty($params["configoptions"]["kl_site"])) {
        $info["web_quota"] = $params["configoptions"]["kl_site"];
    }
    if (isset($params["configoptions"]["kl_sql"]) && !empty($params["configoptions"]["kl_sql"])) {
        $info["db_quota"] = $params["configoptions"]["kl_sql"];
    }
    if (isset($params["configoptions"]["kl_domain"]) && !empty($params["configoptions"]["kl_domain"])) {
        $info["domain"] = $params["configoptions"]["kl_domain"];
    }
    if (isset($params["configoptions"]["parameter2"]) && !empty($params["configoptions"]["parameter2"])) {
        $info["subdir_flag"] = $params["configoptions"]["parameter2"];
    }
    if (isset($params["configoptions"]["kl_zi"]) && !empty($params["configoptions"]["kl_zi"])) {
        $info["max_subdir"] = $params["configoptions"]["kl_zi"];
    }
    if (isset($params["configoptions"]["kl_flow"]) && !empty($params["configoptions"]["kl_flow"])) {
        $info["flow_limit"] = $params["configoptions"]["kl_flow"];
    }
    if (isset($params["configoptions"]["parameter5"]) && !empty($params["configoptions"]["parameter5"])) {
        $info["subdir"] = $params["configoptions"]["parameter5"];
    }
    if (isset($params["configoptions"]["kl_speed"]) && !empty($params["configoptions"]["kl_speed"])) {
        $info["speed_limit"] = $params["configoptions"]["kl_speed"] * 128;
    }
    if (isset($params["configoptions"]["ftp"]) && !empty($params["configoptions"]["ftp"])) {
        $info["ftp"] = $params["configoptions"]["ftp"];
    }
    if (isset($params["configoptions"]["kl_connect"]) && !empty($params["configoptions"]["kl_connect"])) {
        $info["max_connect"] = $params["configoptions"]["kl_connect"];
    }
    if (isset($params["configoptions"]["kl_access"]) && !empty($params["configoptions"]["kl_access"])) {
        $info["access"] = $params["configoptions"]["kl_access"];
    }
    if (isset($params["configoptions"]["kl_htaccess"]) && !empty($params["configoptions"]["kl_htaccess"])) {
        $info["htaccess"] = $params["configoptions"]["kl_htaccess"];
    }
    if (isset($params["configoptions"]["kl_log_file"]) && !empty($params["configoptions"]["kl_log_file"])) {
        $info["log_file"] = $params["configoptions"]["kl_log_file"];
    }
    if (isset($params["configoptions"]["kl_log_handle"]) && !empty($params["configoptions"]["kl_log_handle"])) {
        $info["log_handle"] = $params["configoptions"]["kl_log_handle"];
    }
    if (isset($params["configoptions"]["kl_ssi"]) && !empty($params["configoptions"]["kl_ssi"])) {
        $info["ssi"] = $params["configoptions"]["kl_ssi"];
    }
    if (isset($params["configoptions"]["parameter16"]) && !empty($params["configoptions"]["parameter16"])) {
        $info["port"] = $params["configoptions"]["parameter16"];
    }
    $info["c"] = "whm";
    $info["a"] = $a;
    $info["init"] = 1;
    $info["edit"] = 1;
    $info["name"] = $name;
    $info["passwd"] = $sys_pwd;
    $info["module"] = "php";
    $info["db_type"] = "mysql";
    $skey = kanghostx_createsign($a, $params["accesshash"], $r);
    $url = kanghostx_geturl($params, $info, $skey, $r);
    $result = json_decode(file_get_contents($url), true);
    if (isset($result["result"]) && $result["result"] == 200) {
        return ["status" => "success", "msg" => "主机升降级成功"];
    }
    return ["status" => "error", "msg" => "主机升降级失败"];
}
function kanghostx_SuspendAccount($params)
{
    $HostModel = new app\common\model\HostModel();
    $name = $HostModel->where("id", $params["hostid"])->value("name");
    $a = "update_vh";
    $r = rand(100000, 999999);
    $info = ["c" => "whm", "a" => $a, "name" => $name, "status" => "1"];
    $skey = kanghostx_createsign($a, $params["accesshash"], $r);
    $url = kanghostx_geturl($params, $info, $skey, $r);
    $result = json_decode(file_get_contents($url), true);
    if ($result["result"] == 200) {
        return ["status" => "success", "msg" => "主机暂停成功"];
    }
    return ["status" => "error", "msg" => "主机暂停失败"];
}
function kanghostx_UnsuspendAccount($params)
{
    $HostModel = new app\common\model\HostModel();
    $name = $HostModel->where("id", $params["hostid"])->value("name");
    $a = "update_vh";
    $r = rand(100000, 999999);
    $info = ["c" => "whm", "a" => $a, "name" => $name, "status" => "0"];
    $skey = kanghostx_createsign($a, $params["accesshash"], $r);
    $url = kanghostx_geturl($params, $info, $skey, $r);
    $result = json_decode(file_get_contents($url), true);
    if ($result["result"] == 200) {
        return ["status" => "success", "msg" => "主机解除暂停成功"];
    }
    return ["status" => "error", "msg" => "主机解除暂停失败"];
}
function kanghostx_TerminateAccount($params)
{
    $HostModel = new app\common\model\HostModel();
    $name = $HostModel->where("id", $params["hostid"])->value("name");
    $a = "del_vh";
    $r = rand(100000, 999999);
    $info = ["c" => "whm", "a" => $a, "name" => $name];
    $skey = kanghostx_createsign($a, $params["accesshash"], $r);
    $url = kanghostx_geturl($params, $info, $skey, $r);
    $result = json_decode(file_get_contents($url), true);
    if ($result["result"] == 200) {
        return ["status" => "success", "msg" => "主机删除成功"];
    }
    return ["status" => "error", "msg" => "主机删除失败"];
}
function kanghostx_Renew($params)
{
    $res = kanghostx_unsuspendaccount($params);
    if ($res == "success") {
        return ["status" => "success", "msg" => "主机续费成功"];
    }
    return ["status" => "error", "msg" => "主机续费失败"];
}
function kanghostx_on($params)
{
    $Statusinfo = kanghostx_Status($params);
    $status = $Statusinfo["data"]["status"];
    $ss = $Statusinfo["data"]["des"];
    if (in_array($status, ["off", "waiting"])) {
        return ["status" => "error", "msg" => "主机状态【" . $Statusinfo["data"]["des"] . "】 ，禁止当前操作"];
    }
    $HostModel = new app\common\model\HostModel();
    $name = $HostModel->where("id", $params["hostid"])->value("name");
    $a = "update_vh";
    $r = rand(100000, 999999);
    $info = ["c" => "whm", "a" => $a, "name" => $name, "status" => "0"];
    $skey = kanghostx_createsign($a, $params["accesshash"], $r);
    $url = kanghostx_geturl($params, $info, $skey, $r);
    $result = json_decode(file_get_contents($url), true);
    if ($result["result"] == 200) {
        return ["status" => "success", "msg" => "主机开启成功"];
    }
    return ["status" => "error", "msg" => "主机开启失败"];
}
function kanghostx_off($params)
{
    $Statusinfo = kanghostx_Status($params);
    $status = $Statusinfo["data"]["status"];
    $ss = $Statusinfo["data"]["des"];
    if (in_array($status, ["off", "waiting"])) {
        return ["status" => "error", "msg" => "主机状态【" . $Statusinfo["data"]["des"] . "】 ，禁止当前操作"];
    }
    $HostModel = new app\common\model\HostModel();
    $name = $HostModel->where("id", $params["hostid"])->value("name");
    $a = "update_vh";
    $r = rand(100000, 999999);
    $info = ["c" => "whm", "a" => $a, "name" => $name, "status" => "1"];
    $skey = kanghostx_createsign($a, $params["accesshash"], $r);
    $url = kanghostx_geturl($params, $info, $skey, $r);
    $result = json_decode(file_get_contents($url), true);
    if ($result["result"] == 200) {
        return ["status" => "success", "msg" => "主机关机成功"];
    }
    return ["status" => "error", "msg" => "主机关机失败"];
}
function kanghostx_GetHostInfo($params)
{
    $HostModel = new app\common\model\HostModel();
    $name = $HostModel->where("id", $params["hostid"])->value("name");
    $a = "getvh";
    $r = rand(100000, 999999);
    $info = ["c" => "whm", "a" => $a, "name" => $name];
    $skey = kanghostx_createsign($a, $params["accesshash"], $r);
    $url = kanghostx_geturl($params, $info, $skey, $r);
    $result = json_decode(file_get_contents($url), true);
    if ($result["result"] == 200) {
        return $result;
    }
    return "获取失败";
}
function kanghostx_Status($params)
{
    $res = kanghostx_gethostinfo($params);
    if ($res["result"] == 200) {
        $result["status"] = "success";
        if ($res["status"] == 0) {
            $result["data"]["status"] = "on";
            $result["data"]["des"] = "<span style='background-color: #428bca; color: #fff; padding: 5px 10px; border-radius: 5px;'>正常运行</span>";
        } else {
            if ($res["status"] == 1) {
                $result["data"]["status"] = "suspend";
                $result["data"]["des"] = "<span style='background-color: #999; color: #fff; padding: 5px 10px; border-radius: 5px;'>已暂停</span>";
            } else {
                if ($res["status"] == 2) {
                    $result["data"]["status"] = "off";
                    $result["data"]["des"] = "<span style='background-color: #d9534f; color: #fff; padding: 5px 10px; border-radius: 5px;'>超流量</span>";
                } else {
                    if ($res["status"] == 3) {
                        $result["data"]["status"] = "waiting";
                        $result["data"]["des"] = "<span style='background-color: #f0ad4e; color: #fff; padding: 5px 10px; border-radius: 5px;'>超数据库</span>";
                    } else {
                        $result["data"]["status"] = "unknown";
                        $result["data"]["des"] = "<span style='background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px;'>异常</span>";
                    }
                }
            }
        }
        return $result;
    }
    return ["status" => "error", "msg" => "获取失败"];
}
function kanghostx_CrackPassword($params, $new_pass)
{
    $HostModel = new app\common\model\HostModel();
    $name = $HostModel->where("id", $params["hostid"])->value("name");
    $a = "change_password";
    $r = rand(100000, 999999);
    $info = ["c" => "whm", "a" => $a, "name" => $name, "passwd" => $new_pass];
    $skey = kanghostx_createsign($a, $params["accesshash"], $r);
    $url = kanghostx_geturl($params, $info, $skey, $r);
    $result = json_decode(file_get_contents($url), true);
    if ($result["result"] == 200) {
        return ["status" => "success", "msg" => "主机密码重置成功"];
    }
    return ["status" => "error", "msg" => "主机密码重置失败"];
}
function kanghostx_ClientArea($params)
{
    return ["index" => ["name" => "主机产品信息"]];
}
function kanghostx_ClientAreaOutput($params, $key)
{
    $res = kanghostx_gethostinfo($params);
    $info = kanghostx_status($params);
    $status = $info["data"]["des"];
    $lei = "<span style='background-color: " . ($res["cdn"] == 1 ? "#d9534f" : "#5cb85c") . "; color: #fff; padding: 5px 10px; border-radius: 5px;'>" . ($res["cdn"] == 1 ? "CDN" : "主机") . "</span>";
    if ($res["cdn"] == 1) {
        $hide = "style=\"display: none;\"";
    } else {
        $hide = "style=\"text-align: center;\"";
    }
    $server_ip = $params["server_ip"];
    $port = $params["port"];
    $password = $params["password"];
    switch ($key) {
        case "index":
            $output = "\n<style>\n  .table-mains {\n  width: 100%;\n  border-collapse: collapse;\n}\n.table-mains thead tr {\n  background-color: #f1f1f1;\n}\n.table-mains th,\n.table-mains td {\n  padding: 8px;\n  border: 1px solid #ddd;\n}\n.table-mains tbody tr:nth-child(even) {\n  background-color: #f9f9f9;\n}\n.table-mains tbody tr:hover {\n  background-color: #ccc;\n}\n.btn-info {\n  background-color: #5bc0de;\n  color: #fff;\n  border: 1px solid #5bc0de;\n  border-radius: 5px;\n  padding: 10px 20px;\n  text-align: center;\n  text-decoration: none;\n  display: inline-block;\n  font-size: 16px;\n}\n.btn-info:hover {\n  background-color: #46b8da;\n  border-color: #46b8da;\n}\n</style>\n    <td data-label='操作'>\n              <form action='http://" . $server_ip . ":" . $port . "/vhost/index.php?c=session&a=login' method='post' target='_blank'>\n        <input type='hidden' name='username' value='" . $res["name"] . "' />\n\t\t<input type='hidden' name='passwd' value='" . $password . "' />\n\t\t<button type='submit' class='btn btn-info'><i class='bx bx-exit'></i> 登录面板</button>\n\t\t</form>\n      </td>\n    <table class='table-mains'>\n      <thead>\n        <tr>\n          <th>状态</th>\n          <th>产品类型</th>\n          <th>面板账号</th>\n          <th>面板密码</th>\n          <th <?php echo " . $hide . "; ?>数据库账号</th>\n        </tr>\n      </thead>\n      <tbody style='height: 50px;'>\n        <tr>\n          <td style='text-align: center;'>" . $status . "</td>\n          <td style='text-align: center;'>" . $lei . "</td>\n          <td style='text-align: center;'>" . $res["name"] . "</td>\n          <td style='text-align: center;'>" . $password . "</td>\n          <td <?php echo " . $hide . "; ?>" . $res["db_name"] . "</td>\n        </tr>\n      </tbody>\n    </table>\n  <table class='table-mains'>\n      <thead>\n    <tr>\n      <th <?php echo " . $hide . "; ?>空间容量</th>\n      <th <?php echo " . $hide . "; ?>数据库容量</th>\n      <th>每月流量</th>\n      <th>绑定域名数</th>\n      <th>解析IP地址</th>\n    </tr>\n    </thead>\n    <tbody style='height: 50px;'>\n    <tr>\n      <td <?php echo " . $hide . "; ?>" . $res["web_quota"] . " M</td>\n      <td <?php echo " . $hide . "; ?>" . $res["db_quota"] . " M</td>\n      <td style='text-align: center;'>" . $res["flow_limit"] . " G</td>\n      <td style='text-align: center;'>" . $res["domain"] . " 个</td>\n      <td style='text-align: center;'>" . $server_ip . "</td>\n    </tr>\n    </tbody>\n    ";
            break;
        default:
            return $output;
    }
}
function kanghostx_idcsmartauthorizes()
{
}

?>
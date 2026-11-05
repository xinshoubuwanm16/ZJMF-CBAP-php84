<?php
echo "\n";
function bthostx_MetaData()
{
    return ["DisplayName" => "宝塔虚拟主机（Bthost模块V10版）", "APIVersion" => "1.0.0", "HelpDoc" => "http://auths.yum6.cn/"];
}
function bthostx_ConfigOptions()
{
    return [["type" => "yesno", "name" => "开通方式", "description" => "勾选弹性，否则自定义", "key" => "way"], ["type" => "yesno", "name" => "[全局] FTP功能", "description" => "勾选开启FTP功能", "key" => "parameter1"], ["type" => "yesno", "name" => "[全局] 子目录功能", "description" => "勾选开启子目录功能", "key" => "parameter2"], ["type" => "yesno", "name" => "[全局] 域名审核", "description" => "勾选绑定域名需要审核", "key" => "parameter3"], ["type" => "yesno", "name" => "[全局] session", "description" => "勾选隔离，否则不隔离", "key" => "parameter1"], ["type" => "yesno", "name" => "[全局] vsftpd", "description" => "勾选启用，需要宝塔安装有", "key" => "parameter5"], ["type" => "text", "name" => "[全局] 分类ID", "description" => "默认为0，不建议修改", "default" => "0", "key" => "parameter6"], ["type" => "text", "name" => "[全局] 域名池ID", "description" => "默认为1，不建议修改", "default" => "1", "key" => "parameter7"], ["type" => "text", "name" => "[全局] IP池ID", "description" => "默认为1，不建议修改", "default" => "1", "key" => "parameter8"], ["type" => "text", "name" => "[全局]数据库类型", "description" => "默认MySQL，修改无法开通数据库", "default" => "MySQL", "key" => "parameter9"], ["type" => "text", "name" => "[全局] PHP版本", "description" => "如7.2输入72", "default" => "72", "key" => "parameter10"], ["type" => "text", "name" => "[全局] 站点端口", "description" => "默认80", "default" => "80", "key" => "parameter11"], ["type" => "text", "name" => "网站容量", "description" => "MB", "default" => "100", "key" => "parameter12"], ["type" => "text", "name" => "数据库容量", "description" => "MB", "default" => "100", "key" => "parameter13"], ["type" => "text", "name" => "每月流量", "description" => "G", "default" => "10", "key" => "parameter14"], ["type" => "text", "name" => "带宽网速", "description" => "MB", "default" => "1", "key" => "parameter15"], ["type" => "text", "name" => "网站并发数", "description" => "个", "default" => "100", "key" => "parameter16"], ["type" => "text", "name" => "域名绑定数", "description" => "个", "default" => "2", "key" => "parameter17"], ["type" => "text", "name" => "网站备份数", "description" => "个", "default" => "2", "key" => "parameter18"], ["type" => "text", "name" => "数据库备份数", "description" => "个", "default" => "2", "key" => "parameter19"], ["type" => "text", "name" => "赠送IP", "description" => "个", "default" => "0", "key" => "parameter20"]];
}
function bthostx_CreateSign($time, $random, $token)
{
    $data["time"] = $time;
    $data["random"] = $random;
    $data["token"] = $token;
    sort($data, SORT_STRING);
    $str = implode($data);
    $signature = md5($str);
    return strtoupper($signature);
}
function bthostx_GetUrl($params, $path = "/api/vhost/index", $query = [])
{
    $url = "";
    if ($params["secure"]) {
        $url = "https://";
    } else {
        $url = "http://";
    }
    $url .= $params["server_ip"] ?: $params["server_host"];
    if (!empty($params["port"])) {
        $url .= ":" . $params["port"];
    }
    $url .= $path;
    $q = "";
    foreach ($query as $k => $v) {
        $q .= "&" . $k . "=" . $v;
    }
    if (!empty($q)) {
        $url = $url . "?" . ltrim($q, "&");
    }
    return $url;
}
function bthostx_Get($url = "")
{
    $headers[] = "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HEADER, 0);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    $data = curl_exec($curl);
    curl_close($curl);
    return $data;
}
function bthostx_Post($url, $post_data = [])
{
    $headers[] = "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
    if (empty($url) || empty($post_data)) {
        return false;
    }
    $o = "";
    foreach ($post_data as $k => $v) {
        $o .= $k . "=" . urlencode($v) . "&";
    }
    $post_data = substr($o, 0, -1);
    $postUrl = $url;
    $curlPost = $post_data;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $postUrl);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $curlPost);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $data = curl_exec($ch);
    curl_close($ch);
    return $data;
}
function bthostx_GetServerid($params)
{
    return (int) ($params["vserverid"] ?? 0);
}
function bthostx_GetHostid($params)
{
    return (int) ($params["vserverid"] ?? 0);
}
function bthostx_HostInfo($params)
{
    $hostid = bthostx_getserverid($params);
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $url = bthostx_geturl($params, "/api/vhost/host_info");
    $arr = json_decode(bthostx_post($url, $datas), true);
    $info = $arr["data"];
    if ($arr["data"]["status"] == "normal") {
        $info["status"] = "<button  class=\"btn btn-primary\"><i class=\"bx bx-world\"></i> 运行正常</button>";
    } else {
        if ($arr["data"]["status"] == "stop") {
            $info["status"] = "<button class=\"btn btn-warning\"><i class=\"bx bx-lock-alt\"></i> 已暂停</button>";
        } else {
            if ($arr["data"]["status"] == "locked") {
                $info["status"] = "<button class=\"btn btn-warning\"><i class=\"bx bx-unlink\"></i> 已锁定</button>";
            } else {
                if ($arr["data"]["status"] == "expired") {
                    $info["status"] = "<button class=\"btn btn-dark\"><i class=\"bx bx-paint-roll\"></i> 已过期</button>";
                } else {
                    if ($arr["data"]["status"] == "excess") {
                        $info["status"] = "<button class=\"btn btn-dark\"><i class=\"bx bx-stats\"></i> 已超量</button>";
                    } else {
                        $info["status"] = "<button class=\"btn btn-danger\"><i class=\"bx bx-wifi-off\"></i> 异常</button>";
                    }
                }
            }
        }
    }
    return $info;
}
function bthostx_TestLink($params)
{
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $url = bthostx_geturl($params, "/api/vhost/index", $datas);
    $res = json_decode(bthostx_get($url), true);
    if ($res["code"] == 1) {
        $result["status"] = 200;
        $result["data"]["server_status"] = 1;
    } else {
        $result["status"] = 200;
        $result["data"]["server_status"] = 0;
        $result["data"]["msg"] = $res["msg"];
    }
    return $result;
}
function bthostx_getServerIp()
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
function bthostx_CreateAccount($params)
{
    $hostid = bthostx_getserverid($params);
    if (!empty($hostid)) {
        return "已开通,不能重复开通";
    }
    if (empty($params["password"])) {
        $sys_pwd = rand_str(8);
    } else {
        $sys_pwd = $params["password"];
    }
    $HostModel = new app\common\model\HostModel();
    $name = $HostModel->where("id", $params["hostid"])->value("name");
    $info["time"] = time();
    $info["random"] = mt_rand();
    $info["token"] = $params["accesshash"];
    $infos = $info;
    unset($infos["token"]);
    $infos["signature"] = bthostx_createsign($info["time"], $info["random"], $info["token"]);
    $infos["username"] = $name;
    $infos["password"] = $sys_pwd;
    $url = bthostx_geturl($params, "/api/vhost/user_create");
    $arr = json_decode(bthostx_post($url, $infos), true);
    if ($arr["code"] !== 1) {
        return ["status" => "error", "msg" => $arr["msg"]];
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    if ($params["configoptions"]["way"] == 0) {
        if (isset($params["configoptions"]["parameter12"])) {
            $datas["pack[site_max]"] = $params["configoptions"]["parameter12"];
        }
        if (isset($params["configoptions"]["parameter13"])) {
            $datas["pack[sql_max]"] = $params["configoptions"]["parameter13"];
        }
        if (isset($params["configoptions"]["parameter17"])) {
            $datas["pack[domain_num]"] = $params["configoptions"]["parameter17"];
        }
        if (isset($params["configoptions"]["parameter14"])) {
            $datas["pack[flow_max]"] = $params["configoptions"]["parameter14"] * 1024;
        }
        if (isset($params["configoptions"]["parameter1"])) {
            $datas["pack[ftp]"] = $params["configoptions"]["parameter1"];
        }
        if (isset($params["configoptions"]["parameter11"])) {
            $datas["pack[port]"] = $params["configoptions"]["parameter11"];
        }
        if (isset($params["configoptions"]["parameter18"])) {
            $datas["pack[web_back_num]"] = $params["configoptions"]["parameter18"];
        }
        if (isset($params["configoptions"]["parameter19"])) {
            $datas["pack[sql_back_num]"] = $params["configoptions"]["parameter19"];
        }
        if (isset($params["configoptions"]["parameter9"])) {
            $datas["pack[sql]"] = $params["configoptions"]["parameter9"];
        }
        if (isset($params["configoptions"]["parameter4"])) {
            $datas["pack[session]"] = $params["configoptions"]["parameter4"];
        }
        if (isset($params["configoptions"]["parameter5"])) {
            $datas["pack[vsftpd]"] = $params["configoptions"]["parameter5"];
        }
        if (isset($params["configoptions"]["parameter6"])) {
            $datas["sort_id"] = $params["configoptions"]["parameter6"];
        }
        if (isset($params["configoptions"]["parameter7"])) {
            $datas["pack[domainpools_id]"] = $params["configoptions"]["parameter7"];
        }
        if (isset($params["configoptions"]["parameter8"])) {
            $datas["pack[ippools_id]"] = $params["configoptions"]["parameter8"];
        }
        if (isset($params["configoptions"]["parameter20"])) {
            $datas["pack[ip_num]"] = $params["configoptions"]["parameter20"];
        }
        if (isset($params["configoptions"]["parameter2"])) {
            $datas["pack[sub_bind]"] = $params["configoptions"]["parameter2"];
        }
        if (isset($params["configoptions"]["parameter3"])) {
            $datas["pack[domain_audit]"] = $params["configoptions"]["parameter3"];
        }
        if (isset($params["configoptions"]["parameter10"])) {
            $datas["pack[phpver]"] = $params["configoptions"]["parameter10"];
        }
        if (isset($params["configoptions"]["parameter16"])) {
            $datas["pack[perserver]"] = $params["configoptions"]["parameter16"];
        }
        if (isset($params["configoptions"]["parameter15"])) {
            $datas["pack[limit_rate]"] = $params["configoptions"]["parameter15"] * 1024 / 8;
        }
    } else {
        if ($params["configoptions"]["way"] == 1) {
            if (isset($params["configoptions"]["bt_site"])) {
                $datas["pack[site_max]"] = $params["configoptions"]["bt_site"];
            }
            if (isset($params["configoptions"]["bt_sql"])) {
                $datas["pack[sql_max]"] = $params["configoptions"]["bt_sql"];
            }
            if (isset($params["configoptions"]["bt_domain"])) {
                $datas["pack[domain_num]"] = $params["configoptions"]["bt_domain"];
            }
            if (isset($params["configoptions"]["bt_flow"])) {
                $datas["pack[flow_max]"] = $params["configoptions"]["bt_flow"] * 1024;
            }
            if (isset($params["configoptions"]["parameter1"])) {
                $datas["pack[ftp]"] = $params["configoptions"]["parameter1"];
            }
            if (isset($params["configoptions"]["parameter11"])) {
                $datas["pack[port]"] = $params["configoptions"]["parameter11"];
            }
            if (isset($params["configoptions"]["bt_webback"])) {
                $datas["pack[web_back_num]"] = $params["configoptions"]["bt_webback"];
            }
            if (isset($params["configoptions"]["bt_sqlback"])) {
                $datas["pack[sql_back_num]"] = $params["configoptions"]["bt_sqlback"];
            }
            if (isset($params["configoptions"]["parameter9"])) {
                $datas["pack[sql]"] = $params["configoptions"]["parameter9"];
            }
            if (isset($params["configoptions"]["parameter4"])) {
                $datas["pack[session]"] = $params["configoptions"]["parameter4"];
            }
            if (isset($params["configoptions"]["parameter5"])) {
                $datas["pack[vsftpd]"] = $params["configoptions"]["parameter5"];
            }
            if (isset($params["configoptions"]["parameter6"])) {
                $datas["sort_id"] = $params["configoptions"]["parameter6"];
            }
            if (isset($params["configoptions"]["parameter7"])) {
                $datas["pack[domainpools_id]"] = $params["configoptions"]["parameter7"];
            }
            if (isset($params["configoptions"]["parameter8"])) {
                $datas["pack[ippools_id]"] = $params["configoptions"]["parameter8"];
            }
            if (isset($params["configoptions"]["bt_ipnum"])) {
                $datas["pack[ip_num]"] = $params["configoptions"]["bt_ipnum"];
            }
            if (isset($params["configoptions"]["parameter2"])) {
                $datas["pack[sub_bind]"] = $params["configoptions"]["parameter2"];
            }
            if (isset($params["configoptions"]["parameter3"])) {
                $datas["pack[domain_audit]"] = $params["configoptions"]["parameter3"];
            }
            if (isset($params["configoptions"]["parameter10"])) {
                $datas["pack[phpver]"] = $params["configoptions"]["parameter10"];
            }
            if (isset($params["configoptions"]["bt_perserver"])) {
                $datas["pack[perserver]"] = $params["configoptions"]["bt_perserver"];
            }
            if (isset($params["configoptions"]["bt_limit"])) {
                $datas["pack[limit_rate]"] = $params["configoptions"]["bt_limit"] * 1024 / 8;
            }
        }
    }
    $datas["endtime"] = "2099-12-31";
    $datas["user_id"] = $arr["data"]["id"];
    $urls = bthostx_geturl($params, "/api/vhost/host_build");
    $res = json_decode(bthostx_post($urls, $datas), true);
    if ($res["code"] == 1) {
        $serverip = bthostx_geturl($params);
        $url_parts = parse_url($serverip);
        $server_ip = $url_parts["host"];
        $HostModel = new app\common\model\HostModel();
        $HostModel->where("id", $params["hostid"])->update(["status" => "Active"]);
        $IdcsmartCommonServerHostLinkModel = new server\idcsmart_common\model\IdcsmartCommonServerHostLinkModel();
        $update["dedicatedip"] = $server_ip;
        $update["username"] = $arr["data"]["username"];
        $update["password"] = password_encrypt($sys_pwd);
        $update["vserverid"] = $res["data"]["site"]["id"];
        $IdcsmartCommonServerHostLinkModel->where("host_id", $params["hostid"])->update($update);
        return ["status" => "success", "msg" => $res["msg"]];
    }
    return ["status" => "error", "msg" => $res["msg"]];
}
function bthostx_Speed($params, $bthostx_per = 300, $bthostx_limit = 512)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误";
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $datas["perserver"] = $bthostx_per;
    $datas["limit_rate"] = $bthostx_limit;
    $url = bthostx_geturl($params, "/api/vhost/host_speed");
    $res = json_decode(bthostx_post($url, $datas), true);
    if ($res["code"] == 1) {
        return ["status" => "success", "msg" => $res["msg"]];
    }
    return ["status" => "error", "msg" => $res["msg"]];
}
function bthostx_UnSpeed($params)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误";
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $url = bthostx_geturl($params, "/api/vhost/host_speedoff");
    $res = json_decode(bthostx_post($url, $datas), true);
    if ($res["code"] == 1) {
        return ["status" => "success", "msg" => $res["msg"]];
    }
    return ["status" => "error", "msg" => $res["msg"]];
}
function bthostx_ChangePackage($params)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误";
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    if ($params["configoptions"]["way"] == 0) {
        return ["status" => "error", "msg" => "自定义配置不支持升降级"];
    }
    if ($params["configoptions"]["way"] == 1) {
        if (isset($params["configoptions_upgrade"]["bt_site"])) {
            $datas["site_max"] = $params["configoptions"]["bt_site"];
        }
        if (isset($params["configoptions_upgrade"]["bt_sql"])) {
            $datas["sql_max"] = $params["configoptions"]["bt_sql"];
        }
        if (isset($params["configoptions_upgrade"]["bt_domain"])) {
            $datas["domain_max"] = $params["configoptions"]["bt_domain"];
        }
        if (isset($params["configoptions_upgrade"]["bt_flow"])) {
            $datas["flow_max"] = $params["configoptions"]["bt_flow"] * 1024;
        }
        if (isset($params["configoptions_upgrade"]["bt_webback"])) {
            $datas["web_back_num"] = $params["configoptions"]["bt_webback"];
        }
        if (isset($params["configoptions_upgrade"]["bt_sqlback"])) {
            $datas["sql_back_num"] = $params["configoptions"]["bt_sqlback"];
        }
        if (isset($params["configoptions_upgrade"]["parameter2"])) {
            $datas["sub_bind"] = $params["configoptions"]["parameter2"];
        }
        if (isset($params["configoptions_upgrade"]["parameter6"])) {
            $datas["sort_id"] = $params["configoptions"]["parameter6"];
        }
        if (isset($params["configoptions_upgrade"]["bt_perserver"])) {
            $perserver = $params["configoptions_upgrade"]["bt_perserver"];
        } else {
            $perserver = isset($params["configoptions"]["bt_perserver"]) ? $params["configoptions"]["bt_perserver"] : 0;
        }
        if (isset($params["configoptions_upgrade"]["bt_limit"])) {
            $limit_rate = $params["configoptions_upgrade"]["bt_limit"] * 1024 / 8;
        } else {
            $limit_rate = isset($params["configoptions"]["bt_limit"]) ? $params["configoptions"]["bt_limit"] * 1024 / 8 : 0;
        }
        if ($perserver == 0 || $limit_rate == 0) {
            bthostx_unspeed($params);
        } else {
            bthostx_speed($params, $perserver, $limit_rate);
        }
        bthostx_endtime($params);
        if (!empty($datas)) {
            $url = bthostx_geturl($params, "/api/vhost/host_edit");
            $res = json_decode(bthostx_post($url, $datas), true);
        }
    }
    if ($res["code"] == 1) {
        return ["status" => "success", "msg" => $res["msg"]];
    }
    return ["status" => "error", "msg" => $res["msg"]];
}
function bthostx_SuspendAccount($params)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误";
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $url = bthostx_geturl($params, "/api/vhost/host_locked");
    $res = json_decode(bthostx_post($url, $datas), true);
    if ($res["code"] == 1) {
        return ["status" => "success", "msg" => "主机暂停成功"];
    }
    return ["status" => "error", "msg" => $res["msg"] ?: "主机暂停失败"];
}
function bthostx_UnsuspendAccount($params)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误";
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $url = bthostx_geturl($params, "/api/vhost/host_start");
    $res = json_decode(bthostx_post($url, $datas), true);
    if ($res["code"] == 1) {
        return ["status" => "success", "msg" => "主机解除暂停成功"];
    }
    return ["status" => "error", "msg" => $res["msg"] ?: "主机解除暂停失败"];
}
function bthostx_TerminateAccount($params)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误）";
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $url = bthostx_geturl($params, "/api/vhost/host_recycle");
    $res = json_decode(bthostx_post($url, $datas), true);
    if ($res["code"] == 1) {
        return ["status" => "success", "msg" => "删除成功"];
    }
    return ["status" => "error", "msg" => $res["msg"] ?: "主机删除失败"];
}
function bthostx_Off($params)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误";
    }
    $info = bthostx_Status($params);
    $status = $info["data"]["status"];
    if (in_array($status, ["locked", "expired", "excess", "unknown"])) {
        return ["status" => "error", "msg" => "主机状态【" . $info["des"] . "】 ，禁止当前操作"];
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $url = bthostx_geturl($params, "/api/vhost/host_stop");
    $res = json_decode(bthostx_post($url, $datas), true);
    if ($res["code"] == 1) {
        return ["status" => "success", "msg" => $res["msg"]];
    }
    return ["status" => "error", "msg" => $res["msg"] ?: "主机暂停失败"];
}
function bthostx_On($params)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误";
    }
    $info = bthostx_Status($params);
    $status = $info["data"]["status"];
    if (in_array($status, ["locked", "expired", "excess", "unknown"])) {
        return ["status" => "error", "msg" => "主机状态【" . $info["des"] . "】 ，禁止当前操作"];
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $url = bthostx_geturl($params, "/api/vhost/host_start");
    $res = json_decode(bthostx_post($url, $datas), true);
    if ($res["code"] == 1) {
        return ["status" => "success", "msg" => "主机启动成功"];
    }
    return ["status" => "error", "msg" => $res["msg"] ?: "主机启动失败"];
}
function bthostx_bindip($params)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误";
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $url = bthostx_geturl($params, "/api/vhost/host_bindip");
    $res = json_decode(bthostx_post($url, $datas), true);
    if ($res["code"] == 1) {
        return ["status" => "success", "msg" => "主机绑定IP成功"];
    }
    return ["status" => "error", "msg" => $res["msg"] ?: "主机绑定IP失败"];
}
function bthostx_unbindip($params)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误";
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $url = bthostx_geturl($params, "/api/vhost/host_unbindip");
    $res = json_decode(bthostx_post($url, $datas), true);
    if ($res["code"] == 1) {
        return ["status" => "success", "msg" => "主机解绑IP成功"];
    }
    return ["status" => "error", "msg" => $res["msg"] ?: "主机解绑IP失败"];
}
function bthostx_Status($params)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误";
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $url = bthostx_geturl($params, "/api/vhost/host_info");
    $res = json_decode(bthostx_post($url, $datas), true);
    $result = $res["data"];
    if ($res["code"] == 1) {
        $result["status"] = "success";
        if ($res["data"]["status"] == "normal") {
            $result["data"]["status"] = "normal";
            $result["status"] = "<span style='background-color: #428bca; color: #fff; padding: 5px 10px; border-radius: 5px;'>正常运行</span>";
        } else {
            if ($res["data"]["status"] == "locked") {
                $result["data"]["status"] = "locked";
                $result["des"] = "已锁定";
                $result["status"] = "<span style='background-color: #d9534f; color: #fff; padding: 5px 10px; border-radius: 5px;'>已锁定</span>";
            } else {
                if ($res["data"]["status"] == "expired") {
                    $result["data"]["status"] = "expired";
                    $result["des"] = "已过期";
                    $result["status"] = "<span style='background-color: #f0ad4e; color: #fff; padding: 5px 10px; border-radius: 5px;'>已过期</span>";
                } else {
                    if ($res["data"]["status"] == "excess") {
                        $result["data"]["status"] = "excess";
                        $result["des"] = "已超量";
                        $result["status"] = "<span style='background-color: #5bc0de; color: #fff; padding: 5px 10px; border-radius: 5px;'>已超量</span>";
                    } else {
                        if ($res["data"]["status"] == "stop") {
                            $result["data"]["status"] = "off";
                            $result["des"] = "已暂停";
                            $result["status"] = "<span style='background-color: #999; color: #fff; padding: 5px 10px; border-radius: 5px;'>已暂停</span>";
                        } else {
                            $result["data"]["status"] = "unknown";
                            $result["des"] = "异常";
                            $result["status"] = "<span style='background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px;'>异常</span>";
                        }
                    }
                }
            }
        }
    }
    return $result;
}
function bthostx_CrackPassword($params, $new_pass)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误";
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $datas["type"] = "host";
    $datas["password"] = $new_pass;
    $url = bthostx_geturl($params, "/api/vhost/host_pass");
    $res = json_decode(bthostx_post($url, $datas), true);
    bthostx_endtime($params);
    if (isset($res["code"]) && $res["code"] == 1) {
        return ["status" => "success", "msg" => "密码重置成功，请刷新本页面"];
    }
    return ["status" => "error", "msg" => $res["msg"] ?: "密码重置失败"];
}
function bthostx_Recovery($params)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误";
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $url = bthostx_geturl($params, "/api/vhost/host_recovery");
    $res = json_decode(bthostx_post($url, $datas), true);
    if ($res["code"] == 1) {
        return ["status" => "success", "msg" => "主机恢复成功"];
    }
    return ["status" => "error", "msg" => $res["msg"] ?: "主机恢复失败"];
}
function bthostx_Renew($params)
{
    bthostx_recovery($params);
    bthostx_unsuspendaccount($params);
    bthostx_endtime($params);
    return ["status" => "success", "msg" => "主机续费成功"];
}
function bthostx_Endtime($params)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误";
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $host_id = server\idcsmart_common\model\IdcsmartCommonServerHostLinkModel::where("vserverid", $hostid)->value("host_id");
    $due_time = server\idcsmart_common\module\bthostx\model\IdcsmartHostModel::where("id", $host_id)->value("due_time");
    $datas["endtime"] = date("Y-m-d", $due_time + 86400);
    $url = bthostx_geturl($params, "/api/vhost/host_endtime");
    $res = json_decode(bthostx_post($url, $datas), true);
    if ($res["code"] == 1) {
        return ["status" => "success", "msg" => "同步到期时间成功"];
    }
    return ["status" => "error", "msg" => $res["msg"] ?: "同步到期时间失败"];
}
function bthostx_Resource($params)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误";
    }
    $data["time"] = time();
    $data["random"] = mt_rand();
    $data["token"] = $params["accesshash"];
    $datas = $data;
    unset($datas["token"]);
    $datas["signature"] = bthostx_createsign($data["time"], $data["random"], $data["token"]);
    $datas["id"] = $hostid;
    $url = bthostx_geturl($params, "/api/vhost/host_resource");
    $res = json_decode(bthostx_post($url, $datas), true);
    if (isset($res["code"]) && $res["code"] == 1) {
        return ["status" => "success", "msg" => "资源稽核成功"];
    }
    return ["status" => "error", "msg" => $res["msg"] ?: "资源稽核失败"];
}
function bthostx_ClientArea($params)
{
    return ["index" => ["name" => "宝塔主机信息"]];
}
function bthostx_ClientAreaOutput($params, $key)
{
    $hostid = bthostx_getserverid($params);
    if (empty($hostid)) {
        return "主机ID错误 " . $hostid . " ";
    }
    $hostModel = new server\idcsmart_common\model\IdcsmartCommonServerHostLinkModel();
    $username = $hostModel->where("vserverid", $hostid)->value("username");
    bthostx_endtime($params);
    $info = bthostx_status($params);
    $password = $params["password"];
    $status = $info["status"];
    $site_max = $info["site_max"];
    if ($site_max == 0) {
        $site_max = "不限制";
    } else {
        $site_max = $site_max . "M";
    }
    $site_size = $info["site_size"];
    if ($site_max == 0) {
        $site_size = "不限制";
    } else {
        $site_size = $site_size . "M";
    }
    $sql_max = $info["sql_max"];
    if ($sql_max == 0) {
        $sql_max = "不限制";
    } else {
        $sql_max = $sql_max . "M";
    }
    $sql_size = $info["sql_size"];
    if ($sql_max == 0) {
        $sql_size = "不限制";
    } else {
        $sql_size = $sql_size . "M";
    }
    $flow_max = $info["flow_max"] / 1024;
    if ($flow_max == 0) {
        $flow_max = "不限制";
    } else {
        $flow_max = $flow_max . "G";
    }
    $flow_size = $info["flow_size"] / 1024;
    if ($flow_max == 0) {
        $flow_size = "不限制";
    } else {
        $flow_size = $flow_size . "G";
    }
    $domain_max = $info["domain_max"];
    if ($domain_max == 0) {
        $domain_max = "不限制";
    } else {
        $domain_max = $domain_max . "个";
    }
    $dbusername = $info["sql"][0]["username"];
    $dbdatabase = $info["sql"][0]["database"];
    $dbpassword = $info["sql"][0]["password"];
    $url = $params["server_ip"] ?: $params["server_host"];
    switch ($key) {
        case "index":
            $output = "\n    \n<style>\n\n    \n    .table-main {\n      margin-top: 10px;\n      border-radius: 10px;\n      width: 100%;\n    }\n    \n    .table-main:hover {\n      border: 1px solid #007bfc;\n    }\n    \n    .table-main td {\n      width: auto;\n    }\n    \n    .progress {\n      height: 20px;\n      margin-bottom: 0;\n      background-color: #f5f5f5;\n      border-radius: 5px;\n    }\n    \n    .progress-bar {\n      background-color: #007bff;\n      border-radius: 5px;\n    }\n    \n  .btn-primary {\n    background-color: #428bca;\n    border-color: #428bca;\n    color: #fff;\n    padding: 10px 20px;\n    border-radius: 5px;\n    font-size: 16px;\n  }\n  \n  \n  \n  .table-mains {\n    width: 100%;\n    border-collapse: collapse;\n  }\n\n  .table-mains th,\n  .table-mains td {\n    border: 1px solid #ddd;\n    padding: 5px;\n  }\n\n  .table-mains th {\n    text-align: left;\n  }\n  \n  \n  \n  </style>\n    \n<body>\n    \n\n    <form action='http://" . $url . "/api/vhost/host_login' method='post' target='_blank'>\n    <input type='hidden' name='id' value='" . $hostid . "' />\n    <input type='hidden' name='account' value='" . $username . "' />\n    <input type='hidden' name='password' value='" . $password . "' />\n    \n    <button type='submit' class='btn btn-primary' style='background-color: #007bff; color: #fff;'>登录面板 </button>\n\n    \n    \n    <table class='table-mains'>\n      <thead>\n        <tr>\n          <th>状态</th>\n          <th>面板账号</th>\n          <th>面板密码</th>\n          <th>数据库账号</th>\n          <th>数据库密码</th>\n        </tr>\n      </thead>\n      <tbody style='height: 50px;'>\n        <tr>\n          <td data-label='已使用容量/总容量'>" . $status . "</td>\n          <td>" . $username . "</td>\n          <td>" . $password . "</td>\n          <td>" . $dbusername . "</td>\n          <td>" . $dbpassword . "</td>\n        </tr>\n      </tbody>\n    </table>\n  \n\n  <table class='table-mains'>\n      <thead>\n    <tr>\n      <th>已使用空间/总容量</th>\n      <th>已使用数据库/总数据库容量</th>\n      <th>已使用流量/每月流量</th>\n      <th>绑定域名数</th>\n      <th>解析IP地址</th>\n    </tr>\n    </thead>\n    <tbody style='height: 50px;'>\n    <tr>\n    \n      <td data-label='已使用容量/总容量'>" . $site_size . " /" . $site_max . " </td>\n      <td data-label='已使用数据库容量/总数据库容量'>" . $sql_size . " /" . $sql_max . " </td>\n      <td data-label='已使用流量/总流量'>" . $flow_size . " /" . $flow_max . " </td>\n      <td data-label='绑定域名数'>" . $domain_max . "</td>\n      <td data-label='解析IP地址'>" . $url . "</td>\n    </tr>\n    </tbody>\n    \n    \n  </table>\n\n\n\n\n";
            break;
        default:
            return $output;
    }
}
function bthostx_AllowFunction()
{
    return ["client" => ["Sync"], "admin" => ["Resource"]];
}
function bthostx_AdminButtonHide($params)
{
    $button = ["SuspendAccount" => "锁定面板", "UnsuspendAccount" => "主机启用", "Stop" => "主机停用", "Recovery" => "回收站恢复", "Resource" => "资源稽核", "Sync" => "主机同步"];
    return $button;
}
function bthostx_AdminButton($params)
{
    $button = ["SuspendAccount" => "锁定面板", "UnsuspendAccount" => "主机启用", "Stop" => "主机停用", "Recovery" => "回收站恢复", "Resource" => "资源稽核", "Sync" => "主机同步"];
    return $button;
}
function bthostx_idcsmartauthorizes()
{
}

?>
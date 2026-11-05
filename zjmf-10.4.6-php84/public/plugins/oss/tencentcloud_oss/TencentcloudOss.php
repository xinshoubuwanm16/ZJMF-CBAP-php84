<?php
namespace oss\tencentcloud_oss;

require_once __DIR__ . "/vendor/autoload.php";
/**
 * @desc 腾讯云对象存储
 * @author theworld
 * @version 1.0
 * @time 2024-04-15
 */
class TencentcloudOss extends \app\common\lib\Plugin
{
    public $info = ["name" => "TencentcloudOss", "title" => "腾讯云对象存储", "description" => "腾讯云对象存储", "status" => 1, "author" => "智简魔方", "version" => "1.0.0", "module" => "oss", "help_url" => "https://cloud.tencent.com/product/cos"];
    public $hasAdmin = 0;
    public function install()
    {
        return true;
    }
    public function uninstall()
    {
        if ($this->TencentcloudOssData()) {
            return false;
        }
        return true;
    }
    public function TencentcloudOssLink()
    {
        $config = $this->config();
        $secretId = $config["secret_id"];
        $secretKey = $config["secert_key"];
        $region = $config["region"];
        $bucket = $config["bucket"];
        if (empty($secretId) || empty($secretKey) || empty($region) || empty($bucket)) {
            return false;
        }
        try {
            $cosClient = new \Qcloud\Cos\Client(["region" => $region, "schema" => "https", "credentials" => ["secretId" => $secretId, "secretKey" => $secretKey]]);
            $result = $cosClient->HeadBucket(["Bucket" => $bucket]);
            if (!empty($result["Location"])) {
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }
    public function TencentcloudOssData()
    {
        $config = $this->config();
        $secretId = $config["secret_id"];
        $secretKey = $config["secert_key"];
        $region = $config["region"];
        $bucket = $config["bucket"];
        if (empty($secretId) || empty($secretKey) || empty($region) || empty($bucket)) {
            return false;
        }
        try {
            $cosClient = new \Qcloud\Cos\Client(["region" => $region, "schema" => "https", "credentials" => ["secretId" => $secretId, "secretKey" => $secretKey]]);
            $result = $cosClient->listObjects(["Bucket" => $bucket]);
            if (!empty($result["Contents"])) {
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }
    public function TencentcloudOssUpload($param)
    {
        $config = $this->config();
        $secretId = $config["secret_id"];
        $secretKey = $config["secert_key"];
        $region = $config["region"];
        $bucket = $config["bucket"];
        if (empty($secretId) || empty($secretKey) || empty($region) || empty($bucket)) {
            return ["status" => 400, "msg" => "配置错误"];
        }
        $file = UPLOAD_DEFAULT . $param["file_name"];
        $fileKey = rtrim($param["file_path"], "/") . "/" . $param["file_name"];
        try {
            $cosClient = new \Qcloud\Cos\Client(["region" => $region, "schema" => "https", "credentials" => ["secretId" => $secretId, "secretKey" => $secretKey]]);
            $result = $cosClient->putObject(["Bucket" => $bucket, "Key" => str_replace(WEB_ROOT, "", $fileKey), "Body" => fopen($file, "rb"), "ACL" => is_image($file) || is_pdf($file) ? "public-read" : "private"]);
        } catch (\Exception $e) {
            return ["status" => 400, "msg" => $e->getMessage()];
        }
        if (isset($result["Location"])) {
            return ["status" => 200, "msg" => lang_plugins("success_message"), "data" => ["url" => "https://" . $result["Location"]]];
        }
        return ["status" => 400, "msg" => "error"];
    }
    public function TencentcloudOssDownload($param)
    {
        $config = $this->config();
        $secretId = $config["secret_id"];
        $secretKey = $config["secert_key"];
        $region = $config["region"];
        $bucket = $config["bucket"];
        $cosClient = new \Qcloud\Cos\Client(["region" => $region, "schema" => "https", "credentials" => ["secretId" => $secretId, "secretKey" => $secretKey], "timeout" => 5, "connect_timeout" => 5]);
        $file = rtrim($param["file_path"], "/") . "/" . $param["file_name"];
        try {
            $signedUrl = $cosClient->getObjectUrl($bucket, str_replace(WEB_ROOT, "", $file), "+3 minutes", ["Params" => [rand_str() => rand_str(), rand_str() => rand_str()]]);
            return ["status" => 200, "msg" => lang_plugins("success_message"), "data" => ["url" => $signedUrl]];
        } catch (\Exception $e) {
            return ["status" => 400, "msg" => $e->getMessage()];
        }
    }
    public function config()
    {
        $config = \think\facade\Db::name("plugin")->where("name", $this->info["name"])->value("config");
        if (!empty($config) && $config != "null") {
            $config = json_decode($config, true);
        } else {
            $config = [];
        }
        $con = (require dirname(__DIR__) . "/tencentcloud_oss/config/config.php");
        $config = array_merge($con, $config);
        return $config;
    }
}

?>
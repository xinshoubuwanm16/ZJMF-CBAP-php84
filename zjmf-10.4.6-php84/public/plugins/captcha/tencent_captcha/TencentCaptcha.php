<?php
namespace captcha\tencent_captcha;

/**
 * @desc 腾讯图形验证
 * @author wyh
 * @version 1.0
 * @time 2022-08-17
 */
class TencentCaptcha extends \app\common\lib\Plugin
{
    public $info = ["name" => "TencentCaptcha", "title" => "腾讯图形验证", "description" => "腾讯图形验证", "author" => "智简魔方", "version" => "1.0.3", "help_url" => "https://console.cloud.tencent.com/captcha", "author_url" => "", "url" => ""];
    public function install()
    {
        return true;
    }
    public function uninstall()
    {
        return true;
    }
    public function TencentCaptchaDescribe()
    {
        $TencentCaptchaLogic = new logic\TencentCaptchaLogic();
        return $TencentCaptchaLogic->describe();
    }
    public function TencentCaptchaDescribeAdmin()
    {
        $TencentCaptchaLogic = new logic\TencentCaptchaLogic();
        return $TencentCaptchaLogic->describe(true);
    }
    public function TencentCaptchaVerify($param)
    {
        $TencentCaptchaLogic = new logic\TencentCaptchaLogic();
        return $TencentCaptchaLogic->verify($param);
    }
    public function Config()
    {
        $config = \think\facade\Db::name("plugin")->where("name", $this->info["name"])->value("config");
        if (!empty($config) && $config != "null") {
            $config = json_decode($config, true);
        } else {
            $config = [];
        }
        $con = (require dirname(__DIR__) . "/tencent_captcha/config/config.php");
        $config = array_merge($con, $config);
        return $config;
    }
}

?>
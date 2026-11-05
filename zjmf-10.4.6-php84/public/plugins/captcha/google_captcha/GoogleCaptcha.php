<?php
namespace captcha\google_captcha;

/**
 * @desc 谷歌图形验证
 * @author wyh
 * @version 1.0
 * @time 2022-08-17
 */
class GoogleCaptcha extends \app\common\lib\Plugin
{
    public $info = ["name" => "GoogleCaptcha", "title" => "谷歌图形验证", "description" => "谷歌图形验证", "author" => "智简魔方", "version" => "1.0.0", "help_url" => "http://www.google.com/recaptcha", "author_url" => "", "url" => ""];
    public function install()
    {
        return true;
    }
    public function uninstall()
    {
        return true;
    }
    public function GoogleCaptchaDescribe()
    {
        $GoogleCaptchaLogic = new logic\GoogleCaptchaLogic();
        return $GoogleCaptchaLogic->describe();
    }
    public function GoogleCaptchaDescribeAdmin()
    {
        $GoogleCaptchaLogic = new logic\GoogleCaptchaLogic();
        return $GoogleCaptchaLogic->describe(true);
    }
    public function GoogleCaptchaVerify($param)
    {
        $GoogleCaptchaLogic = new logic\GoogleCaptchaLogic();
        return $GoogleCaptchaLogic->verify($param);
    }
    public function Config()
    {
        $config = \think\facade\Db::name("plugin")->where("name", $this->info["name"])->value("config");
        if (!empty($config) && $config != "null") {
            $config = json_decode($config, true);
        } else {
            $config = [];
        }
        $con = (require dirname(__DIR__) . "/google_captcha/config/config.php");
        $config = array_merge($con, $config);
        return $config;
    }
}

?>
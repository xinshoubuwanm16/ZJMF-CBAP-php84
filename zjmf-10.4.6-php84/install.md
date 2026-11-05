
==============安装指南==============

1、安装宝塔
环境要求：安装Apache/Nginx、MySQL（5.6/5.7版本）、PHP（>=8.0.0，推荐 8.4）
扩展安装：软件商店-已安装，点击php-设置-安装扩展，需要 fileinfo、pdo_mysql、curl、gd、mbstring、openssl、bcmath、zip
（本版本为开源版，全目录无 ionCube 编码文件，不需要安装 ionCube 加载器）
注意：PHP 8.4 下请保持 error_reporting=E_ALL（弃用提示会写入 PHP 错误日志，不影响业务执行）
2、将安装包上传到宝塔添加的站点/www/wwwroot/域名/，并在该目录下进行安装包解压，解压后得文件必须在/www/wwwroot/域名/目录下
3、设置伪静态
对应网站-点击设置，选择伪静态，根据环境填写对应的伪静态
-------Apache伪静态规则----------
<IfModule mod_rewrite.c>

  RewriteEngine On

  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^(.*)$ index.php?s=$1 [QSA,PT,L]

  RewriteCond %{HTTP:Authorization} .
  RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

</IfModule>

-------Nginx伪静态规则-------
location / {
if (!-e $request_filename) {
rewrite ^(.*)$ /index.php?s=$1 last;
break;
}
}
4、设置运行目录
对应网站-点击设置，选择网站目录，其中运行目录设置为/public
5、魔方财务安装
导航至域名上，根据提示，进行安装即可
6、安装完成，点击登陆后台

注意：系统安装完成，还需在宝塔设置自动化任务（设置流程详见链接 https://www.idcsmart.com/wiki_list/963.html）


# 智简魔方 V10（10.4.6）PHP 8.4 改造版

上游开源地址：[idcsmart/ZJMF-CBAP](https://github.com/idcsmart/ZJMF-CBAP)（10.4.6）
插件来源：[aazooo/ZJMF-CBAP-plugins](https://github.com/aazooo/ZJMF-CBAP-plugins)（82 个插件包）

改造目标：让同一套业务代码在 **PHP 8.4** 上跑起来，且不再刷弃用日志；
约束：**不升级第三方框架**（ThinkPHP 6.0.12LTS 原地逐文件打补丁）、**不动业务流程 / 接口出入参 / 数据库结构与数据**（`idcsmart.sql` 原样保留，安装器 MySQL 门槛保持 `>=5.6 且 <5.8`）。

## 目录说明

| 目录 | 用途 |
|---|---|
| `zjmf-10.4.6-php84/` | 主交付：完整可部署源码，11712 个文件，跑 PHP 8.0+（推荐 8.4） |
| `zjmf-plugins-ioncube-php7x/` | 38 个 ionCube 加密插件包（2468 文件），**只能跑 PHP 7.2~7.4 + ionCube Loader**，不要装进 8.4 站点 |
| `zjmf-10.4.6-php84-PHP8.4改造报告.md` | 完整改造与验证报告（改动清单、验证矩阵、已知上游缺陷） |

## 快速开始

1. 环境：PHP >= 8.0.0（推荐 8.4），扩展 `fileinfo pdo_mysql curl gd mbstring openssl bcmath zip`；**不需要 ionCube 加载器**。
2. 把 `zjmf-10.4.6-php84/` 整目录部署到站点，运行目录设为 `public`，伪静态沿用原版规则。
3. 浏览器访问 `/install/install.php` 走完 step_1~step_7；**离线环境授权码请留空**（非空会请求官方 `license.soft13.idcsmart.com` 在线校验）。
4. 存量站点升级：用改造报告里描述的补丁包方式覆盖，数据库无需变更。

## 关于加密插件

`zjmf-plugins-ioncube-php7x/` 里的文件由 **ionCube Encoder for PHP 7.2** 生成（首行 `<?php //004fb`）。
ionCube Loader 15.5.1（PHP 8.4）会直接拒绝：

```
Fatal error: Only files produced by either the PHP 8.2 or 8.3 or 8.4
ionCube Encoders can run on PHP 8.4 or 8.5.
```

这是加密格式的版本锁，密文无法阅读也无法逐文件打补丁；只有原作者用 PHP 8.x 版 Encoder 重新加密才能上 8.4。
本次未修改这些包的任何字节，只做完整性与可解析性验证，详见包内 `说明.md`。

## 验证口径

- **已验证**：语法（3489 个 PHP 文件 `php -l`）、空库安装全流程、后台/客户登录、1444 条运行时路由可达、43 个明文插件经真实后台接口安装启用、后台挂件 / 商城主题 / `idcsmart_common` 子模块三类植入面、订单导出 xlsx、定时任务、生产模式冒烟；全过程 PHP 错误日志 0 行。
- **未验证**：外部面板与支付通道真实对接、短信/邮件/OSS 真实外发、MySQL 8.0/MariaDB、Apache/Nginx 实机、前台主题逐页 UI、加密插件的业务行为（详见报告 4.2）。

## 许可

沿用上游 ZJMF 的授权条款；本仓库只做 PHP 8.4 兼容性改造，不改变原始授权范围。

# 智简魔方 V10（10.4.6）PHP 8.4 改造报告

改造对象：`https://github.com/idcsmart/ZJMF-CBAP` 10.4.6 完整源码（含自带 `public/plugins` 全部插件）
插件来源：`https://github.com/aazooo/ZJMF-CBAP-plugins` 81 个插件包（第二轮移植，见第五章）
交付目录：`D:\000gongzuoqu\mfxitong\zjmf-10.4.6-php84\`（主交付，可直接跑 PHP 8.4）
交付目录：`D:\000gongzuoqu\mfxitong\zjmf-plugins-ioncube-php7x\`（ionCube 加密插件分组，只能跑 PHP 7.x，见第六章）
对照原版：`D:\000gongzuoqu\mfxitong\zjmf-src\10.4.6\`（保持未改动，用于逐文件比对）
验证环境：PHP 8.4.19（NTS x64）+ MySQL 5.7.44（本机 3307）+ 内置 `php -S` 站点，运行目录 `public`；
加密分组单独用 PHP 7.4.33（NTS）+ ionCube Loader 7.4 验证

---

## 一、结论摘要

| 项目 | 结果 |
|---|---|
| 目录结构 | 与原版**同构**：交付树 11712 个文件 = 原版 10332 + 插件移植新增 1380，相对原版**无删除、无重命名** |
| 代码改动面 | 339 个文件被改动（核心 225 + 插件 114），累计 +984 / -623 行；其余 10107 个核心文件与原版逐字节相同，1266 个移植插件文件与插件仓库逐字节相同 |
| 换行符 | 339 个改动文件与各自源文件换行符风格一致（无 CRLF/LF 漂移），diff 只包含真实改动 |
| 业务逻辑 | 未改动任何业务流程、接口出入参、数据库结构与数据（`idcsmart.sql` 原样保留） |
| 第三方框架 | ThinkPHP 6.0.12LTS（魔方自带分支）**未升级版本**，按约定逐文件原地打补丁；插件内置的 guzzle / tencentcloud SDK 同样原地补丁 |
| 语法层 | 交付树 3489 个 PHP 文件 `php -l`（PHP 8.4.19）：**0 个由本次改造引入的错误**；唯一 1 个 parse error 是插件仓库自带的 SDK 示例文件（与源仓库逐字节相同，在 PHP 7.4 上同样报错，且不会被自动加载，见 4.3）；加密分组 675 个文件单独在 PHP 7.4 + Loader 下验证 |
| 运行层 | 安装向导 step_1~step_7 全流程通过；1444 条运行时路由全部做可达性验证；43 个明文插件包全部走后台真实安装/启用接口成功；定时任务脚本正常退出 |
| 弃用告警 | 上述全过程中 PHP 错误日志 **0 行**（无 Deprecated / Warning 泄漏） |
| ionCube | 主交付树（开源版核心 + 自带插件 + 本轮明文插件）0 个编码文件；38 个第三方加密包无法在 8.4 运行，已单独分组并给出口径（见第六章） |

一句话：**同一套业务代码，PHP 7.2~7.4 能跑，PHP 8.4 也能跑，且跑起来不再刷弃用日志；唯一上不了 8.4 的是第三方用 PHP 7.2 编码器加密的 38 个插件包。**

---

## 二、部署要点（与原版的差异只有前 3 条）

1. **PHP 版本**：`>= 8.0.0`，推荐 8.4（安装器门槛已改为 8.0，`install.md` 同步更新）。
2. **PHP 扩展**：`fileinfo`、`pdo_mysql`、`curl`、`gd`、`mbstring`、`openssl`、`bcmath`、`zip`。
   **主交付树不需要 ionCube 加载器**（核心 + 自带插件 + 本轮明文插件全目录 0 个编码文件）。
   第三方那 38 个 ionCube 加密插件包**不能装进 PHP 8.4 站点**，只能装到 PHP 7.2~7.4 + ionCube Loader 15.x 的站点，见第六章与 `zjmf-plugins-ioncube-php7x/说明.md`。
3. **错误上报**：建议保持 `error_reporting = E_ALL`、`log_errors = On`。
   框架的 `think\initializer\Error::appError()` 已改造：`E_DEPRECATED / E_USER_DEPRECATED` 只写错误日志、不再转成异常，
   因此第三方库里残留的旧写法不会把业务页面打成 500；其余 Warning/Error 仍按原逻辑抛异常（与 PHP 7.4 行为一致）。
4. **MySQL**：安装器版本门槛**未改**，仍为 `>=5.6 且 <5.8`。MySQL 8.0 本次未做验证。
5. **伪静态、运行目录 `public`、自动化任务（cron）**：与原版完全相同，`install.md` 中原有说明继续适用。
6. **安装时授权码留空**：填写非空授权码会请求官方 `license.soft13.idcsmart.com` 在线校验；离线环境必须留空。
7. **Opcache**：可正常开启；如做过文件覆盖升级，记得 `opcache_reset()` 或重载 PHP-FPM。
8. **存量站点升级**：可直接用补丁包（225 个文件按相对路径覆盖，或 `patch -p1 < php84-unified.diff`），数据库无需变更。

---

## 三、改了什么（按补丁类型，数字取自核心树与原版 `zjmf-src/10.4.6` 的全量 diff）

| 补丁类型 | 规模 | 触发原因（PHP 8.x 行为变化） | 主要位置 |
|---|---|---|---|
| 隐式可空参数改显式 `?type` | 392 行 / 157 文件 | PHP 8.4 起 `function f(array $a = null)` 属弃用写法 | ThinkPHP、think-orm、think-template、symfony、league、PHPExcel、firebase |
| 属性显式声明 / 可见性调整 | 165 行 / 63 文件 | PHP 8.2 起动态创建属性弃用；子类把父类 `protected` 属性收窄为 `private` 在 8.x 是编译期致命错误 | 插件控制器补声明 `public $validate;` 16 处、`private $validate`→`protected $validate = null;` 8 处、4 个 `app/*` 基类新增 `protected $validate`、插件模型补齐 `$upstream_product_id` / `$profit_percent` 等字段（每个字段 8 个 server/reserver 副本）、PHPExcel 12 个类共 30 处 |
| `#[\ReturnTypeWillChange]` | 29 行 / 6 文件 | PHP 8.1 起实现内部接口（`ArrayAccess` / `Countable` / `Iterator`…）的方法未声明返回类型即弃用 | think-orm `Model` / `Collection`、PHPExcel `Reference` 等 |
| `strftime()` 移除 | 4 处 | PHP 8.1 起彻底移除，改用 `date()` | `PHPExcel/Calculation/DateTime.php`（全树已无 `strftime(` 调用） |
| `libxml_disable_entity_loader()` 存在性守卫 | 2 处 | PHP 8.0 起移除 | `PHPExcel/Settings.php` |
| `get_magic_quotes_runtime()` 存在性守卫 | 1 处 | PHP 8.0 起移除 | PHPExcel 共享工具 |
| 框架错误处理策略 | 1 文件 | 避免弃用提示把页面打成 500 | `vendor/topthink/framework/src/think/initializer/Error.php` |
| 导出链路属性名对齐 | 1 处 | 类里声明的是 `$debugLog`，实际读写的是 `$_debugLog`（动态属性） | `PHPExcel/Calculation.php` |
| 安装器门槛与提示 | 1 文件 | 让 PHP 8.4 环境能直接装完 | `public/install/install.php`（PHP 门槛 8.0、ionCube 改为提示项） |
| 文档 | 1 文件 | 与上面保持一致 | `install.md` |
| 说明性注释 / 空行 | 77 行 / 55 行 | 每处补丁都写了「原写法 + 为什么改」 | 全量 diff 内 |

分区域改动量：

| 区域 | 改动文件数 | 新增行 | 删除行 | 主要补丁类型 |
|---|---|---|---|---|
| `vendor/topthink`（框架 + ORM + 模板） | 78 | 228 | 208 | 显式可空（75 文件）、返回类型、错误策略 |
| `vendor/excel`（PHPExcel） | 72 | 259 | 175 | 显式可空（59 文件）、属性声明（12 文件）、返回类型（5 文件）、strftime / libxml |
| `public/plugins`（插件） | 46 | 203 | 9 | 属性声明 / 可见性为主（含 8 处 `$validate` 收窄修复） |
| `vendor/symfony` | 12 | 12 | 12 | 显式可空 |
| `vendor/league` | 10 | 10 | 10 | 显式可空 |
| `app/*`（4 个基类控制器） | 4 | 28 | 0 | 新增 `protected $validate` 声明 |
| `vendor/firebase` | 1 | 2 | 2 | 显式可空 |
| `public/install/install.php` | 1 | 6 | 5 | PHP 门槛、ionCube 提示化 |
| `install.md` | 1 | 4 | 2 | 环境说明 |
| **核心树小计** | **225** | **752** | **423** | — |
| 本轮新移植插件 `public/plugins/{certification,oss,sms,gateway,widget}` | 114 | 232 | 200 | 显式可空（100 文件）、属性声明（10 文件）、参数顺序（1）、strftime（1）、命名空间对齐（1）——详见第五章 |
| **交付树合计** | **339** | **984** | **623** | — |

> 说明：`app/` 主程序只有 4 个文件需要动，是因为魔方主程序自身的类型声明本就规整；PHP 8.4 的兼容压力集中在 vendored 的老框架与 PHPExcel。

---

## 四、验证矩阵

### 4.1 已验证（全部有可复现脚本，脚本集中在 `_work/`，未打包进交付目录）

| 验证项 | 方法 | 结果 |
|---|---|---|
| 语法 | 交付副本 3489 个 `.php` 逐文件 `php -l`（PHP 8.4.19） | 改造引入的问题 0；唯一 1 个 parse error 为插件仓库自带的 SDK 示例（未被自动加载，7.4 同样报错，见 4.3） |
| 类加载 | 全类加载扫描 + Reflection 校验动态属性 / 可见性 | 残留 30 处动态属性已全部显式化；2 处为静态误报（`__set` 拦截、trait 声明） |
| 安装全流程 | 空库 `zjmf_clean` 走 `install.php` step_1~step_7 | 全部 200；导入 182 张表；生成 `config.php`（随机后台目录）；管理员创建成功 |
| 环境检测 | step_1 在未装 ionCube 的 PHP 8.4.19 上执行 | `error=0`，直接放行 |
| 后台登录 | `POST /{后台目录}/v1/login` | 200 / 登录成功，签发 JWT |
| 客户注册与登录 | 后台建客户 + `console/v1/login`（AES-128-CBC） | 均 200，客户 JWT 可用 |
| 路由面 | 运行时路由表（插件路由由 `AppInit` 事件注册） | 1444 条（静态解析只有 503 条），后台 881 / 前台 542；全新安装与既有库结果一致 |
| 后台接口 GET | 566 条 GET 重放（有效参数、有效 token） | 517 成功、9 个 404（我构造的错路径）、1 个 204、39 个 5xx → 全部归类为上游既有缺陷（见 4.3） |
| 写类接口 | POST 461 / PUT 245 / DELETE 139 | POST 458 成功（3 个 5xx 同类上游缺陷），PUT / DELETE 全 200 |
| 插件调用面 | `gateway/wx_pay/notifyHandle`、`ali_pay_dmf`、`tp_captcha`、`idcsmartali` 认证、addon CRUD | 分发正常：微信回调 200、验证码出图、支付宝走到"app_id 未配置"分支 |
| 结构一致性 | 与原版逐文件 `cmp` + 文件清单 `comm` | 交付树 11712 = 原版 10332 + 插件新增 1380；相对原版删除 0、重命名 0；差异文件 = 225（核心）+ 114（插件） |
| 明文插件安装 | 后台真实接口 `POST /{后台}/v1/plugin`（安装）、`PUT /{后台}/v1/plugin`（启用）、`PUT /{后台}/v1/plugin/setting`（保存配置），安装名用驼峰 | 44 个清单条目 → 43 个成功落地并安装启用（1 个 `gateway/wx_pay` 与魔方自带同名插件冲突，按"不覆盖原版"跳过）；`idcsmart_plugin` 表 63 行全部 `status=1`（addon 13 / captcha 3 / certification 7 / gateway 16 / mail 5 / oauth 7 / oss 2 / server 3 / sms 7） |
| 后台挂件（widget） | `GET widget`、`PUT widget/status`、`GET widget/output/{id}`、`GET widget/data` | ToDo 挂件出现在列表、开关 200、`output` 渲染 1322 字节、`data` 返回合法 JSON |
| 商城主题（cart template） | 切 `configuration/cart_theme` 后逐主题抓 `/cart/…` 页面特征类名 | cart1 出 `first-nav`、cart2 出 `fir-nav-item`，与 default 渲染确有区别；验证后已复位为 `default` |
| 子模块（sub_server） | `GET /{后台}/v1/idcsmart_common/server/modules` + CLI 复算 `getOriginModules()` | bthostx、kanghostx 均被识别，`{module}_MetaData()` 显示名正确，`{module}_*` 生命周期函数齐备 |
| 加密分组双版本 | 38 个包 675 个编码文件逐个 `php -l`：8.4+Loader15.5.1 vs 7.4+Loader | 8.4 全部拒绝（`Only files produced by either the PHP 8.2 or 8.3 or 8.4 ionCube Encoders can run on PHP 8.4`），7.4 全部解析通过 |
| 补丁包可复现性 | 把 339 个源文件按站点路径摆好 → `patch -p1 --binary` 依次应用两份 diff → 与交付树逐文件 md5 比对 | 比对文件=339，差异=0（diff 与交付副本完全等价） |
| 数据导出 | `console/v1/order/export_excel` | 6296 字节合法 xlsx（PK 头，含 `xl/workbook.xml`、`xl/worksheets/sheet1.xml`） |
| 定时任务 | `cron/cron.php`、`cron/task.php` | 均 exit 0，无异常输出 |
| 生产模式 | `APP_DEBUG=false` 冒烟：登录 + 19 个后台 + 10 个前台接口 | 13 个真实业务接口 200；其余为我构造的错路径 404；错误日志 0 行 |
| 弃用泄漏 | 每一轮验证前后对比 `php-error.log` | 全程 0 行 |

### 4.2 未验证 / 明确无法验证

- **外部面板真实对接**：`mf_cloud` / `mf_dcim` / `whmcs_*` / `idcsmart_common` 等 server·reserver 插件需要真实上游 API 地址与密钥，本次只验证到"请求能进控制器、参数能到位"，未验证真实下单 / 开关机。
- **支付网关真实回调**：微信 / 支付宝沙箱与生产的签名联调未做。
- **授权码在线校验**：`license.soft13.idcsmart.com` 为官方外联，验证时授权码留空，走的是开源版允许的离线路径。
- **MySQL 8.0 / MariaDB**：安装器门槛按约定保持 5.6/5.7，8.0 未测（`idcsmart.sql` 未做任何改动）。
- **前台主题页面渲染**：只验证到接口层与模板文件存在性，未逐页在浏览器里走 UI。
- **短信 / 邮件 / OSS 真实外发**：只验证配置读取与调用分发。
- **PHP 8.0 / 8.1 / 8.2 / 8.3 / 8.5 交叉矩阵**：只在 8.4.19 上实测（门槛写的是 `>=8.0.0`）。
- **Apache / Nginx 实机**：验证用内置 `php -S`；伪静态沿用原版规则，未在本机逐一复测。
- **加密插件的业务面**：`zjmf-plugins-ioncube-php7x/` 只做了「双版本 `php -l` + 与源仓库逐字节 `cmp`（2468 文件，差异 0）」，**没有**在 PHP 7.4 站点里真实安装、下单或对接上游面板；解码后的业务行为无法验证，也不在本次改造范围。
- **明文插件的真实上游**：43 个已安装插件验证到「安装 / 启用 / 保存配置 / 路由分发 / 页面渲染」，但 `certification/*`（实名认证通道）、`sms/*`（短信网关）、`oss/*`（对象存储）、`oauth/*`（第三方登录）都需要真实密钥，未做真实外发。
- **`gateway/wx_pay`（跳过的 1 个包）**：与魔方 10.4.6 自带同名插件目录冲突，按「不覆盖原版文件」原则未落地；如要用插件仓库版本，需人工确认二选一。

### 4.3 残留风险与已知上游缺陷（本次未修改，已证明文件与原版 / 插件仓库逐字节相同）

这些 5xx 在 PHP 7.4 上同样存在，属于魔方 10.4.6 自身的参数校验 / 空值判断缺失，不是 PHP 8.4 兼容问题。
判定依据：`_work/prove_preexisting.php` 对每个报错点做了两项检查——「文件 md5 是否等于原版」「报错行是否落在我的改动范围内」，结果全部为 **文件一致=是，该行一致=是**。

| 现象 | 报错点 | 次数 | 性质 |
|---|---|---|---|
| `Undefined array key "limit"` | `SystemLogModel.php:159`（含 5 个插件副本） | 6 | 未传分页参数时取值 |
| `Trying to access array offset on null` | `IdcsmartSubAccountModel.php:710` | 9 | 子账号权限行缺失 |
| `Undefined array key "nat_acl_limit"` / `"product_id"` | `server/mf_cloud`、`server/mf_dcim` 的 `DataCenterModel.php:865 / :102` | 4 | 数据中心依赖真实面板返回 |
| `Trying to access array offset on null` | `server/idcsmart_common/logic/IdcsmartCommonLogic.php:450` | 2 | 购物车配置项计算需已配置产品 |
| `Undefined array key "captcha_width"` | `app/admin/controller/ConfigurationController.php:206` | 1 | 后台验证码配置读取 |
| `Undefined array key "view_html"` | `app/admin/controller/ViewController.php:32` | 1 | 后台首页视图变量 |
| `Undefined array key "relid"` | `app/common/model/SelfDefinedFieldModel.php:259` | 1 | 自定义字段分组 |
| `Undefined array key "host_id"` | `addon/idcsmart_refund/model/IdcsmartRefundModel.php:355` | 1 | 退款申请未带主机 |
| `Cannot use object of type stdClass as array` | `app/api/controller/ProductController.php:163` | 1 | api 产品详情类型混用 |
| `Undefined array key "id"` | `app/api/controller/AuthController.php:68` | 1 | `api/host/sync` 需真实主机 |
| `ClassNotFoundException` / `FuncNotFoundException` / `Call to undefined method` | `addon/idcsmart_ticket` 的 `TicketInternalController`；`reserver/mf_finance`、`reserver/whmcs_dcim`、`server/mf_dcim`、`reserver/mf_cloud` 若干 home 控制器方法 | 13 | 路由已注册但控制器方法 / 类不存在（上游遗留） |
| `InvalidArgumentException 方法参数错误:_controller` | `captcha/1` | 1 | 该路由需 `?_controller/_action` 形态调用 |
| `PUT {后台}/v1/configuration/theme` 返回 400 修改失败 | `app/admin/model/ConfigurationModel.php:1127-1170`（`themeUpdate()`） | 复现 | 校验场景只要求 `config['theme']` 10 个键中的 5 个，`themeUpdate()` 却无条件读全部 10 个键 → 少传任一可选键即 400。请求必须 10 键齐全。已用逐键诊断脚本 `_work/diag_theme_update.php` 定位，该文件与原版逐字节相同 |
| `/cart/home.htm` 500 `TemplateNotFoundException: template not exists: home` | `app/home/controller/ViewCartController.php` | 1 | 商城任一主题目录（含原版 `default`）都没有 `home.php`，上游打包缺文件；与主题移植无关 |
| `Parse error: unexpected single-quoted string "Headers"` | `public/plugins/oss/tencentcloud_oss/vendor/qcloud/cos-sdk-v5/sample/ZipFilePreviewDemo.php:20` | 1 | 腾讯云 SDK 自带示例文件少写一个逗号；md5 与插件仓库完全一致，PHP 7.4 同样致命，位于 `sample/` 目录不被自动加载 → 不影响业务，未修改 |
| 后台挂件列表为空 / `PUT widget/status` 400 挂件不存在 | `app/admin/model/AdminWidgetModel.php:36-77` + `AdminRoleWidgetModel` | 复现 | 挂件按 `idcsmart_admin_role_widget.admin_role_id=1` 的 CSV 白名单过滤，而 role 1 的全量刷新只由**实现了 `admin_widget` 钩子的 addon 插件安装**触发（`PluginModel.php:384-388`）——这类 addon 全是加密包。明文挂件需在该 CSV 里补一行 id（本次只在测试库补 `ToDo` 验证通过，未改代码） |

另有一条**上游打包缺失**（原版同样缺失，两棵树逐字节相同）：
`public/clientarea/template/default/NotFound.php` 不存在（实际文件在 `template/pc/default/` 与 `template/mobile/default/`），
而 `config/app.php` 的 `exception_tmpl.home` 指向了少了 `pc/` 一层的路径。
影响：`APP_DEBUG=false` 时，一旦非 admin 应用抛出异常，渲染错误页会触发
`include(...clientarea/template/default/NotFound.php): Failed to open stream` 并致命。
后台侧 `public/admin/template/default/notFound.php` 存在，不受影响。
本次按"保持原有结构与业务不变"的要求**没有改动它**；如需消除，改一行模板路径或补一个 `default/NotFound.php` 即可，等你确认再动。

---

## 五、插件移植（`aazooo/ZJMF-CBAP-plugins`，82 个包）

### 5.1 分流结果

| 分组 | 包数 | 落地文件 | 处置 |
|---|---|---|---|
| 明文可移植 | **44** | 按目录累计 1831（PHP 1192）；相对原版**净新增 1380** | 全部按魔方目录规则落进 `zjmf-10.4.6-php84/`，并在 PHP 8.4 站点真实安装启用 |
| ionCube 加密 | **38** | 2468 | **不落进 8.4 交付树**，单独归档为 `zjmf-plugins-ioncube-php7x/`（见第六章） |
| 明文中的例外 | 1 | — | `gateway/wx_pay` 与魔方 10.4.6 自带同名插件目录冲突，按「不覆盖原版文件」保留原版（原版 443 文件已在第一轮打过 8.4 补丁），仓库版 11 文件未覆盖；挂件目录 9 个文件里 8 个是原版自带，本轮只新增 `ToDo.php` |

明文包按类落地位置（魔方分发规则，不是随意摆放）：

| 插件类 | 包数 | 落地目录 |
|---|---|---|
| captcha / certification / gateway / mail / oauth / oss / sms / widget | 2+6+14+3+7+1+6+1 = 40 | `public/plugins/<类>/<包名>/`（widget 为 `public/plugins/widget/ToDo.php`） |
| sub_server（`bthostx`、`kanghostx`） | 2 | `public/plugins/server/idcsmart_common/module/<包名>/`（被 `ProvisionLogic::getOriginModules()` 扫描，函数式 `{module}_{Action}`） |
| 商城主题 cart1 / cart2 | 2 | `public/cart/template/pc/<主题名>/` |

### 5.2 插件侧改了什么（114 个文件，+232 / -200 行）

| 补丁类型 | 规模 | 说明 |
|---|---|---|
| 隐式可空参数改显式 `?type` / `null\|type` | 100 文件 / 187 处（另有 3 处按引用形参 `?string &$opened_path`，合计 190 处） | 集中在插件内置的 guzzlehttp、tencentcloud SDK；未升级 SDK 版本，与框架同样原地打补丁 |
| 属性显式声明 | 10 文件 / 22 处 | 抑制 PHP 8.2 动态属性弃用（`ali_pay/AlipayTradeService`、`guzzle command/psr7`、`tencentcloud AbstractClient/ClientProfile`、`officesms` 等） |
| 必填参数跟在可选参数之后 | 1 文件 / 1 处 | `sms/tysms/Tysms.php:101` `APIHttpRequestCURL($sms_type = "cn", $params, $config)` → 去掉多余默认值（PHP 8.0 起为致命错误） |
| `strftime()` 移除 | 1 文件 / 1 处 | `gateway/global_ali_pay/lib/alipay_core.function.php:62` `strftime("%Y%m%d%H%M%S",time())` → `date("YmdHis",time())` |
| 命名空间 / 类名与目录对齐 | 1 文件 / 8 处 | `gateway/goallpay_wechat/controller/IndexController.php`：上游打包时把 `goallpay_ali` 的整份代码复制进 `goallpay_wechat` 目录却没改名，命名空间与类名指向 ali，魔方按目录分发时永远实例化不到；已对齐为 `goallpay_wechat` 并把调用点变量/网关标识同步（**这是插件仓库自身的缺陷，不是 PHP 8.4 兼容问题**） |
| 说明性注释 / 属性文档块 | 11 文件 / 11 处 | 每处补丁都写了「原写法 + 为什么改」 |

分区改动量：

| 插件分区（`public/plugins/…`） | 改动文件数 | 新增行 | 删除行 |
|---|---|---|---|
| certification | 32 | 59 | 59 |
| gateway | 3 | 12 | 9 |
| oss | 40 | 74 | 70 |
| sms | 38 | 85 | 62 |
| widget | 1 | 2 | 0 |
| **小计** | **114** | **232** | **200** |

其余 1266 个移植文件与插件仓库**逐字节相同**（`_work/port_diff_report.php` 全量比对，未匹配到插件来源的文件 0 个）。

### 5.3 装机验证（真实后台接口，非静态推断）

- 安装名必须用**驼峰**（魔方 `get_plugin_class()` 用 `parse_name($name,1)`）：目录 `ali_pay` → 接口参数 `AliPay`；`tencentcloud_oss` → `TencentcloudOss`。
- 插件表 `idcsmart_plugin` 的列是 `module` / `name` / `status`（1=已启用，3=未安装），安装成功即自动启用。
- 43 个明文包全部经 `POST /{后台}/v1/plugin` 安装、`PUT /{后台}/v1/plugin` 启用、`PUT /{后台}/v1/plugin/setting` 保存配置走通；`$name`/`$module` 与目录对不上的包（如 `goallpay_wechat`）修复前安装直接报「插件不存在」。
- 三个**不走插件表分发**的植入面单独验证：后台挂件（`widget` 列表/开关/`output`/`data`）、商城主题（`cart_theme` 切换后逐主题特征类名）、`idcsmart_common` 子模块（`server/modules` 返回的模块清单与显示名）。
- 全程 `_work/php-error.log` 保持 0 行。

---

## 六、ionCube 加密插件分组（38 个包，只能跑 PHP 7.x）

### 6.1 为什么不能塞进 8.4

这些文件的头部标记是 `<?php //004fb`，由 **ionCube Encoder for PHP 7.2** 生成。ionCube Loader 15.5.1（PHP 8.4 用）在加载时直接拒绝：

```
Fatal error: Only files produced by either the PHP 8.2 or 8.3 or 8.4
ionCube Encoders can run on PHP 8.4 or 8.5.
```

这是加密格式的版本锁，**不是代码写法问题**：密文无法阅读、无法逐文件打补丁，只有原作者用 PHP 8.x 版 Encoder 重新加密才能上 8.4。本次按「保持原有结构与业务不变」的要求，未对这些包做任何修改。

### 6.2 分组交付内容

| 项 | 值 |
|---|---|
| 目录 | `zjmf-plugins-ioncube-php7x/` |
| 包数 | 38（`addon` 30、`server` 7、网站主题 `public/web/mf101` 1） |
| 文件数 | 2468（+ `_manifest.json`、`说明.md`） |
| 编码文件 | 675 个，识别方式：首行匹配 `^<\?php\s*//00[0-9a-f]{3}$` |
| 完整性 | 与插件仓库逐文件 md5 比对：比对 2468、不一致 0、缺失 0（**二进制原样复制，未改一个字节**） |
| 目录布局 | 按**目标站点相对路径**摆放，可直接整目录覆盖到 PHP 7.x 魔方站点的根 |
| 版本验证 | 675 个编码文件：PHP 7.4.33 + `ioncube_loader_win_7.4.dll` 全部解析通过；PHP 8.4.19 + `ioncube_loader_win_8.4.dll` 全部拒绝 |

### 6.3 使用条件（写在包内 `说明.md`）

- 站点 PHP 必须为 **7.2 / 7.3 / 7.4**（NTS/ZTS 按实际环境选对应 Loader），并启用 `ionCube Loader` 扩展。
- 覆盖到站点根目录后到后台「系统设置 → 插件管理」安装；安装名同样用驼峰。
- 38 个包**未**在真实 7.4 站点里装过、也没对接过上游面板与支付通道，只验证到「文件完整 + Loader 能解析」；业务面属于未验证范围。

---

## 七、交付包清单

| 文件 | 内容 |
|---|---|
| `zjmf-10.4.6-php84/`（目录） | 完整可部署源码副本（11712 文件 = 原版 10332 + 本轮移植 1380，含全部明文插件），解压后按原版流程安装，跑 PHP 8.4 |
| `zjmf-10.4.6-php84-source.zip` | 上述目录的压缩包（不含 `config.php`，安装时由向导生成） |
| `zjmf-plugins-ioncube-php7x/`（目录） | 38 个 ionCube 加密插件包（2468 文件），只能跑 PHP 7.2~7.4 + ionCube Loader；含 `_manifest.json` 与 `说明.md` |
| `zjmf-plugins-ioncube-php7x.zip` | 上述目录的压缩包 |
| `zjmf-10.4.6-php84-PHP84-patch.zip` | 增量补丁包：`patched/`（339 个改动文件，保持站点相对路径）+ `php84-core-unified.diff`（225 文件，对官方 10.4.6）+ `php84-plugins-unified.diff`（114 文件，对插件仓库落地后的站点路径）+ `README-补丁包说明.txt` + 本报告 |
| `zjmf-10.4.6-php84-PHP8.4改造报告.md` | 本文件 |

补丁包用法（详见包内 README）：
- 覆盖式：把 `patched/` 下的文件按相对路径覆盖到官方 10.4.6 站点根目录（已放好插件的站点直接覆盖即可），重载 PHP，数据库无需变更。
- diff 式：`patch -p1 --binary < php84-core-unified.diff`，再 `patch -p1 --binary < php84-plugins-unified.diff`（`--binary` 必须带，原仓库是 CRLF/LF 混合）。
- 已实测复现：把 339 个源文件按站点路径摆好 → 依次 `patch -p1 --binary` 应用两份 diff → 与交付树逐文件 md5 比对，**比对 339、差异 0**。
- 插件 diff 的应用前提是插件文件已在 `public/plugins/…` 等站点路径上（即先装插件、再打 8.4 补丁）。

---

## 附录 A：核心改动文件清单（225 个文件，对照官方 `ZJMF-CBAP` 10.4.6）

| 文件 | +行 | -行 | 补丁类型 |
|---|---|---|---|
| `app/admin/controller/BaseController.php` | 6 | 0 | 属性显式声明/可见性 |
| `app/event/controller/BaseController.php` | 6 | 0 | 属性显式声明/可见性 |
| `app/event/controller/PluginBaseController.php` | 10 | 0 | 属性显式声明/可见性 |
| `app/home/controller/BaseController.php` | 6 | 0 | 属性显式声明/可见性 |
| `install.md` | 4 | 2 | 环境门槛/日期函数 |
| `public/install/install.php` | 6 | 5 | 环境门槛/日期函数 |
| `public/plugins/addon/idcsmart_announcement/controller/AdminIndexController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_certification/controller/clientarea/CertificationController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_cloud/controller/clientarea/SecurityGroupController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_cloud/controller/clientarea/SecurityGroupRuleController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_file_download/controller/AdminIndexController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_help/controller/AdminIndexController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_news/controller/AdminIndexController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_refund/controller/RefundController.php` | 1 | 1 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_refund/controller/RefundProductController.php` | 1 | 1 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_refund/controller/RefundReasonController.php` | 1 | 1 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_refund/controller/clientarea/RefundController.php` | 1 | 1 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_renew/controller/AdminIndexController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_renew/controller/clientarea/IndexController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_ssh_key/controller/clientarea/IndexController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_sub_account/controller/AdminIndexController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_sub_account/controller/clientarea/IndexController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_ticket/controller/TicketController.php` | 1 | 1 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_ticket/controller/TicketStatusController.php` | 1 | 1 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_ticket/controller/TicketTypeController.php` | 1 | 1 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_ticket/controller/clientarea/TicketController.php` | 1 | 1 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_withdraw/controller/AdminIndexController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/idcsmart_withdraw/controller/clientarea/IndexController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/promo_code/controller/AdminIndexController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/addon/promo_code/controller/clientarea/IndexController.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/gateway/ali_pay_dmf/aop/AopClient.php` | 1 | 1 | — |
| `public/plugins/gateway/ali_pay_dmf/lotusphp_runtime/Captcha/CaptchaImageEngine.php` | 5 | 0 | 属性显式声明/可见性 |
| `public/plugins/gateway/ali_pay_dmf/lotusphp_runtime/Lotus.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/gateway/ali_pay_dmf/lotusphp_runtime/MVC/Action.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/gateway/ali_pay_dmf/lotusphp_runtime/MVC/Component.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/reserver/idcsmart_common/logic/RouteLogic.php` | 13 | 0 | 属性显式声明/可见性 |
| `public/plugins/reserver/mf_cloud/logic/RouteLogic.php` | 13 | 0 | 属性显式声明/可见性 |
| `public/plugins/reserver/mf_dcim/logic/RouteLogic.php` | 13 | 0 | 属性显式声明/可见性 |
| `public/plugins/reserver/mf_finance/logic/RouteLogic.php` | 12 | 0 | 属性显式声明/可见性 |
| `public/plugins/reserver/mf_finance_common/logic/RouteLogic.php` | 13 | 0 | 属性显式声明/可见性 |
| `public/plugins/reserver/mf_finance_dcim/logic/RouteLogic.php` | 13 | 0 | 属性显式声明/可见性 |
| `public/plugins/reserver/whmcs_cloud/logic/RouteLogic.php` | 13 | 0 | 属性显式声明/可见性 |
| `public/plugins/reserver/whmcs_dcim/logic/RouteLogic.php` | 13 | 0 | 属性显式声明/可见性 |
| `public/plugins/server/mf_cloud/logic/CloudLogic.php` | 4 | 0 | 属性显式声明/可见性 |
| `public/plugins/server/mf_dcim/logic/CloudLogic.php` | 4 | 0 | 属性显式声明/可见性 |
| `public/plugins/widget/ActiveClient.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/widget/LastVisitClient.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/widget/OnlineAdmin.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/widget/ThisMonthSale.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/widget/ThisYearClient.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/widget/ThisYearSale.php` | 3 | 0 | 属性显式声明/可见性 |
| `public/plugins/widget/ThisYearSaleDetail.php` | 3 | 0 | 属性显式声明/可见性 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Calculation.php` | 13 | 11 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Calculation/DateTime.php` | 4 | 4 | — |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Calculation/LookupRef.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Cell.php` | 4 | 4 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Chart.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Chart/Axis.php` | 3 | 0 | 属性显式声明/可见性 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Chart/Legend.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Chart/PlotArea.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Chart/Title.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/HashTable.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/NamedRange.php` | 4 | 4 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Reader/Excel5.php` | 4 | 0 | 属性显式声明/可见性 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/ReferenceHelper.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/RichText.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/RichText/Run.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Settings.php` | 2 | 2 | — |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Shared/Drawing.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Shared/Font.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Shared/JAMA/EigenvalueDecomposition.php` | 3 | 0 | 属性显式声明/可见性 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Shared/OLE.php` | 3 | 0 | 属性显式声明/可见性 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Shared/OLE/PPS/Root.php` | 7 | 0 | 属性显式声明/可见性 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Shared/OLERead.php` | 11 | 0 | 属性显式声明/可见性 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Shared/PCLZip/pclzip.lib.php` | 3 | 0 | — |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Shared/trend/polynomialBestFitClass.php` | 4 | 0 | 属性显式声明/可见性 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Style/Border.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Style/Conditional.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Style/Fill.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Style/Font.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Worksheet.php` | 7 | 7 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Worksheet/AutoFilter.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Worksheet/AutoFilter/Column.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Worksheet/AutoFilter/Column/Rule.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Worksheet/BaseDrawing.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Worksheet/Column.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Worksheet/ColumnCellIterator.php` | 6 | 1 | 显式可空参数，返回类型声明 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Worksheet/ColumnIterator.php` | 6 | 1 | 显式可空参数，返回类型声明 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Worksheet/Drawing/Shadow.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Worksheet/HeaderFooter.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Worksheet/Row.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Worksheet/RowCellIterator.php` | 6 | 1 | 显式可空参数，返回类型声明 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Worksheet/RowIterator.php` | 5 | 0 | 返回类型声明 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/WorksheetIterator.php` | 6 | 1 | 显式可空参数，返回类型声明 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007/Chart.php` | 9 | 6 | 属性显式声明/可见性，显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007/Comments.php` | 4 | 4 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007/ContentTypes.php` | 3 | 3 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007/DocProps.php` | 3 | 3 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007/Drawing.php` | 6 | 6 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007/Rels.php` | 6 | 6 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007/RelsRibbon.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007/RelsVBA.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007/StringTable.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007/Style.php` | 16 | 16 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007/Theme.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007/Workbook.php` | 14 | 14 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007/Worksheet.php` | 22 | 22 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel2007/WriterPart.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel5.php` | 3 | 0 | 属性显式声明/可见性 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel5/Font.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel5/Parser.php` | 4 | 0 | 属性显式声明/可见性 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel5/Workbook.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel5/Worksheet.php` | 5 | 1 | 属性显式声明/可见性，显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/Excel5/Xf.php` | 6 | 1 | 属性显式声明/可见性，显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/OpenDocument.php` | 2 | 2 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/OpenDocument/Content.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/OpenDocument/Meta.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/OpenDocument/MetaInf.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/OpenDocument/Mimetype.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/OpenDocument/Settings.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/OpenDocument/Styles.php` | 1 | 1 | 显式可空参数 |
| `vendor/excel/vendor/phpoffice/phpexcel/Classes/PHPExcel/Writer/OpenDocument/Thumbnails.php` | 1 | 1 | 显式可空参数 |
| `vendor/firebase/php-jwt/src/JWT.php` | 2 | 2 | 显式可空参数 |
| `vendor/league/flysystem-cached-adapter/src/Storage/PhpRedis.php` | 1 | 1 | 显式可空参数 |
| `vendor/league/flysystem-cached-adapter/src/Storage/Predis.php` | 1 | 1 | 显式可空参数 |
| `vendor/league/flysystem/src/FileExistsException.php` | 1 | 1 | 显式可空参数 |
| `vendor/league/flysystem/src/FileNotFoundException.php` | 1 | 1 | 显式可空参数 |
| `vendor/league/flysystem/src/Filesystem.php` | 1 | 1 | 显式可空参数 |
| `vendor/league/flysystem/src/FilesystemInterface.php` | 1 | 1 | 显式可空参数 |
| `vendor/league/flysystem/src/Handler.php` | 1 | 1 | 显式可空参数 |
| `vendor/league/flysystem/src/MountManager.php` | 1 | 1 | 显式可空参数 |
| `vendor/league/mime-type-detection/src/ExtensionMimeTypeDetector.php` | 1 | 1 | 显式可空参数 |
| `vendor/league/mime-type-detection/src/FinfoMimeTypeDetector.php` | 1 | 1 | 显式可空参数 |
| `vendor/symfony/var-dumper/Caster/Caster.php` | 1 | 1 | 显式可空参数 |
| `vendor/symfony/var-dumper/Caster/LinkStub.php` | 1 | 1 | 显式可空参数 |
| `vendor/symfony/var-dumper/Caster/TraceStub.php` | 1 | 1 | 显式可空参数 |
| `vendor/symfony/var-dumper/Cloner/AbstractCloner.php` | 1 | 1 | 显式可空参数 |
| `vendor/symfony/var-dumper/Dumper/AbstractDumper.php` | 1 | 1 | 显式可空参数 |
| `vendor/symfony/var-dumper/Dumper/CliDumper.php` | 1 | 1 | 显式可空参数 |
| `vendor/symfony/var-dumper/Dumper/ContextProvider/SourceContextProvider.php` | 1 | 1 | 显式可空参数 |
| `vendor/symfony/var-dumper/Dumper/HtmlDumper.php` | 1 | 1 | 显式可空参数 |
| `vendor/symfony/var-dumper/Dumper/ServerDumper.php` | 1 | 1 | 显式可空参数 |
| `vendor/symfony/var-dumper/Server/DumpServer.php` | 1 | 1 | 显式可空参数 |
| `vendor/symfony/var-dumper/Test/VarDumperTestTrait.php` | 1 | 1 | 显式可空参数 |
| `vendor/symfony/var-dumper/VarDumper.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/helper.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/framework/src/think/Cache.php` | 3 | 3 | 显式可空参数 |
| `vendor/topthink/framework/src/think/Config.php` | 3 | 3 | 显式可空参数 |
| `vendor/topthink/framework/src/think/Console.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/Container.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/Env.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/File.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/framework/src/think/Filesystem.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/framework/src/think/Http.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/Lang.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/Log.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/framework/src/think/Manager.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/Request.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/framework/src/think/Route.php` | 7 | 7 | 显式可空参数 |
| `vendor/topthink/framework/src/think/Session.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/Validate.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/framework/src/think/View.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/framework/src/think/console/Command.php` | 3 | 3 | 显式可空参数 |
| `vendor/topthink/framework/src/think/console/command/RouteList.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/console/command/optimize/Route.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/console/input/Argument.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/console/output/formatter/Stack.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/framework/src/think/contract/ModelRelationInterface.php` | 5 | 5 | 显式可空参数 |
| `vendor/topthink/framework/src/think/exception/ClassNotFoundException.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/exception/FuncNotFoundException.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/exception/HttpException.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/file/UploadedFile.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/framework/src/think/initializer/Error.php` | 10 | 0 | 环境门槛/日期函数，错误处理策略 |
| `vendor/topthink/framework/src/think/log/Channel.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/middleware/FormTokenCheck.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/response/View.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/framework/src/think/route/Dispatch.php` | 6 | 0 | 属性显式声明/可见性 |
| `vendor/topthink/framework/src/think/route/Domain.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/route/Resource.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/route/Rule.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/route/RuleGroup.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/route/RuleItem.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/route/RuleName.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/framework/src/think/session/Store.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/think-captcha/src/Captcha.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/think-helper/src/Collection.php` | 11 | 11 | 显式可空参数 |
| `vendor/topthink/think-helper/src/helper/Arr.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/think-helper/src/helper/Str.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/think-orm/src/DbManager.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/think-orm/src/Model.php` | 3 | 3 | 显式可空参数 |
| `vendor/topthink/think-orm/src/Paginator.php` | 3 | 3 | 显式可空参数 |
| `vendor/topthink/think-orm/src/db/BaseQuery.php` | 6 | 6 | 显式可空参数 |
| `vendor/topthink/think-orm/src/db/CacheItem.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/think-orm/src/db/Fetch.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/think-orm/src/db/Mongo.php` | 3 | 3 | 显式可空参数 |
| `vendor/topthink/think-orm/src/db/PDOConnection.php` | 3 | 3 | 显式可空参数 |
| `vendor/topthink/think-orm/src/db/Where.php` | 4 | 0 | 返回类型声明 |
| `vendor/topthink/think-orm/src/db/concern/JoinAndViewQuery.php` | 4 | 4 | 显式可空参数 |
| `vendor/topthink/think-orm/src/db/concern/ModelRelationQuery.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/think-orm/src/db/concern/ParamsBind.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/think-orm/src/db/concern/ResultOperation.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/think-orm/src/db/concern/WhereQuery.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/think-orm/src/db/connector/Mongo.php` | 2 | 2 | 显式可空参数 |
| `vendor/topthink/think-orm/src/db/connector/Oracle.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/Collection.php` | 3 | 3 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/Pivot.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/Relation.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/concern/Attribute.php` | 3 | 3 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/concern/Conversion.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/concern/RelationShip.php` | 6 | 6 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/concern/Virtual.php` | 1 | 1 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/relation/BelongsTo.php` | 8 | 8 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/relation/BelongsToMany.php` | 8 | 8 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/relation/HasMany.php` | 8 | 8 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/relation/HasManyThrough.php` | 8 | 8 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/relation/HasOne.php` | 7 | 7 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/relation/HasOneThrough.php` | 4 | 4 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/relation/MorphMany.php` | 8 | 8 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/relation/MorphOne.php` | 6 | 6 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/relation/MorphTo.php` | 7 | 7 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/relation/MorphToMany.php` | 5 | 5 | 显式可空参数 |
| `vendor/topthink/think-orm/src/model/relation/OneToOne.php` | 7 | 7 | 显式可空参数 |
| `vendor/topthink/think-template/src/Template.php` | 2 | 2 | 显式可空参数 |

合计：改动文件 225 个，新增 752 行，删除 423 行。

---

## 附录 B：本轮移植插件的改动文件清单（114 个文件，对照 `aazooo/ZJMF-CBAP-plugins`）

路径为站点相对路径（交付树内位置）；未列出的 1266 个移植文件与插件仓库逐字节相同。

| 文件 | +行 | -行 | 补丁类型 |
|---|---|---|---|
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/BodySummarizer.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/Client.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/ClientInterface.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/Cookie/CookieJar.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/Cookie/CookieJarInterface.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/Exception/BadResponseException.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/Exception/ConnectException.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/Exception/RequestException.php` | 5 | 5 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/Handler/MockHandler.php` | 3 | 3 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/Handler/StreamHandler.php` | 2 | 2 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/HandlerStack.php` | 3 | 3 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/MessageFormatter.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/MessageFormatterInterface.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/Middleware.php` | 3 | 3 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/RetryMiddleware.php` | 2 | 2 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/guzzle/src/TransferStats.php` | 2 | 2 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/promises/src/Coroutine.php` | 2 | 2 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/promises/src/Each.php` | 5 | 5 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/promises/src/FulfilledPromise.php` | 2 | 2 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/promises/src/Promise.php` | 4 | 4 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/promises/src/PromiseInterface.php` | 2 | 2 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/promises/src/RejectedPromise.php` | 2 | 2 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/promises/src/RejectionException.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/promises/src/Utils.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/psr7/src/CachingStream.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/psr7/src/HttpFactory.php` | 3 | 3 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/psr7/src/MultipartStream.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/psr7/src/Response.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/psr7/src/StreamWrapper.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/psr7/src/UploadedFile.php` | 2 | 2 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/psr7/src/Uri.php` | 1 | 1 | 显式可空 |
| `public/plugins/certification/yerzt/logic/vendor/guzzlehttp/psr7/src/Utils.php` | 1 | 1 | 显式可空 |
| `public/plugins/gateway/ali_pay/lib/AlipayTradeService.php` | 3 | 0 | 注释 / 属性声明 |
| `public/plugins/gateway/global_ali_pay/lib/alipay_core.function.php` | 1 | 1 | strftime→date |
| `public/plugins/gateway/goallpay_wechat/controller/IndexController.php` | 8 | 8 | 命名空间对齐 / 注释 / 重命名/调用点 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/command/src/Command.php` | 3 | 1 | 注释 / 属性声明 / 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/command/src/Exception/CommandException.php` | 3 | 3 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/command/src/Result.php` | 2 | 0 | 注释 / 属性声明 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/command/src/ServiceClient.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle-services/src/GuzzleClient.php` | 3 | 3 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle-services/src/Handler/ValidatedDescriptionHandler.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle-services/src/Operation.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle-services/src/RequestLocation/QueryLocation.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/BodySummarizer.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/Client.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/ClientInterface.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/Cookie/CookieJar.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/Cookie/CookieJarInterface.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/Exception/BadResponseException.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/Exception/ConnectException.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/Exception/RequestException.php` | 5 | 5 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/Handler/MockHandler.php` | 3 | 3 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/Handler/StreamHandler.php` | 2 | 2 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/HandlerStack.php` | 3 | 3 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/MessageFormatter.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/MessageFormatterInterface.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/Middleware.php` | 3 | 3 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/RetryMiddleware.php` | 2 | 2 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/guzzle/src/TransferStats.php` | 2 | 2 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/promises/src/Coroutine.php` | 2 | 2 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/promises/src/Each.php` | 5 | 5 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/promises/src/FulfilledPromise.php` | 2 | 2 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/promises/src/Promise.php` | 4 | 4 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/promises/src/PromiseInterface.php` | 2 | 2 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/promises/src/RejectedPromise.php` | 2 | 2 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/promises/src/RejectionException.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/promises/src/Utils.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/psr7/src/CachingStream.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/psr7/src/HttpFactory.php` | 3 | 3 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/psr7/src/MultipartStream.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/psr7/src/Response.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/psr7/src/StreamWrapper.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/psr7/src/UploadedFile.php` | 2 | 2 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/psr7/src/Uri.php` | 1 | 1 | 显式可空 |
| `public/plugins/oss/tencentcloud_oss/vendor/guzzlehttp/psr7/src/Utils.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/officesms/Officesms.php` | 4 | 0 | 注释 / 属性声明 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/BodySummarizer.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/Client.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/ClientInterface.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/Cookie/CookieJar.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/Cookie/CookieJarInterface.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/Exception/BadResponseException.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/Exception/ConnectException.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/Exception/RequestException.php` | 5 | 5 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/Handler/MockHandler.php` | 3 | 3 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/Handler/StreamHandler.php` | 2 | 2 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/HandlerStack.php` | 3 | 3 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/MessageFormatter.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/MessageFormatterInterface.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/Middleware.php` | 3 | 3 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/RetryMiddleware.php` | 2 | 2 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/guzzle/src/TransferStats.php` | 2 | 2 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/promises/src/Coroutine.php` | 2 | 2 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/promises/src/Each.php` | 5 | 5 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/promises/src/FulfilledPromise.php` | 2 | 2 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/promises/src/Promise.php` | 4 | 4 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/promises/src/PromiseInterface.php` | 2 | 2 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/promises/src/RejectedPromise.php` | 2 | 2 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/promises/src/Utils.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/psr7/src/CachingStream.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/psr7/src/HttpFactory.php` | 3 | 3 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/psr7/src/MultipartStream.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/psr7/src/Request.php` | 4 | 0 | 注释 / 属性声明 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/psr7/src/Response.php` | 4 | 1 | 注释 / 属性声明 / 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/psr7/src/StreamWrapper.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/psr7/src/UploadedFile.php` | 2 | 2 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/psr7/src/Uri.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/guzzlehttp/psr7/src/Utils.php` | 1 | 1 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/psr/http-factory/src/UploadedFileFactoryInterface.php` | 3 | 3 | 显式可空 |
| `public/plugins/sms/qcloudsms/vendor/tencentcloud/common/src/TencentCloud/Common/AbstractClient.php` | 2 | 0 | 注释 / 属性声明 |
| `public/plugins/sms/qcloudsms/vendor/tencentcloud/common/src/TencentCloud/Common/Profile/ClientProfile.php` | 8 | 0 | 注释 / 属性声明 |
| `public/plugins/sms/submail/Submail.php` | 2 | 0 | 注释 / 属性声明 |
| `public/plugins/sms/tysms/Tysms.php` | 1 | 1 | 重命名/调用点 / 参数顺序修正 |
| `public/plugins/widget/ToDo.php` | 2 | 0 | 注释 / 属性声明 |

合计：改动文件 114 个，新增 232 行，删除 200 行。

---

## 附录 C：ionCube 加密插件包清单（38 个包，归档于 `zjmf-plugins-ioncube-php7x/`，只能跑 PHP 7.2~7.4）

以下文件均**逐字节原样保留**（与插件仓库 md5 全对，0 差异），未做任何 PHP 8.4 改造。

| 加密包 | 目标站点相对路径 | 文件数 | PHP 文件 | 其中编码文件 |
|---|---|---|---|---|
| addon/abnormal_inspection_records | `public/plugins/addon/abnormal_inspection_records` | 26 | 12 | 12 |
| addon/client_care | `public/plugins/addon/client_care` | 36 | 12 | 12 |
| addon/client_custom_field | `public/plugins/addon/client_custom_field` | 20 | 11 | 11 |
| addon/cost_pay | `public/plugins/addon/cost_pay` | 23 | 16 | 16 |
| addon/credit_limit | `public/plugins/addon/credit_limit` | 40 | 17 | 17 |
| addon/cycle_artificial_order | `public/plugins/addon/cycle_artificial_order` | 26 | 10 | 10 |
| addon/e_contract | `public/plugins/addon/e_contract` | 164 | 42 | 42 |
| addon/email_notice_admin | `public/plugins/addon/email_notice_admin` | 21 | 9 | 9 |
| addon/event_promotion | `public/plugins/addon/event_promotion` | 25 | 13 | 13 |
| addon/flow_packet | `public/plugins/addon/flow_packet` | 23 | 12 | 12 |
| addon/host_transfer | `public/plugins/addon/host_transfer` | 19 | 9 | 9 |
| addon/idcsmart_client_level | `public/plugins/addon/idcsmart_client_level` | 27 | 14 | 14 |
| addon/idcsmart_domain | `public/plugins/addon/idcsmart_domain` | 79 | 31 | 31 |
| addon/idcsmart_invoice | `public/plugins/addon/idcsmart_invoice` | 60 | 22 | 22 |
| addon/idcsmart_recommend | `public/plugins/addon/idcsmart_recommend` | 49 | 23 | 23 |
| addon/idcsmart_sale | `public/plugins/addon/idcsmart_sale` | 56 | 24 | 24 |
| addon/idcsmart_statistics | `public/plugins/addon/idcsmart_statistics` | 28 | 8 | 8 |
| addon/idcsmart_voucher | `public/plugins/addon/idcsmart_voucher` | 27 | 15 | 15 |
| addon/idcsmart_webhook | `public/plugins/addon/idcsmart_webhook` | 20 | 12 | 12 |
| addon/manual_resource | `public/plugins/addon/manual_resource` | 232 | 16 | 16 |
| addon/notice_send_merge | `public/plugins/addon/notice_send_merge` | 11 | 6 | 6 |
| addon/product_cashback | `public/plugins/addon/product_cashback` | 24 | 11 | 11 |
| addon/product_cert_limit | `public/plugins/addon/product_cert_limit` | 23 | 9 | 9 |
| addon/product_cycle_limit | `public/plugins/addon/product_cycle_limit` | 23 | 9 | 9 |
| addon/product_drop_down_select | `public/plugins/addon/product_drop_down_select` | 20 | 9 | 9 |
| addon/product_num_limit | `public/plugins/addon/product_num_limit` | 20 | 9 | 9 |
| addon/product_related_limit | `public/plugins/addon/product_related_limit` | 20 | 11 | 11 |
| addon/ticket_internal_premium | `public/plugins/addon/ticket_internal_premium` | 89 | 35 | 35 |
| addon/ticket_premium | `public/plugins/addon/ticket_premium` | 206 | 33 | 33 |
| addon/wanyun_resource | `public/plugins/addon/wanyun_resource` | 47 | 29 | 29 |
| server/bt_virtual_host | `public/plugins/server/bt_virtual_host` | 150 | 27 | 27 |
| server/direct_admin | `public/plugins/server/direct_admin` | 84 | 26 | 26 |
| server/mf_cloud_disk | `public/plugins/server/mf_cloud_disk` | 139 | 27 | 27 |
| server/mf_cloud_ip | `public/plugins/server/mf_cloud_ip` | 137 | 25 | 25 |
| server/mf_dcim_cabinet | `public/plugins/server/mf_dcim_cabinet` | 162 | 36 | 36 |
| server/west_domain | `public/plugins/server/west_domain` | 44 | 8 | 8 |
| server/zgsj_domain | `public/plugins/server/zgsj_domain` | 42 | 8 | 8 |
| template/web | `public/web/mf101` | 226 | 29 | 29 |
| **合计 38 包** | — | **2468** | **675** | **675** |

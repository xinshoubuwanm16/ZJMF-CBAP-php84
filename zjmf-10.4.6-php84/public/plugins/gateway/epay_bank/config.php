<?php
/**
 * @desc 插件后台配置
 */
return [
    'module_name' => [    # 在后台插件配置表单中的键名(统一规范:小写+下划线),会是config[module_name]
        'title' => '名称',            # 表单的label标题
        'type'  => 'text',           # 表单的类型：text文本,password密码,checkbox复选框,select下拉,radio单选,textarea文本区域,tip提示
        'value' => '银联支付',     # 表单的默认值
        'tip'   => 'friendly name',  # 表单的帮助提示
        'size'  => 200,               # 输入框长度(当type类型为text,password,textarea,tip时,可传入此键)
    ],
    'apiurl' => [
        'title' => '易支付网址',
        'type'  => 'text',
        'value' => '',
        'tip'   => '以http://或https://开头，以/结尾',
        'size'  => 200,
    ],
    'pid' => [
        'title' => '商户ID',
        'type'  => 'text',
        'value' => '',
        'tip'   => '',
        'size'  => 200,
    ],
    'key' => [
        'title' => '商户密钥',
        'type'  => 'text',
        'value' => '',
        'tip'   => '',
        'size'  => 200,
    ],

];

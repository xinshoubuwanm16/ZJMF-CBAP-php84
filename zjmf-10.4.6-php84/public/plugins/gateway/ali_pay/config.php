<?php
/**
 * @desc 插件后台配置
 * @author wyh
 * @version 1.0
 * @time 2022-05-27
 */
return [
    'module_name'            => [    # 在后台插件配置表单中的键名(统一规范:小写+下划线),会是config[module_name]
        'title' => '名称',            # 表单的label标题
        'type'  => 'text',           # 表单的类型：text文本,password密码,checkbox复选框,select下拉,radio单选,textarea文本区域,tip提示
        'value' => '支付宝支付',     # 表单的默认值
        'tip'   => 'friendly name',  # 表单的帮助提示
        'size'  => 200,               # 输入框长度(当type类型为text,password,textarea,tip时,可传入此键)
    ],
    'app_id'                 => [
        'title' => '应用APPID',
        'type'  => 'text',
        'value' => '',
        'tip'   => '',
        'size'  => 200,
    ],
    'merchant_private_key'   => [
        'title' => '应用私钥',
        'type'  => 'textarea',
        'value' => '',
        'tip'   => '',
    ],
    'alipay_public_key'      => [
        'title' => '支付宝公钥',
        'type'  => 'textarea',
        'value' => '',
        'tip'   => '',
    ],
    'product_pc' => [
        'title' => '电脑网站支付',
        'type' => 'radio',
        'options' => [
            '1' => '开启',
            '0' => '关闭',
        ],
        'value' => '1',
        'tip' => '',
    ],
    'product_wap' => [
        'title' => '手机网站支付',
        'type' => 'radio',
        'options' => [
            '1' => '开启',
            '0' => '关闭',
        ],
        'value' => '1',
        'tip' => '',
    ],
    'product_qr' => [
        'title' => '当面付',
        'type' => 'radio',
        'options' => [
            '1' => '开启',
            '0' => '关闭',
        ],
        'value' => '0',
        'tip' => '',
    ],
];

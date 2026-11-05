<?php

namespace GuzzleHttp\Command;

/**
 * Default command implementation.
 */
class Result implements ResultInterface
{
    /* PHP 8.2+ 禁止动态创建属性，此处显式声明原动态属性 */
    public $data;

    use HasDataTrait;

    public function __construct(array $data = [])
    {
        $this->data = $data;
    }
}

<?php

namespace GuzzleHttp\Command;

use GuzzleHttp\HandlerStack;

/**
 * Default command implementation.
 */
class Command implements CommandInterface
{
    /* PHP 8.2+ 禁止动态创建属性，此处显式声明原动态属性 */
    public $data;

    use HasDataTrait;

    /** @var string */
    private $name;

    /** @var HandlerStack */
    private $handlerStack;

    /**
     * @param string       $name         Name of the command
     * @param array        $args         Arguments to pass to the command
     * @param HandlerStack $handlerStack Stack of middleware for the command
     */
    public function __construct(
        $name,
        array $args = [],
        ?HandlerStack $handlerStack = null
    ) {
        $this->name = $name;
        $this->data = $args;
        $this->handlerStack = $handlerStack;
    }

    public function getHandlerStack()
    {
        return $this->handlerStack;
    }

    public function getName()
    {
        return $this->name;
    }

    public function hasParam($name)
    {
        return array_key_exists($name, $this->data);
    }

    public function __clone()
    {
        if ($this->handlerStack) {
            $this->handlerStack = clone $this->handlerStack;
        }
    }
}

<?php

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$request = Illuminate\Http\Request::create('http://172.16.230.1:8000/api/restaurants/kabul-eats/menu', 'GET');
app()->instance('request', $request);
$controller = app(App\Http\Controllers\Api\Customer\MenuController::class);
$response = $controller->index('kabul-eats');

echo $response->getContent();

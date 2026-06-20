<?php

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$request = Illuminate\Http\Request::create('http://172.16.230.1:8000/api/restaurants', 'GET');
echo 'schemeAndHost: '.$request->getSchemeAndHttpHost().PHP_EOL;
echo 'media: '.App\Support\MediaUrl::public('restaurants/logos/test.png', $request).PHP_EOL;
echo 'absolute: '.App\Support\MediaUrl::absolute('restaurants/logos/test.png', $request).PHP_EOL;

$restaurant = App\Models\Restaurant::first();
$resource = new App\Http\Resources\RestaurantListResource($restaurant);
echo 'resource: '.json_encode($resource->toArray($request)).PHP_EOL;

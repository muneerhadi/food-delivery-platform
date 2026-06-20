<?php

namespace App\Http\Resources\Restaurant;

use App\Http\Resources\Admin\AdminOrderListResource;
use Illuminate\Http\Request;

class RestaurantOrderListResource extends AdminOrderListResource
{
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);
        unset($data['restaurant']);

        return $data;
    }
}

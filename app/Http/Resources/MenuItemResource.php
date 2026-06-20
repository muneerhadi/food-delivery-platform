<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'sale_price' => $this->sale_price,
            'effective_price' => $this->sale_price ?? $this->price,
            'image' => MediaUrl::public($this->image, $request),
            'is_featured' => $this->is_featured,
            'sort_order' => $this->sort_order,
        ];
    }
}

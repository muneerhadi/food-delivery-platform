<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'restaurant_id' => ['required', 'integer', 'exists:restaurants,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_item_id' => ['required', 'integer', 'exists:menu_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'delivery_address' => ['required', 'array'],
            'delivery_address.address' => ['required', 'string', 'max:500'],
            'delivery_address.city' => ['required', 'string', 'max:100'],
            'delivery_address.lat' => ['nullable', 'numeric', 'between:-90,90'],
            'delivery_address.lng' => ['nullable', 'numeric', 'between:-180,180'],
            'payment_method' => ['required', Rule::in(['mastercard', 'visa', 'hesabpay', 'cash', 'cod', 'online'])],
            'notes' => ['nullable', 'string', 'max:1000'],
            'promo_code' => ['nullable', 'string', 'max:50'],
        ];
    }
}

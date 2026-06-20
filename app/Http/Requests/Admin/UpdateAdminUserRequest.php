<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminUserRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->input('role') === 'admin') {
            $this->merge(['role' => 'super_admin']);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['sometimes', 'boolean'],
            'role' => ['sometimes', Rule::in(['super_admin', 'restaurant_owner', 'driver', 'customer'])],
        ];
    }
}

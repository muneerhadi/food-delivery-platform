<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreAddressRequest;
use App\Http\Requests\Customer\UpdateAddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\CustomerAddress;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()
            ->addresses()
            ->orderByDesc('is_default')
            ->latest()
            ->get();

        return $this->successResponse(AddressResource::collection($addresses));
    }

    public function store(StoreAddressRequest $request): JsonResponse
    {
        if ($request->boolean('is_default')) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address = $request->user()->addresses()->create($request->validated());

        return $this->successResponse(
            new AddressResource($address),
            'Address created successfully.',
            201
        );
    }

    public function update(UpdateAddressRequest $request, CustomerAddress $address): JsonResponse
    {
        if ($request->boolean('is_default')) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($request->validated());

        return $this->successResponse(
            new AddressResource($address->fresh()),
            'Address updated successfully.'
        );
    }

    public function destroy(Request $request, CustomerAddress $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return $this->errorResponse('Address not found.', 404);
        }

        $address->delete();

        return $this->successResponse(null, 'Address deleted successfully.');
    }
}

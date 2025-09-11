<?php

namespace App\Http\Requests\Room;

use Illuminate\Foundation\Http\FormRequest;
use App\Enums\RoomStatus;
use Illuminate\Validation\Rule;

class UpdateRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->canManageRooms();
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('rooms', 'code')->ignore($this->room->id ?? null),
            ],
            'description' => 'nullable|string|max:1000',
            'capacity' => 'required|integer|min:1|max:1000',
            'status' => ['required', Rule::enum(RoomStatus::class)],
            'location' => 'nullable|string|max:255',
            'facilities' => 'nullable|array',
            'facilities.*' => 'string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'full_name' => 'nullable|string|max:255',
            'is_active' => 'required|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama ruangan wajib diisi.',
            'code.required' => 'Kode ruangan wajib diisi.',
            'code.unique' => 'Kode ruangan sudah digunakan.',
            'capacity.required' => 'Kapasitas ruangan wajib diisi.',
            'capacity.min' => 'Kapasitas ruangan minimal 1 orang.',
            'capacity.max' => 'Kapasitas ruangan maksimal 1000 orang.',
            'status.required' => 'Status ruangan wajib dipilih.',
            'image.image' => 'File harus berupa gambar.',
            'image.mimes' => 'Format gambar harus JPEG, PNG, atau JPG.',
            'image.max' => 'Ukuran gambar maksimal 2MB.',
        ];
    }
}

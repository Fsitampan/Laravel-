<?php

namespace App\Http\Requests\Borrowing;

use Illuminate\Foundation\Http\FormRequest;
use App\Enums\UserCategory;
use Illuminate\Validation\Rule;

class UpdateBorrowingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->canManageBorrowers() || 
               ($this->borrowing->created_by === $this->user()->id && $this->borrowing->isPending());
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'room_id' => 'required|exists:rooms,id',
            'borrower_name' => 'required|string|max:255',
            'borrower_email' => 'required|email|max:255',
            'borrower_phone' => 'required|string|max:20',
            'borrower_identification' => 'required|string|max:50',
            'borrower_category' => ['required', Rule::enum(UserCategory::class)],
            'borrower_department' => 'nullable|string|max:255',
            'borrow_date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'return_date' => 'nullable|date|after_or_equal:borrow_date',
            'purpose' => 'required|string|max:1000',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'room_id.required' => 'Ruangan wajib dipilih.',
            'room_id.exists' => 'Ruangan yang dipilih tidak valid.',
            'borrower_name.required' => 'Nama peminjam wajib diisi.',
            'borrower_email.required' => 'Email peminjam wajib diisi.',
            'borrower_email.email' => 'Format email tidak valid.',
            'borrower_phone.required' => 'Nomor telepon peminjam wajib diisi.',
            'borrower_identification.required' => 'Nomor identitas peminjam wajib diisi.',
            'borrower_category.required' => 'Kategori peminjam wajib dipilih.',
            'borrow_date.required' => 'Tanggal peminjaman wajib diisi.',
            'end_time.after' => 'Waktu selesai harus setelah waktu mulai.',
            'return_date.after_or_equal' => 'Tanggal pengembalian tidak boleh sebelum tanggal peminjaman.',
            'purpose.required' => 'Tujuan peminjaman wajib diisi.',
        ];
    }
}
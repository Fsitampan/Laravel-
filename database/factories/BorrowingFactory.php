<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Room;
use App\Enums\BorrowingStatus;
use App\Enums\UserCategory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Borrowing>
 */
class BorrowingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $borrowDate = fake()->dateTimeBetween('-1 month', '+1 month');
        $startTime = fake()->time('H:i');
        $endTime = fake()->time('H:i');
        
        // Ensure end time is after start time
        if ($startTime >= $endTime) {
            $endTime = date('H:i', strtotime($startTime . ' +2 hours'));
        }

        return [
            'room_id' => Room::factory(),
            'user_id' => User::factory(),
            'borrower_name' => fake()->name(),
            'borrower_email' => fake()->safeEmail(),
            'borrower_phone' => fake()->phoneNumber(),
            'borrower_identification' => fake()->numerify('##########'),
            'borrower_category' => fake()->randomElement(UserCategory::cases()),
            'borrower_department' => fake()->randomElement([
                'Statistik Sosial',
                'Statistik Ekonomi', 
                'Statistik Produksi',
                'IPDS',
                'Tata Usaha',
                'Eksternal'
            ]),
            'borrow_date' => $borrowDate,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'return_date' => fake()->optional()->dateTimeBetween($borrowDate, '+1 week'),
            'purpose' => fake()->sentence(8),
            'notes' => fake()->optional()->paragraph(),
            'status' => fake()->randomElement(BorrowingStatus::cases()),
            'created_by' => User::factory(),
        ];
    }

    /**
     * Indicate that the borrowing is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BorrowingStatus::PENDING,
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    /**
     * Indicate that the borrowing is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BorrowingStatus::APPROVED,
            'approved_by' => User::factory(),
            'approved_at' => now(),
        ]);
    }

    /**
     * Indicate that the borrowing is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BorrowingStatus::REJECTED,
            'approved_by' => User::factory(),
            'approved_at' => now(),
            'rejection_reason' => fake()->sentence(),
        ]);
    }
}
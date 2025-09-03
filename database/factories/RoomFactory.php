<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Enums\RoomStatus;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $roomTypes = ['Ruang Rapat', 'Ruang Seminar', 'Ruang Aula', 'Ruang Training'];
        $roomType = fake()->randomElement($roomTypes);
        $roomLetter = fake()->randomElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
        
        return [
            'name' => $roomType . ' ' . $roomLetter,
            'code' => 'RR-' . $roomLetter,
            'description' => fake()->paragraph(2),
            'capacity' => fake()->numberBetween(5, 50),
            'status' => fake()->randomElement(RoomStatus::cases()),
            'location' => fake()->randomElement(['Lantai 1', 'Lantai 2', 'Lantai 3']),
            'facilities' => fake()->randomElements([
                'Proyektor', 'AC', 'Whiteboard', 'Sound System', 'WiFi',
                'Telekonferensi', 'Panggung Kecil', 'Microphone', 'Laptop',
                'Flip Chart', 'Coffee Station'
            ], fake()->numberBetween(3, 7)),
            'notes' => fake()->optional()->sentence(),
            'created_by' => User::factory(),
        ];
    }
}
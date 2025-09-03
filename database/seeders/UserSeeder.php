<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Seed the BPS Riau Users
     */
    public function run(): void
    {
        // Clear existing users
        User::truncate();

        $users = [
            // Super Admin
            [
                'name' => 'Super Administrator BPS',
                'email' => 'superadmin@bps.go.id',
                'password' => Hash::make('password'),
                'role' => 'super-admin',
                'phone' => '0761-21351',
                'department' => 'IT & Sistem Informasi',
                'address' => 'Jl. Pattimura No. 12, Pekanbaru, Riau',
                'bio' => 'Super Administrator sistem manajemen ruangan BPS Riau',
                'is_active' => true,
                'created_by' => null,
            ],
            
            // Admins
            [
                'name' => 'Dr. Ahmad Syafril, S.St, M.Si',
                'email' => 'admin.kepala@bps.go.id',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '0761-21352',
                'department' => 'Kepala BPS Provinsi Riau',
                'address' => 'Jl. Pattimura No. 12, Pekanbaru, Riau',
                'bio' => 'Kepala BPS Provinsi Riau',
                'is_active' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Dra. Siti Aminah, M.Si',
                'email' => 'admin.ipds@bps.go.id',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '0761-21353',
                'department' => 'Integrasi Pengolahan dan Diseminasi Statistik',
                'address' => 'Jl. Pattimura No. 12, Pekanbaru, Riau',
                'bio' => 'Kepala Bidang IPDS BPS Riau',
                'is_active' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Ir. Budi Santoso, M.Stat',
                'email' => 'admin.sosial@bps.go.id',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '0761-21354',
                'department' => 'Statistik Sosial',
                'address' => 'Jl. Pattimura No. 12, Pekanbaru, Riau',
                'bio' => 'Kepala Bidang Statistik Sosial BPS Riau',
                'is_active' => true,
                'created_by' => 1,
            ],
            
            // Regular Users - Employees
            [
                'name' => 'Andi Pratama, S.ST',
                'email' => 'andi.pratama@bps.go.id',
                'password' => Hash::make('password'),
                'role' => 'pengguna',
                'phone' => '0761-21355',
                'department' => 'Statistik Produksi',
                'address' => 'Pekanbaru, Riau',
                'bio' => 'Staff Statistik Produksi BPS Riau',
                'is_active' => true,
                'created_by' => 2,
            ],
            [
                'name' => 'Sari Wahyuni, S.Si',
                'email' => 'sari.wahyuni@bps.go.id',
                'password' => Hash::make('password'),
                'role' => 'pengguna',
                'phone' => '0761-21356',
                'department' => 'Statistik Distribusi',
                'address' => 'Pekanbaru, Riau',
                'bio' => 'Staff Statistik Distribusi BPS Riau',
                'is_active' => true,
                'created_by' => 2,
            ],
            [
                'name' => 'Muhammad Rizky, A.Md',
                'email' => 'rizky.muhammad@bps.go.id',
                'password' => Hash::make('password'),
                'role' => 'pengguna',
                'phone' => '0761-21357',
                'department' => 'Neraca Wilayah dan Analisis Statistik',
                'address' => 'Pekanbaru, Riau',
                'bio' => 'Staff Neraca Wilayah BPS Riau',
                'is_active' => true,
                'created_by' => 2,
            ],
            [
                'name' => 'Dewi Purnama Sari, S.E',
                'email' => 'dewi.purnama@bps.go.id',
                'password' => Hash::make('password'),
                'role' => 'pengguna',
                'phone' => '0761-21358',
                'department' => 'Tata Usaha',
                'address' => 'Pekanbaru, Riau',
                'bio' => 'Staff Tata Usaha BPS Riau',
                'is_active' => true,
                'created_by' => 2,
            ],
            
            // Guests
            [
                'name' => 'Prof. Dr. Hendri Nelawan',
                'email' => 'hendri.nelawan@unri.ac.id',
                'password' => Hash::make('password'),
                'role' => 'pengguna',
                'phone' => '0761-567890',
                'department' => 'Universitas Riau - Fakultas Ekonomi',
                'address' => 'Pekanbaru, Riau',
                'bio' => 'Dosen Fakultas Ekonomi Universitas Riau',
                'is_active' => true,
                'created_by' => 2,
            ],
            [
                'name' => 'Dr. Ratna Sari Dewi',
                'email' => 'ratna.sari@bappeda.riau.go.id',
                'password' => Hash::make('password'),
                'role' => 'pengguna',
                'phone' => '0761-123456',
                'department' => 'Bappeda Provinsi Riau',
                'address' => 'Pekanbaru, Riau',
                'bio' => 'Staff Bappeda Provinsi Riau',
                'is_active' => true,
                'created_by' => 2,
            ],
            
            // Interns
            [
                'name' => 'Fajar Ramadhan',
                'email' => 'fajar.ramadhan@student.unri.ac.id',
                'password' => Hash::make('password'),
                'role' => 'pengguna',
                'phone' => '0812-3456-7890',
                'department' => 'Magang - Statistik Sosial',
                'address' => 'Pekanbaru, Riau',
                'bio' => 'Mahasiswa magang Universitas Riau',
                'is_active' => true,
                'created_by' => 4,
            ],
            [
                'name' => 'Novi Oktavia',
                'email' => 'novi.oktavia@student.uin-suska.ac.id',
                'password' => Hash::make('password'),
                'role' => 'pengguna',
                'phone' => '0813-4567-8901',
                'department' => 'Magang - IPDS',
                'address' => 'Pekanbaru, Riau',
                'bio' => 'Mahasiswa magang UIN Suska Riau',
                'is_active' => true,
                'created_by' => 3,
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        $this->command->info('✅ Created ' . count($users) . ' users successfully');
    }
}
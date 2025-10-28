<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomLayout extends Model
{
    use HasFactory;

    protected $fillable = ['room_id', 'layout_name', 'image_path'];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}

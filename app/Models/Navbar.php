<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Navbar extends Model
{
    use HasFactory;

    protected $fillable = [
        'nav_section_name_ar',
        'nav_section_name_en',
        'nav_section_link',
    ];
}

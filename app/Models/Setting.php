<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'web_name_ar',
        'web_name_en',
        'email',
        'facebook_link',
        'twitter_link',
        'linkedin_link',
        'image',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class trade extends Model
{
    use HasFactory;
    use HasTranslations;

    public $translatable = ['name' , 'email' , 'password'];

    protected $guarded=[];

    protected $table = 'trades';

    public $timestamp = true;
}

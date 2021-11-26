<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;


class sections extends Model
{

    use HasFactory;

    use HasTranslations;

    public $translatable = ['name' , 'note'];

    protected $guarded=[];
    
    protected $table = 'sections';

    public $timestamp = true;
}

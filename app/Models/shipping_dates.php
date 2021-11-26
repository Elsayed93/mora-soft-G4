<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;


class shipping_dates extends Model
{
    use HasFactory;

    use HasTranslations;

    public $translatable = ['from_date' , 'to_date' , 'type' , 'price'];

    protected $guarded=[];

    protected $table = 'shipping_dates';

    public $timestamp = true;

}

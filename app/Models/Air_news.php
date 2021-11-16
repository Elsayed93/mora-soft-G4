<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Air_news extends Model
{
    use HasFactory;
    use HasTranslations;

    public $translatable = ['name' , 'agreements' , 'Air_transport_quantity'];

    protected $table = 'air_news';
    protected $guarded=[];
    public $timestamp = true;


}

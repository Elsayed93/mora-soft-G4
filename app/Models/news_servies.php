<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class news_servies extends Model
{
    use HasFactory;
    use HasTranslations;

    public $translatable = ['title','description'];

    protected $table = 'news_servies';
    protected $guarded=[];
    public $timestamp = true;

    protected $appends = ['photo'];

    public function getPhotoAttribute()
    {
        return $this->attributes['image'] != null ? 
        asset('storage/news/' . $this->attributes['image']) : null;
    }


}

<?php

namespace App\Http\Controllers;

use App\Models\Air_news;
use App\Models\news_servies;


use Illuminate\Http\Request;
use App\Http\Controllers\BaseController;


class homeController extends BaseController
{

    //

    public function index()
    {
       

        return view('home' , compact('air' , 'news' , 'settings'));

    }
}

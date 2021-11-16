<?php

namespace App\Http\Controllers;

use App\Models\Air_news;
use App\Models\news_servies;


use Illuminate\Http\Request;

class homeController extends Controller
{

    //

    public function index()
    {
        $air = Air_news::all();
        $news = news_servies::all();

        return view('home' , compact('air','news'));

    }
}

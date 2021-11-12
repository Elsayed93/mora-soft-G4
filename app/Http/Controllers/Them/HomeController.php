<?php

namespace App\Http\Controllers\Them;

use App\Http\Controllers\BaseController;
use Illuminate\Http\Request;

class HomeController extends BaseController
{
    public function index()
    {
        $settings = $this->site_settings;

        return view('Them.layouts.home', compact('settings'));
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseController;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HomeController extends BaseController
{
    public function index()
    {
        $settings = $this->site_settings;

        return view('Admin.layouts.master', compact('settings'));
    }
}

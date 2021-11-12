<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class BaseController extends Controller
{
    protected $site_settings;

    public function __construct()
    {
        // Fetch the Site Settings object
        $this->site_settings = Setting::first();
        View::share('site_settings', $this->site_settings);
    }
}

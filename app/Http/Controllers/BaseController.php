<?php

namespace App\Http\Controllers;

use App\Models\Navbar;
use App\Models\Setting;
use App\Models\Slider;
use Illuminate\Support\Facades\View;

class BaseController extends Controller
{
    protected $site_settings;
    protected $navbar_sections;
    protected $sliders;

    public function __construct()
    {
        // Fetch the Site Settings object
        $this->site_settings = Setting::first();
        $navSections = $this->navbar_sections = Navbar::all();
        $sliders = $this->sliders = Slider::all();

        // navsections
        View::share([
            'site_settings' => $this->site_settings,
            'navSections' => $navSections,
            'sliders' => $sliders,
        ]);
    }
}

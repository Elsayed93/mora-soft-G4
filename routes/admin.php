<?php

use App\Http\Controllers\Admin\HomeController;
use App\Http\Controllers\Admin\NavbarController;
use App\Http\Controllers\Admin\SettingController;
use Illuminate\Support\Facades\Route;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

require __DIR__ . '/auth.php';

Route::group(['prefix' => LaravelLocalization::setLocale(), 'as' => 'dashboard.', 'middleware' => ['localeSessionRedirect', 'localizationRedirect', 'localeViewPath']], function () {

    // home dashboard
    Route::get('/admin', [HomeController::class, 'index'])->name('home');

    // settings
    Route::resource('settings', SettingController::class)->only(['index', 'update']);

    // navbar
    Route::resource('navbar', NavbarController::class);
});

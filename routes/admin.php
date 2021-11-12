<?php

use App\Http\Controllers\Admin\HomeController;
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

Route::group(['as' => 'dashboard.', 'prefix' => LaravelLocalization::setLocale(), 'middleware' => ['localeSessionRedirect', 'localizationRedirect', 'localeViewPath']], function () {
    // Route::get('/admin', function () {
    //     return view('Admin.layouts.master');
    // })->name('home');

    Route::get('/admin', [HomeController::class, 'index'])->name('home');

    // Route::view('settings', 'Admin.settings.index');
    Route::resource('settings', SettingController::class);
});

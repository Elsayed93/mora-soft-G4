<?php

use App\Http\Controllers\Admin\HomeController;
use App\Http\Controllers\Admin\NavbarController;
use App\Http\Controllers\Admin\ProductsController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SliderController;
use App\Http\Controllers\Admin\NewsServiesController;
use App\Http\Controllers\Admin\ShippingDatesController;
use App\Http\Controllers\Admin\SectionsController;
use App\Http\Controllers\Admin\UserTradeController;




use App\Http\Controllers\Admin\AirNewsController;
use App\Http\Controllers\Admin\TradeController;
use App\Http\Controllers\homeController as ControllersHomeController;
// use App\Http\Controllers\homeController;
//
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

Route::group([
    'prefix' => LaravelLocalization::setLocale(),
    'as' => 'dashboard.',
    'middleware' => ['localeSessionRedirect', 'localizationRedirect', 'localeViewPath', 'auth']
], function () {

    // home dashboard
    Route::get('/admin', [HomeController::class, 'index'])->name('home');

    Route::group([
        'prefix' => LaravelLocalization::setLocale(),
        'middleware' => ['localeSessionRedirect', 'localizationRedirect', 'localeViewPath']
    ], function () {



// Route::resource('/' , homeController::class );


     // Start This route News


        Route::get('admins', function () {
            return view('admin.news.news');
        });

        // Start This route News
        // Route::resource('/', ControllersHomeController::class);

        Route::resource('news', NewsServiesController::class);
        Route::resource('news_air', AirNewsController::class);
        Route::post('delete_alls', [NewsServiesController::class, 'delete_all'])->name('delete_alls');
        Route::post('delete_all', [AirNewsController::class, 'delete_all'])->name('delete_all');
        // End This route News

        // strat This route shipping

        Route::resource('shipping', ShippingDatesController::class);
        Route::post('shipping_d_all', [ShippingDatesController::class, 'delete_all'])->name('shipping_d_all');
        // end This route shipping

        // strat This route sections

        Route::resource('sections', SectionsController::class);
        // end This route sections

        // strat This route user

        Route::resource('user_trade', UserTradeController::class);


        // End This route user

          // strat This route trade

        Route::resource('trade', TradeController::class);
        Route::post('trade_d_all', [TradeController::class, 'delete_all'])->name('trade_d_all');

        // End This route trade







    });

    // settings
    Route::resource('settings', SettingController::class)->only(['index', 'update']);

    // navbar
    Route::resource('navbar', NavbarController::class)->except('show');

    //sliders
    Route::resource('sliders', SliderController::class)->except('show');





    //products
    Route::resource('products', ProductsController::class)->except(['show']);
});

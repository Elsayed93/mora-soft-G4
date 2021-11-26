<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\BaseController;

use App\Models\user_trade;
use App\Models\User;

use Illuminate\Http\Request;

class UserTradeController extends BaseController
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $settings = $this->site_settings;

        $news = User::all();

        return view('Admin.user.user_trade', compact('settings' , 'news'));    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Admin\user_trade  $user_trade
     * @return \Illuminate\Http\Response
     */
    public function show(user_trade $user_trade)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Admin\user_trade  $user_trade
     * @return \Illuminate\Http\Response
     */
    public function edit(user_trade $user_trade)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Admin\user_trade  $user_trade
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, user_trade $user_trade)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Admin\user_trade  $user_trade
     * @return \Illuminate\Http\Response
     */
    public function destroy(user_trade $user_trade)
    {
        //
    }
}

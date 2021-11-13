<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseController;
use App\Http\Requests\Settings\updateRequest;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends BaseController
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $settings = Setting::first();

        return view('Admin.settings.index', compact('settings'));
    }

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
     * @param  \App\Models\Setting  $setting
     * @return \Illuminate\Http\Response
     */
    public function show(Setting $setting)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Setting  $setting
     * @return \Illuminate\Http\Response
     */
    public function edit(Setting $setting)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Setting  $setting
     * @return \Illuminate\Http\Response
     */
    public function update(updateRequest $request, Setting $setting)
    {
        // ensure the request has a file before
        if ($request->hasFile('image')) {

            $imageName = time() . '.' . $request->image->extension();
            $request->image->move(public_path('images'), $imageName);
            $request->image = $imageName;
        }

        $setting->update([
            'web_name_ar' => $request->web_name_ar,
            'web_name_en' => $request->web_name_en,
            'email' => $request->email,
            'facebook_link' => $request->facebook_link,
            'twitter_link' => $request->twitter_link,
            'linkedin_link' => $request->linkedin_link,
            'image' => $request->image,
        ]);

        if ($setting) {
            return redirect()->back()->with('success', __('site.success_update'));
        } else {

            return redirect()->back()->with('error', __('site.failed_update'));
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Setting  $setting
     * @return \Illuminate\Http\Response
     */
    public function destroy(Setting $setting)
    {
        //
    }
}

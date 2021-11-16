<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseController;
use App\Http\Requests\Slider\StoreRequest;
use App\Http\Requests\Slider\UpdateRequest;
use App\Models\Slider;

class SliderController extends BaseController
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $settings = $this->site_settings;
        $sliders = Slider::all();

        return view('Admin.sliders.index', compact('sliders', 'settings'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $settings = $this->site_settings;
        return view('Admin.sliders.create', compact('settings'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreRequest $request)
    {
        if ($request->hasFile('image')) {

            $imageName = time() . '.' . $request->image->extension();
            $request->image->move(public_path('images/sliders'), $imageName);
            $request->image = $imageName;
        }

        $slider = Slider::create([
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en,
            'content_ar' => $request->content_ar,
            'content_en' => $request->content_en,
            'image' => $request->image,
        ]);

        if ($slider) {
            return redirect()->route('dashboard.sliders.index')->with('success', __('site.success_store'));
        } else {
            return redirect()->back()->with('error', __('site.failed_store'));
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $settings = $this->site_settings;
        $slider = Slider::find($id);
        // dd($slider);
        return view('Admin.sliders.edit', compact('slider', 'settings'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateRequest $request, $id)
    {
        $slider = Slider::find($id)->update($request->all());

        if ($slider) {
            return redirect()->back()->with('success', __('site.success_update'));
        } else {
            return redirect()->back()->with('error', __('site.failed_update'));
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $slider =   Slider::destroy($id);

        if ($slider) {
            return redirect()->route('dashboard.sliders.index')->with('success', __('site.success_delete'));
        } else {
            return redirect()->back()->with('error', __('site.failed_delete'));
        }
    }
}

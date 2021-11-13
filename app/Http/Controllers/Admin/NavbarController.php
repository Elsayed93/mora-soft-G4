<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseController;
use App\Http\Requests\Navbar\StoreRequest;
use App\Http\Requests\Navbar\UpdateRequest;
use App\Models\Navbar;

class NavbarController extends BaseController
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $settings = $this->site_settings;
        $navSections = Navbar::all();

        return view('Admin.navbar.index', compact('navSections', 'settings'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $settings = $this->site_settings;
        return view('Admin.navbar.create', compact('settings'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreRequest $request)
    {
        $navSection = Navbar::create($request->all());

        if ($navSection) {
            return redirect()->route('dashboard.navbar.index')->with('success', __('site.success_store'));
        } else {
            return redirect()->back()->with('error', __('site.failed_store'));
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
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
        $navSection = Navbar::find($id);
        // dd($navSection);
        return view('Admin.navbar.edit', compact('navSection', 'settings'));
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
        $navSection = Navbar::find($id)->update($request->all());

        if ($navSection) {
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
        $navSection =   Navbar::destroy($id);

        if ($navSection) {
            return redirect()->route('dashboard.navbar.index')->with('success', __('site.success_delete'));
        } else {
            return redirect()->back()->with('error', __('site.failed_delete'));
        }
    }
}

<?php

namespace App\Http\Controllers\admin;
use App\Http\Controllers\BaseController;

use App\Models\sections;
use Illuminate\Http\Request;
use App\Http\Requests\Sections\section_request;


class SectionsController extends BaseController
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $news = sections::all();
        $settings = $this->site_settings;
        return view('admin.sections.sections', compact('news', 'settings'));



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
    public function store(section_request $request)
    {
        //
        $se = new sections();

        $se->name = ['ar' => $request->name_ar,
            'en' => $request->name_en];

            $se->note = ['ar' => $request->note_ar,
            'en' => $request->note_en];

            $se -> updated_at = $request->news_date;

            $se->save();
            toastr()->success(trans('news.Save'));

            return redirect()->route('dashboard.sections.index');         
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Admin\sections  $sections
     * @return \Illuminate\Http\Response
     */
    public function show(sections $sections)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Admin\sections  $sections
     * @return \Illuminate\Http\Response
     */
    public function edit(sections $sections)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Admin\sections  $sections
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request , $id)
    {
        //
        $news = sections::findOrFail($request->id);



        $news->name = [
            'ar' => $request->name_ar,

            'en' => $request->name_en
        ];

        $news->note = [
            'ar' => $request->note_ar,

            'en' => $request->note_en
        ];


        $news->update([
            'updated_at' => $request->news_date,
        ]);

            toastr()->success(trans('news.Edit'));

            return redirect()->route('dashboard.sections.index');    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Admin\sections  $sections
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        //
        $se = sections::findOrFail($request->id)->delete();
        toastr()->error(trans('news.Delete'));

        return redirect()->route('dashboard.sections.index');         
}
}

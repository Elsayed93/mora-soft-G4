<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseController;


use App\Models\Air_news;
use App\Models\news_servies;
use Illuminate\Support\Facades\File;
use Illuminate\Http\Request;
use Yajra\DataTables\Html\Editor\Fields\Image;

class NewsServiesController extends BaseController
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $settings = $this->site_settings;
        $news = news_servies::all();

        return view('Admin.news.news' , compact('news','settings'));
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



        //    return $request;






        $news = new news_servies();

        $fileUpload = request()->file('image');


        if ($fileUpload) {
            $news['image'] =
                $fileName = time() . rand(0, 999999999) . '.' . $fileUpload->getClientOriginalExtension();
                $request->image->move(public_path('news/'. $request->id), $fileName);
            }


        $news->title = [
            'ar' => $request->title,

            'en' => $request->title_en
        ];

        $news->description = [
            'ar' => $request->desc,

            'en' => $request->desc_en
        ];

        $news->active = $request->status;

        $news->value_active = $request->status;
        $news->created_at = $request->news_date;

        $news->save();



        toastr()->success(trans('news.Save'));


        return redirect()->route('dashboard.news.index');

    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\news_servies  $news_servies
     * @return \Illuminate\Http\Response
     */
    public function show(news_servies $news_servies)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\news_servies  $news_servies
     * @return \Illuminate\Http\Response
     */
    public function edit(news_servies $news_servies)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\news_servies  $news_servies
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {


        $news = news_servies::findOrFail($request->id);

        if ($news) {
            $filename=$news->image;
            $fileUpload = request()->file('image');

            if ($request->image) {
                //remove old image
                if ($news->image) {
                    if (File::exists('news/' . $news->image)) {
                        unlink('news/' . $news->image);
                    }

        if ($fileUpload) {
            $news['image'] =
                $fileName = time() . rand(0, 999999999) . '.' . $fileUpload->getClientOriginalExtension();
                $request->image->move(public_path('news/'), $fileName);

                $news->update([
                    'image'=> $fileName
                    ]);

            }

                }
            }
        }




        $news->title = [
            'ar' => $request->title,

            'en' => $request->title_en
        ];

            $news->description = [
                'ar' => $request->desc,

                'en' => $request->desc_en
            ];




            if ($request->status == 2) {
                $news->update([
                'value_active' => 2,
                'active' => 2,

                'created_at' => $request->news_date,


            ]);


            } elseif ($request->status == 1) {
                $news->update([
                'value_active' => 1,
                'active' => 1,

                'created_at' => $request->news_date,

            ]);

            }



            toastr()->success(trans('news.Edit'));

            return redirect()->route('dashboard.news.index');


        }    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\news_servies  $news_servies
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {

        $news = news_servies::findOrFail($request->id)->delete();



        toastr()->error(trans('news.Delete'));
        return redirect()->route('dashboard.news.index');

    }


    public function delete_all(Request $request)
    {
        // return $request;

        $delete_all_id = explode(",", $request->delete_all_id);

        news_servies::whereIn('id', $delete_all_id)->Delete();
        toastr()->error(trans('news.Delete'));
        return redirect()->route('dashboard.news.index');

    }
}

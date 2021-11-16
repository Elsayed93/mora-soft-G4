<?php

namespace App\Http\Controllers;

use App\Models\Air_news;
use App\Models\news_servies;
use Illuminate\Http\Request;

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
        
        return view('Admin.pages.news.news' , compact('news','settings'));
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


        $news = new news_servies();

        $fileUpload = request()->file('image');
        if ($fileUpload) {
            $news['image'] =
                $fileName = time() . rand(0, 999999999) . '.' . $fileUpload->getClientOriginalExtension();
            $fileUpload->storeAs('public/' . 'news', $fileName);
        }

        //  $news -> image = $request ->photo;

        //  $file_extention = $request -> photo ->getClientOriginalExtension();
        //  $file_name = time().'.'.$file_extention;
        //  $path = 'images/news';
        //  $request -> photo -> move($path ,$file_name);

        $news->title = [
            'ar' => $request->title,

            'en' => $request->title_en
        ];

        $news->description = [
            'ar' => $request->desc,

            'en' => $request->desc_en
        ];

        $news->active = $request->status;

        $news->value_active = 1;
        $news->created_at = $request->news_date;



        $news->save();

        return redirect()->route('news.index');
        toastr()->success(trans('Grades.messege_grades_add'));

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
        //

$news = news_servies::findOrFail($request->id);



 if ($request->status === 'مفعل') {

     $news->update([
        $news->value_active = 1,
        $news -> active = $request->status,
         $news ->  created_at = $request->news_date,
     ]);

     news_servies::create([

        $news->value_active=1,
        $news -> active = $request->status,
        $news ->  created_at = $request->news_date,


     ]);
 }

 else {
     $news->update([
          $news->value_active=2,
         $news -> active = $request->status,
         $news ->  created_at = $request->news_date,
     ]);
     news_servies::create([
        $news->value_active=2,
        $news -> active = $request->status,
        $news ->  created_at = $request->news_date,
     ]);
 }
 $fileUpload = request()->file('image');
        if ($fileUpload) {
            $news['image'] =
                $fileName = time() . rand(0, 999999999) . '.' . $fileUpload->getClientOriginalExtension();
            $fileUpload->storeAs('public/' . 'news', $fileName);
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

        $news->value_active = 1;
        $news->created_at = $request->news_date;




 $news->save();


return redirect()->route('news.index');
toastr()->success(trans('Grades.messege_grades_add'));



}
    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\news_servies  $news_servies
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {

        $news = news_servies::findOrFail($request->id)->delete();



        toastr()->error(trans('Grades.messege_grades_delete'));
        return back();

    }
}

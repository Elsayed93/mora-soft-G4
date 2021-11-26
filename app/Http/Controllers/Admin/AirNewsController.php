<?php

namespace App\Http\Controllers\Admin;



use App\Models\Air_news;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\BaseController;

class AirNewsController extends BaseController
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $settings = $this->site_settings;
        $news = Air_news::all();

        return view('Admin.news.news_air' , compact('news','settings'));
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

        $news = new Air_news();


        $news->name = ['ar' => $request->name,

        'en' => $request->name_en];

        $news->agreements = ['ar' => $request->agree,

        'en' => $request->agree_en];


        $news->Air_transport_quantity = ['ar' => $request->air,

        'en' => $request->air_en];


        $news->active = $request->status;

        $news->value_active = $request->status;

            $news->created_at = $request->news_date;


            $news->save();

                  toastr()->success(trans('news.Save'));
                  return redirect()->route('dashboard.news_air.index');


             }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Air_news  $air_news
     * @return \Illuminate\Http\Response
     */
    public function show(Air_news $air_news)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Air_news  $air_news
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request)
    {
        // $news = Air_news::findOrFail($request->id);
        return $request;

    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Air_news  $air_news
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        //

$news = Air_news::findOrFail($request->id);



 $news->name = ['ar' => $request->name,

 'en' => $request->name_en];

 $news->agreements = ['ar' => $request->agree,

 'en' => $request->agree_en];


 $news->Air_transport_quantity = ['ar' => $request->air,

 'en' => $request->air_en];






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


$news->save();




 toastr()->success(trans('news.Edit'));
return redirect()->route('dashboard.news_air.index');


}

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Air_news  $air_news
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $news = Air_news::findOrFail($request->id)->delete();
        toastr()->error(trans('news.Delete'));
        return redirect()->route('dashboard.news_air.index');
        }

        public function delete_all(Request $request)
    {

        $delete_all_id = explode(",", $request->delete_all_id);

        Air_news::whereIn('id', $delete_all_id)->Delete();
        toastr()->error(trans('news.Delete'));
        return redirect()->route('dashboard.news_air.index');
            }

}



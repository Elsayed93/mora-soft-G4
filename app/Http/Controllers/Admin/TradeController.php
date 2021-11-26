<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\BaseController;


use App\Models\trade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TradeController extends BaseController
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $news = trade::all();
        $settings = $this->site_settings;
        return view('admin.trade.index', compact('news', 'settings'));    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $settings = $this->site_settings;

        return view('admin.trade.create' , compact('settings'));    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {


            $trade = new trade();

            $trade->name = ['ar' => $request->name_ar,
            'en' => $request->name_en];

            $trade->email = ['ar' => $request->email_ar,
            'en' => $request->email_en];

            $trade->password = ['ar' => md5($request->pass_ar),
            'en' =>md5($request->pass_en)
        ];
            $trade->status = $request->status;

            $trade->updated_at = $request->news_date;

            $trade->save();

            toastr()->success(trans('news.Save'));

            return redirect()->route('dashboard.trade.index');
        }

        catch (\Exception $e){
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);


        }    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Admin\trade  $trade
     * @return \Illuminate\Http\Response
     */
    public function show(trade $trade)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Admin\trade  $trade
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $settings = $this->site_settings;
        $news = trade::where('id',$id)->first();

        return view('admin.trade.edit' , compact('settings' , 'news'));    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Admin\trade  $trade
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $news = trade::findOrFail($request->id);



        $news->name = [
            'ar' => $request->name_ar,

            'en' => $request->name_en
        ];

        $news->email = [
            'ar' => $request->email_ar,

            'en' => $request->email_en
        ];

        $news->password = [
            'ar' =>md5($request->pass_ar),

            'en' =>md5($request->pass_en),
        ];
        $news->update();

            if ($request->status == 2) {
                $news->update([
                'status' => 2,
                'created_at' => $request->news_date,


            ]);


            } elseif ($request->status == 1) {
                $news->update([
                'status' => 1,
                'updated_at' => $request->news_date,

            ]);

            }


            toastr()->success(trans('news.Edit'));

            return redirect()->route('dashboard.trade.index');

        }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Admin\trade  $trade
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $shipping = trade::findOrFail($request->id);

        $shipping->delete();

        toastr()->error(trans('news.Delete'));
        return redirect()->route('dashboard.trade.index');
    }


    public function delete_all(Request $request)
    {
        // return $request;

        $delete_all_id = explode(",", $request->delete_all_id);

        trade::whereIn('id', $delete_all_id)->Delete();
        toastr()->error(trans('news.Delete'));
        return redirect()->route('dashboard.trade.index');

    }
}

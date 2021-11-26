<?php

namespace App\Http\Controllers\admin;
use App\Exports\export_excel;

use App\Http\Controllers\BaseController;

use App\Http\Requests\Shipping_Dates\Shipping;


use App\Models\shipping_dates;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;


class ShippingDatesController extends BaseController
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()

    {

         $settings = $this->site_settings;

        $news = shipping_dates::all();

        return view('admin.shipping.index', compact('news', 'settings'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
        $settings = $this->site_settings;

        return view('admin.shipping.create' , compact('settings'));

    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Shipping $request)
    {
        //

        try {


            $shipping = new shipping_dates();

            $shipping->from_date = ['ar' => $request->form_ar,
            'en' => $request->form_en];

            $shipping->to_date = ['ar' => $request->to_ar,
            'en' => $request->to_en];

            $shipping->type = ['ar' => $request->type_ar,
            'en' => $request->type_en];

            $shipping->price = ['ar' => $request->price_ar,
            'en' => $request->price_en];

            $shipping->status = $request->status;

            $shipping->updated_at = $request->news_date;


            $shipping->save();

            toastr()->success(trans('news.Save'));

            return redirect()->route('dashboard.shipping.index');
        }

        catch (\Exception $e){
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);


        }
     }
    /**
     * Display the specified resource.
     *
     * @param  \App\Models\shipping_dates  $shipping_dates
     * @return \Illuminate\Http\Response
     */


    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\shipping_dates  $shipping_dates
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
        $settings = $this->site_settings;
        $news = shipping_dates::where('id',$id)->first();

        return view('admin.shipping.edit' , compact('settings' , 'news'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\shipping_dates  $shipping_dates
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request , $id)
    {
        //
        // return $request;

        $news = shipping_dates::findOrFail($request->id);



        $news->from_date = [
            'ar' => $request->form_ar,

            'en' => $request->form_en
        ];

        $news->to_date = [
            'ar' => $request->to_ar,

            'en' => $request->to_en
        ];

        $news->type = [
            'ar' => $request->type_ar,

            'en' => $request->type_en
        ];
        $news->price = [
            'ar' => $request->price_ar,

            'en' => $request->price_en
        ];


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

            return redirect()->route('dashboard.shipping.index');
         }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\shipping_dates  $shipping_dates
     * @return \Illuminate\Http\Response
     */


    public function destroy(Request $request)
    {
        //
        $shipping = shipping_dates::findOrFail($request->id);

        $shipping->delete();

        toastr()->error(trans('news.Delete'));
        return redirect()->route('dashboard.shipping.index');

      }


    public function delete_all(Request $request)
    {
        // return $request;

        $delete_all_id = explode(",", $request->delete_all_id);

        shipping_dates::whereIn('id', $delete_all_id)->Delete();
        toastr()->error(trans('news.Delete'));
        return redirect()->route('dashboard.shipping.index');

    }

    public function show ($id)
    {
        return  Excel::download(new export_excel, 'Shipping.xlsx');
    }

}

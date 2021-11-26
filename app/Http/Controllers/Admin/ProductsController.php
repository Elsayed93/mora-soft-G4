<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseController;
use App\Http\Requests\Products\StoreProduct;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductsController extends BaseController
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $settings = $this->site_settings;
        $products = Product::all();

        return view('Admin.products.index', compact('products', 'settings'));

        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $settings = $this->site_settings;

        return view('Admin.products.create', compact('settings'));
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreProduct   $request)
    {
        $file=$request->image;
        if($request->image){
              $filename = $request->title_en.'-'.time().'.'.$file->getClientOriginalExtension();
            $path = public_path('assets/products/' . $filename);
            Image::make($file->getRealPath())->save($path, 100);
           $product= Product::create([
                'title_en'=>$request->post('title_en'),
                'title_ar'=>$request->post('title_ar'),
                'discription_ar'=>$request->post('discription_ar'),
                'discript_en'=>$request->post('discript_en'),
                'price_ar'=>$request->post('price_ar'),
                'price_en'=>$request->post('price_en'),
                'user_id'=>auth()->user()->id,
                'image'=>$filename,
            ]);
            if ($product) {
                toastr()->success(trans('dashboard.products.index'));

                return redirect()->route('dashboard.products.index')->with('success', __('site.success_store'));

            }

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

        $product=Product::where('id',$id)->first();


      return view('Admin.products.edit', compact('product', 'settings'));

    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(StoreProduct   $request, $id)
    {
        $product=Product::where('id',$id)->first();

           if($product){
            $filename=$product->image;
           $file=$request->image;
        if($request->image){
            //remove old image
    if($product->image){
        if (File::exists('assets/products/' . $product->image)) {
            unlink('assets/products/' . $product->image);
        }
     }

//upload new image
    $filename = $request->title.'-'.time().'.'.$file->getClientOriginalExtension();
    $path = public_path('assets/products/' . $filename);
    Image::make($file->getRealPath())->save($path, 100);
}


$product->update([
    'title_en'=>$request->post('title_en'),
    'title_ar'=>$request->post('title_ar'),
    'discription_ar'=>$request->post('discription_ar'),
    'discript_en'=>$request->post('discript_en'),
    'price_ar'=>$request->post('price_ar'),
    'price_en'=>$request->post('price_en'),
    'image'=> $filename,
]);
return redirect()->route('dashboard.products.index')->with('success', __('site.success_store'));




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
        $product=Product::where('id',$id)->first();
        if($product->image){

            if (File::exists('assets/products/' . $product->product)) {

                unlink('assets/products/' . $product->image);

            }
            $product->delete();
             return redirect()->route('dashboard.products.index')->
             with('success', __('site.success_store'));
        }
    }
}

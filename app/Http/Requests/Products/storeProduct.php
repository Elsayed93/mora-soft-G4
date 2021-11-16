<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class StoreProduct extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {

        return [
            'title_en' => 'required|min:3|max:100',
            'title_ar' => 'required|min:3|max:100',
            'discription_ar' => 'required|min:10',
            'discript_en' => 'required|min:10',
            'price_ar' => 'required|numeric',
            'price_en' => 'required|numeric',
            'image' =>$this->product?'nullable': 'required_without:id',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'title_en.required' => __('product.arabic title_en required'),
            'title_en.min' => __('product.arabic title_en should at be at least 3 characters long'),
            'title_en.max' => __('product.arabic title_en should not be greater than 100 characters long'),

            'title_ar.required' => __('product.arabic title_en required'),
            'title_ar.min' => __('product.arabic title_en should at be at least 3 characters long'),
            'title_ar.max' => __('product.arabic title_en should not be greater than 100 characters long'),

            'discription_ar.required' => __('product.arabic discription_ar required'),
           'discription_ar.min'=>__('product.arabic discription_ar should at be at least 10 characters long'),
            
       
            'discript_en.required' => __('product.arabic discription_en required'),
            'discription_en.min'=>__('product.arabic discription_en should at be at least 10 characters long'),
            
            'price_ar.required' => __('product.arabic price_ar required'),
            'price_ar.numeric' => __('product.arabic price_ar number'),
     

            'price_en.required' => __('product.arabic price_en required'),
            'price_en.numeric' => __('product.arabic price_en number'),
     
              'image.required'=>__('product.image required'),

            
        ];
    }
}

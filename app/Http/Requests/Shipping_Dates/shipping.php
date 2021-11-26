<?php

namespace App\Http\Requests\Shipping_Dates;

use Illuminate\Foundation\Http\FormRequest;

class shipping extends FormRequest
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
            'form_ar' => 'required',
            'form_en' => 'required',
            'to_ar' => 'required',
            'to_en' => 'required',
            'type_ar' => 'required',
            'type_en' => 'required',
            'price_ar' => 'required|numeric',
            'price_en' => 'required|numeric',
            'status' => 'required',
            'news_date' => 'required',

        ];
    }

    public function messages()
    {
        return [
            'form_ar.required' => __('product.arabic title_en required'),
            'form_en.min' => __('product.arabic title_en should at be at least 3 characters long'),
           

            
        ];
    }
}

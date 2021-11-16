<?php

namespace App\Http\Requests\Slider;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
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
            'name_ar' => 'required|min:3|max:100|unique:sliders,name_ar',
            'name_en' => 'required|min:3|max:100|unique:sliders,name_en',
            'content_ar' => 'required',
            'content_en' => 'required',


            // 'image' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
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
            'name_ar.required' => __('sliders.arabic name required'),
            'name_ar.min' => __('sliders.arabic name should at be at least 3 characters long'),
            'name_ar.max' => __('sliders.arabic name should not be greater than 100 characters long'),
            'name_ar.unique' => __('sliders.arabic name should be unique'),


            'name_en.required' => __('sliders.english name required'),
            'name_en.min' => __('sliders.english name should at be at least 3 characters long'),
            'name_en.max' => __('sliders.english name should not be greater than 100 characters long'),
            'name_en.unique' => __('sliders.english name should be unique'),

            'content_ar.required' => __('sliders.content_ar required'),
            'content_en.required' => __('sliders.content_en required'),


            'image.required' => __('sliders.image required'),
            // 'image.required' => __('sliders.image required'),
        ];
    }
}

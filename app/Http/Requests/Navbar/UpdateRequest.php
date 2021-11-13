<?php

namespace App\Http\Requests\Navbar;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
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
            'nav_section_name_ar' => 'required|min:3|max:100|unique:navbars,nav_section_name_ar,'.$this->navbar,
            'nav_section_name_en' => 'required|min:3|max:100|unique:navbars,nav_section_name_en,'.$this->navbar,
            'nav_section_link' => 'required',
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
            'nav_section_name_ar.required' => __('navbar.arabic name required'),
            'nav_section_name_ar.min' => __('navbar.arabic name should at be at least 3 characters long'),
            'nav_section_name_ar.max' => __('navbar.arabic name should not be greater than 100 characters long'),
            'nav_section_name_ar.unique' => __('navbar.arabic name should be unique'),


            'nav_section_name_en.required' => __('navbar.english web name required'),
            'nav_section_name_en.min' => __('navbar.english web name should at be at least 3 characters long'),
            'nav_section_name_en.max' => __('navbar.english web name should not be greater than 100 characters long'),
            'nav_section_name_en.unique' => __('navbar.english name should be unique'),

            'nav_section_link.required' => __('navbar.section link required'),
            // 'nav_section_link.url' => __('navbar.invalid link'),
        ];
    }
}

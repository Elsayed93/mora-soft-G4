<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class updateRequest extends FormRequest
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
            'web_name_ar' => 'required|min:3|max:255',
            'web_name_en' => 'required|min:3|max:255',
            'facebook_link' => 'required|url',
            'twitter_link' => 'required|url',
            'linkedin_link' => 'required|url',
            'phone' => 'required|regex:/(01)[0-9]{9}/',

            'image' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
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
            'web_name_ar.required' => __('settings.arabic web name required'),
            'web_name_ar.min' => __('settings.arabic web name should at be at least 3 characters long'),
            'web_name_ar.max' => __('settings.arabic web name should not be greater than 255 characters long'),

            'web_name_en.required' => __('settings.english web name required'),
            'web_name_en.min' => __('settings.english web name should at be at least 3 characters long'),
            'web_name_en.max' => __('settings.english web name should not be greater than 255 characters long'),

            'facebook_link.required' => __('settings.facebook link required'),
            'facebook_link.url' => __('settings.invalid link'),

            'twitter_link.required' => __('settings.twitter link required'),
            'twitter_link.url' => __('settings.invalid link'),

            'linkedin_link.required' => __('settings.linkedin link required'),
            'linkedin_link.url' => __('settings.invalid link'),

            // 'image.required' => __('settings.image required'),
            'image.image' => __('settings.invalid image'),
            'image.mimes' => __('settings.invalid image'),

            'phone.required' => __('settings.phone number required'),
            // 'phone.min' => __('settings.phone number should at be at least 10 characters long'),
            // 'phone.max' => __('settings.phone number should not be greater than 255 characters long'),
        ];
    }
}

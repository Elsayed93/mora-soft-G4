@extends('Admin.layouts.master')

@section('title')
    @lang('settings.settings')
@endsection
{{-- css --}}
@section('css')
    <style>
        form div {
            display: inline-block;
        }

        section {
            display: block;
            background-color: #141a47;
            padding: 20px;
            margin: 40px 0;
            border-radius: 15px;
        }

    </style>

@endsection
@section('content')
    <div class="container">
        {{-- show errors --}}
        <div class="row">
            @if ($errors->any())
                <div class="alert alert-danger">
                    <ul>
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif
        </div>

        {{-- actions message --}}
        @include('Admin.layouts.actions_messages')

        <div class="rwo">
            <form action="{{ route('dashboard.settings.update', $settings->id) }}" method="POST"
                enctype="multipart/form-data">
                @csrf
                @method('PUT')
                <section>
                    {{-- arabic name --}}
                    <div class="mb-3 col-md-5">
                        <label for="name_ar" class="form-label">@lang('settings.name_ar')</label>
                        <input type="text" class="form-control" id="name_ar" aria-describedby="nameHelp" name="web_name_ar"
                            placeholder="{{ __('settings.website name in arabic') }}"
                            value="{{ $settings->web_name_ar }}">
                    </div>

                    {{-- english name --}}
                    <div class="mb-3 col-md-5">
                        <label for="name_en" class="form-label">@lang('settings.name_en')</label>
                        <input type="text" class="form-control" id="name_en" aria-describedby="nameHelp" name="web_name_en"
                            placeholder="{{ __('settings.website name in english') }}"
                            value="{{ $settings->web_name_en }}">
                    </div>
                    {{-- email --}}
                    <div class="mb-3 col-md-6">
                        <label for="exampleInputEmail1" class="form-label">@lang('settings.email')</label>
                        <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"
                            placeholder="Please enter your email" value="{{ $settings->email }}" name="email">
                    </div>

                     {{-- phone --}}
                     <div class="mb-3 col-md-4">
                        <label for="phone" class="form-label">@lang('settings.phone')</label>
                        <input type="text" class="form-control" id="phone" aria-describedby="phoneHelp"
                            placeholder="Please enter your phone" value="{{ $settings->phone }}" name="phone">
                    </div>
                    {{-- image --}}
                    <div class="mb-3 col-md-6">
                        <label for="uploadImage" class="form-label">@lang('settings.upload_image')</label>
                        <input type="file" class="form-control" id="uploadImage" aria-describedby="imageHelp"
                            name="image">
                    </div>
                </section>

                <section>
                    {{-- facebook link --}}
                    <div class="mb-3 col-md-5">
                        <label for="facebookLink" class="form-label">@lang('settings.facebook_link')</label>
                        <input type="text" class="form-control" id="facebookLink" aria-describedby="nameHelp"
                            name="facebook_link" placeholder="{{ __('settings.facebook_link') }}"
                            value="{{ $settings->facebook_link }}">
                    </div>

                    {{-- twitter_link --}}
                    <div class="mb-3 col-md-5">
                        <label for="name_en" class="form-label">@lang('settings.twitter_link')</label>
                        <input type="text" class="form-control" id="name_en" aria-describedby="nameHelp"
                            name="twitter_link" placeholder="{{ __('settings.twitter_link') }}"
                            value="{{ $settings->twitter_link }}">
                    </div>

                    {{-- linkedin name --}}
                    <div class="mb-3 col-md-5">
                        <label for="name_en" class="form-label">@lang('settings.linkedin_link')</label>
                        <input type="text" class="form-control" id="name_en" aria-describedby="nameHelp"
                            name="linkedin_link" placeholder="{{ __('settings.linkedin_link') }}"
                            value="{{ $settings->linkedin_link }}">
                    </div>
                </section>
                <br>
                <br>
                <button type="submit" class="btn btn-primary">@lang('settings.Submit')</button>
            </form>
        </div>

    </div>
@endsection

{{-- js --}}

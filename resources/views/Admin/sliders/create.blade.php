@extends('Admin.layouts.master')

@section('title')
    @lang('sliders.sliders')
@endsection
{{-- css --}}
@section('css')
    <style>
        table {
            /* display: block; */
            background-color: #141a47 !important;
            padding: 20px;
            /* margin: 40px 0; */
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


        <div class="row">
            <div class="col-md-6">
                <h2>
                    @lang('sliders.Create slider')
                </h2>
            </div>
        </div>


        <div class="row mt-5">
            <div class="col-md-8">
                <form action="{{ route('dashboard.sliders.store') }}" method="POST">
                    @csrf
                    {{-- slider arabic name --}}
                    <div class="mb-3">
                        <label for="sliderNameAr" class="form-label">@lang('sliders.name in arabic')</label>
                        <input type="text" class="form-control" id="sliderNameAr" aria-describedby="sliderArabicNameHelp"
                            name="name_ar" value="{{ old('name_ar') }}">
                    </div>

                    {{-- slider english name --}}
                    <div class="mb-3">
                        <label for="sliderNameEn" class="form-label">@lang('sliders.name in english')</label>
                        <input type="text" class="form-control" id="sliderNameEn" aria-describedby="sliderEnglishNameHelp"
                            name="name_en" value="{{ old('name_en') }}">
                    </div>

                    {{-- slider arabic content --}}
                    <div class="mb-3">
                        <label for="sliderContent" class="form-label">@lang('sliders.slider arabic content')</label>
                        <input type="text" class="form-control" id="sliderContent"
                            aria-describedby="sliderContentNameHelp" name="content_ar"
                            value="{{ old('content_ar') }}">
                    </div>

                    {{-- slider english content --}}
                    <div class="mb-3">
                        <label for="sliderContent" class="form-label">@lang('sliders.slider english content')</label>
                        <input type="text" class="form-control" id="sliderContent"
                            aria-describedby="sliderContentNameHelp" name="content_en"
                            value="{{ old('content_en') }}">
                    </div>

                    {{-- slider image --}}
                    <div class="mb-3">
                        <label for="sliderImage" class="form-label">@lang('sliders.slider image')</label>
                        <input type="file" class="form-control" id="sliderImage" aria-describedby="sliderImageNameHelp"
                            name="image" value="{{ old('image') }}">
                    </div>
                    <button type="submit" class="btn btn-primary">@lang('site.save')</button>
                </form>
            </div>
        </div>

    </div>
@endsection

{{-- js --}}

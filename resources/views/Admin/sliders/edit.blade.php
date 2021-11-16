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
    {{-- {{dd(get_defined_vars())}} --}}
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
                    @lang('sliders.Edit slider')
                </h2>
            </div>
        </div>


        <div class="row mt-5">
            <div class="col-md-8">
                <form action="{{ route('dashboard.sliders.update', $slider->id) }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    @method('PUT')
                    {{-- slider arabic name --}}
                    <div class="mb-3">
                        <label for="sliderNameAr" class="form-label">@lang('sliders.name in arabic')</label>
                        <input type="text" class="form-control" id="sliderNameAr" aria-describedby="sliderArabicNameHelp"
                            name="name_ar" value="{{ $slider->name_ar }}">
                    </div>

                    {{-- slider english name --}}
                    <div class="mb-3">
                        <label for="sliderNameEn" class="form-label">@lang('sliders.name in english')</label>
                        <input type="text" class="form-control" id="sliderNameEn" aria-describedby="sliderEnglishNameHelp"
                            name="name_en" value="{{ $slider->name_en }}">
                    </div>

                    {{-- slider arabic content --}}
                    <div class="mb-3">
                        <label for="sliderContent" class="form-label">@lang('sliders.slider arabic content')</label>
                        <input type="text" class="form-control" id="sliderContent"
                            aria-describedby="sliderContentNameHelp" name="content_ar" value="{{ $slider->content_ar }}">
                    </div>

                    {{-- slider english content --}}
                    <div class="mb-3">
                        <label for="sliderContent" class="form-label">@lang('sliders.slider english content')</label>
                        <input type="text" class="form-control" id="sliderContent"
                            aria-describedby="sliderContentNameHelp" name="content_en" value="{{ $slider->content_en }}">
                    </div>

                    {{-- slider image --}}
                    <label for="sliderImage" class="form-label">@lang('sliders.slider image')</label>
                    <div class="mb-3" style="display:flex;">

                        <input type="file" class="form-control" id="sliderImage" aria-describedby="sliderImageNameHelp"
                            name="image" value="">
                        <span style="margin-left: 10px">
                            <img src="{{ asset('images/sliders/' . $slider->image) }}" alt="" width="100">
                        </span>
                    </div>

                    <div>

                        <button type="submit" class="btn btn-primary">@lang('site.save')</button>
                    </div>
                </form>
            </div>
        </div>

    </div>
@endsection

{{-- js --}}

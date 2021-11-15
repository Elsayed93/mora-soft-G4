@extends('Admin.layouts.master')

@section('title')
    @lang('product.products')
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
                    @lang('product.Create Product Section')
                </h2>
            </div>
        </div>
<br>
        <div class="row">
            <div class="col-md-8">
                <form action="{{ route('dashboard.products.store') }}" method="POST"  enctype="multipart/form-data">
                    @csrf
                    {{-- section arabic name --}}
                    <div class="mb-3">
                        <label for="sectionNameAr" class="form-label">@lang('product.product title in arabic')</label>
                        <input type="text" class="form-control" id="sectionNameAr" aria-describedby="sectionArabicNameHelp"
                            name="title_ar" value="{{ old('title_ar') }}">
                    </div>

                    {{-- section english name --}}
                    <div class="mb-3">
                        <label for="sectionNameEn" class="form-label">@lang('product.product title in english')</label>
                        <input type="text" class="form-control" id="sectionNameEn"
                            aria-describedby="sectionEnglishNameHelp" name="title_en"
                            value="{{ old('title_en') }}">
                    </div>
                    {{-- section english discription --}}
                    <div class="mb-3">
                        <label for="sectionNameEn" class="form-label">@lang('product.product discription in english')</label>
                       <textarea class="form-control" id="sectionNameEn"
                            aria-describedby="sectionEnglishNameHelp" name="discript_en"></textarea>
                     
                    </div>
                    {{-- section arabic discription --}}
                    <div class="mb-3">
                        <label for="sectionNameEn" class="form-label">@lang('product.product discription in arabic')</label>
                       <textarea class="form-control" id="sectionNameEn"
                            aria-describedby="sectionEnglishNameHelp" name="discription_ar"></textarea>
                     
                    </div>

                    {{-- section link --}}
                    <div class="mb-3">
                        <label for="sectionLink" class="form-label">@lang('product.price_ar')</label>
                        <input type="text" class="form-control" id="sectionLink" aria-describedby="sectionLinkNameHelp"
                            name="price_ar" value="{{ old('price_ar') }}">
                    </div>
                    {{-- section link --}}
                    <div class="mb-3">
                        <label for="sectionLink" class="form-label">@lang('product.price_en')</label>
                        <input type="text" class="form-control" id="sectionLink" aria-describedby="sectionLinkNameHelp"
                            name="price_en" value="{{ old('price_en') }}">
                    </div>
                    {{-- section link --}}
                    <div class="mb-3">
                        <label for="sectionLink" class="form-label">@lang('product.image')</label>
                        <input type="file" name="image">
                    </div>
                    <button type="submit" class="btn btn-primary">@lang('site.save')</button>
                </form>
            </div>
        </div>

    </div>
@endsection

{{-- js --}}

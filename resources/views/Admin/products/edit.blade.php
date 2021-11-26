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

        <div class="row">
            <div class="col-md-8">
                <form action="{{ route('dashboard.products.update',$product->id) }}" method="POST"
                     enctype="multipart/form-data">

                @csrf
                    @method('PUT')
                    {{-- section arabic name --}}
                    <div class="mb-3">
                        <label for="sectionNameAr" class="form-label">@lang('product.section title in arabic')</label>
                        <input type="text" class="form-control" id="sectionNameAr" aria-describedby="sectionArabicNameHelp"
                            name="title_ar" value="{{ old('title_ar')? old('title_ar'):$product->title_ar }}" >
                    </div>

                    {{-- section english name --}}
                    <div class="mb-3">
                        <label for="sectionNameEn" class="form-label">@lang('product.section title in english')</label>
                        <input type="text" class="form-control" id="sectionNameEn"
                            aria-describedby="sectionEnglishNameHelp" name="title_en"
                            value="{{ old('title_en')? old('title_en'):$product->title_en }}">
                    </div>
                    {{-- section english discription --}}
                    <div class="mb-3">
                        <label for="sectionNameEn" class="form-label">@lang('product.section discription in english')</label>
                       <textarea class="form-control" id="sectionNameEn"
                            aria-describedby="sectionEnglishNameHelp" name="discript_en">{{ old('discript_en')? old('discript_en'):$product->discript_en }}</textarea>

                    </div>
                    {{-- section arabic discription --}}
                    <div class="mb-3">
                        <label for="sectionNameEn" class="form-label">@lang('product.section discription in arabic')</label>
                       <textarea class="form-control" id="sectionNameEn"
                            aria-describedby="sectionEnglishNameHelp" name="discription_ar">{{ old('discription_ar')? old('discription_ar'):$product->discription_ar }}</textarea>

                    </div>

                    {{-- section link --}}
                    <div class="mb-3">
                        <label for="sectionLink" class="form-label">@lang('product.price_ar')</label>
                        <input type="text" class="form-control" id="sectionLink" aria-describedby="sectionLinkNameHelp"
                            name="price_ar" value="{{ old('price_ar') ? old('price_ar'):$product->price_ar}}">
                    </div>
                    {{-- section link --}}
                    <div class="mb-3">
                        <label for="sectionLink" class="form-label">@lang('product.price_en')</label>
                        <input type="text" class="form-control" id="sectionLink" aria-describedby="sectionLinkNameHelp"
                            name="price_en" value="{{ old('price_en')? old('price_en'):$product->price_en }}">
                    </div>
                    {{-- section link --}}
                    <div class="mb-3">
                        <label for="sectionLink" class="form-label">@lang('product.image')</label>
                        <input type="file" name="image">
                    </div>
                    <button type="submit" class="btn btn-primary">@lang('site.save')</button>
                </form>
            </div>
            <div class="col-md-4">
                <img src="{{asset('assets/products/'.$product->image)}}">
            </div>
        </div>

    </div>
@endsection

{{-- js --}}

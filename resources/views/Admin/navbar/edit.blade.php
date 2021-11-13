@extends('Admin.layouts.master')

@section('title')
    @lang('navbar.navbar')
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
                    @lang('navbar.Edit Navbar Section')
                </h2>
            </div>
        </div>

        <div class="row mt-5">
            <div class="col-md-8">
                <form action="{{ route('dashboard.navbar.update', $navSection->id) }}" method="POST">
                    @csrf
                    @method('PUT')
                    {{-- section arabic name --}}
                    <div class="mb-3">
                        <label for="sectionNameAr" class="form-label">@lang('navbar.section name in arabic')</label>
                        <input type="text" class="form-control" id="sectionNameAr" aria-describedby="sectionArabicNameHelp"
                            name="nav_section_name_ar" value="{{ $navSection->nav_section_name_ar }}">
                    </div>

                    {{-- section english name --}}
                    <div class="mb-3">
                        <label for="sectionNameEn" class="form-label">@lang('navbar.section name in english')</label>
                        <input type="text" class="form-control" id="sectionNameEn"
                            aria-describedby="sectionEnglishNameHelp" name="nav_section_name_en"
                            value="{{ $navSection->nav_section_name_en }}">
                    </div>

                    {{-- section link --}}
                    <div class="mb-3">
                        <label for="sectionLink" class="form-label">@lang('navbar.section link')</label>
                        <input type="text" class="form-control" id="sectionLink" aria-describedby="sectionLinkNameHelp"
                            name="nav_section_link" value="{{ $navSection->nav_section_link }}">
                    </div>
                    <button type="submit" class="btn btn-primary">@lang('site.update')</button>
                </form>
            </div>
        </div>

    </div>
@endsection

{{-- js --}}

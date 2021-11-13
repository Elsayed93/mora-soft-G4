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
                    @lang('navbar.Navbar Sections')
                </h2>
            </div>
        </div>

        <div class="row mt-5">
            <div class="cole-md-6">
                <a href="{{ route('dashboard.navbar.create') }}" class="btn btn-primary">
                    <i class="icofont-ui-add"></i>
                    @lang('site.add')
                </a>
            </div>
        </div>

        {{-- table --}}
        <div class="row mt-3">
            <table class="table-dark">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">@lang('navbar.section name in arabic')</th>
                        <th scope="col">@lang('navbar.section name in english')</th>
                        <th scope="col">@lang('navbar.section link')</th>
                        <th scope="col">@lang('navbar.actions')</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($navSections as $index => $navSection)

                        <tr>
                            <th scope="row">{{ $index + 1 }}</th>
                            <th>{{ $navSection->nav_section_name_ar }}</th>
                            <th>{{ $navSection->nav_section_name_en }}</th>
                            <th>{{ $navSection->nav_section_link }}</th>
                            <th style="display: inline-flex;">
                                <a href="{{ route('dashboard.navbar.edit', $navSection->id) }}" class="btn btn-info"
                                    style="margin:0 10px;">
                                    @lang('site.edit')
                                </a>

                                <form action="{{ route('dashboard.navbar.destroy', $navSection->id) }}" method="POST">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-danger">@lang('site.delete')</button>
                                </form>
                            </th>

                        </tr>

                    @endforeach
                </tbody>
            </table>
        </div>

    </div>
@endsection

{{-- js --}}

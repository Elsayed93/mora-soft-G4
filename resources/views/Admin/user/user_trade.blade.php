@extends('Admin.layouts.master')

@section('title')
    @lang('tr.li1')
@endsection
{{-- css --}}
@section('css')
@toastr_css

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


        <div class="row">
            <div class="col-md-6">
                <h2>
                    @lang('tr.le1')
                </h2>
            </div>
        </div>

     

        {{-- table --}}
        <div class="row mt-3">
            <table id="datatable" class="table-dark">
                <thead>
                    <tr>
                  
                        <th scope="col">#</th>
                        <th scope="col">@lang('tr.name')</th>
                        <th scope="col">@lang('tr.email')</th>
                        <th scope="col">@lang('tr.pass')</th>
                        <th scope="col">@lang('news.create_at')</th>

                    </tr>
                </thead>
                <tbody>

                    <?php $i = 0; ?>
                    @foreach ($news as $news)
                        <tr>
                            <?php $i++; ?>
                          

                            <th>{{ $i }}</th>
                            <th>{{ $news->name }}</th>
                            <th>{{ $news->email }}</th>
                            <th>{{ $news->password }}</th>
                           <th>{{ $news->updated_at }}</th>

                           

                        </tr>

                      
@endforeach
                </tbody>
            </table>
        </div>

    </div>


@endsection

@section('js')

@toastr_js
@toastr_render



@endsection



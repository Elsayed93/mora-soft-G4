@extends('Admin.layouts.master')

@section('title')
    @lang('tr.le')
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
                    @lang('tr.le')
                </h2>
            </div>
        </div>

        <div class="row mt-5">
            <div class="cole-md-6">
                <a style="margin-right:15px" href="{{ route('dashboard.trade.create') }}"
                class="btn-lg btn-success">
                    <i class="icofont-ui-add"></i>
                </a>


                        <button type="button" style="background:red;color:white;width:110px;margin-right:15px"
                        class="button  btn-lg btn-danger" data-toggle="modal"
                        data-target="#delete_all" id="btn_delete_all" disabled>
                        <i class="icofont-ui-delete"></i>

                    </button>



            </div>
        </div>

        {{-- table --}}
        <div  class="row mt-3">
            <table id="datatable" class="table">
                <thead>
                    <tr>
                    <th>
                        <input id="check-all" type="checkbox"
                        name="select_all" id="checkboxes" id="example-select-all">
                        <label for="check-all"></label>
                    </th>
                        <th scope="col">#</th>
                        <th scope="col">@lang('tr.name')</th>
                        <th scope="col">@lang('tr.email')</th>
                        <th style="width: 2px" scope="col">@lang('tr.pass')</th>
                        <th scope="col">@lang('news.status')</th>
                        <th scope="col">@lang('news.create_at')</th>
                        <th scope="col">@lang('news.option')</th>

                    </tr>
                </thead>
                <tbody>

                    <?php $i = 0; ?>
                    @foreach ($news as $news)
                        <tr>
                            <?php $i++; ?>
                           <th>
                                <input id="check-full" value="{{ $news->id }}"  type="checkbox"
                                id="whatever_1"  class="checkboxes" name="whatever_1">
                                <label for="whatever_1"></label>
                           </th>

                            <th>{{ $i }}</th>
                            <th>{{ $news->name }}</th>
                            <th>{{ $news->email }}</th>
                            <th style="width: 2px" >{{ $news->password }}</th>
                            <th>
                            @if ($news->status == 1)
                            <span  class="text-success">{{ trans('news.open') }}</span>
                            @elseif ($news->status == 2)
                            <span  class="text-danger">{{ trans('news.no_open') }}</span>


                            @else
                                <span class="text"></span>
                            @endif

                           </th>
                           <th>{{ $news->updated_at }}</th>

                            <th style="display: inline-flex;">
                                <a href="{{ route('dashboard.trade.edit' , $news->id) }}" class="btn-lg btn-info"
                                    style="margin:0 10px;">
                                    <i class="icofont-ui-edit"></i>


                                </a>

                                <a href="" class="btn-lg btn-danger"
                                data-toggle="modal" data-target="#delete{{ $news->id }}"
                                    style="background:red">
                                    <i class="icofont-ui-delete"></i>

                                </a>

                            </th>

                        </tr>
                            <div id="delete{{ $news->id }}" class="modal fade" role="dialog">
                        <div class="modal-dialog">

                            <div class="modal-content">
                            <div class="modal-header">
                                <button type="button"  data-dismiss="modal">&times;</button>
                                <h4 class="modal-title">{{ trans('tr.delete0') }}</h4>
                            </div>
                            <div class="modal-body">

                                <form action="{{ route('dashboard.trade.destroy' , 'test') }}" method="post">
                                    {{ method_field('Delete') }}
                                    @csrf
                                    {{ trans('tr.delete1') }}
                                    <input id="id" type="hidden" name="id" class="form-control"
                                        value="{{ $news -> id }}">
                                    <div class="modal-footer">

                                     <button type="submit" style="background:red"  class="btn btn-danger">
                                     {{ trans('news.Yes') }}</button>

                                        <button type="button" class="btn btn-secondary"
                                            data-dismiss="modal">{{ trans('news.No') }}</button>

                                    </div>
                                </form>
                                </div>
                            </div>
                            </div>
@endforeach
                </tbody>
            </table>
        </div>

    </div>


<div class="modal fade" id="delete_all" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
     aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 style="font-family: 'Cairo', sans-serif;" class="modal-title" id="exampleModalLabel">
                    {{ trans('tr.delete0') }}
                </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>

            <form action="{{ route('dashboard.trade_d_all') }}" method="POST">
                {{ csrf_field() }}
                <div class="modal-body">
                    {{ trans('tr.delete1') }}
                    <input class="text" type="hidden" id="delete_all_id" name="delete_all_id" value=''>
                </div>

                <div class="modal-footer">
                    <button  type="button" class="btn btn-secondary"
                            data-dismiss="modal">{{ trans('news.No') }}</button>
                    <button style="background:red" type="submit" class="btn btn-danger">{{ trans('news.Yes') }}</button>
                </div>
            </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('js')

@toastr_js
@toastr_render



@endsection



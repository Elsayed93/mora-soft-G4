@extends('Admin.layouts.master')

@section('title')
    @lang('sh.li')
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
                    @lang('sh.li')
                </h2>
            </div>
        </div>

        <div class="row mt-5">
            <div class="cole-md-6">
                <a style="background:" href="{{ route('dashboard.shipping.create') }}"
                class="btn-sm btn-success">
                    <i class="icofont-ui-add"></i>
                    @lang('site.add')
                </a>

                        <a href="{{ route('dashboard.shipping.show' , 'test') }}"
                         type="button" style="width:90px;margin:10px;background:orange"
                        class="button  btn-sm btn-success"
                       >@lang('sh.print')</a>



                        <button type="button" style="background:red;color:white;width:110px"
                        class="button  btn-sm btn-danger" data-toggle="modal"
                        data-target="#delete_all" id="btn_delete_all" disabled>
                        {{trans('news.btn_delete_all')}}</button>



            </div>
        </div>

        {{-- table --}}
        <div class="row mt-3">
            <table id="datatable" class="table-dark">
                <thead>
                    <tr>
                    <th>
                        <input id="check-all" type="checkbox"
                        name="select_all" id="checkboxes" id="example-select-all">
                        <label for="check-all"></label>
                    </th>
                        <th scope="col">#</th>
                        <th scope="col">@lang('sh.form_date')</th>
                        <th scope="col">@lang('sh.to_date')</th>
                        <th scope="col">@lang('sh.type')</th>
                        <th scope="col">@lang('sh.price')</th>
                        <th scope="col">@lang('sh.status')</th>
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
                            <th>{{ $news->from_date }}</th>
                            <th>{{ $news->to_date }}</th>
                            <th>{{ $news->type }}</th>
                            <th>{{ $news->price }}</th>
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
                                <a href="{{ route('dashboard.shipping.edit' , $news->id) }}" class="btn-sm btn-info"
                                    style="margin:0 10px;">
                                    @lang('news.edit')

                                </a>

                                <a href="" class="btn-sm btn-danger"
                                data-toggle="modal" data-target="#delete{{ $news->id }}"
                                    style="background:red">
                                    @lang('news.delete_1')
                                </a>

                            </th>

                        </tr>
                            <div id="delete{{ $news->id }}" class="modal fade" role="dialog">
                        <div class="modal-dialog">

                            <div class="modal-content">
                            <div class="modal-header">
                                <button type="button"  data-dismiss="modal">&times;</button>
                                <h4 class="modal-title">{{ trans('sh.delete_0') }}</h4>
                            </div>
                            <div class="modal-body">

                                <form action="{{ route('dashboard.shipping.destroy' , 'test') }}" method="post">
                                    {{ method_field('Delete') }}
                                    @csrf
                                    {{ trans('sh.delete_10') }}
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
                    {{ trans('sh.delete_0') }}
                </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>

            <form action="{{ route('dashboard.shipping_d_all') }}" method="POST">
                {{ csrf_field() }}
                <div class="modal-body">
                    {{ trans('sh.delete_11') }}
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



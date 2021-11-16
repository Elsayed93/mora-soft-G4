@extends('Admin.layouts.master')

@section('title')
    @lang('product.products')
@endsection
{{-- css --}}
@section('css')
    <style>
        table {
            background-color: #141a47 !important;
            padding: 20px;
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
                    @lang('product.Product Sections')
                </h2>
            </div>
        </div>

        <div class="row mt-5">
            <div class="cole-md-6">
                <a href="{{ route('dashboard.products.create') }}" class="btn btn-primary">
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
                        <th scope="col">@lang('product.product title in arabic')</th>
                        <th scope="col">@lang('product.product title in english')</th>
                        <th scope="col">@lang('product.product image')</th>
                        <th scope="col">@lang('product.user')</th>
                        <th scope="col">@lang('product.actions')</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($products as $index => $product)

                        <tr>
                            <th scope="row">{{ $index + 1 }}</th>
                            <th>{{ $product->title_ar }}</th>
                            <th>{{ $product->title_en }}</th>
                            <th><img src="{{asset('assets/products/'.$product->image)}}" width="90px" height="90px"></th>
                       <th>{{$product->user->name}}</th>
                           
                            <th style="display: inline-flex;">
                                <a href="{{ route('dashboard.products.edit', $product->id) }}" class="btn btn-info"
                                    style="margin:4px 10px;">
                                    @lang('site.edit')
                                </a>

                                <form action="{{ route('dashboard.products.destroy', $product->id) }}" method="POST">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete this item?');">@lang('site.delete')</button>
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

@extends('Admin.layouts.master')

@section('title')
    @lang('sh.edit')
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



        <div class="row">
            <div class="col-md-6">
                <h2>
                    @lang('sh.edit')
                </h2>
            </div>
        </div>
<br>
        <div class="row">
            <div class="col-md-8">
                <form action="{{ route('dashboard.shipping.update', $news->id ) }}" method="POST">
                    @csrf
                    @method('PUT')

                        <div class="form-row">
                          <input type='hidden' name="id" value="{{ $news -> id }}">

                          <div class="col">{{ trans('sh.form_date2') }}
                            <input type="text"  name="form_ar" class="form-control"
                            value="{{ $news -> getTranslation('from_date' , 'ar') }}"
                            placeholder="{{ trans('sh.form_date2') }}">
                          </div>

                          <div class="col">{{ trans('sh.form_date1') }}
                            <input type="text" name="form_en" class="form-control"
                            value="{{ $news -> getTranslation('from_date' , 'en') }}"
                            placeholder="{{ trans('sh.form_date1') }}">
                          </div>

                        </div>

                            <div style="margin-top:6px"class="form-row">
                              <div class="col">{{ trans('sh.to_date2') }}
                                <input type="text" name="to_ar" class="form-control"
                              value="{{ $news -> getTranslation('to_date' , 'ar') }}"

                                placeholder="{{ trans('sh.to_date2') }}">
                              </div>

                              <div class="col">{{ trans('sh.to_date1') }}
                                <input type="text" name="to_en" class="form-control"
                                value="{{ $news -> getTranslation('to_date' , 'en') }}"
                                placeholder="{{ trans('sh.to_date1') }}">
                              </div>
                            </div>

                            <div style="margin-top:6px" class="form-row">
                              <div class="col">{{ trans('sh.type2') }}
                                <input type="text" name="type_ar" class="form-control"
                                value="{{ $news -> getTranslation('type' , 'ar') }}"
                                placeholder="{{ trans('sh.type2') }}">
                              </div>

                              <div class="col">{{ trans('sh.type1') }}
                                <input type="text" name="type_en" class="form-control"
                                value="{{ $news -> getTranslation('type' , 'en') }}"
                                placeholder="{{ trans('sh.type1') }}">
                              </div>

                            </div>

                            <div style="margin-top:6px" class="form-row">
                                <div class="col">{{ trans('sh.price2') }}
                                  <input type="text" name="price_ar" class="form-control"
                                  value="{{ $news -> getTranslation('price' , 'ar') }}"
                                   placeholder="{{ trans('sh.price2') }}">
                                </div>

                                <div class="col">{{ trans('sh.price1') }}
                                  <input type="text" name="price_en" class="form-control"
                                  value="{{ $news -> getTranslation('price' , 'en') }}"
                                  placeholder="{{ trans('sh.price1') }}">
                                </div>

                              </div>

                              <div style="margin-top:6px" class="form-row">
                                <div class="col">{{ trans('news.status') }}
                                    <select class="form-control" name="status" id="cars">
                                        <option>{{trans('news.staus_news')}}</option>
                                        <option  value="1">{{ trans('news.open') }}</option>
                                        <option  value="2">{{ trans('news.no_open') }}</option>
                                    </select>
                                     </div>

                                <div class="col">{{ trans('news.date1') }}
                                    <input class="form-control" type="date"
                                    value="{{ $news ->updated_at }}"
                                    id="news" name="news_date">
                                </div>
                              </div>

                    <button style="margin-top:80px;background:#28a745"
                    type="submit" class="btn-sm btn">@lang('site.save')</button>
                </form>
            </div>
        </div>

    </div>
@endsection

{{-- js --}}

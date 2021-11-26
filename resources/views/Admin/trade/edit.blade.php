@extends('Admin.layouts.master')

@section('title')
    @lang('tr.edit1')
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
                    @lang('tr.edit2')
                </h2>
            </div>
        </div>
<br>
        <div class="row">
            <div class="col-md-8">
                <form action="{{ route('dashboard.trade.update', $news->id ) }}" method="POST">
                    @csrf
                    @method('PUT')

                        <div class="form-row">
                          <input type='hidden' name="id" value="{{ $news -> id }}">

                          <div class="col">{{ trans('tr.name2') }}
                            <input type="text"  name="name_ar" class="form-control"
                            value="{{ $news -> getTranslation('name' , 'ar') }}"
                            placeholder="{{ trans('tr.name2') }}">
                          </div>

                          <div class="col">{{ trans('tr.name1') }}
                            <input type="text" name="name_en" class="form-control"
                            value="{{ $news -> getTranslation('name' , 'en') }}"
                            placeholder="{{ trans('tr.name1') }}">
                          </div>

                        </div>

                            <div style="margin-top:6px"class="form-row">
                              <div class="col">{{ trans('tr.email2') }}
                                <input type="email" name="email_ar" class="form-control"
                              value="{{ $news -> getTranslation('email' , 'ar') }}"

                                placeholder="{{ trans('tr.email2') }}">
                              </div>

                              <div class="col">{{ trans('tr.email1') }}
                                <input type="email" name="email_en" class="form-control"
                                value="{{ $news -> getTranslation('email' , 'en') }}"
                                placeholder="{{ trans('tr.email1') }}">
                              </div>
                            </div>

                            <div style="margin-top:6px" class="form-row">
                              <div class="col">{{ trans('tr.pass2') }}
                                <input type="text" name="pass_ar" class="form-control"
                                value=""
                                placeholder="{{ trans('tr.pass2') }}">
                              </div>

                              <div class="col">{{ trans('tr.pass1') }}
                                <input type="text" name="pass_en" class="form-control"
                                value=""
                                placeholder="{{ trans('tr.pass1') }}">
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

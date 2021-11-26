@extends('Admin.layouts.master')

@section('title')
    @lang('ve.li')
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
                    @lang('ve.le')
                </h2>
            </div>
        </div>

        <div style="margin-left: 0px" class="row mt-5">
            <div class="cole-md-6">

                <button type="button" style="background:yellowgreen"
                class="button x-small btn btn-success"
                data-toggle="modal"
                data-target="#exampleModal">
                <i class="icofont-ui-add"></i>
            </button>

            </div>
        </div>

        {{-- table --}}
        <div class="row mt-3">
            <table id="datatable" class="table-light">
                <thead>
                    <tr>

                        <th scope="col">#</th>
                        <th scope="col">@lang('ve.name1')</th>
                        <th scope="col">@lang('ve.note1')</th>
                        <th scope="col">@lang('news.create_at')</th>
                        <th scope="col">@lang('news.option')</th>

                    </tr>
                </thead>
                <tbody>

                    <?php $i = 0; ?>
                    @foreach ($news as $news)
                        <tr>
                            <?php $i++; ?>

                            <th>{{ $i }}</th>
                            <th>{{ $news->name }}</th>
                            <th>{{ $news->note }}</th>
                           <th>{{ $news->updated_at }}</th>

                            <th style="display: inline-flex;">

                                <button type="button" style="margin-right:10px"
                                class="button btn-lg btn-primary"
                                data-toggle="modal"
                                data-target="#edit{{ $news -> id }}">
                                <i class="icofont-ui-edit"></i>
                            </button>

                                <button type="button"
                                class="button  btn-lg btn-danger" style="margin-right:10px" data-toggle="modal"
                                data-target="#delete{{ $news->id }}">
                                <i class="icofont-ui-delete"></i>
                            </button>

                            </th>
                        </tr>

                 <!-- edit_modal section -->
                <div class="modal fade" id="edit{{ $news -> id }}" tabindex="-1" role="dialog"
                    aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 style="font-family: 'Cairo', sans-serif;" class="modal-title"
                                    id="exampleModalLabel">
                                    {{ trans('ve.edit') }}
                                </h5>
                               
                            </div>
                            <div class="modal-body">
                                <!-- add_form -->
                                <form action="{{ route('dashboard.sections.update','test') }}" method="post"
                                 enctype="multipart/form-data">
                                    {{ method_field('patch') }}
                                    @csrf
                                    <div class="row">
                                        <input id="id" type="hidden" name="id" class="form-control"
                                                value="{{ $news -> id }}">
                                           
                                    </div>
                                 <div class="row">
                                        <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('ve.name3') }}
                                                :</label>
                                            <input id="Name" type="text" name="name_ar"
                                                class="form-control"
                                                value="{{ $news -> getTranslation('name' , 'ar') }}"
                                                required>

                                                </div>

                                                  <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('ve.name2') }}
                                                :</label>
                                            <input id="Name" type="text" name="name_en"
                                                class="form-control"
                                                value="{{ $news -> getTranslation('name' , 'en') }}"
                                                required>


                                                </div>
                                            <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('ve.note3') }}
                                                :</label>
                                            <input id="Name" type="text" name="note_ar"
                                                class="form-control"
                                                value="{{ $news -> getTranslation('note' , 'ar') }}"
                                                required>


                                                </div>
                                                  <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('ve.note2') }}
                                                :</label>
                                            <input id="Name" type="text" name="note_en"
                                                class="form-control"
                                                value="{{ $news -> getTranslation('note' , 'en') }}"
                                                required>
                                                
                                                </div> 
                                               </div>
                                     
                                                     <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('news.date') }}
                                                :</label>
                                            <input id="Name" type="text" name="news_date"
                                                class="form-control"
                                                value="{{ $news ->created_at }}"
                                                required>

                                                </div>
                                        </div>



                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary"
                                            data-dismiss="modal">{{ trans('news.No') }}</button>
                                        <button type="submit"
                                            class="btn btn-success">{{ trans('news.Yes') }}</button>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>
                </div>

     <div id="delete{{ $news->id }}" class="modal fade" role="dialog">
                        <div class="modal-dialog">

                            <div class="modal-content">
                            <div class="modal-header">
                                <button type="button"  data-dismiss="modal">&times;</button>
                                <h4 class="modal-title">{{ trans('ve.delete') }}</h4>
                            </div>
                            <div class="modal-body">

                                <form action="{{ route('dashboard.sections.destroy' , 'test') }}" method="post">
                                    {{ method_field('Delete') }}
                                    @csrf
                                    {{ trans('ve.delete_0') }}
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
                                                        </div>

                                        <!-- Add sections -->


                             <div id="delete{{ $news->id }}" class="modal fade" role="dialog">
                        <div class="modal-dialog">

                            <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                                <h4 class="modal-title">{{ trans('news.delete_0') }}</h4>
                            </div>
                            <div class="modal-body">

                                <form action="{{ route('dashboard.news.destroy' , 'test') }}" method="post">
                                    {{ method_field('Delete') }}
                                    @csrf
                                    {{ trans('news.delete') }}
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

            <!-- Add sections -->
            <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Modal title</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
 <form class=" row mb-30" action"{{ route('dashboard.sections.store') }}" method="POST">
                            @csrf

                    <div style="margin-top:6px"class="form-row">
                        <div class="col">{{ trans('ve.name3') }}
                          <input type="text" name="name_ar" class="form-control"
                          placeholder="{{ trans('ve.name3') }}">
                        </div>

                        <div class="col">{{ trans('ve.name2') }}
                          <input type="text" name="name_en" class="form-control"
                          placeholder="{{ trans('ve.name2') }}">
                        </div>
                      </div>

                      <div style="margin-top:6px"class="form-row">
                        <div class="col">{{ trans('ve.note3') }}
                          <input type="text" name="note_ar" class="form-control"
                          placeholder="{{ trans('ve.note3') }}">
                        </div>

                        <div class="col">{{ trans('ve.note2') }}
                          <input type="text" name="note_en" class="form-control"
                          placeholder="{{ trans('ve.note2') }}">
                        </div>
                      </div>

                      <div class="col">{{ trans('news.date1') }}
                                    <input class="form-control" type="date" id="news" name="news_date">
                                </div>
                    </div>
                                      
                  <div class="modal-footer">
              <button type="submit" class="btn btn-primary">{{ trans('news.Yes') }}</button>

             <button type="button" class="btn btn-secondary" data-dismiss="modal">{{ trans('news.No') }}</button>                  </div>
                </div>
                 </form>
              </div>
            </div>

@endsection

@section('js')

@toastr_js
@toastr_render



@endsection



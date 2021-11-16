
<title>{{trans('news.news_1')}}</title>


    @toastr_css


@include('Admin.layouts.head')

@section('css')
    @toastr_css

@endsection
@section('page-header')
<!-- breadcrumb -->
@section('PageTitle')
@stop
<!-- breadcrumb -->
@endsection
@include('Admin.layouts.Header')

@include('Admin.layouts.Sidebar')

@section('content')
    <div class="wrapper">
        <div class="main-wrapper">
            <div class="main-content">
                <div class="container-fluid">
<div class="row">
<div style="width:870px" class="col-12">
    <div class="card mb-30">
        <div   class="card-body pt-30">
            <h4 class="font-20 ">{{trans('news.newes')}}</h4>
        </div>


<button type="button"   class="button x-small btn btn-success" data-toggle="modal"
                                           data-target="#exampleModal">
    {{ trans('news.add_news') }}
</button>



        <div class="table-responsive">
            <!-- Invoice List Table -->
            <table id="datatable"  class="text-nowrap card_color-bg dh-table">


                <thead>
                 <tr>
                        <th>{{trans('news.row')}}</th>
                        <th>{{trans('news.name')}}</th>

                        <th>{{trans('news.agree')}}</th>
                        <th>{{trans('news.Airtrans')}}</th>
                        <th>{{trans('news.active')}}</th>
                        <th>{{trans('news.create_at')}}</th>
                        <th>{{trans('news.option')}}</th>



                    </tr>
                </thead>
                <tbody>

            <?php $i = 0; ?>
            @foreach ($news as $news)
                <tr>
                    <?php $i++; ?>
                        <td>{{ $i }}</td>
                        <td>{{ $news->name }}</td>
                        <td>{{ $news->agreements }}</td>
                        <td>{{ $news->Air_transport_quantity }}</td>


                        <td>
                            @if ($news->value_active == 1)
                                <span  class="text-success">{{ $news->active }}</span>
                                @elseif ($news->active == 0)
                                <span  class="text-danger">{{ $news->active }}</span>
                              

                            @else
                                <span class="text-">{{ $news->active }}</span>
                            @endif

                        </td>




                        <td>{{ $news->created_at }}</td>
                        <td>
                            <button type="button" class="btn btn-info btn-sm" data-toggle="modal"
                                data-target="#edit{{ $news->id }}"
                                title="{{ trans('news.Edit') }}">
                                <i class="fa fa-edit"></i>{{ trans('news.Edit') }}</button>

                            <button type="button" style="background: red"
                            class="btn btn-danger btn-sm" data-toggle="modal"
                                data-target="#delete{{ $news->id }}"
                                title="{{ trans('news.Delete') }}"><i
                                    class="fa fa-trash">
                                </i>{{ trans('news.Delete') }}</button>
                        </td>

                    </tr>
                </tbody>

                 <!-- edit_modal_news -->
                <div class="modal fade" id="edit{{ $news -> id }}" tabindex="-1" role="dialog"
                    aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 style="font-family: 'Cairo', sans-serif;" class="modal-title"
                                    id="exampleModalLabel">
                                    {{ trans('news.edit_news') }}
                                </h5>
                                <button type="button" class="close" data-dismiss="modal"
                                    aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <!-- add_form -->
                                <form action="{{ route('dashboard.news_air.update','test') }}" method="post">
                                    {{ method_field('patch') }}
                                    @csrf
                                    <div class="row">
                                        <div class="col">
                                        <input id="id" type="hidden" name="id" class="form-control"
                                                value="{{ $news -> id }}">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('newss.stage_name_ar') }}
                                                :</label>
                                            <input id="Name" type="text" name="name"
                                                class="form-control"
                                                value="{{ $news -> getTranslation('name' , 'ar') }}"
                                                required>

                                        </div>

                                    </div>

                                     <div class="row">
                                        <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('newss.stage_name_en') }}
                                                :</label>
                                            <input id="Name" type="text" name="name_en"
                                                class="form-control"
                                                value="{{ $news -> getTranslation('name' , 'en') }}"
                                                required>

                                </div>

                                    </div>

                                 <div class="row">
                                        <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('newss.stage_name_ar') }}
                                                :</label>
                                            <input id="Name" type="text" name="agree"
                                                class="form-control"
                                                value="{{ $news -> getTranslation('agreements' , 'ar') }}"
                                                required>


                                                </div>


                                                  <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('newss.stage_name_en') }}
                                                :</label>
                                            <input id="Name" type="text" name="agree_en"
                                                class="form-control"
                                                value="{{ $news -> getTranslation('agreements' , 'en') }}"
                                                required>


                                                </div>
                                            <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('newss.stage_name_ar') }}
                                                :</label>
                                            <input id="Name" type="text" name="air"
                                                class="form-control"
                                                value="{{ $news -> getTranslation('Air_transport_quantity' , 'ar') }}"
                                                required>


                                                </div>
                                                  <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('newss.stage_name_en') }}
                                                :</label>
                                            <input id="Name" type="text" name="air_en"
                                                class="form-control"
                                                value="{{ $news -> getTranslation('Air_transport_quantity' , 'en') }}"
                                                required>


                                                </div>

                                               </div>
                                    <div class="form-group">
                                        <label
                                            for="exampleFormControlTextarea1">{{ trans('My_Classes_trans.Name_Grade') }}
                                            :</label>
                                        <select name="status" class="form-control SlectBox"
                                 onclick="console.log($(this).val())"
                                    onchange="console.log('change is firing')">
                                    <option selected="true" disabled="disabled">-- حدد حالة الدفع --</option>
                                    <option value="مدفوعة">مدفوعة</option>
                                    <option value="غير مدفوعه">غير مدفوع </option>

                                </select>

                                    </div>

                                                     <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('newss.stage_name_ar') }}
                                                :</label>
                                            <input id="Name" type="text" name="news_date"
                                                class="form-control"
                                                value="{{ $news ->created_at }}"
                                                required>


                                                </div>
                                        </div>



                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary"
                                            data-dismiss="modal">{{ trans('newss.No') }}</button>
                                        <button type="submit"
                                            class="btn btn-success">{{ trans('newss.Yes') }}</button>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>
                </div>


    <!-- Modal Delete-->


 <div id="delete{{ $news->id }}" class="modal fade" role="dialog">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">{{ trans('news.delete_0') }}</h4>
      </div>
       <div class="modal-body">
                                <form action="{{ route('dashboard.news_air.destroy' , 'test') }}" method="post">
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
            </table>

            <!-- Add news Table -->


            <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLabel">{{ trans('news.title_2') }}</h5>
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                        <form class=" row mb-30" action"{{ route('dashboard.news.store') }}" method="POST">
                            @csrf

                            <div class="card-body">
                                <div class="repeater">
    <div >
        <div data-repeater-item>

            <div class="row">





                <div class="col-7">
                    <label for="Name"
                        class="mr-sm-2">{{ trans('news.name') }}
                        :</label>
                    <input class="form-control" type="text" name="name">

                </div>

<div class="col-7">
                    <label for="Name"
                        class="mr-sm-2">{{ trans('news.name_en') }}
                        :</label>
                    <input class="form-control" type="text" name="name_en">

                </div>

                 <div class="col-7">
                    <label for="Name"
                        class="mr-sm-2">{{ trans('news.agree_en') }}
                        :</label>
                    <input class="form-control" type="text" name="agree_en">

                </div>


                <div class="col-9">
                    <label for="Name"
                        class="mr-sm-2">{{ trans('news.agree') }}
                        :</label>
                        <textarea class="form-control"
                        id="w3review" name="agree" rows="4" cols="50"></textarea>

                </div>



                 <div class="col-9">
                    <label for="Name"
                        class="mr-sm-2">{{ trans('news.air') }}
                        :</label>
                        <textarea class="form-control"
                        id="w3review" name="air" rows="4" cols="50"></textarea>

                </div>

                 <div class="col-9">
                    <label for="Name"
                        class="mr-sm-2">{{ trans('news.air_en') }}
                        :</label>
                        <textarea class="form-control"
                        id="w3review" name="air_en" rows="4" cols="50"></textarea>

                </div>

                <div class="col">
                    <label for="Name"
                        class="mr-sm-2">{{ trans('news.status') }}
                        </label>


                        <select class="form-control" name="status" id="cars">
                            <option>اختر</option>
                             <option  value="مدفوعة">مدفوعة</option>
                                    <option value="غير مدفوعه">غير مدفوع </option>
                        </select>
                    </div>
                <div class="col-4">

                    <label for="Name"
                        class="mr-sm-2">{{ trans('news.date') }}
                        :</label>
                        <input class="form-control" type="date" id="news" name="news_date">
                    </div>


                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                                           </div>

                    <div class="modal-footer">
              <button type="submit" class="btn btn-primary">{{ trans('news.Yes') }}</button>

             <button type="button" class="btn btn-secondary" data-dismiss="modal">{{ trans('news.No') }}</button>
                    </div>
             </form>

                  </div>
                </div>
              </div>


        </div>
    </div>
</div>

<div class="col-12">

</div>

<div class="col-12">

</div>

<div class="col-lg-6">

</div>

<div class="col-lg-6">

</div>

<div class="col-12">

</div>

<div class="col-12">

</div>
                    </div>
                </div>
            </div>
    </div>
 </div>
 </div>

@section('js')

@toastr_js
@toastr_render
@endsection

 @include('Admin.layouts.footer')

 @include('Admin.layouts.footerjs')



<title>{{trans('news.news')}}</title>
    @toastr_css


@include('Admin.layouts.head')
@section('css')


@section('title')
empty
@stop
@endsection
@section('page-header')
<!-- breadcrumb -->
@section('PageTitle')
empty
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
                        <th>{{trans('news.img')}}</th>
                        <th>{{trans('news.title')}}</th>
                        <th>{{trans('news.Describe')}}</th>
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
                        <td><img style="width:50px;hieght:50px" src="{{asset($news->photo)}}"></td>
                        <td>{{ $news->title }}</td>
                        <td>{{ $news->description }}</td>

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
                                <form action="{{ route('dashboard.news.update','test') }}" method="post">
                                    {{ method_field('patch') }}
                                    @csrf
                                    <div class="row">
                                        <div class="col">
                                        <input id="id" type="hidden" name="id" class="form-control"
                                                value="{{ $news -> id }}">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('newss.stage_name_ar') }}
                                                :</label>
                                            <input id="Name" type="file" name="name"
                                                class="form-control"
                                                value="{{ $news -> image }}"
                                                required>

                                        </div>

                                    </div>

                                    

                                 <div class="row">
                                        <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('newss.stage_name_ar') }}
                                                :</label>
                                            <input id="Name" type="text" name="title"
                                                class="form-control"
                                                value="{{ $news -> getTranslation('title' , 'ar') }}"
                                                required>


                                                </div>


                                                  <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('newss.stage_name_en') }}
                                                :</label>
                                            <input id="Name" type="text" name="title_en"
                                                class="form-control"
                                                value="{{ $news -> getTranslation('title' , 'en') }}"
                                                required>


                                                </div>
                                            <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('newss.desc') }}
                                                :</label>
                                            <input id="Name" type="text" name="desc"
                                                class="form-control"
                                                value="{{ $news -> getTranslation('description' , 'ar') }}"
                                                required>


                                                </div>
                                                  <div class="col">
                                            <label for="Name"
                                                class="mr-sm-2">{{ trans('newss.desc_en') }}
                                                :</label>
                                            <input id="Name" type="text" name="desc_en"
                                                class="form-control"
                                                value="{{ $news -> getTranslation('description' , 'en') }}"
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
                                            data-dismiss="modal">{{ trans('newss.No') }}</button>
                                        <button type="submit"
                                            class="btn btn-success">{{ trans('newss.Yes') }}</button>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>
                </div>





                <div id="delete{{ $news->id }}" class="modal fade" role="dialog">
  <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">{{ trans('news.delete_0') }}</h4>
      </div>
       <div class="modal-body">
                                <form action="{{ route('dashboard.news.destroy' , 'test') }}" method="post"
                                 >
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
                        <form class=" row mb-30" action"{{ route('dashboard.news.store') }}" method="POST" enctype="multipart/form-data">
                            @csrf

                            <div class="card-body">
                                <div class="repeater">
    <div >
        <div data-repeater-item>

            <div class="row">


                <div class="col-5">

                    <label for="Name"
                        class="mr-sm-2">{{ trans('news.photo') }}
                        :</label>
                        <input class="form-control" type="file" name="image"
                        class="form-control" accept="images/" multiple>
                    </div>



                <div class="col-7">
                    <label for="Name"
                        class="mr-sm-2">{{ trans('news.title') }}
                        :</label>
                    <input class="form-control" type="text" name="title">

                </div>
                 <div class="col-7">
                    <label for="Name"
                        class="mr-sm-2">{{ trans('news.title_en') }}
                        :</label>
                    <input class="form-control" type="text" name="title_en">

                </div>


                <div class="col-9">
                    <label for="Name"
                        class="mr-sm-2">{{ trans('news.desc') }}
                        :</label>
                        <textarea class="form-control"
                        id="w3review" name="desc" rows="4" cols="50"></textarea>

                </div>

                <div class="col-9">
                    <label for="Name"
                        class="mr-sm-2">{{ trans('news.desc_en') }}
                        :</label>
                        <textarea class="form-control"
                        id="w3review" name="desc_en" rows="4" cols="50"></textarea>

                </div>

                <div class="col">
                    <label for="Name"
                        class="mr-sm-2">{{ trans('news.status') }}
                        </label>


                        <select class="form-control" name="status" id="cars">
                            <option>اختر</option>
                            <option value="مغعل">{{ trans('news.open') }}</option>
                            <option value="غير مفعل">{{ trans('news.no_open') }}</option>
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



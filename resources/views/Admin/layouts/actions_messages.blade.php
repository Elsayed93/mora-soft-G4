@if (session()->has('success'))
    <div class="row">
        <div class="alert alert-success">
            {{ session()->get('success') }}
        </div>
    </div>
@elseif(session()->has('error'))
    <div class="row">
        <div class="alert alert-danger">
            {{ session()->get('error') }}
        </div>
    </div>
@endif

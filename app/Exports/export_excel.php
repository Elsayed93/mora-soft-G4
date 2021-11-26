<?php

namespace App\Exports;
use App\Models\shipping_dates;

use Maatwebsite\Excel\Concerns\FromCollection;

class export_excel implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return shipping_dates::all();

              
    

    }


}

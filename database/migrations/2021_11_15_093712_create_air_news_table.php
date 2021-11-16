<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAirNewsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('air_news', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('agreements');
            $table->text('Air_transport_quantity');
            $table->string('active');
            $table->integer('value_active');

                $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('air_news');
    }
}

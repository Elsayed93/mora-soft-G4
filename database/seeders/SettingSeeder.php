<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $settings = [
            [
                'web_name_ar' => 'مورا للشحن',
                'web_name_en' => 'Mora for Shipping',
                'email' => 'mora@example.com',
                'facebook_link' => 'https://www.facebook.com/',
                'twitter_link' => 'https://twitter.com/',
                'linkedin_link' => 'https://www.linkedin.com/feed/',
            ]
        ];

        DB::table('settings')->insert($settings);
    }
}

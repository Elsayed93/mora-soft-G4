<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NavbarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $navSections = [
            [
                'nav_section_name_ar' => 'الرئيسية',
                'nav_section_name_en' => 'Home',
                'nav_section_link' => 'them',
            ],
            [
                'nav_section_name_ar' => 'عنا',
                'nav_section_name_en' => 'About us',
                'nav_section_link' => 'them/about-us',
            ],
            [
                'nav_section_name_ar' => 'تواصل معنا',
                'nav_section_name_en' => 'Contact us',
                'nav_section_link' => 'them/contact-us',
            ],
        ];

        DB::table('navbars')->insert($navSections);
    }
}

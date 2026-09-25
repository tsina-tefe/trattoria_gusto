<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SmsTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Order Paid',
                'variables' => ['{first_name}', '{last_name}', '{client_name}', '{order_method}', '{order_number}', '{products}', '{collection_day}', '{collection_branch}', '{discount_type}'],
                'content' => "ውድ ደንበኛችን {first_name} {last_name}\n\n" .
                             "ከካልዲስ ኮፊ በቅድመ ትዕዛዝ {order_method} የበዓል ቶርታ ተረጋግጧል።\n\n" .
                             "* የትዕዛዝ መለያ፥ {order_number}\n" .
                             "* ያዘዙት ቶርታ፥ {products}\n" .
                             "* መውሰጃ ቀን፥ {collection_day}\n" .
                             "* መውሰጃ ቅርንጫፍ፥ {collection_branch}\n" .
                             "* ቅናሽ አይነት፥ {discount_type}\n\n" .
                             "መልካም ገና"
            ],
            [
                'name' => 'Order Cancelled',
                'variables' => ['{order_method}'],
                'content' => "ውድ ደንበኛችን\n\n" .
                             "በቅርቡ ከካልዲስ ኮፊ {order_method} ቅድመ ትዕዛዝ፡ ክፍያውን ባለማጠናቀቅዎ ተሰርዟል"
            ],
            [
                'name' => 'Payment Reminder',
                'variables' => [],
                'content' => "ውድ ደንበኛችን\n\n" .
                             "በቅርቡ ከካልዲስ ኮፊ በስልክ ደውለው ላዘዙት ቅድመ ትዕዛዝ ክፍያውን እስከ ምሽቱ 11:00 ድረስ ካላጠናቀቁ ትዕዛዙ ስለሚሰረዝ በቀረዎት ግዜ እባክዎን ክፍያውን ይጨርሱ።\n\n" .
                             "እናመሰግናለን"
            ],
            [
                'name' => 'Telegram Message',
                'variables' => ['{first_name}', '{last_name}', '{client_name}', '{discount_type}', '{products}', '{total_amount}', '{collection_branch}', '{branch_location}', '{collection_day}'],
                'content' => "ውድ ደምበኛችን {first_name} {last_name}\n\n" .
                             "እንኳን ለዒድ አልፊጥር በሰላም አደረስዎ!\n\n" .
                             "ከካልዲስ ኮፊ የበዓል ቶርታ ስላዘዙ በጣም እናመሰግናለን። ክፍያዎት ደርስዎናል። የትዕዛዝዎ ዝርዝር መረጃ ከስር ያለውን ይመስላል፡\n\n" .
                             "የተጠቀሙት የቅናሽ አይነት፡ {discount_type}\n\n" .
                             "ያዘዙት ቶርታ፡ {products}\n\n" .
                             "ጠቅላላ ዋጋ፡ {total_amount} ETB\n\n" .
                             "ቶርታውን የሚወስዱበት ቅርንጫፍ፡ {collection_branch}\n" .
                             "{branch_location}" .
                             "ቶርታውን የሚወስዱበት ቀን፡ {collection_day}\n\n" .
                             "ካልዲስን ስለመረጡ እናመሰግናለን።\n\n" .
                             "መልካም ዒድ"
            ],
        ];

        foreach ($templates as $template) {
            \App\Models\SmsTemplate::updateOrCreate(
                ['name' => $template['name']],
                [
                    'content' => $template['content'],
                    'variables' => $template['variables']
                ]
            );
        }
    }
}

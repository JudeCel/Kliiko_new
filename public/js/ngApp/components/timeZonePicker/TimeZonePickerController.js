(function () {
  'use strict';

  angular.module('KliikoApp').controller('TimeZonePickerController', TimeZonePickerController);
  angular.module('KliikoApp.Root').controller('TimeZonePickerController', TimeZonePickerController);

  TimeZonePickerController.$inject = ['dbg', '$scope', '$q'];
  function TimeZonePickerController(dbg, $scope, $q) {
    dbg.log2('#TimeZonePickerController started');

    var vm = this;
    vm.init = init;
    vm.isSelected = isSelected;
    vm.optionValue = optionValue;

    function init(object) {
      vm.timeZoneList = timeZoneListFull;
      object.timeZone = object.timeZone || jstz.determine().name();
    }

    function isSelected(array, zone) {
      return array.indexOf(zone) > -1;
    }

    function optionValue(array, zone) {
      var index = array.indexOf(zone);
      return array[index > -1 ? index : 0];
    }

    var timeZoneListFull = [
      {
        "text": "(UTC-12:00) International Date Line West",
        "utc": [
          "Etc/GMT+12"
        ]
      },
      {
        "text": "(UTC-11:00) Coordinated Universal Time-11",
        "utc": [
          "Etc/GMT+11",
          "Pacific/Midway",
          "Pacific/Niue",
          "Pacific/Pago_Pago"
        ]
      },
      {
        "text": "(UTC-10:00) Hawaii",
        "utc": [
          "Etc/GMT+10",
          "Pacific/Honolulu",
          "Pacific/Johnston",
          "Pacific/Rarotonga",
          "Pacific/Tahiti"
        ]
      },
      {
        "text": "(UTC-09:00) Alaska",
        "utc": [
          "America/Anchorage",
          "America/Juneau",
          "America/Nome",
          "America/Sitka",
          "America/Yakutat"
        ]
      },
      {
        "text": "(UTC-08:00) Baja California",
        "utc": [
          "America/Santa_Isabel"
        ]
      },
      {
        "text": "(UTC-08:00) Pacific Time (US & Canada)",
        "utc": [
          "America/Dawson",
          "America/Los_Angeles",
          "America/Tijuana",
          "America/Vancouver",
          "America/Whitehorse",
          "PST8PDT"
        ]
      },
      {
        "text": "(UTC-07:00) Arizona",
        "utc": [
          "America/Creston",
          "America/Dawson_Creek",
          "America/Hermosillo",
          "America/Phoenix",
          "Etc/GMT+7"
        ]
      },
      {
        "text": "(UTC-07:00) Chihuahua, La Paz, Mazatlan",
        "utc": [
          "America/Chihuahua",
          "America/Mazatlan"
        ]
      },
      {
        "text": "(UTC-07:00) Mountain Time (US & Canada)",
        "utc": [
          "America/Boise",
          "America/Cambridge_Bay",
          "America/Denver",
          "America/Edmonton",
          "America/Inuvik",
          "America/Ojinaga",
          "America/Yellowknife",
          "MST7MDT"
        ]
      },
      {
        "text": "(UTC-06:00) Central America",
        "utc": [
          "America/Belize",
          "America/Costa_Rica",
          "America/El_Salvador",
          "America/Guatemala",
          "America/Managua",
          "America/Tegucigalpa",
          "Etc/GMT+6",
          "Pacific/Galapagos"
        ]
      },
      {
        "text": "(UTC-06:00) Central Time (US & Canada)",
        "utc": [
          "America/Chicago",
          "America/Indiana/Knox",
          "America/Indiana/Tell_City",
          "America/Matamoros",
          "America/Menominee",
          "America/North_Dakota/Beulah",
          "America/North_Dakota/Center",
          "America/North_Dakota/New_Salem",
          "America/Rainy_River",
          "America/Rankin_Inlet",
          "America/Resolute",
          "America/Winnipeg",
          "CST6CDT"
        ]
      },
      {
        "text": "(UTC-06:00) Guadalajara, Mexico City, Monterrey",
        "utc": [
          "America/Bahia_Banderas",
          "America/Cancun",
          "America/Merida",
          "America/Mexico_City",
          "America/Monterrey"
        ]
      },
      {
        "text": "(UTC-06:00) Saskatchewan",
        "utc": [
          "America/Regina",
          "America/Swift_Current"
        ]
      },
      {
        "text": "(UTC-05:00) Bogota, Lima, Quito",
        "utc": [
          "America/Bogota",
          "America/Cayman",
          "America/Coral_Harbour",
          "America/Eirunepe",
          "America/Guayaquil",
          "America/Jamaica",
          "America/Lima",
          "America/Panama",
          "America/Rio_Branco",
          "Etc/GMT+5"
        ]
      },
      {
        "text": "(UTC-05:00) Eastern Time (US & Canada)",
        "utc": [
          "America/Detroit",
          "America/Havana",
          "America/Indiana/Petersburg",
          "America/Indiana/Vincennes",
          "America/Indiana/Winamac",
          "America/Iqaluit",
          "America/Kentucky/Monticello",
          "America/Louisville",
          "America/Montreal",
          "America/Nassau",
          "America/New_York",
          "America/Nipigon",
          "America/Pangnirtung",
          "America/Port-au-Prince",
          "America/Thunder_Bay",
          "America/Toronto",
          "EST5EDT"
        ]
      },
      {
        "text": "(UTC-05:00) Indiana (East)",
        "utc": [
          "America/Indiana/Marengo",
          "America/Indiana/Vevay",
          "America/Indianapolis"
        ]
      },
      {
        "text": "(UTC-04:30) Caracas",
        "utc": [
          "America/Caracas"
        ]
      },
      {
        "text": "(UTC-04:00) Asuncion",
        "utc": [
          "America/Asuncion"
        ]
      },
      {
        "text": "(UTC-04:00) Atlantic Time (Canada)",
        "utc": [
          "America/Glace_Bay",
          "America/Goose_Bay",
          "America/Halifax",
          "America/Moncton",
          "America/Thule",
          "Atlantic/Bermuda"
        ]
      },
      {
        "text": "(UTC-04:00) Cuiaba",
        "utc": [
          "America/Campo_Grande",
          "America/Cuiaba"
        ]
      },
      {
        "text": "(UTC-04:00) Georgetown, La Paz, Manaus, San Juan",
        "utc": [
          "America/Anguilla",
          "America/Antigua",
          "America/Aruba",
          "America/Barbados",
          "America/Blanc-Sablon",
          "America/Boa_Vista",
          "America/Curacao",
          "America/Dominica",
          "America/Grand_Turk",
          "America/Grenada",
          "America/Guadeloupe",
          "America/Guyana",
          "America/Kralendijk",
          "America/La_Paz",
          "America/Lower_Princes",
          "America/Manaus",
          "America/Marigot",
          "America/Martinique",
          "America/Montserrat",
          "America/Port_of_Spain",
          "America/Porto_Velho",
          "America/Puerto_Rico",
          "America/Santo_Domingo",
          "America/St_Barthelemy",
          "America/St_Kitts",
          "America/St_Lucia",
          "America/St_Thomas",
          "America/St_Vincent",
          "America/Tortola",
          "Etc/GMT+4"
        ]
      },
      {
        "text": "(UTC-04:00) Santiago",
        "utc": [
          "America/Santiago",
          "Antarctica/Palmer"
        ]
      },
      {
        "text": "(UTC-03:30) Newfoundland",
        "utc": [
          "America/St_Johns"
        ]
      },
      {
        "text": "(UTC-03:00) Brasilia",
        "utc": [
          "America/Sao_Paulo"
        ]
      },
      {
        "text": "(UTC-03:00) Buenos Aires",
        "utc": [
          "America/Argentina/La_Rioja",
          "America/Argentina/Rio_Gallegos",
          "America/Argentina/Salta",
          "America/Argentina/San_Juan",
          "America/Argentina/San_Luis",
          "America/Argentina/Tucuman",
          "America/Argentina/Ushuaia",
          "America/Buenos_Aires",
          "America/Catamarca",
          "America/Cordoba",
          "America/Jujuy",
          "America/Mendoza"
        ]
      },
      {
        "text": "(UTC-03:00) Cayenne, Fortaleza",
        "utc": [
          "America/Araguaina",
          "America/Belem",
          "America/Cayenne",
          "America/Fortaleza",
          "America/Maceio",
          "America/Paramaribo",
          "America/Recife",
          "America/Santarem",
          "Antarctica/Rothera",
          "Atlantic/Stanley",
          "Etc/GMT+3"
        ]
      },
      {
        "text": "(UTC-03:00) Greenland",
        "utc": [
          "America/Godthab"
        ]
      },
      {
        "text": "(UTC-03:00) Montevideo",
        "utc": [
          "America/Montevideo"
        ]
      },
      {
        "text": "(UTC-03:00) Salvador",
        "utc": [
          "America/Bahia"
        ]
      },
      {
        "text": "(UTC-02:00) Coordinated Universal Time-02",
        "utc": [
          "America/Noronha",
          "Atlantic/South_Georgia",
          "Etc/GMT+2"
        ]
      },
      {
        "text": "(UTC-01:00) Azores",
        "utc": [
          "America/Scoresbysund",
          "Atlantic/Azores"
        ]
      },
      {
        "text": "(UTC-01:00) Cape Verde Is.",
        "utc": [
          "Atlantic/Cape_Verde",
          "Etc/GMT+1"
        ]
      },
      {
        "text": "(UTC) Casablanca",
        "utc": [
          "Africa/Casablanca",
          "Africa/El_Aaiun"
        ]
      },
      {
        "text": "(UTC) Coordinated Universal Time",
        "utc": [
          "America/Danmarkshavn",
          "Etc/GMT"
        ]
      },
      {
        "text": "(UTC) Dublin, Edinburgh, Lisbon, London",
        "utc": [
          "Atlantic/Canary",
          "Atlantic/Faeroe",
          "Atlantic/Madeira",
          "Europe/Dublin",
          "Europe/Guernsey",
          "Europe/Isle_of_Man",
          "Europe/Jersey",
          "Europe/Lisbon",
          "Europe/London"
        ]
      },
      {
        "text": "(UTC) Monrovia, Reykjavik",
        "utc": [
          "Africa/Abidjan",
          "Africa/Accra",
          "Africa/Bamako",
          "Africa/Banjul",
          "Africa/Bissau",
          "Africa/Conakry",
          "Africa/Dakar",
          "Africa/Freetown",
          "Africa/Lome",
          "Africa/Monrovia",
          "Africa/Nouakchott",
          "Africa/Ouagadougou",
          "Africa/Sao_Tome",
          "Atlantic/Reykjavik",
          "Atlantic/St_Helena"
        ]
      },
      {
        "text": "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
        "utc": [
          "Arctic/Longyearbyen",
          "Europe/Amsterdam",
          "Europe/Andorra",
          "Europe/Berlin",
          "Europe/Busingen",
          "Europe/Gibraltar",
          "Europe/Luxembourg",
          "Europe/Malta",
          "Europe/Monaco",
          "Europe/Oslo",
          "Europe/Rome",
          "Europe/San_Marino",
          "Europe/Stockholm",
          "Europe/Vaduz",
          "Europe/Vatican",
          "Europe/Vienna",
          "Europe/Zurich"
        ]
      },
      {
        "text": "(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",
        "utc": [
          "Europe/Belgrade",
          "Europe/Bratislava",
          "Europe/Budapest",
          "Europe/Ljubljana",
          "Europe/Podgorica",
          "Europe/Prague",
          "Europe/Tirane"
        ]
      },
      {
        "text": "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris",
        "utc": [
          "Africa/Ceuta",
          "Europe/Brussels",
          "Europe/Copenhagen",
          "Europe/Madrid",
          "Europe/Paris"
        ]
      },
      {
        "text": "(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb",
        "utc": [
          "Europe/Sarajevo",
          "Europe/Skopje",
          "Europe/Warsaw",
          "Europe/Zagreb"
        ]
      },
      {
        "text": "(UTC+01:00) West Central Africa",
        "utc": [
          "Africa/Algiers",
          "Africa/Bangui",
          "Africa/Brazzaville",
          "Africa/Douala",
          "Africa/Kinshasa",
          "Africa/Lagos",
          "Africa/Libreville",
          "Africa/Luanda",
          "Africa/Malabo",
          "Africa/Ndjamena",
          "Africa/Niamey",
          "Africa/Porto-Novo",
          "Africa/Tunis",
          "Etc/GMT-1"
        ]
      },
      {
        "text": "(UTC+01:00) Windhoek",
        "utc": [
          "Africa/Windhoek"
        ]
      },
      {
        "text": "(UTC+02:00) Athens, Bucharest",
        "utc": [
          "Asia/Nicosia",
          "Europe/Athens",
          "Europe/Bucharest",
          "Europe/Chisinau"
        ]
      },
      {
        "text": "(UTC+02:00) Beirut",
        "utc": [
          "Asia/Beirut"
        ]
      },
      {
        "text": "(UTC+02:00) Cairo",
        "utc": [
          "Africa/Cairo"
        ]
      },
      {
        "text": "(UTC+02:00) Damascus",
        "utc": [
          "Asia/Damascus"
        ]
      },
      {
        "text": "(UTC+02:00) Harare, Pretoria",
        "utc": [
          "Africa/Blantyre",
          "Africa/Bujumbura",
          "Africa/Gaborone",
          "Africa/Harare",
          "Africa/Johannesburg",
          "Africa/Kigali",
          "Africa/Lubumbashi",
          "Africa/Lusaka",
          "Africa/Maputo",
          "Africa/Maseru",
          "Africa/Mbabane",
          "Etc/GMT-2"
        ]
      },
      {
        "text": "(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius",
        "utc": [
          "Europe/Helsinki",
          "Europe/Kiev",
          "Europe/Mariehamn",
          "Europe/Riga",
          "Europe/Sofia",
          "Europe/Tallinn",
          "Europe/Uzhgorod",
          "Europe/Vilnius",
          "Europe/Zaporozhye"
        ]
      },
      {
        "text": "(UTC+02:00) Istanbul",
        "utc": [
          "Europe/Istanbul"
        ]
      },
      {
        "text": "(UTC+02:00) Jerusalem",
        "utc": [
          "Asia/Jerusalem"
        ]
      },
      {
        "text": "(UTC+02:00) Tripoli",
        "utc": [
          "Africa/Tripoli"
        ]
      },
      {
        "text": "(UTC+03:00) Amman",
        "utc": [
          "Asia/Amman"
        ]
      },
      {
        "text": "(UTC+03:00) Baghdad",
        "utc": [
          "Asia/Baghdad"
        ]
      },
      {
        "text": "(UTC+03:00) Kaliningrad, Minsk",
        "utc": [
          "Europe/Kaliningrad",
          "Europe/Minsk"
        ]
      },
      {
        "text": "(UTC+03:00) Kuwait, Riyadh",
        "utc": [
          "Asia/Aden",
          "Asia/Bahrain",
          "Asia/Kuwait",
          "Asia/Qatar",
          "Asia/Riyadh"
        ]
      },
      {
        "text": "(UTC+03:00) Nairobi",
        "utc": [
          "Africa/Addis_Ababa",
          "Africa/Asmera",
          "Africa/Dar_es_Salaam",
          "Africa/Djibouti",
          "Africa/Juba",
          "Africa/Kampala",
          "Africa/Khartoum",
          "Africa/Mogadishu",
          "Africa/Nairobi",
          "Antarctica/Syowa",
          "Etc/GMT-3",
          "Indian/Antananarivo",
          "Indian/Comoro",
          "Indian/Mayotte"
        ]
      },
      {
        "text": "(UTC+03:30) Tehran",
        "utc": [
          "Asia/Tehran"
        ]
      },
      {
        "text": "(UTC+04:00) Abu Dhabi, Muscat",
        "utc": [
          "Asia/Dubai",
          "Asia/Muscat",
          "Etc/GMT-4"
        ]
      },
      {
        "text": "(UTC+04:00) Baku",
        "utc": [
          "Asia/Baku"
        ]
      },
      {
        "text": "(UTC+04:00) Moscow, St. Petersburg, Volgograd",
        "utc": [
          "Europe/Moscow",
          "Europe/Samara",
          "Europe/Simferopol",
          "Europe/Volgograd"
        ]
      },
      {
        "text": "(UTC+04:00) Port Louis",
        "utc": [
          "Indian/Mahe",
          "Indian/Mauritius",
          "Indian/Reunion"
        ]
      },
      {
        "text": "(UTC+04:00) Tbilisi",
        "utc": [
          "Asia/Tbilisi"
        ]
      },
      {
        "text": "(UTC+04:00) Yerevan",
        "utc": [
          "Asia/Yerevan"
        ]
      },
      {
        "text": "(UTC+04:30) Kabul",
        "utc": [
          "Asia/Kabul"
        ]
      },
      {
        "text": "(UTC+05:00) Ashgabat, Tashkent",
        "utc": [
          "Antarctica/Mawson",
          "Asia/Aqtau",
          "Asia/Aqtobe",
          "Asia/Ashgabat",
          "Asia/Dushanbe",
          "Asia/Oral",
          "Asia/Samarkand",
          "Asia/Tashkent",
          "Etc/GMT-5",
          "Indian/Kerguelen",
          "Indian/Maldives"
        ]
      },
      {
        "text": "(UTC+05:00) Islamabad, Karachi",
        "utc": [
          "Asia/Karachi"
        ]
      },
      {
        "text": "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi",
        "utc": [
          "Asia/Calcutta"
        ]
      },
      {
        "text": "(UTC+05:30) Sri Jayawardenepura",
        "utc": [
          "Asia/Colombo"
        ]
      },
      {
        "text": "(UTC+05:45) Kathmandu",
        "utc": [
          "Asia/Katmandu"
        ]
      },
      {
        "text": "(UTC+06:00) Astana",
        "utc": [
          "Antarctica/Vostok",
          "Asia/Almaty",
          "Asia/Bishkek",
          "Asia/Qyzylorda",
          "Asia/Urumqi",
          "Etc/GMT-6",
          "Indian/Chagos"
        ]
      },
      {
        "text": "(UTC+06:00) Dhaka",
        "utc": [
          "Asia/Dhaka",
          "Asia/Thimphu"
        ]
      },
      {
        "text": "(UTC+06:00) Ekaterinburg",
        "utc": [
          "Asia/Yekaterinburg"
        ]
      },
      {
        "text": "(UTC+06:30) Yangon (Rangoon)",
        "utc": [
          "Asia/Rangoon",
          "Indian/Cocos"
        ]
      },
      {
        "text": "(UTC+07:00) Bangkok, Hanoi, Jakarta",
        "utc": [
          "Antarctica/Davis",
          "Asia/Bangkok",
          "Asia/Hovd",
          "Asia/Jakarta",
          "Asia/Phnom_Penh",
          "Asia/Pontianak",
          "Asia/Saigon",
          "Asia/Vientiane",
          "Etc/GMT-7",
          "Indian/Christmas"
        ]
      },
      {
        "text": "(UTC+07:00) Novosibirsk",
        "utc": [
          "Asia/Novokuznetsk",
          "Asia/Novosibirsk",
          "Asia/Omsk"
        ]
      },
      {
        "text": "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
        "utc": [
          "Asia/Hong_Kong",
          "Asia/Macau",
          "Asia/Shanghai"
        ]
      },
      {
        "text": "(UTC+08:00) Krasnoyarsk",
        "utc": [
          "Asia/Krasnoyarsk"
        ]
      },
      {
        "text": "(UTC+08:00) Kuala Lumpur, Singapore",
        "utc": [
          "Asia/Brunei",
          "Asia/Kuala_Lumpur",
          "Asia/Kuching",
          "Asia/Makassar",
          "Asia/Manila",
          "Asia/Singapore",
          "Etc/GMT-8"
        ]
      },
      {
        "text": "(UTC+08:00) Perth",
        "utc": [
          "Antarctica/Casey",
          "Australia/Perth"
        ]
      },
      {
        "text": "(UTC+08:00) Taipei",
        "utc": [
          "Asia/Taipei"
        ]
      },
      {
        "text": "(UTC+08:00) Ulaanbaatar",
        "utc": [
          "Asia/Choibalsan",
          "Asia/Ulaanbaatar"
        ]
      },
      {
        "text": "(UTC+09:00) Irkutsk",
        "utc": [
          "Asia/Irkutsk"
        ]
      },
      {
        "text": "(UTC+09:00) Osaka, Sapporo, Tokyo",
        "utc": [
          "Asia/Dili",
          "Asia/Jayapura",
          "Asia/Tokyo",
          "Etc/GMT-9",
          "Pacific/Palau"
        ]
      },
      {
        "text": "(UTC+09:00) Seoul",
        "utc": [
          "Asia/Pyongyang",
          "Asia/Seoul"
        ]
      },
      {
        "text": "(UTC+09:30) Adelaide",
        "utc": [
          "Australia/Adelaide",
          "Australia/Broken_Hill"
        ]
      },
      {
        "text": "(UTC+09:30) Darwin",
        "utc": [
          "Australia/Darwin"
        ]
      },
      {
        "text": "(UTC+10:00) Brisbane",
        "utc": [
          "Australia/Brisbane",
          "Australia/Lindeman"
        ]
      },
      {
        "text": "(UTC+10:00) Canberra, Melbourne, Sydney",
        "utc": [
          "Australia/Melbourne",
          "Australia/Sydney"
        ]
      },
      {
        "text": "(UTC+10:00) Guam, Port Moresby",
        "utc": [
          "Antarctica/DumontDUrville",
          "Etc/GMT-10",
          "Pacific/Guam",
          "Pacific/Port_Moresby",
          "Pacific/Saipan",
          "Pacific/Truk"
        ]
      },
      {
        "text": "(UTC+10:00) Hobart",
        "utc": [
          "Australia/Currie",
          "Australia/Hobart"
        ]
      },
      {
        "text": "(UTC+10:00) Yakutsk",
        "utc": [
          "Asia/Chita",
          "Asia/Khandyga",
          "Asia/Yakutsk"
        ]
      },
      {
        "text": "(UTC+11:00) Solomon Is., New Caledonia",
        "utc": [
          "Antarctica/Macquarie",
          "Etc/GMT-11",
          "Pacific/Efate",
          "Pacific/Guadalcanal",
          "Pacific/Kosrae",
          "Pacific/Noumea",
          "Pacific/Ponape"
        ]
      },
      {
        "text": "(UTC+11:00) Vladivostok",
        "utc": [
          "Asia/Sakhalin",
          "Asia/Ust-Nera",
          "Asia/Vladivostok"
        ]
      },
      {
        "text": "(UTC+12:00) Auckland, Wellington",
        "utc": [
          "Antarctica/McMurdo",
          "Pacific/Auckland"
        ]
      },
      {
        "text": "(UTC+12:00) Coordinated Universal Time+12",
        "utc": [
          "Etc/GMT-12",
          "Pacific/Funafuti",
          "Pacific/Kwajalein",
          "Pacific/Majuro",
          "Pacific/Nauru",
          "Pacific/Tarawa",
          "Pacific/Wake",
          "Pacific/Wallis"
        ]
      },
      {
        "text": "(UTC+12:00) Fiji",
        "utc": [
          "Pacific/Fiji"
        ]
      },
      {
        "text": "(UTC+12:00) Magadan",
        "utc": [
          "Asia/Anadyr",
          "Asia/Kamchatka",
          "Asia/Magadan",
          "Asia/Srednekolymsk"
        ]
      },
      {
        "text": "(UTC+13:00) Nuku'alofa",
        "utc": [
          "Etc/GMT-13",
          "Pacific/Enderbury",
          "Pacific/Fakaofo",
          "Pacific/Tongatapu"
        ]
      },
      {
        "text": "(UTC+13:00) Samoa",
        "utc": [
          "Pacific/Apia"
        ]
      }
    ]


  }
})();

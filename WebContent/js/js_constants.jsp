<%@ include file="/include_tld.jsp" %>

<% /* WINDOW CONSTANTS:
		- window.hideObject:  Array of { obj: [ fontFamilyPalette ], cssObj: fontFamilyPicker }:
									obj: objects to set visibility to 'hidden'
									cssObj: object to change className to ''
		- window.resizeObject: dialog currently being resized
		- window.focusObject:  dialog currently in focus
*/ %>
window.hideObject = new Array();


<% /* CLIENT CONSTANTS */ %>

<% /* Holds the value of the current context */ %>
var CONTEXT_PREFIX = '';
var IS_IE     = document.all;
var IS_FF     = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
var IS_CHROME = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
var IS_SAFARI = navigator.userAgent.toLowerCase().indexOf('safari') > -1;
var SERVER_URL = '<%=request.getRequestURL()%>'.substr(0, '<%=request.getRequestURL()%>'.indexOf('<%=request.getRequestURI()%>'));

<% /* Session objects */ %>
var USERNAME = top.cairo.userName;
var SESSION = { valid: true };

<% /* API keys */ %>
var YANDEX_API_KEY = "trnsl.1.1.20190802T205522Z.84963c6d07fe2a2c.f9be13a7755cdbf4b65a4770988cf7a3254ba9c1";

<% /* URLs

Translation URLs, see:
    https://tech.yandex.com/translate/doc/dg/reference/getLangs-docpage/
    https://tech.yandex.com/translate/doc/dg/reference/translate-docpage/

*/ %>
var GET_LANGUAGES_REQUEST = "https://translate.yandex.net/api/v1.5/tr.json/getLangs";
var TRANSLATE_REQUEST = "https://translate.yandex.net/api/v1.5/tr.json/translate";

<% /* Supported languages for translation */ %>
var LANGUAGES = [];
JSONP.get(GET_LANGUAGES_REQUEST, {key: YANDEX_API_KEY, ui: "en"}, function(response) {
    if(response && response.langs) {
        for (let [key, value] of Object.entries(response.langs)) {
            LANGUAGES.push({
                code: key,
                name: value
            });
        }
        LANGUAGES.sort((a, b) => a.name.localeCompare(b.name));
        LANGUAGES.push({ code: '', name: 'DETECT' });
    }
});

<% /* Labels */ %>
var LABEL_OK = 'Ok';
var LABEL_CANCEL = 'Cancel';
var LABEL_YES = 'Yes';
var LABEL_NO = 'No';
var LABEL_CLOSE = 'Close';
var LABEL_MAXIMIZE = 'Maximize';
var LABEL_MINIMIZE = 'Minimize';
var LABEL_TILES = 'Restore Down';
var LABEL_RESIZE = 'Resize';

<% /* Images */ %>
var IMG_BLANK_SRC =					'http://farm3.static.flickr.com/2262/2229319529_6969bdc2b8_o.gif';
var IMG_RESIZE_SRC =				'http://farm3.static.flickr.com/2372/2196768295_9d7e3de1f9_o.gif';
var IMG_TYPING_SRC =				'http://farm3.static.flickr.com/2016/2197557730_84060aa633_o.gif';
var IMG_TYPED_SRC =					'http://farm3.static.flickr.com/2219/2196768325_3234f06c72_o.png';
var IMG_FONT_STYLE_PICKER_SRC =		'http://farm4.static.flickr.com/3320/3209448351_9de1f00008_o.gif';
var IMG_COLOR_PICKER_SRC =			'http://farm3.static.flickr.com/2278/2230112674_fa6ba604e7_o.gif';
var IMG_TRANSLATE_PICKER_OFF_SRC =	'http://farm5.static.flickr.com/4026/4334549273_7236495423_o.gif';
var IMG_TRANSLATE_PICKER_ON_SRC =	'http://farm5.static.flickr.com/4043/4334549279_43bdb87e74_o.gif';
var IMG_SOUND_PICKER_SRC =			'http://farm4.static.flickr.com/3172/2577995079_ef23a954e3.jpg';
var IMG_SMILEY_PICKER_SRC =			'http://farm3.static.flickr.com/2358/2230431840_532486de77_o.gif';
var IMG_CAIRO_PROTOCOL_ONLINE_SRC = 'http://farm3.static.flickr.com/2196/2196755699_b2f2a21df9_o.gif';
var IMG_CAIRO_PROTOCOL_AWAY_SRC =   'http://farm3.static.flickr.com/2139/2197544686_fb4fd1268b_o.gif';
var IMG_LED_STATUS_ONLINE_SRC =     'http://farm4.static.flickr.com/3208/2392766559_e3f7752b2d_o.gif';
var IMG_LED_STATUS_OFFLINE_SRC =    'http://farm3.static.flickr.com/2373/2393597630_563d5d0f1f_o.gif';
var IMG_LED_STATUS_AWAY_SRC =       'http://farm3.static.flickr.com/2337/2392766507_861aecf4dc_o.gif';
var IMG_DROPDOWN_ARROW_SRC =        'http://farm3.static.flickr.com/2413/2197544708_60fafea786_o.gif';
var IMG_UNSET_BUDDY_ICON_SRC =      'http://farm3.static.flickr.com/2137/2230112940_c2d84a1d84_o.gif';
var IMG_CUSTOM_BUDDY_ICON_SRC =     'http://farm3.static.flickr.com/2137/2230112940_c2d84a1d84_o.gif';

<% /* Sounds on this client */ %>
var SOUND_BUDDY_LOGIN  = 'login.wav';
var SOUND_BUDDY_LOGOUT = 'logout.wav';
var SOUND_MSG_RECEIVED = 'message.wav';

<% /* Custom pickers */ %>
var BUDDY_ICON_UNSET      = '';
var WALLPAPER_UNSET       = 'http://farm3.static.flickr.com/2284/2197561602_992287c386_o.jpg';
var CUSTOM_BUDDY_ICON_DIR = '/img/buddy_icons/custom/';
var CUSTOM_WALLPAPER_DIR  = '/img/wallpapers/custom/';
var FILE_UPLOAD_DIR = '/upload/';

<% /* Auto away message */ %>
var AUTO_AWAY_CUSTOM_MESSAGE = '(idle)';

<% /* Security keys */ %>
var CIPHER_KEY = '82380448632038961852097262308563';
var CIPHER_MODE = 'ECB';

<% /* Cookies */ %>
var COOKIE_FONTSTYLE = 'com.vh.msg.fontStyle';  <% /* eg: '0,0,0,#D65539,Verdana,12px' (B,I,U,color,fontFamily,fontSize) */ %>
var DIALOG_FONT_STYLE_BOLD        = 0;
var DIALOG_FONT_STYLE_ITALIC      = 1;
var DIALOG_FONT_STYLE_UNDERLINE   = 2;
var DIALOG_FONT_STYLE_COLOR       = 3;
var DIALOG_FONT_STYLE_FONT_FAMILY = 4;
var DIALOG_FONT_STYLE_FONT_SIZE   = 5;
var COOKIE_GLOBALS = 'com.vh.msg.globals';      <% /* eg: '0,0,0,0,0,0,-1,http://farm3.static.flickr.com/2284/2197561602_992287c386_o.jpg' (Sound,Blinker,Wallpaper,sound login,sound logout,sound message,blinker count,wallpaper img) */ %>
var GLOBALS_SOUND                 = 0;
var GLOBALS_BLINKER               = 1;
var GLOBALS_WALLPAPER             = 2;
var GLOBALS_SOUND_LOGIN           = 3;
var GLOBALS_SOUND_LOGOUT          = 4;
var GLOBALS_SOUND_MESSAGE         = 5;
var GLOBALS_BLINKER_COUNT         = 6;
var GLOBALS_WALLPAPER_IMG         = 7;

<% /* Dialog constants */ %>
var DIALOG_MIN_WIDTH  = 150;	<% /* dialog cannot be smaller than this */ %>
var DIALOG_MIN_HEIGHT = 248;	<% /* dialog cannot be smaller than this */ %>
var DIALOG_MIN_X_MOVE = 20;		<% /* move X direction via keyboard: step size */ %>
var DIALOG_MIN_Y_MOVE = 15;		<% /* move X direction via keyboard: step size */ %>
var DIALOG_TOP_HEIGHT = 24;		<% /* dialog top border height (includes maximize/close images) */ %>
var DIALOG_LEFT_WIDTH = 8;		<% /* dialog left border width (includes just the border on the left) */ %>

<% /* Keyboard constants */ %>
var BACKSPACE_KEY = 8;
var TAB_KEY       = 9;
var DELETE_KEY    = 46;
var UP_KEY        = 38;
var DOWN_KEY      = 40;
var LEFT_KEY      = 37;
var RIGHT_KEY     = 39;
var PAGEUP_KEY    = 33;
var PAGEDOWN_KEY  = 34;
var ENTER_KEY     = 13;
var ESC_KEY       = 27;
var CTRL_KEY      = 17;
var A_KEY         = 65;
var B_KEY         = 66;
var O_KEY         = 79;
var S_KEY         = 83;
var W_KEY         = 87;
var X_KEY         = 88;
var Z_KEY         = 90;

<% /* Chat status constants */ %>
var CHAT_STATUS_NOT_TYPING = 1;
var CHAT_STATUS_TYPING     = 2;
var CHAT_STATUS_TYPED      = 3;

<% /* Special effect types */ %>
var SPECIAL_EFFECT_TYPE_SOUND  = 1;
var SPECIAL_EFFECT_TYPE_VISUAL = 2;


<% /* JAVA CONSTANTS */ %>

<% /* User status constants */ %>
var USER_STATUS_ONLINE	= <%=com.vh.msg.util.Constants.USERSTATUS_ONLINE%>;
var USER_STATUS_OFFLINE = <%=com.vh.msg.util.Constants.USERSTATUS_OFFLINE%>;
var USER_STATUS_AWAY	= <%=com.vh.msg.util.Constants.USERSTATUS_AWAY%>;

<% /* Event types */ %>
var EVENT_TYPE_GET_USERS              = <%=com.vh.msg.util.Constants.EVENTTYPE_GET_USERS%>;
var EVENT_TYPE_GET_OFFLINE_MESSAGES   = <%=com.vh.msg.util.Constants.EVENTTYPE_GET_OFFLINE_MESSAGES%>;
var EVENT_TYPE_CLEAR_OFFLINE_MESSAGES = <%=com.vh.msg.util.Constants.EVENTTYPE_CLEAR_OFFLINE_MESSAGES%>;
var EVENT_TYPE_INCOMING_MESSAGE       = <%=com.vh.msg.util.Constants.EVENTTYPE_INCOMING_MESSAGE%>;
var EVENT_TYPE_USER_CHANGE_STATUS     = <%=com.vh.msg.util.Constants.EVENTTYPE_USER_CHANGE_STATUS%>;
var EVENT_TYPE_USER_CHANGE_BUDDY_ICON = <%=com.vh.msg.util.Constants.EVENTTYPE_USER_CHANGE_BUDDY_ICON%>;
var EVENT_TYPE_USER_TYPING            = <%=com.vh.msg.util.Constants.EVENTTYPE_USER_TYPING%>;
var EVENT_TYPE_SYSTEM_MESSAGE         = <%=com.vh.msg.util.Constants.EVENTTYPE_SYSTEM_MESSAGE%>;
var EVENT_TYPE_SPECIAL_EFFECT         = <%=com.vh.msg.util.Constants.EVENTTYPE_SPECIAL_EFFECT%>;


<% /* HASHMAPS */ %>

<% /* Dialogs hashmap: each dialogId maps to a Dialog object */ %>
var DIALOGS = [];

<% /* Users hashmap: each chat buddy's userName maps to a { userName:abc, status:1 } json object  */ %>
var USERS = [];

<% /* Custom image file extensions: these are the allowed custom image types (buddy icon & wallpaper) */ %>
var IMAGE_FILE_EXTENSIONS = [ 'bmp', 'gif', 'jpg', 'jpeg', 'png' ];

<% /* File extensions array: these are the allowed file extensions to be uploaded to the server */ %>
var FILE_EXTENSIONS = [ 'bmp', 'gif', 'jpg', 'jpeg', 'png', 'txt', 'pdf', 'doc', 'xls', 'ppt', 'wmv', 'avi', 'mpg', 'mpeg', 'mov', 'mp3', 'mp4', 'wav', 'wma', 'zip', 'rar' ];

<% /* Wallpapers hashmap: contains the default wallpapers */ %>
var WALLPAPERS = [ { img: 'http://farm3.static.flickr.com/2284/2197561602_992287c386_o.jpg',  thumb: 'http://farm3.static.flickr.com/2284/2197561602_67d3127b62_t.jpg',  desc: 'Penguin'         },
				   { img: 'http://farm4.static.flickr.com/3352/3209361187_9decbb8de8_o.jpg',  thumb: 'http://farm4.static.flickr.com/3352/3209361187_49875c837f_t.jpg',  desc: 'Beach'           },
				   { img: 'http://farm3.static.flickr.com/2244/2197562406_f1ba70aa86_o.jpg',  thumb: 'http://farm3.static.flickr.com/2244/2197562406_83fd41245d_t.jpg',  desc: 'New York City'   },
				   { img: 'http://farm3.static.flickr.com/2007/2197563420_677b35b406_o.jpg',  thumb: 'http://farm3.static.flickr.com/2007/2197563420_61ec4cef20_t.jpg',  desc: 'Candle & Stones' },
				   { img: 'http://farm3.static.flickr.com/2250/2196775651_533d13d32b_o.jpg',  thumb: 'http://farm3.static.flickr.com/2250/2196775651_3342c49819_t.jpg',  desc: 'Compass'         },
				   { img: 'http://farm3.static.flickr.com/2196/2196774229_50409ce181_o.jpg',  thumb: 'http://farm3.static.flickr.com/2196/2196774229_cbd02dfbb4_t.jpg',  desc: 'Sea Crab'        },
				   { img: 'http://farm3.static.flickr.com/2078/2196774945_a0d5f4f2a3_o.jpg',  thumb: 'http://farm3.static.flickr.com/2078/2196774945_66ecf3c550_t.jpg',  desc: 'Puzzle'          },
				   { img: 'http://farm4.static.flickr.com/3308/3209363483_fbb41c1ff9_o.jpg',  thumb: 'http://farm4.static.flickr.com/3308/3209363483_1dbf2e1ca4_t.jpg',  desc: 'Earth'           },
				   { img: 'http://farm3.static.flickr.com/2069/2196775351_f9c5d0a1ab_o.jpg',  thumb: 'http://farm3.static.flickr.com/2069/2196775351_967c1d3ac2_t.jpg',  desc: 'Wall'            },
				   { img: 'http://farm4.static.flickr.com/3458/3209974555_b5d4036b20_o.jpg',  thumb: 'http://farm4.static.flickr.com/3458/3209974555_8beb2fb418_t.jpg',  desc: 'Disco Ball'      },
				   { img: 'http://farm3.static.flickr.com/2192/2196775995_e9fa5760f4_o.jpg',  thumb: 'http://farm3.static.flickr.com/2192/2196775995_0a02ab3e39_t.jpg',  desc: 'Ice Cubes'       },
                   { img: 'http://farm3.static.flickr.com/2147/2197562178_40a0556374_o.jpg',  thumb: 'http://farm3.static.flickr.com/2147/2197562178_c768243014_t.jpg',  desc: 'Wine'            },
                   { img: 'http://farm4.static.flickr.com/3400/3210635050_0b5e8e49f5_o.jpg',  thumb: 'http://farm4.static.flickr.com/3400/3210635050_a45712a654_t.jpg',  desc: 'Desert'          },
                   { img: 'http://farm4.static.flickr.com/3335/3210634048_255589a95b_o.jpg',  thumb: 'http://farm4.static.flickr.com/3335/3210634048_e3f37b5be2_t.jpg',  desc: 'Puppy'           },
                   { img: 'http://farm3.static.flickr.com/2282/2197565532_141b505cc4_o.jpg',  thumb: 'http://farm3.static.flickr.com/2282/2197565532_96b9ed4875_t.jpg',  desc: 'Winter'          },
                   { img: 'http://farm4.static.flickr.com/3397/3210634542_61d508cabb_o.jpg',  thumb: 'http://farm4.static.flickr.com/3397/3210634542_95247a8a7c_t.jpg',  desc: 'Capri'           },
                   { img: 'http://farm4.static.flickr.com/3401/3209361427_e6a12a2fa1_o.jpg',  thumb: 'http://farm4.static.flickr.com/3401/3209361427_007778e8c7_t.jpg',  desc: 'Burning Pine'    },
                   { img: 'http://farm4.static.flickr.com/3474/3209788063_7f7e0a0352_o.jpg',  thumb: 'http://farm4.static.flickr.com/3474/3209788063_428015150a_t.jpg',  desc: 'Mojito'          },
                   { img: 'http://farm4.static.flickr.com/3304/3210208694_6903a3240a_o.jpg',  thumb: 'http://farm4.static.flickr.com/3304/3210208694_3631cb3b2b_t.jpg',  desc: 'Letters'         },
                   { img: 'http://farm3.static.flickr.com/2023/2229320707_e216584f56_o.gif',  thumb: 'http://farm3.static.flickr.com/2023/2229320707_e216584f56_o.gif',  desc: 'Custom'          }  ];

<% /* Fonts hashmap: contains the supported font types and font sizes */ %>
var FONTS = [ { type: 'Arial',          size: '8',   detect: false  },
			  { type: 'Arial Black',    size: '10',  detect: false  },
			  { type: 'Century Gothic', size: '12',  detect: false  },
			  { type: 'Comic Sans MS',  size: '14',  detect: false  },
			  { type: 'Courier',        size: '16',  detect: false  },
			  { type: 'Cursive',        size: '20',  detect: false  },
			  { type: 'Georgia',        size: '24',  detect: false  },
			  { type: 'Tahoma',         size: '36',  detect: false  },
			  { type: 'Times',          size: '',    detect: false  },
			  { type: 'Trebuchet MS',   size: '',    detect: false  },
			  { type: 'Verdana',        size: '',    detect: false  }  ];

<% /* Fonts hashmap: contains the supported font types and font sizes */ %>
var SPECIAL_CHARS = [ { ascii: '&#39;',   value: '\'' } ];

<% /* Buddy icons hashmap: contains the default buddy icons */ %>
var BUDDY_ICONS = [ { img: 'http://farm3.static.flickr.com/2165/2197542520_cb00867ac3_o.jpg',	desc: 'Cow'       },
					{ img: 'http://farm3.static.flickr.com/2114/2197542758_74f724c5b7_o.jpg',	desc: 'Tongue'    },
					{ img: 'http://farm3.static.flickr.com/2011/2196753669_edfb1694ea_o.jpg',	desc: 'Berry'     },
					{ img: 'http://farm3.static.flickr.com/2105/2196753685_e0bf02cde1_o.jpg',	desc: 'Coffee'    },
					{ img: 'http://farm3.static.flickr.com/2359/2196753711_a87eb7cd46_o.jpg',	desc: 'Dog'       },
					{ img: 'http://farm3.static.flickr.com/2064/2196753735_962a6d62eb_o.jpg',	desc: 'Duck'      },
					{ img: 'http://farm3.static.flickr.com/2413/2197542556_9e895ccfee_o.jpg',	desc: 'Emu'       },
					{ img: 'http://farm3.static.flickr.com/2169/2196753769_708bef1c17_o.jpg',	desc: 'Face'      },
					{ img: 'http://farm3.static.flickr.com/2038/2197542606_471e9a6ac5_o.jpg',	desc: 'Fish'      },
					{ img: 'http://farm3.static.flickr.com/2045/2197542624_ca1ab2da6f_o.jpg',	desc: 'Flower'    },
					{ img: 'http://farm3.static.flickr.com/2319/2196753823_69d5d05f00_o.jpg',	desc: 'Geek'      },
					{ img: 'http://farm3.static.flickr.com/2225/2196753845_9a483e8f5b_o.jpg',	desc: 'Lips'      },
					{ img: 'http://farm3.static.flickr.com/2227/2197542682_5cd75e805b_o.jpg',	desc: 'Martini'   },
					{ img: 'http://farm3.static.flickr.com/2385/2197542704_2dc08725c5_o.jpg',	desc: 'Panda'     },
					{ img: 'http://farm3.static.flickr.com/2110/2197542726_7d55b6a775_o.jpg',	desc: 'Scarf'     },
					{ img: 'http://farm3.static.flickr.com/2012/2196753889_8d9506a2a4_o.jpg',	desc: 'Shoe'      },
					{ img: 'http://farm3.static.flickr.com/2397/2196753833_611cbd107a_o.jpg',	desc: 'Kiss Ass'  },
					{ img: 'http://farm3.static.flickr.com/2245/2197542628_88eb8b5760_o.jpg',	desc: 'Frog'      },
					{ img: 'http://farm3.static.flickr.com/2244/2197542790_930f7922bf_o.jpg',	desc: 'Yo'        },
					{ img: 'http://farm3.static.flickr.com/2137/2230112940_c2d84a1d84_o.gif',	desc: 'Custom'    }  ];

<% /* Sounds hashmap */ %>
var SOUNDS = [ { img: 'http://farm4.static.flickr.com/3037/2975639788_3b59b16ef0.jpg',      name: 'cash.mp3',              desc: 'Money'              },
		       { img: 'http://farm4.static.flickr.com/3041/2755002211_19f1156890.jpg',      name: 'rooster.mp3',           desc: 'Rooster wake up'    },
               { img: 'http://farm4.static.flickr.com/3101/2707221875_b3c86f2de3.jpg',      name: 'drums.mp3',             desc: 'Drums'              },
               { img: 'http://farm4.static.flickr.com/3235/2755834984_e74594ef29.jpg',      name: 'goodbye.wav',         desc: 'Goodbyeee'          },
		       { img: 'http://farm4.static.flickr.com/3124/2708037378_ce6bb7600c.jpg',      name: 'ringin.mp3',            desc: 'Ring ring'          },
               { img: 'http://farm4.static.flickr.com/3016/2755003059_c058b9b048.jpg',	    name: 'cow.mp3',               desc: 'Cow'                },
		       { img: 'http://farm4.static.flickr.com/3144/2975639796_ac0ab18ab8.jpg',      name: 'duck.mp3',              desc: 'Duck'               },
               { img: 'http://farm4.static.flickr.com/3151/2707221797_383c703bbf.jpg',	    name: 'halleluya.mp3',         desc: 'Halleluya'          },
		       { img: 'http://farm4.static.flickr.com/3268/2707221699_12864005a0.jpg',	    name: 'hahaha.mp3',            desc: 'Hahaha'             },
		       { img: 'http://farm4.static.flickr.com/3193/2975639806_8163df7937.jpg',	    name: 'snoring.mp3',           desc: 'Snoring'            },
               { img: 'http://farm4.static.flickr.com/3247/2755835450_d032be6f1e.jpg',	    name: 'kiss.mp3',              desc: 'Kiss'               },
               { img: 'http://farm4.static.flickr.com/3192/2755002351_8834945dc4.jpg',      name: 'applause.mp3',          desc: 'Applause'           },
		       { img: 'http://farm4.static.flickr.com/3051/2755835620_9f21b67651.jpg',	    name: 'beer.mp3',              desc: 'Beer'               },
		       { img: 'http://farm4.static.flickr.com/3070/2975639802_8b73323808.jpg',      name: 'eating.mp3',            desc: 'Food'               },
               { img: 'http://farm4.static.flickr.com/3065/2755836300_809781f4d9.jpg',      name: 'uh_oh.mp3',             desc: 'Uh oh'              },
		       { img: 'http://farm4.static.flickr.com/3070/2755835760_47806c11f5.jpg',	    name: 'goal.mp3',              desc: 'Goal'               } ];

<% /* Smiley hashmap */ %>
var SMILEYS = [ { regExp: [/:\)/i,/:-\)/i  ],        img: 'http://farm3.static.flickr.com/2119/2252935473_ee9d7a1e4b_o.gif',	desc: 'Smile    :-) or :)'        },
                { regExp: [/:\(/i,/:-\(/i  ],        img: 'http://farm3.static.flickr.com/2142/2252935495_236e31d404_o.gif',	desc: 'Sad    :-( or :('          },
                { regExp: [/[:,;]P/i,/[:,;]-P/i  ],  img: 'http://farm3.static.flickr.com/2220/2252935335_6d0f66ef32_o.gif',	desc: 'Tongue    :-P or :p'       },
                { regExp: [/:\*/i          ],        img: 'http://farm3.static.flickr.com/2403/2253734082_76c190766e_o.gif',	desc: 'Embarrased    :*'          },
                { regExp: [/;\)/i,/;-\)/i  ],        img: 'http://farm3.static.flickr.com/2195/2252935287_f7fa82b157_o.gif',	desc: 'Wink    ;-) or ;)'         },
                { regExp: [/:\^/i,/\^O\)/i ],        img: 'http://farm3.static.flickr.com/2384/2253734280_fdd9a1045f_o.gif',	desc: 'Sarcastic    :^ or ^o)'    },
                { regExp: [/:D/i,/:-D/i    ],        img: 'http://farm3.static.flickr.com/2310/2252935505_a130a7f826_o.gif',	desc: 'Happy    :-D or :d'        },
                { regExp: [/:S/i,/:-S/i    ],        img: 'http://farm3.static.flickr.com/2241/2253734294_00e81e899a_o.gif',	desc: 'Confused    :-S or :s'     },
                { regExp: [/:O/i,/:-O/i    ],        img: 'http://farm3.static.flickr.com/2095/2252935343_34542b7736_o.gif',	desc: 'Surprised    :-O or :o'    },
                { regExp: [/:@/i,/:-@/i    ],        img: 'http://farm3.static.flickr.com/2251/2253734054_8ea3a2740b_o.gif',	desc: 'Angry    :-@ or :@'        },
                { regExp: [/8O\|/i         ],        img: 'http://farm3.static.flickr.com/2324/2252935393_27fd0befb7_o.gif',	desc: 'Pissed    8o|'             },
                { regExp: [/:'/i,/:'\(/i   ],        img: 'http://farm3.static.flickr.com/2152/2253734118_2efc38b695_o.gif',	desc: 'Crying    :\' or :\'('     },
                { regExp: [/\(H\)/i        ],        img: 'http://farm3.static.flickr.com/2312/2252935319_6e32463163_o.gif',	desc: 'Hot    (H) or (h)'         },
                { regExp: [/:B/i,/8-\|/i   ],        img: 'http://farm3.static.flickr.com/2198/2253734192_a60b7877c1_o.gif',	desc: 'Nerd    :B or 8-|'         },
                { regExp: [/\|-\)/i        ],        img: 'http://farm3.static.flickr.com/2396/2252935311_7c817bd667_o.gif',	desc: 'Sleepy    |-)'             },
                { regExp: [/\*-\)/i        ],        img: 'http://farm3.static.flickr.com/2003/2252935365_a277deeb57_o.gif',	desc: 'Thinking    *-)'           },
                { regExp: [/\+O\(/i        ],        img: 'http://farm3.static.flickr.com/2285/2253734224_bf96c09b07_o.gif',	desc: 'Sick    +o('               },
                { regExp: [/:\|/i,/:-\|/i  ],        img: 'http://farm3.static.flickr.com/2174/2252935469_8d46185f0f_o.gif',	desc: 'Disappointed    :-| or :|' },
                { regExp: [/\(Y\)/i        ],        img: 'http://farm3.static.flickr.com/2375/2252935405_338a672002_o.gif',	desc: 'Thumbs up    (Y) or (y)'   },
                { regExp: [/\(N\)/i        ],        img: 'http://farm3.static.flickr.com/2230/2252935413_3b9d5a4f2b_o.gif',	desc: 'Thumbs down    (N) or (n)' },
                { regExp: [/\(C\)/i        ],        img: 'http://farm3.static.flickr.com/2192/2252935347_54bddd8739_o.gif',	desc: 'Coffee cup    (C) or (c)'  },
                { regExp: [/\(B\)/i        ],        img: 'http://farm3.static.flickr.com/2317/2252935353_3965293fcb_o.gif',	desc: 'Beer mug    (B) or (b)'    },
                { regExp: [/\(D\)/i        ],        img: 'http://farm3.static.flickr.com/2207/2253734236_3b7cb0882e_o.gif',	desc: 'Martini    (D) or (d)'     },
                { regExp: [/\(L\)/i        ],        img: 'http://farm3.static.flickr.com/2282/2253734258_e932246cbd_o.gif',	desc: 'Red heart    (L) or (l)'   },
                { regExp: [/\(K\)/i        ],        img: 'http://farm3.static.flickr.com/2107/2252935441_7bc23b62eb_o.gif',	desc: 'Red lips    (K) or (k)'    }  ];
(function ($) {
	var groups = [];
	groups.push(["SYM", "CONTROL", 0, 31]);
	groups.push(["SYM", "LATIN_BASIC_SYMBOLS", 32, 47]);
	groups.push(["NUM", "LATIN_BASIC_NUMBERS", 48, 57]);
	groups.push(["SYM", "LATIN_BASIC_SYMBOLS", 58, 64]);
	groups.push(["ABC", "LATIN_BASIC_UPPERCASE", 65, 90]);
	groups.push(["SYM", "LATIN_BASIC_SYMBOLS", 91, 96]);
	groups.push(["ABC", "LATIN_BASIC_LOWERCASE", 97, 122]);
	groups.push(["SYM", "LATIN_BASIC_SYMBOLS", 123, 127]);
	groups.push(["SYM", "LATIN1_CONTROL", 128, 159]);
	groups.push(["SYM", "LATIN1_SYMBOLS", 160, 191]);
	groups.push(["ABC", "LATIN1_SUPP", 192, 255]);
	groups.push(["ABC", "LATIN_EXT_A", 256, 383]);
	groups.push(["ABC", "LATIN_EXT_B", 384, 591]);
	groups.push(["ABC", "IPA", 592, 687]);
	groups.push(["SYM", "SPACING", 688, 767]);
	groups.push(["SYM", "DIACRITICAL_MARKS", 768, 879]);
	groups.push(["ABC", "GREEK", 880, 1023]);
	groups.push(["ABC", "CYRILLIC", 1024, 1279]);
	groups.push(["ABC", "CYRILLIC", 1280, 1327]);
	groups.push(["ABC", "ARMENIAN", 1328, 1423]);
	groups.push(["ABC", "HEBREW", 1424, 1535]);
	groups.push(["ABC", "ARABIC", 1536, 1791]);
	groups.push(["ABC", "SYRIAC", 1792, 1871]);
	groups.push(["ABC", "ARABIC", 1872, 1919]);
	groups.push(["ABC", "THAANA", 1920, 1983]);
	groups.push(["ABC", "NKO", 1984, 2047]);
	groups.push(["ABC", "SAMARITAN", 2048, 2111]);
	groups.push(["ABC", "MANDAIC", 2112, 2143]);
	groups.push(["ABC", "ARABIC", 2208, 2303]);
	groups.push(["ABU", "DEVANAGARI", 2304, 2431]);
	groups.push(["ABU", "BENGALI", 2432, 2559]);
	groups.push(["ABU", "GURMUKHI", 2560, 2687]);
	groups.push(["ABU", "GUJARATI", 2688, 2815]);
	groups.push(["ABU", "ORIYA", 2816, 2943]);
	groups.push(["ABU", "TAMIL", 2944, 3071]);
	groups.push(["ABU", "TELUGU", 3072, 3199]);
	groups.push(["ABU", "KANNADA", 3200, 3327]);
	groups.push(["ABU", "MALAYALAM", 3328, 3455]);
	groups.push(["ABU", "SINHALA", 3456, 3583]);
	groups.push(["ABU", "THAI", 3584, 3711]);
	groups.push(["ABU", "LAO", 3712, 3839]);
	groups.push(["ABU", "TIBETAN", 3840, 4095]);
	groups.push(["ABU", "MYANMAR", 4096, 4255]);
	groups.push(["ABU", "GEORGIAN", 4256, 4351]);
	groups.push(["ABU", "HANGUL_JAMO", 4352, 4607]);
	groups.push(["ABU", "ETHIOPIC", 4608, 4991]);
	groups.push(["ABU", "ETHIOPIC", 4992, 5023]);
	groups.push(["SYL", "CHEROKEE", 5024, 5119]);
	groups.push(["ABU", "ABORIGINAL", 5120, 5759]);
	groups.push(["ABC", "OGHAM", 5760, 5791]);
	groups.push(["ABC", "RUNIC", 5792, 5887]);
	groups.push(["ABU", "TAGALOG", 5888, 5919]);
	groups.push(["ABU", "HANUNOO", 5920, 5951]);
	groups.push(["ABU", "BUHID", 5952, 5983]);
	groups.push(["ABU", "TAGBANWA", 5984, 6015]);
	groups.push(["ABU", "KHMER", 6016, 6143]);
	groups.push(["ABU", "MONGOLIAN", 6144, 6319]);
	groups.push(["ABU", "ABORIGINAL", 6320, 6399]);
	groups.push(["ABU", "LIMBU", 6400, 6479]);
	groups.push(["ABU", "TAI", 6480, 6527]);
	groups.push(["ABC", "TAI", 6528, 6623]);
	groups.push(["SYM", "KHMER", 6624, 6655]);
	groups.push(["ABU", "BUGINESE", 6656, 6687]);
	groups.push(["ABU", "TAI", 6688, 6831]);
	groups.push(["SYM", "DIACRITICAL_MARKS", 6832, 6911]);
	groups.push(["ABU", "BALINESE", 6912, 7039]);
	groups.push(["ABU", "SUNDANESE", 7040, 7103]);
	groups.push(["ABU", "BATAK", 7104, 7167]);
	groups.push(["ABU", "LEPCHA", 7168, 7247]);
	groups.push(["ABC", "OL_CHIKI", 7248, 7295]);
	groups.push(["ABU", "SUNDANESE", 7360, 7375]);
	groups.push(["SYM", "VEDIC", 7376, 7423]);
	groups.push(["SYM", "PHONETIC", 7424, 7551]);
	groups.push(["SYM", "PHONETIC", 7552, 7615]);
	groups.push(["SYM", "DIACRITICAL_MARKS", 7616, 7679]);
	groups.push(["SYM", "LATIN_EXT", 7680, 7935]);
	groups.push(["SYM", "GREEK", 7936, 8191]);
	groups.push(["SYM", "PUNCTUATION", 8192, 8303]);
	groups.push(["SYM", "SUP_SUB_SCRIPTS", 8304, 8351]);
	groups.push(["SYM", "CURRENCY", 8352, 8399]);
	groups.push(["SYM", "DIACRITICAL_MARKS", 8400, 8447]);
	groups.push(["SYM", "LETTERLIKE", 8448, 8527]);
	groups.push(["SYM", "NUMBER", 8528, 8591]);
	groups.push(["SYM", "ARROWS", 8592, 8703]);
	groups.push(["SYM", "MATHEMATICAL", 8704, 8959]);
	groups.push(["SYM", "TECHNICAL", 8960, 9215]);
	groups.push(["SYM", "CONTROL_PICTURES", 9216, 9279]);
	groups.push(["SYM", "OPTICAL", 9280, 9311]);
	groups.push(["SYM", "ALPHANUMERICS", 9312, 9471]);
	groups.push(["SYM", "BOX_DRAWINGS", 9472, 9599]);
	groups.push(["SYM", "BLOCK_ELEMENTS", 9600, 9631]);
	groups.push(["SYM", "GEOMETRIC_SHAPES", 9632, 9727]);
	groups.push(["SYM", "MISCELLANEOUS", 9728, 9983]);
	groups.push(["SYM", "DINGBATS", 9984, 10175]);
	groups.push(["SYM", "MATHEMATICAL", 10176, 10223]);
	groups.push(["SYM", "ARROWS", 10224, 10239]);
	groups.push(["SYM", "BRAILLE", 10240, 10495]);
	groups.push(["SYM", "ARROWS", 10496, 10623]);
	groups.push(["SYM", "MATHEMATICAL", 10624, 10751]);
	groups.push(["SYM", "MATHEMATICAL", 10752, 11007]);
	groups.push(["SYM", "MISCELLANEOUS", 11008, 11263]);
	groups.push(["ABC", "GLAGOLITIC", 11264, 11359]);
	groups.push(["ABC", "LATIN_EXT_C", 11360, 11391]);
	groups.push(["ABC", "COPTIC", 11392, 11519]);
	groups.push(["ABC", "GEORGIAN", 11520, 11567]);
	groups.push(["ABY", "TIFINAGH", 11568, 11647]);
	groups.push(["ABU", "ETHIOPIC", 11648, 11743]);
	groups.push(["ABC", "CYRILLIC", 11744, 11775]);
	groups.push(["SYM", "PUNCTUATION", 11776, 11903]);
	groups.push(["SYM", "CJK", 11904, 12031]);
	groups.push(["SYM", "KANGXI", 12032, 12255]);
	groups.push(["SYM", "IDEOGRAPHIC", 12272, 12287]);
	groups.push(["SYM", "CJK", 12288, 12351]);
	groups.push(["SYL", "HIRAGANA", 12352, 12447]);
	groups.push(["SYL", "KATAKANA", 12448, 12543]);
	groups.push(["SYL", "BOPOMOFO", 12544, 12591]);
	groups.push(["SYL", "HANGUL", 12592, 12687]);
	groups.push(["SYL", "KANBUN", 12688, 12703]);
	groups.push(["SYL", "BOPOMOFO", 12704, 12735]);
	groups.push(["SYL", "CJK", 12736, 12783]);
	groups.push(["SYL", "KATAKANA", 12784, 12799]);
	groups.push(["SYL", "CJK", 12800, 13055]);
	groups.push(["SYL", "CJK", 13056, 13311]);
	groups.push(["SYL", "IDEOGRAPHIC", 13312, 19893]);
	groups.push(["SYL", "YIJING", 19904, 19967]);
	groups.push(["SYL", "IDEOGRAPHIC", 19968, 40908]);
	groups.push(["SYL", "YI", 40960, 42127]);
	groups.push(["SYL", "YI", 42128, 42191]);
	groups.push(["SYM", "LISU", 42192, 42239]);
	groups.push(["SYL", "VAI", 42240, 42559]);
	groups.push(["ABC", "CYRILLIC", 42560, 42655]);
	groups.push(["SYL", "BAMUM", 42656, 42751]);
	groups.push(["SYM", "TONE_LETTERS", 42752, 42783]);
	groups.push(["ABC", "LATIN_EXT_D", 42784, 43007]);
	groups.push(["ABU", "SYLOTI", 43008, 43055]);
	groups.push(["NUM", "INDIC_NUMBER", 43056, 43071]);
	groups.push(["ABU", "PHAGS_PA", 43072, 43135]);
	groups.push(["ABC", "SAURASHTRA", 43136, 43231]);
	groups.push(["ABU", "DEVANAGARI", 43232, 43263]);
	groups.push(["ABU", "KAYAH", 43264, 43311]);
	groups.push(["ABU", "REJANG", 43312, 43359]);
	groups.push(["ABC", "HANGUL", 43360, 43391]);
	groups.push(["ABU", "JAVANESE", 43392, 43487]);
	groups.push(["SYM", "MYANMAR", 43488, 43519]);
	groups.push(["ABU", "CHAM", 43520, 43615]);
	groups.push(["ABU", "MYANMAR", 43616, 43647]);
	groups.push(["ABU", "TAI", 43648, 43743]);
	groups.push(["ABU", "MEETEI", 43744, 43775]);
	groups.push(["ABU", "ETHIOPIC", 43776, 43823]);
	groups.push(["SYM", "LATIN_EXT", 43824, 43887]);
	groups.push(["SYM", "MEETEI", 43968, 44031]);
	groups.push(["ABC", "HANGUL", 44032, 55203]);
	groups.push(["SYM", "HANGUL", 55216, 55295]);
	groups.push(["SYM", "SURROGATES", 55296, 56191]);
	groups.push(["SYM", "SURROGATES", 56192, 56319]);
	groups.push(["SYM", "SURROGATES", 56320, 57343]);
	groups.push(["SYM", "USE_AREA", 57344, 63743]);
	groups.push(["SYM", "IDEOGRAPHIC", 63744, 64255]);
	groups.push(["SYM", "ALPHABETIC_FORMS", 64256, 64335]);
	groups.push(["SYM", "ARABIC", 64336, 65023]);
	groups.push(["SYM", "SELECTORS", 65024, 65039]);
	groups.push(["SYM", "VERTICAL_FORMS", 65040, 65055]);
	groups.push(["SYM", "HALF_MARKS", 65056, 65071]);
	groups.push(["SYM", "CJK", 65072, 65103]);
	groups.push(["SYM", "VARIANTS", 65104, 65135]);
	groups.push(["SYM", "ARABIC", 65136, 65279]);
	groups.push(["SYM", "HALFWIDTH_FULLWIDTH", 65280, 65519]);
	groups.push(["SYM", "SPECIALS", 65520, 65535]);
	groups.push(["SYM", "LINEAR_B", 65536, 65663]);
	groups.push(["SYM", "LINEAR_B", 65664, 65791]);
	groups.push(["SYM", "NUMBERS", 65792, 65855]);
	groups.push(["SYM", "NUMBERS", 65856, 65935]);
	groups.push(["SYM", "ANCIENT", 65936, 65999]);
	groups.push(["SYM", "PHAISTOS", 66000, 66047]);
	groups.push(["SYM", "LYCIAN", 66176, 66207]);
	groups.push(["SYM", "CARIAN", 66208, 66271]);
	groups.push(["SYM", "NUMBERS", 66272, 66303]);
	groups.push(["SYM", "ITALIC", 66304, 66351]);
	groups.push(["SYM", "GOTHIC", 66352, 66383]);
	groups.push(["SYM", "PERMIC", 66384, 66431]);
	groups.push(["SYM", "UGARITIC", 66432, 66463]);
	groups.push(["SYM", "PERSIAN", 66464, 66527]);
	groups.push(["SYM", "DESERET", 66560, 66639]);
	groups.push(["SYM", "SHAVIAN", 66640, 66687]);
	groups.push(["SYM", "OSMANYA", 66688, 66735]);
	groups.push(["SYM", "ELBASAN", 66816, 66863]);
	groups.push(["SYM", "ALBANIAN", 66864, 66927]);
	groups.push(["SYM", "LINEAR_A", 67072, 67455]);
	groups.push(["SYM", "CYPRIOT", 67584, 67647]);
	groups.push(["SYM", "ARAMAIC", 67648, 67679]);
	groups.push(["SYM", "PALMYRENE", 67680, 67711]);
	groups.push(["SYM", "NABATAEAN", 67712, 67759]);
	groups.push(["SYM", "PHOENICIAN", 67840, 67871]);
	groups.push(["SYM", "LYDIAN", 67872, 67903]);
	groups.push(["SYM", "MEROITIC", 67968, 67999]);
	groups.push(["SYM", "MEROITIC", 68000, 68095]);
	groups.push(["SYM", "KHAROSHTHI", 68096, 68191]);
	groups.push(["SYM", "ARABIAN", 68192, 68223]);
	groups.push(["SYM", "ARABIAN", 68224, 68255]);
	groups.push(["SYM", "MANICHAEAN", 68288, 68351]);
	groups.push(["SYM", "AVESTAN", 68352, 68415]);
	groups.push(["SYM", "PARTHIAN", 68416, 68447]);
	groups.push(["SYM", "PAHLAVI", 68448, 68479]);
	groups.push(["SYM", "PAHLAVI", 68480, 68527]);
	groups.push(["SYM", "TURKIC", 68608, 68687]);
	groups.push(["SYM", "RUMI", 69216, 69247]);
	groups.push(["SYM", "BRAHMI", 69632, 69759]);
	groups.push(["SYM", "KAITHI", 69760, 69839]);
	groups.push(["SYM", "SORA", 69840, 69887]);
	groups.push(["SYM", "CHAKMA", 69888, 69967]);
	groups.push(["SYM", "MAHAJANI", 69968, 70015]);
	groups.push(["SYM", "SHARADA", 70016, 70111]);
	groups.push(["SYM", "NUMBERS", 70112, 70143]);
	groups.push(["SYM", "KHOJKI", 70144, 70223]);
	groups.push(["SYM", "KHUDAWADI", 70320, 70399]);
	groups.push(["SYM", "GRANTHA", 70400, 70527]);
	groups.push(["SYM", "TIRHUTA", 70784, 70879]);
	groups.push(["SYM", "SIDDHAM", 71040, 71167]);
	groups.push(["SYM", "MODI", 71168, 71263]);
	groups.push(["SYM", "TAKRI", 71296, 71375]);
	groups.push(["SYM", "WARANG", 71840, 71935]);
	groups.push(["SYM", "PAU_CIN_HAU", 72384, 72447]);
	groups.push(["SYM", "CUNEIFORM", 73728, 74751]);
	groups.push(["SYM", "NUMBERS", 74752, 74879]);
	groups.push(["SYM", "EGYPTIAN", 77824, 78895]);
	groups.push(["SYM", "BAMUM", 92160, 92735]);
	groups.push(["SYM", "MRO", 92736, 92783]);
	groups.push(["SYM", "BASSA_VAH", 92880, 92927]);
	groups.push(["SYM", "PAHAWH_HMONG", 92928, 93071]);
	groups.push(["SYM", "MIAO", 93952, 94111]);
	groups.push(["SYM", "KANA", 110592, 110847]);
	groups.push(["SYM", "DUPLOYAN", 113664, 113823]);
	groups.push(["SYM", "SHORTHAND", 113824, 113839]);
	groups.push(["SYM", "MUSICAL", 118784, 119039]);
	groups.push(["SYM", "MUSICAL", 119040, 119295]);
	groups.push(["SYM", "MUSICAL", 119296, 119375]);
	groups.push(["SYM", "TAI", 119552, 119647]);
	groups.push(["SYM", "MATHEMATICAL", 119648, 119679]);
	groups.push(["SYM", "MATHEMATICAL", 119808, 120831]);
	groups.push(["SYM", "MENDE_KIKAKUI", 124928, 125151]);
	groups.push(["SYM", "MATHEMATICAL", 126464, 126719]);
	groups.push(["SYM", "MAHJONG", 126976, 127023]);
	groups.push(["SYM", "DOMINO", 127024, 127135]);
	groups.push(["SYM", "CARDS", 127136, 127231]);
	groups.push(["SYM", "ALPHANUMERIC", 127232, 127487]);
	groups.push(["SYM", "IDEOGRAPHIC", 127488, 127743]);
	groups.push(["SYM", "MISCELLANEOUS", 127744, 128511]);
	groups.push(["SYM", "EMOTICONS", 128512, 128591]);
	groups.push(["SYM", "DINGBATS", 128592, 128639]);
	groups.push(["SYM", "TRANSPORT_MAP", 128640, 128767]);
	groups.push(["SYM", "ALCHEMICAL", 128768, 128895]);
	groups.push(["SYM", "GEOMETRIC_SHAPES", 128896, 129023]);
	groups.push(["SYM", "ARROWS", 129024, 129279]);

	$.fn.chrinfo = function(string) {
		var ord = string.charCodeAt(0);
		for(var x in groups) {
			var range = groups[x];
			if(ord>=range[2] && ord<=range[3]) {
				var pad = "0000";
				var hex = ord.toString(16);
				hex = pad.substring(0, 4 - hex.length) + hex;
				hex = hex.toUpperCase();

				info				= {};
				info["char"]		= string;
				info["type"]		= range[0];
				info["group"]		= range[1];
				info["bytes"]		= string.length;
				info["decimal"]		= ord;
				info["hexadecimal"]	= hex;
				info["html"]		= "&#"+ord+";";
				info["escaped"]		= "\\u"+hex;
				
				return info;
			}
		}

		return false;
	};
}( jQuery ));
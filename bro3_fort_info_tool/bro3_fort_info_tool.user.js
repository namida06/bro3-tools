// ==UserScript==
// @name		bro3_fort_info_tool
// @namespace	https://gist.github.com/RAPT21/
// @description	ブラウザ三国志 砦包囲情報取得ツール by RAPT
// @include 	http://*.3gokushi.jp/map.php*
// @exclude		http://*.3gokushi.jp/maintenance*
// @require		http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @author		RAPT
// @version 	0.5
// ==/UserScript==
var VERSION = "0.5"; 	// バージョン情報

// 2015.08.10	0.1	プロトタイプ版です。
// 2015.08.11	0.2	処理結果を UI で表示対応。
//					5期砦一覧を埋めた。けど全部やるとガチでDoS攻撃になるので注意。
//					処理開始時に自同盟名を指定できるようにした。
// 2015.08.12	0.3	自同盟名の自動取得対応。
// 2016.03.11	0.4	メンテによる MAP 情報変更対応。
// 2016.03.12	0.5	探索砦をオプション化。OPT_TARGET_ZONE


// 探索砦
const var TARGET_ZONE_BUSHO = 0;		// 武将砦/城
const var TARGET_ZONE_NORTH_EAST = 1;	// 北東砦
const var TARGET_ZONE_NORTH_WEST = 2;	// 北西砦
const var TARGET_ZONE_SOUTH_EAST = 3;	// 南東砦
const var TARGET_ZONE_SOUTH_WEST = 4;	// 南西砦


//====================[ 設定ここから ]====================

// 探索対象砦をここで指定
var OPT_TARGET_ZONE = TARGET_ZONE_BUSHO;

// 自同盟名（指定すると主観的情報として、カラだと客観的情報として結果を出力）
var OPT_TARGET_ALLY = "";

//====================[ 設定ここまで ]====================



// 探索対象の座標[x,y]の配列
var GET_MAP_LIST_BUSHO = [
//==========[ 武将砦/城 ]==========
[0,0],
[-88,88],	[88,88],	[-88,-88],	[88,-88],
[-220,0],	[220,0],	[-220,220],	[0,220],
[220,220],	[-220,-220],	[0,-220],	[220,-220],
[418,418],	[-154,418],	[154,418],	[-418,418],
[418,154],	[-418,154],	[-418,-154],	[418,-154],
[-418,-418],	[-154,-418],	[154,-418],	[418,-418],
[-308,308],	[308,308],	[308,-308],	[-308,-308]
];

var GET_MAP_LIST_NPC_5ki_NE = [
//==========[ 北東砦 ]==========
[22,27],	[26,49],	[22,65],	[23,89],	[25,113],	[21,132],	[23,149],	[22,173],	[40,24],	[42,44],
[43,62],	[49,89],	[43,105],	[48,129],	[46,154],	[46,172],	[62,20],	[68,44],	[64,68],	[71,86],
[70,111],	[62,132],	[65,154],	[63,180],	[88,21],	[87,47],	[88,64],	[91,111],	[93,137],	[88,155],
[88,177],	[108,17],	[109,49],	[105,64],	[112,93],	[110,112],	[105,132],	[113,149],	[111,177],	[137,21],
[131,46],	[127,68],	[127,88],	[130,110],	[137,137],	[137,158],	[134,179],	[156,19],	[155,43],	[152,66],
[154,90],	[155,114],	[149,132],	[157,153],	[157,178],	[171,17],	[171,46],	[176,63],	[176,86],	[180,111],
[173,132],	[171,153],	[171,176],	[197,22],	[199,66],	[196,114],	[200,154],	[198,194],	[196,243],	[198,281],
[193,327],	[200,372],	[202,415],	[203,462],	[201,506],	[194,553],	[220,41],	[220,88],	[218,132],	[221,171],
[221,265],	[218,308],	[225,350],	[219,392],	[218,435],	[223,484],	[222,530],	[217,572],	[242,22],	[238,69],
[247,108],	[247,154],	[244,194],	[243,241],	[242,284],	[243,325],	[245,371],	[244,418],	[242,463],	[241,506],
[241,553],	[268,39],	[269,91],	[264,131],	[264,171],	[260,218],	[269,265],	[264,312],	[264,354],	[264,393],
[264,436],	[267,484],	[260,530],	[261,570],	[281,22],	[284,61],	[283,110],	[284,155],	[285,198],	[283,240],
[284,284],	[281,334],	[283,371],	[285,418],	[290,463],	[282,504],	[291,550],	[305,47],	[307,87],	[308,131],
[306,174],	[306,220],	[303,266],	[313,357],	[304,396],	[308,443],	[308,485],	[310,532],	[309,568],	[335,17],
[328,70],	[332,110],	[333,154],	[327,198],	[332,237],	[335,284],	[329,333],	[330,374],	[332,418],	[327,467],
[327,506],	[326,550],	[347,46],	[352,93],	[351,133],	[350,176],	[357,221],	[347,266],	[352,308],	[356,351],
[352,395],	[349,439],	[356,484],	[355,527],	[350,575],	[375,19],	[370,61],	[373,105],	[372,149],	[369,201],
[376,237],	[377,281],	[379,328],	[370,376],	[378,418],	[375,462],	[374,510],	[371,554],	[392,44],	[394,84],
[398,128],	[401,172],	[391,219],	[396,264],	[396,308],	[398,352],	[400,399],	[399,444],	[396,483],	[394,530],
[396,567],	[418,17],	[423,63],	[418,107],	[422,200],	[416,240],	[418,288],	[415,330],	[415,371],	[420,463],
[413,502],	[422,552],	[442,49],	[444,90],	[441,137],	[436,180],	[435,219],	[440,263],	[442,313],	[445,356],
[444,401],	[439,444],	[444,483],	[445,523],	[445,574],	[460,18],	[457,63],	[457,115],	[461,154],	[460,195],
[465,246],	[457,287],	[460,327],	[463,379],	[461,419],	[466,467],	[465,511],	[463,550],	[486,47],	[487,87],
[489,131],	[481,172],	[486,224],	[488,266],	[481,308],	[481,357],	[487,393],	[483,436],	[488,480],	[486,532],
[482,570],	[511,19],	[501,64],	[502,107],	[502,156],	[504,198],	[506,242],	[509,286],	[506,334],	[501,370],
[509,413],	[506,465],	[510,505],	[505,554],	[525,40],	[528,89],	[533,130],	[532,174],	[527,223],	[525,264],
[525,305],	[532,352],	[528,398],	[531,443],	[532,484],	[527,528],	[525,576],	[548,21],	[550,66],	[546,112],
[546,154],	[545,193],	[546,241],	[545,281],	[547,334],	[548,379],	[546,415],	[555,463],	[545,508],	[546,548],
[570,47],	[573,93],	[572,131],	[571,181],	[576,219],	[576,260],	[573,307],	[575,353],	[567,401],	[572,442],
[568,488],	[569,524],	[568,577],	[18,198],	[25,237],	[24,281],	[25,333],	[20,369],	[18,418],	[17,467],
[23,510],	[26,546],	[46,220],	[42,267],	[44,305],	[40,352],	[41,397],	[47,438],	[44,483],	[44,530],
[49,567],	[68,194],	[62,244],	[64,291],	[69,332],	[71,371],	[71,416],	[64,464],	[61,510],	[62,555],
[93,215],	[89,267],	[89,312],	[83,352],	[90,401],	[87,444],	[87,487],	[93,533],	[84,569],	[108,197],
[115,245],	[108,282],	[110,333],	[109,376],	[109,421],	[110,462],	[112,504],	[115,553],	[132,222],	[129,259],
[136,309],	[136,353],	[129,394],	[127,442],	[128,484],	[134,529],	[132,567],	[159,199],	[157,243],	[151,288],
[149,330],	[152,377],	[157,463],	[149,506],	[158,545],	[171,217],	[179,261],	[176,306],	[177,352],	[181,392],
[181,445],	[175,486],	[176,530],	[177,571],	[25,3],	[83,3],	[106,0],	[131,4],	[172,3],	[308,0],
[395,0],	[443,3],	[528,5],	[0,27],	[3,42],	[0,88],	[2,111],	[0,135],	[2,159],	[3,177],
[5,311],	[5,348],	[1,396],	[0,435],	[2,489],	[2,531],	[4,572]];

var GET_MAP_LIST_NPC_5ki_NW = [
//==========[ 北西砦 ]==========
[-22,19],	[-26,46],	[-27,67],	[-26,90],	[-23,106],	[-20,135],	[-22,153],	[-22,181],	[-45,26],	[-43,39],
[-41,70],	[-39,86],	[-44,107],	[-46,132],	[-40,150],	[-42,175],	[-66,23],	[-65,40],	[-66,67],	[-68,88],
[-61,111],	[-62,135],	[-65,152],	[-61,171],	[-84,27],	[-92,46],	[-87,68],	[-91,108],	[-88,135],	[-88,154],
[-90,180],	[-115,22],	[-108,41],	[-106,70],	[-115,88],	[-110,110],	[-114,135],	[-112,158],	[-107,176],	[-131,22],
[-137,46],	[-129,65],	[-130,84],	[-133,105],	[-136,127],	[-135,159],	[-135,174],	[-159,25],	[-152,49],	[-158,67],
[-150,85],	[-150,105],	[-157,128],	[-157,155],	[-158,172],	[-175,18],	[-176,39],	[-180,64],	[-171,87],	[-179,109],
[-172,128],	[-178,155],	[-176,171],	[-201,22],	[-201,66],	[-199,111],	[-201,150],	[-199,203],	[-199,237],	[-198,287],
[-195,331],	[-200,369],	[-193,423],	[-197,457],	[-200,506],	[-198,550],	[-223,43],	[-220,87],	[-223,132],	[-224,171],
[-221,269],	[-225,303],	[-222,353],	[-219,397],	[-222,436],	[-217,487],	[-219,523],	[-217,568],	[-247,18],	[-242,63],
[-245,108],	[-238,152],	[-242,197],	[-247,238],	[-246,287],	[-237,334],	[-239,371],	[-245,413],	[-246,457],	[-242,507],
[-237,555],	[-267,40],	[-264,83],	[-262,130],	[-266,173],	[-269,219],	[-266,261],	[-264,309],	[-265,355],	[-264,394],
[-260,440],	[-262,487],	[-267,525],	[-263,568],	[-282,17],	[-291,61],	[-286,112],	[-286,149],	[-291,197],	[-286,245],
[-283,286],	[-285,328],	[-281,376],	[-287,423],	[-288,460],	[-286,510],	[-289,550],	[-307,40],	[-312,85],	[-306,135],
[-312,178],	[-311,220],	[-307,267],	[-308,350],	[-309,393],	[-308,440],	[-308,484],	[-308,532],	[-304,572],	[-331,21],
[-328,71],	[-326,106],	[-331,157],	[-329,201],	[-326,244],	[-327,288],	[-331,328],	[-327,375],	[-332,422],	[-330,458],
[-327,507],	[-329,555],	[-354,47],	[-356,87],	[-354,134],	[-357,176],	[-357,215],	[-357,267],	[-356,305],	[-347,356],
[-354,393],	[-348,440],	[-352,484],	[-354,532],	[-351,576],	[-371,26],	[-374,68],	[-375,112],	[-370,159],	[-378,195],
[-379,241],	[-376,284],	[-379,329],	[-374,370],	[-369,423],	[-370,463],	[-374,505],	[-371,545],	[-394,45],	[-396,86],
[-395,136],	[-392,174],	[-394,215],	[-399,263],	[-394,311],	[-393,355],	[-393,396],	[-399,435],	[-396,484],	[-400,532],
[-395,572],	[-420,20],	[-423,67],	[-422,111],	[-420,194],	[-422,243],	[-415,282],	[-420,331],	[-421,378],	[-417,461],
[-423,503],	[-417,553],	[-444,39],	[-444,88],	[-436,128],	[-443,172],	[-445,218],	[-440,261],	[-444,310],	[-435,351],
[-436,399],	[-437,437],	[-439,482],	[-441,526],	[-438,568],	[-463,20],	[-462,70],	[-462,107],	[-467,154],	[-462,201],
[-457,238],	[-459,290],	[-457,335],	[-462,372],	[-465,413],	[-465,460],	[-463,507],	[-461,555],	[-484,46],	[-488,88],
[-480,136],	[-482,177],	[-489,223],	[-482,268],	[-482,313],	[-479,352],	[-486,395],	[-489,438],	[-484,483],	[-489,533],
[-483,570],	[-501,21],	[-510,66],	[-502,115],	[-504,150],	[-511,198],	[-502,242],	[-511,286],	[-502,327],	[-511,375],
[-506,417],	[-503,464],	[-511,506],	[-504,545],	[-528,43],	[-526,90],	[-526,134],	[-526,176],	[-523,220],	[-533,268],
[-525,304],	[-524,347],	[-525,400],	[-528,435],	[-523,481],	[-532,524],	[-531,572],	[-554,18],	[-555,61],	[-546,114],
[-554,149],	[-547,198],	[-546,238],	[-546,282],	[-549,329],	[-548,377],	[-549,423],	[-547,457],	[-549,511],	[-546,546],
[-570,47],	[-572,87],	[-574,134],	[-568,178],	[-571,220],	[-576,268],	[-575,311],	[-568,357],	[-577,391],	[-570,441],
[-571,483],	[-576,523],	[-575,577],	[-24,203],	[-22,237],	[-18,286],	[-21,325],	[-22,378],	[-26,423],	[-20,462],
[-27,510],	[-17,548],	[-40,217],	[-41,260],	[-42,307],	[-47,347],	[-43,397],	[-40,443],	[-48,489],	[-40,527],
[-49,569],	[-68,197],	[-70,243],	[-71,289],	[-63,329],	[-64,369],	[-64,422],	[-69,460],	[-68,511],	[-63,554],
[-90,221],	[-92,260],	[-85,306],	[-85,355],	[-88,401],	[-93,444],	[-91,488],	[-83,527],	[-87,573],	[-110,200],
[-113,240],	[-107,288],	[-111,334],	[-107,370],	[-111,416],	[-115,459],	[-106,506],	[-112,551],	[-136,216],	[-135,265],
[-129,312],	[-133,354],	[-132,399],	[-132,440],	[-136,484],	[-132,528],	[-132,568],	[-149,194],	[-153,242],	[-154,289],
[-150,327],	[-154,371],	[-154,466],	[-152,502],	[-157,547],	[-174,220],	[-171,268],	[-179,312],	[-180,354],	[-181,397],
[-176,440],	[-177,480],	[-178,530],	[-174,567],	[-22,5],	[-47,3],	[-66,1],	[-109,0],	[-135,0],	[-177,5],
[-267,2],	[-441,2],	[-483,2],	[-2,68],	[-2,267]];

var GET_MAP_LIST_NPC_5ki_SE = [
//==========[ 南東砦 ]==========
[25,-17],	[22,-43],	[23,-71],	[25,-88],	[17,-115],	[18,-127],	[22,-156],	[26,-180],	[41,-23],	[41,-39],
[42,-66],	[43,-88],	[48,-106],	[42,-128],	[41,-152],	[40,-178],	[69,-23],	[67,-42],	[68,-66],	[71,-88],
[67,-110],	[70,-137],	[70,-155],	[71,-177],	[83,-24],	[90,-44],	[83,-67],	[93,-113],	[88,-137],	[86,-150],
[83,-179],	[113,-18],	[106,-42],	[108,-66],	[107,-88],	[112,-110],	[110,-133],	[109,-149],	[115,-176],	[131,-22],
[129,-40],	[135,-66],	[133,-90],	[130,-106],	[132,-129],	[134,-157],	[133,-177],	[149,-26],	[154,-44],	[151,-63],
[158,-90],	[156,-106],	[154,-135],	[150,-153],	[152,-178],	[177,-19],	[173,-44],	[180,-64],	[172,-91],	[172,-105],
[173,-133],	[176,-155],	[173,-172],	[198,-18],	[195,-67],	[202,-115],	[196,-156],	[199,-199],	[202,-246],	[201,-281],
[201,-327],	[202,-372],	[198,-419],	[195,-460],	[200,-503],	[193,-554],	[220,-42],	[225,-89],	[220,-127],	[218,-177],
[224,-260],	[215,-307],	[217,-352],	[225,-398],	[220,-440],	[225,-480],	[222,-531],	[220,-577],	[237,-19],	[244,-66],
[246,-112],	[240,-154],	[246,-193],	[247,-242],	[237,-290],	[238,-327],	[247,-375],	[244,-418],	[237,-463],	[243,-511],
[247,-554],	[262,-39],	[267,-91],	[262,-132],	[265,-179],	[260,-221],	[259,-263],	[264,-303],	[260,-355],	[263,-392],
[265,-439],	[264,-488],	[264,-527],	[261,-577],	[281,-23],	[282,-63],	[287,-115],	[291,-154],	[286,-203],	[289,-245],
[289,-286],	[281,-327],	[284,-376],	[289,-421],	[286,-467],	[283,-504],	[283,-550],	[311,-39],	[306,-84],	[306,-137],
[303,-173],	[313,-221],	[309,-259],	[306,-347],	[312,-396],	[307,-441],	[312,-484],	[308,-528],	[313,-575],	[332,-25],
[334,-63],	[332,-109],	[332,-154],	[334,-201],	[330,-246],	[333,-291],	[334,-331],	[333,-374],	[329,-421],	[332,-463],
[325,-511],	[328,-546],	[354,-41],	[353,-88],	[351,-135],	[349,-176],	[355,-221],	[347,-268],	[357,-303],	[350,-353],
[357,-393],	[347,-445],	[349,-479],	[356,-530],	[348,-577],	[375,-25],	[375,-63],	[378,-114],	[373,-156],	[379,-197],
[376,-245],	[373,-290],	[374,-330],	[379,-373],	[374,-423],	[377,-457],	[371,-511],	[373,-555],	[398,-43],	[392,-87],
[391,-128],	[391,-175],	[393,-222],	[400,-261],	[396,-308],	[393,-353],	[396,-397],	[401,-439],	[393,-485],	[397,-530],
[399,-576],	[419,-19],	[418,-70],	[423,-112],	[414,-195],	[423,-244],	[422,-291],	[421,-330],	[413,-374],	[418,-462],
[416,-511],	[419,-550],	[437,-39],	[445,-93],	[441,-130],	[438,-172],	[436,-225],	[441,-269],	[440,-308],	[437,-352],
[437,-392],	[442,-440],	[436,-479],	[438,-523],	[437,-574],	[462,-21],	[458,-62],	[462,-109],	[457,-150],	[466,-201],
[459,-244],	[459,-281],	[462,-333],	[457,-375],	[467,-420],	[457,-466],	[458,-502],	[462,-546],	[487,-48],	[479,-89],
[485,-133],	[483,-177],	[482,-222],	[486,-264],	[484,-312],	[484,-349],	[486,-398],	[488,-445],	[484,-480],	[487,-525],
[481,-571],	[501,-26],	[508,-62],	[507,-109],	[506,-152],	[507,-197],	[504,-244],	[502,-290],	[510,-332],	[501,-377],
[510,-416],	[502,-462],	[503,-508],	[505,-553],	[533,-49],	[530,-88],	[528,-135],	[523,-173],	[529,-217],	[526,-265],
[531,-304],	[527,-357],	[525,-396],	[533,-442],	[532,-479],	[526,-524],	[527,-571],	[550,-26],	[546,-65],	[549,-112],
[553,-154],	[554,-198],	[554,-240],	[551,-283],	[550,-334],	[553,-374],	[551,-418],	[551,-462],	[546,-505],	[553,-551],
[572,-45],	[571,-84],	[568,-134],	[573,-175],	[572,-224],	[571,-269],	[569,-303],	[575,-354],	[573,-397],	[577,-440],
[568,-487],	[575,-527],	[568,-575],	[18,-198],	[19,-237],	[22,-290],	[21,-334],	[25,-372],	[22,-414],	[22,-466],
[26,-510],	[19,-550],	[48,-223],	[47,-259],	[46,-311],	[39,-347],	[46,-396],	[40,-438],	[45,-485],	[39,-527],
[49,-568],	[65,-198],	[68,-242],	[66,-286],	[70,-330],	[69,-377],	[68,-422],	[71,-462],	[70,-511],	[65,-547],
[86,-218],	[86,-267],	[92,-313],	[92,-349],	[92,-400],	[85,-438],	[92,-489],	[92,-530],	[84,-569],	[106,-197],
[107,-238],	[114,-284],	[108,-329],	[106,-374],	[115,-420],	[115,-466],	[108,-502],	[115,-555],	[129,-216],	[133,-264],
[129,-305],	[132,-348],	[130,-393],	[136,-442],	[136,-485],	[136,-528],	[132,-575],	[154,-198],	[151,-242],	[154,-291],
[158,-330],	[156,-376],	[155,-462],	[155,-510],	[150,-545],	[178,-220],	[179,-260],	[176,-307],	[173,-348],	[180,-398],
[181,-436],	[178,-484],	[179,-528],	[177,-570],	[42,-5],	[67,-5],	[158,-3],	[260,-4],	[347,-4],	[486,-1],
[567,-3],	[0,-19],	[0,-42],	[4,-89],	[2,-112],	[1,-154],	[0,-172],	[4,-306],	[1,-568]];

var GET_MAP_LIST_NPC_5ki_SW = [
//==========[ 南西砦 ]==========
[-20,-24],	[-21,-45],	[-27,-66],	[-19,-88],	[-19,-110],	[-20,-130],	[-20,-156],	[-20,-174],	[-47,-20],	[-45,-46],
[-49,-70],	[-44,-87],	[-41,-113],	[-42,-137],	[-41,-152],	[-43,-171],	[-66,-20],	[-64,-43],	[-64,-61],	[-61,-87],
[-64,-112],	[-63,-137],	[-68,-150],	[-71,-176],	[-85,-22],	[-93,-44],	[-85,-67],	[-83,-111],	[-92,-132],	[-85,-159],
[-86,-174],	[-109,-21],	[-114,-48],	[-107,-65],	[-111,-90],	[-114,-110],	[-112,-134],	[-113,-156],	[-109,-181],	[-128,-23],
[-131,-42],	[-133,-65],	[-127,-83],	[-132,-114],	[-137,-133],	[-132,-155],	[-133,-180],	[-157,-23],	[-149,-44],	[-156,-66],
[-149,-90],	[-150,-111],	[-159,-130],	[-150,-152],	[-154,-181],	[-181,-24],	[-175,-46],	[-181,-66],	[-174,-88],	[-175,-106],
[-172,-135],	[-178,-156],	[-176,-171],	[-198,-18],	[-202,-69],	[-200,-112],	[-197,-153],	[-198,-201],	[-193,-242],	[-195,-288],
[-193,-335],	[-201,-373],	[-199,-418],	[-195,-462],	[-198,-501],	[-194,-550],	[-222,-44],	[-220,-90],	[-221,-137],	[-218,-174],
[-216,-260],	[-215,-309],	[-220,-351],	[-225,-398],	[-222,-440],	[-225,-480],	[-222,-530],	[-218,-568],	[-245,-22],	[-245,-66],
[-239,-110],	[-239,-156],	[-247,-201],	[-242,-237],	[-240,-282],	[-242,-327],	[-245,-378],	[-238,-419],	[-245,-461],	[-239,-506],
[-247,-546],	[-261,-44],	[-262,-86],	[-265,-132],	[-261,-176],	[-264,-225],	[-261,-262],	[-259,-305],	[-268,-353],	[-261,-399],
[-266,-440],	[-263,-484],	[-268,-524],	[-267,-568],	[-287,-23],	[-291,-67],	[-282,-112],	[-286,-153],	[-291,-194],	[-286,-245],
[-281,-281],	[-283,-335],	[-283,-374],	[-281,-423],	[-291,-458],	[-290,-511],	[-288,-549],	[-311,-45],	[-303,-92],	[-313,-137],
[-311,-174],	[-308,-223],	[-308,-268],	[-312,-349],	[-313,-401],	[-306,-441],	[-305,-480],	[-309,-531],	[-306,-573],	[-332,-22],
[-330,-70],	[-327,-113],	[-335,-150],	[-331,-198],	[-330,-247],	[-335,-288],	[-325,-330],	[-330,-376],	[-326,-416],	[-327,-463],
[-331,-507],	[-332,-555],	[-349,-44],	[-356,-85],	[-357,-128],	[-351,-181],	[-349,-218],	[-349,-261],	[-350,-313],	[-351,-350],
[-349,-401],	[-355,-440],	[-353,-483],	[-349,-529],	[-352,-577],	[-374,-21],	[-376,-63],	[-374,-107],	[-371,-157],	[-378,-193],
[-370,-243],	[-373,-286],	[-369,-334],	[-375,-376],	[-369,-413],	[-369,-467],	[-374,-508],	[-371,-549],	[-391,-48],	[-395,-85],
[-401,-131],	[-394,-178],	[-393,-215],	[-393,-259],	[-391,-306],	[-393,-357],	[-395,-401],	[-396,-440],	[-393,-483],	[-400,-531],
[-395,-568],	[-418,-17],	[-417,-62],	[-416,-115],	[-415,-202],	[-413,-243],	[-413,-285],	[-418,-334],	[-413,-377],	[-418,-458],
[-422,-504],	[-419,-555],	[-441,-45],	[-442,-91],	[-445,-137],	[-436,-172],	[-440,-215],	[-436,-262],	[-440,-308],	[-442,-352],
[-438,-392],	[-440,-443],	[-441,-489],	[-436,-524],	[-435,-571],	[-462,-18],	[-462,-65],	[-465,-114],	[-457,-156],	[-466,-198],
[-457,-238],	[-463,-286],	[-457,-330],	[-467,-374],	[-458,-418],	[-461,-462],	[-464,-503],	[-462,-554],	[-486,-44],	[-481,-89],
[-486,-130],	[-487,-177],	[-487,-222],	[-482,-262],	[-482,-312],	[-481,-349],	[-484,-400],	[-482,-435],	[-480,-483],	[-484,-528],
[-483,-574],	[-501,-26],	[-506,-66],	[-502,-113],	[-503,-155],	[-502,-198],	[-505,-240],	[-508,-290],	[-503,-330],	[-502,-373],
[-508,-418],	[-506,-465],	[-507,-509],	[-509,-546],	[-525,-46],	[-528,-88],	[-523,-133],	[-531,-180],	[-529,-223],	[-533,-269],
[-528,-308],	[-533,-353],	[-523,-394],	[-528,-444],	[-528,-482],	[-533,-531],	[-523,-568],	[-554,-19],	[-549,-61],	[-551,-111],
[-545,-159],	[-552,-196],	[-545,-238],	[-546,-287],	[-547,-328],	[-550,-369],	[-547,-415],	[-553,-460],	[-554,-501],	[-555,-553],
[-574,-48],	[-569,-88],	[-575,-129],	[-568,-176],	[-573,-215],	[-570,-268],	[-573,-304],	[-568,-352],	[-575,-400],	[-571,-436],
[-575,-486],	[-574,-532],	[-577,-569],	[-23,-199],	[-25,-239],	[-26,-286],	[-26,-326],	[-21,-369],	[-27,-418],	[-22,-464],
[-17,-503],	[-20,-552],	[-46,-222],	[-44,-266],	[-42,-303],	[-40,-355],	[-46,-393],	[-39,-442],	[-45,-487],	[-41,-531],
[-45,-576],	[-71,-193],	[-66,-244],	[-63,-285],	[-62,-327],	[-71,-378],	[-71,-422],	[-68,-465],	[-70,-504],	[-64,-545],
[-88,-221],	[-85,-260],	[-93,-308],	[-87,-348],	[-85,-398],	[-85,-443],	[-87,-486],	[-90,-532],	[-93,-572],	[-112,-195],
[-108,-240],	[-110,-284],	[-111,-326],	[-110,-372],	[-107,-418],	[-108,-459],	[-115,-506],	[-109,-548],	[-127,-218],	[-132,-261],
[-137,-304],	[-136,-355],	[-137,-395],	[-136,-443],	[-129,-489],	[-128,-532],	[-134,-571],	[-153,-200],	[-159,-242],	[-156,-282],
[-156,-335],	[-151,-375],	[-149,-462],	[-152,-501],	[-150,-549],	[-173,-224],	[-181,-261],	[-177,-305],	[-175,-352],	[-176,-393],
[-179,-444],	[-171,-481],	[-180,-525],	[-180,-568],	[-85,-4],	[-158,-3],	[-307,-4],	[-351,-5],	[-398,-5],	[-527,-2],
[-573,-2],	[-5,-71],	[-2,-132],	[-3,-261],	[-3,-352],	[-4,-400],	[-1,-436],	[-1,-482],	[-4,-531]
];

// 探索座標の決定
var GET_MAP_LIST = GET_MAP_LIST_BUSHO;
if (OPT_TARGET_ZONE == TARGET_ZONE_BUSHO)		// 武将砦/城
	GET_MAP_LIST = GET_MAP_LIST_BUSHO;
if (OPT_TARGET_ZONE == TARGET_ZONE_NORTH_EAST)	// 北東砦
	GET_MAP_LIST = GET_MAP_LIST_NPC_5ki_NE;
if (OPT_TARGET_ZONE == TARGET_ZONE_NORTH_WEST)	// 北西砦
	GET_MAP_LIST = GET_MAP_LIST_NPC_5ki_NW;
if (OPT_TARGET_ZONE == TARGET_ZONE_SOUTH_EAST)	// 南東砦
	GET_MAP_LIST = GET_MAP_LIST_NPC_5ki_SE;
if (OPT_TARGET_ZONE == TARGET_ZONE_SOUTH_WEST)	// 南西砦
	GET_MAP_LIST = GET_MAP_LIST_NPC_5ki_SW;


/*!
* jQuery Cookie Plugin
* https://github.com/carhartl/jquery-cookie
*
* Copyright 2011, Klaus Hartl
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://www.opensource.org/licenses/mit-license.php
* http://www.opensource.org/licenses/GPL-2.0
*/
(function($) {
	$.cookie = function(key, value, options) {

		// key and possibly options given, get cookie...
		options = value || {};
		var decode = options.raw ? function(s) { return s; } : decodeURIComponent;

		var pairs = document.cookie.split('; ');
		for(var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
			if(decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
		}
		return null;
	};
})(jQuery);
jQuery.noConflict();
j$ = jQuery;

var HOST		= location.hostname;
var INTERVAL	= 500;

//==========[ ラッパー ]==========
function xpath(query,targetDoc) {
	return document.evaluate(query, targetDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
}

function cajaxRequest(url, method, param, func_success, func_fail){
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (req.readyState == 4 && req.status == 200){
			if (func_success) {
				func_success(req);
			}
		}
		else if (req.readyState == 4 && req.status != 200){
			if (func_fail) {
				func_fail(req);
			}
		}
	};

	req.open(method, url, true);
	if (method == 'POST'){
		req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	}
	req.send(param);
}

function createNewDocument(str) {
	return createHTMLDocumentByString(str);

	function createHTMLDocumentByString(str) {
		if (document.documentElement.nodeName != 'HTML') {
			return new DOMParser().parseFromString(str, 'application/xhtml+xml')
		}
		var html = strip_html_tag(str)
		var htmlDoc
		try {
			// We have to handle exceptions since Opera 9.6 throws
			// a NOT_SUPPORTED_ERR exception for |document.cloneNode(false)|
			// against the DOM 3 Core spec.
			htmlDoc = document.cloneNode(false)
			htmlDoc.appendChild(htmlDoc.importNode(document.documentElement, false))
		}
		catch(e) {
			htmlDoc = document.implementation.createDocument(null, 'html', null)
		}
		var fragment = createDocumentFragmentByString(html)
		try {
			fragment = htmlDoc.adoptNode(fragment)
		}
		catch(e) {
			fragment = htmlDoc.importNode(fragment, true)
		}
		htmlDoc.documentElement.appendChild(fragment)
		return htmlDoc
	}
	function strip_html_tag(str) {
		var chunks = str.split(/(<html(?:[ \t\r\n][^>]*)?>)/)
		if (chunks.length >= 3) {
			chunks.splice(0, 2)
		}
		str = chunks.join('')
		chunks = str.split(/(<\/html[ \t\r\n]*>)/)
		if (chunks.length >= 3) {
			chunks.splice(chunks.length - 2)
		}
		return chunks.join('')
	}
	function createDocumentFragmentByString(str) {
		var range = document.createRange()
		range.setStartAfter(document.body)
		return range.createContextualFragment(str)
	}
}

//==========[ ロジック部 ]==========
function getAllyName(callback){
	var url = "http://"+HOST+"/user/";
	cajaxRequest(url, 'GET', null, function(r){
		var html = r.responseText;
		var tmp = html.match(/<td[^>]*>同盟<\/td>[^<]*<td[^>]*>[^>]*><a href="[^"]*">([^<]+)<\/a>[^>]*<\/td>/);
		if (!tmp) {
			tmp = html.match(/<td[^>]*>同盟<\/td>[^<]*<td[^>]*>[^>]*<a href="[^"]*">([^<]+)<\/a>[^>]*<\/td>/);
		}
		var ally_name = tmp? tmp[1]: null;
		if (callback) {
			callback(ally_name);
		}
	});
}

// MAP データをオブジェクトとして返す
function genMapInfo(x,y,h,k,g,l,e,c,b,f,j,d,i,a,p){
	this.x = x; // center-x
	this.y = y; // center-y
	this.h = h; // 地名
	this.k = k; // 君主名
	this.g = g; // 人口-
	this.l = l; // 座標(x,y)
	this.e = e; // 同盟名
	this.c = c.length; // 戦力★
	this.b = b; // 距離
	this.f = f; // 森
	this.j = j; // 岩
	this.d = d; // 鉄
	this.i = i; // 糧
	this.a = parseInt(a,10); // NPCフラグ
	this.p = p; // 保護期間
	this.xy = l.replace(/^\((-?[0-9]+\,-?[0-9]+)\)$/, "$1");
}

// MAP データを取得
function getMap(ally, x, y, callback){
	if (!ally) ally = "";
	var url = "http://"+HOST+"/map.php?x=" + x + "&y=" + y + "&type=1";
	cajaxRequest(url, 'GET', null, function(r){
		var htmldoc = createNewDocument(r.responseText);

		var areas = htmldoc.evaluate('//*[@id="mapOverlayMap"]//area/@onmouseover',
			htmldoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

		//ターゲット座標を中心とした9マスのみを抜く
		var targets = [ [x-1,y-1], [x-1,y], [x-1,y+1], [x,y-1], [x,y], [x,y+1], [x+1,y-1], [x+1,y], [x+1,y+1] ];

		var neighbors=[];	// 隣接同盟名
		var capture='';		// 攻略済か
		var npc_name, npc_power;

		for (var p = 0; p < areas.snapshotLength; p++) {
			var rowText = areas.snapshotItem(p).textContent;
				rowText = rowText.replace(/^.*mapInfoView/, "genMapInfo");
				rowText = rowText.replace(/^.*rewrite/, "genMapInfo");
				rowText = rowText.replace(/\); .*$/, ");");
				rowText = rowText.replace(/^genMapInfo\(/, "var info = new genMapInfo("+x+","+y+",");
			eval(rowText);
			for (var z = 0; z < targets.length; z++){
				var q = targets[z][0]+","+targets[z][1];
				if (info.xy == q) {
					//ターゲット座標
					if (info.a == 1) {
						// NPC砦
						npc_name=info.h;
						npc_power=info.c;
						if (info.e != '-') {
							// 制圧同盟名を覚える
							capture = info.e;
						}
					} else {
						// 領地
						if (info.e != '') {
							// 隣接同盟を覚える
							neighbors.push(info.e);
						}
					}
					break;
				}
			}
		}

		// 隣接マス数を覚える
		var cell_count = neighbors.length;

		// 隣接同盟の重複を外す
		neighbors = neighbors.filter(function (x, i, self) {
			return self.indexOf(x) === i;
		});

		// 基礎情報
		var info=[];
		info.push(npc_name);//領地名
		info.push(x);
		info.push(y);
		info.push(npc_power);//★の数

		// 隣接状況
		var status = "";
		if (ally && ally.length) {
			if (capture.length) {
				// 制圧情報
				if (capture == ally) {
					status = "制圧";
				} else {
					status = "負け";
				}
			} else if (j$.inArray(ally, neighbors) == -1) {
				if (cell_count == 8) {
  				status = "隣接なし";
				} else {
  				status = "隣接空き"+(8-cell_count)+"マス";
				}
			} else {
				// 同盟隣接あり
				if (neighbors.length == 1) {
					if (cell_count == 8) {
						status = "完全包囲";
					} else {
						status = "隣接(残"+(8-cell_count)+"マス)";
					}
				}
				else if (neighbors.length >= 2) {
					status = "競合(空"+(8-cell_count)+"マス)";
				}
			}
		} else {
			if (capture.length) {
				// 制圧情報
				status = "攻略済("+capture+")";
			} else {
				if (neighbors.length == 1) {
					status = "未攻略(完全包囲)";
				} else {
					status = "未攻略(空"+(8-cell_count)+"マス)";
				}
			}
		}
		info.push(status);

		// 競合同盟
		info.push(neighbors.filter(function(x) { return x != ally; }).join(","));

		if (callback) {
			callback(info);
		}

	}, null);
}

//h:地名、k:君主名、g:人口-、l:座標(x,y)、e:同盟名、c:戦力★、b:距離、f:森、j:岩、d:鉄、i:糧、a:NPCフラグ
//'南東砦49', '南東守衛49', '-', '(152,-42)', '-', '★★★★', '5.83', '', '', '', '', '1'
//'許昌', '曹操', '-', '(0,0)', '-', '★★★★★★★★★', '161.77', '', '', '', '', '1'
//'南東砦57', 'キーテナイ', '-', '(176,-47)', 'WBＭ', '★', '20.62', '', '', '', '', '1'
//'新領地178,-46', 'ヴァルキリー', '-', '(178,-46)', 'WBＭ', '★', '22.14', '1', '0', '0', '0', ''
//'', '', '', '(175,-47)', '', '★', '19.7', '0', '1', '0', '0', ''

//==========[ UI 部 ]==========
var d = document;
var $ = function(id) { return d.getElementById(id); };
var $x = function(xp,dc) { return d.evaluate(xp, dc||d, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; };
var $a = function(xp,dc) { var r = d.evaluate(xp, dc||d, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); var a=[]; for(var i=0; i<r.snapshotLength; i++){ a.push(r.snapshotItem(i)); } return a; };
var $e = function(dc,e,f) { if (!dc) return; dc.addEventListener(e, f, false); };
function startXX(obj, ally_name){
	OPT_TARGET_ALLY = prompt("自同盟名を入力してください。\n空欄にすると客観的情報を出力します。",ally_name);
	if( confirm("全マップデータを一気に取得するためサーバに負荷がかかります。\n何度も実行するとDoS攻撃と同じなので、実行には注意して下さい") == false ) return;

	//窓作成
	var elm_xy = cgetElementXY( obj );
	var yy = elm_xy.y - 320;
	if( yy < 0 ) yy = 0;
	createCSVWindow(10, yy);

	var elm_msg = $("fort_csvWindow_message");
	if( !elm_msg ) return;
	var elm_csv = $("fort_csvWindow_csv");
	if( !elm_csv ) return;

	var index = 0;
	var item_count = GET_MAP_LIST.length;

	var csv_txt = ["地名","x","y","★","隣接状況","競合同盟"].join("\t")+"\n";
	window.setTimeout(timerFunc, 0);

	function timerFunc()
	{
		var item = GET_MAP_LIST[index];

		getMap(OPT_TARGET_ALLY, item[0], item[1], function(x){
			csv_txt += x.join("\t")+"\n";

			index++;
			elm_msg.innerHTML = "取得中... ( " + index + " / " + item_count + " )";
			if (index < item_count) {
				window.setTimeout(timerFunc, 0);
			} else {
				elm_msg.innerHTML += ".. 完了しました。CTRL + A → CTRL + Cでコピーし、Excelなどに貼りつけてください";
				elm_csv.value = csv_txt;
				elm_csv.focus();
			}
		});
	}
}
function createCSVWindow(x, y)
{
	var cc = $("fort_csvWindow");
	if( cc ) cc.parentNode.removeChild(cc);
	cc = d.createElement("div");
	cc.id = "fort_csvWindow";
	cc.style.left = x + "px";
	cc.style.top = y + "px";
	cc.style.position = "absolute";
	cc.style.backgroundColor = "lightgray";
	cc.style.border = "outset 2px lightgray";
	cc.style.fontSize = "12px";
	cc.style.padding = "15px";
	cc.style.zIndex = 2000;

	cc.style.padding = "10px";
	var dv = d.createElement("div");
		dv.id = "fort_csvWindow_message";
	cc.appendChild(dv);
	var tx = d.createElement("textarea");
		tx.id = "fort_csvWindow_csv";
		tx.rows = 25;
		tx.cols = 140;
		tx.style.overflow = "scroll";
	cc.appendChild(tx);

	cc.appendChild(d.createElement("br") );
	ccreateButton(cc, "閉じる", "", function(){
		var cc = $("fort_csvWindow");
		if( cc ) cc.parentNode.removeChild(cc);
	});

	$("fort_floatpanel").appendChild(cc);
}
function ccreateButton(container, text, title, func)
{
	var btn = d.createElement("input");
		btn.style.padding = "1px";
		btn.type = "button";
		btn.value = text;
		btn.title = title;
	container.appendChild(d.createTextNode(" "));
	container.appendChild(btn);
	container.appendChild(d.createTextNode(" "));
	$e(btn, "click", func);
	return btn;
}
function cgetElementXY(elm) {
	if( !elm ) return null;

	var xx = 0;
	var yy = 0;
	while(elm){
		xx += elm.offsetLeft;
		yy += elm.offsetTop;
		elm = elm.offsetParent;
	}
	return {"x":xx, "y":yy};
}

//==========[ 処理開始 ]==========
(function(){
	// 結果表示用 UI 作成
	var whiteWrapper = $("whiteWrapper");
	if (!whiteWrapper) return;
	var floatpanel = d.createElement("div");
		floatpanel.id = "fort_floatpanel";
	whiteWrapper.appendChild(floatpanel);

	// 処理開始用リンク作成
	var openLink = d.createElement("a");
		openLink.id = "Fort_Info_Tool";
		openLink.href = "javascript:void(0);";
		openLink.style.marginTop = "0px";
		openLink.style.marginLeft = "0px";
		openLink.innerHTML = " [砦包囲情報]";
		openLink.style.font = "10px 'ＭＳ ゴシック'";
		openLink.style.color = "#FFFFFF";
		openLink.style.cursor = "pointer";
		openLink.addEventListener("click", function() {
			if (OPT_TARGET_ALLY && OPT_TARGET_ALLY.length) {
					startXX(this, OPT_TARGET_ALLY);
			} else {
				getAllyName(function(ally_name){
					startXX(this, ally_name);
				});
			}
		}, true);
	var sidebar_list = xpath('//*[@class="sideBox"]', d);
	if (sidebar_list.snapshotLength) {
		sidebar_list.snapshotItem(0).appendChild(openLink);
	}
})();

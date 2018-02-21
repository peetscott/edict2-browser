/**
 * Requires edict.js
 */

Edict.index =
	{  // hira ..
	あ: 0, い: 0, う: 0, え: 0, お: 0,
	か: 0, き: 0, く: 0, け: 0, こ: 0,
	さ: 0, し: 0, す: 0, せ: 0, そ: 0,
	た: 0, ち: 0, つ: 0, て: 0, と: 0,
	な: 0, に: 0, ぬ: 0, ね: 0, の: 0,
	は: 0, ひ: 0, ふ: 0, へ: 0, ほ: 0,
	ま: 0, み: 0, む: 0, め: 0, も: 0,
	や: 0, ゆ: 0, よ: 0,
	ら: 0, り: 0, る: 0, れ: 0, ろ: 0,
	わ: 0,  // kata ..
	ア: 0, イ: 0, ウ: 0, エ: 0, オ: 0,
	カ: 0, キ: 0, ク: 0, ケ: 0, コ: 0,
	サ: 0, シ: 0, ス: 0, セ: 0, ソ: 0,
	タ: 0, チ: 0, ツ: 0, テ: 0, ト: 0,
	ナ: 0, ニ: 0, ヌ: 0, ネ: 0, ノ: 0,
	ハ: 0, ヒ: 0, フ: 0, ヘ: 0, ホ: 0,
	マ: 0, ミ: 0, ム: 0, メ: 0, モ: 0,
	ヤ: 0, ユ: 0, ヨ: 0,
	ラ: 0, リ: 0, ル: 0, レ: 0, ロ: 0,
	ワ: 0
  };

Edict.makeIndex = function ()  {
  var i = 0;
  var chDict = "";  // "" != -a-   a -> 0
  for (var chIndex in Edict.index)  {
  	  while (chDict != chIndex)  {
  	  	  chDict = Edict.entries[i][1].charAt(0);
  	  	  if (chDict == "")  {  // No reading. Use entry.
  	  	    chDict = Edict.entries[i][0].charAt(0);
  	  	  }
  	  	  i++;
  	  }
  	  Edict.index[chIndex] = i - 1;
  }
}

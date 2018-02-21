/**
 * Requires edict.js, edict_sort.js, edict_index.js
 *
 */

/**
 * Finds the best matches for the reading in str.
 *
 * @param str {String} A hiragana or katakana reading to search
 * for.
 * @return {Array} An array of integers. Edict entries that -best-
 * match the search string.
 */
Edict.match = function (str)  {
  var p;                         // p is low. character
  for (var q in Edict.index)  {  // q is high. character
    // This loop finds the the two properties in the index
    // that define the high (q) and low (p) indecies of the range
    // to search in Edict.entries.
    if (q > str.charAt(0))  {
      break;
    }
    p = q;
  }
  var matches = [];
  var low = Edict.index[p];       // array index
  var high = Edict.index[q] - 1;  // array index
  // str.charAt(0) >= KATAKANA -wa-
  if (p == "\u30ef")  {
    high = Edict.entries.length - 1;
  }

  var mid = null;  // array index
  var i = 0;  // string index
  var start = 1;
  var end = 0;
  while (i < str.length && low <= high)  {
    mid = Math.floor((high + low) / 2);
    var charStr = str.charAt(i);
    // Reading is in either Edict.entries[i][1] or Edict.entries[i][0].
    var reading = Edict.entries[mid][1] == "" ? 0 : 1;
    var charEdict = Edict.entries[mid][reading].charAt(i);
    if (charStr < charEdict)  {
      high = mid - 1;
    }
    else if (charStr > charEdict)  {
      low = mid + 1;
    }
    else  {
      start = mid;
      while (start >= low + 1)  {
        reading = Edict.entries[start - 1][1] == "" ? 0 : 1;
        charEdict = Edict.entries[start - 1][reading].charAt(i);
        if (charStr == charEdict)  {
          start--;
        }
        else  {
          break;
        }
      }
      end = mid;
      while (end <= high - 1)  {
        reading = Edict.entries[end + 1][1] == "" ? 0 : 1;
        charEdict = Edict.entries[end + 1][reading].charAt(i);
        if (charStr == charEdict)  {
          end++;
        }
        else  {
          break;
        }
      }
      low = start;
      high = end;
      i++;
    }
  }
  while (start <= end)  {
    matches.push(start);
    start++;
  }
  return matches;
}

/**
 * Searches the dictionary by entry (kanji).
 *
 * @param str {String}  A dictionary entry.
 * @return  {array}  An array of integers.
 * The entries that -best- match the search string.
 */
Edict.findEntry = function (str)  {
  var chars = str.split("");
  var best = 0;
  var bestMatches = [];  // return array. May be empty.
  for (var i = 0; i < Edict.entries.length; i++)  {
    var j = 0;
    var matchLength = 0;
    while (j < chars.length
        && j < Edict.entries[i][0].length
        && chars[j] == Edict.entries[i][0].charAt(j))  {
      matchLength++;
      j++;
    }
    if (matchLength == 0)  {
      continue;
    }
    if (matchLength == best)  {
      bestMatches.push(i);
    }
    else if (matchLength > best)  {
      bestMatches = [i];
      best = matchLength;
    }
  }
  return bestMatches;
}

/**
 * Search entries with wildcards.
 * Use _ to match any single character.
 * Use * to match any number of characters.
 *
 * @param str {String} An entry to search for.
 * @raturn {Array} An array of integers.
 * Edict entries that -best- match the search string.
 */
Edict.findEntryRE = function (str)  {
  var matches = [];
  var entries = Edict.entries;
  var len = Edict.entries.length;
  var re = new RegExp("^" + str + "$");
  for (var i = 0; i < len; i++)  {
    if (re.test(entries[i][0]) == true)  {
      matches.push(i);
    }
  }
  return matches;
}

Edict.search = function (str)  {

  if (ui.IME.isKana(str))  {
    return Edict.match(str);
  }
  var re = str.replace(/\*/g, ".*");
  re = re.replace(/_/g, ".");
  if (re != str)  {
    return Edict.findEntryRE(re);
  }
  return Edict.findEntry(str);
}

/**
 * Strips everything except the primary spelling/reading from a field.
 *
 * @param {String} Either the kanji or reading field of an entry.
 * @return {String} Returns everything up to the first '(' or ';'.
 */
Edict.primary = function (str) {
  var cut = str.indexOf(";");
  if (cut >= 0) {
    str = str.substr(0, cut);
  }
  cut = str.indexOf("(");
  if (cut >= 0) {
    str = str.substr(0, cut);
  }
  return str;
};
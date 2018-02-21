/** Requires util.js
 */

/**
 * Compacts an array of integers into a string of chars, and back.
 * The string representation uses a fixed number of characters for
 * each integer in the array.
 * zzzz = 1679615
 * NumStr(2, 4): [1, 2, 4] -> "000100100100"
 *
 * @param base {integer} A number between 2 ans 36. The base
 * of the numbers in the string representation.
 * @param width {integer} The number of characters used to
 * encode each integer.
 */
util.NumStr = function (base, width)  {
  if (base < 2 || base > 36)
    throw new RangeError("base must be between 2 and 36.");
  if ( !(typeof(width) == "number")
     || (width < 1 || width > 64))
   throw new RangeError("width must be between 1 and 64.");
  this._base = base;
  this._width = width;
}

/**
 * NumStr uses a fixed number of characters to encode the
 * members of an integer array. You -may- want to use as
 * few characters as possible (for space savings). This
 * function will tell you the minimum number of characters
 * you need to successfully encode the array.
 *
 * @param integers {Array} An array of integers.
 * @param base {integer} A number between 2 and 36.
 * @return {integer} The minimum number of characters
 * required to encode each of the integers in the array.
 */
util.NumStr.maxWidth = function (integers, base)  {
  var max = 0;
  for (var i = 0; i < integers.length; i++)  {
    try  {
      var width = integers[i].toString(base).length;
      if (width > max) max = width;
    }
    catch (e)  {
      return 0;
    }
  }
  return max;
}

/**
 * Transforms an array of integers into a string of characters.
 * The base and width (passed to the constructor) determine
 * the 'characteristics' of the string. It will be
 * width x array.length characters long.
 * It is an error if a member of the array cannot be encoded
 * with width characters.
 *
 * @param integers {Array} An array of integers.
 * @return {String} The string representation of the array,
 * or an empty string if there was an error.
 */
util.NumStr.prototype.arrayToString = function (integers)  {
  var s = "";
  if (!(integers instanceof Array)) return s;
  for (var i = 0; i < integers.length; i++)  {
    if (typeof(integers[i]) != "number") return ""; // Invalid
    var tmp = integers[i].toString(this._base);
    // Is the number too 'wide' for this encoding? ..
    // Skip it, or abandon? ..
    if (tmp.length > this._width) return "";
    // Padding ..
    while (tmp.length < this._width)  {
      tmp = "0" + tmp;
    }
    s += tmp
  }
  return s;
}

/**
 * Decodes a string (produced by this.arrayToString()) into
 * an array of integers.
 8
 * @param str {String} A string encoded by an equivalent
 * NumStr object.
 * @return {Array} An array of integers, or an empty array
 * if there was an error decoding any part of the string.
 */
util.NumStr.prototype.stringToArray = function (str)  {
  var a = [];
  try  {
    while (str.length > 0) {
      var tmp = str.substr(0, this._width);
      if (tmp.length < this._width) return [];  // Malformed string.
      var n = parseInt(tmp, this._base);
      a.push(n);
      str = str.slice(this._width, str.length);
    }
  }
  catch (e)  {
    return [];
  }
  return a;
}

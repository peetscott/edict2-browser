/* Requires util.js, numstr.js, window.localStorage
 */

/**
 * IntStorage maintains a list of integers that are saved in
 * the browser's localStorage object (if available). The
 * Storage object holds properties of the form
 * localStorage["name"] = "value".
 * IntStorage uses fixed-width base-36 numbers. So the array
 * [100, 200, 300] would be saved as "2s5k8c".
 * The IntStorage constructor retrieves the string value from
 * localStorage and decodes it. If localStorage[name] does not
 * exist, or if localStorage is disabled the initial list wiil
 * be empty.
 *
 * @param name {String} The name used by the Storage object.
 * @param max_int {integer} The maximum value that will be
 * stored in the list
 */
util.IntStorage = function (name, max_int)  {
  if (name == null) throw new Error("IntStorage() needs a name.");
  this._name = name;
  this._width = util.NumStr.maxWidth([max_int], 36)
  try  {
    var decoder =
      new util.NumStr(36, this._width);
    var str = window.localStorage[name];
    this._values = decoder.stringToArray(str);
  }
  catch (ex)  {
    this._values = [];
  }
}

/**
 * Adds a number to the list and attempts to update the
 * localStorage object. If num is larger than max_int
 * (passed to the constructor), then the update to
 * localStorage MAY fail, in which case the name property
 * will be an empty string.
 *
 * @param num {integer} The number to add to the list.
 */
util.IntStorage.prototype.add = function (num)  {
  if (!(typeof(num) == "number"))
    throw new Error("ListInt.add: entry must be a number.");
  // Do not allow duplicates?
  //if (this._values.indexOf(num) > -1) return;
  this._values.push(num);
  this._store();
}

/**
 *
 * @param num {integer} The value to be removed from the list.
 */
util.IntStorage.prototype.remove = function (num)  {
  var i = this._values.indexOf(num);
  if (i < 0) return;
  this._values.splice(i, 1);
  this._store();
}

/**
 * Empties the list.
 */
util.IntStorage.prototype.clear = function ()  {
  this._values = [];
  this._store();
}

/**
 * @return {String} A copy of the internal list of integers.
 *
 */
util.IntStorage.prototype.values = function ()  {
  return this._values.map(function (n) { return n; });
}

/**
 * Attempts to transform the list of integers into a string
 * and save it in localStorage[name].
 *
 * @return {String} The string representation of the list,
 * or "" if there was an error.
 */
util.IntStorage.prototype._store = function ()  {
  try  {
    var str;
    var encoder = new util.NumStr(36, this._width);
    str =  encoder.arrayToString(this._values);
    window.localStorage[this._name] = str;
  }
  catch (ex)  {
    str = "";  // flag
  }
  finally  {
    return str;
  }
}

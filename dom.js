var dom = { };

/**
 *
 */
dom.addClass = function (element, name)  {
  var classes = element.className || "";
  element.className = appendClassName(classes, name);

  // -----------------------------------
  function appendClassName(str, name)  {
    // Precaution. Remove space chars.
    name = name.replace(" ", "");
    // Guard against empty string "", which splits into [""].
    var classes = str.length > 0 ? str.split(" ") : [];
    for (var i = 0; i < classes.length; i++)  {
      if (classes[i] == name)  {
        break;
      }
    }
    if (i == classes.length)  {
      if (i > 0)  {
        name = " " + name;
      }
      return str + name;
    }
    return str;  // Class name already exists.
  }
};

/**
 *
 */
dom.removeClass = function (element, name)  {
  var classes = element.className || "";
  element.className = removeClassName(classes, name);
  
  // ----------------------------------
  function removeClassName(str, name)  {
    name = name.replace(" ", "");
    var classes = str.split(" ");
    for (var i = 0; i < classes.length; i++)  {
      if (name == classes[i])  {
        classes.splice(i, 1);
      }
    }
    return classes.join(" ");
  }
};

/**
 * Swap off for on.
 */
dom.toggleClass = function (element, on, off)  {
  var classes = element.className.split(" ");
  for (var i = 0; i < classes.length; i++)  {
    if (off == classes[i])  {
      classes.splice(i, 1, on);
    }
  }
  element.className = classes.join(" ");
};

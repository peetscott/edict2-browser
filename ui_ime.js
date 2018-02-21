/**
 * Requires: edict.js, edict_sort.js, edict_index.js, edict_match.js,
 * ui.js, ui_component.js, types.js, dom.js
 */

// TO DO: enable, disable

/**
 * This is an input box that transliterates roman letters into
 * hiragana, katakana and romaji. It can also lookup entries in
 * EDICT and present a list of matches for the user to select from.
 * By default only hiragana is generated. In order to switch between
 * hiragana, katakana and romaji the user must supply an object to
 * setInputTypeControl() which which has a function getInputType().
 * getInputType() should return one of
 * ui.IME.INPUT_TYPE =  {
 *   KATAKANA: 0,
 *   HIRAGANA: 1,
 *   ROMAJI: 2,    // Full width roman letters
 *   NONE: 3       // Transliteration off
 * };
 * To use Edict:
 * 1. Load edict.js, edict_sort.js, edict_index.js
 * 2. Call Edict.entries.sort(Edict.sortByReading);
 * 3. Call Edict.makeIndex();
 *
 * @param config {Object} Has the following properties.
 * container {HTMLElement} The location in the document where the
 *           IME will be placed.
 * styles {Object} Overrides the default styles of the IME.
 *        Have not found a need for this yet.
 * tabIndex {integer} The tab index of the IME input box.
 */
ui.IME = function (config)  {
  config = config ? config : { };
  ui.IME.properties.init(this, config);
  ui.IME.structure.init(this, config);
  ui.IME.styler.init(this, config);
  ui.IME.controller.init(this, config);
}

types.baseType(ui.Component, ui.IME);

// control must implement getInputType() -> {0, 1, 2, 3}
// This is optional. If not set, default (hiragana) will be used.
ui.IME.prototype.setInputTypeControl = function (control)  {
  if (!(control && control.getInputType instanceof Function))  {
    throw new Error("ui.IME.setInputTypeControl(): control must implement getInputType()." )
  }
  this.inputTypeControl = control;
};

ui.IME.prototype.show = function ()  {
  this.dispatchEvent(this.createEvent("show"));
};

ui.IME.prototype.hide = function ()  {
  this.dispatchEvent(this.createEvent("hide"));
};

/**
 * @return {String} The text in the input box.
 */
ui.IME.prototype.getText = function ()  {
  return this.input_box.value;
};

/**
 * Deletes the text in the input box.
 */
ui.IME.prototype.clearText = function ()  {
  this.input_box.value = "";
};

/**
 * Generate an "activate" event. Usually, this indicates that the
 * text in the input box is ready. For what is up to the user to
 * decide. Add a listener to respond to this event.
 */
ui.IME.prototype.activate = function ()  {
  this.dispatchEvent(this.createEvent("activate"));
};

ui.IME.prototype.openAssist = function ()  {
  var str = this.input_box.value;
  this.matches = Edict.match(str);
  this.dispatchEvent(this.createEvent("openassist"));
};

ui.IME.prototype.closeAssist = function ()  {
  this.dispatchEvent(this.createEvent("closeassist"));
};


ui.IME.properties =  {
  init: function (instance, config)  {
    ui.Component.properties.init(instance, config);
    instance.container = config.container ? config.container : document.body;
    instance.styles = config.styles ? config.styles : ui.IME.styler.css_classes;
    //instance.disabled = false; // Not implemented yet.
    instance.tabIndex = config.tabIndex ? config.tabIndex : -1;
    instance.setInputTypeControl(ui.IME);  // This is a default fallback.
    /* instance.matches is an array of integers. Entry numbers from
     * Edict.entries that match or partially match the reading in
     * the input box. instance.openAssist() sets this property.
     * ui.IME.structure.openAssist() uses it to build the assist pane.
     * May ? be useful elsewhere.
     */

    /*
    instance.setInputTypeControl(
      {
        getInputType: function () { return ui.IME.INPUT_TYPE.HIRAGANA; }
      }
    );
    */
    // instance.matches = [];  // Necessary ?? Used by openAssist(). Set by oninputkeyup().
  }
};

ui.IME.structure =  {
  init: function (instance, config)  {
    instance.input_box = document.createElement("INPUT");
    instance.input_box.type = "text";
    instance.input_box.size = "30";
    instance.input_box.maxlength = "40"; // Does this work??
    instance.input_box.tabIndex = instance.tabIndex;
    instance.assist_window = document.createElement("DIV");
    // This allows the event handler to close the window on ESC ..
    // Use a class here instead ..
    instance.assist_window.setAttribute("id", "ui-ime-assist");
  },

  // Allow for document, relative, absolute posiitoning ??
  show: function (instance, config)  {
    instance.container.appendChild(instance.input_box);
  },

  hide: function (instance, config)  {
    instance.container.removeChild(instance.input_box);
  },

  openAssist: function (instance, config)  {
    ui.IME.structure.clearAssist(instance, config); // Empty contents of window
    for (var i = 0; i < instance.matches.length; i++)  {
      var div = document.createElement("DIV");
      div.tabIndex = instance.tabIndex;
      div.appendChild(document.createTextNode(Edict.entries[instance.matches[i]][0]));
      div.entry = instance.matches[i];
      instance.assist_window.appendChild(div);
    }
    if (i > 0)  {
      instance.container.appendChild(instance.assist_window);
      instance.assist_window.firstChild.focus();
    }
  },

  closeAssist: function (instance, config)  {
    ui.IME.structure.clearAssist(instance, config);
    try  {
      instance.container.removeChild(instance.assist_window);
      instance.input_box.focus();
    }
    catch (e)  {
      // ..
    }
  },

  clearAssist: function (instance, config)  {
    var div = instance.assist_window;
    while (div.hasChildNodes())  {
      div.removeChild(div.firstChild);
    }
  }
};

ui.IME.styler =  {
  init: function (instance, config)  {
    // This is done differently elsewhere. Attached to instance. ??
    //ui.IME.prototype.styles = ui.IME.styler.css_classes; // CHECK THIS!
    // Need this??
    //instance.container.style.position = "relative";
    dom.addClass(instance.assist_window, instance.styles.assist);
  },

  css_classes:  {
    inputbox: "ui-ime-inputbox",
    assist: "ui-ime-assist"
  }
};

ui.IME.controller =  {
  init: function (instance, config)  {
    instance.input_box.ui =  {
      component: instance
    };
    instance.assist_window.ui =  {
      component: instance
    };
    // May not need this ..
    instance.esc = function (event)  {
      if (event.keyCode == 0x1b)  {
        //instance.closeAssist();
        ui.IME.structure.closeAssist(instance);
      }
    };
    // instance.matches = []; // ?? Used by openAssist()
    instance.addListener("show", ui.IME.controller.onshow);
    instance.addListener("hide", ui.IME.controller.onhide);
    instance.addListener("openassist", ui.IME.controller.onopenassist);
    instance.addListener("closeassist", ui.IME.controller.oncloseassist);
    instance.input_box.addEventListener("keyup", ui.IME.controller.oninputkeyup);
  },

  // Change to onkeyup
  oninputkeyup: function (event)  {
    var ch = event.keyCode;
    var str = event.target.value;
    //var str;
    var instance = event.target.ui.component;
    switch (ch)  {
      case 0x20 :  // 'space'
        // Remove trailing space character ...
        str = event.target.value = str.substr(0, str.length - 1);
        // TO DO: Edict may not be available. Disable the assist window ..
        //instance.matches = Edict.match(str);
        // ..
        // This may not belong here ..
        //instance.dispatchEvent(instance.createEvent("openassist"));
        instance.openAssist();
        break;
      case 0x0d :  // 'enter'
        instance.activate();
        break;
      default :
        var inputType = instance.inputTypeControl.getInputType();
        switch (inputType)  {
          case ui.IME.INPUT_TYPE.KATAKANA :
          case ui.IME.INPUT_TYPE.HIRAGANA :
            str = ui.IME.romanToKana(str, inputType);
            break;
          case ui.IME.INPUT_TYPE.ROMAJI :
            str = ui.IME.romanToRomaji(str);
            break;
          case ui.IME.INPUT_TYPE.NONE :
            return;  // Do not reset value of input box.
        }
        event.target.value = str;
        break;
    }
  },

  onbodykeyup: function (event)  {
    if (event.keyCode == 0x1b)  {  // ESC
      // This needs to be changed. Don't use id here ..
      var element = document.getElementById("ui-ime-assist");
      if (element)  {
        var instance = element.ui.component;
        // Should call instance.closeAssist();
        //instance.dispatchEvent(instance.createEvent("closeassist"));
        instance.closeAssist();
      }
    }
  },

  onopenassist: function (event)  {
    var instance = event.ui.component;
    document.body.addEventListener("keyup", ui.IME.controller.onbodykeyup, true);
    instance.assist_window.addEventListener("keyup", ui.IME.controller.onassistkeyup);
    instance.assist_window.addEventListener("click", ui.IME.controller.onassistclick);
    ui.IME.structure.openAssist(instance);

  },

  oncloseassist: function (event)  {
    var instance = event.ui.component;

    // Clear instance.matches?? No. May be useful.

    document.body.removeEventListener("keyup", ui.IME.controller.onbodykeyup, true);
    instance.assist_window.removeEventListener("keyup", ui.IME.controller.onassistkeyup);
    instance.assist_window.removeEventListener("click", ui.IME.controller.onassistclick);
    ui.IME.structure.closeAssist(instance);
  },

  onassistkeyup: function (event)  {
    if (event.keyCode == 0x20 || event.keyCode == 0x0d)  {  // 'space' || 'enter'
      ui.IME.controller.onassistclick(event);
    }
  },

  onassistclick: function (event)  {
    var instance = event.currentTarget.ui.component;
    if (event.target.entry)  {
      var e;
      instance.input_box.value = event.target.innerHTML;
      e = instance.createEvent("assist");
      e.ui.assist = {
        text: event.target.innerHTML,
        entry: event.target.entry
      };
      //instance.dispatchEvent("assist", instance.createEvent("assist"));
      // Not sure this is correct ..
      instance.dispatchEvent(e);
      // Could be ..
      // instance.
      //  assist({ text: event.target.innerHTML, entry: event.target.entry });
    }
  },

  onshow: function (event)  {
    ui.IME.structure.show(event.ui.component);
  },

  onhide: function (event)  {
    ui.IME.structure.hide(event.ui.component);
  },

  events:  [
    "activate",
    "assist",
    "openassist",
    "closeassist",
    "show",
    "hide"
  ]
};




ui.IME.INPUT_TYPE =  {
  KATAKANA: 0,
  HIRAGANA: 1,
  ROMAJI: 2,    // Full width roman letters
  NONE: 3       // Transliteration off
};

/**
 * The default input type. hiragana ..
 * setInputTypeControl() allows this to be overridden.
 * getInputType() should return one of the above values.
 *
 */
ui.IME.getInputType = function ()  {
  return ui.IME.INPUT_TYPE.HIRAGANA;
};

ui.IME.romanToKana = function (str, inputType)  {

  var buffer = new String("");  // Return string.
  var ch;                     // Current char.
//  var chBuff = new Array(3);  // Save chars while looking ahead.
  var state = 0;
  var i = 0;                  // str index.
  var j = 0;                  // chBuff index.
  //var komoji = false;         // flag. character is 'lower case'
  var unicodeA;

  if (inputType == ui.IME.INPUT_TYPE.HIRAGANA)  {
    unicodeA = 12354;  // 0x3042
  }
  else  {  // katakana -A-
    unicodeA = 12450;  // 0x30a2
  }

  while (i < str.length) {
    j = i; // Save this index.
           // On error, ignore this char and try parsing from next index.
    while (state < 140 && i < str.length)  {  // 140 == kana:A
      ch = str.charAt(i).toLowerCase();
      if ((ch.charCodeAt(0) - 97) < 0 || (ch.charCodeAt(0) - 97) > 25)  {
        state = 258;  // ch not in range 'a' - 'z'
      }
      else  {
        state = ui.IME.state_table[state][ch.charCodeAt(0) - 97];
      }
      i++;
    }
    if (state == 258)  { // Error/Ignore/Escape/Special state
      // Either an invalid character sequence, already transliterated, special char or escape char.
      // Try parsing from the next position in str.
      // Just copy one char directly to the result.

      ch = ui.IME.isSpecialChar(str.charCodeAt(j));
      if (ch > 0)  {
        buffer += String.fromCharCode(ch);
      }
      else if (str.charCodeAt(j) == 0x5c && j < str.length - 1)  { // '\' escape
        //i = j + 1;
        ch = "\\";
        ++j;
        // TO DO: \u30FB KATAKANA MIDDLE DOT
        switch (str.charCodeAt(j))  {
        case 0x6b :  // 'k'
          //ch = "";
          //++j;
          ch += str.charAt(j);  // ch == "\k"
          ++j;
          state = 0;
          while (state < 140 && j < str.length)  {
            state = ui.IME.state_table[state][str.charCodeAt(j) - 97];
            ch += str.charAt(j);
            ++j;
          }
          switch (state)  {  // Only these states have 'small' forms.
          case 140 :
          case 142 :
          case 144 :
          case 146 :
          case 148 :
          case 206 :
          case 208 :
          case 210 :
          case 217 :
            ch = String.fromCharCode((state - 1 - 140) +  unicodeA);
            break;
          }
          break;
        case 0x75 :  // 'u'
          ch += str.charAt(j);  // ch == "\u"
          ++j;
          var k = 0;
          var decimal = 0;

          while (j < str.length && k < 4)  {
            if (((str.charCodeAt(j) >= 0x30) && (str.charCodeAt(j) <= 0x39)))  {
              // digit
              decimal = decimal * 16 + (str.charCodeAt(j) - 0x30);
            }
            else if (((str.charCodeAt(j) >= 0x61) && (str.charCodeAt(j) <= 0x66)))  {
              // lower case
              decimal = decimal * 16 + (str.charCodeAt(j) - 0x57);  // '0x0a' == 10dec
            }
            else if (((str.charCodeAt(j) >= 0x41) && (str.charCodeAt(j) <= 0x46)))  {
              // upper case
              decimal = decimal * 16 + (str.charCodeAt(j) - 0x37);
            }
            else  {
              // malformed hex value. abandon
              break;
            }
            ++k;
            ch += str.charAt(j);
            ++j;
          }
          if (k == 4)  {
            ch = String.fromCharCode(decimal);
          }
          break;
        case 0x2e  :  // '.'
          j++;
          ch = String.fromCharCode(0x30fb);  // KATAKANA MIDDLE DOT
          break;
        default :
          break;
        }
        // j is either beyond end of string or points to next char.
        // Because i is set to j + 1 below, reset j.
        --j;
        buffer += ch;
      }
      else  {
        buffer += str.charAt(j);
      }
      i = j + 1;
    }
    else if (state < 140)  {     // Intermediate state.
      while (j < i)  {           // Only get here if the string ends before completing
        buffer += str.charAt(j); // a syllable.
        j++;
      }
    }
    else  {  // Final state.
      // State -A- == 140
      if (state < 222)  {
        buffer += String.fromCharCode((state - 140) +  unicodeA);
      }
      else if (state < 258)  {
        // States > 221 -KYA- require two character sequence.
        // -KYA- becomes -KI- + -YA-
        j = ui.IME.conversion_table[Math.floor((state - 222) / 3)];
        buffer += String.fromCharCode((j - 140) +  unicodeA);
        j = (state - 222) % 3;
        switch(j)  { // -YA- -YU- -YO-
        case 0 :
          state = 205;
          break;
        case 1 :
          state = 207;
          break;
        case 2 :
          state = 209;
          break;
        }
        buffer += String.fromCharCode((state - 140) +  unicodeA);
      }
      else  {  // Special Cases: state > 258  -V-  Directly encoded as 12532 (0x30f4).
        buffer += String.fromCharCode(state);
      }
    }
    state = 0;
  }
  return buffer;
};


ui.IME.isSpecialChar = function (ch)  {
  var unicode;
  switch (ch)  {
  case 0x2d :          // '-'
    unicode = 0x30fc;
    break;
  case 0x2c :          // ','
    unicode = 0x3001;
    break;
  case 0x2e :          // '.'
    unicode = 0x3002;
    break;
  case 0x5b :          // '['
    unicode = 0x300c;
    break;
  case 0x5d :           // ']'
    unicode = 0x300d;
    break;
  case 0x20 :           // ' '
    unicode = 0x3000;
    break;
  case 0x30 :           // '0' ... '9'
  case 0x31 :
  case 0x32 :
  case 0x33 :
  case 0x34 :
  case 0x35 :
  case 0x36 :
  case 0x37 :
  case 0x38 :
  case 0x39 :  // 0xFF10 Full-Width Zero
    unicode = 0xff10 + (ch - 0x30);
    break;
  default :
    unicode = 0;
    break;
  }
  return unicode;
};

ui.IME.isKana = function (str)  {
  // 0x3041 (12353) small hiragana 'a'
  // 0x30fc (12540) kana prolonged sound mark
  var allKana = true;
  for (var i = 0; i < str.length; i++)  {
    var ch = str.charCodeAt(i);
    if (ch < 12353 || ch > 12540)  {
      allKana = false;
      break;
    }
  }
  return allKana;
};

ui.IME.romanToRomaji = function (str)  {
  // ! 0x21 (33)  -> 0xff01 (65128)
  // ~ 0x7e (126) -> 0xff5e (65374)
  var buffer = new String();
  for (var i in str)  {
    var code = str[i].charCodeAt(0);
    if (code < 33 || code > 126)  { // ! ... ~
      // Just copy directly (ignore).
      buffer += String.fromCharCode(code);
    }
    else  {
      code -= 33;    // ! 0x21
      code += 65281; // ! 0xff01
      buffer += String.fromCharCode(code);
    }
  }
  return buffer;
};


ui.IME.state_table = new Array(31);

ui.IME.state_table[0] = new Array(  // START
//    0,   1,   2,   3,    4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,    21,  22,  23,  24,  25
    140,  12,   7,   8,  146,  11,   2,  10, 142,   4,   1, 258,  14,   9, 148,  13, 258,  16,   3,   6, 144, 12532,  17, 258,  15,   5
);
ui.IME.state_table[1] = new Array(  // K
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    149, 258, 258, 258, 155, 258, 258, 258, 151, 258, 173, 258, 258, 258, 157, 258, 258, 258, 258, 258, 153, 258, 258, 258,  18, 258
);
ui.IME.state_table[2] = new Array(  // G
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    150, 258, 258, 258, 156, 258, 173, 258, 152, 258, 258, 258, 258, 258, 158, 258, 258, 258, 258, 258, 154, 258, 258, 258,  19, 258
);
ui.IME.state_table[3] = new Array(  // S
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    159, 258, 258, 258, 165, 258, 258,  20, 161, 258, 258, 258, 258, 258, 167, 258, 258, 258, 173, 258, 163, 258, 258, 258, 258, 258
);
ui.IME.state_table[4] = new Array(  // J
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    231, 258, 258, 258, 258, 258, 258, 258, 162, 173, 258, 258, 258, 258, 233, 258, 258, 258, 258, 258, 232, 258, 258, 258,  21, 258
);
ui.IME.state_table[5] = new Array(  // Z
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    160, 258, 258, 258, 166, 258, 258, 258, 162, 258, 258, 258, 258, 258, 168, 258, 258, 258, 258, 258, 164, 258, 258, 258, 258, 173
);
ui.IME.state_table[6] = new Array(  // T
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    169, 258, 258, 258, 176, 258, 258, 258, 171, 258, 258, 258, 258, 258, 178, 258, 258, 258, 23, 173, 174, 258, 258, 258, 258, 258
);
ui.IME.state_table[7] = new Array(  // C
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    258, 258, 173, 258, 258, 258, 258,  22, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258
);
ui.IME.state_table[8] = new Array(  // D
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    170, 258, 258, 173, 177, 258, 258, 258, 172, 258, 258, 258, 258, 258, 179, 258, 258, 258, 258, 258, 175, 258, 258, 258,  24, 258
);
ui.IME.state_table[9] = new Array(  // N
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    180, 258, 258, 258, 183, 258, 258, 258, 181, 258, 258, 258, 258, 221, 184, 258, 258, 258, 258, 258, 182, 258, 258, 258,  25, 258
);
ui.IME.state_table[10] = new Array(  // H
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    185, 258, 258, 258, 194, 258, 258, 173, 188, 258, 258, 258, 258, 258, 197, 258, 258, 258, 258, 258, 191, 258, 258, 258,  26, 258
);
ui.IME.state_table[11] = new Array(  // F
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    258, 258, 258, 258, 258, 173, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 191, 258, 258, 258, 258, 258
);
ui.IME.state_table[12] = new Array(  // B
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    186, 173, 258, 258, 195, 258, 258, 258, 189, 258, 258, 258, 258, 258, 198, 258, 258, 258, 258, 258, 192, 258, 258, 258,  27, 258
);
ui.IME.state_table[13] = new Array(  // P
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    187, 258, 258, 258, 196, 258, 258, 258, 190, 258, 258, 258, 258, 258, 199, 173, 258, 258, 258, 258, 193, 258, 258, 258,  28, 258
);
ui.IME.state_table[14] = new Array(  // M
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    200, 258, 258, 258, 203, 258, 258, 258, 201, 258, 258, 258, 173, 258, 204, 258, 258, 258, 258, 258, 202, 258, 258, 258,  29, 258
);
ui.IME.state_table[15] = new Array(  // Y
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    206, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 210, 258, 258, 258, 258, 258, 208, 258, 258, 258, 173, 258
);
ui.IME.state_table[16] = new Array(  // R
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    211, 258, 258, 258, 214, 258, 258, 258, 212, 258, 258, 258, 258, 258, 215, 258, 258, 173, 258, 258, 213, 258, 258, 258,  30, 258
);
ui.IME.state_table[17] = new Array(  // W
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    217, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 220, 258, 258, 258, 258, 258, 258, 258, 173, 258, 258, 258
);
ui.IME.state_table[18] = new Array(  // KY
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    222, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 224, 258, 258, 258, 258, 258, 223, 258, 258, 258, 258, 258
);
ui.IME.state_table[19] = new Array(  // GY
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    225, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 227, 258, 258, 258, 258, 258, 226, 258, 258, 258, 258, 258
);
ui.IME.state_table[20] = new Array(  // SH
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    228, 258, 258, 258, 258, 258, 258, 258, 161, 258, 258, 258, 258, 258, 230, 258, 258, 258, 258, 258, 229, 258, 258, 258, 258, 258
);
ui.IME.state_table[21] = new Array(  // JY
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    231, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 233, 258, 258, 258, 258, 258, 232, 258, 258, 258, 258, 258
);
ui.IME.state_table[22] = new Array(  // CH
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    234, 258, 258, 258, 258, 258, 258, 258, 171, 258, 258, 258, 258, 258, 236, 258, 258, 258, 258, 258, 235, 258, 258, 258, 258, 258
);
ui.IME.state_table[23] = new Array(  // TS
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 233, 258, 258, 258, 258, 258, 174, 258, 258, 258, 258, 258
);
ui.IME.state_table[24] = new Array(  // DY
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    237, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 239, 258, 258, 258, 258, 258, 238, 258, 258, 258, 258, 258
);
ui.IME.state_table[25] = new Array(  // NY
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    240, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 242, 258, 258, 258, 258, 258, 241, 258, 258, 258, 258, 258
);
ui.IME.state_table[26] = new Array(  // HY
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    243, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 245, 258, 258, 258, 258, 258, 244, 258, 258, 258, 258, 258
);
ui.IME.state_table[27] = new Array(  // BY
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    246, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 248, 258, 258, 258, 258, 258, 247, 258, 258, 258, 258, 258
);
ui.IME.state_table[28] = new Array(  // PY
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    249, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 251, 258, 258, 258, 258, 258, 250, 258, 258, 258, 258, 258
);
ui.IME.state_table[29] = new Array(  // MY
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    252, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 254, 258, 258, 258, 258, 258, 253, 258, 258, 258, 258, 258
);
ui.IME.state_table[30] = new Array(  // RY
//    0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25
    255, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 258, 257, 258, 258, 258, 258, 258, 256, 258, 258, 258, 258, 258
);


ui.IME.conversion_table = new Array(
    // KI,  GI, SHI,  JI, CHI,  DI,  NI,  HI,  BI,  PI,  MI,  RI
      151, 152, 161, 162, 171, 172, 181, 188, 189, 190, 201, 212
);

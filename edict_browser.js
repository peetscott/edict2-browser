/**
 * Requires edict.js, edict_sort.js, edict_index.js, edict_match.js,
 * ui.js, ui_component.js, ui_button.js, ui_toggle_button.js,
 * ui_button_group.js, ui_ime.js, eb_page.js, types.js, dom.js,
 * util.js, int_storage.js
 *
 */

/**
 * Expects to find #edict_browser, #eb_toolbar and #eb_page in the
 * document. This may change. The containers may be passed
 * to the constructor.
 * For now only a single instance should exist in a document.
 * The instance is saved in the property EdictBrowser.app. May
 * change in the future.
 *
 * @param config {Object} Not used at this time.
 */
function EdictBrowser(config)  {
  config = config ? config : { };
  // Not sure this is a good way to make the instance
  // available to event handlers ..
  EdictBrowser.app = this;
  // May attach app to the container/toolbar/page??

  EdictBrowser.properties.init(this, config);
  EdictBrowser.structure.init(this, config);
  EdictBrowser.styler.init(this, config);
  EdictBrowser.controller.init(this, config);
}

types.baseType(ui.Component, EdictBrowser);

/**
 * Bookmarks an entry in the dictionary.
 *
 * @param num {integer} An integer between 0 and
 * Edict.entries.length - 1.
 */
EdictBrowser.prototype.setBookmark = function (num)  {
  EdictBrowser.properties.setBookmark(this, { num: num });
  var event = this.createEvent("bookmark");
  event.entry_number = num;
  this.dispatchEvent(event);
};

/**
 * Removes a bookmark.
 *
 * @param num {integer} An integer between 0 and
 * Edict.entries.length - 1.
 */
EdictBrowser.prototype.removeBookmark = function (num)  {
  EdictBrowser.properties.removeBookmark(this, { num: num });
};

/**
 * Displays the next page.
 */
EdictBrowser.prototype.nextPage = function ()  {
  this.page.pageForward();
};

/**
 * Displays the previous page.
 */
EdictBrowser.prototype.previousPage = function ()  {
  this.page.pageBackward();
};

/**
 * Go to a particular entry number.
 *
 * @param, num {integer} An integer between 0 and
 * Edict.entries.length - 1.
 */
EdictBrowser.prototype.browse = function (num)  {
  num = num ? num : 0;
  this.page.goTo(num);
};

/**
 * Show the bookmarks pane.
 */
EdictBrowser.prototype.showBookmarks = function ()  {
  this.dispatchEvent(this.createEvent("showbookmarks"));
};

/**
 * Hide the bookmarks pane.
 */
EdictBrowser.prototype.hideBookmarks = function ()  {
  this.dispatchEvent(this.createEvent("hidebookmarks"));
};

/*******************************************************************/

EdictBrowser.properties = {
  init: function (instance, config)  {
    ui.Component.properties.init(instance, config);
    // Move this to Component.styler? ..
    instance.styles = config.styles ? config.styles : EdictBrowser.styler.css_classes;
    // "zzzz" = 1679615. Edict.entries.length < 250000.
    instance.bookmarks = new util.IntStorage("ebBookmarks", 1000000);
  },

  setBookmark: function (instance, config)  {
    var vals = instance.bookmarks.values();
    var num = config.num;
    if (vals.indexOf(num) > -1) return;
    instance.bookmarks.add(num);
  },

  removeBookmark: function (instance, config)  {
    instance.bookmarks.remove(config.num);
  }
};

/**
 *
 */
EdictBrowser.structure = {
  init: function (instance, config)  {
    var element;
    var container;
    //var component;
    instance.toolbar = { };
    container = document.createElement("DIV");
    //container.setAttribute("id", "eb_toolbar_div");
    instance.toolbar_div = container;
    instance.toolbar.prev_button =
      new ui.Button(
        { container: container,
          label: "Previous",
          tabIndex: 1
        }
      );
    instance.toolbar.prev_button.show();
    instance.toolbar.next_button =
      new ui.Button(
        { container: container,
          label: "Next",
          tabIndex: 2
        }
      );
    instance.toolbar.next_button.show();
    // This holds the input box and assist window ..
    var div = document.createElement("DIV");
    instance.toolbar.ime_div = div;
    container.appendChild(div);
    instance.toolbar.ime =
      new ui.IME(
        { container: div,
          tabIndex: 3
        }
      );
    instance.toolbar.ime.show();
    var bg = new ui.ButtonGroup();
    bg.getInputType = function ()  {
      return bg.checked.value;
    };
    instance.toolbar.ime.setInputTypeControl(bg);
    instance.toolbar.hira_button =
      new ui.ToggleButton(
        { container: container,
          label: "дв",
          value: ui.IME.INPUT_TYPE.HIRAGANA,
          checked: true,
          group: bg,
          tabIndex: 4
        }
      );
    instance.toolbar.hira_button.show();
    instance.toolbar.kata_button =
      new ui.ToggleButton(
        { container: container,
          label: "ев",
          value: ui.IME.INPUT_TYPE.KATAKANA,
          checked: false,
          group: bg,
          tabIndex: 5
        }
      );
    instance.toolbar.kata_button.show();

    div = document.createElement("DIV");
    instance.toolbar.bookmarks_div = div;
    container.appendChild(div);
    instance.toolbar.bookmarks_button =
      new ui.Button(
        { container: div,
          label: "Bookmarks",
          tabIndex: 6
        }
      );
    instance.toolbar.bookmarks_button.show();
    div = document.createElement("DIV");
    instance.toolbar.bookmarks_list = div;

    container = instance.toolbar_div;
    div = document.createElement("DIV");
    // This may become a class ..
    div.setAttribute("id", "eb_toolbar_status_div");
    instance.toolbar.status_div = div;
    container.appendChild(div);

    container = document.getElementById("eb_page");
    instance.page = new Page({ container: container });
    div = document.createElement("DIV");
    // This may become a class ..
    div.setAttribute("id", "eb_mag_div");
    instance.mag_div = div;
    document.body.appendChild(div);
  },

  showToolbar: function (instance, config)  {
    document.getElementById("eb_toolbar").appendChild(instance.toolbar_div);
  },

  hideToolbar: function (instance, config)  {
    document.getElementById("eb_toolbar").removeChild(instance.toolbar_div);
  },

  showPage: function (instance, config)  {
    instance.page.show();
  },

  hidePage: function (instance, config)  {
    instance.page.hide();
  },

  moveMagnifier: function (instance, config)  {
    EdictBrowser.styler.moveMagnifier(instance, config);
  },

  showMagnifier: function (instance, config)  {
    EdictBrowser.styler.showMagnifier(instance, config);
  },

  hideMagnifier: function (instance, config)  {
    EdictBrowser.styler.hideMagnifier(instance, config);
  },

  showBookmarks: function (instance, config)  {
    var parent = instance.toolbar.bookmarks_list;
    var bookmarks = instance.bookmarks.values();
    var tab = instance.toolbar.bookmarks_button.tabIndex + 1;
    if (parent.hasChildNodes())  {
      return;
    }
    if (bookmarks.length == 0)  {
      var element = document.createElement("DIV");
      element.tabIndex = instance.toolbar.bookmarks_button.tabIndex + 1;;
      element.textContent = "No Bookmarks";
      parent.appendChild(element);
    }
    else  {
      var row = document.createElement("DIV");
      var element = document.createElement("INPUT");
      element.type = "checkbox";
      element.id = "markall_bookmarks"
      element.tabIndex = tab;
      row.appendChild(element)
      element = document.createElement("SPAN");
      element.tabIndex = instance.toolbar.bookmarks_button.tabIndex + 1;
      element.textContent = "Remove Bookmark";
      row.appendChild(element)
      parent.appendChild(row);
      parent.appendChild(document.createElement("HR"));
      for (var i = 0; i < bookmarks.length; ++i)  {
        row = document.createElement("DIV");
        element = document.createElement("INPUT");
        element.type = "checkbox";
        element.tabIndex = tab;
        row.appendChild(element)
        element = document.createElement("SPAN");
        element.tabIndex = tab;
        element.textContent = Edict.entries[bookmarks[i]][0];
        element.value = bookmarks[i];
        row.appendChild(element);
        parent.appendChild(row);
      }
    }
    instance.toolbar.bookmarks_div.appendChild(parent);
    parent.firstChild.focus();
  },

  hideBookmarks: function (instance, config)  {
    instance.toolbar.bookmarks_list.innerHTML = "";
    if (instance.toolbar.bookmarks_div.children.length > 1)  {
      instance.toolbar.bookmarks_div.removeChild(instance.toolbar.bookmarks_list);
    }
  },

  writeStatus: function (instance, config)  {
    instance.toolbar.status_div.textContent = config.msg;
  }
};

EdictBrowser.styler = {
  init: function (instance, config)  {
    dom.addClass(instance.toolbar_div, instance.styles.toolbar);
    dom.addClass(instance.toolbar.ime_div, instance.styles.toolbar_ime);
    dom.addClass(instance.toolbar.bookmarks_div, instance.styles.toolbar_bookmarks);
    dom.addClass(instance.toolbar.bookmarks_list, instance.styles.toolbar_bookmarks_list);
  },

  moveMagnifier: function (instance, config)  {
    instance.mag_div.style.top = config.y + "px";
    instance.mag_div.style.left = config.x + "px";
  },

  showMagnifier: function (instance, config)  {
    instance.mag_div.style.display = "block";
  },

  hideMagnifier: function (instance, config)  {
    instance.mag_div.style.display = "none";
  },

  css_classes: {
    edict_browser: "edict-browser",
    toolbar: "eb-toolbar",
    toolbar_ime: "eb-toolbar-ime",
    toolbar_bookmarks: "eb-toolbar-bookmarks",
    toolbar_bookmarks_list: "eb-toolbar-bookmarks-list",
    page: "eb-page"
  }
};

EdictBrowser.controller = {
  init: function (instance, config)  {
    EdictBrowser.structure.showToolbar(instance, config);
    EdictBrowser.structure.showPage(instance, config);
    instance.toolbar.next_button.addListener("activate", EdictBrowser.controller.oncommand);
    instance.toolbar.prev_button.addListener("activate", EdictBrowser.controller.oncommand);
    instance.toolbar.ime.addListener("activate", EdictBrowser.controller.oncommand);
    instance.toolbar.ime.addListener("assist", EdictBrowser.controller.oncommand);
    instance.page.addListener("pageforward", EdictBrowser.controller.onpagechange);
    instance.page.addListener("pagebackward", EdictBrowser.controller.onpagechange);
    instance.addListener("bookmark", EdictBrowser.controller.onbookmark);
    instance.addListener("showbookmarks", EdictBrowser.controller.onshowbookmarks);
    instance.addListener("hidebookmarks", EdictBrowser.controller.onhidebookmarks);
    instance.toolbar.bookmarks_button.addListener("activate", EdictBrowser.controller.oncommand);

    var element = document.getElementById("eb_page");
    element.
      addEventListener(
        "mouseover",
        EdictBrowser.controller.onentrymouseover,
        true
      );
    element.
      addEventListener(
        "click",
        EdictBrowser.controller.onlineclick,
        true
      );
    element = instance.toolbar.bookmarks_list;
    element.
      addEventListener(
        "click",
        EdictBrowser.controller.onbookmarkselect,
        true
      );
    element.
      addEventListener(
        "keyup",
        EdictBrowser.controller.onbookmarkselect,
        true
      );
  },

  // DOM events ..

  onentrymouseover: function (event)  {
    if (event.target.className == "eb-page-entry")  {
      EdictBrowser.controller.scheduleMagnifier(
        EdictBrowser.app,
        { target: event.target,
          clientX: event.clientX,
          clientY: event.clientY
        }
      );
    }
  },

  onlineclick: function (event)  {
    var entry_number =
      EdictBrowser.controller.getEntryNoFromSpan(
        EdictBrowser.app,
        { target: event.target }
      );
    if (entry_number >= 0) {
      EdictBrowser.app.
        setBookmark(entry_number);
    }

    /*
    // Offset from page.first ..
    var line = 0;
    // Look for the DIV that holds the entire line (1) ..
    var target = event.target.parentElement;
    // eb-page-col
    //   div  (2)
    //     div (line) (1)
    //       span span ...
    //     div (line)
    // Abort if we click outside a SPAN (2) ..
    if (target.parentElement.className == "eb-page-col")  {
      return;
    }
    // #eb_page > .eb-page > .eb-page-col > div -> children
    var columns =
      [
        this.children[0].children[1].children[0].children,  // Left col
        this.children[0].children[2].children[0].children   // Right col
      ];
    for (var i = 0; i < 2; ++i)  {
      // Does the entry at the top of the right column
      // carry over from the bottom of the left column? ..
      if (i == 1)  {
        // Not section head && not a new entry ..
        if (columns[1][0].children.length > 0 &&
            columns[i][0].children[0].className != "eb-page-entry")  {
          --line;  // Do not double count the entry.
        }
      }
      for (var j = 0; j < columns[i].length; ++j)  {
        if (columns[i][j] == target)  {
          EdictBrowser.app.
            setBookmark(EdictBrowser.app.page.first + line);
          return;
        }
        // Do not count lines with section heading ..
        if (columns[i][j].className == "eb-page-sectionhead")  {
          continue;
        }
        ++line;
      }
    }
    */
  },

  onescapechar: function (event)  {
    if (event.keyCode == 0x1b)  {
      EdictBrowser.app.hideBookmarks();
      EdictBrowser.app.toolbar.bookmarks_button.focus();
    }
  },

  onbookmarkselect: function (event)  {
    if (event.target.type == "checkbox")  {
      if (event.target.id == "markall_bookmarks")  {
        var checked = event.target.checked;
        var container = EdictBrowser.app.toolbar.bookmarks_list;
        for (var i = 2; i < container.children.length; ++i)  {
          container.children[i].children[0].checked = checked;
        }
      }
      return;
    }
    if (event.type == "keyup" &&
        !(event.keyCode == 0x20 ||event.keyCode == 0x0d))  {
      return;
    }
    if (event.target.textContent == "Remove Bookmark")  {
      var container = EdictBrowser.app.toolbar.bookmarks_list;
      for (var i = 2; i < container.children.length; ++i)  {
        if (container.children[i].children[0].checked == true)  {
          EdictBrowser.app.removeBookmark(container.children[i].children[1].value);
        }
      }
      EdictBrowser.app.hideBookmarks();
      return;
    }
    if (event.target.textContent == "No Bookmarks")  {
      EdictBrowser.app.hideBookmarks();
      return;
    }
    var value =
      event.target.value ?
      event.target.value :
      event.target.children[1].value;
    EdictBrowser.app.hideBookmarks();
    EdictBrowser.app.browse(value);
  },

  // Toolbar events ..
  oncommand: function (event)  {
    var component = event.ui.component;
    //var component = this;   // OK

    //var app = EdictBrowser.app;

    // Hide magnifier here ??
    EdictBrowser.structure.hideMagnifier(EdictBrowser.app, null);

    if (component == EdictBrowser.app.toolbar.next_button)  {
      EdictBrowser.app.page.pageForward();
    }
    else if (component == EdictBrowser.app.toolbar.prev_button)  {
      EdictBrowser.app.page.pageBackward();
    }
    else if (component == EdictBrowser.app.toolbar.ime)  {
      if (event.type == "activate")  {
        var matches = Edict.match(component.input_box.value);
        if (matches.length > 0)  {
          component.input_box.value = "";
          EdictBrowser.app.page.goTo(matches[0]);
        }
      }
      else if (event.type == "assist")  {
        component.closeAssist();
        component.clearText();
        EdictBrowser.app.page.goTo(event.ui.assist.entry);

      }
    }
    else if (component == EdictBrowser.app.toolbar.bookmarks_button)  {
      if (EdictBrowser.app.toolbar.bookmarks_div.children.length > 1)  {
        EdictBrowser.app.hideBookmarks();
      }
      else  {
        EdictBrowser.app.showBookmarks();
      }
    }
  },

  onpagechange: function (event)  {
    var page = EdictBrowser.app.page;

    // Hide magnifier here ??

    if (page.first <= 0)  {
      EdictBrowser.app.toolbar.prev_button.disable();
    }
    else  {
      EdictBrowser.app.toolbar.prev_button.enable();
    }
    if (page.last >= Edict.entries.length - 1)  {
      EdictBrowser.app.toolbar.next_button.disable();
    }
    else  {
      EdictBrowser.app.toolbar.next_button.enable();
    }
    EdictBrowser.structure.
      writeStatus(EdictBrowser.app, { msg: page.first });
  },

  onbookmark: function (event)  {
    EdictBrowser.structure.
      writeStatus(
        EdictBrowser.app,
        { msg: "Bookmark added: " +
          Edict.primary(Edict.entries[event.entry_number][0])
        }
      );
  },

  onshowbookmarks: function (event)  {
    // this == component
    document.body.addEventListener("keyup", EdictBrowser.controller.onescapechar, true);
    EdictBrowser.structure.showBookmarks(event.ui.component, {});
  },

  onhidebookmarks: function (event)  {
    // this == component
    document.body.removeEventListener("keyup", EdictBrowser.controller.onescapechar, true);
    EdictBrowser.structure.hideBookmarks(event.ui.component, {});
  },


  /* config = { target: ..., clientX: ..., clientY: ...} */
  scheduleMagnifier: function (instance, config)  {
    var pane = instance.mag_div;
    while (pane.hasChildNodes()) {
      pane.removeChild(pane.firstChild);
    }
    var entry_number = this.getEntryNoFromSpan(instance, config);
    var div = document.createElement("DIV");
    div.appendChild(
      document.createTextNode(
        Edict.entries[entry_number][0].replace(/;/g, "\u3000")
      )
    );
    pane.appendChild(div);
    if (Edict.entries[entry_number][1].indexOf(";") >= 0) {
      div = document.createElement("DIV");
      div.appendChild(
        document.createTextNode(
          Edict.entries[entry_number][1].replace(/;/g, "\u3000")
        )
      );
      pane.appendChild(div);
    }
    // Need to show to get width and height ..
    EdictBrowser.structure.showMagnifier(instance, null);
    //instance.mag_div.innerHTML = config.target.innerHTML;
    //var y = config.clientY + window.scrollY + 20;
    //var x = config.clientX + window.scrollX + 20;
    var y = config.clientY + window.pageYOffset + 20;
    var x = config.clientX + window.pageXOffset + 20;

    // content ..
    var h = parseInt(window.getComputedStyle(instance.mag_div).height);
    h += 2 + 10;  // borders + padding
    //var delta = y + h - window.scrollY - window.innerHeight;
    var delta = y + h - window.pageYOffset - window.innerHeight;
    if (delta > 0)  {
      y -= delta;
    }
    var w = parseInt(window.getComputedStyle(instance.mag_div).width);
    EdictBrowser.structure.hideMagnifier(instance, null);
    w += 2 + 10;
    //delta = x + w - window.scrollX - window.innerWidth;
    delta = x + w - window.pageXOffset - window.innerWidth;
    if (delta > 0)  {
      x -= delta;
    }
    EdictBrowser.structure.moveMagnifier(instance, { x: x, y: y });

    var timeout;
    timeout =
      setTimeout(
        function ()  {
          EdictBrowser.structure.showMagnifier(instance, null);
        },
        2000
      );
    config.target.addEventListener("mouseout", cancelMagnifier, false);
    function cancelMagnifier()  {
      clearTimeout(timeout);
      config.target.removeEventListener("mouseout", cancelMagnifier, false);
      EdictBrowser.structure.hideMagnifier(instance, null);
    }
  },

  getEntryNoFromSpan: function (instance, config) {
    // Offset from page.first ..
    var line = 0;
    // Look for the DIV that holds the entire line (1) ..
    //var target = event.target.parentElement;
    var target = config.target.parentElement;
    // eb-page-col
    //   div  (2)
    //     div (line) (1)
    //       span span ...
    //     div (line)
    // Abort if we click outside a SPAN (2) ..
    //if (target.parentElement.className == "eb-page-col")  {
    if (target.className != "eb-page-line")  {
      return -1;
    }
    //var page = instance.page.container;
    var page = document.getElementById("eb_page");
    // #eb_page > .eb-page > .eb-page-col > div -> children
    var columns =
      [
        page.children[0].children[1].children[0].children,  // Left col
        page.children[0].children[2].children[0].children   // Right col
      ];
    for (var i = 0; i < 2; ++i)  {
      // Does the entry at the top of the right column
      // carry over from the bottom of the left column? ..
      if (i == 1)  {
        // Not section head && not a new entry ..
        if (columns[1][0].children.length > 0 &&
            columns[i][0].children[0].className != "eb-page-entry")  {
          --line;  // Do not double count the entry.
        }
      }
      for (var j = 0; j < columns[i].length; ++j)  {
        if (columns[i][j] == target)  {
          return instance.page.first + line;
        }
        // Do not count lines with section heading ..
        if (columns[i][j].className == "eb-page-sectionhead")  {
          continue;
        }
        ++line;
      }
    }
    return -1;
  },

  events: [
    "bookmark",
    "showbookmarks",
    "hidebookmarks"
  ]
};

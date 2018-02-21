/**
 * Requires ui.js, ui_component.js, types.js, dom.js, edict.js
 *
 */

/**
 * A page of the dictionary.
 *
 * @param config {Object} An object with properties:
 * container {HTMLElement} The location in the document where
 *           the page will be placed.
 * styles {Object} Specify the CSS class names that override
 *        the defaults. Probably no need for this.
 */
function Page(config)  {
  config = config ? config : { };
  Page.properties.init(this, config);
  Page.structure.init(this, config);
  /*Page.styler.init(this, config);*/
  Page.controller.init(this, config);
}

types.baseType(ui.Component, Page);

Page.prototype.show = function ()  {
  this.dispatchEvent(this.createEvent("show"));
};

Page.prototype.hide = function ()  {
  this.dispatchEvent(this.createEvent("hide"));
};

Page.prototype.goTo = function (index)  {
  index = parseInt(index);
  if (!index || index < 0)  {
    index = 0;
  }
  if (index >= Edict.entries.length)  {
    index = Edict.entries.length;
  }
  this.last = index - 1;
  this.lastEndNode = -1;
  this.lastEndWord = -1;
  // pageForward() will set first, firstStartNode, firstStartWord
  this.pageForward();
};

Page.prototype.pageForward = function ()  {
  this.dispatchEvent(this.createEvent("pageforward"));
};

Page.prototype.pageBackward = function ()  {
  this.dispatchEvent(this.createEvent("pagebackward"));
};

/*******************************************************************/

Page.properties =  {
  init: function (instance, config)  {
    ui.Component.properties.init(instance, config);
    instance.container = config.container ? config.container : document.body;
    // TO DO: now css_classes.
    instance.styles = config.styles ? config.styles : Page.styler.classes;
    instance.first = -1;
    instance.last = -1;            // flag
    instance.firstStartNode = -1;
    instance.firstStartWord = -1;  // flag
    instance.lastEndNode = -1;     // flag
    instance.lastEndWord = -1;     // flag
    // This may become configurable ..
    instance.COLUMN_HEIGHT = 512;  // line-height: 16px;
  }
};

/* Change these to eb_page_... */
Page.structure =  {
  init: function (instance, config)  {
    var page = document.createElement("DIV");
    var elem;
    // Move this to styler init ..
    Page.styler.setClass(instance, { element: page, className: "page" });
    elem = document.createElement("DIV");
    Page.styler.setClass(instance, { element: elem, className: "head" });

    elem.setAttribute("id", "eb_page_head");
    page.appendChild(elem);
    elem = document.createElement("DIV");  // Left column
    Page.styler.setClass(instance, { element: elem, className: "col" });
    elem.setAttribute("id", "eb_page_col_lt");
    page.appendChild(elem);
    elem = document.createElement("DIV");  // Right column
    Page.styler.setClass(instance, { element: elem, className: "col" });
    elem.setAttribute("id", "eb_page_col_rt");
    page.appendChild(elem);
    // Footer here ?
    instance.page = page;
  },

  show:  function (instance, config)  {
    instance.container.appendChild(instance.page);
  },

  hide: function (instance, config)  {
    instance.container.removeChild(instance.page);
  },

  pageForward: function (instance, config)  {
    var columns = [];
    var currententry;    // Edict entry of the line being built
    var fsn;             // firstStartNode
    var fsw;             // firstStartWord
    var len;             // lastEndNode
    var lew;             // lastEndWord
    var i;               // column index 0..1
    var j;               // node index
    var k;               // word index
    var line;            // A list of DOM nodes
    var node;            // A node from line list
    var textNodes        // A list of words from a definitiontext
    var vbox;            // A column box
    //**************************************
    columns[0] = document.getElementById("eb_page_col_lt");
    columns[1] = document.getElementById("eb_page_col_rt");
    len = instance.lastEndNode;
    lew = instance.lastEndWord;
    currententry = instance.last + (len < 0 ? 1 : 0);  // Was last entry split?
    instance.first = currententry;
    instance.firstStartNode = len + (lew < 0 ? 1 : 0);
    instance.firstStartWord = lew + (lew < 0 ? 0 : 1);
    for (i = 0; i < 2; i++ )  {  // Two columns
      vbox = document.createElement("DIV");
      while (columns[i].hasChildNodes())  {
        columns[i].removeChild(columns[i].firstChild);
      }
      columns[i].appendChild(vbox);
      fsn = len + (lew < 0 ? 1 : 0);            // Was last node split?
      fsw = lew + (lew < 0 ? 0 : 1);            // Was last node split?
      buildFirstLine();  // Pick up where the previous page ended.

      while (vbox.offsetHeight < instance.COLUMN_HEIGHT && currententry < Edict.entries.length)  {
        if ((Page.structure.isSectionBoundary(currententry, currententry - 1)) &&
           // Don't append the section head more than once.
           (vbox.lastChild.getAttribute("class") != instance.styles.sectionhead))  {

          vbox.appendChild(Page.structure.sectionHeading(instance, { index: currententry }));
          continue;
        }
        line = Page.structure.buildLine(instance, {index: currententry});
        vbox.appendChild(line);
        currententry++;
      }
      // Remove the overflow:
      len = -1;
      lew = -1;
      if (vbox.offsetHeight > instance.COLUMN_HEIGHT)  {
        rebuildLastLine();
      }
      if (vbox.lastChild &&  // Left column may be empty.
          vbox.lastChild.getAttribute("class") == instance.styles.sectionhead)  {
        vbox.removeChild(vbox.lastChild);
      }
    }  // END column

    // Reached the end of the dictionary. Rebuild the last page to fill
    // both columns:
    if (currententry >= Edict.entries.length)  {
      instance.first = Edict.entries.length;
      instance.firstStartNode = 0;
      instance.firstStartWord = -1;
      instance.pageBackward();
    }
    else  {
      // If last line was split, it's not necessary to adjust currententry.
      // Aleady done above.
      instance.last = currententry - (len < 0 ? 1 : 0);
      instance.lastEndNode = len;
      instance.lastEndWord = lew;
    }

    // *** Local functions *** //
    function buildFirstLine()  {
      if (currententry >= Edict.entries.length)  {
        return false;
      }
      if (Page.structure.isSectionBoundary(currententry, currententry - 1))  {
        vbox.appendChild(Page.structure.sectionHeading(instance, { index: currententry }));
      }
      line = Page.structure.buildLine(instance, { index: currententry });
      currententry++;
      vbox.appendChild(line);
      // fsn should be in the correct position(set above).
      for (j = 0; j < fsn; j++)  {
        line.removeChild(line.firstChild);
      }
      if (fsw > 0)  {
        node = line.removeChild(line.firstChild);
        textNodes = Page.structure.splitDefinitionText(instance, { node: node });
        for (k = textNodes.length - 1; k >= fsw ; k--)  {
          line.insertBefore(textNodes[k], line.firstChild);
        }
      }
      return true;
    }  // END buildFirstLine()

    function rebuildLastLine()  {
        line = vbox.lastChild;
        if (line.getAttribute("class") == instance.styles.sectionhead)  {
          // There could be two section heads at the bottom of page,
          // one within column boundary, and one below.
          vbox.removeChild(vbox.lastChild);  // Remove overflow
          return;
        }
        len = line.childNodes.length - 1;
        while (vbox.offsetHeight > instance.COLUMN_HEIGHT)  {
          node = line.removeChild(line.lastChild);
          len--;
        }
        if (len < 0)  {
          // line is empty. Remove it so we can test for "sectionhead" which
          // would now be in vbox.lastChild.
          vbox.removeChild(line);
        }
        if (node.getAttribute("class") == instance.styles.definitiontext)  {
          var textNodes = Page.structure.splitDefinitionText(instance, { node: node });
          while (textNodes.length > 0 && vbox.offsetHeight <= instance.COLUMN_HEIGHT)  {
            line.appendChild(textNodes.shift());
            lew++;
          }
          // Remove the offending word:
          if (vbox.offsetHeight > instance.COLUMN_HEIGHT)  {  // May not need this test
            line.removeChild(line.lastChild);
            lew--;
          }
          if (lew >= 0)  {
            len++;  // Some words from deleted node were put back.
          }
        }
        // One line has been split.
        currententry--;
    }  // END rebuildLastLine()
    // *** *** *** *** *** *** *** *** //
    Page.structure.pageHeader(instance);
  },  // END pageForward()

  pageBackward: function (instance, config)  {
    var columns = [];
    var currententry;
    var fsn;             // firstStartNode
    var fsw;             // firstStartWord
    var len;             // lastEndNode
    var lew;             // lastEndWord
    var i;               // column index 0..1
    var j;               // node index
    var k;               // word index
    var line;            // A list of DOM nodes
    var node;            // A node from line list
    var textNodes        // A list of words from a definitiontext
    var vbox;            // A column box

    //**************************************
    // Right column first:
    columns[0] = document.getElementById("eb_page_col_rt");
    columns[1] = document.getElementById("eb_page_col_lt");
    fsn = instance.firstStartNode;
    fsw = instance.firstStartWord;
    currententry = instance.first - (fsn == 0 ? 1 : 0);  // Was first line split?
    instance.last = currententry;
    instance.lastEndNode = fsn - (fsw < 0 ? 1 : 0);  // Save these before they're overwritten
    instance.lastEndWord = fsw - (fsw < 0 ? 0 : 1);
    for (i = 0; i < 2; i++)  {
      // Replace column with new empty one:
      vbox = document.createElement("DIV");
      while (columns[i].hasChildNodes())  {
        columns[i].removeChild(columns[i].firstChild);
      }
      columns[i].appendChild(vbox);
      len = fsn - (fsw < 0 ? 1 : 0);  // Was node split?
      lew = fsw - (fsw < 0 ? 0 : 1);  // Was node split?
      // *** TEST HERE for negative index *** //
      if (currententry >= 0)  {
        buildLastLine();
      }
      // ***                              *** //
      while (vbox.offsetHeight < instance.COLUMN_HEIGHT && currententry >= 0)  {
        if ((Page.structure.isSectionBoundary(currententry, currententry + 1)) &&
            (vbox.firstChild.getAttribute("class") != instance.styles.sectionhead))  {
          vbox.insertBefore(Page.structure.sectionHeading(instance, { index: currententry + 1 }),
                            vbox.firstChild);
          continue;
        }
        line = Page.structure.buildLine(instance, { index: currententry });
        vbox.insertBefore(line, vbox.firstChild);
        currententry--;
      }
      fsn = 0;  // Default flag setting
      fsw = -1; // Default flag setting
      if (vbox.offsetHeight > instance.COLUMN_HEIGHT)  {
        rebuildFirstLine();
      }
    }  // END column
    if (currententry < 0)  {
      instance.last = -1;
      instance.lastEndNode = -1;
      instance.lastEndWord = -1;
      instance.pageForward();
    }
    else  {
      instance.first = currententry + (fsn == 0 ? 1 : 0);
      instance.firstStartNode = fsn;
      instance.firstStartWord = fsw;
    }
    Page.structure.pageHeader(instance);

    //**************************************
    function buildLastLine()  {
      if (currententry >= Edict.entries.length)  {
        return;
      }
      line = Page.structure.buildLine(instance, { index: currententry });
      currententry--;
      vbox.appendChild(line);
      if (len > 0)  {  // len == -1 is the flag indicating line wasn't split.
        for (j = line.childNodes.length - 1; j > len; j--)  {
          line.removeChild(line.lastChild);
        }
        if (lew >= 0)  {  // lew == -1 if flag indicating node wasn't split.
          node = line.removeChild(line.lastChild);
          textNodes = Page.structure.splitDefinitionText(instance, { node: node });
          for (k = 0; k <= lew ; k++)  {
            line.appendChild(textNodes[k]);
          }
        }
      }
    }  // END buildLastLine()

    function rebuildFirstLine()  {
      // Previous page's last line/div ..
      var bottomLine;
      var heightBottomLine;
      //******************

      // If a section heading is at the top of the column,
      // don't remove it.
      if (vbox.firstChild.getAttribute("class") == instance.styles.sectionhead)  {
        return;
      }
      bottomLine = document.createElement("DIV");
      line = vbox.firstChild;
      // TO DO: .. OK
      //fsn = 0;  // Have to reset this below if the entire line was removed!!
      // *****************************************************************
      // Remove nodes until line fits in column ..
      while (vbox.offsetHeight > instance.COLUMN_HEIGHT)  {
        bottomLine.appendChild(line.removeChild(line.firstChild));
        fsn++;
      }
      // Have to add div to document to calculate its height ..
      vbox.insertBefore(bottomLine, vbox.firstChild);
      heightBottomLine = bottomLine.offsetHeight;
      // Keep adding nodes to bottomLine until it is 'full' ..
      while (heightBottomLine == bottomLine.offsetHeight && line.hasChildNodes())  {
        bottomLine.appendChild(line.removeChild(line.firstChild));
        fsn++;
      }
      // Did bottomLine overflow? ..
      if (heightBottomLine < bottomLine.offsetHeight)  {
        // Try to put some nodes back into line ..
        node = bottomLine.removeChild(bottomLine.lastChild);
        if (node.getAttribute("class") == instance.styles.definitiontext)  {
          textNodes = Page.structure.splitDefinitionText(instance, { node: node });
          k = 0;
          while (heightBottomLine == bottomLine.offsetHeight)  {
            bottomLine.appendChild(textNodes[k]);
            k++;
          }
          k--;
          bottomLine.removeChild(bottomLine.lastChild);
          var l = textNodes.length - 1;
          while (l >= k)  {
            line.insertBefore(textNodes[l], line.firstChild);
            l--;
          }
          if (k > 0)  {
            fsw = k;
          }
        }
        else  {
          line.insertBefore(node, line.firstChild);
        }
        fsn--;  // Some words from deleted node were put back.
      }
      if (!line.hasChildNodes())  {
        fsn = 0;  // line was completely removed from column.
      }
      vbox.removeChild(bottomLine);
      currententry++;
    }
  },  // END pageBackward()


  buildLine: function (instance, config)  {
    var index = config.index;
    var line = document.createElement("DIV");
    var span = document.createElement("SPAN");
    Page.styler.setClass(instance, { element: line, className: "line" });
    Page.styler.setClass(instance, { element: span, className: "entry" });
    // The opening paren seems to be a problem for Chrome ..
    //span.appendChild(document.createTextNode(Edict.entries[index][0] + " ")); // \u3000
    span.appendChild(document.createTextNode(Edict.primary(Edict.entries[index][0]) + " ")); // \u3000
    //span.appendChild(document.createTextNode(Edict.entries[index][0]));
    line.appendChild(span);
    if (Edict.entries[index][1] != "")  {
      span = document.createElement("SPAN");
      Page.styler.setClass(instance, { element: span, className: "reading" });
      // TO DO: Remove trailing space. Prepend to definition text. Or use \u3000
      //span.appendChild(document.createTextNode("\u3014" + Edict.entries[index][1] + "\u3015 "));
      span.appendChild(document.createTextNode("\u3014" + Edict.primary(Edict.entries[index][1]) + "\u3015 "));
      line.appendChild(span);
    }
    var nodelist = Page.structure.glossToNodelist(instance, { gloss: Edict.entries[index][2] });
    for (var j = 0; j < nodelist.length; j++)  {
      line.appendChild(nodelist[j]);
    }
    return line;
  },  // END buildLine()


  splitDefinitionText: function (instance, config)  {
    var node = config.node;
    var nodeList = [];
    var def = node.textContent;
    var words = def.split(" ");
    for (var i in words)  {
      var span = document.createElement("SPAN");
      Page.styler.setClass(instance, { element: span, className: "definitiontext" });
      span.appendChild(document.createTextNode(words[i] + " "));
      nodeList.push(span);
    }
    return nodeList;
  },


  /**
    Requires definitionparser.js.  Now, Page.structure.definition_parser
    config = { gloss: "/.../.../ ..." }
  */
  glossToNodelist: function (instance, config)  {
    // gloss: "/ ... / ... / ... /"
    // defs: [" ... ", " ... ", " ... "]
    var gloss = config.gloss;
    var defs = Page.structure.definition_parser.splitGloss(gloss);
    // returnlist: The complete list of all nodes created from defs.
    var returnlist = [];
    // nodelist: The list from each section of the gloss.
    var nodelist;
    // lastnode: The last node in the nodelist returned by defstringToNodeList.
    // [SPAN, SPAN, SPAN, SPAN, lastnode]
    // lastnode is saved so it can be modified by appending either ',' or '.'
    var lastnode;

    var re = /(\?$)|(!$)/;  // Test to see if a definition has sentence terminator.
    var terminator;         // String that terminates a definition: " ", ". "

    for (var i = 0; i < defs.length; i++)  {
      nodelist = Page.structure.definition_parser.defstringToNodeList(instance, { definition: defs[i] });
      if (i > 0)  {
        if (Page.structure.definition_parser.newdefnumber)  {
          if (lastnode.className == instance.styles.definitiontext)  {
            terminator = ". ";
            if (re.test(lastnode.lastChild.textContent))  {
              terminator = " ";
            }
            lastnode.lastChild.textContent += terminator;
          }
          else  {
            var span = document.createElement("SPAN");
            Page.styler.setClass(instance, { element: span, className: "definitiontext" });
            span.appendChild(document.createTextNode(". "));
            nodelist.unshift(span);
          }
        }
        else  {
          if (lastnode.className == instance.styles.definitiontext)  {
            lastnode.lastChild.textContent += ", ";
          }
          else  {
            var span = document.createElement("SPAN");
            Page.styler.setClass(instance, { element: span, className: "definitiontext" });
            span.appendChild(document.createTextNode(", "));
            nodelist.unshift(span);
          }
        }
      }
      for (var j = 0; j < nodelist.length; j++)  {
        returnlist.push(nodelist[j]);
      }
      lastnode = nodelist[nodelist.length - 1];
    }
    if (lastnode.className == instance.styles.definitiontext)  {
      lastnode.lastChild.textContent += ". ";
    }
    else  {
      var span = document.createElement("SPAN");
      Page.styler.setClass(instance, { element: span, className: "definitiontext" });
      span.appendChild(document.createTextNode(". "));
      returnlist.push(span);
    }
    return returnlist;
  },

  isSectionBoundary: function (currententry, previousentry)  {
    // Boundary conditions:
    if (previousentry < 0)  return true;
    if (previousentry > Edict.entries.length - 1) return false;

    var cur = Edict.entries[currententry][1].charAt(0);
    if (cur == "")  cur = Edict.entries[currententry][0].charAt(0);
    var pre = Edict.entries[previousentry][1].charAt(0);
    if (pre == "")  pre = Edict.entries[previousentry][0].charAt(0);
    if (cur != pre)  {
      return true;
    }
    return false;
  },

  sectionHeading: function (instance, config)  {
    var currententry = config.index;
    var ch = Edict.entries[currententry][1].charAt(0);
    if (ch == "")  ch = Edict.entries[currententry][0].charAt(0);
    var heading = document.createElement("DIV");
    Page.styler.setClass(instance, { element: heading, className: "sectionhead" });
    heading.appendChild(document.createTextNode(ch));
    return heading;
  },

  pageHeader: function (instance, config)  {
    var head = instance.page.firstChild;
    // take only the primary spelling ..
    var labels = [
      Edict.primary(Edict.entries[instance.first][0]),
      Edict.primary(Edict.entries[instance.last][0])
    ];
    while (head.hasChildNodes())  {
      head.removeChild(head.firstChild);
    }
    for (var i = 0; i < 2; i++)  {
      var div = document.createElement("DIV");
      div.setAttribute("position", i);
      div.appendChild(document.createTextNode(labels[i]));
      head.appendChild(div);
    }
  },

  /**
   */
  definition_parser:  {

    /**
     * This is a flag that signals the caller of
     * defstringToNodeList
     * that the defstring has a definition number. The caller can then terminate
     * the previous definition with a '.' .
     */

    newdefnumber: false,

    /**
     * Tests to find part of speech annotations like: "(v5k,vi,vt)".
     *
     *@property partofspeech
     *@type {Array}
     */

    partsofspeech: [
      "(^|,)adj(-.{1,2})?(,|$)",
      "(^|,)adv(-(n|to))?(,|$)",
      "(^|,)aux(-(v|adj))?(,|$)",
      "(^|,)conj(,|$)",
      "(^|,)ctr(,|$)",
      "(^|,)exp(,|$)",
      "(^|,)int(,|$)",
      "(^|,)iv(,|$)",
      "(^|,)n(-(adv|pref|suf|t))?(,|$)",
      "(^|,)num(,|$)",
      "(^|,)pn(,|$)",
      "(^|,)pref(,|$)",
      "(^|,)prt(,|$)",
      "(^|,)suf(,|$)",
      "(^|,)v(t|i|s|z|n|k)(,|$)",
      "(^|,)vs-(i|s|c)(,|$)",
      "(^|,)v\\d(.{1,3})?(,|$)"
    ],

    /**
     * Test to find a definition number annotation like: "(10)".
     *
     */

    defno: "^\\d{1,2}$",

    /**
     * Test to find a fields of application annotations like: "(comp)".
     *
     *@property fieldsofapplication
     *@type Array
     */

     // TO DO: bot, finc, music?, sumo
     /*  // edict2 now uses {foa} notation.
    fieldsofapplication: [
      "^comp$",  // 15365
      "^Buddh$",  // 1325
      "^food$",  // 992
      "^math$",  // 876
      "^sumo$",  // 669
      "^ling$",  // 662
      "^med$",  // 537
      "^music$",  // 478
      "^baseb$",  // 469
      "^physics$",  // 415
      "^astron$",  // 405
      "^mahj$",  // 273
      "^law$",  // 205
      "^biol$",  // 203
      "^sports$",  // 202
      "^chem$",  // 188
      "^MA$",  // 164
      "^anat$",  // 153
      "^Shinto$",  // 108
      "^archit$",  // 84
      "^shogi$",  // 77
      "^geol$",  // 75
      "^bot$",  // 69
      "^finc$",  // 59
      "^mil$",  // 50
      "^econ$",  // 34
      "^bus$",  // 30
      "^engr$",  // 20
      "^zool$",  // 17
      "^geom$"  // 14
    ],
    */

    /**
     * Tests to find miscellaneous annotations.
     *
     */

    // TO DO: Reorder according to frequency
    miscmarkings:  [
      "^X$",  // 46
      "^abbr$",  // 3188
      "^arch$",  // 4036
      "^ateji$", // 452
      "^chn$",  // 102
      "^col$",  // 1185
      "^derog$",
      "^eK$",
      "^ek$",
      "^fam$",
      "^fem$",
      "^gikun$",
      "^hon$",
      "^hum$",
      "^ik$",
      "^iK$",
      "^id$",
      "^io$",
      "^joc$",
      "^m-sl$",
      "^male$",
      "^male-sl$",
      "^oK$",
      "^obs$",
      "^obsc$",
      "^ok$",
      "^on-mim$",
      "^poet$",
      "^pol$",
      "^rare$",
      "^sens$",
      "^sl$",
      "^uK$",
      "^uk$",
      "^vulg$",
      "^yoji$"
    ],
    // May be some missing language codes ..
    languageNames:  [
      "afr",
      "ain",
      "alg",
      "ara",
      "bnt",
      "bur",
      "chi",
      "chn",
      "dan",
      "dut",
      "eng",
      "epo",
      "est",
      "fil",
      "fin",
      "fre",
      "ger",
      "grc",
      "gre",
      "haw",
      "heb",
      "hin",
      "hun",
      "ice",
      "ind",
      "ita",
      "khm",
      "kor",
      "lat",
      "may",
      "mnc",
      "mon",
      "nor",
      "per",
      "pol",
      "por",
      "rus",
      "san",
      "som",
      "spa",
      "swe",
      "tah",
      "tha",
      "tib",
      "tur",
      "urd",
      "vie"
    ],

    /**
     * Test to find sub-entry annotations: "(P)".
     *
     */

    /*
    subentry: "^P$",
    */

    dialect: "^[^ ]+:$",

    /*
    etymology: "^[^ ]+: .+$",
    */

    /**
     *
     * The notation '(N)' is used in some entries as a place-holder for
     * a number. This should be treated as plain text. This is treated
     * differently from plain text because ordinary parenthetical text
     * would be followed by a space character. In this case we don't
     * want that.
     *
     */

    isN: function (tag)  {
      // Number placeholder. Used like (N)-way switch
      // Followed by '-', ' ' or end of segment.
      if (tag == "N")  {
        return true;
      }
      return false;
    },

    /**
     * Language annotations look like "(chi:)"
     *
     */

    isLanguage: function (tag)  {
      if (tag.match(this.dialect))  {
        return true;
      }
      return false;
    },

    /**
     * These annotations differ from languages in that they include the foreign
     * word, and there may be multiple etymologies in a single annotation:
     * "(lang: phrase, lang: phrase, ...)".
     *
     */


    /*
    isEtymology: function (tag)  {
      if (tag.match(this.etymology))  {
        return true;
      }
      return false;
    },
    */

    isEtymology: function (tag)  {
      var m = tag.match(/([^ ]+):/);  // "lang: ..." -> "lang"
      var name;
      var islang = false;
      if (m)  {
        name = m[1];
        for (var i = 0; i < this.languageNames.length; i++)  {
          if (name == this.languageNames[i])  {
            islang = true;
            break;
          }
        }
      }
      return islang;
    },

    /**
     * Other miscellaneous annotations. The list may not be complete.
     *
     */

    isMiscMarking: function (tag)  {
      for (var i = 0; i < this.miscmarkings.length; i++)  {
        if (tag.match(this.miscmarkings[i]))  {
          return true;
        }
      }
      return false;
    },

    /**
     * The annotation "(comp)" signifies a word from computer science.
     */

    isFieldOfApplication: function (tag)  {
      for (var i = 0; i < this.fieldsofapplication.length; i++)  {
        if (tag.match(this.fieldsofapplication[i]))  {
        return true;
        }
      }
      return false;
    },

    /**
     * A part of speech annotation looks like: "(pos[,pos]*)".
     *
     */

    isPartOfSpeech: function (tag)  {
      // Could return index number to identify the match??
      for (var i = 0; i < this.partsofspeech.length; i++)  {
        if (tag.match(this.partsofspeech[i]))  {
        return true;
        }
      }
      return false;
    },


    /**
     * Definition numbers are rendered in bold text, followed by a '.'.
     *
     */

    isDefinitionNumber: function (tag)  {
      if (tag.match(this.defno))  {
        return true;
      }
      return false;
    },

    /**
     * (wasei: ..., ...)
     *
     */

    isWasei: function (tag)  {
      var i = tag.indexOf("wasei:");
      return i < 0 ? false : true;
    },

    /**
     * Takes a segment from an EDICT definition and returns a list of DOM
     * elements.
     * /.../.../ -> splitGloss() -> ["...", "..."]. Each string in the array
     * is passed to defStringToNodeList(), which returns [SPAN, SPAN, SPAN].
     * The SPANs are given one of the following classes:
     * partofspeech,
     * defno,
     * miscmarking,
     * fieldofapp,
     * languagename,
     * foreignword,
     * definitiontext.
     *
     */

    defstringToNodeList: function (instance, config)  {
      var def = config.definition;
      var nodes = [];
      var index = 0;
      this.newdefnumber = false;

      while (index < def.length)  {
        var fragment = "";
        var innerparen = "";
        var node = null;
        var i;
        var openparen = def.indexOf("(");
        var closeparen = -1;
        // fieldofapplication is now in {...}
        var openbracket = def.indexOf("{");
        if (openbracket >= 0 &&
           (openbracket < openparen || openparen < 0)) {
          // consume plain text ..
          fragment = def.substr(index, openbracket); // index == 0
          i = def.indexOf("}", openbracket);
          node = document.createElement("SPAN");
          Page.styler.setClass(instance, { element: node, className: "fieldofapp" });
          ++openbracket;  // skip over '{' character.
          node.appendChild(document.createTextNode(def.substr(openbracket, i - openbracket) + ". "));
          index = i + 2;
        }
        else {
          i = openparen + 1;
          var nest = i ? 1 : 0;
          while (nest > 0 && i < def.length)  {
            if (def.charAt(i) == "(")  {
              nest++;
            }
            if (def.charAt(i) == ")")  {
              nest--;
              closeparen = i;
            }
            i++;
          }
          if (openparen < 0)  {
            fragment = def.substring(index, def.length);
            index = def.length;
          }
          else if (closeparen < 0)  {  // Malformed parens
            break;  // Abandon the rest of this section
          }
          else  {
            fragment = def.substring(index, openparen);
            innerparen = def.substring(openparen + 1, closeparen);
            // <paren><space><next>  <next> = <paren> + 2
            index = closeparen + 2;  // Skip space??
            if (this.isPartOfSpeech(innerparen))  {
              node = document.createElement("SPAN");
              Page.styler.setClass(instance, { element: node, className: "partofspeech" });
              innerparen = innerparen.replace(/,/g, "., ");
              node.appendChild(document.createTextNode(innerparen + ". "));
            }
            else if (this.isDefinitionNumber(innerparen))  {
              node = document.createElement("SPAN");
              Page.styler.setClass(instance, { element: node, className: "defno" });
              node.appendChild(document.createTextNode(innerparen + ". "));
              // Caller inspects newdefnumber, then either appends a "," or "." to
              // the previous node.
              this.newdefnumber = true;
            }
            else if (this.isMiscMarking(innerparen) && fragment == "")  {  // HACK! (male) used in plain text
              node = document.createElement("SPAN");
              Page.styler.setClass(instance, { element: node, className: "miscmarking" });
              node.appendChild(document.createTextNode(innerparen + ". "));
            }
            /*  // Now in {...}
            else if (this.isFieldOfApplication(innerparen))  {
              node = document.createElement("SPAN");
              Page.styler.setClass(instance, { element: node, className: "fieldofapp" });
              node.appendChild(document.createTextNode(innerparen + ". "));
            }
            */
            else if (this.isLanguage(innerparen))  {
              // "lang:"
              // ...(lang:)/  No space required
              var space = index > def.length ? "." : ". ";
              innerparen = innerparen.replace(":", "");
              node = document.createElement("SPAN");
              Page.styler.setClass(instance, { element: node, className: "languagename" });
              node.appendChild(document.createTextNode(innerparen + space));
            }
            else if (this.isEtymology(innerparen))  {
              //"lang:<space><words>[, <words>]"
              //"lang:, lang:"

              // This does NOT create separate nodes for languagename
              // and foreignword ..
              node = document.createElement("SPAN");
              // TO DO: class="lang"  ?? NEED THIS ??
              node.setAttribute("class", "lang");  // For identification purposes.
              var innernode = document.createElement("SPAN");
              Page.styler.setClass(instance, { element: innernode, className: "languagename" });
              innernode.appendChild(document.createTextNode(innerparen));
              node.appendChild(innernode);
            }
            else if (this.isWasei(innerparen))  {
              fragment += "(";
              node = document.createElement("SPAN");
              var innernode = document.createElement("SPAN");
              Page.styler.setClass(instance, { element: innernode, className: "languagename" });
              innernode.appendChild(document.createTextNode("wasei:"));
              node.appendChild(innernode);
              innernode = document.createElement("SPAN");
              Page.styler.setClass(instance, { element: innernode, className: "definitiontext" });
              innernode.appendChild(document.createTextNode(innerparen.slice(6) + ")"));
              node.appendChild(innernode);
            }
            else if (this.isN(innerparen))  {
              // Unskip the space ? following (...)
              index--;
              fragment += "(N)";

            }
            else  {
              // Not special case. Replace the parens and treat as
              // ordinary text.
              fragment += "(" + innerparen + ")";
              if (index < def.length)  {
                fragment += " ";
              }
            }
          }
        }
        if (fragment.length > 0)  {
          var plaintext = document.createElement("SPAN");
          Page.styler.setClass(instance, { element: plaintext, className: "definitiontext" });
          plaintext.appendChild(document.createTextNode(fragment));
          nodes.push(plaintext);
        }
        if (node != null)  {
          nodes.push(node);
        }
        def = def.substring(index, def.length);
        index = 0;
      }
      return nodes;
    },  // END defstringToNodeList()

    /**
     * Takes a string of form "/.../.../.../" and returns an array of form
     * ["...", "...", "..."].
     *
     */

    splitGloss: function (gloss)  {
      var definitions = gloss.split("/");
      // Leading and trailing "/" produce "". Drop them.
      definitions = definitions.slice(1, definitions.length - 1);
      if (definitions[definitions.length - 1] == "(P)")  {
        definitions.length = definitions.length - 1;
      }
      return definitions;
    }
  }
};

Page.styler =  {
  /*
  init: function (instance, config)  {

  },
  */

  /**
   *
   *
   *
   */

  setClass: function (instance, config)  {
    dom.addClass(config.element, instance.styles[config.className]);
  },

  classes: {
    page: "eb-page",
    head: "eb-page-head",
    col: "eb-page-col",
    line: "eb-page-line",
    entry: "eb-page-entry",
    reading: "eb-page-reading",
    sectionhead: "eb-page-sectionhead",
    partofspeech: "eb-page-partofspeech",
    defno: "eb-page-defno",
    fieldofapp: "eb-page-fieldofapp",
    miscmarking: "eb-page-miscmarking",
    languagename: "eb-page-languagename",
    definitiontext: "eb-page-definitiontext"
  }
};

Page.controller =  {
  init: function (instance, config)  {
    instance.addListener("show", Page.controller.onshow);
    instance.addListener("hide", Page.controller.onhide);
    instance.addListener("pageforward", Page.controller.onpageforward);
    //instance.addListener("pageforward", this.onpageforward);  // OK
    instance.addListener("pagebackward", Page.controller.onpagebackward);
  },

  onshow: function (event)  {
    Page.structure.show(event.ui.component);
  },

  onhide: function (event)  {
    Page.structure.hide(event.ui.component);
  },

  onpageforward: function (event)  {
    Page.structure.pageForward(event.ui.component);
  },

  onpagebackward: function (event)  {
    Page.structure.pageBackward(event.ui.component);
  },

  events: [
    "show",
    "hide",
    "pageforward",
    "pagebackward"
  ]
};

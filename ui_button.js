/**
 *  Requires: ui.js, ui_component.js, types.js, dom.js
 */

ui.Button = function (config)  {
  config = config ? config : { };
  ui.Button.properties.init(this, config);
  ui.Button.structure.init(this, config);
  ui.Button.styler.init(this, config);
  ui.Button.controller.init(this, config);
};

/* prototype .. */
types.baseType(ui.Component, ui.Button);


ui.Button.prototype.show = function ()  {
  var event = this.createEvent("show");
  this.dispatchEvent(event);
};

ui.Button.prototype.hide = function ()  {
  var event = this.createEvent("hide");
  this.dispatchEvent(event);
};

ui.Button.prototype.disable = function ()  {
  this.disabled = true;  // move to properties
  var event = this.createEvent("disable");
  this.dispatchEvent(event);
};

ui.Button.prototype.enable = function ()  {
  this.disabled = false;
  var event = this.createEvent("enable");
  this.dispatchEvent(event);
};

ui.Button.prototype.activate = function ()  {
  if (this.disabled == false)  {
    var event = this.createEvent("activate");
    this.dispatchEvent(event);
  }
};

ui.Button.prototype.focus = function ()  {
  this.button_div.focus();
};

/*******************************************************************/

ui.Button.structure =  {
  init: function (instance, config)  {
    instance.button_div = document.createElement("DIV");
    if (config.label != undefined)  {
      if (typeof (config.label) == "string")  {
        instance.button_div.appendChild(
          document.createTextNode(config.label)
        );
      }
      else  {
        instance.button_div.appendChild(config.label);
      }
    }
    ui.Button.structure.setTabIndex(instance, config);
  },

  // Default container document.body ??
  show: function (instance, config)  {
      instance.container.appendChild(instance.button_div);
  },

  hide: function (instance, config)  {
      instance.container.removeChild(instance.button_div);
  },

  setTabIndex: function (instance, config)  {
    // Not sure about this ..
    if (config && config.tabIndex)  {
      instance.button_div.tabIndex = config.tabIndex;
    }
    else  {
      instance.button_div.tabIndex = instance.tabIndex;
    }
  }
};


ui.Button.styler =  {
  init: function (instance, config)  {
    // Default styles. Override by setting instance.styles = { ... };
    dom.addClass(instance.button_div, instance.styles.button);
    dom.addClass(instance.button_div, instance.styles.button_up);
  },

  disable: function (instance, config)  {
    dom.addClass(instance.button_div, instance.styles.button_disabled);
  },

  enable: function (instance, config)  {
    dom.removeClass(instance.button_div, instance.styles.button_disabled);
  },

  hover: function (instance, config)  {
    dom.addClass(instance.button_div, instance.styles.button_hover);
  },

  unhover: function (instance, config)  {
    dom.removeClass(instance.button_div, instance.styles.button_hover);
  },

  up: function (instance, config)  {
    dom.toggleClass(instance.button_div, instance.styles.button_up, instance.styles.button_down);
  },

  down: function (instance, config)  {
    dom.toggleClass(instance.button_div, instance.styles.button_down, instance.styles.button_up);
  },

  pressed: function (instance, config)  {
    dom.addClass(instance.button_div, instance.styles.button_pressed);
  },

  unpressed: function (instance, config)  {
    dom.removeClass(instance.button_div, instance.styles.button_pressed);
  },
  /* These are the default CSS class names for the different button states. */
  css_classes: {
    button: "ui-button",
    button_up: "ui-button-up",
    button_down: "ui-button-down",
    button_pressed: "ui-button-pressed",
    button_disabled: "ui-button-disabled",
    button_hover: "ui-button-hover"
  }
};


ui.Button.properties =  {
  init: function (instance, config)  {
    ui.Component.properties.init(instance, config);
    instance.container = config.container ? config.container : document.body;
    // Put this in styler??
    instance.styles = config.styles ? config.styles : ui.Button.styler.css_classes;
    instance.disabled = false;
    instance.tabIndex = config.tabIndex ? config.tabIndex : -1;
  },
  // ?? ..
  setDisabled: function (instance, config)  {
    if (config == null || config.disabled == undefined)  {
      return;
    }
    instance.disabled = config.disabled === true ? true : false;
  }
};

ui.Button.controller =  {
  init: function (instance, config)  {
    // DOM events don't know about Buttons.
    // Attach a reference to instance. Then use event.target.ui.component.
    instance.button_div.ui = {
      component: instance
    };
    instance.addListener("disable", ui.Button.controller.ondisable);
    instance.addListener("enable", ui.Button.controller.onenable);
    instance.addListener("show", ui.Button.controller.onshow);
    instance.addListener("hide", ui.Button.controller.onhide);
    // Test for disabled here??
    ui.Button.controller.enable(instance, config);
  },

  enable:  function (instance, config)  {
    instance.button_div.addEventListener("click", ui.Button.controller.onclick, false);
    instance.button_div.addEventListener("keypress", ui.Button.controller.onkeypress, false);
    instance.button_div.addEventListener("keydown", ui.Button.controller.onkeydown, false);
    instance.button_div.addEventListener("keyup", ui.Button.controller.onkeyup, false);
    instance.button_div.addEventListener("mousedown", ui.Button.controller.onmousedown, false);
    instance.button_div.addEventListener("mouseup", ui.Button.controller.onmouseup, false);
    instance.button_div.addEventListener("mouseout", ui.Button.controller.onmouseup, false);
    instance.button_div.addEventListener("mouseout", ui.Button.controller.onmouseout, false);
    instance.button_div.addEventListener("mouseover", ui.Button.controller.onmouseover, false);
    ui.Button.styler.enable(instance, config);
    ui.Button.structure.setTabIndex(instance);  // Check this. tabIndex property??
  },

  disable: function (instance, config)  {
    instance.button_div.removeEventListener("click", ui.Button.controller.onclick, false);
    instance.button_div.removeEventListener("keypress", ui.Button.controller.onkeypress, false);
    instance.button_div.removeEventListener("keydown", ui.Button.controller.onkeydown, false);
    instance.button_div.removeEventListener("keyup", ui.Button.controller.onkeyup, false);
    instance.button_div.removeEventListener("mousedown", ui.Button.controller.onmousedown, false);
    instance.button_div.removeEventListener("mouseup", ui.Button.controller.onmouseup, false);
    instance.button_div.removeEventListener("mouseout", ui.Button.controller.onmouseup, false);
    instance.button_div.removeEventListener("mouseover", ui.Button.controller.onmouseover, false);
    ui.Button.styler.disable(instance, config);
    ui.Button.structure.setTabIndex(instance, { tabIndex: -1 });
  },

  /* Button event listeners .. */
  ondisable: function (event)  {
    // this == event.ui.component
    ui.Button.controller.disable(event.ui.component);
  },

  onenable: function (event)  {
    ui.Button.controller.enable(event.ui.component);
  },

  onshow: function (event)  {
    ui.Button.structure.show(event.ui.component);
  },

  onhide: function (event)  {
    ui.Button.structure.hide(event.ui.component);
  },

  /* DOM Event listeners .. */
  /* event.target == button_div */
  onclick: function (event)  {
    // Change to the following ...
    event.target.ui.component.activate();
  },

  onkeydown: function (event)  {
    if (event.keyCode == 13 || event.keyCode == 32)  {
      ui.Button.styler.down(event.target.ui.component);
      ui.Button.styler.pressed(event.target.ui.component);
    }
  },

  onkeyup: function (event)  {
    if (event.keyCode == 13 || event.keyCode == 32)  {
      ui.Button.styler.up(event.target.ui.component);
      ui.Button.styler.unpressed(event.target.ui.component);
      event.target.ui.component.activate();
    }
  },

  onmousedown: function (event)  {
    event.preventDefault(); // Disable select text.
    event.target.focus();   // Have to manually focus.
    ui.Button.styler.down(event.target.ui.component);
    ui.Button.styler.pressed(event.target.ui.component);
  },

  onmouseup: function (event)  {
    ui.Button.styler.up(event.target.ui.component);
    ui.Button.styler.unpressed(event.target.ui.component);
  },

  onmouseover: function (event)  {
    ui.Button.styler.hover(event.target.ui.component);
  },

  onmouseout: function (event)  {
    ui.Button.styler.unhover(event.target.ui.component);
    ui.Button.styler.unpressed(event.target.ui.component);
  },

  /* The default events emitted by button */
  events: [
    "activate",
    "enable",
    "disable",
    "show",
    "hide"
  ]
};

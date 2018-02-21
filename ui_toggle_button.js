/**
 * Requires: ui.js, ui_component.js, ui_button.js, types.js, dom.js
 */

/**
 *
 * @param config {Object} Has the following properties ..
 * checked {boolean} The initial state of the button.
 *         Defaults to false.
 * group {ui.ButtonGroup} The optional ButtonGroup this
 *       button belongs to.
 * See also: ui.Button
 */
ui.ToggleButton = function (config)  {
  if (config == null) config = { };
  ui.ToggleButton.properties.init(this, config);
  ui.ToggleButton.structure.init(this, config);
  ui.ToggleButton.styler.init(this, config);
  ui.ToggleButton.controller.init(this, config);
}

/* prototype .. */
types.baseType(ui.Button, ui.ToggleButton);


/*******************************************************************/


ui.ToggleButton.properties = {
  init: function (instance, config)  {
    ui.Button.properties.init(instance, config);
    instance.checked = typeof (config.checked) == "boolean" ?
                       config.checked : false;
    if (config.group instanceof ui.ButtonGroup)  {
      instance.group = config.group;
      if (instance.checked)  {
        instance.group.check(instance)
      }
    }
  },
  
  toggle: function (instance, config)  {
    if (instance.disabled == false)  {
      instance.checked = !instance.checked;
    }
  }
};

ui.ToggleButton.structure = ui.Button.structure;


ui.ToggleButton.styler = {
  
  init: function (instance, config)  {
    dom.addClass(instance.button_div, instance.styles.button);
    if (instance.checked == true)  {
      dom.addClass(instance.button_div, instance.styles.button_down);
    }
    else  {
      dom.addClass(instance.button_div, instance.styles.button_up);
    }
  },
  
  toggle: function (instance, config)  {
    if (instance.checked == true)  {
      dom.toggleClass(instance.button_div,
        instance.styles.button_down,
        instance.styles.button_up
      );
    }
    else  {
      dom.toggleClass(instance.button_div,
        instance.styles.button_up,
        instance.styles.button_down
      );
    }
  }
};


ui.ToggleButton.controller = {
  init: function (instance, config)  {
    
    instance.button_div.ui = {
      component: instance
    };
    instance.addListener("disable",
      ui.ToggleButton.controller.ondisable
    );
    instance.addListener("enable",
      ui.ToggleButton.controller.onenable
    );
    instance.addListener("show", ui.Button.controller.onshow);
    instance.addListener("hide", ui.Button.controller.onhide);
    ui.ToggleButton.controller.enable(instance, config);
  },

  enable:  function (instance, config)  {
    instance.button_div.addEventListener("click", ui.ToggleButton.controller.onclick, false);
    instance.button_div.addEventListener("keyup", ui.ToggleButton.controller.onkeyup, false);
    instance.button_div.addEventListener("keydown", ui.ToggleButton.controller.onkeydown, false);
    instance.button_div.addEventListener("mousedown", ui.Button.controller.onmousedown, false);
    instance.button_div.addEventListener("mouseup", ui.ToggleButton.controller.onmouseup, false);
    instance.button_div.addEventListener("mouseup", ui.ToggleButton.controller.onmouseup, false);
    instance.button_div.addEventListener("mouseout", ui.ToggleButton.controller.onmouseout, false);
    instance.button_div.addEventListener("mouseover", ui.Button.controller.onmouseover, false);
    ui.Button.styler.enable(instance, config);
    ui.ToggleButton.structure.setTabIndex(instance);
  },
  
  disable: function (instance, config)  {
    instance.button_div.removeEventListener("click", ui.ToggleButton.controller.onclick, false);
    instance.button_div.removeEventListener("keyup", ui.ToggleButton.controller.onkeyup, false);
    instance.button_div.removeEventListener("keydown", ui.ToggleButton.controller.onkeydown, false);
    instance.button_div.removeEventListener("mousedown", ui.Button.controller.onmousedown, false);
    instance.button_div.removeEventListener("mouseup", ui.ToggleButton.controller.onmouseup, false);
    instance.button_div.removeEventListener("mouseout", ui.ToggleButton.controller.onmouseout, false);
    instance.button_div.removeEventListener("mouseover", ui.Button.controller.onmouseover, false);
    ui.Button.styler.disable(instance, config);
    ui.ToggleButton.structure.setTabIndex(instance, { tabIndex: -1 });
  },

  /* For use by ButtonGroup .. */
  uncheck: function (instance, config)  {
    ui.ToggleButton.properties.toggle(instance);
    ui.ToggleButton.styler.toggle(instance);
    instance.activate();    
  },
  
  /* ToggleButton event listeners .. */
  onenable: function (event)  {
    ui.ToggleButton.controller.enable(event.ui.component);
  },
  
  ondisable: function (event)  {
    ui.ToggleButton.controller.disable(event.ui.component);
  },

  /* DOM Event listeners .. */
  onclick: function (event)  {
    var component = event.target.ui.component;
    if (component.group)  {
      if (component.checked)  {
        return;
      }
      component.group.check(component);
    }
    ui.ToggleButton.properties.toggle(event.target.ui.component);
    ui.ToggleButton.styler.toggle(event.target.ui.component);
    event.target.ui.component.activate();
  },

  onkeydown: function (event)  {
    if (event.keyCode == 13 || event.keyCode == 32)  {
      ui.Button.styler.pressed(event.target.ui.component);
    }
  },

  onkeyup: function (event)  {
    var component = event.target.ui.component;
    if (event.keyCode == 13 || event.keyCode == 32)  {
      if (component.group)  {
        if (component.checked)  {
          ui.Button.styler.unpressed(event.target.ui.component);
          return;  // ignore
        }
        component.group.check(component);
      }
      ui.ToggleButton.properties.toggle(event.target.ui.component);
      ui.Button.styler.unpressed(event.target.ui.component);
      ui.ToggleButton.styler.toggle(event.target.ui.component);
      event.target.ui.component.activate();
    }
  },
  
  onmousedown: function (event)  {
    event.preventDefault(); // Disable select text.
    event.target.focus();   // Have to manually focus.
    ui.Button.styler.pressed(event.target.ui.component);
  },
  
  onmouseup: function (event)  {
    ui.Button.styler.unpressed(event.target.ui.component);
  },
  
  onmouseout: function (event)  {
    ui.Button.styler.unhover(event.target.ui.component);
    if (event.target.ui.component.checked == false)  {
      ui.Button.styler.up(event.target.ui.component);      
    }
    else  {
      ui.Button.styler.down(event.target.ui.component);
    }
  },
  
  events: ui.Button.controller.events

};

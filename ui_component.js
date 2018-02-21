/**
 * Requires ui.js
 *
 */

/**
 * The base class for UI components.
 * All this class does is setup a simple event dispatcher.
 * A component declares, in controller.events, what kind of events
 * it can generate. These are names of type String. For each type of
 * event there is a list of listeners, each of which is called when
 * the event is dispatched. If a component wants to generate
 * instance-specific events it can declare them in instance.events,
 * an array of string names.
 *
 * @param config {Object} Object with two optional properties:
 * name and value
 */
ui.Component = function (config)  {
    config = config ? config : { };
    ui.Component.properties.init(this, config);
    //ui.Component.controller.init(this, config);
};

/**
 * Add a listener for an event type. The listener should expect
 * to receive one argument, the event being dispatched.
 *
 * @param event {String} The name of the event.
 * @param fn {Function} The event handler.
 */
ui.Component.prototype.addListener = function (event, fn)  {
  var eventLists = [ this.constructor.controller.events ?
                     this.constructor.controller.events :
                     [],  // Default events
                     this.events ?
                     this.events :
                     []  // User events
                   ];

  for (var i in eventLists)  {
    for (var j in eventLists[i])  {
      if (event == eventLists[i][j])  {
        var listeners = this.listeners[event];
        if (listeners)  {
          listeners.push(fn);
        }
        else  {
          this.listeners[event] = [ fn ];
        }
        return;
      }
    }
  }
};

/**
 * Remove a listener for an event type.
 *
 * @param event {String} The name of the event.
 * @param fn {Function} The event handler to remove.
 */
ui.Component.prototype.removeListener = function (event, fn)  {
  var eventLists = [ this.constructor.controller.events ?
                     this.constructor.controller.events :
                     [],  // Default events
                     this.events ?
                     this.events :
                     []  // User events
                   ];
  for (var i in eventLists)  {
    for (var j in eventLists[i])  {
      if (eventLists[i][j] == event)  {
        var listeners = this.listeners[event];
        for  (var k = 0; k < listeners.length; k++)  {
          if (listeners[k] === fn)  {
            listeners.splice(k, 1);
            i--;
            break;
          }
        }
        if (listeners.length == 0)  {
        delete this.listeners[event];
        }
        break;
      }
    }
  }
};

/**
 * A helper function to create a generic event object.
 *
 * @param type {String} The name of the event type.
 */
ui.Component.prototype.createEvent = function (type)  {
  var event = document.createEvent("HTMLEvents");
  event.initEvent(type, false, false);
  // May not need this ..
  event.ui = {
    component: this
  };
  return event;
};

/**
 * Calls all listeners of events of its type.
 *
 * @param event {Event} An event returned from createEvent();
 */
ui.Component.prototype.dispatchEvent = function (event)  {
  // Is event type disabled?
  ui.Component.controller.processEvent(this, { event: event });
};

ui.Component.properties =  {
  init: function (instance, config)  {
    if (config.name != undefined)  {
      instance.name = config.name;
    }
    if (config.value != undefined)  {
      instance.value = config.value;
    }
    instance.listeners = { };  // "event" : [ function, ... ]
  }
};

ui.Component.controller =  {
  /*
  init: function (instance, config)  {
    // Not used ..
  },
  */

  processEvent: function (instance, config)  {
    var type = config.event.type;

    for (var i in instance.listeners[type])  {
      /* Not sure about this. Set function context, or not? */
      instance.listeners[type][i].call(instance, config.event);
    }
  }
};

/**
 * Requires: ui.js, toggle_button.js
 */

/**
 *
 */
ui.ButtonGroup = function ()  {
  this.checked = null;
};

ui.ButtonGroup.prototype.check = function (button)  {
  var prev = this.checked;
  this.checked = button;
  if (prev != null)  {
    ui.ToggleButton.controller.uncheck(prev);
  }
};

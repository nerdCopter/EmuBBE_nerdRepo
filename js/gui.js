
'use strict';

var TABS = {}; // filled by individual tab js file

///////////////// import from Configurator (was empty)
var GUI_control = function () {
    // check which operating system is user running
    if (navigator.appVersion.indexOf("Win") != -1)          this.operating_system = "Windows";
    else if (navigator.appVersion.indexOf("Mac") != -1)     this.operating_system = "MacOS";
    else if (navigator.appVersion.indexOf("CrOS") != -1)    this.operating_system = "ChromeOS";
    else if (navigator.appVersion.indexOf("Linux") != -1)   this.operating_system = "Linux";
    else if (navigator.appVersion.indexOf("X11") != -1)     this.operating_system = "UNIX";
    else this.operating_system = "Unknown";

    // Check the method of execution
    this.nwGui = null;
    try {
      this.nwGui = new nw.gui();
      this.Mode = GUI_Modes.NWJS;
    } catch (ex) {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        this.Mode = GUI_Modes.ChromeApp;
      } else {
        this.Mode = GUI_Modes.Other;
      }
    }
    console.log("GUI_Mode = ",this.Mode);
};

const GUI_Modes = {
  NWJS: "NW.js",
  ChromeApp: "Chrome",
  Other: "Other"
}

GUI_control.prototype.isChromeApp = function () {
  return this.Mode == GUI_Modes.ChromeApp;
}
GUI_control.prototype.isNWJS = function () {
  return this.Mode == GUI_Modes.NWJS;
}
GUI_control.prototype.isOther = function () {
  return this.Mode == GUI_Modes.Other;
}
///////////////// end import from Configurator

// Timer managing methods

// name = string
// code = function reference (code to be executed)
// interval = time interval in miliseconds
// first = true/false if code should be ran initially before next timer interval hits
GUI_control.prototype.interval_add = function (name, code, interval, first) {
    var data = {'name': name, 'timer': null, 'code': code, 'interval': interval, 'fired': 0, 'paused': false};

    if (first == true) {
        code(); // execute code

        data.fired++; // increment counter
    }

    data.timer = setInterval(function() {
        code(); // execute code

        data.fired++; // increment counter
    }, interval);

    this.interval_array.push(data); // push to primary interval array

    return data;
};

// name = string
GUI_control.prototype.interval_remove = function (name) {
    for (var i = 0; i < this.interval_array.length; i++) {
        if (this.interval_array[i].name == name) {
            clearInterval(this.interval_array[i].timer); // stop timer

            this.interval_array.splice(i, 1); // remove element/object from array

            return true;
        }
    }

    return false;
};

// name = string
GUI_control.prototype.interval_pause = function (name) {
    for (var i = 0; i < this.interval_array.length; i++) {
        if (this.interval_array[i].name == name) {
            clearInterval(this.interval_array[i].timer);
            this.interval_array[i].paused = true;

            return true;
        }
    }

    return false;
};

// name = string
GUI_control.prototype.interval_resume = function (name) {
    for (var i = 0; i < this.interval_array.length; i++) {
        if (this.interval_array[i].name == name && this.interval_array[i].paused) {
            var obj = this.interval_array[i];

            obj.timer = setInterval(function() {
                obj.code(); // execute code

                obj.fired++; // increment counter
            }, obj.interval);

            obj.paused = false;

            return true;
        }
    }

    return false;
};

// input = array of timers thats meant to be kept, or nothing
// return = returns timers killed in last call
GUI_control.prototype.interval_kill_all = function (keep_array) {
    var self = this;
    var timers_killed = 0;

    for (var i = (this.interval_array.length - 1); i >= 0; i--) { // reverse iteration
        var keep = false;
        if (keep_array) { // only run through the array if it exists
            keep_array.forEach(function (name) {
                if (self.interval_array[i].name == name) {
                    keep = true;
                }
            });
        }

        if (!keep) {
            clearInterval(this.interval_array[i].timer); // stop timer

            this.interval_array.splice(i, 1); // remove element/object from array

            timers_killed++;
        }
    }

    return timers_killed;
};

// name = string
// code = function reference (code to be executed)
// timeout = timeout in miliseconds
GUI_control.prototype.timeout_add = function (name, code, timeout) {
    var self = this;
    var data = {'name': name, 'timer': null, 'timeout': timeout};

    // start timer with "cleaning" callback
    data.timer = setTimeout(function() {
        code(); // execute code

        // remove object from array
        var index = self.timeout_array.indexOf(data);
        if (index > -1) self.timeout_array.splice(index, 1);
    }, timeout);

    this.timeout_array.push(data); // push to primary timeout array

    return data;
};

// name = string
GUI_control.prototype.timeout_remove = function (name) {
    for (var i = 0; i < this.timeout_array.length; i++) {
        if (this.timeout_array[i].name == name) {
            clearTimeout(this.timeout_array[i].timer); // stop timer

            this.timeout_array.splice(i, 1); // remove element/object from array

            return true;
        }
    }

    return false;
};

// no input paremeters
// return = returns timers killed in last call
GUI_control.prototype.timeout_kill_all = function () {
    var timers_killed = 0;

    for (var i = 0; i < this.timeout_array.length; i++) {
        clearTimeout(this.timeout_array[i].timer); // stop timer

        timers_killed++;
    }

    this.timeout_array = []; // drop objects

    return timers_killed;
};

// message = string
GUI_control.prototype.log = function (message) {
    console.log(message);
};

// initialize object into GUI variable
var GUI = new GUI_control();

// ==UserScript==
// @name         Time Controller
// @version      0.1
// @description  Prevents spending too much time on time-killing sites like Facebook or Youtube (20 minutes max by default)
// @author       Egor Vinogradov
// @homepage     http://egorvinogradov.com
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==


var DAY_LIMIT_MINUTES = 20;                  // Time limit a day to spend on each site
var DOMAINS = [                              // Second-level domains to watch
  'facebook.com',
  'youtube.com'
];

var REDIRECT_PAGE = 'http://bit.ly/1sTtwbW'  // URL where script sends after time is expired


var LOCAL_STORAGE_PREFIX_TIME = 'TIME_CONTROLLER_time';
var LOCAL_STORAGE_PREFIX_DATE = 'TIME_CONTROLLER_date';
var LOCAL_STORAGE_PREFIX_WINDOW = 'TIME_CONTROLLER_window';
var CHECK_INTERVAL = 1000;
var CLOCK_ID = 'time_controller';

var dayLimit = DAY_LIMIT_MINUTES * 60 * 1000;
var initialized = false;

window._time_controller_clock = window._time_controller_clock || null;
window._time_controller_interval = window._time_controller_interval || null;

function initialize(){

  if ( initialized === true ) {
    return;
  }
  initialized = true;

  if ( window.top !== window.self ) {
    return;
  }

  var windowID = +new Date();
  localStorage.setItem(LOCAL_STORAGE_PREFIX_WINDOW, windowID);

  var today = new Date().toLocaleDateString();
  var storageDate = localStorage.getItem(LOCAL_STORAGE_PREFIX_DATE);

  if ( today !== storageDate ) {
    localStorage.setItem(LOCAL_STORAGE_PREFIX_DATE, today);
    localStorage.removeItem(LOCAL_STORAGE_PREFIX_TIME);
  }

  var timeSpent = +localStorage.getItem(LOCAL_STORAGE_PREFIX_TIME) || 0;
  var timeLeft = dayLimit - timeSpent;

  if ( timeLeft <= 0 ) {
    timeOver();
    return;
  }

  _time_controller_clock = document.getElementById(CLOCK_ID);
  if ( !_time_controller_clock ) {
    _time_controller_clock = createClock();
  }

  clearInterval(_time_controller_interval);
  _time_controller_interval = setInterval(function(){

    storageId = +localStorage.getItem(LOCAL_STORAGE_PREFIX_WINDOW);
    if ( storageId !== windowID ) {
      stopWatching();
      return;
    };

    if ( document.visibilityState === 'visible' ) {
      timeSpent += CHECK_INTERVAL;
      localStorage.setItem(LOCAL_STORAGE_PREFIX_TIME, timeSpent);
      updateClock(timeSpent);

      if ( timeSpent >= dayLimit ) {
        timeOver();
        return;
      }
    }

  }, CHECK_INTERVAL);

};

function createClock(){
  var element = createElement('div', { innerHTML: '00:00', id: CLOCK_ID }, {
    position: 'fixed',
    zIndex: '100000000000',
    top: 0,
    left: 0,
    backgroundColor: 'white',
    padding: '15px',
    fontFamily: 'sans-serif',
    fontSize: '24px',
    fontWeight: 'bold'
  });
  document.body.appendChild(element);
  return element;
};

function createElement(tag, attributes, style){

  var element = document.createElement(tag);
  var styleArr = [];
  
  for ( var attrKey in attributes ) {
    element[attrKey] = attributes[attrKey];
  }
  for ( var styleKey in style ) {
    element.style[styleKey] = style[styleKey];
  }
  return element;
};

function updateClock(timeSpent){

  var timeLeft = dayLimit - timeSpent;
  if ( timeLeft < 0 ) {
    timeLeft = 0;
  }
  var minutes = Math.floor(timeLeft / (60 * 1000));
  var seconds = (timeLeft % (60 * 1000)) / 1000;

  if ( minutes < 5 ) {
    _time_controller_clock.style.color = 'red';
  }
  if ( minutes < 10 ) {
    minutes = '0' + minutes;
  }
  if ( seconds < 10 ) {
    seconds = '0' + seconds;
  }
  _time_controller_clock.innerHTML = minutes + ':' + seconds;

};

function stopWatching(){
  clearInterval(_time_controller_interval);
  _time_controller_clock.parentElement.removeChild(_time_controller_clock);
};

function timeOver(){
  clearInterval(_time_controller_interval);
  setTimeout(function(){
    alert('TIME FOR TODAY IS OVER');
    setTimeout(function(){
      window.location.href = REDIRECT_PAGE;
    }, 1000);
  }, 1000)
};

function getCurrentDomain(){
  var domain = window.location.hostname.split('.');
  return domain[ domain.length - 2 ] + '.' + domain[ domain.length - 1 ];
};

if ( DOMAINS.indexOf(getCurrentDomain()) >= 0 ) {
  initialize();
  setTimeout(initialize, 500);
}

// ==UserScript==
// @name         Time Controller
// @version      1.0
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
var CHECK_INTERVAL = 1000;
var CLOCK_ID = 'time_controller';

var dayLimit = DAY_LIMIT_MINUTES * 60 * 1000;
var initialized = false;

window.timeControllerClock = window.timeControllerClock || null;
window.timeControllerInterval = window.timeControllerInterval || null;

function initialize(){

  if ( initialized === true ) {
    return;
  }
  initialized = true;

  if ( window.top !== window.self ) {
    return;
  }

  var today = new Date().toLocaleDateString();
  var storageDate = localStorage.getItem(LOCAL_STORAGE_PREFIX_DATE);

  if ( today !== storageDate ) {
    localStorage.setItem(LOCAL_STORAGE_PREFIX_DATE, today);
    localStorage.removeItem(LOCAL_STORAGE_PREFIX_TIME);
  }

  var time = getTime();

  watchFocusChange(function(state){
    time = getTime();
  });

  if ( time.left <= 0 ) {
    timeOver();
    return;
  }

  timeControllerClock = document.getElementById(CLOCK_ID);
  if ( !timeControllerClock ) {
    timeControllerClock = createClock();
  }

  clearInterval(timeControllerInterval);
  timeControllerInterval = setInterval(function(){

    if ( document.visibilityState === 'visible' ) {
      time.spent += CHECK_INTERVAL;
      localStorage.setItem(LOCAL_STORAGE_PREFIX_TIME, time.spent);
      updateClock(time.spent);

      if ( time.spent >= dayLimit ) {
        timeOver();
        return;
      }
    }

  }, CHECK_INTERVAL);

};

function getTime(){

  var timeSpent = +localStorage.getItem(LOCAL_STORAGE_PREFIX_TIME) || 0;
  var timeLeft = dayLimit - timeSpent;

  return {
    spent: timeSpent,
    left: timeLeft
  }
};

function createClock(){
  var element = createElement('div', { innerHTML: '--:--', id: CLOCK_ID }, {
    position: 'fixed',
    zIndex: '100000000000',
    top: 0,
    left: 0,
    backgroundColor: 'white',
    padding: '15px',
    fontFamily: 'Menlo, monospace',
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
    timeControllerClock.style.color = 'red';
  }
  if ( minutes < 10 ) {
    minutes = '0' + minutes;
  }
  if ( seconds < 10 ) {
    seconds = '0' + seconds;
  }
  timeControllerClock.innerHTML = minutes + ':' + seconds;

};

function timeOver(){
  clearInterval(timeControllerInterval);
  setTimeout(function(){
    alert('TIME FOR TODAY IS OVER');
    setTimeout(function(){
      window.location.href = REDIRECT_PAGE;
    }, 1000);
  }, 1000)
};

function watchFocusChange(callback){

  var hidden = "hidden";

  if (hidden in document)
    document.addEventListener("visibilitychange", onchange);
  else if ((hidden = "webkitHidden") in document)
    document.addEventListener("webkitvisibilitychange", onchange);

  function onchange (evt) {
    var v = "visible", h = "hidden",
        evtMap = {
          focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h
        };

    evt = evt || window.event;
    if (evt.type in evtMap)
      callback(evtMap[evt.type]);
    else
      callback(this[hidden] ? "hidden" : "visible");
  }

  if( document[hidden] !== undefined )
    onchange({type: document[hidden] ? "blur" : "focus"});
}

function getCurrentDomain(){
  var domain = window.location.hostname.split('.');
  return domain[ domain.length - 2 ] + '.' + domain[ domain.length - 1 ];
};

if ( DOMAINS.indexOf(getCurrentDomain()) >= 0 ) {
  initialize();
  setTimeout(initialize, 500);
}

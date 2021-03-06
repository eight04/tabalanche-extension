/* global chrome */

var platform = {};
(function(){

var optionDefaults = {
  ignorePinnedTabs: true,
};

// exposed for the options page
platform.optionDefaults = optionDefaults;

platform.currentWindowContext = function currentWindowContext() {
  var prefix, preLength;

  // Yes, really. We save window state using document.cookie. That is the
  // *only mechanism* we have for saving window state. IKR, it's 2015, WTF.
  // It's this, or have a persistent background page that we query with
  // postMessage, or try to maintain a window context store using a mechanism
  // like localStorage that is persistent *across reboots* (which doesn't crash
  // cleanly and would generally be even crazier than cookies).
  // See http://discourse.wicg.io/t/cross-window-session-storage/943

  function getContext() {
    var cookies = document.cookie.split(/;\s*/g);
    for (var i = 0; i < cookies.length; i++) {
      if (cookies[i].slice(0,preLength) == prefix) {
        return JSON.parse(decodeURIComponent(cookies[i].slice(preLength)));
      }
    }
    return {};
  }

  function setContext(ctx) {
    document.cookie = prefix + encodeURIComponent(JSON.stringify(ctx));
  }

  var iface = {get: getContext, set: setContext};
  return new Promise(function(resolve, reject) {
    chrome.windows.getCurrent({populate: false}, function (crWindow) {
      prefix = 'wins_' + crWindow.id + '=';
      preLength = prefix.length;
      return resolve(iface);
    });
  });
};

// clear window session cookies when the window is closed
chrome.windows.onRemoved.addListener(function (wid) {
  document.cookie = 'wins_' + wid + '=';
});

platform.getWindowTabs = {};

function getOptions() {
  return new Promise(function(resolve) {
    chrome.storage.sync.get(optionDefaults, resolve);
  });
}

function queryCurrentWindowTabs (params) {
  return new Promise(function (resolve) {
    params.currentWindow = true;
    return chrome.tabs.query(params, resolve);
  });
}

platform.getWindowTabs.all = function getAllWindowTabs() {
  var params = {};
  return getOptions().then(function (opts) {
    if (opts.ignorePinnedTabs) params.pinned = false;
    return queryCurrentWindowTabs(params);
  });
};

platform.getWindowTabs.highlighted = function getHighlightedWindowTabs() {
  return queryCurrentWindowTabs({highlighted: true});
};

platform.getWindowTabs.other = function getAllWindowTabs() {
  var params = {highlighted: false};
  return getOptions().then(function (opts) {
    if (opts.ignorePinnedTabs) params.pinned = false;
    return queryCurrentWindowTabs(params);
  });
};

platform.getWindowTabs.right = function getRightWindowTabs() {
  return queryCurrentWindowTabs({}).then(function (tabs) {
    var rightEdge = tabs.reduce(function (max, tab) {
      return tab.highlighted || tab.pinned
        ? Math.max(tab.index, max)
        : max;
    }, 0);
    return tabs.filter(function (tab) {
      return tab.index > rightEdge;
    });
  });
};

function tabIdMap(tab) {
  return tab.id;
}

platform.closeTabs = function closeTabs(tabs) {
  return new Promise(function(resolve) {
    return chrome.tabs.remove(tabs.map(tabIdMap), resolve);
  });
};

platform.faviconPath = function faviconPath(url) {
  return 'chrome://favicon/' + url;
};

platform.extensionURL = function extensionURL(path) {
  return chrome.extension.getURL(path);
};

platform.getOptionsURL = function getOptionsURL() {
  return 'chrome://extensions/?options=' + chrome.runtime.id;
};

platform.openOptionsPage = chrome.runtime.openOptionsPage;

platform.openBackgroundTab = function openBackgroundTab(url) {
  return new Promise(function(resolve){
    return chrome.tabs.create({url: url, active: false}, resolve);
  });
};

})();

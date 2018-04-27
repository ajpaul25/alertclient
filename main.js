'use strict';
const electron = require('electron');
const {app, BrowserWindow} = electron;
const request = require("request");
const dns = require('dns');
const os = require('os');
var windows = [];
var serverurl;
var debug = true;

// get computer name, stripping any domain component
const computername = os.hostname().replace(/^([^\.]*)\.+.*$/,'$1');

app.on('ready', function() {
  app.dock.hide();
  var hiddenWindow = new BrowserWindow({
    show:false
  })
  bootstrap();
});

async function bootstrap(){
  console.log("node version: " + process.version);
  console.log("computername: " + computername);
  serverurl = await discoverServer();
  setInterval(mainLoop,5000);
}

function mainLoop() {
  checkAlerts().then(
    function(result){
      console.log(result.numalerts);
      if(result.numalerts > 0) {
        showAlert( serverurl + "/alerts/" + computername  + "?detail=true" );
      }
      else {
        hideAlert();
      }
    },
    function(err){
      debug && console.log(err);
    }
  );
}

async function discoverServer() {
  var discovered_server = null;
  var possible_servers = [
    "http://alertserver:3333",
    "http://alertserver",
    "https://alertserver"
  ];
  for(var i = 0; i<possible_servers.length; i++) {
    console.log("checking server " + possible_servers[i]);
    var result;
    try{
      result = await getJson(possible_servers[i],'alerts');
    }catch(err){
      debug && console.log(err);
    }
    if( result != null )
      debug && console.log(result);
    //if(result != null && result.hasOwnProperty(numalerts)){
    if(result != null){
      console.log("found server " + possible_servers[i]);
      discovered_server = possible_servers[i]; 
    }
    else{
      console.log("could not get numalerts from server " + possible_servers[i]);
    }

    if( discovered_server != null )
      return discovered_server;
  }
  return null;
  //return "http://10.234.3.115:3333";
}

function showAlert( url ) {
  var disp = electron.screen.getAllDisplays();
  for( var i = 0; i < disp.length; i++ )
  {
    if( windows[i] == null) {
      windows[i] = new BrowserWindow({
        height: disp[i].size.height,
        width: disp[i].size.width,
        kiosk: true,
        alwaysOnTop: true,
        resizable: false,
        frame: false,
        x: disp[i].bounds.x,
        y: disp[i].bounds.y
      });
      windows[i].loadURL(url);
    }
  }
}

function hideAlert() {
  for( var i = 0; i < windows.length; i++ ){
    windows[i].close();
  }
  windows = [];
}

function getJson(_serverurl,action) {
  var options = {
    url: _serverurl + '/' + action + '/' + computername  + '?json=true',
    headers: {
        'User-Agent': 'request'
    }
  };
  // Return new promise
  return new Promise(function(resolve, reject) {
    // Do async job
      request.get(options, function(err, resp, body) {
        if (err) {
            reject(err);
        } else {
            resolve(JSON.parse(body));
        }
      })
  })
}

function checkAlerts() {
  return getJson(serverurl,'alerts');
}

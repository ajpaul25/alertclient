'use strict';
const electron = require('electron');
const {app, BrowserWindow} = electron;
const request = require("request");
var windows = [];
const pageUrl = 'file://' + __dirname + '/app/index.html';

app.on('ready', function() {
  var hiddenWindow = new BrowserWindow({
    show:false
  })
  setInterval(mainLoop,5000);

});

function mainLoop() {
  checkAlerts().then(
    function(result){
      console.log(result.numalerts);
      if(result.numalerts > 0) {
        showAlert( "http://localhost:3333/alerts/apaulk2118?detail=true" );
      }
      else {
        hideAlert();
      }
    },
    function(err){
      console.log(err);
    }
  );
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

function checkAlerts() {
  var options = {
    url: 'http://localhost:3333/alerts/apaulk2118?json=true',
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

'use strict';

const {app, BrowserWindow, dialog, Menu} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

let window = null;

app.once('ready', () => {
    window = new BrowserWindow({width: 1200, height: 800, show: false});

    window.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    window.once('ready-to-show', () => {
        const call = (func, ...args) => {
            const argsJSON = JSON.stringify(args);
            window.webContents.executeJavaScript(`${func}.apply(${func}, ${argsJSON})`);
        }
        window.setMenu(Menu.buildFromTemplate([{
            label: "File",
            submenu: [
                {label: "Open", click: () => dialog.showOpenDialog(window, {
                    filters: [{name: "Text files", extensions: ['txt']}],
                }, files => {
                    if (files) {
                        call.apply(call, ['openFile', ...files]);
                    }
                }), accelerator: 'CmdOrCtrl+O',},
                {label: "Preferences", click: () => call('toggleOptions'), accelerator: 'CmdOrCtrl+P',},
                {role: "quit"}
            ]
        }]));
        window.show();
    });
})

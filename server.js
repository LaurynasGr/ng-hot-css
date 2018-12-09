const Server = ({ rootPath, port = '4200' }) => {
  const { exec } = require('child_process');
  const express = require('express');
  const path = require('path');
  const watcher = require('./modules/watcher');
  const getCSS = require('./modules/getCSS')(port);

  const app = express();
  const server = require('http').createServer(app);
  const io = require('socket.io').listen(server);

  const users = [];
  const static = 'public';

  let reloadPage = true;
  let awaitingRreload = false;
  let watcherInitiated = false;
  let compilingStarted = new Date().getTime();

  server.listen(port);

  app.use(express.static(path.resolve(rootPath, static)));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(rootPath, static + '/index.html'));
  });

  function initWatcher(cb) {
    watcher(rootPath, { ignored: /node_modules/ }, (filePath) => {
      compilingStarted = new Date().getTime();
      console.log("");
      if (!/\.scss$|\.less$|\.css$/.test(filePath)) {
        console.log("\x1b[92mCompiling the App.\x1b[0m \x1b[91mPlease wait...\x1b[0m");
        io.sockets.emit('compiling');
        awaitingRreload = true;
        return reloadPage = true;
      }
      console.log("\x1b[92mCompiling the Styles...\x1b[0m");
      reloadPage = false;

      getCSS(rootPath, css => {
        console.log(`Styles compiled in \x1b[92m${(new Date().getTime() - compilingStarted)}ms\x1b[0m\n\x1b[92mReloading the stylesheets...\x1b[0m`);
        io.sockets.emit('css', css);
      });
    });
    watcherInitiated = true;

    if (cb) cb();
  }

  io.sockets.on('connection', socket => {
    socket.on("login", userdata => {
      if (!users.includes(userdata.id)) {
        users.push(userdata.id);
        console.log(`WebSocket client ${userdata.id} connected.`);
      }

      getCSS(rootPath, css => {
        socket.emit('authenticated', css);
      });
    });
  });

  console.log(`\x1b[92mBuilding Angular server. \x1b[91mPlease wait...\x1b[0m`);
  const angularOut = exec(`cd ${rootPath} && ng build --output-path=public --watch`);

  angularOut.stdout.on('data', (response) => {
    if ((reloadPage || awaitingRreload) && /Time: \d+ms/.test(response)) {
      reloadPage = false;

      if (!watcherInitiated) {
        initWatcher(() => {
          console.log(`Server initialised in \x1b[92m${(new Date().getTime() - compilingStarted)}ms\x1b[0m\n\nGo to \x1b[93mhttp://localhost:${port}\x1b[0m to preview the App!\n\n`);
          io.sockets.emit('reload');
        });
      } else {
        console.log(`App compiled in \x1b[92m${(new Date().getTime() - compilingStarted)}ms\x1b[0m\n\x1b[92mReloading the browser...\x1b[0m`);
      }
      io.sockets.emit('reload');
      awaitingRreload = false;
    }
  });
  angularOut.stdout.on('error', (err) => {
    console.log(`\x1b[91m${err}\x1b[0m`);
  });

  angularOut.stderr.on('data', (stderr) => {
    console.log(`\x1b[91m${stderr}\x1b[0m`);
  });

  angularOut.on('close', (close) => {
    console.log({ close });
  });
};

module.exports = Server;
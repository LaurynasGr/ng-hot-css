(function() {
  var socket = io.connect();
  var isIE = document.documentMode || /Edge/.test(navigator.userAgent);
  var keepRemoving = true;
  var log = function() {
    if (true) return Function.prototype.bind.call(console.log, console);
    return function() {};
  }();

  socket.on('css', function(styles) {
    if (isIE) log("Updating Stylesheets...")
    else log("%cUpdating Stylesheets...", "color: #006b00");
    addStyles(styles);
  });
  socket.on('compiling', function() {
    if (isIE) log("Compiling the App...")
    else log("%cCompiling the App...", "color: #FF0000");
  });
  socket.on('reload', function() {
    if (isIE) log("Reloading Website...")
    else log("%cReloading Website...", "color: #FF0000");
    location.reload();
  });

  var mO = { observe: function() {}, disconnect: function() {} };
  var $styles = {};
  var removeStyles = function(mutations) {
    mO.disconnect();

    var $originalStyles = document.head.getElementsByTagName('style');
    for (var i = 0; i < $originalStyles.length; i++) {
      if (!$originalStyles[i].keep) $originalStyles[i].parentNode.removeChild($originalStyles[i]);
    }

    if (keepRemoving) requestAnimationFrame(removeStyles)
    else mO.observe(document.head, { childList: true });
  };
  var addStyles = function(styles) {
    mO.disconnect();

    for (var i = 0; i < styles.length; i++) {
      var name = styles[i].fileName;
      if (!$styles[name]) {
        var $style = document.createElement('style');
        $style.setAttribute('filename', name);
        $style.keep = true;
        document.head.appendChild($style);
        $styles[name] = $style;
      }
      $styles[name].innerHTML = styles[i].css;
    }

    if (!keepRemoving) mO.observe(document.head, { childList: true });
  };

  window.addEventListener('load', function() {
    setTimeout(function() {
      keepRemoving = false;
      if (window.MutationObserver) mO = new MutationObserver(function() {
        keepRemoving = true;
        removeStyles();
        setTimeout(function() { keepRemoving = false; }, 250);
      });
    }, 2000);
  });

  socket.on('authenticated', function(styles) {
    if (isIE) log("Waiting for file changes...")
    else log("%cWaiting for file changes...", "color: #006b00");

    removeStyles();
    addStyles(styles);
  });

  var now = new Date();
  var userData = (function() {
    if (!sessionStorage.__socketID) {
      sessionStorage.__socketID = JSON.stringify({ id: 'socket_' + now.getTime(), connectedAt: now.toLocaleString() });
    }
    return JSON.parse(sessionStorage.__socketID);
  })();
  socket.emit('login', userData);
})();
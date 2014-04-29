/**
 * Serial Sample 1
 * 2014.04.25 K.OHWADA
 */

const BITRATE_ARRAY = [ 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200 ];
const BITRATE_DEFAULT = 115200;

(function() {
	var btnOpen = document.getElementById("btn_open");
	var btnClose = document.getElementById("btn_close");
	var statusLine = document.getElementById("status");
	var serialBitrates = document.getElementById("serial_bitrates");
	var serialDevices = document.getElementById("serial_devices");
	var inputLine = document.getElementById("input_line");
	var recvArea = document.getElementById("recv");
	var logArea = document.getElementById("log");
	var connection = null;
	var lineBuffer = "";
	var is_on = false;

	/**
	 * log object
	 */ 
	var logObj = function(obj) {
    	console.log(obj);
	}

	/**
	 * log Success
	 */ 
	var logSuccess = function(msg) {
		log("<span style='color: green;'>" + msg + "</span>");
	};

	/**
	 * log Error
	 */ 
	var logError = function(msg) {
    	statusLine.className = "error";
    	statusLine.textContent = msg;
    	log("<span style='color: red;'>" + msg + "</span>");
	};

	/**
	 * log 
	 */ 
  	var log = function(msg) {
    	console.log(msg);
    	logArea.innerHTML = msg + "<br/>" + logArea.innerHTML;
  	};

	/**
	 * init 
	 */ 
	var init = function() {
    	if (!serial_lib) {
      		throw "You must include serial.js before";
      	}	

    	enableOpenButton(true);
    	btnOpen.addEventListener( "click", openDevice );
    	btnClose.addEventListener( "click", closeDevice );
    	document.getElementById("btn_refresh").addEventListener( "click", refreshPorts );
    	document.getElementById("btn_submit").addEventListener( "click", sendText );
    	document.getElementById("btn_led").addEventListener( "click", sendLed );

		initBitrates();
		refreshPorts();
	};

	/**
	 * enable OpenButton
	 */ 
	var enableOpenButton = function(enable) {
    	btnOpen.disabled = !enable;
    	btnClose.disabled = enable;
  	};

	/**
	 * initBitrates
	 */ 
  	var initBitrates = function() {
      	for ( var i = 0; i < BITRATE_ARRAY.length; ++i ) {
        	var rate = BITRATE_ARRAY[ i ];
        	serialBitrates.options.add( new Option( rate, rate ) );
        	if ( i === 1 || rate == BITRATE_DEFAULT ) {
          		serialBitrates.selectionIndex = i;
        	}
      	}
      	serialBitrates.options[ serialBitrates.selectionIndex ].selected = true;
	};

	/**
	 * refreshPorts
	 */ 
  	var refreshPorts = function() {
    	while (serialDevices.options.length > 0) {
      		serialDevices.options.remove(0);
      	}	

    	serial_lib.getDevices(function(items) {
      		logSuccess("got " + items.length + " ports");
      		for (var i = 0; i < items.length; ++i) {
        		var path = items[i].path;
        		serialDevices.options.add(new Option(path, path));
        		if (i === 1 || /usb/i.test(path) && /tty/i.test(path)) {
          			serialDevices.selectionIndex = i;
          			logSuccess("auto-selected " + path);
        		}
      		}
      		serialDevices.options[ serialDevices.selectionIndex ].selected = true;
    	});

	};

	/**
	 * openDevice
	 */   
  	var openDevice = function() {
    	var selection = serialDevices.selectedOptions[0];
    	if (!selection) {
      		logError("No port selected.");
      		return;
    	}
    	var path = selection.value;    
    	var bitrate = parseInt( serialBitrates.selectedOptions[0].value );
    	statusLine.classList.add("on");
    	statusLine.textContent = "Connecting";
    	enableOpenButton(false);
    	serial_lib.openDevice( path, bitrate, onOpen );
  	};

	/**
	 * closeDevice
	 */
  	var closeDevice = function() {
   		if (connection !== null) {
     		connection.close();
   		}
	};

	/**
	 * sendSerial
	 */ 
	var sendSerial = function(message) {
		if (connection === null) {
			return;
		}
		if (!message) {
			logError("Nothing to send!");
			return;
		}
		connection.send(message);
	};

	/**
	 * onOpen
	 */     
	var onOpen = function(newConnection) {
    	if (newConnection === null) {
      		logError("Failed to open device.");
      		return;
    	}
    	connection = newConnection;
    	connection.onReceive.addListener(onReceive);
    	connection.onError.addListener(onError);
    	connection.onClose.addListener(onClose);
    	logSuccess("Device opened.");
    	enableOpenButton(false);
    	statusLine.textContent = "Connected";
	};

	/**
	 * onClose
	 */
  	var onClose = function(result) {
    	connection = null;
    	enableOpenButton(true);
    	statusLine.textContent = "Not Connect";
    	statusLine.className = "";
	}
  	 
	/**
	 * onError
	 */
	var onError = function(errorInfo) {
    	if (errorInfo.error !== 'timeout') {
      		logError("Fatal error encounted. Dropping connection.");
      		closeDevice();
    	}
	};

	/**
	 * onReceive
	 */
	var onReceive = function( data ) {
		recvArea.innerHTML = data + "<br/>" + recvArea.innerHTML;
	};

	/**
	 * sendLed
	 */
	var sendLed = function() {
  		is_on = !is_on;
  		sendSerial( is_on ? "1" : "0" );
	};

	/**
	 * sendText
	 */
	var sendText = function() {
		var str = inputLine.value;
		sendSerial( str );
	};

	/**
	 * === start ===
	 */
	init();

})();


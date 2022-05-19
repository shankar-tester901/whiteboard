(function () {
	/* Canvas */

	var canvas = document.getElementById('drawCanvas');
	var ctx = canvas.getContext('2d');
	var color = document.querySelector(':checked').getAttribute('data-color');

	canvas.width = Math.min(document.documentElement.clientWidth, window.innerWidth || 300);
	canvas.height = Math.min(document.documentElement.clientHeight, window.innerHeight || 300);

	ctx.strokeStyle = color;
	ctx.lineWidth = '3';
	ctx.lineCap = ctx.lineJoin = 'round';

	/* Mouse and touch events */

	document.getElementById('colorSwatch').addEventListener('click', function () {
		color = document.querySelector(':checked').getAttribute('data-color');
	}, false);

	var isTouchSupported = 'ontouchstart' in window;
	var isPointerSupported = navigator.pointerEnabled;
	var isMSPointerSupported = navigator.msPointerEnabled;

	var downEvent = isTouchSupported ? 'touchstart' : (isPointerSupported ? 'pointerdown' : (isMSPointerSupported ? 'MSPointerDown' : 'mousedown'));
	var moveEvent = isTouchSupported ? 'touchmove' : (isPointerSupported ? 'pointermove' : (isMSPointerSupported ? 'MSPointerMove' : 'mousemove'));
	var upEvent = isTouchSupported ? 'touchend' : (isPointerSupported ? 'pointerup' : (isMSPointerSupported ? 'MSPointerUp' : 'mouseup'));

	canvas.addEventListener(downEvent, startDraw, false);
	canvas.addEventListener(moveEvent, draw, false);
	canvas.addEventListener(upEvent, endDraw, false);

	/* PubNub */
	var channel = 'draw';

	var pubnub = new PubNub({
		publishKey: 'pub-c-cfd43f00-c43a-4c46-9c59-e036a26c13a2',
		subscribeKey: 'sub-c-cd3555ea-8e9c-11ea-8e98-72774568d584',
		uuid: 'shankarUUIDString',
		ssl: true,
		presenceTimeout: 130
	});

	//This is to broadcast to all in the channels



	pubnub.addListener({
		message: function (m) {
			// handle message
			var channelName = m.channel; // The channel for which the message belongs
			var channelGroup = m.subscription; // The channel group or wildcard subscription match (if exists)
			var pubTT = m.timetoken; // Publish timetoken
			var msg = m.message; // The Payload
			var publisher = m.publisher; //The Publisher
			console.log('channelname is ' + channelName);
		},
		presence: function (p) {
			// handle presence
			var action = p.action; // Can be join, leave, state-change or timeout
			var channelName = p.channel; // The channel for which the message belongs
			var occupancy = p.occupancy; // No. of users connected with the channel
			var state = p.state; // User State
			var channelGroup = p.subscription; //  The channel group or wildcard subscription match (if exists)
			var publishTime = p.timestamp; // Publish timetoken
			var timetoken = p.timetoken;  // Current timetoken
			var uuid = p.uuid; // UUIDs of users who are connected with the channel
			console.log('Occupancy is ' + occupancy);
			document.getElementById('occupancy').textContent = m.occupancy;
		},
		signal: function (s) {
			// handle signal
			var channelName = s.channel; // The channel for which the signal belongs
			var channelGroup = s.subscription; // The channel group or wildcard subscription match (if exists)
			var pubTT = s.timetoken; // Publish timetoken
			var msg = s.message; // The Payload
			var publisher = s.publisher; //The Publisher
			console.log('Message is >>>> ' + msg);
		},
		user: function (userEvent) {
			// for Objects, this will trigger when:
			// . user updated
			// . user deleted
		},
		space: function (spaceEvent) {
			// for Objects, this will trigger when:
			// . space updated
			// . space deleted
		},
		membership: function (membershipEvent) {
			// for Objects, this will trigger when:
			// . user added to a space
			// . user removed from a space
			// . membership updated on a space
		},
		messageAction: function (ma) {
			// handle message action
			var channelName = ma.channel; // The channel for which the message belongs
			var publisher = ma.publisher; //The Publisher
			var event = ma.message.event; // message action added or removed
			var type = ma.message.data.type; // message action type
			var value = ma.message.data.value; // message action value
			var messageTimetoken = ma.message.data.messageTimetoken; // The timetoken of the original message
			var actionTimetoken = ma.message.data.actionTimetoken; //The timetoken of the message action
			console.log('publisher is  ' + publisher);
		},
		status: function (s) {
			var affectedChannelGroups = s.affectedChannelGroups; // The channel groups affected in the operation, of type array.
			var affectedChannels = s.affectedChannels; // The channels affected in the operation, of type array.
			var category = s.category; //Returns PNConnectedCategory
			var operation = s.operation; //Returns PNSubscribeOperation
			var lastTimetoken = s.lastTimetoken; //The last timetoken used in the subscribe request, of type long.
			var currentTimetoken = s.currentTimetoken; //The current timetoken fetched in the subscribe response, which is going to be used in the next request, of type long.
			var subscribedChannels = s.subscribedChannels; //All the current subscribed channels, of type array.
		}
	});
	// Get Older and Past Drawings!



	pubnub.subscribe({
		channels: ['draw'],
		withPresence: true
	});


	function publish(data) {
		pubnub.publish({
			channel: 'draw',
			message: data
		})
	}


	/* Draw on canvas */

	function drawOnCanvas(color, plots) {
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(plots[0].x, plots[0].y);

		for (var i = 1; i < plots.length; i++) {
			ctx.lineTo(plots[i].x, plots[i].y);
		}
		ctx.stroke();
	}

	function drawFromStream(message) {
		if (!message || message.plots.length < 1) return;
		drawOnCanvas(message.color, message.plots);
	}



	var drawHistory = true;


	if (drawHistory) {
		pubnub.history({
			channel: ['draw'],
			reverse: true,
			count: 50,
			stringifiedTimeToken: true, // false is the default
			callback: function (messages) {
				pubnub.each(messages[0], drawFromStream);
			}
		});
	}
	var isActive = false;
	var plots = [];

	function draw(e) {
		e.preventDefault(); // prevent continuous touch event process e.g. scrolling!
		if (!isActive) return;

		var x = isTouchSupported ? (e.targetTouches[0].pageX - canvas.offsetLeft) : (e.offsetX || e.layerX - canvas.offsetLeft);
		var y = isTouchSupported ? (e.targetTouches[0].pageY - canvas.offsetTop) : (e.offsetY || e.layerY - canvas.offsetTop);

		plots.push({ x: (x << 0), y: (y << 0) }); // round numbers for touch screens

		drawOnCanvas(color, plots);
	}

	function startDraw(e) {
		e.preventDefault();
		isActive = true;
	}

	function endDraw(e) {
		e.preventDefault();
		isActive = false;

		publish({
			color: color,
			plots: plots
		});

		plots = [];
	}
})();

 {
     var canvasCount = 0;
     var canvas = document.getElementById('drawCanvas');
     var ctx = canvas.getContext('2d');
     var color = document.querySelector(':checked').getAttribute('data-color');

     canvas.width = Math.min(document.documentElement.clientWidth, window.innerWidth || 300);
     canvas.height = Math.min(document.documentElement.clientHeight, window.innerHeight || 300);

     ctx.strokeStyle = color;
     ctx.lineWidth = '3';
     ctx.lineCap = ctx.lineJoin = 'round';

     document.getElementById('colorSwatch').addEventListener('click', function() {
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

     var el = document.getElementById('cleanScreen');
     el.onclick = cleanScreenFunc;


     var el2 = document.getElementById('newBoard');
     el2.onclick = newBoardFunc;

     function cleanScreenFunc() {
         alert('Cleaning the screen');
         const context = canvas.getContext('2d');
         context.clearRect(0, 0, canvas.width, canvas.height);
         return false;
     }

     function newBoardFunc() {
         canvasCount = canvasCount + 1;
         alert('Creating a new Board ' + canvasCount);
         img = document.createElement('img');
         img.src = 'images/1.png'; //stores image src
         var canv = document.createElement('canvas'); // creates new canvas element
         canv.id = 'canvas-' + canvasCount; // gives canvas id
         canv.height = canvas.height; //get original canvas height
         canv.width = canvas.width; // get original canvas width
         canv.style.zIndex = 8;
         canv.style.position = "absolute";
         canv.style.border = "2px solid";
         canv.style.top = "100px";
         canv.style.left = "100px";
         canv.tabIndex = canvasCount;
         document.body.appendChild(canv); // adds the canvas to the body element

         var canvas1 = document.getElementById(canv.id); //find new canvas we created
         var ctx = canvas1.getContext('2d');
         var color = document.querySelector(':checked').getAttribute('data-color');

         //  ctx.strokeStyle = color;
         //  ctx.lineWidth = '3';
         //  ctx.lineCap = ctx.lineJoin = 'round';
         var deltax = deltay = canvasCount * 10;

         ctx.moveTo(0, 0);
         var tempx = 200 + deltax
         var tempy = 100 + deltay
         ctx.lineTo(tempx, tempy);
         ctx.stroke();


     }




     const pubnub = new PubNub({
         subscribeKey: 'sub-c-cd3555ea-8e9c-11ea-8e98-72774568d584',
         publishKey: 'pub-c-cfd43f00-c43a-4c46-9c59-e036a26c13a2',
         uuid: 'tester-shankar-1',
         restore: true, // enable catchup on missed messages
     });


     pubnub.addListener({
         message: function(m) {
             console.log('message m  is   ' + JSON.stringify(m));
             console.log("Subscribed Channel is    " + m.subscribedChannel);
             // handle message
             var channelName = m.channel; // The channel for which the message belongs
             //	console.log('channelName is   ' + channelName);
             if (m.subscribedChannel == 'space-1') {
                 drawFromStream(m);
             } else {
                 postImageToSubscribedStream(m, canvas);
             }
             var channelGroup = m.subscription; // The channel group or wildcard subscription match (if exists)
             var pubTT = m.timetoken; // Publish timetoken
             var msg = m.message; // The Payload
             var publisher = m.publisher; //The Publisher
         },
         presence: function(p) {
             //	console.log('p is   ' + JSON.stringify(p));
             document.getElementById('occupancy').textContent = p.occupancy;
             document.getElementById('statusIs').textContent = " Status :  " + p.action + "  by " + p.uuid;

             var p1 = document.getElementById('occupancy').parentNode;
             p1.classList.add('anim');
             p1.addEventListener('transitionend', function() { p1.classList.remove('anim'); }, false);
             // handle presence

             var action = p.action; // Can be join, leave, state-change or timeout
             if (action == 'join') {
                 //	console.log('Joined');
             } else if (action == 'leave') {
                 //	console.log('left');
             }
             var channelName = p.channel; // The channel for which the message belongs
             var occupancy = p.occupancy; // No. of users connected with the channel
             var state = p.state; // User State
             console.log('State is  ' + state);

             var channelGroup = p.subscription; //  The channel group or wildcard subscription match (if exists)
             var publishTime = p.timestamp; // Publish timetoken
             var timetoken = p.timetoken; // Current timetoken
             var uuid = p.uuid; // UUIDs of users who are connected with the channel
         },
         signal: function(s) {
             // handle signal
             console.log('s is   ' + JSON.stringify(s));
             var channelName = s.channel; // The channel for which the signal belongs
             var channelGroup = s.subscription; // The channel group or wildcard subscription match (if exists)
             var pubTT = s.timetoken; // Publish timetoken
             var msg = s.message; // The Payload
             var publisher = s.publisher; //The Publisher
         },
         user: function(userEvent) {
             console.log('userEvent is   ' + JSON.stringify(userEvent));
             // for Objects, this will trigger when:
             // . user updated
             // . user deleted
         },
         space: function(spaceEvent) {
             console.log('spaceEvent is  ' + JSON.stringify(spaceEvent));
             // for Objects, this will trigger when:
             // . space updated
             // . space deleted
         },
         membership: function(membershipEvent) {
             console.log('membershipEvent is   ' + JSON.stringify(membershipEvent));

             // for Objects, this will trigger when:
             // . user added to a space
             // . user removed from a space
             // . membership updated on a space
         },
         messageAction: function(ma) {
             console.log('ma is   ' + JSON.stringify(ma));
             // handle message action
             var channelName = ma.channel; // The channel for which the message belongs

             console.log('channelName ----     ' + channelName);

             var publisher = ma.publisher; //The Publisher
             var event = ma.message.event; // message action added or removed
             var type = ma.message.data.type; // message action type
             var value = ma.message.data.value; // message action value
             var messageTimetoken = ma.message.data.messageTimetoken; // The timetoken of the original message
             var actionTimetoken = ma.message.data.actionTimetoken; //The timetoken of the message action
         },
         status: function(s) {
             //	console.log('Status   is   ' + JSON.stringify(s));
             var affectedChannelGroups = s.affectedChannelGroups; // The channel groups affected in the operation, of type array.
             var affectedChannels = s.affectedChannels; // The channels affected in the operation, of type array.
             var category = s.category; //Returns PNConnectedCategory
             var operation = s.operation; //Returns PNSubscribeOperation
             var lastTimetoken = s.lastTimetoken; //The last timetoken used in the subscribe request, of type long.
             var currentTimetoken = s.currentTimetoken; //The current timetoken fetched in the subscribe response, which is going to be used in the next request, of type long.
             var subscribedChannels = s.subscribedChannels; //All the current subscribed channels, of type array.

             if (category === "PNConnectedCategory") {
                 //	console.log(category);
                 console.log('in PNConnectCategory');
             }
         }
     });



     //Compress beneath max message size in kb. Returns null if compression can't get image small enough.
     function compressImage(canvas, size) {
         console.log('Canvas is  ' + canvas + ' size is  ' + size);
         var compression = 1.0;
         while (compression > 0.01) {
             var dataURL = canvas.toDataURL('image/jpeg', compression);
             if (dataURL.length / 1012 < size) return dataURL;
             if (compression <= 0.1) {
                 compression -= 0.01;
             } else {
                 compression -= 0.1;
             }
         }
         return null;
     }

     pubnub.hereNow({

             includeUUIDs: true,
             includeState: true
         },
         function(status, response) {
             //	console.log(JSON.stringify('Response in HereNow is  ' + JSON.stringify(response)));
         }
     );

     console.log("Subscribing..");

     pubnub.subscribe({
         channels: ['space-1', "image-demo"],
         withPresence: true

     });

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
         console.log('drawFromStream invoked with message ' + JSON.stringify(message));
         if (!message || message.message.plots.length < 1) return;
         drawOnCanvas(message.message.color, message.message.plots);
     }


     function postImageToSubscribedStream(message, canvas) {
         console.log('postImageToSubscribedStream ' + JSON.stringify(message));

         var img = new window.Image();
         img.addEventListener("load", function() {
             canvas.getContext("2d").drawImage(img, 0, 0);
         });
         img.setAttribute("src", message);

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


         var data = ({
             color: color,
             plots: plots
         });

         var publishConfig = {
             channel: "space-1",
             message: data,
             error: function(error) {
                 console.log('Error in painting ' + error);
             }
         }

         pubnub.publish(publishConfig, function(status, response) {
             //	console.log('In publish ...... ' + JSON.stringify(status) + '    response  ...' + JSON.stringify(response));
         });
         plots = [];
     }


     //Code for Animal Drag and Drop Begins
     // get the offset position of the canvas
     var $canvas = $("#drawCanvas");
     var Offset = $canvas.offset();
     var offsetX = Offset.left;
     var offsetY = Offset.top;

     var x, y, width, height;

     // select all .tool's
     var $tools = $(".tool");


     // make all .tool's draggable
     $tools.draggable({
         helper: 'clone',
     });


     // assign each .tool its index in $tools
     $tools.each(function(index, element) {
         $(this).data("toolsIndex", index);
     });


     // make the canvas a dropzone
     $canvas.droppable({
         drop: dragDrop,
     });


     // handle a drop into the canvas
     function dragDrop(event, ui) {
         console.log('Canvas 1 is ......   ' + canvas);
         // get the drop point (be sure to adjust for border)
         x = parseInt(ui.offset.left - offsetX) - 1;
         y = parseInt(ui.offset.top - offsetY);
         width = ui.helper[0].width;
         height = ui.helper[0].height;

         // get the drop payload (here the payload is the $tools index)
         var theIndex = ui.draggable.data("toolsIndex");
         // alert(theIndex);
         // drawImage at the drop point using the dropped image
         // This will make the img a permanent part of the canvas content


         ctx.drawImage($tools[theIndex], x, y, width, height);
         var canvas = document.getElementById('drawCanvas');

         console.log('Canvas 2 --------   ' + canvas);
         var dataURL = compressImage(canvas, 20);
         console.log('the dataURL is                 ' + dataURL);

         publishImage({
             message: dataURL
         })
     }

     function publishImage(data) {
         console.log('in publish Image ************  ');
         var publishConfig = {
             channel: "image-demo",
             message: data,
             error: function(error) { console.log('Error in publishing Image ' + error) }
         }

         pubnub.publish(publishConfig, function(status, response) {
             //	console.log('In publish ...... ' + JSON.stringify(status) + '    response  ...' + JSON.stringify(response));
         });

     }

     //Code for Animal Drag and Drop Ends

     //Need help here as we need to implement the same logic as the icons
     $("#postIt").draggable({
         handle: '.topBar'
     });


     //Code for file upload begins

     document.getElementById('imageinput').addEventListener('change', function(event) {
         alert('image uploaded');
         var img = new Image();
         img.onload = function() {
             ctx.drawImage(img, 0, 0);
             //   alert(canvas.toDataURL('image/jpeg'));
         };

         img.src = URL.createObjectURL(event.target.files[0]);

     });

     //Code for fileupload ends

 }
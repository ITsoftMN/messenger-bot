//chat bot first code

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

const token = process.env.FB_VERIFY_TOKEN;
const access = process.env.FB_ACCESS_TOKEN;
app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/',function(req,res){

	res.send('Hello first chatbot');
});

app.get('/webhook/',function(req,res){
	if( req.query['hub.verify_token'] ===  token ){
		res.send(req.query['hub.challenge']);
	}
	res.send('No entry');
});

//facebook chat post event

app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Get the webhook event. entry.messaging is an array, but 
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      
      let pageId = entry.id;
      let timeOfEvent = entry.time;

      entry.messaging.forEach(function(event){
      	 if(event.message){
      	 	receivedMessage(event);
      	 }else{
      	 	console.log('webhook received unknown events:',event)
      	 }
      });

    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

function receivedMessage(event){
	
	var senderID = event.serder.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	console.log("received message for user %d and page %d at %d with message: ",
		senderID,recipientID,timeOfMessage);

	console.log(JSON.stringify(message));

	var messageId = message.mid;
	var messageText = message.text;
	var messageAttachments = message.attachments;

	if(messageText){

		switch(messageText){

			case "generic":
			sendGenericMessage(senderID);
			break;
			default:

			sendTextMessage(senderID,messageText);
		}

	}else if(messageAttachments){
		sendTextMessage(senderID,"Message with attachments recieved");
	}
}

function sendGenericMessage(recipientId, messageText){
	
}

function sendTextMessage(recipientId, messageText){
	var messageData = {
		recipient:{
			id: recipientId;
		},
		message:{
			text:messageText;
		}
	};

	callSendAPI(messageData);
}

function callSendAPI(messageData){
	request({
		uri: "https://graph.facebook.com/v2.6/me/messages",
		qs: { access_token: access },
		method : "POST",
		json : messageData;
	},
	function(error,response,body){

		if(!error && response.statusCode == 200){
			var recipientId = body.recipient_id;
			var messageId = body.message_id;

			console.log('Successfully sent generic message with id %s to recipient %s',
				messageId, recipientId);
		}else{
			console.error("unable to send message.")
			console.error(response);
			console.error(error);
		}
	});
}

app.listen(app.get('port'), function(){
	console.log('running on port', app.get('port'));
});

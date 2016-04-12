Meteor.methods({
    createChat : function(users) {
        return Chats.insert(users);
    },

    addMessage : function(message, sessionId) {
		// see if we can find a chat object in the database
        // to which we'll add the message
	    var chat = Chats.findOne({_id:sessionId});

	    if (chat){// ok - we have a chat to use
	        var msgs = chat.messages; // pull the messages property
	        if (!msgs){// no messages yet, create a new array
	            msgs = [];
	        }

	        var this_user = Meteor.users.findOne({"_id": Meteor.userId()});

	        msgs.push({text: message,
	                   username: this_user["profile"]["username"],
	                   avatar: Meteor.absoluteUrl()+this_user["profile"]["avatar"]
	        });

	        // put the messages array onto the chat object
	        chat.messages = msgs;
	        // update the chat object in the database.
	        Chats.update(chat._id, chat);
	    } else {
			console.log("No chat found for this sessionId.");
	    }
    }
});

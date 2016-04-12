Meteor.subscribe("chats");
Meteor.subscribe("users");

// set up the main template the the router will use to build pages
Router.configure({
    layoutTemplate: 'ApplicationLayout'
});
// specify the top level route, the page users see when they arrive at the site
Router.route('/', function () {
    console.log("rendering root /");
    this.render("navbar", {to:"header"});
    this.render("lobby_page", {to:"main"});  
});

// specify a route that allows the current user to chat to another users
Router.route('/chat/:_id', function () {
    // the user they want to chat to has id equal to 
    // the id sent in after /chat/... 
    var otherUserId = this.params._id;
    // find a chat that has two users that match current user id
    // and the requested user id
    var filter = {$or:[
                        {user1Id:Meteor.userId(), user2Id:otherUserId}, 
                        {user2Id:Meteor.userId(), user1Id:otherUserId}
                        ]};
    var chat = Chats.findOne(filter);
    if (!chat){// no chat matching the filter - need to insert a new one
        chatId = Meteor.call("createChat", {user1Id:Meteor.userId(), user2Id:otherUserId});
    }
    else {// there is a chat going already - use that. 
        chatId = chat._id;
    }
    if (chatId){// looking good, save the id to the session
        Session.set("chatId",chatId);
    }
    this.render("navbar", {to:"header"});
    this.render("chat_page", {to:"main"});  
});

///
// HELPER FUNCTIONS
///
Template.available_user_list.helpers({
    users:function(){
        return Meteor.users.find();
    }
});

Template.available_user.helpers({
    getUsername:function(userId){
        user = Meteor.users.findOne({_id:userId});
        return user.profile.username;
    }, 
    isMyUser:function(userId){
        if (userId == Meteor.userId()){
            return true;
        }
        else {
            return false;
        }
    }
});

Template.chat_page.helpers({
    messages:function(){
        var chat = Chats.findOne({_id:Session.get("chatId")});
        return chat.messages;
    }, 
    other_user:function(){
        return ""
    }, 

});

Template.chat_page.events({
    // this event fires when the user sends a message on the chat page
    'submit .js-send-chat':function(event){
        // stop the form from triggering a page reload
        event.preventDefault();
        Meteor.call("addMessage", event.target.chat.value, Session.get("chatId"));
        // reset the form
        event.target.chat.value = "";
    }
});

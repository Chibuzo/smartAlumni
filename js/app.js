$(document).on('loadpanel', '#signin', function() {
    if(isLoggedIn()){
       // alert('logged in');
        goToPage("chats", "down");
    }

});

$(document).on('loadpanel', '#school-setup', function() {
    getStates();
});

$(document).on('loadpanel', '#chats', function() {
    if(!isLoggedIn()){
        goToPage("signin", "down");
    }
    else{
        //displayChats();
        $.ui.clearHistory();  

    }
});

$(document).on('unloadpanel', '#chats', function() {
    
});

$(document).on('loadpanel', '#group-chat', function() {
    if(!isLoggedIn()){
        goToPage("signin", "down");
    }
    else{
        setupGroupChat();
        $.ui.scrollToBottom('group-chat');
    }
});

$(document).on('unloadpanel', '#group-chat', function() {
 
});

$(document).on('loadpanel', '#chat', function() {
    if(!isLoggedIn()){
        goToPage("signin", "down");
    }
    else{
        setupContactChat();
        $.ui.scrollToBottom('chat');
    }
});

$(document).on('unloadpanel', '#chat', function() {
 
});

$(document).on('loadpanel', '#group-members', function() {
    if(!isLoggedIn()){
        goToPage("signin", "down");
    }
    else{
        getGroupMembers();
        getGroupPolls();
    }
});

$(document).on('unloadpanel', '#group-members', function() {
 
});

$(document).on('loadpanel', '#groups', function() {
    if(!isLoggedIn()){
        goToPage("signin", "down");
    }
    else{
        displayGroups();
        $.ui.clearHistory();  
    }
 
    
});

$(document).on('unloadpanel', '#groups', function() {
 
});

$(document).on('loadpanel', '#contacts', function() {
    if(!isLoggedIn()){
        goToPage("signin", "down");
    }
    else{
         //getContacts();
         displayContacts();
         $.ui.clearHistory();  
    }
});

$(document).on('unloadpanel', '#contacts', function() {
    
});

$(document).on('loadpanel', '#projects', function() {
    if(!isLoggedIn()){
        goToPage("signin", "down");
    }
    else{
        $.ui.clearHistory();  
        getProjects();
    }
});

$(document).on('unloadpanel', '#projects', function() {
 
});


$(document).on('loadpanel', '#project', function() {
    if(!isLoggedIn()){
        goToPage("signin", "down");
    }
    else{
        displayProjectDetails();
    }
});

$(document).on('unloadpanel', '#project', function() {
 
});

$(document).on('loadpanel', '#settings', function() {
    if(!isLoggedIn()){
        goToPage("signin", "down");
    }
    else{
        $.ui.clearHistory();  
    }
});

$(document).on('unloadpanel', '#settings', function() {
 
});

$(document).on('unloadpanel', '#poll', function() {
    clearPollPage();
});

$(document).on('loadpanel', '#request', function() {
    if(!isLoggedIn()){
        goToPage("signin", "down");
    }
    else{
        getPendingRequests();
    }
});

$(document).on('unloadpanel', '#request', function() {
 
});


/*
 * Sample page load snippet
$(document).on('loadpanel', '#sample', function() {
    if(!isLoggedIn()){
        goToPage("signin", "down");
    }
    else{
        
    }
});

$(document).on('unloadpanel', '#sample', function() {
 
});
*/
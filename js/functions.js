var SERVICE_URL_ROOT = "http://local.pacentltd.com/projects/jide/alumniconnect/api/";
//var SERVICE_URL_ROOT = "http://pacentlocal/projects/jide/alumniconnect/api/";
var SCHOOLS_SERVICE_URL_ROOT = "http://eduprojectfunding.com/api/school_api.php";
var SCHOOL_PROJECTS_URL_ROOT = "http://eduprojectfunding.com/api/";

var API_FILE = "index.php";
var SENT_REQUEST = 1;
var RECEIVED_REQUEST = 2;

var setup_firstName = '';
var setup_lastName = '';
var setup_email = '';
var setup_phone = '';
var setup_address = '';
var setup_dob = '';
var setup_occupation = '';
var setup_religion = '';
var setup_gender= '';
var setup_maritalStatus = '';
var setup_password = '';
var setup_verifiedPassword = '';

var primarySchoolState = '';
var primarySchool = '';
var primarySchoolYear = '';

var secondarySchoolState = '';
var secondarySchool = '';
var secondarySchoolYear = '';

var universityState = '';
var universitySchool = '';
var universityYear = '';

var primarySchools = new Array();
var secondarySchools = new Array();
var universities = new Array();

var primarySchoolId = 0;
var secondarySchoolId = 0;
var universityId = 0;

var currentContactChat = 0;
var currentGroupChat = 0;
var currentPoll = 0;
var currentProject = 0;

var activeChats = new Array();
var pendingGroupMessagesNotifications = new Array();
var pendingContactMessagesNotifications = new Array();

var contactList = new Array();
var contactRequests = new Array();

var activeChatsLastIds = new Array();
var projects = new Array();

//MESSGAE STATUS
var MSG_SENT = 1, MSG_DELIVERED = 2, MSG_READ = 3, MSG_DELETED = 4, MSG_FAILED = 5;
var numberOfMessagesDisplayed = 0;


var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    },
    
    getOs: function(){
        if(isMobile.Android()){
            return 'android';
        }
        
        else if(isMobile.iOS()){
            return 'ios';
        }
        else if(isMobile.BlackBerry()){
            return 'bb';
        }
        else if(isMobile.Windows()){
            return 'windows';
        }
        else{
            return 'other';
        }
        
    }
};

var devicePlatform = isMobile.getOs();

var push = {
    register: function() {
       // alert('register function called');
        var pushNotification = window.plugins.pushNotification;
        pushNotification.register(push.successHandler, push.errorHandler, {"senderID": "79796903382", "ecb": "push.onNotificationGCM"}); //Pacent Tech Push API Sender ID
    },
    // result contains any message sent from the plugin call
    successHandler: function(result) {
      //  alert('Callback Success! Result = ' + result);
      //  alert('successfully registered');

    },
    errorHandler: function(error) {
       // alert(error);
    },
    onNotificationGCM: function(e) {
        switch (e.event)
        {
            case 'registered':
                if (e.regid.length > 0)
                {
                    //console.log("Regid " + e.regid);
                  //  alert('push id = ' + e.regid);
                    regid = e.regid;
                    userId = getUserId();
                    
                    
                    opts = getDefaultAjaxObject();
                    opts.data = {action: 'register-push-id', push_id: regid, user_id: userId, device_platform: devicePlatform};
                    opts.beforeSendHandler = function(){};
                    opts.successHandler = function (){
                       // alert('push registered');
                        save('pushId' , regid);
                    };
                    opts.errorHandler = function (){};
                    
                    doAjax(opts);
                }
                break;

            case 'message':
                
                
                var p_type = e.payload.type;
                var p_id = e.payload.id;
                

                
                // this is the actual push notification. its format depends on the data model from the push server
                // alert('message = ' + e.message + ' msgcnt = ' + e.msgcnt);
                //push = true;
                //alert(push);

                // if this flag is set, this notification happened while we were in the foreground.
                // you might want to play a sound to get the user's attention, throw up a dialog, etc.
                if (e.foreground)
                {
                    _=function(id){return document.getElementById(id);};
                    _("group-chat").scrollTop += 100;
                    _("chat").scrollTop += 100;
                    
                    var p_type = e.payload.type;
                    var p_id = e.payload.id;
                    
                    if(p_type === 'group' || p_type === 'single'){
                        chat = getChat(p_type , p_id);
                       // alert(JSON.stringify(chat));
                        chat.unread += 1;
                        updateChatHistory(chat);
                    }
                    
                    
                    displayChats();
                    //alert('New Message Received');
                   // navigator.notification.alert("New Message Received", function() {
                   // }, 'Incoming Message', 'OK');
                }
                else
                {  //app was relaunched from the notification bar because it was closed.
                    if (e.coldstart)
                    {
                    var p_type = e.payload.type;
                    var p_id = e.payload.id;
                      //alert(JSON.stringify(e));
                        
                     // alert('coldstarted from push');
                      
                      //alert(p_type + ' / ' + p_id);
                      if(p_type === 'group'){
                          //alert('in group');
                          currentGroupChat = p_id;
                          goToPage('group-chat');
                      }
                      
                      if(p_type === 'single'){
                          //alert('in single');
                          currentContactChat = p_id;
                          goToPage('chat');
                      }
                      
                      if(p_type === 'request'){
                          //alert('in request');
                          goToPage('request');
                      }

                    }
                    //app was relaunched from the notification bar because it was in a background state.
                    else
                    {
                    var p_type = e.payload.type;
                    var p_id = e.payload.id;   
                        //alert(JSON.stringify(e));
                        
                       // alert('launched from background from push');
         
                        //alert(p_type + ' / ' + p_id);
                        if(p_type === 'group'){
                            //alert('in group');
                            currentGroupChat = p_id;
                            goToPage('group-chat');
                        }
                        
                        if(p_type === 'single'){
                            //alert('in single');
                            currentContactChat = p_id;
                            goToPage('chat');
                        }
                        
                        if(p_type === 'request'){
                            //alert('in request');
                            goToPage('request');
                        }

                    }
                }


                break;

            case 'error':
                 //alert('GCM error = ' + e.msg);
                break;

            default:
               // alert('An unknown GCM event has occurred');
                break;
        }
    }
};

document.addEventListener("deviceready", onDeviceReady);
function onDeviceReady() {
//    navigator.splashscreen.hide();

}




$(document).ready(function(){
    $.ui.launch();
    
   setInterval(pollGroupMessages , 5000);
   setInterval(checkForNewContacts , 60 * 1000); // every minute

});


function login(){
        phone = $("#phone-login").val();
        password = $("#password-login").val();

        
         if(phone === ''){
            $("#phone-login").focus();
        }
        
        else if(password === ''){
            $("#password-login").focus();
        }

        
        else{
            opts = {
                
                data: {action: 'alumni-login', phone: phone, password: password},
                dataType: 'json',
                timeout: 300000, //5 minutes
                crossDomain: true,
                beforeSendHandler: function(){
                   showMask('Connecting...'); 
                },
                successHandler: function(json) {
                    //console.log(json);
                    if(json.error === undefined){
                        profile = json.profile;
                        groups = json.groups;
                        contacts = json.contacts;

                        id = profile.id;
                        firstname= profile.firstname;
                        lastname= profile.lastname;

                        if(supportsLocalStorage()){
                            save('id', id);
                            save('firstname', firstname);
                            save('lastname', lastname);
                            saveArray("groups", groups);
                            saveArray("activeChats", activeChats);
                            saveArray("pendingGroupMessagesNotifications", pendingGroupMessagesNotifications);
                            saveArray("pendingContactMessagesNotifications", pendingContactMessagesNotifications);
                            saveArray("contactList", contacts);
                            saveArray("contactRequests", contactRequests);
                            saveArray("activeChatsLastIds" , activeChatsLastIds);
                            
                            
                            
                            $("#phone-login").val('');
                            $("#password-login").val('');
                            hideMask();
                            
                            goToPage("chats", "down");
                            push.register();
                            pollGroupMessages(0);
                            startApp();

                        }
                        else{
                            alert('Localstorage not supported');
                        }

                    }
                    else{
                        createPopup('Invalid Credentials' , 'Incorrect Phone Number or Password', true, 'Dismiss');
                    }


                },
                errorHandler: function(x , t, m) {
                    if (t === "timeout") {
                      
                        createPopup('Request Timeout' , 'The request has timed out. Please try again.', true, 'Dismiss');
                    } else {
                        //alert("Unable to connect to the server");
                        createPopup('No Internet Connection' , 'Unable to connect to the server. Please check your internet connection.', true, 'Dismiss');
                    }
                    
                   // alert('Unable to connect to server');
                },
                
                completeHandler: function(){
                    hideMask();
                   // getContacts();
                }
                
                
            };
            
            doAjax(opts);
        }
}

function logout(){
    
    //goToPage("signin" , "down");
    $.ui.clearHistory();
    
    userId = getUserId();
    pushId = getPushId();

    opts = getDefaultAjaxObject();
    opts.data = {action: 'delete-push-id', push_id: pushId, user_id: userId};
    opts.beforeSendHandler = function(){};
    opts.successHandler = function (){
        activeChatsLastId = getActiveChatsLastIds();
        
        
        localStorage.clear();
        saveArray("activeChatsLastIds" , activeChatsLastIds);
        goToPage("signin" , "down");
    };
    
    

    doAjax(opts);

    

}

function proceedToAlumniSetup(){
    error = validateBioData();
    
    if(!error){
        goToPage('school-setup' , 'slide');
    }
}

function validateBioData(){
    error = false;
    errorMsg = '';
    
    setup_firstName = $("#firstname").val().trim();
    setup_lastName = $("#lastname").val().trim();
    setup_email = $("#email").val().trim();
    setup_phone = $("#phone").val().trim();
    setup_address = $("#address").val().trim();
    setup_dob = $("#dob").val();
    setup_occupation = $("#occupation").val().trim();
    setup_religion = $("#religion").val().trim();
    setup_gender = $("#gender").val().trim();
    setup_maritalStatus = $("#marital_status").val().trim();
    setup_password = $("#password").val().trim();
    setup_verifiedPassword = $("#verifypassword").val().trim();
    
    if(setup_firstName == ''){
        error = true;
        errorMsg += 'Enter Your First Name<br>';
    }
    if(setup_lastName == ''){
        error = true;
        errorMsg += 'Enter Your Last Name<br>';
    }
    if(setup_email == ''){
        error = true;
        errorMsg += 'Enter Your Email Address<br>';
    }
    
    if(!validateEmail(setup_email)){
        error = true;
        errorMsg += 'Invalid Email Address<br>';
    }
    
    if(setup_phone == ''){
        error = true;
        errorMsg += 'Enter Your Phone Number<br>';
    }
    
    if(setup_dob == ''){
        error = true;
        errorMsg += 'Enter Your Date Of Birth<br>';
    }
    if(setup_occupation == ''){
        error = true;
        errorMsg += 'Enter Your Occupation<br>';
    }
    if(setup_religion == ''){
        error = true;
        errorMsg += 'Enter Your Religion<br>';
    }
    if(setup_gender == ''){
        error = true;
        errorMsg += 'Select Your Gender<br>';
    }
    
    if(setup_maritalStatus == ''){
        error = true;
        errorMsg += 'Select Your Marital Status<br>';
    }
    if(setup_lastName == ''){
        error = true;
        errorMsg += 'Enter Your Last Name<br>';
    }
    if(setup_password == ''){
        error = true;
        errorMsg += 'Enter Your Password<br>';
    }
    if(setup_verifiedPassword == ''){
        error = true;
        errorMsg += 'Verify Your Password<br>';
    }
    
    if(setup_password !== setup_verifiedPassword ){
        error = true;
        errorMsg += 'Verified Password doesn\'t match with original Password<br>';
    }
    if(error){
        createPopup('Unable To Proceed', errorMsg, true, 'Dismiss', '');
    }
    return error;
}

function setupSchools(){
    error = validateSchoolData();
    
    if(!error){
        register();
    }

}

function validateSchoolData(){
    error = false;
    errorMsg = '';
    
    currentYear = new Date().getFullYear();
    
    primarySchoolState = $("#pri-sch-state").val();
    primarySchool = $("#primary_school_field").val().trim();
    primarySchoolYear = $("#pri_grad_year").val().trim();
    
    secondarySchoolState = $("#sec-sch-state").val();
    secondarySchool = $("#secondary_school_field").val().trim();
    secondarySchoolYear = $("#sec_grad_year").val().trim();
    
    universityState = $("#uni-state").val();
    universitySchool = $("#university_field").val().trim();
    universityYear = $("#uni_grad_year").val().trim();
    

    
    if(primarySchoolState === '' && secondarySchoolState === '' && universityState === ''){
        error = true;
        errorMsg += "You must fill in the details for atleast one school.<br>";
        createPopup('Unable To Proceed', errorMsg, true, 'Dismiss', '');
        return error;
    }
    
    if(primarySchoolState !== ''){
        if(primarySchool === ''){
            error = true;
            errorMsg += "Enter your primary school's name.<br>";
        }
        
        if(primarySchoolYear === ''){
            error = true;
            errorMsg += "Enter your primary school's year of graduation.<br>";
        }
        else{
            if(isNaN(primarySchoolYear)){
                error = true;
                errorMsg += "Primary Schhol's year of graduation is invalid.<br>";
            }
            else{
                if(parseInt(primarySchoolYear) < 1940 || parseInt(primarySchoolYear) > currentYear){
                    error = true;
                    errorMsg += "Primary Schhol's year of graduation is invalid.<br>";
                }
            }
        }

    }
    if(secondarySchoolState !== ''){
        if(secondarySchool === ''){
            error = true;
            errorMsg += "Enter your secondary school's name.<br>";
        }
        
        if(secondarySchoolYear === ''){
            error = true;
            errorMsg += "Enter your secondary school's year of graduation.<br>";
        }
        else{
            if(isNaN(secondarySchoolYear)){
                error = true;
                errorMsg += "Secondary Schhol's year of graduation is invalid.<br>";
            }
            else{
                if(parseInt(secondarySchoolYear) < 1940 || parseInt(secondarySchoolYear) > currentYear){
                    error = true;
                    errorMsg += "Secondary Schhol's year of graduation is invalid.<br>";
                }
            }
        }

    }
    if(universityState !== ''){
        if(universitySchool === ''){
            error = true;
            errorMsg += "Enter your Tertiary Institution's name.<br>";
        }
        
        if(universityYear === ''){
            error = true;
            errorMsg += "Enter your Tertiary Institution's year of graduation.<br>";
        }
        else{
            if(isNaN(universityYear)){
                error = true;
                errorMsg += "Tertiary Institution's year of graduation is invalid.<br>";
            }
            else{
                if(parseInt(universityYear) < 1940 || parseInt(universityYear) > currentYear){
                    error = true;
                    errorMsg += "Tertiary Institution's year of graduation is invalid.<br>";
                }
            }
        }
    }

    if(error){
        createPopup('Unable To Proceed', errorMsg, true, 'Dismiss', '');
    }
    return error;
    
}

function register(){
    opts = getDefaultAjaxObject();
  //  $firstname, $lastname, $address, $email, $date_of_birth, $sex, $marital_status,
 //   $phone, $password, $pri_schl_id, $p_grad_yr, $sec_schl_id, $sec_grad_yr, $uni_schl_id, $uni_grad_yr)
    opts.data = {
        action: "signup",
        firstname : setup_firstName,
        lastname: setup_lastName,
        address: setup_address,
        email: setup_email,
        date_of_birth: setup_dob,
        sex: setup_gender,
        marital_status: setup_maritalStatus,
        phone: setup_phone,
        password: setup_password,
        pri_schl_id: primarySchoolId,
        p_grad_yr: primarySchoolYear,
        sec_schl_id: secondarySchoolId,
        sec_grad_yr: secondarySchoolYear,
        uni_schl_id: universityId,
        uni_grad_yr: universityYear
    };
    
    
    opts.beforeSendHandler = function (){
        showMask("Sign Up In Progress ...");
    };
    
    opts.successHandler = function (json){
        //alert('success');
       // console.log(json);
        
        profile = json.profile;
        groups = json.groups;
        
        id = profile.id;
        firstname= profile.firstname;
        lastname= profile.lastname;
        
        if(supportsLocalStorage()){
            save('id', id);
            save('firstname', firstname);
            save('lastname', lastname);
            saveArray("groups", groups);
            saveArray("activeChats", activeChats);
            saveArray("contactList", contactList);
            saveArray("contactRequests", contactRequests);
            saveArray("activeChatsLastIds" , activeChatsLastIds);
            
            hideMask();
            goToPage("chats", "down");
            startApp();
            
            push.register();
            
        }
        else{
            alert('Localstorage not supported');
        }
        

    };
    
    opts.completeHandler = function(){
       // getContacts();
        hideMask();
    };
    
    doAjax(opts);
    
    

}

function getUserId(){
    if (localStorage.getItem('id') !== null) {
       
        return localStorage.getItem('id');
    }
    return 0; 
}

function getFirstName(){
    if (localStorage.getItem('firstname') !== null) {
       
        return localStorage.getItem('firstname');
    }
    return ""; 
}

function getPushId(){
    if (localStorage.getItem('pushId') !== null) {
       
        return localStorage.getItem('pushId');
    }
    return ""; 
}

function getLastName(){
    if (localStorage.getItem('lastname') !== null) {
       
        return localStorage.getItem('lastname');
    }
    return ""; 
}

function getFullName(){
    return getFirstName() + ' ' + getLastName();
}

function getUserGroups(){
    if(localStorage["groups"] != undefined){
         userGroups = JSON.parse(localStorage["groups"]);
         return userGroups;
    }
    
    return new Array();
}

function getGroupDetailsBySchoolId(schoolId){
    var ug = getUserGroups();
    
    for(var i = 0; i < ug.length; i++){
        var g = ug[i];
        console.log(g);
        if(g.school_id == schoolId){
            return g;
        }
    }
    return null;
}

function getActiveChats(){
    if(localStorage["activeChats"] != undefined){
         activeChats = JSON.parse(localStorage["activeChats"]);
         return activeChats;
    }
    
    return new Array();
}

function getActiveChatsLastIds(){
    if(localStorage["activeChatsLastIds"] != undefined){
         activeChatsLastIds = JSON.parse(localStorage["activeChatsLastIds"]);
         return activeChatsLastIds;
    }
    
    return new Array();
}

function getContactList(){
    if(localStorage["contactList"] != undefined){
         contactList = JSON.parse(localStorage["contactList"]);
         return contactList;
    }
    
    return new Array();
}

function getContactRequests(){
    if(localStorage["contactRequests"] != undefined){
         contactRequests = JSON.parse(localStorage["contactRequests"]);
         return contactRequests;
    }
    
    return new Array();
}

function getChat(chatType , chatId){
    activeChats = getActiveChats();
    
    for(i = 0; i < activeChats.length; i++){
        chat = activeChats[i];
        if(chat.type == chatType && chat.id == chatId){
            return chat;
        }
    }
    return null;
}

function getChatLastId(chatType , chatId){
    activeChatsLastId = getActiveChatsLastIds();
    
    for(i = 0; i < activeChatsLastId.length; i++){
        lastId = activeChatsLastId[i];
        if(lastId.type == chatType && lastId.id == chatId){
            return lastId;
        }
    }
    return null;
}

function updateActiveChats(chatType , chatId, messageObject , append){
    chat = getChat(chatType , chatId);
    
    if(chat != null){
        //chat.messages.length = 0;
      //  console.log("Chat not null");
       // console.log("before push");
      //  console.log(chat.messages);
        chat.messages.push(messageObject);
       // console.log("after push");
       // console.log(chat.messages);
        updateChatHistory(chat , append);
    }
    else{
        //console.log("Chat is null");
        chat = getChatHistoryObject();
        chat.id = chatId;
        chat.type = chatType;
        chat.messages.push(messageObject);
        
        //console.log(chat);
        
        activeChats = getActiveChats();
        activeChats.push(chat);
        saveArray('activeChats', activeChats);
    }
    
}

function updateActiveChatsLastId(chatType , chatId, lastMessageId){
    lastId = getChatLastId(chatType , chatId);
    
    if(lastId != null){

        
        lastId.lastMessageId = lastMessageId;
        updateChatLastIds(lastId);
    }
    else{
        
        lastId = getActiveChatLastIdObject();
        lastId.id = chatId;
        lastId.type = chatType;
        lastId.lastMessageId = lastMessageId;
        
        activeChatsLastIds = getActiveChatsLastIds();
        activeChatsLastIds.push(lastId);
        saveArray("activeChatsLastIds", activeChatsLastIds);
    }
    
}

function updateChatHistory(chat , append){
    activeChats = getActiveChats();
    
    for(i = 0; i < activeChats.length; i++){
        ch = activeChats[i];
        if(ch.type == chat.type && ch.id == chat.id){
            activeChats.splice( i , 1);
            activeChats.push(chat);

            saveArray('activeChats' , activeChats);

        }
    }
}

function deleteChat(chatType , chatId){
    chat = getChat(chatType , chatId);
    activeChats = getActiveChats();
    if(chat != null){
        for(i = 0; i < activeChats.length; i++){
            ch = activeChats[i];
            if(ch.type == chat.type && ch.id == chat.id){
                activeChats.splice( i , 1);

                saveArray('activeChats' , activeChats);
                $("li-chat-" + chatType + "-" + chatId).remove();
            }
        }
    }
}

function updateChatLastIds(lastId){
    activeChatsLastIds = getActiveChatsLastIds();
    
    for(i = 0; i < activeChatsLastIds.length; i++){
        ch = activeChatsLastIds[i];
        if(ch.type == lastId.type && ch.id == lastId.id){
            activeChatsLastIds.splice( i , 1);
            activeChatsLastIds.push(lastId);
            
            saveArray('activeChatsLastIds' , activeChatsLastIds);
        }
    }
}

function getGroupById(groupId){
    userGroups = getUserGroups();
    
    for( i = 0; i < userGroups.length; i++){
        group = userGroups[i];
      //  console.log(group.group_id + ' / ' + groupId);
        if(group.group_id == groupId){
         //   console.log('match');
            return group;
        }
    }
    return null;
}

function getContactById(contactId){
    contactList = getContactList();
    
    for( i = 0; i < contactList.length; i++){
        contact = contactList[i];
      //  console.log(group.group_id + ' / ' + groupId);
        if(contact.contact_user_id == contactId){
         //   console.log('match');
            return contact;
        }
    }
    return null;
}

function checkIfContactIsInRequestList(contactId){
    contactRequests = getContactList();
    
    for( i = 0; i < contactRequests.length; i++){
        contact = contactRequests[i];
      //  console.log(group.group_id + ' / ' + groupId);
        if(contact.contactId == contactId){
         //   console.log('match');
            return contact;
        }
    }
    return null;
}


function getStates(){
    opts = getDefaultAjaxObject();
    
    //opts.url = SCHOOLS_SERVICE_URL_ROOT;
    opts.data = {action:"get-all-states"};

    opts.beforeSendHandler = function(){
        showMask('Retrieving States');
    };
    
    opts.successHandler = function(json){
       
       statesHTML = "<option value=''>Select State</option>";
       
       for(i = 0; i < json.length; i++){
           state = json[i];
           stateId = state.id;
           stateName = state.state;
           
           statesHTML += "<option value='"+ stateId +"'>"+ stateName +"</option>";
       }
       
       $("#pri-sch-state").html(statesHTML);
       $("#sec-sch-state").html(statesHTML);
       $("#uni-state").html(statesHTML);
    };
    
    doAjax(opts);
}

function fetchSchoolsByType(type){
    
    switch (type){
        case 1:
            stateId = $("#pri-sch-state").val();
            schoolCategory = 'Primary';
            getSchools(stateId, schoolCategory);
            break;
        case 2:
            stateId = $("#sec-sch-state").val();
            schoolCategory = 'Secondary';
            getSchools(stateId, schoolCategory);
            break;
        case 3:
            stateId = $("#uni-state").val();
            schoolCategory = 'Tertiary';
            getSchools(stateId, schoolCategory);
            break;
    }
    
}

function getSchools(stateId, schoolCategory){
    opts = getDefaultAjaxObject();
    
    //opts.url = SCHOOLS_SERVICE_URL_ROOT;
    opts.data = {action: "get-schools-by-state", state_id: stateId, school_category: schoolCategory};
    
    opts.beforeSendHandler = function(){
        showMask('Fetching Schools ...');
    };
    
    opts.successHandler = function(json){
        
        switch (schoolCategory){
            case 'Primary':
                primarySchools = json;
                //console.log(primarySchools[0].school_name);
                break;
            case 'Secondary':
                secondarySchools = json;
                //console.log(secondarySchools[0].school_name);
                break;
            case 'Tertiary':
                universities = json;
               // console.log(universities[0].school_name);
                break;
        }
    };
    
    doAjax(opts);
}

function autocompleteSchoolsList(schoolCategory){
    switch (schoolCategory){
        case 1:
            primarySchoolId = 0;
            val = $("#primary_school_field").val();
            //console.log(val);
            temp = new Array();
            schoolsListHTML = '';
            for(i = 0; i < primarySchools.length; i++){
                school = primarySchools[i];
                schoolName = school.school_name;
                match = schoolName.match(val);
                
                if(match !== null){
                    temp.push(school);

                }
                else{

                }
            }
            
            if(temp.length > 0 && val.trim() !== ''){
                for(i = 0; i < temp.length; i++){
                    
                    schoolsListHTML += '<li onclick="selectPrimarySchool(\''+temp[i].school_name+'\',\''+temp[i].id+'\')"><a href="#">'+temp[i].school_name+'</a></li>';
                    
                     
                }
                $("#pri-sch-autocomplete-list").show();
                $("#pri-sch-autocomplete-list").html(schoolsListHTML); 
            }
            break;
        case 2:
            secondarySchoolId = 0;
            val = $("#secondary_school_field").val();
            //console.log(val);
            temp = new Array();
            schoolsListHTML = '';
            for(i = 0; i < secondarySchools.length; i++){
                school = secondarySchools[i];
                schoolName = school.school_name;
                match = schoolName.match(val);
                
                if(match !== null){
                    temp.push(school);

                }
                else{

                }
            }
            
            if(temp.length > 0 && val.trim() !== ''){
                for(i = 0; i < temp.length; i++){
                    
                    schoolsListHTML += '<li onclick="selectSecondarySchool(\''+temp[i].school_name+'\',\''+temp[i].id+'\')"><a href="#">'+temp[i].school_name+'</a></li>';
                    
                     
                }
                $("#sec-sch-autocomplete-list").show();
                $("#sec-sch-autocomplete-list").html(schoolsListHTML); 
            }
            break;
        case 3:
            universityId = 0;
            val = $("#university_field").val();
            //console.log(val);
            temp = new Array();
            schoolsListHTML = '';
            for(i = 0; i < universities.length; i++){
                school = universities[i];
                schoolName = school.school_name;
                match = schoolName.match(val);
                
                if(match !== null){
                    temp.push(school);

                }
                else{

                }
            }
            
            if(temp.length > 0 && val.trim() !== ''){
                for(i = 0; i < temp.length; i++){
                    
                    schoolsListHTML += '<li onclick="selectUniversity(\''+temp[i].school_name+'\' , \''+temp[i].id+'\')"><a href="#">'+temp[i].school_name+'</a></li>';
                    
                     
                }
                $("#uni-autocomplete-list").show();
                $("#uni-autocomplete-list").html(schoolsListHTML); 
            }
            break;
    }
}

function selectPrimarySchool(schoolName, id){
    $("#primary_school_field").val(schoolName);
    $("#pri-sch-autocomplete-list").empty();
    $("#pri-sch-autocomplete-list").hide();
    
    primarySchoolId = id;
}

function selectSecondarySchool(schoolName, id){
    $("#secondary_school_field").val(schoolName);
    $("#sec-sch-autocomplete-list").empty();
    $("#sec-sch-autocomplete-list").hide();
    
    secondarySchoolId = id;
}

function selectUniversity(schoolName , id){
    $("#university_field").val(schoolName);
    $("#uni-autocomplete-list").empty();
    $("#uni-autocomplete-list").hide();
    
    universityId = id;
    
}

function checkSchoolId(type){
    opts = getDefaultAjaxObject();
   // opts.url = SCHOOLS_SERVICE_URL_ROOT;
    switch (type){
        case 1:
           // console.log('pri: ' + primarySchoolId);
            $("#pri-sch-autocomplete-list").empty();
            $("#pri-sch-autocomplete-list").hide();
            
            $("#inv-pri").text("");
            
            schName = $("#primary_school_field").val().trim();
            state_id = $("#pri-sch-state").val();
            if(primarySchoolId === 0 && schName !== ''){
                
                opts.data = {action:"verify-school",school_name:schName, school_category:"Primary", state_id:state_id};
                opts.beforeSendHandler = function (){};
                opts.successHandler = function (json){
                    console.log(json);
                    if(json.id == -1){
                        $("#inv-pri").text("This school doesn't exist in the selected state");
                    }
                    else{
                        primarySchoolId = json.id;
                    }
                };
                
                doAjax(opts);
            }
            break;
        case 2:
           // console.log('sec: ' + secondarySchoolId);
            $("#sec-sch-autocomplete-list").empty();
            $("#sec-sch-autocomplete-list").hide();
            
            $("#inv-sec").text("");
            
            schName = $("#secondary_school_field").val().trim();
            state_id = $("#sec-sch-state").val();
            if(secondarySchoolId === 0 && schName !== ''){
                
                opts.data = {action:"verify-school",school_name:schName, school_category:"Secondary",state_id:state_id};
                opts.beforeSendHandler = function (){};
                opts.successHandler = function (json){
                    console.log(json);
                    if(json.id == -1){
                        $("#inv-sec").text("This school doesn't exist in the selected state");
                    }
                    else{
                        secondarySchoolId = json.id;
                    }
                };
                
                doAjax(opts);
            }
            break;
        case 3:
           // console.log('uni: ' + universityId);
            $("#uni-autocomplete-list").empty();
            $("#uni-autocomplete-list").hide();
            
            $("#inv-uni").text("");
            
            schName = $("#university_field").val().trim();
            state_id = $("#uni-state").val();
            if(universityId === 0 && schName !== ''){
                
                opts.data = {action:"verify-school",school_name:schName, school_category:"Tertiary", state_id:state_id};
                opts.beforeSendHandler = function (){};
                opts.successHandler = function (json){
                    console.log(json);
                    if(json.id == -1){
                        $("#inv-uni").text("This school doesn't exist in the selected state");
                    }
                    else{
                        universityId = json.id;
                    }
                };
                
                doAjax(opts);
            }
            break;
    }
}

function validateEmail(email)   
{  
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){  
       return true;  
    }  

    return false;
}  


function displayGroups(){
    userGroups = getUserGroups();
    if(userGroups.length > 0){
        $("#no-groups").hide();
        
        groupsHTML = '';
        
        for(i = 0; i < userGroups.length; i++){
            school_name = userGroups[i].school_name;
            school_set = userGroups[i].grad_year;
            group_id = userGroups[i].group_id;
            
            groupsHTML += '<li>' +
                '<a href="#group-chat" id="'+group_id+'" onclick="setCurrentGroupChat('+group_id+')">'+
                    '<img class="list-image list-image-contacts" src="images/no_group.png" />'+
                    '<div class="list-text">'+
                        '<b>' +school_name+ '</b>'+
                        '<br>'+
                        '<span class="group-year-holder">Class of '+ school_set +'</span>'+
                    '</div>'+
                '</a>'+
            '</li>';
            
        }
        
        $("#groups-list").html(groupsHTML);
        
    }
    else{
        $("#no-groups").show();
    }
}

function displayContacts(){
    contactList = getContactList();
    if(contactList.length > 0){
        $("#no-contacts").hide();
        $(".contact-link").unbind("longTap");
        
        var contactsHTML = '';
        
        for(var i = 0; i < contactList.length; i++){
            //console.log("cl = " + i);
            var contact_name = contactList[i].fullname;
            var contact_id = contactList[i].contact_user_id;
            
            //console.log(contact_name);
            
            contactsHTML += '<li id="li-contact-'+contact_id+'" >' +
                            '<a id="contact-'+contact_id+'" class="contact-link" href="#chat" onclick="setCurrentContactChat('+contact_id+')">' +
                                '<img class="list-image list-image-contacts" src="images/no_contact.png" />' +
                                '<div class="list-text list-text-contacts">' +
                                    '<b id="contact-name-'+contact_id+'" >'+contact_name+'</b>' +
                                '</div>' +
                           '</a>' +
                        '</li>';
            
            
        }
        
        $("#contacts-list").html(contactsHTML);
        
        $(".contact-link").on("longTap",function(){
           
            var sp = $(this).attr('id').split('-');
            var id = sp[1];
            var cn = $("#contact-name-" + id).text().trim();
          
            showDeleteContactActionSheet(id , cn);
        });
        
    }
    else{
        $("#no-contact").show();
    }
}

function displayChats(){
    $(".single-chat").unbind("longTap");
    active_chats = getActiveChats();
   // console.log(active_chats);
   // console.log("length : " + active_chats.length);
    if(active_chats.length > 0){
        $("#no-chats").hide();
        
        chatsListHTML = '';
    
        for( var i = 0; i < active_chats.length; i++){
           
            var c = active_chats[i];
            
            var type = c.type;
            var id = c.id;
            var messages = c.messages;
            var pendingMessagesCount = c.unread;
            
           // alert(JSON.stringify(c));
            
            //console.log(active_chats[i]);
            
            if(type == "group"){
                
                group = getGroupById(id);
                groupName = group.school_name + ' - Class Of ' + group.grad_year;
                lastMessage = getLastItem(messages);
                senderName = '';
                senderMessage = '';
                
                if(lastMessage != null){
                    senderName = lastMessage.sender;
                    senderMessage = lastMessage.content;
                }
                
                chatsListHTML += '<li id="li-chat-group-'+id+'" class="li-chat-group">' ;
                if(pendingMessagesCount > 0){
                    chatsListHTML += '<span class="af-badge br">'+ pendingMessagesCount +'</span>';
                }
                 chatsListHTML += '<a href="#group-chat" id="group-chat-'+id+'" class="group-chat" onclick="setCurrentGroupChat('+id+')">'+
                                    '<img class="list-image" src="images/no_group.png" />'+
                                    '<div class="list-text">'+
                                       '<b>' + groupName + '</b>'+
                                        '<br>'+
                                        '<span>'+ senderName +'</span>' +
                                        '<br>'+
                                        '<span class="message-snippet">'+ senderMessage +'</span>'+
                                    '</div>'+
                                '</a>'+
                            '</li>';
            }
            
            else if(type == "single"){
                
                contact = getContactById(id);
                if(contact == null){
                    continue;
                }
                senderName = contact.fullname;
                lastMessage = getLastItem(messages);
                senderMessage = '';
                
                if(lastMessage != null){       
                    senderMessage = lastMessage.content;
                }
                
                chatsListHTML += '<li id="li-chat-single-'+id+'" class="li-chat-single">' ;
                if(pendingMessagesCount > 0){
                    chatsListHTML += '<span class="af-badge br">'+ pendingMessagesCount +'</span>';
                }
                 chatsListHTML += '<a href="#chat" id="single-chat-'+id+'" class="single-chat" onclick="setCurrentContactChat('+id+')">'+
                                    '<img class="list-image" src="images/no_contact.png" />'+
                                    '<div class="list-text">'+
                                       '<b>' + senderName + '</b>'+
                                        '<br>'+
                                        '<span class="message-snippet">'+ senderMessage +'</span>'+
                                    '</div>'+
                                '</a>'+
                            '</li>';
             
            }
            
            
        }
        //console.log(chatsListHTML);
        $("#chats-list").html(chatsListHTML);
        $(".single-chat").on("longTap",function(){
           
            var sp = $(this).attr('id').split('-');
            var id = sp[2];
          
            showChatOptions('single' , id);
        });

    }
    else{
        $("#no-chats").show();
    }

   // setupGroupChat();
   // setupContactChat();
   
}

function setCurrentGroupChat(groupChatId){
    currentGroupChat = groupChatId;
}

function setCurrentContactChat(contactId){
    currentContactChat = contactId;
}

function getGroupMembers(){
    opts = getDefaultAjaxObject();
    
    opts.data = {action: "get-group-members" , group_id: currentGroupChat};
    opts.beforeSendHandler = function(){
        showMask("Fetching Group Members ...");
    };
    
    opts.successHandler = function(json){
        //console.log(json[0]);
        totalMembers = json.length;
        membersHTML = '<li class="divider">Total Members : ' + totalMembers + ' </li>';
        
        for( i = 0; i < json.length; i++){
            member = json[i];
            //console.log(member);
            memberName = member.fullname;
            memberId = member.user_id;

            if(memberId == getUserId()){
                membersHTML += '<li>'+
                '<a href="#" id="'+memberId+'">'+
                    '<img class="list-image list-image-contacts" src="images/no_contact.png" />'+
                    '<div class="list-text list-text-contacts">'+
                        '<b>You</b>'+
                    '</div>'+
                '</a>'+
                '</li>';
            }
            else{
               // if(checkIfContactIsInRequestList(memberId) !== null){
                    membersHTML += '<li onclick="sendContactRequest('+ memberId +' ,\''+memberName+'\')">'+
                    '<a href="#" id="'+memberId+'">'+
                        '<img class="list-image list-image-contacts" src="images/no_contact.png" />'+
                        '<div class="list-text list-text-contacts">'+
                            '<b>'+memberName+'</b>'+
                        '</div>'+
                    '</a>'+
                    '</li>';
               // }
                /*
                if(isContact(memberId)){
                    membersHTML += '<li class="member_is_contact" onclick="sendContactRequest('+ memberId +' ,\''+memberName+'\')">'+
                    '<a href="#" id="'+memberId+'">'+
                        '<img class="list-image list-image-contacts" src="images/no_contact.png" />'+
                        '<div class="list-text list-text-contacts">'+
                            '<b>'+memberName+'</b>'+
                        '</div>'+
                    '</a>'+
                    '</li>';
                }
                */
            }
            
        }
        $("#group-members-list").html(membersHTML);
  /*      
        <li class='divider'>Total Members : 21</li>
        <li>
            <a href="#">
                <img class="list-image list-image-contacts" src="images/no_contact.png" />
                <div class="list-text list-text-contacts">
                    <b>Contact 1</b>
                </div>
            </a>
        </li>
*/
    };
    
    doAjax(opts);
}

function setupGroupChat(){
    //alert(currentGroupChat);
    group = getGroupById(currentGroupChat);
    $("#group-chat-area").empty();
    if(group != null){
       // alert('not null');
        $("#group-name").text(group.school_name);
        $("#group-set").text("Class Of " + group.grad_year);
        
        chatHistory = getChat("group" , currentGroupChat);
        
        if(chatHistory != null){
            userId = getUserId();
            messages = chatHistory.messages;
            
            messagesHTML = '';
            
            for( i = 0; i < messages.length; i++ ){
                numberOfMessagesDisplayed++;
                messageObject = messages[i];
                
                content = messageObject.content;
                sender = messageObject.sender;
                senderId = messageObject.senderId;
                dataSent = messageObject.dateSent;
                
                if(userId == senderId){
                    messagesHTML += '<div class="bubbledRight" id="msg-'+numberOfMessagesDisplayed+'">' +
                                    '<span class="msg-name">'+ sender +'</span>' +
                                    '<br>' +
                                    '<div class="msg-content">' +
                                    content +
                                    '</div>' +
                                    '<br>' +
                                    '<span class="msg-date-time">' +
                                        dataSent +
                                        //'<img src="images/msg_status_sent.png">' +
                                    '</span>' +
                                '</div>';
                }
                else{
                    messagesHTML += '<div class="bubbledLeft" id="msg-'+numberOfMessagesDisplayed+'">' +
                                    '<span class="msg-name">'+ sender +'</span>' +
                                    '<br>' +
                                    '<div class="msg-content">' +
                                    content +
                                    '</div>' +
                                    '<br>' +
                                    '<span class="msg-date-time">' +
                                        dataSent +
                                    '</span>' +
                                '</div>';
                }
                
            }
            $("#group-chat-area").html(messagesHTML);
            
            chatHistory.unread = 0;
            updateChatHistory(chatHistory);
        
        }
    }
    else{
       //  alert('null');

    }
}

function setupContactChat(){
   // alert(currentContactChat);
    contact = getContactById(currentContactChat);
    numberOfMessagesDisplayed = 0;
    $("#chat-area").empty();
    if(contact != null){
       // alert('contact not null');
        $("#contact-name").text(contact.fullname);
        
        chatHistory = getChat("single" , currentContactChat);
        
        if(chatHistory != null){
           // alert('chat history not null');
            userId = getUserId();
            messages = chatHistory.messages;
            
            messagesHTML = '';
            
            for( i = 0; i < messages.length; i++ ){
                var messageObject = messages[i];
                numberOfMessagesDisplayed++;
                
                content = messageObject.content;
                sender = messageObject.sender;
                senderId = messageObject.senderId;
                dataSent = messageObject.dateSent;
                
                if(userId == senderId){
                    messagesHTML += '<div class="bubbledRight" id="msg-'+numberOfMessagesDisplayed+'">' +
                                    '<span class="msg-name">'+ getFullName() +'</span>' +
                                    '<br>' +
                                    '<div class="msg-content">' +
                                    content +
                                    '</div>' +
                                    '<br>' +
                                    '<span class="msg-date-time">' +
                                        dataSent ;
                                        //'<img src="images/msg_status_sent.png">' +
                                        if(messageObject.status == MSG_SENT){
                                                      
                                            messagesHTML += '<img class="status-indicator" id="status-indic-'+numberOfMessagesDisplayed+'" src="images/sent.png?t=1">';
                                        }
                                        else if(messageObject.status == MSG_DELIVERED){
                                            messagesHTML += '<img class="status-indicator" id="status-indic-'+numberOfMessagesDisplayed+'" src="images/delivered.png?t=1">';                                        
                                        }
                                        else if(messageObject.status == MSG_READ){
                                            messagesHTML += '<img class="status-indicator" id="status-indic-'+numberOfMessagesDisplayed+'" src="images/read.png?t=1">';                                  
                                        }
                                        else if(messageObject.status == MSG_FAILED){
                                            messagesHTML += '<img class="status-indicator" id="status-indic-'+numberOfMessagesDisplayed+'" src="images/failed.png?t=1">';                                  
                                        }
                                        else{
                                            messagesHTML += '<img class="status-indicator" id="status-indic-'+numberOfMessagesDisplayed+'" src="images/pending.png?t=1">';                                   
                                        }
                                    messagesHTML +='</span>' +
                                '</div>';
                }
                else{
                    messagesHTML += '<div class="bubbledLeft" id="msg-'+numberOfMessagesDisplayed+'">' +
                                    '<span class="msg-name">'+ sender +'</span>' +
                                    '<br>' +
                                    '<div class="msg-content">' +
                                    content +
                                    '</div>' +
                                    '<br>' +
                                    '<span class="msg-date-time">' +
                                        dataSent +
                                    '</span>' +
                                '</div>';
                        
                        
                 
                    if(messageObject.status != MSG_READ){
                        updateMessageStatus(messageObject.id , MSG_READ);
                    }

                }
                

                
                
                
            }
            $("#chat-area").html(messagesHTML);
            
            chatHistory.unread = 0;
            updateChatHistory(chatHistory);
        
        }
    }
    else{
       //  alert('null');

    }
}

//item must be an array
function getLastItem(item){
    if(item.length < 1){
        return null;
    }
    lastItem = item[item.length - 1];
    return lastItem;
}

function pollGroupMessages(index) {
    //console.log('polling ...');
    
    if(!isLoggedIn()){
        return;
    }
    
    groups = getUserGroups();
    if(index == undefined){
       // alert('polling was undefined but i used my master jedi skills to set it to 0');
        index = 0;
    }
   // alert('polling: ' + index);
   
   if(groups.length < 1){
      // displayChats();
       pollContactMessages(0);
       return;
       
   }
   
        
    group = groups[index];
    
    if(group == undefined){
       // alert('should display chats now');
       // displayChats();
        setupGroupChat();
        pollContactMessages(0);
        return;
        
    }
    
    groupId = group.group_id;

    opts = getDefaultAjaxObject();
    opts.data = {action : "get-group-messages", group_id: groupId};
    // opts.async = false;
    opts.beforeSendHandler = function(){};
    opts.successHandler = function (json){
       // console.log(json);
       // alert('suucess: ' + groupId);
        messagesFromServer = json;
        //messagesOnDevice = getChat("group" , groupId);
       // console.log(messagesFromServer);
      //  alert(messagesFromServer.length);
        chat = getChat("group" ,  groupId);
        if(chat != null){
            chat.messages.length = 0; // Clear out chat history before populating
            updateChatHistory(chat);
        }
        for( ind = 0; ind < messagesFromServer.length; ind++){
            msg = messagesFromServer[ind];
           // console.log(msg);
            messageObject = getChatHistoryMessageObject();

            messageObject.content = msg.message;
            messageObject.dateSent = moment(msg.date_sent).format('DD MMM YYYY : HH :mm');
            messageObject.sender = msg.firstname + ' ' + msg.lastname;
            messageObject.senderId = msg.sender_id;

            updateActiveChats("group" , groupId, messageObject);

        }
       // displayChats();
        ++index;
        pollGroupMessages(index);


    };
    opts.completeHandler = function (json){

    };
    
    opts.errorHandler = function (){};

    doAjax(opts);
    
    
    
}

function pollContactMessages(index) {
   // console.log('polling cm ...');
    
    if(!isLoggedIn()){
        return;
    }
    
    var contacts = getContactList();
    if(index == undefined){
        //alert('polling cm was undefined but i used my master jedi skills to set it to 0');
        index = 0;
    }
   // alert('polling: ' + index);
   
   if(contacts.length < 1){
       displayChats();
        
       return;
       
   }
   
        
    var contact = contacts[index];
    
    if(contact == undefined){
       // alert('should display chats now');
       setupContactChat();
        displayChats();
        //setupContactChat();
        return;
        
    }
    
    var contactId = contact.contact_user_id;
    var contactName = contact.fullname;
    var lastMessageId = 0;
    
    var lastId = getChatLastId("single" , contactId);
    
    //alert(contactId);
    if(lastId != null){
        lastMessageId = lastId.lastMessageId;
    }
    else{
        console.log("lastMessageId is null :( " + lastMessageId);
    }
    //console.log("contactId: " + contactId);
   // console.log("lastMessageId: " + lastMessageId);
    var opts = getDefaultAjaxObject();
    opts.data = {action : "get-messages", sender_id: contactId, receiver_id: getUserId(),
        last_message_id: lastMessageId};
    // opts.async = false;
    opts.beforeSendHandler = function(){};
    opts.successHandler = function (json){
       // console.log(json);
       // alert('suucess: ' + groupId);
        var messagesFromServer = json;
        
    if(messagesFromServer != false){
        
        //messagesOnDevice = getChat("group" , groupId);
       // console.log(messagesFromServer);
      //  alert(messagesFromServer.length);
        var chat = getChat("single" ,  contactId);
        if(chat != null){
            //chat.messages.length = 0; // Clear out chat history before populating
            updateChatHistory(chat);
        }
        
        var msgTotal = messagesFromServer.length - 1;
       
        for( var ind = 0; ind < messagesFromServer.length; ind++){
           
            var msg = messagesFromServer[ind];
           // console.log(msg);
            var messageObject = getChatHistoryMessageObject();
            
            messageObject.id = msg.id;
            messageObject.content = msg.message;
            messageObject.dateSent = moment(msg.date_sent).format('DD MMM YYYY : HH :mm');
            if(msg.sender_id == getUserId()){
                messageObject.sender = getFullName();
            }
            else{
                messageObject.sender = contactName;
            }
            messageObject.senderId = msg.sender_id;
            messageObject.status = msg.status;
            
          //  alert("msgTotal: " + msgTotal + " / ind : " + ind);
            updateActiveChats("single" , contactId, messageObject, true);
            if(msgTotal === ind){ // last message
               // console.log("msgTotal = ind : " + msg.id);
                updateActiveChatsLastId("single" , contactId, msg.id);
            }
            
            if(messageObject.status === MSG_SENT){
                updateMessageStatus(messageObject.id , MSG_DELIVERED);
            }
            
        }
    }
        ++index;
        pollContactMessages(index);
        
     


    };
    opts.completeHandler = function (json){

    };
    
    opts.errorHandler = function (){};

    doAjax(opts);
    
    
    
}


function sendSingleMessage(){
    messageContent = $("#message-field").val().trim();
    
    if(messageContent != ""){
        senderName = getFullName();
        userId = getUserId();
        msgDate = moment(new Date()).format('DD MMM YYYY : HH :mm');
        numberOfMessagesDisplayed++;
        
        msgHTML = '<div class="bubbledRight" id="msg-'+numberOfMessagesDisplayed+'">'+
                            '<span class="msg-name">'+senderName+'</span>'+
                            '<br>'+
                            '<div class="msg-content">'+
                              messageContent +
                            '</div>'+
                            '<br>'+
                           '<span class="msg-date-time">'+
                                msgDate +
                                '<img class="status-indicator" id="status-indic-'+numberOfMessagesDisplayed+'" src="images/pending.png?t=1">'+
                            '</span>'+
                    '</div>';
            
            $("#chat-area").append(msgHTML);
            $("#message-field").val('');
            $.ui.scrollToBottom('chat');
            
        opts = getDefaultAjaxObject();
        
        opts.data = {action: "send-message" , sender_id: userId, receiver_id: currentContactChat, message: messageContent};
        opts.beforeSendHandler = function (){};
        opts.successHandler = function(json){
            var last_message_id = json.last_message_id;
           // alert("Last Msg Id: " + last_message_id);
            
            if(last_message_id > 0){
               // alert('Message Sent');
                var messageObject = getChatHistoryMessageObject();
               // console.log(messageContent);
                messageObject.id = last_message_id;
                messageObject.content = messageContent;
                messageObject.dateSent = msgDate;
                messageObject.sender = senderName;
                messageObject.senderId = userId;
                messageObject.status = MSG_SENT;
               
                updateActiveChats("single" , currentContactChat, messageObject, true);
                
                updateActiveChatsLastId("single" , currentContactChat, last_message_id);
                
                $("#status-indic-" + numberOfMessagesDisplayed).attr("src" , "images/sent.png?t=1");
                
                //console.log(messageObject);
               // console.log("decl lp");
                var lp = new Looper(messageObject);
               // console.log(lp);
                lp.start();
            }
            else{
             // alert("Last Msg Id: " + last_message_id);
              //  alert('Message Not Sent');
            }
        };
        
        opts.errorHandler = function(){
                alert('error handler');
                messageObject = getChatHistoryMessageObject();
               // console.log(messageContent);
                messageObject.content = messageContent;
                messageObject.dateSent = msgDate;
                messageObject.sender = senderName;
                messageObject.senderId = userId;
                messageObject.status = MSG_FAILED;
               
                updateActiveChats("single" , currentContactChat, messageObject);
        };
        
        doAjax(opts);
    }
}

function sendGroupMessage(){
    messageContent = $("#group-message-field").val().trim();
    
    if(messageContent != ""){
        senderName = getFullName();
        userId = getUserId();
        msgDate = moment(new Date()).format('DD MMM YYYY : HH :mm');
        numberOfMessagesDisplayed++;
        
        msgHTML = '<div class="bubbledRight" id="msg-'+numberOfMessagesDisplayed+'">'+
                            '<span class="msg-name">'+senderName+'</span>'+
                            '<br>'+
                            '<div class="msg-content">'+
                              messageContent +
                            '</div>'+
                            '<br>'+
                           '<span class="msg-date-time">'+
                                msgDate +
                               // '<img src="images/msg_status_pending.png">'+
                            '</span>'+
                    '</div>';
            
            $("#group-chat-area").append(msgHTML);
            $("#group-message-field").val('');
            $.ui.scrollToBottom('group-chat');
            
        opts = getDefaultAjaxObject();
        
        opts.data = {action: "send-group-message" , sender_id: userId, group_id: currentGroupChat, message: messageContent};
        opts.beforeSendHandler = function (){};
        opts.successHandler = function(json){
            status = json.status;
            
            if(status == 1){
               // alert('Message Sent');
                messageObject = getChatHistoryMessageObject();
               // console.log(messageContent);
                messageObject.content = messageContent;
                messageObject.dateSent = msgDate;
                messageObject.sender = senderName;
                messageObject.senderId = userId;
               
                updateActiveChats("group" , currentGroupChat, messageObject);
            }
            else{
               // alert('Message Not Sent');
            }
        };
        
        doAjax(opts);
    }
    
}


function doAjax(opts){
    $.ajax({
        url: opts.url === undefined ? SERVICE_URL_ROOT + API_FILE : opts.url,
        type: "POST",
        data: opts.data,
        dataType: opts.dataType,
        crossDomain: true,
        async: opts.async,
        beforeSend: opts.beforeSendHandler,
        timeout: opts.timeout,
        success: opts.successHandler,
        error: opts.errorHandler,
        complete: opts.completeHandler
        
    }); 
    
}

function getDefaultAjaxObject(){
    defaultOpts = {

        data: {},
        dataType: 'json',
        timeout: 300000, //5 minutes
        crossDomain: true,
        async : true,
        
        beforeSendHandler: function(){
           showMask('Connecting...'); 
        },
        successHandler: function(json) {

        },
        errorHandler: function(x , t, m) {
            if (t === "timeout") {

                createPopup('Request Timeout' , 'The request has timed out. Please try again.', true, 'Dismiss');
            } else {
                //alert("Unable to connect to the server");
                createPopup('No Internet Connection' , 'Unable to connect to the server. Please check your internet connection.', true, 'Dismiss');
            }

           // alert('Unable to connect to server');
        },

        completeHandler: function(){
            hideMask();
        }
    };
    
    return defaultOpts;
}

function getChatHistoryObject(){
    chatHistory = {
        id: 0, // group id or contact user id
        type : "", // group or single
        messages: new Array(), //array of chatHistoryMessageObjects
        unread:0, //Number of unread messages
        lastMessageId:0 //id of message last received by user
    };
    return chatHistory;
}

function getActiveChatLastIdObject(){
    lastIdObj = {
        id: 0, // group id or contact user id
        type : "", // group or single
        lastMessageId:0 //id of message last received by user
    };
    return lastIdObj;
}

function getChatHistoryMessageObject(){
    message = {
        id:0,
        content: "", // message content
        sender: "", //Name of sender
        senderId: 0, // sender user id
        dateSent: "", // date sent
        status: 0 // sent, delivered, read, deleted
    };
    return message;
}

function getContactObject(){
    contact = {
        id: 0, 
        name : ""
    };
    return contact;
}

function getContactRequestObject(){
    request = {
        contactId: 0, 
        contactName : "",
        type : 0 //1 for Sent, 2 For Received
    };
    return request;
}

function supportsLocalStorage(){
    if (window["localStorage"]){
        return true;
    }
    return false;
}

function save(tag , value){
    localStorage.setItem(tag , value);
}

function saveArray(tag , value){
    localStorage[tag] = JSON.stringify(value);
}

function appendToArray(tag, value){
    var old = JSON.parse(localStorage[tag]);
   // console.log("old : ");
    //console.log(old);
    //console.log("value : ");
    //console.log(value);
   // console.log("concat : ");
   // console.log(old.concat(value));
    if(old === null) {
        old = "";
    }
    //localStorage.setItem(tag, old + value);
   // localStorage[tag] = JSON.stringify(old.concat(value));
}

function isLoggedIn() {
    //alert(localStorage.getItem('userId'));
    if (localStorage.getItem('id') !== null) {
        //A user is logged in  
        return true;
    }
    return false;
}

function checkSession(){
    if(!isLoggedIn()){
        goToPage("signin", "down");
    }
}

function createPopup(title, message, cancelOnly, cancelText, doneText) {
    $("#afui").popup({
        title: title,
        message: message,
        cancelText: cancelText,
        cancelCallback: function() {
            // console.log("cancelled");
        },
        doneText: doneText,
        doneCallback: function() {
            // console.log("Done for!");
        },
        cancelOnly: cancelOnly
    });
}

function showMask(text) {

    $.ui.showMask(text);
}

function hideMask() {
    $.ui.hideMask();
}

function startApp(){
    // clears all back button history
    $.ui.clearHistory();  

}

//Load a new page
//pageId = id of the panel, transition = fade, slide, up, down
function goToPage(pageId, transition){
    if(transition == null){
        $.ui.loadContent(pageId, null, null, "slide");
    }
    else{
        $.ui.loadContent(pageId, null, null, transition);
    }
    
}


function showGroupMembers(){
    $("#grp-membs").show();
    $("#grp-polls").hide();
}

function showGroupPolls(){
    $("#grp-polls").show();
    $("#grp-membs").hide();
    
}

function showCreatePollPopup() {
    
    $("#afui").popup({
        title: "Create A New Poll",
        message: "Poll Title: <input type='text' class='af-ui-forms' id='poll-title'><br>Poll Deadline: <input type='date' class='af-ui-forms' id='poll-deadline'>",
        cancelText: "Cancel",
        cancelCallback: function () {},
        doneText: "Create",
        doneCallback: function () {
            poll_title = $("#poll-title").val().trim();
            poll_deadline = $("#poll-deadline").val();
            
            if(poll_title == ''){
                $("#poll-title").focus();
                createPopup("Message", "Enter the Poll Title.", true, "Dismiss", "");
                showCreatePollPopup();
                return;
            }
            
            if(poll_deadline == ''){
                $("#poll-deadline").focus();
                createPopup("Message", "Enter the Poll Deadline.", true, "Dismiss", "");
                showCreatePollPopup();
                return;
            }
            //alert(poll_title + " Created");
            
            createPoll(poll_title, poll_deadline);
        }, 
        cancelOnly: false
    });
}

function createPoll(poll_title, poll_deadline){
    userId = getUserId();
    groupId = currentGroupChat;
    
    opts = getDefaultAjaxObject();
    
    opts.data = {action: "create-poll" ,user_id: userId, group_id:groupId, question: poll_title, deadline: poll_deadline};
    opts.beforeSendHandler = function (){
        showMask("Creating Poll ...");
    };
    
    opts.successHandler = function(json){
        status = json.status;
        if(status == 1){
            createPopup("Success" , "Poll successfully created", true , "Dismiss" , "");
        }
        else{
            //msg = json.msg;
            createPopup("Error" , "Unable to create poll at this time. Please try again " , true , "Dismiss" , "");
        }
    };
    
    opts.completeHandler = function (){
        hideMask();
        getGroupPolls();
    };
    
    doAjax(opts);
    
}

function getGroupPolls(){
    groupId = currentGroupChat;
    userId = getUserId();
    
    opts = getDefaultAjaxObject();
    
    opts.data = {action : "get-all-polls" , user_id: userId, group_id: groupId};
    
    opts.beforeSendHandler = function(){};
    
    opts.successHandler = function (json){
       // console.log(json);
        polls = json;
        totalPolls = polls.length;
        
        pollsHTML = '<li class="divider">Total Polls : '+totalPolls+'</li>';
        
        for( i = 0; i < totalPolls;  i++){
            poll = polls[i];
            
            pollCreator = poll.fullname;
            pollId = poll.id;
            pollStatus = poll.poll_status;
            pollTitle = poll.question;
            pollCreatorId = poll.user_id;
            pollAnswer = poll.answer;
            
            if(pollCreatorId == getUserId()){
                //if current user created the poll
                pollCreator = "Me";
            }
            
            pollsHTML += '<li onclick="setCurrentPoll(\''+pollTitle+'\',\''+pollId+'\' , \''+pollStatus+'\',\''+pollAnswer+'\' )">' +
                    '<a href="#poll">' +
                        '<img class="list-image list-image-contacts" src="images/poll_icon.png" />' +
                        '<div class="list-text">' +
                            '<b>'+pollTitle+'</b>' +
                            '<br>' +
                            '<small>Created by '+ pollCreator +'</small>';
                                
            if(pollStatus !== 'Active'){
                pollsHTML += '<br>' +
                    '<small style="color: red;">Poll Closed</small>';
            }
            
            pollsHTML += '</div>' +
                        '</a>' +
                    '</li>';
        }
        
        $("#group-polls-list").html(pollsHTML);
    };
    
    doAjax(opts);
}

function setCurrentPoll(pollTitle, pollId, pollStatus, pollAnswer){
    currentPoll = parseInt(pollId);
    
    $("#poll_title").text(pollTitle);
    

    if(pollAnswer == 'null'){
       

        $("#poll-agree").click( function(){
            confirmVote(currentPoll, 1);
        });

        $("#poll-disagree").click( function(){
            confirmVote(currentPoll, 0);
        });
    }

    if(pollAnswer == 1){
        $("#disagree_img").attr('src' , "images/disagree_disabled.png");
    }

    if(pollAnswer == 0){
        $("#agree_img").attr('src' , "images/agree_disabled.png");
    }
    
    if(pollStatus !== 'Active'){
        $("#poll-agree").unbind('click');
        $("#poll-disagree").unbind('click');
        
        if(pollAnswer == null){
            $("#agree_img").attr('src' , "images/agree_disabled.png");
            $("#disagree_img").attr('src' , "images/disagree_disabled.png");
        }
    }

    getPollResults(pollId);
}

function getPollResults(pollId){
    opts = getDefaultAjaxObject();
    
    opts.data = {action: "get-poll" , poll_id: pollId};
    opts.beforeSendHandler = function(){};
    
    opts.successHandler = function(json){
        console.log(json);
        poll = json.poll;
        votes = json.votes;
        
        if(poll.length > 0){
            
            if(poll.length == 1){
              
                pollDecison = poll[0].answer == '1' ? 1 : 0;
                
               
                
                if(pollDecison == 1){
                  
                    agreeCount = poll[0] !== undefined ? parseInt(poll[0].num) : 0;
                    disagreeCount = 0;
                }
                else{
                 
                    disagreeCount = poll[0] !== undefined ? parseInt(poll[0].num) : 0;
                    agreeCount = 0;
                }
            }
            
            if(poll.length == 2){
                disagreeCount = poll[0] !== undefined ? parseInt(poll[0].num) : 0;
                agreeCount = poll[1] !== undefined ? parseInt(poll[1].num) : 0;

                if(isNaN(agreeCount)){

                    agreeCount = 0;
                }

                if(isNaN(disagreeCount)){

                    disagreeCount = 0;
                }
            }
        }
        else{
            agreeCount = 0;
            disagreeCount = 0;
        }

        
        $("#agree_count").text(agreeCount);
        $("#disagree_count").text(disagreeCount);
        
        votesHTML = '';
        
        for(i = 0; i < votes.length; i++){
            vote = votes[i];
            decision = vote.answer;
            voter = vote.fullname;
            
            if(decision == 0){
                votesHTML += '<li>'+
                                '<img class="list-image list-image-contacts" src="images/disagree.png" />'+
                                '<div class="list-text list-text-contacts">'+
                                    '<b>'+voter+'</b>'+
                                '</div>'+
                            '</li>';
            }
            if(decision == 1){
                votesHTML += '<li>'+
                            '<img class="list-image list-image-contacts" src="images/agree.png" />'+
                            '<div class="list-text list-text-contacts">'+
                                '<b>'+voter+'</b>'+
                            '</div>'+
                        '</li>';
            }
            
        }
        $("#poll-voters-list").html(votesHTML);
    };
    
    doAjax(opts);
    
}

function addVote(pollId , answer){
    userId = getUserId();
    groupId = currentGroupChat;
    
    opts =getDefaultAjaxObject();
    
    opts.data = {action: "vote", user_id: userId, group_id: groupId, poll_id: pollId, answer: answer};
    
    opts.beforeSendHandler = function (){
        showMask('Voting ...');
    };
    
    opts.successHandler = function (json){
   
        status = json.status;
        if(status == 1){
            switch (answer){
                case 1:
                    $("#disagree_img").attr('src' , "images/disagree_disabled.png");
                    break;
                case 0 :
                    $("#agree_img").attr('src' , "images/agree_disabled.png");
                    break;
            }
            
            $("#poll-agree").unbind('click');
            $("#poll-disagree").unbind('click');
        }
    };
    
    opts.completeHandler = function (){
        hideMask();
        getPollResults(pollId);
    };
    
    doAjax(opts);
    
    
}

function confirmVote(pollId, answer){
    $("#afui").popup({
        title: "Confirm Vote",
        message: "Are you sure you want to continue with this decision ?",
        cancelText: "Cancel",
        cancelCallback: function () {},
        doneText: "Confirm",
        doneCallback: function () {
            addVote(pollId, answer);
        }, 
        cancelOnly: false
    });
}

function confirmDeleteContact(contactId , contactName){
    $("#afui").popup({
        title: "Delete Contact ? ",
        message: "Are you sure you want to delete " + contactName + " ? ",
        cancelText: "Cancel",
        cancelCallback: function () {},
        doneText: "Delete",
        doneCallback: function () {
            deleteContact(contactId);
        }, 
        cancelOnly: false
    });
}

function deleteContact(contactId){
    contactList = getContactList();
   // console.log("total contacts : " +  contactList.length);
    for(var i = 0; i < contactList.length; i++){
        var c = contactList[i];
        //console.log("c_id : " + c.contact_user_id + " / contactId :" + contactId);
        if(c.contact_user_id === contactId){
           // console.log("found match");
           // contactList.splice( i , 1);
            saveArray("contactList" , contactList);
            
            $("#li-contact-" +contactId ).remove();
            deleteChat("single" , contactId);
            
            return true;
        }
    }
    
    return false;
}

function clearPollPage(){
    $("#poll_title").text('');
    $("#agree_count").text('');
    $("#disagree_count").text('');
    $("#poll-voters-list").empty();
    
    $("#agree_img").attr('src' , "images/agree.png");
    $("#disagree_img").attr('src' , "images/disagree.png");
    
    $("#poll-agree").unbind('click');
    $("#poll-disagree").unbind('click');
}

function getPendingNotificationsObject(){
    notif = {
        id: 0, // group id or contact user id
        count : 0 // number pending norifications
    };
    return notif;
}

function getGroupNotification(groupId){
    pgn = getPendingGroupNotifications();
    for( i = 0 ; i < pgn.length; i++){
        gn = pgn[i];
        
        if(gn.id == groupId){
            return gn;
        }
        
    }
    return null;
}

function getPendingGroupNotifications(){
    if(localStorage["pendingGroupMessagesNotifications"] != undefined){
         pendingGroupMessagesNotifications = JSON.parse(localStorage["pendingGroupMessagesNotifications"]);
         return pendingGroupMessagesNotifications;
    }
    
    return new Array();
}

function getPendingContactNotifications(){
    if(localStorage["pendingContactMessagesNotifications"] != undefined){
         pendingContactMessagesNotifications = JSON.parse(localStorage["pendingContactMessagesNotifications"]);
         return pendingContactMessagesNotifications;
    }
    
    return new Array();
}

function sendContactRequest(memberId , memberName){
    
    if(isContact(memberId)){
        //Show delete contact action sheet
        showDeleteContactActionSheet(memberId , memberName);
    }
    else{
        //check if contact has been sent a request
        if(checkIfContactIsInRequestList(memberId) !== null){
            showRequestSentActionSheet();
            return;
        }

        //Show add contact action sheet
        showAddContactActionSheet(memberId , memberName);

    }
    
}

function isContact(memberId){
    contact = getContactById(memberId);
    
    if(contact != null){
        return true;
    }
    
    return false;
}

function showAddContactActionSheet(contactId , contactName){

    $("#afui").actionsheet(
    [{
        text: 'Send Contact Request',
        cssClasses: 'blue',
        handler: function () {
           // alert(contactId);
            addContactRequest(contactId , contactName);
        }
    }]);

}

function showDeleteContactActionSheet(contactId , contactName){

    $("#afui").actionsheet(
    [{
        text: 'Delete Contact',
        cssClasses: 'red',
        handler: function () {
         // alert(contactId);
         confirmDeleteContact(contactId , contactName);
        }
    }]);

}

function showChatOptions(chatType , chatId){

    $("#afui").actionsheet(
    [{
        text: 'Delete Converstaion',
        cssClasses: 'red',
        handler: function () {
         //alert(chatId);
         deleteChat(chatType , chatId);
        }
    }]);

}

function showRequestSentActionSheet(){
    $("#afui").actionsheet(
    [{
        text: 'Contact Request Pending',
        cssClasses: 'blue',
        handler: function () {

        }
    }]);
}

function addContactRequest(contactId , contactName){
    opts = getDefaultAjaxObject();
    
    opts.data = {action: "request-contact" , sender_user_id: getUserId() , recipient_user_id : contactId};
    
    opts.beforeSendHandler = function (){};
    opts.successHandler = function (json){
        status = json.status;
        
        if(status == 1){
            contactRequests = getContactRequests();
            request = getContactRequestObject();
            request.contactId = contactId;
            request.contactName = contactName;
            request.type = SENT_REQUEST;

            contactRequests.push(request);
            saveArray("contactRequests" , contactRequests);

            createPopup("Request Sent", "Your contact request has been successfully sent", 
            true, "Dismiss", "");
        }
        else{
            createPopup("Request Not Sent", "Unable to send contact request. Please try again.", 
            true, "Dismiss", "");
        }
        
    };
    
    opts.completeHandler = function (){};
    
    doAjax(opts);
}

function getPendingRequests(){
    opts = getDefaultAjaxObject();

    opts.data = {action: "get-requests" , user_id: getUserId()};
    
    opts.beforeSendHandler = function (){};
    opts.successHandler = function (json){
       // console.log(json);
        pendingRequests = json.pending;
        sentRequests = json.sent;
        
        pendingRequestsHTML = '';
        sentRequestsHTML = '';
        
        if(pendingRequests.length > 0){
            for(i = 0; i < pendingRequests.length; i++){
                request = pendingRequests[i];
                requestId = request.id;
                requestSenderId = request.sender_user_id;
                requestSenderName = request.sender_name;
                pendingRequestsHTML += '<li id="pending-req-'+requestId+'">' +
                                '<img class="list-image list-image-contacts" src="images/unknown_user.jpg" />' +
                                    '<div class="list-text">' +
                                        '<b>'+requestSenderName+'</b>' +
                                        '<br>' +
                                        '<small>Hello, I\'d like to add you as a contact.</small>' +
                                        '<div class="contact_request_options">' +
                                            '<span><a href="#" class="accept_request button green" onclick="respondToRequest(\'Accepted\',\''+requestId+'\' ,\''+requestSenderId+'\',\''+getUserId()+'\')" >Accept</a></span>' +
                                            '<span><a href="#" class="decline_request button red" onclick="respondToRequest(\'Declined\',\''+requestId+'\' ,\''+requestSenderId+'\',\''+getUserId()+'\')" >Decline</a></span>' +
                                        '</div>' +
                                    '</div>' +
                            '</li>';
            }
        }
        else{
            
        }
        
        if(sentRequests.length > 0){
            
            for(i = 0; i < sentRequests.length; i++){
                request = sentRequests[i];
                requestId = request.id;
                requestRecipientName = request.recipient_name;
                sentRequestsHTML +=  '<li>' +
                               ' <img class="list-image list-image-contacts" src="images/no_contact.png" />' +
                                    '<div class="list-text list-text-contacts">' +
                                        '<b>'+requestRecipientName+'</b>' +

                                   '</div>'+

                            '</li>';
            }
            
        }
        else{
            
        }
        
        
        $("#req-received-list").html(pendingRequestsHTML);
        $("#req-sent-list").html(sentRequestsHTML);
    };
    
    opts.completeHandler = function (){};
    
    doAjax(opts);
}

function showRequestsReceived(){
    $("#req-received").show();
    $("#req-sent").hide();
}

function showRequestsSent(){
    $("#req-sent").show();
    $("#req-received").hide();

}

function respondToRequest(response, requestId, senderId, recipientId ){
    opts = getDefaultAjaxObject();
    
    opts.data = {action: "respond-to-request" , request_id: requestId, response: response, 
    sender_user_id: senderId, recipient_user_id: recipientId};

    opts.beforeSendHandler = function(){};
    
    opts.successHandler = function(json){
        status = json.status;
        if(status == 1){
            $("#pending-req-" + requestId).remove();
            if(response === "Accepted"){
                getContacts();
            }
        }
        else{
            alert("Unable to perform action");
        }
    };
    
    opts.completeHandler = function(){};
    
    doAjax(opts);
}

function getContacts(){
    if(!isLoggedIn()){
        return;
    }
    opts = getDefaultAjaxObject();
    opts.data = {action: "get-contacts" , user_id: getUserId()};
    
    opts.beforeSendHandler = function(){};
    opts.successHandler = function(json){
        console.log(json);
        contactList = getContactList();
        contactList.length = 0;
        saveArray("contactList", json);
    };
    opts.completeHandler = function(){};
    
    doAjax(opts);
}

function checkForNewContacts (){
    getContacts();
}

function getProjects(){
    var ug = getUserGroups();
    
    var schoolIds = [];
    //console.log(ug);
    for(var i = 0; i < ug.length; i++){
        schoolIds.push(ug[i].school_id);
    }
    
    //console.log(schoolIds)
    var opts = getDefaultAjaxObject();
    
    opts.url = SCHOOL_PROJECTS_URL_ROOT + API_FILE;
    opts.data = {action: "get-all-projects", school_ids: schoolIds};
    
    opts.beforeSendHandler = function(){
        //showMask("Fetching Projects ...");
    };
    
    opts.successHandler = function (json){
        console.log(json);
        
        projects = json;
        
        if(projects.length > 0){
            $("#no-projects").hide();
        }
        var projectsHTML = "";
        for( var i = 0; i < projects.length; i++){
            var project = projects[i];
            
            var projectId = project.id;
            var title = project.title;
            //var projectImage = 'http://eduprojectfunding.com/img/' + project.photo;
            var projectImage = "images/Project_1.jpg";
            var desc = project.description.substring(0, 25) + " ...";
            var projectSchoolId = project.school_id;
            
//            console.log('p_sc id : ' + projectSchoolId);
//            var g = getGroupDetailsBySchoolId(projectSchoolId);
//            console.log(g);
            var schoolName = "";
            for(var j = 0; j < ug.length; j++){
                var g = ug[j];

                if(g.school_id == projectSchoolId){
                    schoolName = g.school_name;
                }
            }
            //var schoolName = g === null ? "" : g.school_name;
            
            projectsHTML += '<li id="project-'+projectId+'">' +
                            '<a href="#project" onclick="setCurrentProject('+projectId+')">' +
                                '<img class="list-image" src="'+projectImage+'" />' +
                                '<div class="list-text">' +
                                    '<b>'+title+'</b>' +
                                    '<br>' +
                                        desc 
                                    + '<br>' +
                                    '<small><i>'+schoolName+'</i></small>'+
                                '</div>'+
                            '</a>'+
                        '</li>';
        }
        
        $("#projects-list").html(projectsHTML);
    };
    
    opts.completeHandler = function (){
        hideMask();
    };
    
    doAjax(opts);
}

function displayProjectDetails(){
    $("#project-donate").unbind('click');
    var project = getProjectById(currentProject);
    
    if(project != null){
            var projectId = project.id;
            var title = project.title;
            //var projectImage = 'http://eduprojectfunding.com/img/' + project.photo;
            var projectImage = "images/Project_1.jpg";
            var desc = project.description;
            var projectSchoolId = project.school_id;
            var projectBudget = project.budget;
            var projectAmountRaised = project.amount_raised === null ? "0.00" : project.amount_raised;
            
            $("#project-title").text(title);
            $("#project-image").attr('src' , projectImage);
            $("#project-desc").html(desc);
            $("#project-budget").html(projectBudget);
            $("#project-amount-raised").html(projectAmountRaised);
            
            $("#project-donate").click( function(){
                var inAppBrowser = cordova.InAppBrowser.open('http://eduprojectfunding.com/contribute.php', '_blank', 'location=yes');
            });
            
    }
}

function setCurrentProject(projectId){
    currentProject = projectId;
}

function getProjectById(projectId){
    for( var i = 0; i < projects.length; i++){
        var p = projects[i];
        if(p.id == projectId){
            return p;
        }
    }
    return null;
}


function updateMessageStatus(messageId , status){
        console.log("updating msg status");
        var opts = getDefaultAjaxObject();
        opts.data = {action: "change-message-status" , message_id : messageId , status : status};
        
        opts.beforeSendHandler = this.opts.completeHandler = this.opts.errorHandler = function (){};
        
        opts.successHandler = function(json){
            console.log("status updated");
            console.log(json);
        };
        
        doAjax(opts);
}


function Looper(messageObject){
    this.messageObject = messageObject;
    this.timer;
    this.delay = 3000;
    this.opts = getDefaultAjaxObject();
    
    Looper.count = ++Looper.count || 1; 
    this.id = Looper.count;
    
    Looper.stack = [];
    
    this.checkMessageStatus = function(){
        console.log('checking msg status');
        if(messageObject.status == MSG_READ){
            this.stop();
            return;
        }
        console.log(messageObject);
        this.opts.data = {action: "get-message-status" , message_id : messageObject.id };
        
        this.opts.beforeSendHandler = this.opts.completeHandler = this.opts.errorHandler = function (){};
        
        this.opts.successHandler = function(json){
            console.log(json);
            status = json.status;
            console.log("message id : " + messageObject.id + " has status : " + status);
            if(status != MSG_SENT){
                this.messageObject.status = status;
                
                if(status == MSG_READ){
                    console.log("stopping looper cos status is read");
                    this.stop();
               
                }
            }
        };
        
        doAjax(this.opts);
    };
    
    
    this.start = function(){
        console.log('starting looper');
        this.timer = setTimeout(this.checkMessageStatus , this.delay);
        
    };
    
    this.stop = function() {
        console.log('stopping looper');
        clearTimeout(this.timer);
        Looper.stack.splice(this.id - 1 , 1);
    };
    
    
    
    Looper.stack.push(this);
}

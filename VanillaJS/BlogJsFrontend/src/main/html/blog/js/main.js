var submit;

(function(){
    
var Param = function( name, value ){
    this.name = name;
    this.value = value;
}

var Action = function( id, action ){
    this.id = id;
    this.action = action;
}

var constants = {
    POST_ID: "post",
    ACTION: "action",
    
    ACTION_DISPLAY: "display",
    ACTION_EDIT: "edit",
    
    API: "http://localhost:8080/api/posts/",
    UI: "http://localhost:8080/",
    
    FORM_ID: "postId",
    FORM_PUB_DATE: "postPubDate",
    FORM_TITLE: "postTitle",
    FORM_AUTHOR: "postAuthor",
    FORM_AUTHOR_EMAIL: "postAuthorEmail",
    FORM_PULL_QUOTE: "postPullQuote",
    FORM_BODY: "postBody",
};

var main = function(){
    submit = doSubmit;
    var action = getAction();
    
    if( action.action === constants.ACTION_EDIT  ){
        editPost( action.id );
    }
    else if( action.id ){
        displayPost( action.id );
    }
    else{
        displayPosts();
    }
}

var xhr = new XMLHttpRequest();

function displayPosts(){
    //$.getJSON( constants.API, doDisplayPosts );
    xhr.open( "GET", constants.API, true );
    xhr.send();
    xhr.onreadystatechange = doDisplayPosts;
}

function doDisplayPosts( event ){
    if (xhr.readyState == 4 && xhr.status == 200) {
        var response = JSON.parse(xhr.responseText);
        
        var posts = response['posts'];
        var mainContent = addMainContent();

        for( var i = 0; i < posts.length; i++ ){
            var post = posts[i];
            var html = getPostHtml( post, false );
            mainContent.innerHTML += html;
        }
    }
    else if( xhr.status >= 300 ){
        errorHandler();
    }
}

function displayPost( id ){
    var api = constants.API + id
    xhr.open( "GET", api, true );
    xhr.send();
    xhr.onreadystatechange = doDisplayPost;
}

function doDisplayPost( post ){
    if (xhr.readyState == 4 && xhr.status == 200) {
        var post = JSON.parse(xhr.responseText);
        
        var html = getPostHtml( post, true );
        var mainContent = addMainContent();
        mainContent.innerHTML += html;
    }
    else if( xhr.status >= 300 ){
        errorHandler();
    }
}

function editPost( id ){
    var api = constants.API + id
    xhr.open( "GET", api, true );
    xhr.send();
    xhr.onreadystatechange = doEditPost;
}

function doEditPost( post ){
    if (xhr.readyState == 4 && xhr.status == 200) {
        var post = JSON.parse(xhr.responseText);
        
        var html = getEditHtml( post, true );
        var mainContent = addMainContent();
        mainContent.innerHTML += html;
    }
    else if( xhr.status >= 300 ){
        errorHandler();
    }
}

function addMainContent(){
    document.body.innerHTML += "<div id='mainContent'></div>";
    var mainContent = document.getElementById("mainContent");
    return mainContent;
}

/// display HTML ///

function getPostHtml( post, fullHtml ){
    var content = "<article class='post'>"
    
    /// title ///
    
    var disp = "<h1 class='post-title'>"
        disp += " <a href='";
        disp += constants.UI;
        disp += "?"
        disp += constants.POST_ID + "=" + post.uuid;
        disp += "'>";
        disp += post.title;
        disp += "</a></h1>";
    content += disp;

    var edit = " <a href='";
        edit += constants.UI;
        edit += "?"
        edit += constants.POST_ID + "=" + post.uuid;
        edit += "&";
        edit += constants.ACTION + "=" + constants.ACTION_EDIT;
        edit += "'>[edit]</a>";


    /// byline ///

    content += "<div class='post-byline'>"
    content += "Posted by <a href='mailto:" + post.authorEmail + "'>" + post.author + "</a>";

    if( post.pubDate ){
        content += " on ";
        content += toPrintableDate( post.pubDate );
    }

    content += edit;
    content += "</div>"

    /// body ///
    
    if( fullHtml ){
        content += "<div class='post-body'>"
        content += post.bodyAsHtml;
        content += "</div>"
    }
    else {
        content += "<div class='post-pullquote'>"
        content += post.pullQuoteAsHtml;
        content += "</div>"
    }
    
    content += "</article>";
    return content;
}

function toPrintableDate( date ){
    if( date ){
        try{
            var printable = new Date(date);
            var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

            var day = printable.getDay()+1;
            day = "" + day + ordinal(day);

            var month =  months[printable.getMonth()];
            var year = printable.getFullYear();

            return day + " " + month + ", " + year;
        }
        catch( error ){
            console.error( "Error generating date from: " + date );
            console.error( error );
        }
    }

    return "";
}

function ordinal( integer ){
    integer = integer % 10;

    if( integer == 1 ){
        return "st";
    }
    else if( integer == 2 ){
        return "nd";
    }
    else if( integer == 3 ){
        return "rd";
    }
    else{
        return "th";
    }
}

/// edit HTML ///

function getEditHtml( post ){
    if( !post ){
        post = {};
        post.uuid = "";
        post.title = "";
        post.pubDate = 0;
        post.author = "";
        post.authorEmail = "";
        post.pullQuote = "";
        post.body = "";
    }
    
    var content = "<article class='edit-post'>"
    
    content += input( "", constants.FORM_ID, post.uuid, "hidden" );
    content += input( "", constants.FORM_PUB_DATE, post.pubDate, "hidden" );
    content += input( "Title", constants.FORM_TITLE, post.title );
    content += input( "Author", constants.FORM_AUTHOR, post.author );
    content += input( "Email", constants.FORM_AUTHOR_EMAIL, post.authorEmail );
    
    content += textarea( "Pull quote", constants.FORM_PULL_QUOTE, post.pullQuote );
    content += textarea( "Body", constants.FORM_BODY, post.body );
    
    content += "<div class='editWidget'><button onclick='submit()'>Publish post</button></div>";
    
    content += "</article>";
    return content;
}

function input( name, id, value, type ){
    if( !type ){
        type = "text";
    }
    
    var content = "<input type='";
    content += type;
    content += "' id='";
    content += id;
    content += "' value='";
    content += value
    content += "'><br>";
    
    if( name ){
        content = "<label>" + name + ":<br>" + content + "</label>";
    }
    
    content = "<div class='editWidget'>" + content + "</div>";
    return content;
}

function textarea( name, id, value ){
    var content = "<textarea rows='5' id='";
    content += id;
    content += "'>";
    content += value;
    content += "</textarea><br>";
    
    if( name ){
        content = "<label>" + name + "<br>" + content + "</label>";
    }
    
    content = "<div class='editWidget'>" + content + "</div>";
    return content;
}

/// submit ///

function doSubmit(){
    console.log( "Submit" );
    var post = getPostFromForm();
    
    xhr = new XMLHttpRequest();
    xhr.open( "POST", constants.API, true );
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send( post );
    xhr.onreadystatechange = submitSuccess;
    
    return false;
}

function getPostFromForm(){
    var result = {};
    
    result.uuid = document.getElementById( constants.FORM_ID ).value;
    result.pubDate = document.getElementById( constants.FORM_PUB_DATE ).value;
    result.title = document.getElementById( constants.FORM_TITLE ).value;
    result.author = document.getElementById( constants.FORM_AUTHOR ).value;
    result.authorEmail = document.getElementById( constants.FORM_AUTHOR_EMAIL ).value;
    result.pullQuote = document.getElementById( constants.FORM_PULL_QUOTE ).value;
    result.body = document.getElementById( constants.FORM_BODY ).value;
    
    return JSON.stringify(result);
}
function submitSuccess(data){
    if(xhr.readyState == 4 && xhr.status == 200) {
        var data = JSON.parse(xhr.responseText);
        
        var redirect = constants.UI + "?post=" + data.uuid;
        window.location.replace(redirect);
    }
    else if( xhr.status >= 300 ){
        errorHandler();
    }
}

/// errors ///

function errorHandler( data ){
    alert( "Sorry, something went wrong with your request!" );
}

/// URL parsing ///

function getAction(){
    var postId = undefined;
    var action = constants.ACTION_DISPLAY;
    
    var params = getUrlVars();
    for( var i = 0; i < params.length; i++ ){
        var param = params[i];
        
        if( param.name === constants.POST_ID ){
            postId = param.value;
        }
        else if( param.name === constants.ACTION ){
            action = param.value;
        }
    }
    
    return new Action( postId, action );
}

function getUrlVars()
{
    var result = [];
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        var hash = hashes[i].split('=');
        var param = new Param( hash[0], hash[1] );
        result.push( param );
    }
    return result;
}

/// run the application ///

window.onload = main;

})()
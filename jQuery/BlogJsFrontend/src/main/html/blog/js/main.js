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
    var action = getAction();
    //console.log( "Action: " + action.action + " post: " + action.id );
    $(document).ajaxError( errorHandler );
    
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

function displayPosts(){
    $.getJSON( constants.API, doDisplayPosts );
}

function doDisplayPosts( data ){
    var posts = data['posts'];
    
    var mainContent = addMainContent();
    
    for( var i = 0; i < posts.length; i++ ){
        var post = posts[i];
        var html = getPostHtml( post, false );
        mainContent.append( html );
    }
}

function displayPost( id ){
    var api = constants.API + id
    $.getJSON( api, doDisplayPost );
}

function doDisplayPost( post ){
    var html = getPostHtml( post, true );
    var mainContent = addMainContent();
    mainContent.append( html );
}

function editPost( id ){
    var api = constants.API + id
    $.getJSON( api, doEditPost );
}

function doEditPost( post ){
    var html = getEditHtml( post );
    var mainContent = addMainContent();
    mainContent.append( html );
}

function addMainContent(){
    $("body").append( "<div id='mainContent'></div>" );
    var mainContent = $("#mainContent");
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

function submit(){
    console.log( "Submit" );
    var post = getPostFromForm();
    
    var request = {};
    request.url = constants.API;
    request.type = "POST";
    request.contentType = "application/json; charset=utf-8";
    request.dataType = "json";
    request.data = post;
    request.success = submitSuccess;
    
    $.ajax(request);
    return false;
}

function getPostFromForm(){
    var result = {};
    result.uuid = $( "#" + constants.FORM_ID ).val();
    result.pubDate = $( "#" + constants.FORM_PUB_DATE ).val();
    result.title = $( "#" + constants.FORM_TITLE ).val();
    result.author = $( "#" + constants.FORM_AUTHOR ).val();
    result.authorEmail = $( "#" + constants.FORM_AUTHOR_EMAIL ).val();
    result.pullQuote = $( "#" + constants.FORM_PULL_QUOTE ).val();
    result.body = $( "#" + constants.FORM_BODY ).val();
    
    return JSON.stringify(result);
}
function submitSuccess(data){
    var redirect = constants.UI + "?post=" + data.uuid;
    window.location.replace(redirect);
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

$( document ).ready( main );


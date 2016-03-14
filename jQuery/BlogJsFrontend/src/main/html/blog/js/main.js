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
    UI: "http://localhost:8080/"
};

var main = function(){
    var action = getAction();
    console.log( "Action: " + action.action + " post: " + action.id );
    
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
    console.log( "Displaying all posts" );
    $.getJSON( constants.API, doDisplayPosts );
}

function doDisplayPosts( data ){
    console.log( "GET for all posts successful:" );
    var posts = data['posts'];
    
    $("body").append( "<div id='mainContent'></div>" );
    var mainContent = $("#mainContent");
    
    for( var i = 0; i < posts.length; i++ ){
        var post = posts[i];
        var html = getPostHtml( post, false );
        mainContent.append( html );
    }
}

function displayPost( id ){
    console.log( "Displaying post: " + id );
    var api = constants.API + id
    $.getJSON( api, doDisplayPost );
}

function doDisplayPost( post ){
    console.log( "GET for post successful" );
    console.log( post );
    
    $("body").append( "<div id='mainContent'></div>" );
    var mainContent = $("#mainContent");
    
    var html = getPostHtml( post, true );
    mainContent.append( html );
}

function editPost( id ){
    console.log( "Editing post: " + id );
}

function getAction(){
    var postId = undefined;
    var action = constants.ACTION_DISPLAY;
    
    var params = getUrlVars();
    for( var i = 0; i < params.length; i++ ){
        var param = params[i];
        //console.log( param.name + " = " + param.value );
        
        if( param.name === constants.POST_ID ){
            postId = param.value;
            //console.log( "found post ID: " + postId );
        }
        else if( param.name === constants.ACTION ){
            action = param.value;
            //console.log( "found action: " + postId );
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

$( document ).ready( main );


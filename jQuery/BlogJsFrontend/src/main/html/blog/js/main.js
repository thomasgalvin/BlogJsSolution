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
}

function displayPost( id ){
    console.log( "Displaying post: " + id );
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

$( document ).ready( main );


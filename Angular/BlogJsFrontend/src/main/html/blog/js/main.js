var module = angular.module( 'blog', [ 'ngRoute' ] );
module.controller( 'BlogCtrl', [ '$http', '$location', '$route', '$sce', '$window', BlogCtrl ]);
module.config( BlogConfig );

function BlogConfig($routeProvider, $locationProvider){
    //$routeProvider.when( '/filters', { templateUrl: "/views/filters.html" } );
    $routeProvider.when( '/view/:uuid', { templateUrl: "/views/post.html" } );
    $routeProvider.when( '/edit/:uuid', { templateUrl: "/views/edit-post.html" } );
    $routeProvider.otherwise( { templateUrl: "/views/all-posts.html" } );
}

function BlogCtrl( $http, $location, $route, $sce, $window ){
    var ctrl = this;
    ctrl.posts = null;
    ctrl.post = {};
    ctrl.postEdit = {};
    
    /// API location ///
    
    function baseLocation(){
        var port = $location.port();
        
        if( port ){
            return $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/api/posts";
        } else {
            return $location.protocol() + "://" + $location.host() + "/api/posts";
        }
    };
    
    /// load posts ///
    
    ctrl.allPosts = function(){
        if( !ctrl.posts ){
            if( !ctrl.isLoadingPosts ){
                ctrl.isLoadingPosts = true;
                loadAllPosts();
            }
        }
        return ctrl.posts;
    }
    
    function loadAllPosts(){
        $http.get( baseLocation() ).success( loadAllPostsSuccess ).error( loadAllPostsError );
    }
    
    function loadAllPostsSuccess( data ){
        ctrl.isLoadingPosts = false;
        ctrl.posts = data['posts'];
        for( var i = 0; i < ctrl.posts.length; i++ ){
            var post = ctrl.posts[i];
            trustPostHtml( post );
        }
    }
    
    function loadAllPostsError( data, status, headers, config ){
        ctrl.isLoadingPosts = false;
        $window.alert( "Unable to load a list of posts" );
        console.error( "Unable to load a list of posts" );
        console.error( data );
    }
    
    /// load single post ///
    
    ctrl.showPost = function( uuid ){
        if( uuid ){
            if( ctrl.loadingUuid !== uuid ){
                ctrl.loadingUuid = uuid;

                var url = baseLocation() + "/" + uuid;
                $http.get( url ).success( loadPostSuccess ).error( loadPostError );
            }
        }
    }
    
    function loadPostSuccess( post ){
        ctrl.loadingUuid = undefined;
        ctrl.postEdit = {};
        
        trustPostHtml( post );
        ctrl.post = post;
        
        $location.path( "/view/" + post.uuid );
    }
    
    function loadPostError( data, status, headers, config ){
        ctrl.loadingUuid = undefined;
        $window.alert( "Unable to load post for viewing" );
        console.error( "Unable to load post for viewing" );
        console.error( data );
    }
    
    ctrl.currentPost = function(){
        var location = $location.path();
        var uuid = location.replace( "/view/", "" );
        uuid = uuid.replace( "/edit/", "" );
        
        if( uuid ){
            if( uuid !== ctrl.post.uuid ){
                ctrl.showPost(uuid);
            }
        }
        
        return ctrl.post;
    }
    
    /// editing ///
    
    ctrl.currentEditPost = function(){
        var location = $location.path();
        var uuid = location.replace( "/edit/", "" );
        
        if( uuid ){
            if( uuid !== ctrl.postEdit.uuid ){
                ctrl.editPost(uuid);
            }
        }
        
        return ctrl.postEdit;
    }
    
    ctrl.editPost = function( uuid ){
        if( ctrl.loadingEditUuid !== uuid ){
            ctrl.loadingEditUuid = uuid;
            
            var url = baseLocation() + "/" + uuid;
            $http.get( url ).success( editPostSuccess ).error( editPostError );
        }
    }
    
    function editPostSuccess( post ){
        ctrl.loadingEditUuid = undefined;
        ctrl.post = {};
        
        trustPostHtml( post );
        ctrl.postEdit = post;
        
        $location.path( "/edit/" + post.uuid );
    }
    
    function editPostError( data, status, headers, config ){
        ctrl.loadingEditUuid = undefined;
        $window.alert( "Unable to load post for editing" );
        console.error( "Unable to load post for editing" );
        console.error( data );
    }
    
    /// saving ///
    
    ctrl.save = function(){
        ctrl.postEdit.pullQuoteAsHtml = undefined;
        ctrl.postEdit.bodyAsHtml = undefined;
        $http.post( baseLocation(), ctrl.postEdit ).success( saveSuccess ).error( saveError );
    }
    
    function saveSuccess(){
        ctrl.posts = null;
        console.log( "Save successful" );
        $window.alert( "Save successful" );
    }
    
    function saveError( data, status, headers, config ){
        console.error( "Error saving post" );
        $window.alert( "Error saving post" );
        console.error( data );
    }
    
    /// formatting ///
    
    function trustPostHtml( post ){
        post.pullQuoteAsHtml = $sce.trustAsHtml( post.pullQuoteAsHtml );
        post.bodyAsHtml = $sce.trustAsHtml( post.bodyAsHtml );
    }
    
    ctrl.toPrintableDate = function( date ){
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
    
    /// init ///
    
//    function init(){
//        ctrl.loadAllPosts();
//    }
//    init();
}
window.Router = Backbone.Router.extend({

    routes: {
        "folders/:folder_name": "getfolderRoute"
    },

    initialize: function () {
        if( !window.profile_id){
            this.showSignIn();
        }
        else {
            $('.add-bookmark-btn,.add-folder-btn').prop('disabled', false);
            $('#signinButton').addClass('hide');
        }
    },

    // If the user is not logged-in, disable the add buttons and make sign-in visible
    showSignIn : function(){
        $('#signinButton').removeClass('hide');
        $('.main_container > .row').append( new FoldersListView({ model : []}).render().el);
        $('.main_container > .row').append( new BookmarksListView({ model : []}).render().el);
        $('.add-bookmark-btn,.add-folder-btn ').prop('disabled', true);
    },

    populateData: function(userInfo){
        var bmCollection;

        // To populate the list of folders in the left-side
        $('.main_container > .row').empty();
        this.folderNames = _.pluck( userInfo.folders, "name" );
        $('.main_container > .row').append( new FoldersListView({ model : new FolderCollection( userInfo.folders ) }).render().el);

        //// To populate the bookmarks in the right-side
        bmCollection = new BookmarkCollection(userInfo.folders[0].bookmarks);
        bmCollection.folder_name = userInfo.folders[0].name;
        $('.main_container > .row').append( new BookmarksListView({ model : bmCollection}).render().el);
    },

    getfolderRoute:function(fname){
        var self = this;
        if( !window.profile_id ) {
            app.navigate("");
        }
        else {
            this.fetchfolderbookmarks(fname);
        }
    },
    // To fetch the bookmarks in the right side, given a folder name
    fetchfolderbookmarks : function(fname) {
        var folder = new FolderModel({ name : fname }), self = this;
        folder.fetch({
            success: function (fdata) {
                var folderInfo = ( fdata && fdata.attributes[0] ) ? fdata.attributes[0].folders[0] : {};
                if( !folderInfo.name) folderInfo.name = fname ;
                self.showfolderbookmarks( folderInfo );
            }
        });
    },
    // To populate the bookmarks in the right side, given a folder name
    showfolderbookmarks : function(folderData){
        var bmCollection = new BookmarkCollection(folderData.bookmarks ? folderData.bookmarks : []);
        bmCollection.folder_name = folderData.name;
        $('.main_container > .row > .mainbar').remove();
        $('.main_container > .row').append( new BookmarksListView({ model : bmCollection}).render().el);
    }

});

//List of Views
templateLoader.load(["BookmarksListView","BookmarksRowView","FoldersRowView","FoldersListView"],
function () {
    app = new Router();
    Backbone.history.start();
});
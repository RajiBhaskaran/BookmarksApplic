window.BookmarkModel = Backbone.Model.extend({
    
    idAttribute: "bookmark_name",

    validate:function (attrs , options) {

        if(!attrs.bookmark_name || ! attrs.bookmark_url)
            return "Please enter a valid name and url" ;
        
    }

});

window.BookmarkCollection = Backbone.Collection.extend({

    model : BookmarkModel,

    url : "/users/"+ window.profile_id+"/folder/"+this.folder_name

});

window.FolderModel = Backbone.Model.extend({

    idAttribute: "name",

    urlRoot : "/users/"+ window.profile_id+"/folder",

    validate:function (attrs , options) {
        if(!attrs.name)
            return "Please enter a valid folder name" ;
        
    }

});

window.FolderCollection = Backbone.Collection.extend({

    model : FolderModel

});
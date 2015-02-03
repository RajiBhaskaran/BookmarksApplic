window.BookmarksListView = Backbone.View.extend({

    className:'col-sm-9 mainbar',

    events : {
        "click .add-bookmark-btn" : "addBookmark"
    },
    addBookmark : function () {
        var bookmarkModel = new BookmarkModel();
        bookmarkModel.collection = this.model;
        $(this.el).find('.bookmark-list').append(new BookmarksRowView( {model: bookmarkModel }).render().el);
    },

    render:function () {
        var self = this, data = {};
        if(this.model){
            data.folder_name = this.model.folder_name;
            // Setting the urlRoot here because the folder name is known only at this point
            BookmarkModel.prototype.urlRoot = "/users/"+ window.profile_id +"/folder/" + this.model.folder_name;
        }

        data.profile_id = window.profile_id;

        $(this.el).empty();
        $(this.el).html(this.template(data));
        if(this.model){
            _.each(this.model.models, function (bookmark) {
                bookmark.collection = this.model;
                $(self.el).find('.bookmark-list').append(new BookmarksRowView({model: bookmark}).render().el);
            }, this);
        }
        
        return this;
    }
});

window.BookmarksRowView = Backbone.View.extend({

    className:"row pad-top-bot-5",

    initialize:function () {
        this.folder_name = this.model.collection.folder_name;
    },
    events : {
        "click .cancel-bookmark-btn" : "cancelEdit",
        "click .delete-bookmark-btn" : "deleteBookmark",
        "click .ok-bookmark-btn" : "saveBookmark",
        "click .edit-bookmark-btn" : "editBookMark"
    },
    render:function () {
        var data = this.model.toJSON();
        if(!this.model.get('bookmark_name')) {
            data.bookmark_url = data.bookmark_name = "" ;
        }
        data.edit = this.model.edit ? this.model.edit : false;
        data.folder_name = this.folder_name;
        data.folderNames = app.folderNames;
        $(this.el).html(this.template(data));
        return this;
    },
    editBookMark : function() {
        this.model.edit = true;
        this.render();
    },
    saveBookmark : function () {
        var self = this, 
            b_name = this.$('#bookmark_name').val(),
            b_url = this.$('#bookmark_url').val();

        this.$('#bookmarkError').addClass('hide');

        if( this.model.edit ) {
            var b_old_name = this.model.get('bookmark_name'),
            new_folder_name = this.$('#changedFolder').val();
            this.model.set({'bookmark_name' : b_name , 'bookmark_url': b_url , 'folder_name':new_folder_name });
            this.model.edit = false;
            // Since bookmark's idAttribute itself is its name, model.save uses only new name in url.
            // Hence to avoid it, we make ajax PUT directly
            $.ajax({
                url : "users/"+ window.profile_id +"/folder/"+ this.folder_name + "/" + b_old_name,
                type : "PUT",
                contentType : "application/json",
                dataType : 'json',
                data : JSON.stringify(this.model.toJSON()),
                success : function(){
                    app.fetchfolderbookmarks(self.folder_name);
                },
                error : function(err, msg) {
                    self.$('#bookmarkError').removeClass('hide').text(err.responseText);
                }
            });
        }
        else {
            this.model.set({'bookmark_name' : b_name , 'bookmark_url': b_url });
            // Since bookmark's idAttribute itself is its name, model.save always makes a PUT.
            // Hence to avoid it, we make ajax POST directly
            $.ajax({
                url : "users/"+ window.profile_id +"/folder/" + this.folder_name,
                type : "POST",
                contentType : "application/json",
                dataType : 'json',
                data : JSON.stringify(this.model.toJSON()),
                success : function(){
                    self.render();
                },
                error : function(err) {
                    self.$('#bookmarkError').removeClass('hide').text(err.responseText);
                }
            });
        }
    },
    cancelEdit : function () {
        if(this.model.edit) {
            this.model.edit = false;
            this.render();
        }
        else
            this.remove();
    },
    deleteBookmark : function(){
        var self = this;
         this.model.destroy({
            success : function(){
                self.remove();
            }
         });
    }

});
window.FoldersListView = Backbone.View.extend({

    tagName : "nav", 

    id:"sidebar",

    className:"col-sm-3 sidebar",

    events : {
        "click .add-folder-btn" : "addFolder"
    },
    
    addFolder:function () {
        var folderModel = new FolderModel();
        folderModel.collection = this.model;
        this.$el.find('ul').prepend( new FoldersRowView( { model : folderModel }).render().$el);
    },

    render:function () {
    	var self =this;

        this.$el.append(this.template());
        
        if(this.model.length){
            // To make the Others folder always be at the last
            var othersFolder = this.model.findWhere({ name : 'Others'});
            this.model.remove(othersFolder);
            this.model.push(othersFolder);
        	_.each(this.model.models,function(folder){
                folder.collection = self.model;
        		self.$el.find('ul').append( new FoldersRowView( { model : folder }).render().$el);
        	})
        }
        return this;
    }

});

window.FoldersRowView = Backbone.View.extend({

    tagName : "li", 

    className: "clearfix pad-lt-40",

    render:function () {
        var data = this.model.toJSON();
        data.edit = this.model.edit ? this.model.edit : false;
        $(this.el).html(this.template(data));
        return this;
    },

    events : {
        "click .del-folder-btn" : "deleteFolder" ,
        "click .cancel-folder-btn" : "cancelFolder",
        "click .ok-folder-btn" : "saveFolder",
        "click .edit-folder-btn" : "editFolder"
    },

    deleteFolder : function(e){
         var self = this, folders = this.model.collection;
         this.model.destroy({
            success : function(){
                // To get the next folder name
                var nextName = self.$el.next().find('a').text().trim();
                var nextFolder = folders.findWhere({ name : nextName});
                // To remove the folder from the list of folder names
                app.folderNames = _.without(app.folderNames , self.model.get('name') );
                self.remove();
                // The right side pane must show up the next folder's bookmarks
                app.showfolderbookmarks( nextFolder.toJSON() );
            }
         })
    },
    cancelFolder : function () {
        if( this.model.edit ) {
            this.model.edit = false;
            this.render();
        } 
        else {
            this.remove();
        }
    },
    // Client side validations to check for folder name duplicates 
    checkFolderNotExist : function(fname) {
        if(app.folderNames.indexOf(fname) >= 0){
            this.$('#folderError').text('Name already exists !').removeClass('hide');
            return false;
        }
        else if(!fname){
            this.$('#folderError').text('Enter a name !').removeClass('hide');
            return false;
        }
        else
            return true;
    },
    editFolder : function() {
        this.model.edit = true;
        this.render();
    },
    saveFolder : function () {

        var self = this, f_name = this.$('#folder_name').val();

        // Since folder's idAttribute itself is its name, model.save uses only new name in url.
        // Hence to avoid it, we make ajax PUT directly
        if(this.checkFolderNotExist(f_name)){
            this.$('#folderError').addClass('hide');
            if( this.model.edit ) {
                var old_name = this.model.get('name');
                this.model.set('name', f_name);
                this.model.edit = false;
                $.ajax({
                    url : "users/"+ window.profile_id +"/folder/"+ old_name,
                    type : "PUT",
                    contentType : "application/json",
                    dataType : 'json',
                    data : JSON.stringify(this.model.toJSON()),
                    success : function(){
                        self.render();
                        app.folderNames = _.without(app.folderNames , old_name );
                        app.folderNames.push(f_name);
                        app.showfolderbookmarks(self.model.toJSON());
                    }
                });
            }
            else {

                this.model.set('name', f_name);
                // Since folder's idAttribute itself is its name, model.save always makes a PUT.
                // Hence to avoid it, we make ajax POST directly
                $.ajax({
                    url : "users/"+ window.profile_id +"/folder",
                    type : "POST",
                    contentType : "application/json",
                    dataType : 'json',
                    data : JSON.stringify(this.model.toJSON()),
                    success : function(){
                        self.render();
                        app.folderNames.push(f_name);
                        app.showfolderbookmarks(self.model.toJSON());
                    }
                });
            }
        }
    }
});
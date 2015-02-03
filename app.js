
var express    = require('express'),       
    app        = express(),                
    bodyParser = require('body-parser');

var users = require('./users');

app.use(express.static(__dirname + '/client'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// profile_id is the primary key, which is google profile ID
// To get all the bookmarks in a folder
app.get('/users/:profile_id/folder/:folder_name', users.getFolderBookmarks);

//To get the folders and bookmarks in a user profile
app.get('/users/:profile_id', users.getUserBookmarks );

// To add a bookmark given a folder name
app.post('/users/:profile_id/folder/:folder_name', users.addBookmark );

//To update a bookmark given the folder and bookmark names
app.put('/users/:profile_id/folder/:folder_name/:bookmark_name', users.updateBookmark );


// To delete a bookmark
app.delete('/users/:profile_id/folder/:folder_name/:bookmark_name', users.removeBookmark);

// To update a foldername
app.put('/users/:profile_id/folder/:folder_name', users.updateFolder );

// To delete a folder
app.delete('/users/:profile_id/folder/:folder_name', users.removeFolder );

// To create a folder for a user
app.post('/users/:profile_id/folder', users.addFolder );


app.listen(8000);
console.log('Listening on port 8000...');
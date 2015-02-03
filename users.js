var mongojs  = require('mongodb'),db;

mongojs.connect('mongodb://localhost:27017/users', ["data"],function(err,result){
	if(!err)
     db = result.collection('data');
});

exports.getUserBookmarks = function( req, res ) {

	var profileId = req.params.profile_id;

	db.findOne({ '_id' : profileId }, {}, function( err, userdetails ) {
        if ( userdetails)
        	res.send(userdetails);
        else{
        	var data = { "_id" : profileId , "folders" : [{ "name" : "Others" ,"bookmarks":[] }]};
        	db.insert( data,
				function(err, result){
					res.json(data);
				}
			);
        }
    });

}
exports.getFolderBookmarks = function ( req, res ) {

	var profileId = req.params.profile_id,
	    f_name = req.params.folder_name;

	db.find( { "_id" : profileId , "folders.name" : f_name }, { "folders.$.bookmarks" : 1}).toArray( 
		function(err, result){

			res.json(result);
		}
	);
}
exports.addFolder = function ( req, res ) {

	var profileId = req.params.profile_id;
	var f_name = req.body.name;

	if(!f_name)
		res.status(500).send('Enter folder name');
	else{
		db.update( 
			{ '_id' : profileId }, 
			{ 
				$addToSet: { "folders" : { "name" : f_name, "bookmarks":[] } }
			},
			{ upsert: true },
			function(err, result){
				res.json(result);
			}
		);
	}
}

// Check if bookmark name already exists and then add
exports.addBookmark = function ( req, res ) {

	var profileId = req.params.profile_id,
		b_name = req.body.bookmark_name,
		b_url = req.body.bookmark_url,
	    f_name = req.params.folder_name;

	if(!b_name || !b_url)
		res.status(500).send('Enter both name and url');
	else {

		db.find( 
			{ '_id' : profileId , "folders.bookmarks.bookmark_name" : b_name }, 
			{ 
				"folders.$.bookmarks" : 1
			}).toArray(
			function(err, result){
				if(!result.length){
					db.update( 
						{ '_id' : profileId , "folders.name" : f_name }, 
						{ 
							$addToSet: { "folders.$.bookmarks" : { "bookmark_name" : b_name, "bookmark_url" : b_url } }
						},
						{ upsert: true },
						function(err, result){
							res.json(result);
						}
					);
				}
				else {
					res.status(500).send('Bookmark name already exists');
				}
			}
		);
	}
	
}
exports.updateBookmark = function ( req, res ) {

	var profileId = req.params.profile_id,
		old_b_name = req.params.bookmark_name,
		old_f_name = req.params.folder_name,
		new_b_name = req.body.bookmark_name,
		new_b_url = req.body.bookmark_url,
		new_f_name = req.body.folder_name;

	if(!new_b_name || !new_b_url)
		res.status(500).send('Enter both name and url');
	else {
		
			db.find( { "_id" : profileId , "folders.name" : old_f_name },{ "folders.$.bookmarks" : 1}).toArray( 
				function(err, resp){
					var bookmark = resp[0].folders[0].bookmarks.filter(function(bm){
						return (bm.bookmark_name == old_b_name) ;
					})
					if(new_b_name)
						bookmark[0].bookmark_name = new_b_name;
					if(new_b_url)
						bookmark[0].bookmark_url = new_b_url;
					
					db.update( 
						{ "_id" : profileId ,"folders.name" : old_f_name }, 
						{ 
							$pull: { "folders.$.bookmarks" : { "bookmark_name" : old_b_name } }
						},
						function(err, result){
							db.update( 
								{ '_id' : profileId , "folders.name" : new_f_name ? new_f_name : old_f_name }, 
								{ 
									$addToSet: { "folders.$.bookmarks" : bookmark[0] }
								},
								{ upsert: true },
								function(err, result){
									res.json(result);
								}
							);
						}
					);
				}
			);
			
		}
	
}
exports.updateFolder = function ( req, res ) {

	var profileId = req.params.profile_id,
	    old_name = req.params.folder_name,
	    new_name = req.body.name;

	db.update( 
		{ "_id" : profileId , "folders.name" : old_name }, 
		{ 
			$set: { "folders.$.name" : new_name }
		},
		function(err, result){
			res.json(result);
		}
	);
}
exports.removeFolder = function ( req, res ) {

	var profileId = req.params.profile_id,
	    f_name = req.params.folder_name;

	db.update( 
		{ "_id" : profileId }, 
		{ 
			$pull: { folders : { name : f_name } }
		},
		function(err, result){
			res.json(result);
		}
	);
}
exports.removeBookmark = function ( req, res ) {

	var profileId = req.params.profile_id,
	    f_name = req.params.folder_name,
	    b_name = req.params.bookmark_name;

	db.update( 
		{ "_id" : profileId ,"folders.name" : f_name }, 
		{ 
			$pull: { "folders.$.bookmarks" : { "bookmark_name" : b_name } }
		},
		function(err, result){
			res.json(result);
		}
	);
}

	



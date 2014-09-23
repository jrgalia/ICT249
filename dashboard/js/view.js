$(document).ready(function() {
	Parse.initialize(PARSE_APP.ID, PARSE_APP.KEY);
	var Politician = Parse.Object.extend('Politician');
	var Photo = Parse.Object.extend('Photo');
	
	var id = getUrlParameter('id');
	var query = new Parse.Query(Politician);
	console.log('id', id);
	query.get(id, {
    	success: function(result) {
    		var name = result.get('position') + ' ' + result.get('first_name') + ' ';
    		if (result.get('nick_name') !== undefined)
    			name += '"' + result.get('nick_name') + '" ';
    		name += result.get('middle_name') + ' ' + result.get('last_name');
			$('#name').text(name);
			
			var address = result.get('town') + ', ' + result.get('province') + ', ' + result.get('region');
			$('#address').text(address);
			
			var photo = result.get('photo');
			if (photo !== undefined)
				$('#photo').attr('src', photo._url);
			else
				$('#photo').attr('src', 'img/profile.png');
				
    	},
    	error: function(error) {
    		console.error(error.message);
    	}
    });	
	
});

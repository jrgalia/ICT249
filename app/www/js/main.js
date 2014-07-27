Parse.initialize(PARSE_APP.ID, PARSE_APP.KEY);
var Politician = Parse.Object.extend('Politician');


function listItem(id, img, name, position, address) {
	//TODO change profile.png
	img = 'img/profile.png';
	var output = '<li><a href="#" data-objectId="' + id + '">' +
		'<img src="' + img + '" alt="' + name + '" />' +
		'<h2>' + position + ' ' + name + '</h2>' +
		'<h3>' + address + '</h3>' +
		'</a></li>';
	
	return output;
}

//when index is loaded
function loadIndex() {
	var user = Parse.User.current();
	if (user !== null) {
		$.ui.loadContent('#panel-home', false, false);
	}
}


//when panel-home is loaded
function loadHomePage() {
	var user = Parse.User.current();
	
	var town = user.get('town');
	var province = user.get('province');
	var query = new Parse.Query(Politician);
    query.equalTo('town', town);
    
    //TODO compound query "and"
    query.find({
    	success: function(results) {
    		var location = town + ', ' + province;
    		
    		//update search result list
    		var output = [];	    		
    		for(var i=0; i<results.length; i++) {
    			var object = results[i];
    			var name = object.get('first_name') + ' ' + object.get('last_name');
    			//TODO change img
    			var html = listItem(object.id, 'img', name, object.get('position'), location);
    			output.push(html);
    		}
    		$('#panel-home .profile-list').html(output.join(''));
    	},
    	error: function(error) {
    		alert("Error: " + error.code + " " + error.message);
    	}
    });
}


//when user-profile is loaded
function loadUserProfile() {
	var user = Parse.User.current();
	if (user !== null) {
		$('#user-profile-email').val(user.get('email'));
		$('#user-profile-display-name').val(user.get('display_name'));
		$('#user-profile-region').val(user.get('region'));
		$('#user-profile-region').trigger('change', [user.get('province'), user.get('town')]);
	}
}


$(document).ready(function() {
	//region dropdown
	$('select.region').on('change', function(e, province, town) {
		var file = this.options[this.selectedIndex].getAttribute('data-file');
		var $province = $(this).siblings('.province');
		var $town = $(this).siblings('.town');
		//empty other dropdown
		$province.empty();
		$town.empty();
		$town.append('<option value="">--town--</option>');
		
		$.ajax({
			dataType: 'json',
			url: 'js/json/' + file + '.json',
			success: function (data) {
				//iterate province;
				var output = ['<option value="">--province--</option>'];
		        $.each(data['province'], function(index, value){
		        	output.push('<option value="'+ value +'">'+ value +'</option>');
		        });
		        $province.html(output.join(''));
		        
		        //set province
		        if (province !== undefined) {
		        	$province.val(province);
		        	$('#user-profile-province').trigger('change', town);
		        }
		    },
		    error: function (request, status, error) {
		        alert('error:' + request.responseText);
		    }
		});
	});
	
	
	//province dropdown
	$('select.province').on('change', function(e, town) {
		var $region = $(this).siblings('.region');
		var file = $region[0].options[$region[0].selectedIndex].getAttribute('data-file');
		console.log('file ' + file);
		var province = $(this).val();
		var $town = $(this).siblings('.town');
		$town.empty();
		
		$.ajax({
			dataType: 'json',
			url: 'js/json/' + file + '.json',
			success: function (data) {
				//iterate province;
				var output = ['<option value="">--town--</option>'];
		        $.each(data[province], function(index, value){
		        	output.push('<option value="'+ value +'">'+ value +'</option>');
		        });
		        $town.html(output.join(''));
		        
		        //set town
		        if (town !== undefined) {
		        	$town.val(town);
		        }
		    },
		    error: function (request, status, error) {
		        alert('error:' + request.responseText);
		    }
		});
	});
	
	
	$('#signup-submit').on('click', function(e){
		//TODO validate input
		e.preventDefault();
		var email = $('#signup-email').val();
		var password = $('#signup-password').val();
		var displayName = $('#signup-display-name').val();
		var region = $('#signup-region').val();
		var province = $('#signup-province').val();
		var town = $('#signup-town').val();
		console.log('region:' + region);
		
		Parse.User.signUp(email, password, 
				{ email:email, display_name:displayName, region:region, province:province, town:town, ACL: new Parse.ACL()},
				{
			        success: function (user) {
			           console.log('success:' + user);
			           $.ui.loadContent('#panel-home', false, false);
			        }, error: function(user, error) {
			        	console.log(error.message);
			        }
				});
		
	});
	
	
	//login
	$('#login-submit').on('click', function(e){
		//TODO validate input
		e.preventDefault();
		var email = $('#login-email').val();
		var password = $('#login-password').val();
		console.log('email:' + email);
		console.log('password:' + password);
		Parse.User.logIn(email, password, {
	        success: function (user) {
		           console.log('success login:' + user);
		           $.ui.loadContent('#panel-home', false, false);
		           
	        }, error: function(user, error) {
	        	console.log(error.message);
	        }
	        })
	});
	
	
	//logout
	$('#settings-logout').on('click', function(e){
		e.preventDefault();
		Parse.User.logOut();
		$.ui.loadContent('#panel-login', false, false);
	});

	
	
	$('#panel-search-submit').on('click', function() {
		var province = $('#search-province').val();
		var town = $('#search-town').val();
		
	    var query = new Parse.Query(Politician);
	    query.equalTo('town', town);
	    
	    //TODO compound query "and"
	    query.find({
	    	success: function(results) {
	    		
	    		var address = town + ', ' + province;
	    		$('#search-location').text(address);
	    		$.ui.loadContent('#panel-search-result', false, false);
	    		
	    		//update search result list
	    		var output = [];	    		
	    		for(var i=0; i<results.length; i++) {
	    			var object = results[i];
	    			var name = object.get('first_name') + ' ' + object.get('last_name');
	    			//TODO change img
	    			var html = listItem(object.id, 'img', name, object.get('position'), address);
	    			output.push(html);
	    		}
	    		$('#panel-search-result .profile-list').html(output.join(''));
	    	},
	    	error: function(error) {
	    		alert("Error: " + error.code + " " + error.message);
	    	}
	    });
	});
	
	
	$('.profile-list').on('click', 'a', function(e){
		e.preventDefault();
		var objectId = $(this).data('objectId');
		console.log('objectId:' + objectId);
		
		var query = new Parse.Query(Politician);
		query.get(objectId, {
			success: function(object) {
				//TODO update img src
				var position = object.get('position');
				var firstName = object.get('first_name');
				var lastName = object.get('last_name');
				var nickName = object.get('nick_name');
				
				var completeName = position + ' ' + firstName + ' ';
				if (firstName != nickName)
					completeName += '"' + nickName + '" ';
				completeName += lastName;
				
				var address = object.get('town') + ', ' + object.get('province');
				$('#panel-politician-profile-name').text(completeName);
				$('#panel-politician-profile-address').text(address);
				
				$.ui.loadContent('#panel-politician-profile', false, false);
			},
			error: function(object, error) {
			    // The object was not retrieved successfully.
			    // error is a Parse.Error with an error code and description.
			}
		})
	});
	
	
	$('#user-profile-submit').on('click', function(e) {
		//TODO validate here
		e.preventDefault();
		var displayName = $('#user-profile-display-name').val();
		var region = $('#user-profile-region').val();
		var province = $('#user-profile-province').val();
		var town = $('#user-profile-town').val();
		
		var user = Parse.User.current();
		user.save({display_name:displayName, region:region, province:province, town:town}, {
			success: function (user) {
				console.log('successfully saved');
			}, error: function(user, error) {
				console.log(error.message);
			}
		});
	});

});

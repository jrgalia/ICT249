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
	if (user === null){
		$.ui.loadContent('#panel-login', false, false);
		return;
	}
	
	var town = user.get('town');
	var province = user.get('province');
	var query = new Parse.Query(Politician);
    query.equalTo('province', province);
    query.equalTo('town', town);
    
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
    		navigator.notification.alert(error.message, null, 'Error');
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
		        navigator.notification.alert(request.responseText, null, 'Error');
		    }
		});
	});
	
	
	//province dropdown
	$('select.province').on('change', function(e, town) {
		var $region = $(this).siblings('.region');
		var file = $region[0].options[$region[0].selectedIndex].getAttribute('data-file');
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
		        navigator.notification.alert(request.responseText, null, 'Error');
		    }
		});
	});
	
	
	$('#signup-submit').on('click', function(e){
		e.preventDefault();
		var email = $('#signup-email').val();
		var password = $('#signup-password').val();
		var displayName = $('#signup-display-name').val();
		var region = $('#signup-region').val();
		var province = $('#signup-province').val();
		var town = $('#signup-town').val();
		
		if (displayName.length === 0 || !displayName.trim()) {
			navigator.notification.alert('display name is required', null, 'Error');
			return;
		}
		if (region.length === 0) {
			navigator.notification.alert('region is required', null, 'Error');
			return;
		}
		if (province.length === 0) {
			navigator.notification.alert('province is required', null, 'Error');
			return;
		}
		if (town.length === 0) {
			navigator.notification.alert('town is required', null, 'Error');
			return;
		}
		
		Parse.User.signUp(email, password, 
				{ email:email, display_name:displayName, region:region, province:province, town:town, ACL: new Parse.ACL()},
				{
			        success: function (user) {
			           $.ui.loadContent('#panel-home', false, false);
			        }, error: function(user, error) {
			    		navigator.notification.alert(error.message, null, 'Error');
			        }
				});
		
	});
	
	
	//login
	$('#login-submit').on('click', function(e){
		e.preventDefault();
		var email = $('#login-email').val();
		var password = $('#login-password').val();
		Parse.User.logIn(email, password, {
	        success: function (user) {
	           $.ui.loadContent('#panel-home', false, false);
	           
	        }, error: function(user, error) {
	    		navigator.notification.alert(error.message, null, 'Error');
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
		var region = $('#search-region').val();
		var province = $('#search-province').val();
		var town = $('#search-town').val();
		if (region.length === 0) {
			navigator.notification.alert('region is required', null, 'Error');
			return;
		}
		if (province.length === 0) {
			navigator.notification.alert('province is required', null, 'Error');
			return;
		}
		if (town.length === 0) {
			navigator.notification.alert('town is required', null, 'Error');
			return;
		}
		
	    var query = new Parse.Query(Politician);
	    query.equalTo('province', province);
	    query.equalTo('town', town);
	    
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
	    		navigator.notification.alert(error.message, null, 'Error');
	    	}
	    });
	});
	
	
	$('.profile-list').on('click', 'a', function(e){
		e.preventDefault();
		var objectId = $(this).data('objectId');

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
				navigator.notification.alert(error.message, null, 'Error');
			}
		})
	});
	
	
	$('#user-profile-submit').on('click', function(e) {
		e.preventDefault();
		var displayName = $('#user-profile-display-name').val();
		var region = $('#user-profile-region').val();
		var province = $('#user-profile-province').val();
		var town = $('#user-profile-town').val();
		
		if (displayName.length === 0 || !displayName.trim()) {
			navigator.notification.alert('display name is required', null, 'Error');
			return;
		}
		if (region.length === 0) {
			navigator.notification.alert('region is required', null, 'Error');
			return;
		}
		if (province.length === 0) {
			navigator.notification.alert('province is required', null, 'Error');
			return;
		}
		if (town.length === 0) {
			navigator.notification.alert('town is required', null, 'Error');
			return;
		}
		
		var user = Parse.User.current();
		user.save({display_name:displayName, region:region, province:province, town:town}, {
			success: function (user) {
				console.log('successfully saved');
			}, error: function(user, error) {
				navigator.notification.alert(error.message, null, 'Error');
			}
		});
	});

});
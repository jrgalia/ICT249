Parse.initialize(PARSE_APP.ID, PARSE_APP.KEY);
var Politician = Parse.Object.extend('Politician');
var Rating = Parse.Object.extend('Rating');
var Photo = Parse.Object.extend('Photo');


function alertError(message) {
	$.ui.popup(message);
	$.ui.hideMask();
}


function getProvince(arr) {
	for(var i=0; i<arr.length; i++){
		if (arr[i].types[0] === 'administrative_area_level_2')
			return arr[i].long_name;
	}
}


function getTown(arr) {
	for(var i=0; i<arr.length; i++){
		if (arr[i].types[0] === 'locality')
			return arr[i].long_name;
	}
}


function listItem(id, img, name, position, address) {
	img = img || 'img/profile.png';
	var output = '<li><a href="#" data-objectId="' + id + '">' +
		'<img height="100" src="' + img + '" alt="' + name + '" />' +
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
	
	$.ui.showMask(' ');
	var town = user.get('town');
	var province = user.get('province');
	var query = new Parse.Query(Politician);
    query.equalTo('province', province);
    query.equalTo('town', town);
    
    query.find({
    	success: function(results) {
    		var location = town + ', ' + province;
    		
    		//sort by position
    		var rank = {"Mayor":1, "Vice-Mayor":2, "Councilor":3};
    		results.sort(function(x, y) {
    			if(rank[x.get('position')] < rank[y.get('position')])
    				return -1;
    			if(rank[x.get('position')] > rank[y.get('position')])
    				return 1;
    			return 0;
    		});
    		
    		//update list
    		var output = [];	    		
    		for(var i=0; i<results.length; i++) {
    			var object = results[i];
    			var name = object.get('first_name') + ' ' + object.get('last_name');
    			var img = null;
    			var photo = results[i].get('photo');
    			if (photo !== undefined)
	    			img = photo._url;
    			var html = listItem(object.id, img, name, object.get('position'), location);
    			output.push(html);
    		}
    		$('#panel-home .profile-list').html(output.join(''));
    		$.ui.hideMask();
    	},
    	error: function(error) {
	    	alertError(error.message);
    	}
    });
}


//when user-profile is loaded
function loadUserProfile() {
	$.ui.showMask(' ');
	var user = Parse.User.current();
	if (user !== null) {
		$('#user-profile-email').val(user.get('email'));
		$('#user-profile-display-name').val(user.get('display_name'));
		$('#user-profile-region').val(user.get('region'));
		$('#user-profile-region').trigger('change', [user.get('province'), user.get('town')]);
	}
	$.ui.hideMask();
}


function findRating(ratings, user, year, quarter) {
	for (var i = 0; i < ratings.length; i++) {
		if (ratings[i].user === user && ratings[i].year === year && ratings[i].quarter === quarter) {
			return(i);
		}
	}
	return -1;
}


function loadRate() {
	$.ui.showMask(' ');
	$('#rate a.red').removeClass('red');
	$('#rate-politician-comment').val('');
	var objectId = $('#panel-rate-politician').data('objectId');	//politician ID
	var userName = Parse.User.current().getUsername();

	var date = new Date();
	var year = date.getFullYear();
	var quarter = Math.floor((date.getMonth() + 3) / 3);
	
	var query = new Parse.Query(Rating);
    query.equalTo('politician', objectId);
    
    query.first({
    	success: function(rating) {
    		if (rating !== undefined) {
    			var ratings = rating.get('ratings'); 
    			var i = findRating(ratings, userName, year, quarter);
    			if (i !== -1) {
    				$('#rate a:nth-child('+ratings[i].rate+')').addClass('red');
    				$('#rate-politician-comment').val(ratings[i].comment);
    				$.ui.hideMask();
    				return;
    			}
    		}
    		
    		$('#rate a:nth-child(3)').addClass('red');
    		$('#rate-politician-comment').val('');
    		$.ui.hideMask();
    	},
    	error: function(error) {
    		alertError(error.message);
    	}
    });
}


function loadUMyLocation() {
	$.ui.showMask(' ');
	navigator.geolocation.getCurrentPosition(function(position) {
		
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;
		var geocoder = new google.maps.Geocoder();
		
		var yourLocation = new google.maps.LatLng(latitude, longitude);
		geocoder.geocode({"latLng": yourLocation }, function (results, status) {
			if(status == google.maps.GeocoderStatus.OK) {
				if(results[0]) {
					var town = getTown(results[0]['address_components']);
					var province = getProvince(results[0]['address_components']);
					
					//compound query
					var q1 = new Parse.Query(Politician);
				    q1.equalTo('province', province);
				    q1.equalTo('town', town);
				    
				    var q2 = new Parse.Query(Politician);
				    q2.equalTo('province', province);
				    if (town.indexOf('City') > -1) {
				    	q2.equalTo('town', town.replace(' City', ''));
				    } else {
				    	q2.equalTo('town', town + ' City');
				    }
				    
					var query = Parse.Query.or(q1, q2);				    
				    query.find({
				    	success: function(results) {				    		
				    		//sort by position
				    		var rank = {"Mayor":1, "Vice-Mayor":2, "Councilor":3};
				    		results.sort(function(x, y) {
				    			if(rank[x.get('position')] < rank[y.get('position')])
				    				return -1;
				    			if(rank[x.get('position')] > rank[y.get('position')])
				    				return 1;
				    			return 0;
				    		});
				    		
				    		//update list
				    		var output = [];	    		
				    		for(var i=0; i<results.length; i++) {
				    			var object = results[i];
				    			var name = object.get('first_name') + ' ' + object.get('last_name');
					    		var location = object.get('town') + ', ' + object.get('province');
				    			var img = null;
				    			var photo = object.get('photo');
				    			if (photo !== undefined)
					    			img = photo._url;
				    			var html = listItem(object.id, img, name, object.get('position'), location);
				    			output.push(html);
				    		}
				    		$('#panel-my-location .profile-list').html(output.join(''));
				    		$.ui.hideMask();
				    	},
				    	error: function(error) {
					    	alertError(error.message);
				    	}
				    });
				    
				} else {
					alertError('Google did not return any results.');
				}
			} else {
					alertError('Reverse Geocoding failed due to: ' + status);
				}
			});
		}, function(error) {
			alertError(error.message);
		});
}


$(document).ready(function() {
	
	//region dropdown
	$('select.region').on('change', function(e, province, town) {
		$.ui.showMask(' ');
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
		        $.ui.hideMask();
		    },
		    error: function (request, status, error) {
		    	alertError(request.responseTex);
		    }
		});
	});
	
	
	//province dropdown
	$('select.province').on('change', function(e, town) {
		$.ui.showMask(' ');
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
		        $.ui.hideMask();
		    },
		    error: function (request, status, error) {
		    	alertError(request.responseText);
		    }
		});
	});
	
	
	$('#signup-submit').on('click', function(e){
		e.preventDefault();
		$.ui.showMask(' ');
		var email = $('#signup-email').val();
		var password = $('#signup-password').val();
		var displayName = $('#signup-display-name').val();
		var region = $('#signup-region').val();
		var province = $('#signup-province').val();
		var town = $('#signup-town').val();
		
		if (email.length === 0 || !email.trim()) {
			alertError('email is required');
			return;
		}
		
		if (password.length === 0 || !password.trim()) {
			alertError('password is required');
			return;
		}
		
		if (displayName.length === 0 || !displayName.trim()) {
			alertError('display name is required');
			return;
		}
		if (region.length === 0) {
			alertError('region is required');
			return;
		}
		if (province.length === 0) {
			alertError('province is required');
			return;
		}
		if (town.length === 0) {
			alertError('town is required');
			return;
		}
		
		Parse.User.signUp(email, password, 
				{ email:email, display_name:displayName, region:region, province:province, town:town, ACL: new Parse.ACL()},
				{
			        success: function (user) {
			           $.ui.loadContent('#panel-home', false, false);
			           $.ui.hideMask();
			        }, error: function(user, error) {
			        	alertError(error.message);
			        }
				});
		
	});
	
	
	//login
	$('#login-submit').on('click', function(e) {
		e.preventDefault();
		$.ui.showMask(' ');
		var email = $('#login-email').val();
		var password = $('#login-password').val();
		
		if (email.length === 0 || !email.trim()) {
			alertError('email is required');
			return;
		}
		if (password.length === 0 || !password.trim()) {
			alertError('password is required');
			return;
		}
		
		Parse.User.logIn(email, password, {
	        success: function (user) {
	        	$.ui.hideMask();
	        	$.ui.loadContent('#panel-home', true, false);
	           
	        }, error: function(user, error) {
	        	$.ui.hideMask();
	        	alertError(error.message);
	        }
		})
	});
	
	
	//logout
	$('#settings-logout').on('click', function(e) {
		e.preventDefault();
		Parse.User.logOut();
		navigator.app.exitApp();
		$.ui.loadContent('#panel-login', false, false);
	});

	
	
	$('#panel-search-submit').on('click', function() {
		$.ui.showMask(' ');
		var region = $('#search-region').val();
		var province = $('#search-province').val();
		var town = $('#search-town').val();
		if (region.length === 0) {
			alertError('region is required');
			return;
		}
		if (province.length === 0) {
			alertError('province is required');
			return;
		}
		if (town.length === 0) {
			alertError('town is required');
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
	    		
	    		//sort by position
	    		var rank = {"Mayor":1, "Vice-Mayor":2, "Councilor":3};
	    		results.sort(function(x, y){
	    			if(rank[x.get('position')] < rank[y.get('position')])
	    				return -1;
	    			if(rank[x.get('position')] > rank[y.get('position')])
	    				return 1;
	    			return 0;
	    		});
	    		
	    		
	    		//update search result list
	    		var output = [];	    		
	    		for(var i=0; i<results.length; i++) {
	    			var object = results[i];
	    			var name = object.get('first_name') + ' ' + object.get('last_name');

	    			var img = null;
	    			var photo = object.get('photo');
	    			if (photo !== undefined)
		    			img = photo._url;
	    			var html = listItem(object.id, img, name, object.get('position'), address);
	    			output.push(html);
	    		}
	    		$('#panel-search-result .profile-list').html(output.join(''));
	    		$.ui.hideMask();
	    	},
	    	error: function(error) {
	    		alertError(error.message);
	    	}
	    });
	});
	
	
	$('.profile-list').on('click', 'a', function(e) {
		$.ui.showMask(' ');
		e.preventDefault();
		var objectId = $(this).data('objectId');
		$('#panel-politician-profile').data('objectId', objectId);
		$('#panel-politician-ratings').empty();
		
		var query = new Parse.Query(Politician);
		query.get(objectId, {
			success: function(object) {
    			var photo = object.get('photo');
    			if (photo !== undefined)
	    			$('#panel-politician-profile-photo').attr('src', photo._url);
    			
				var position = object.get('position');
				var firstName = object.get('first_name');
				var lastName = object.get('last_name');
				var nickName = object.get('nick_name');
				
				var completeName = position + ' ' + firstName + ' ';
				if (firstName != nickName && nickName.length > 0 && nickName !== undefined)
					completeName += '"' + nickName + '" ';
				completeName += lastName;
				
				var address = object.get('town') + ', ' + object.get('province');
				$('#panel-politician-profile-name').text(completeName);
				$('#panel-politician-profile-address').text(address);
				
				var q = new Parse.Query(Rating);
				q.equalTo('politician', objectId);
				q.first({
					success: function(rating) {

						if (rating !== undefined) {
							var ratings = rating.get('ratings');
							var sum = 0;
							var i = 0;
							
							var table = {};
							var count = {};
							for(; i<ratings.length; i++) {
								var key = ratings[i]['year'] + '-' + ratings[i]['quarter'];
								if (table.hasOwnProperty(key)) {
									table[key] += ratings[i]['rate'];
									count[key]++;
								} else {
									table[key] = ratings[i]['rate'];
									count[key] = 1;
								}
							}
							var keys = Object.keys(table);
							keys.sort();

							var html = '';
							var ordinal = ['', '1st', '2nd', '3rd', '4th'];
							for(i=keys.length-1; i>=0; i--) {
								var temp = keys[i].split('-');
								var year = temp[0];
								var quarter = temp[1];
								var rate = table[keys[i]]
								html += '<p>' + year + ' ' + ordinal[quarter] + ' quarter: <b>' + (rate/count[keys[i]]) + '/5</b>' + '</p>';
							}
							
							$('#panel-politician-ratings').html(html);
						}
						$.ui.hideMask();
					},
					error: function(error) {
						alertError(error.message);
					}
				});
				$.ui.loadContent('#panel-politician-profile', false, false);
			},
			error: function(object, error) {
				alertError(error.message);
			}
		})
	});
	
	
	$('#user-profile-submit').on('click', function(e) {
		e.preventDefault();
		$.ui.showMask(' ');
		var displayName = $('#user-profile-display-name').val();
		var region = $('#user-profile-region').val();
		var province = $('#user-profile-province').val();
		var town = $('#user-profile-town').val();
		
		if (displayName.length === 0 || !displayName.trim()) {
			alertError('display name is required');
			return;
		}
		if (region.length === 0) {
			alertError('region is required');
			return;
		}
		if (province.length === 0) {
			alertError('province is required');
			return;
		}
		if (town.length === 0) {
			alertError('town is required');		
			return;
		}
		
		var user = Parse.User.current();
		user.save({display_name:displayName, region:region, province:province, town:town}, {
			success: function (user) {
				$.ui.hideMask();
			}, error: function(user, error) {
				alertError(error.message);
			}
		});
	});
	
	
	$('a.rate').on('click', function(e) {
		e.preventDefault();
		var objectId = $('#panel-politician-profile').data('objectId');
		$('#panel-rate-politician').data('objectId', objectId);
		$.ui.loadContent('#panel-rate-politician', false, false, 'pop');
	});
	
	
	$('#rate a').on('click', function(e) {
		e.preventDefault();
		$('#rate .red').removeClass('red');
		$(this).addClass('red');
	});
	
	
	$('#rate-politician-submit').on('click', function(e) {
		e.preventDefault()
		var objectId = $('#panel-rate-politician').data('objectId');
		var rate = parseInt($('#rate .red').text(), 10);
		var comment = $('#rate-politician-comment').val();

		if ( rate < 1 || rate > 5) {
			alertError('rate must be 1-5');
			return;
		}
		if (comment.length === 0 || !comment.trim()) {
			alertError('comment is required');
			return;
		}
		
		var user = Parse.User.current();
		
		var date = new Date();
		var year = date.getFullYear();
		var quarter = Math.floor((date.getMonth() + 3) / 3);

		
		var query = new Parse.Query(Rating);
	    query.equalTo('politician', objectId);
	    query.first({
	    	success: function(rating) {
	    		if (rating !== undefined) {
	    			var ratings = rating.get('ratings'); 
	    			var i = findRating(ratings, user.getUsername(), year, quarter);
	    			if (i !== -1) {
	    				ratings[i].updatedAt = new Date();
	    				ratings[i].rate = rate;
	    				ratings[i].comment = comment;
	    				rating.set('ratings', ratings);
	    			} else {
	    				rating.addUnique('ratings', {
	    					user:user.getUsername(), year:year, quarter:quarter, 
	    					rate:rate, comment:comment, createdAt:new Date(), 
	    					updatedAt:new Date()});
	    			}
	    			rating.save();
	    			$.ui.hideModal('');
	    			return;
	    		} else {
	    			var rating = new Rating();
	    			rating.set('politician', objectId);
	    			rating.addUnique('ratings', {
	    				user:user.getUsername(), year:year, quarter:quarter, 
	    				rate:rate, comment:comment, createdAt:new Date(), 
	    				updatedAt:new Date()});
	    			rating.save(null, {
	    				success: function(rating) {
	    					$.ui.hideModal('');
	    				},
	    				error: function(rating, error) {
	    					alertError(error.message);
	    				}
	    			})
	    		}
	    	},
	    	error: function(error) {
	    		alertError(error.message);
	    	}
	    });
	});

});
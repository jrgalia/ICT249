$(document).ready(function() {
	Parse.initialize(PARSE_APP.ID, PARSE_APP.KEY);
	var Politician = Parse.Object.extend('Politician');
	var Photo = Parse.Object.extend('Photo');
	
	
	$('#add').on('click', function(e) {
		var position = $('#position').val();
		var firstName = $('#firstName').val();
		var lastName = $('#lastName').val();
		var middleName = $('#middleName').val();
		var nickName = $('#nickName').val();
		
		var region = $('#region').val();
		var province = $('#province').val();
		var town = $('#town').val();
		
		var politician = new Parse.Object('Politician');
		politician.set('position', position);
		politician.set('first_name', firstName);
		politician.set('last_name', lastName);
		politician.set('middle_name', middleName);
		politician.set('nick_name', nickName);
		
		politician.set('region', region);
		politician.set('province', province);
		politician.set('town', town);
		politician.save(null, {
			success:function(result) {
				window.location = '/update.html?id=' + result.id;
			}
		});
	});
});

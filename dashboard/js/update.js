$(document).ready(function() {
	Parse.initialize(PARSE_APP.ID, PARSE_APP.KEY);
	var Politician = Parse.Object.extend('Politician');
	var Photo = Parse.Object.extend('Photo');
	
	var id = getUrlParameter('id');
	var query = new Parse.Query(Politician);
	query.get(id, {
    	success: function(result) {
    		$('#id').val(result.id);
			$('#firstName').val(result.get('first_name'));
			$('#lastName').val(result.get('last_name'));
			$('#middleName').val(result.get('middle_name'));
			$('#nickName').val(result.get('nick_name'));
			$('#position').val(result.get('position'));
			
			var photo = result.get('photo');
			if (photo !== undefined) {
				$('#photo').attr('src', photo._url);
				$('#removePhoto').removeAttr('disabled');
			}else {
				$('#photo').attr('src', 'img/profile.png');
				$('#removePhoto').attr('disabled', 'disabled');
			}
			
			var region = result.get('region');
			var province = result.get('province');
			var town = result.get('town');
			$('#region').val(region);
			$('#region').trigger('change', [province,town]);
    	},
    	error: function(error) {
    		console.error(error.message);
    	}
    });	
	
	
	$('#fileselect').on('change', function(e) {
	   	var fileUploadControl = $('#fileselect')[0];
		var file = fileUploadControl.files[0];
		var name = file.name;
		var parseFile = new Parse.File(name, file);
		
		$('#photo').removeAttr('src');
		parseFile.save().then(function() {
			var politician = new Parse.Object('Politician');
			politician.set('objectId', id);
			politician.set('photo', parseFile);
			politician.save(null, {
				success: function(politician) {
					var photo = politician.get('photo');
					$('#photo').attr('src', photo._url);
					$('#removePhoto').removeAttr('disabled');
				}
			});

		}, function(error) {
			console.error(error);
		});
	});
	
	
	$('#update').on('click', function(e) {
		var id = $('#id').val();
		var position = $('#position').val();
		var firstName = $('#firstName').val();
		var lastName = $('#lastName').val();
		var middleName = $('#middleName').val();
		var nickName = $('#nickName').val();
		
		var region = $('#region').val();
		var province = $('#province').val();
		var town = $('#town').val();
		
		var politician = new Parse.Object('Politician');
		politician.set('objectId', id);
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
				alert('successfully saved');
			}
		});
	});
	
	$('#removePhoto').on('click', function(e) {
		var id = $('#id').val();
		var politician = new Parse.Object('Politician');
		politician.set('objectId', id);
		politician.unset('photo');
		politician.save(null, {
			success:function(result) {
				$('#photo').attr('src', 'img/profile.png');
				alert('photo successfully removed');
			}
		});
	});
});

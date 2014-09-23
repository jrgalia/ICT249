$(document).ready(function() {
	Parse.initialize(PARSE_APP.ID, PARSE_APP.KEY);
	var Politician = Parse.Object.extend('Politician');

	//region dropdown
	$('#region').on('change', function(e, province, town) {

		var file = this.options[this.selectedIndex].getAttribute('data-file');
		var $province = $('#province');
		var $town = $('#town');

		//empty other dropdown
		$province.empty();
		$town.empty();
		$province.append('<option value="">--province--</option>');
		$town.append('<option value="">--town--</option>');
		
		if (file == null)
			return;
			
		$.ajax({
			dataType: 'json',
			url: 'json/' + file + '.json',
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
		        	$('#province').trigger('change', town);
		        }
		    },
		    error: function (request, status, error) {
		    	console.error(request.responseTex);
		    }
		});
	});
	
	
	//province dropdown
	$('#province').on('change', function(e, town) {
		var $region = $('#region');
		var file = $region[0].options[$region[0].selectedIndex].getAttribute('data-file');
		var province = $(this).val();
		var $town = $('#town');
		$town.empty();
		$town.append('<option value="">--town--</option>');
		
		if(province.length == 0)
			return;
		
		$.ajax({
			dataType: 'json',
			url: 'json/' + file + '.json',
			success: function (data) {
				//iterate province;
				var output = ['<option value="">--town--</option>'];
		        $.each(data[province], function(index, value){
		        	output.push('<option value="'+ value +'">'+ value +'</option>');
		        });
		        $town.html(output.join(''));
		       	if (town !== undefined) {
		        	$town.val(town);
		        }
		    },
		    error: function (request, status, error) {
		    	console.error(request.responseText);
		    }
		});
	});	


	$('#search').on('click', function(e) {
		e.preventDefault();
		var region = $('#region').val();
		var province = $('#province').val();
		var town = $('#town').val();
		if (region.length === 0) {
			console.error('region is required');
			return;
		}
		if (province.length === 0) {
			console.error('province is required');
			return;
		}
		if (town.length === 0) {
			console.error('town is required');
			return;
		}
		
		$('#list tbody').empty();
	    var query = new Parse.Query(Politician);
	    query.equalTo('province', province);
	    query.equalTo('town', town);
	    
	    query.find({
	    	success: function(results) {
	    		console.log('results', results);
	    		var address = town + ', ' + province;
	    		$('#search-location').text(address);
	    		
	    		
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
	    		for(var i=0; i<results.length; i++) {
	    			var object = results[i];
	    			var name = object.get('first_name') + ' ' + object.get('last_name');
	    			var position = object.get('position');

	    			var html = $('<tr><td>' + name + '</td><td>' + position + '</td><td>' +
	    			'<a href="view.html?id=' + object.id + '" target="_blank">[v]</a> ' +	    			
	    			'<a href="update.html?id=' + object.id + '" target="_blank">[e]</a> ' +
	    			'</td></tr>');
	    			$('#list tbody').append(html);
	    		}

	    	},
	    	error: function(error) {
	    		console.error(error.message);
	    	}
	    });
	});
});

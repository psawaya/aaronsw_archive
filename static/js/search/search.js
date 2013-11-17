function SearchSection() {
	var searchIndex;

  $(document).ready(function() {
    initialize();
  });

  // perform all chart initialization

  function initialize() {

		document.getElementById('searchSection').innerHTML += 
		'<div class="input-group">' +
				'<span class="input-group-addon">Search</span>' +
				'<input type="text" class="form-control">' +
		'</div>';
  		
		 // load searchIndex via  /api/get_search_index
		 
		 // setup search input

  }
}


$(document).ready(function() {
  var searchSection = new SearchSection();
});
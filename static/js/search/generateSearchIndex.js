

$(document).ready(function() {
  var searchIndex = lunr(function () {
    this.field('post_title', { boost: 10 })
    this.field('post_content')
    this.ref('postid')
	})
	var blogPosts;
	// get blog posts /api/posts
	// loop through posts
	
		searchIndex.add(post)
	
	//post to /api/set_search_index 
	
});
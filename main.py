import os
from flask import jsonify, Flask, render_template, request

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

import json
blog_posts = json.loads(open(os.path.join('data','blog_posts.json')).read())
#  search_index_json = open(os.path.join('data','search_index.json')).read()

@app.route('/')
def hello():
    return render_template('index.html')

@app.route('/api/posts')
def api_posts():
    return jsonify(blog_posts)

@app.route('/api/index')
def api_index():
    blog_index = {}
    min_time = float(request.args.get('min_time',-1))
    max_time = float(request.args.get('max_time',-1))
    for post_title, post in blog_posts.iteritems():
        if min_time != -1 and post['time'] < min_time:
            continue
        if max_time != -1 and post['time'] > max_time:
            continue
        blog_index[post_title] = {
            "post_title": post['post_title'],
            "time": post['time'],
            "postid": post['postid'],
            "tags": post['tags'],
            "post_len": len(post['post_content']),
            "internal_links": post['internal_links'],
            "external_links": post['external_links']
        }
    return jsonify(blog_index)
    
@app.route('/generate_search_index')
def api_generate_search_index():
	  return render_template('search/generateSearchIndex.html')

@app.route('/api/set_search_index', methods=['POST'])
def api_set_search_index():
    error = None
    if request.method == 'POST':
				search_index_json = request.form['searchIndexJson']
				open('blog_posts.json','w').write(search_index_json)  
    return render_template('search/searchIndexSuccess.html', error=error) 
		
		
@app.route('/api/get_search_index')
def api_get_search_index():
		return search_index_json
		
@app.route('/search')
def search():
		return render_template('search/search.html')		
			

if __name__ == '__main__':
    app.config.update(DEBUG=True,PROPAGATE_EXCEPTIONS=True,TESTING=True)
    import logging
    logging.basicConfig(level=logging.DEBUG)

    app.run()
    
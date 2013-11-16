import os
from flask import jsonify, Flask, render_template, request

app = Flask(__name__)

import json
blog_posts = json.loads(open(os.path.join('data','blog_posts.json')).read())

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

if __name__ == '__main__':
    app.config.update(DEBUG=True,PROPAGATE_EXCEPTIONS=True,TESTING=True)
    import logging
    logging.basicConfig(level=logging.DEBUG)

    app.run()
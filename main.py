import os
from flask import jsonify, Flask, render_template

app = Flask(__name__)

import json
blog_posts = json.loads(open(os.path.join('data','blog_posts.json')).read())

@app.route('/')
def hello():
    return render_template('index.html')

@app.route('/api/posts')
def api_posts():
    return jsonify(blog_posts)

if __name__ == '__main__':
    app.config.update(DEBUG=True,PROPAGATE_EXCEPTIONS=True,TESTING=True)
    import logging
    logging.basicConfig(level=logging.DEBUG)

    app.run()
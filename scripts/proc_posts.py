"""
This little script just takes the /posts directory from the rawthought repository
(https://github.com/joshleitzel/rawthought), creates a json file in each dir with
some metadata, renames the directory to the uniqueid of the post, and deletes the 
pdf and html files.
"""

from datetime import datetime
from time import mktime

import json
import os

blog_posts = {}

for dirname in os.listdir('posts'):
    if dirname == '.DS_Store': continue

    # Get post time
    # Each dir formatted like year-month-day-postid
    tokens = dirname.split('-')
    # HACK: Some postid's contain dashes, so grab all tokens after 
    # the 4th and join them back together with dashes.
    postid  = '-'.join(tokens[3:])
    time_tokens = map(int,tokens[:3])
    post_time = datetime(year=time_tokens[0],month=time_tokens[1],day=time_tokens[2])
    path = os.path.join('posts',dirname,'metadata.json')

    # Get post title from first line of markdown
    markdown_path = os.path.join('posts',dirname,postid + '.md')
    post_content = open(markdown_path,'r').read()
    post_title = post_content.split("\n")[0]

    # De-dupe post-titles
    if post_title in blog_posts:
        post_title = post_title + "-2"
        if post_title in blog_posts:
            print "STILL DUPE! ", post_title
            import sys
            sys.exit()


    blog_posts[postid] = {
        "time": mktime(post_time.timetuple()),
        "postid": postid,
        "post_title": post_title,
        "post_content": post_content
    }

open('blog_posts.json','w').write(json.dumps(blog_posts))

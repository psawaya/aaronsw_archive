from bs4 import BeautifulStoneSoup

import json
import os

# Rip tags from dumped evernote file
markup = open('../data/aaronsw.enex').read()
soup = BeautifulStoneSoup(markup)

posts = soup.find_all('note')

tagged_posts = [i for i in posts if len(i.find_all('tag')) > 0]
tagged_posts_dict = {}

for post in tagged_posts:
    post_id = post.find_all('title')[0].text

    tags = [tag.text for tag in post.find_all('tag')]

    print post_id, tags
    tagged_posts_dict[post_id] = tags


# Add tags to blog_posts.json
blog_posts_file = open(os.path.join('..','data','blog_posts.json'),'r+')
blog_posts = json.loads(blog_posts_file.read())

for post_title,post in blog_posts.iteritems():
    post_tags = tagged_posts_dict.get(post['postid'],[])
    blog_posts[post_title]['tags'] = post_tags

# Move back to the start of the file and overwrite it
blog_posts_file.seek(0)
blog_posts_file.write(json.dumps(blog_posts))

"""
This scripts parses the markdown strings in data/blog_posts.json and pulls out
the links inside of each post, and then adds them to data/blog_posts.json as 
metadata.
"""
from bs4 import BeautifulSoup
from markdown import markdown
import json

from urlparse import urlparse

blog_posts_file = open('../data/blog_posts.json','r+')
blog_posts = json.loads(blog_posts_file.read())

for post_title, post in blog_posts.iteritems():
    html = markdown(post['post_content'])

    # Map links to tuples of (url, link text)
    links = map(lambda x: (x['href'],x.text),BeautifulSoup(html).find_all('a'))
    post['internal_links'] = []
    post['external_links'] = []
    
    for href, link_text in links:
        if link_text == 'Original link':
            # Every article has an "original link" to itself; disregard
            continue

        if urlparse(href).netloc in ('www.aaronsw.com', 'aaronsw.com'):
            post['internal_links'].append(href)
        else:
            post['external_links'].append(href)

# Move back to the start of the file and overwrite it
blog_posts_file.seek(0)
blog_posts_file.write(json.dumps(blog_posts))

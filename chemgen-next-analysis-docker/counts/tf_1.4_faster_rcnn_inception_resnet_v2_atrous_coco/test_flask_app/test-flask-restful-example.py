#!/usr/bin/env python


"""
This is a pretty terrible way to write tests
FLASK_APP=flask-restful-example.py flask run
Will start this on port 5000
"""

import requests

uri = 'http://localhost:5000'
image_path = './RNAiI.3A1E_M_H12-autolevel.png'
headers = {'content-type': 'image/png'}
img = open(image_path, 'rb').read()

# res = requests.post(uri, json={'quote': 'THIS IS A QUOTE!'})
res = requests.post(uri, data={'image_data': img}, headers=headers)

print(res.json())
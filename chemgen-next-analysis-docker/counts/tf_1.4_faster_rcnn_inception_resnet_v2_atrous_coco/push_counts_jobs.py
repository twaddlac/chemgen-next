#!/usr/bin/env python3

import os
import glob
import requests

host = 'pyrite.abudhabi.nyu.edu:3005'
# host = 'localhost:5010'
uri = 'http://{}/tf_counts/1.0/api/count_worms'.format(host)


def health_check():
    uri = 'http://{}/tf_counts/1.0/api/health'.format(host)
    res = requests.get(uri, json={})
    print(res.json())


def push_counts_to_queue(dirs):
    print('Pushing {}'.format(os.path.dirname(dirs[0])))
    # dirs = [dirs[0]]
    for d in dirs:
        dd = os.path.join('/mnt/image', d, os.path.basename(d) + '-tf_counts.csv')
        data = {
            'image_path': os.path.join('/mnt/image', d),
            'counts': dd
        }

        res = requests.post(uri, json=data)
        print('Data : {}'.format(data))
        print('Res: {}'.format(res.json()))

    print('Finished {}'.format(os.path.dirname(dirs[0])))


def sanity_check():
    data = {}
    data['image_path'] = '/home/webuser/images/'
    data['counts'] = '/home/webuser/images/counts.csv'
    res = requests.post(uri, json=data)
    print('Data : {}'.format(data))
    print('Res: {}'.format(res.json()))

def sanity_check_real_world():

    dirs = [
        '2014Dec15/1155',
        '2014Dec08/966',
        '2015Nov09/3716',
        '2015Nov09/3620',
        '2015Oct26/3149',
        '2015Oct26/3053',
        '2015Oct26/3052']

    for d in dirs:
        dd = os.path.join('/mnt/image', d, os.path.basename(d) + '-tf_counts.csv')
        data = {
            'image_path': os.path.join('/mnt/image', d),
            'counts': dd
        }
        print(data)
        res = requests.post(uri, json=data)
        print(res.json())

def push_dirs_to_queue(d):
    dirs = glob.glob(d)
    for d in dirs:
        if os.path.isdir(d):
            ds = glob.glob('{}/*'.format(d))
            push_counts_to_queue(ds)


print('Health Check!')
health_check()
print('Sanity check!')
sanity_check()
# sanity_check_real_world()

print('Ok starting real world!')

push_dirs_to_queue('/mnt/image/2015*')
push_dirs_to_queue('/mnt/image/2014*')
push_dirs_to_queue('/mnt/image/2016*')
push_dirs_to_queue('/mnt/image/2017*')
push_dirs_to_queue('/mnt/image/2018*')


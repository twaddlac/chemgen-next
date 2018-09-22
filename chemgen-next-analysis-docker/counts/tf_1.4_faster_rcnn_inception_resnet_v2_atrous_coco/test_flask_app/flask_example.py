from flask import Flask, request, jsonify
import sys

app = Flask(__name__)

@app.route("/")
def hello():
    content = request.json
    print('Processing Request: count_worms', file=sys.stderr)
    print(request.args, file=sys.stderr)
    print(request.json, file=sys.stderr)
    print(content, file=sys.stderr)
    return jsonify({'request': content, 'sent': 1})

@app.route('/tf_counts/1.0/api/health/', methods=['POST', 'GET'])
def health():
    print('Processing request Health!')
    content = request.json
    print(content)
    return jsonify({'request': content, 'status': 'ok'})

from flask import Flask
from flask_restful import Resource, Api, reqparse
import os

app = Flask(__name__)
api = Api(app)

parser = reqparse.RequestParser()


class HelloWorld(Resource):
    """
    Hello, World!
    """

    def get(self):
        return {'hello': 'world'}

    def post(self):
        parser.add_argument('image_path', type=str, required=False)
        parser.add_argument('image_data', required=False)
        parser.add_argument('config', type=object, required=False)
        parser.add_argument('model_path', type=str, required=False, default=os.environ.get('MODEL_FILE'))
        parser.add_argument('labels', type=str, required=False, default=os.environ.get('LABELS_FILE'))
        parser.add_argument('counts', type=str, required=False)
        parser.add_argument('label_path', type=str, required=False)
        args = parser.parse_args()
        return {'hello': 'world', 'content': args}


api.add_resource(HelloWorld, '/hello')

if __name__ == '__main__':
    app.run(debug=True)

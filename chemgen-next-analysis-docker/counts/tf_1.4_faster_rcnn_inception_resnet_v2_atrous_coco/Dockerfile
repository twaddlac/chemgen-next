FROM continuumio/anaconda3

RUN apt-get update
RUN apt-get install -y curl
RUN conda install -y numpy pandas opencv scipy pip setuptools ipython
RUN pip install flask flask-restful pandas opencv-python matplotlib celery request jsonify gunicorn celery matplotlib jsonify tensorflow==1.4 gunicorn
#RUN pip install request jsonify gunicorn
#RUN pip --no-cache-dir install https://github.com/mind/wheels/releases/download/tf1.4-cpu/tensorflow-1.4.0-cp36-cp36m-linux_x86_64.whl

RUN useradd -ms /bin/bash webuser
USER webuser
WORKDIR /home/webuser

RUN mkdir -p /home/webuser/model/tf_1.4_faster_rcnn_inception_resnet_v2_atrous_coco
RUN mkdir -p /home/webuser/images
RUN mkdir -p /home/webuser/scripts

ADD research.tar.gz /home/webuser/scripts
ADD frozen_inference_graph.pb /home/webuser/model/tf_1.4_faster_rcnn_inception_resnet_v2_atrous_coco/
ADD worm_detection_labels.pbtxt /home/webuser/model/tf_1.4_faster_rcnn_inception_resnet_v2_atrous_coco/
ADD get_counts.py /home/webuser/scripts/
ADD flask_app/flask_get_counts.py /home/webuser/scripts
ADD RNAiI.3A1E_M_H12-autolevel.png /home/webuser/images

ENV PYTHONPATH "/home/webuser/scripts/research:/home/webuser/scripts/research/slim"

ENV LABEL_FILE /home/webuser/model/tf_1.4_faster_rcnn_inception_resnet_v2_atrous_coco/worm_detection_labels.pbtxt
ENV MODEL_FILE /home/webuser/model/tf_1.4_faster_rcnn_inception_resnet_v2_atrous_coco/frozen_inference_graph.pb
ENV IMAGE_PATH /home/webuser/images/RNAiI.3A1E_M_H12-autolevel.png
ENV TF_CPUS 6

RUN touch /home/webuser/images/RNAiI.3A1E_M_H12-autolevel-counts.csv
RUN python /home/webuser/scripts/get_counts.py --image_path /home/webuser/images/RNAiI.3A1E_M_H12-autolevel.png \
    --model_path /home/webuser/model/tf_1.4_faster_rcnn_inception_resnet_v2_atrous_coco/frozen_inference_graph.pb \
    --labels  /home/webuser/model/tf_1.4_faster_rcnn_inception_resnet_v2_atrous_coco/worm_detection_labels.pbtxt \
    --counts /home/webuser/images/RNAiI.3A1E_M_H12-autolevel-counts.csv \
    --label_path /home/webuser/images/

WORKDIR /home/webuser/scripts
EXPOSE 5000

##TODO Change this user - celery complains
USER root

ADD start_app.sh /home/webuser/scripts/start_app.sh

CMD ["/bin/bash", "-c", "./start_app.sh"]


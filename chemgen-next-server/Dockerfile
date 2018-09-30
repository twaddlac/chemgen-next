FROM node:9

RUN npm install -g pm2 nodemon loopback-connector-mysql
ENV NODE_ENV=dev

CMD cd /home/node/app && \
  sleep 60 && \
  ./wait-for-it.sh chemgen_next_dev_mysql_db:3308 -- nodemon server/server.js

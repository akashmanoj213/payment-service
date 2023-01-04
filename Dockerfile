FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD [ "node", "src/server.js" ]

ENV NODE_ENV=production
ENV PORT=5000
ENV DB_HOST=34.93.148.146
ENV DB_DATABASE=payments
ENV DB_USER=sahi-db-user
ENV DB_PASS=qwerty
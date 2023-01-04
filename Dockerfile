FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD [ "node", "src/server.js" ]

ENV NODE_ENV=production
ENV PORT=5000
ENV INSTANCE_UNIX_SOCKET="/cloudsql/pruinhlth-nprd-dev-scxlyx-7250:asia-south1:sahi-dev"
ENV DB_NAME=payments
ENV DB_USER=sahi-db-user
ENV DB_PASS=qwerty
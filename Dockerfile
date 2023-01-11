FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD [ "node", "src/server.js" ]

ENV NODE_ENV=production
ENV PORT=5000
ENV INSTANCE_UNIX_SOCKET="/cloudsql/pruinhlth-nprd-dev-scxlyx-7250:asia-south1:sahi-dev-pg"
ENV DB_NAME=Payments
ENV DB_USER=sahi-db-user
ENV DB_PASS="}e,;Qt7D-:3hmtKP"
ENV SERVICE_NAME=payment-service
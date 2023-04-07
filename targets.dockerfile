FROM node:17.4

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . /app

RUN ["npm", "run", "build"]

EXPOSE 3001

CMD ["npm", "run", "targets"]
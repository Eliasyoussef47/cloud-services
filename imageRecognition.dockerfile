FROM node:18.15

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . /app

RUN ["npm", "run", "build"]

EXPOSE 3004

CMD ["npm", "run", "imageRecognition"]
FROM node:18.15

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . /app

RUN ["npm", "run", "build"]

EXPOSE 4242

CMD ["npm", "run", "apiGateway"]
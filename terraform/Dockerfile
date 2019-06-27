
FROM ubuntu:16.04

WORKDIR /api

RUN apt-get update

RUN apt install curl -y

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -

RUN apt install nodejs -y

RUN apt-get install wget -y

RUN wget https://releases.hashicorp.com/terraform/0.11.11/terraform_0.11.11_linux_amd64.zip

RUN apt-get install unzip -y

RUN unzip terraform_0.11.11_linux_amd64.zip

RUN mv terraform /usr/local/bin/

ENV DB_PASSWORD="some password"

ENV DB_USERNAME="some useraname"

COPY . .

RUN npm install

CMD ["node","app.js"]


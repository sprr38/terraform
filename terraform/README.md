# VPOD Backend -DEV

This rest api is build on express framework using nodejs with RDS used as database and Terraform is used for building infrastructure in AWS cloud service

## Pre-requisite to run this project

- Nodejs
- Terraform (How To Install refer this          https://askubuntu.com/questions/983351/how-to-install-terraform-in-ubuntu)
- Proper Role of AWS Services to create various resources like AWS instance,Security Group
- RDS setup
- S3 Bucket should be configured
- RDS Password is passed through ENV Variable as RDS.PASSWORD

## How To Run

- Clone this project and configure s3 bucket,RDS credential and aws role

- npm install

# To Start the Server

- node app.js
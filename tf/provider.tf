provider "aws" {
  region  = "eu-central-1"
  version = "~> 2.60"
}

terraform {
  backend "s3" {
    bucket = "tf-bowl"
    key = "natgeo-pod-lambda"
    region  = "eu-central-1"
  }
}
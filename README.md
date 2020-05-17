# natgeo

NatGeo Photo of the day serverless function

Useful to autoupdate your desktop background

## Installation

Made for AWS Lambda

Zip the function for upload
Use terraform manifset in `tf` directory to deploy

```bash
cd function
npm install node-fetch aws-sdk
npm install --arch=x64 --platform=linux --target=10.17.0  sharp
zip -r function.zip .
cd ../tf
terraform init
terraform apply
```

Naturally, be sure to have AWS credentials as described in AWS-CLI docs

Your croped photos will end up in a public bucket you created.

resource "aws_s3_bucket" "pod-b" {
  bucket = "natgeo-pod"
  acl    = "public-read"
  policy = "${file("policy.json")}"
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "attch-lex" {
  role       = "${aws_iam_role.iam_for_lambda.name}"
  policy_arn = "arn:aws:iam::aws:policy/AWSLambdaExecute"
}

data "aws_s3_bucket" "lambdas-bowl" {
  bucket = "lambdas-bowl"
}

resource "aws_s3_bucket_object" "natgeo-src" {
  bucket = "${data.aws_s3_bucket.lambdas-bowl.bucket}"
  key    = "natgeo-pod.zip"
  source = "../function/function.zip"
  etag = "${filemd5("../function/function.zip")}"
}

resource "aws_lambda_function" "natgeo-pod" {
  s3_bucket     = "${data.aws_s3_bucket.lambdas-bowl.bucket}"
  s3_key        = "${aws_s3_bucket_object.natgeo-src.key}"
  function_name = "natgeo-pod"
  role          = "${aws_iam_role.iam_for_lambda.arn}"
  handler       = "index.handler"
  memory_size   = 256
  source_code_hash = "${filebase64sha256("../function/function.zip")}"

  runtime = "nodejs10.x"

}

resource "aws_lambda_alias" "pod_alias" {
  name             = "pod_alias"
  description      = "a pod alias"
  function_name    = "${aws_lambda_function.natgeo-pod.function_name}"
  function_version = "$LATEST"
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.natgeo-pod.function_name}"
  principal     = "events.amazonaws.com"
  source_arn    = "${aws_cloudwatch_event_rule.daily.arn}"
  qualifier     = "${aws_lambda_alias.pod_alias.name}"
}

resource "aws_cloudwatch_event_rule" "daily" {
  name        = "daily-cron"
  description = "Do things once a day"
  schedule_expression = "cron(0 5 * * ? *)"
}

resource "aws_cloudwatch_event_target" "check_at_rate" {
  rule = aws_cloudwatch_event_rule.daily.name
  arn = "${aws_lambda_alias.pod_alias.arn}"
}
# Cloudwatch Logs to Kinesis

This app takes logs from Cloudwatch, transforms them to a desired format, and puts the transformed data into an AWS SQS queue. The data in SQS will then be processed in batch and imported into Kinesis Firehose. You can configure your Kinesis Firehose on AWS to port transformed logs into S3, Redshift, Elasticsearch or Splunk for further analysis.

## Test against your own infrastructure

Step 1: Run `queue_events`, which gets logs from Cloudwatch, and queues them on SQS

> Parameters  
> `daysAgo`: Timerange for logs fetching. daysAgo = 1 means only fetch yesterday's log  
> `filterPattern`: pattern by which you want to filter your logs  
> `batchSize`: batch size for putting logs to SQS, default to 500  
> `queueUrl`: full url of the queue. You can find this in AWS SQS - Queue Detail  
> `logGroupName`: full name of your Cloudwatch log group

You can update the section marked `CUSTOM LOGIC` to put in your own log transformation logic

Step 2: Once you are done queueing log objects in SQS, you can run `insert_to_kinesis` for putting transformed log objects to Kinesis Firehose. Note that Kinesis Firehose is different from Kinesis Stream.

> Parameters  
> `deliveryStreamName`: Name of the Kinesis Firehose stream  
> `queueUrl`: full url of the queue. Same as above

You should run `insert_to_kinesis` with a scheduled task, which will wake up periodically and take jobs off of the SQS queue to process. We recommend setting the scheduled task interval to be once per minute.

## What else can you do?

Once you fork this app, you can expand and customize its functionalities. Some ideas:

- Back up all of your logs in a S3 bucket
- Gather and process user events, write them to S3, and use Athena to do SQL queries
- Create real time alerts based on 500s thrown in your logs, and post to Slack if alerts cross certain threshold

(params) => {
    // get a message off of a SQS queue 
    let data = api.run("aws_sqs.receive_message",
        { QueueUrl: params.queueUrl, MaxNumberOfMessages: 1 })[0].ReceiveMessageResponse.ReceiveMessageResult.Message;


    if (!data || !data.ReceiptHandle) {
        api.log("no data, going back to sleep");
        return;
    }

    const deleteHandle = data.ReceiptHandle;

    let records = data.Body;
    if (!records || records.length == 0) {
        api.log("no data, going back to sleep");
        return;
    }

    try {
        records = JSON.parse(records);
    } catch {
        api.log("Unable to parse, deleting: " + records);
        return api.run("aws_sqs.delete_message", { ReceiptHandle: deleteHandle, QueueUrl: params.queueUrl });
    }


    // put events to Kinesis firehose stream https://aws.amazon.com/kinesis/data-firehose/
    // you can customize the consumer of Kinesis firehose to be S3
    let result = api.run("aws_kinesis_firehose.put_record_batch",
        {
            DeliveryStreamName: params.deliveryStreamName,
            Records: records
        });
	
    console.log("delete message handle = " + deleteHandle)
    if (result[0].FailedPutCount == 0) {
        api.log(api.run("aws_sqs.delete_message", { ReceiptHandle: deleteHandle, QueueUrl: params.queueUrl }))
    }
    return result
}

/*
 * For sample code and reference material, visit
 * https://api-composition.transposit.com/references/js-operations
 */
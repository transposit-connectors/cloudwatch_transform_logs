(params) => {
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
        return api.run("this.delete_message", { handle: deleteHandle });
    }


    let result = api.run("aws_kinesis_firehose.put_record_batch",
        {
            DeliveryStreamName: params.deliveryStreamName,
            Records: records
        });

    console.log(deleteHandle)
    if (result[0].FailedPutCount == 0) {
        api.log(api.run("this.delete_message", { handle: deleteHandle }))
    }
    return result
}

/*
 * For sample code and reference material, visit
 * https://api-composition.transposit.com/references/js-operations
 */
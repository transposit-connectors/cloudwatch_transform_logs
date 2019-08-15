(params) => {
  const CryptoJS = require("crypto-js");
  const _ = require("underscore.js");
  const moment = require("moment-timezone-with-data.js");
  const startTime = moment()
    .tz("America/Los_Angeles")
    .startOf("day")
    .subtract(parseInt(params.daysAgo), "days");
  const endTime = startTime.clone().add(params.daysAgo, "days");

  // return all events based on your filterPattern
  // Note: if you have too many events, the operation might time out.
  // To solve this, you can break it up to multiple calls with a shorter time interval
  let logObjects = api.run("this.filter_events", {
    logGroupName: params.logGroupName,
    filterPattern: params.filterPattern,
    startTime: startTime.valueOf(),
    endTime: endTime.valueOf()
  });


  // CUSTOM LOGIC: custom logic for transforming events. Please modify this section so the logic works for your log format
  logObjects = _.compact(
    logObjects.map(e => {
      try {
        return JSON.parse(e.message.split(" - ")[1]);
      } catch (error) {
        console.log(error.message);
      }
    })
  );
  // END

  // put log objects to sqs in batch, and we can later take them from the queue for processing
  for (let i = 0; i < logObjects.length; i += params.batchSize) {
    let data = logObjects.slice(i, i + params.batchSize);
    let records = [];
    data.forEach(d => {
      let parsed = CryptoJS.enc.Utf8.parse(JSON.stringify(d) + "\n");
      records.push({
        Data: CryptoJS.enc.Base64.stringify(parsed),
        ExplicitHashKey: Math.floor(Math.random() * 1000).toString(),
        PartitionKey: Math.floor(Math.random() * 1000).toString()
      });
    });
    console.log(insert_to_kinesis(records));
  }

  function insert_to_kinesis(records) {
    return api.run("aws_kinesis_firehose.put_record_batch", {
      $body: {
        DeliveryStreamName: params.deliveryStreamName,
        Records: records
      }
    });
  }
}

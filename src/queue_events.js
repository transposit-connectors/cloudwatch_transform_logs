(params) => {

    const _ = require('underscore.js');
    const moment = require('moment-timezone-with-data.js');
    const startTime = moment().tz('America/Los_Angeles').startOf('day').subtract(parseInt(params.daysAgo), 'days');
    const endTime = startTime.clone().add(params.daysAgo, 'days');

    // return all events based on your filterPattern
    // Note: if you have too many events, the operation might time out, and you can break it up to multiple calls
    let logObjects = api.run('this.filter_events', {
        filterPattern: params.filterPattern,
        startTime: startTime.valueOf(),
        endTime: endTime.valueOf()
    })


    // custom logic for transforming events. Please modify this section so the logic works for your log format
    logObjects = _.compact(logObjects.map(e => {
        try {
            return JSON.parse(e.message.split(" - ")[1]);
        } catch (error) {
            console.log(error.message)
            return null
        }
    }));

    // put log objects to sqs in batch, and we can later take them from the queue for processing
    for (let i = 0; i < logObjects.length; i += params.batchSize) {
        console.log(put_queue(logObjects.slice(i, i + params.batchSize)));
    }


    function put_queue(records) {
        return api.run('aws_sqs.send_message', {
            MessageBody: JSON.stringify(records),
            QueueUrl: params.queueUrl
        })
    }

}

/*
 * For sample code and reference material, visit
 * https://docs.transposit.com/references/js-operations
 */
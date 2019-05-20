(params) => {
    const moment = require('moment-timezone-with-data.js');
    const startTime = moment().tz('America/Los_Angeles').startOf('day').subtract(parseInt(params.daysAgo), 'days');
    const endTime = startTime.clone().add(params.daysAgo, 'days');

    // return all events based on your filterPattern
    // Note: if you have too many events, the operation might time out, and you can break it up to multiple calls
    const events = api.run('this.filter_events', {
        filterPattern: params.filterPattern,
        startTime: startTime.valueOf(),
        endTime: endTime.valueOf()
    })


    // custom logic for transforming events. Please modify this section so the logic works for your log format
    return events.map(e => {
        try {
            return JSON.parse(e.message.split(" - ")[1]);
        } catch (error) {
            console.log(error);
        }
    })
}

/*
 * For sample code and reference material, visit
 * https://docs.transposit.com/references/js-operations
 */
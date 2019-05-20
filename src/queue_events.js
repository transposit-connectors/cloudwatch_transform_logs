(params) => {
  const moment = require('moment-timezone-with-data.js');
  const startTime = moment().tz('America/Los_Angeles').startOf('day').subtract(parseInt(params.daysAgo), 'days');
  const endTime = startTime.clone().add(params.daysAgo, 'days');
  
  const events = api.run('this.filter_events', {
    filterPattern: params.filterPattern,
    startTime: startTime.valueOf(),
    endTime: endTime.valueOf()
  })
}

/*
 * For sample code and reference material, visit
 * https://docs.transposit.com/references/js-operations
 */
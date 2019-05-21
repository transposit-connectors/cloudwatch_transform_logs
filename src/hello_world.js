(params) => {
  let parameters = {logGroupName: params.logGroupName,
               filterPattern: params.filterPattern,
               startTime: params.startTime,
               endTime: params.endTime}
  return api.run("aws_cloudwatch_logs.filter_log_events", parameters)
 
}

/*
 * For sample code and reference material, visit
 * https://api-composition.transposit.com/references/js-operations
 */
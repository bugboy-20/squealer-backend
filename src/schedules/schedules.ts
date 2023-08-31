import cron from 'node-cron';
//import {hello} from './helloSchedule';
import {userQuotaReset} from './userQuotaSchedule';
/*
 # ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * *

Allowed values
field 	value
second 	0-59
minute 	0-59
hour 	0-23
day of month 	1-31
month 	1-12 (or names)
day of week 	0-7 (or names, 0 or 7 are sunday)
*/

let schedule : [string, () => void][] = [
    userQuotaReset
].flat()
//    hello  <-- just an example
/*
export default (polkaAPP : {[k: string]: any} , waitForEvent : string) => {
    polkaAPP.cron = (cronExpression : string, fn : () => ()) => {
        if (waitForEvent) {
            polkaAPP.on(waitForEvent, () => {
                cron.schedule(cronExpression, fn);
            });
        }
        else {
            cron.schedule(cronExpression, fn);
        }
    };


};*/

export default () => {
    schedule.forEach(s => {
        let [cex,fn] = s;
        cron.schedule(cex, fn, {
            timezone: "Europe/Rome"
        })
    })

}

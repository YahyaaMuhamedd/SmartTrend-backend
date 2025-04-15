



export default function convertToTime(time) {
   let year,
         month,
         day,
         hour,
         minute,
         second;

   second = Math.floor(time / 1000);
   minute = Math.floor(second / 60);
   second = second % 60;
   hour = Math.floor(minute / 60);
   minute = minute % 60;
   day = Math.floor(hour / 24);
   hour = hour % 24;
   month = Math.floor(day / 30);
   day = day % 30;
   year = Math.floor(month / 12);
   month = month % 12;

   return { year, month, day, hour, minute, second };
}






// convert from date to millisecond
// const dateString = "2025-01-24T07:24:54.154Z";
// const milliseconds = new Date(dateString).getTime();
// console.log(milliseconds);
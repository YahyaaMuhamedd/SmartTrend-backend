
export const generate_Date = ()=>{
   //! Get the current date and time
   const currentDate = new Date();
   //! Set the time zone offset for Egypt (UTC+2:00)
   const timeZoneOffset = 1 ; // in minutes
   // const timeZoneOffset = 60 / 60; // in minutes
   //! Apply the time zone offset
   currentDate.setMinutes(currentDate.getMinutes() + timeZoneOffset);
   //! Get the options for formatting the date and time
   const options = {
   year: 'numeric',
   month: '2-digit',
   day: '2-digit',
   hour: '2-digit',
   minute: '2-digit',
   second: '2-digit',
   hour12: true,
   timeZone: 'Africa/Cairo' // Specify the time zone explicitly
   };
   //! Format the date and time as a string
   const dateTime = currentDate.toLocaleString('en-EG', options);
   return dateTime ;
}
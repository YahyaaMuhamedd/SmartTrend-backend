




export function getDateRange(startDateInput, endDateInput) {
  let startDate, endDate;

  const formatDate = (dateObj, isStart) => {
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const time = isStart ? 'T00:00:00.000Z' : 'T23:59:59.999Z';
    return new Date(`${year}-${month}-${day}${time}`).getTime();
  };

  if (startDateInput && endDateInput) {
    // ✅ بعت تاريخين: من تاريخ إلى تاريخ
    const start = new Date(startDateInput);
    const end = new Date(endDateInput);
    startDate = formatDate(start, true);
    endDate = formatDate(end, false);

  } else if (startDateInput && !endDateInput) {
    // ✅ بعت تاريخ بداية بس: من اليوم ده لحد النهاردة
    const start = new Date(startDateInput);
    const today = new Date();
    startDate = formatDate(start, true);
    endDate = formatDate(today, false);

  } else {
    // ✅ مفيش تواريخ: هات تاريخ النهاردة
    const today = new Date();
    startDate = formatDate(today, true);
    endDate = formatDate(today, false);
  }

  return { start: startDate, end: endDate };
}



// دى بترجع  
// 1- بترجع من اول تاريخ بداية اليوم الى تانى تاريخ نهاية اليوم لو بعت تاريخين 
// 2- لو بعت تاريخ  واحد  معين بترجع من اول التاريخ دة اول اليوم الى تاريخ النهاردة اخر اليوم 
// 3- لو مبعتش تواريخ خالص هترجع اليوم الحالى من اولة لاخرة 







export function getTodayRange(inputDate){
  const date = inputDate ? new Date(inputDate) : new Date();

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0') ; // خد بالك: getMonth بيرجع من 0 إلى 11، علشان كدا لازم تزود 1 فعلاً
  const year = date.getFullYear();


  //  Start Day: 00:00:00
  const start = new Date(`${year}-${month}-${day}T00:00:00.000Z`).getTime() ;  // Convert start to millisecond

  //  End Day: 23:59:59
  const end = new Date(`${year}-${month}-${day}T23:59:59.999Z`).getTime() ;    // Convert end to millisecond

  return { start, end } ;
} ;

// هى فانكشن بترجع عدد الملى ثانية من بداية اليوم الى نهاية اليوم ولو عايو تحدد يوم معين ابعت لها تاريخ معين وهى هتجي بالبيانات الخاصة باليوم دة من اولة الى اخرة





export function getTodayRange(){
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0') ; // خد بالك: getMonth بيرجع من 0 إلى 11، علشان كدا لازم تزود 1 فعلاً
  const year = date.getFullYear();


  //  Start Day: 00:00:00
  const start = new Date(`${year}-${month}-${day}T00:00:00.000Z`).getTime() ;  // Convert start to millisecond

  //  End Day: 23:59:59
  const end = new Date(`${year}-${month}-${day}T23:59:59.999Z`).getTime() ;    // Convert end to millisecond

  return { start, end } ;
} ;
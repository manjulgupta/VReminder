function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function generateSchedule(childDob) {
  console.log("Generating schedule for DOB:", childDob);
  
  return [
    { vaccine_id: 1, dose: 1, days: 0 },     // BCG
    { vaccine_id: 2, dose: 1, days: 1 },    // Pentavalent
    { vaccine_id: 2, dose: 1, days: 2 },
    { vaccine_id: 2, dose: 1, days: 3 },
    { vaccine_id: 2, dose: 2, days: 4 },
    { vaccine_id: 2, dose: 3, days: 5 },
    { vaccine_id: 4, dose: 1, days: 7 }    // Measles
  ].map(v => ({
    vaccine_id: v.vaccine_id,
    dose_number: v.dose,
    scheduled_date: addDays(childDob, v.days)
  }));
}

module.exports = generateSchedule;

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function generateSchedule(childDob) {
  console.log("Generating schedule for DOB:", childDob);
  // console.log("phone no: ",process.env.FAST2SMS_PHONE_NUMBER_ID)
  
  return [
    // ===== BIRTH =====
  { vaccine_id: 1, dose: 1, days: 0 },     // BCG
  { vaccine_id: 2, dose: 1, days: 0 },     // OPV
  { vaccine_id: 3, dose: 1, days: 0 },     // Hep B-1

  // ===== 6 WEEKS (42 days) =====
  { vaccine_id: 4, dose: 1, days: 42 },    // DTwP/DTaP-1
  { vaccine_id: 5, dose: 1, days: 42 },    // IPV-1
  { vaccine_id: 6, dose: 1, days: 42 },    // Hib-1
  { vaccine_id: 3, dose: 2, days: 42 },    // Hep B-2
  { vaccine_id: 7, dose: 1, days: 42 },    // PCV-1
  { vaccine_id: 8, dose: 1, days: 42 },    // Rotavirus-1

  // ===== 10 WEEKS (70 days) =====
  { vaccine_id: 4, dose: 2, days: 70 },    // DTwP/DTaP-2
  { vaccine_id: 5, dose: 2, days: 70 },    // IPV-2
  { vaccine_id: 6, dose: 2, days: 70 },    // Hib-2
  { vaccine_id: 3, dose: 3, days: 70 },    // Hep B-3
  { vaccine_id: 7, dose: 2, days: 70 },    // PCV-2
  { vaccine_id: 8, dose: 2, days: 70 },    // Rotavirus-2

  // ===== 14 WEEKS (98 days) =====
  { vaccine_id: 4, dose: 3, days: 98 },    // DTwP/DTaP-3
  { vaccine_id: 5, dose: 3, days: 98 },    // IPV-3
  { vaccine_id: 6, dose: 3, days: 98 },    // Hib-3
  { vaccine_id: 3, dose: 4, days: 98 },    // Hep B-4
  { vaccine_id: 7, dose: 3, days: 98 },    // PCV-3
  { vaccine_id: 8, dose: 3, days: 98 },    // Rotavirus-3

  // ===== 6–9 MONTHS =====
  { vaccine_id: 9, dose: 1, days: 180 },   // Influenza-I
  { vaccine_id: 9, dose: 2, days: 210 },
  { vaccine_id: 9, dose: 3, days: 548 },
  { vaccine_id: 9, dose: 4, days: 913 },
  { vaccine_id: 9, dose: 5, days: 1278 },
  { vaccine_id: 9, dose: 6, days: 1643},

  { vaccine_id: 10, dose: 1, days: 240 },  // Typhoid Conjugate

  // ===== 9 MONTHS =====
  { vaccine_id: 11, dose: 1, days: 270 },  // MMR-1
  { vaccine_id: 12, dose: 1, days: 270 },  // Meningococcal

  // ===== 12 MONTHS =====
  { vaccine_id: 13, dose: 1, days: 365 },  // Hep A-1
  { vaccine_id: 14, dose: 1, days: 365 },  // JE-1

  // ===== 13 MONTHS =====
  { vaccine_id: 14, dose: 2, days: 395 },  // JE-2

  // ===== 15 MONTHS =====
  { vaccine_id: 11, dose: 2, days: 450 },  // MMR-2
  { vaccine_id: 15, dose: 1, days: 450 },  // Varicella-1
  
  // ===== 16–18 MONTHS =====
  { vaccine_id: 4, dose: 4, days: 510 },   // DTwP/DTaP-B1
  { vaccine_id: 6, dose: 4, days: 510 },   // Hib-B1
  { vaccine_id: 5, dose: 4, days: 510 },   // IPV-B1
  { vaccine_id: 7, dose: 4, days: 510 },   // PCV Booster

  // ===== 18–19 MONTHS =====
  { vaccine_id: 13, dose: 2, days: 540 },  // Hep A-2
  { vaccine_id: 15, dose: 2, days: 540 },  // Varicella-2
  { vaccine_id: 7, dose: 5, days: 540 },   // PCV Booster

  // ===== 4–6 YEARS =====
  { vaccine_id: 4, dose: 5, days: 1460 },  // DTwP/DTaP-B2
  { vaccine_id: 5, dose: 5, days: 1460 },  // IPV-B2
  { vaccine_id: 11, dose: 3, days: 1460 }, // MMR-3

  // ===== 10–12 YEARS =====
  { vaccine_id: 7, dose: 6, days: 3650 },   // PCV Booster
  { vaccine_id: 16, dose: 1, days: 3650 }, // Tdap
  { vaccine_id: 17, dose: 1, days: 3650 }  // HPV
  ].map(v => ({
    vaccine_id: v.vaccine_id,
    dose_number: v.dose,
    scheduled_date: addDays(childDob, v.days)
  }));
}

module.exports = generateSchedule;

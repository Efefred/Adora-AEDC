function pad(value) {
  return String(value).padStart(2, '0');
}

function getTomorrowOutageDateTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const day = pad(tomorrow.getDate());
  const month = pad(tomorrow.getMonth() + 1);
  const year = tomorrow.getFullYear();

  return {
    startDate: `${day}/${month}/${year}`,
    startHour: '01',
    startMinute: '00',
    endDate: `${day}/${month}/${year}`,
    endHour: '02',
    endMinute: '00',
    expectedDuration: '60 Minutes'
  };
}

module.exports = { getTomorrowOutageDateTime };
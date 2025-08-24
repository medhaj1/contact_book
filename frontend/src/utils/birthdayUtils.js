/**
 * Birthday utility functions
 */

export function isBirthdayToday(birthday) {
  if (!birthday) return false;
  try {
    const today = new Date();
    const bday = new Date(birthday);
    if (isNaN(bday.getTime())) return false;
    return bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth();
  } catch {
    return false;
  }
}

export function isBirthdayInNext7DaysExcludingToday(birthday) {
  if (!birthday) return false;
  try {
    const today = new Date();
    // Set time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const bday = new Date(birthday);
    if (isNaN(bday.getTime())) return false;
    
    // Set birthday to current year and start of day
    bday.setFullYear(today.getFullYear());
    bday.setHours(0, 0, 0, 0);

    // Include tomorrow (>=) but exclude the 7th day (<)
    return bday >= tomorrow && bday < nextWeek;
  } catch {
    return false;
  }
}

export function prettyDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? dateStr
      : date.toLocaleDateString(undefined, { day: "numeric", month: "long" });
  } catch {
    return dateStr;
  }
}

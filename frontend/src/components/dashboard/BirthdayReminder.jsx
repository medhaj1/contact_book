import React from "react";

const BirthdayReminder = ({ contacts }) => {
  function isBirthdayToday(birthday) {
    if (!birthday) return false;
    const today = new Date();
    const bday = new Date(birthday);
    if (isNaN(bday.getTime())) return false;
    return bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth();
  }

  function isBirthdayInNext7DaysExcludingToday(birthday) {
    if (!birthday) return false;
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1); // start from tomorrow
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const bday = new Date(birthday);
      if (isNaN(bday.getTime())) return false;
      bday.setFullYear(today.getFullYear());

      return bday >= tomorrow && bday <= nextWeek;
    } catch {
      return false;
    }
  }

  const todaysBirthdays = contacts.filter(c => isBirthdayToday(c.birthday));
  const upcomingBirthdays = contacts.filter(c => isBirthdayInNext7DaysExcludingToday(c.birthday));

  function prettyDate(dateStr) {
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime())
        ? dateStr
        : date.toLocaleDateString(undefined, { day: "numeric", month: "long" });
    } catch {
      return dateStr;
    }
  }

  const BirthdaySection = ({ title, people }) => (
    people.length > 0 && (
      <div className="relative mb-6 p-6 rounded-2xl shadow-lg overflow-hidden bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 dark:from-pink-700 dark:via-purple-700 dark:to-indigo-800">
        <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-2 relative z-10">
          {title}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
          {people.map(c => (
            <div
              key={c.contact_id}
              className="flex items-center gap-4 bg-white/30 dark:bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-md border border-white/20 hover:scale-[1.02] transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex justify-center items-center font-bold text-white overflow-hidden shadow">
                {c.photo_url
                  ? <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                  : c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-white text-lg">{c.name}</div>
                <div className="text-sm text-white/90">{c.email}</div>
                <div className="text-xs text-yellow-200">🎂 {prettyDate(c.birthday)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-70 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      </div>
    )
  );

  return (
    <>
      <BirthdaySection title="🎉 Birthdays Today" people={todaysBirthdays} />
      <BirthdaySection title="🎂 Upcoming Birthdays" people={upcomingBirthdays} />
    </>
  );
};

export default BirthdayReminder;


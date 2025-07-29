import React from "react";

const BirthdayReminder = ({ contacts }) => {
  function isBirthdayInNext7Days(birthday) {
    if (!birthday) return false;
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const bday = new Date(birthday);
    bday.setFullYear(today.getFullYear());

    return bday >= today && bday <= nextWeek;
  }

  const upcomingBirthdays = contacts.filter((contact) =>
    isBirthdayInNext7Days(contact.birthday)
  );

  return (
    <div className="bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 p-5 rounded-2xl shadow-md mb-6">
      <h3 className="text-xl font-bold mb-3 text-blue-900 flex items-center gap-2">
        🎂 Upcoming Birthdays
      </h3>
      {upcomingBirthdays.length > 0 ? (
        <ul className="space-y-2">
          {upcomingBirthdays.map((c) => (
            <li
              key={c.contact_id}
              className="bg-white p-3 rounded-lg shadow-sm border border-blue-200 text-blue-800 flex justify-between"
            >
              <span className="font-medium">{c.name}</span>
              <span className="text-sm">
                {new Date(c.birthday).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-blue-700">No birthdays in the next 7 days</p>
      )}
    </div>
  );
};

export default BirthdayReminder;




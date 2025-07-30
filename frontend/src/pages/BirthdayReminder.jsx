import React from "react";

const BirthdayReminder = ({ contacts }) => {
  function isBirthdayInNext7Days(birthday) {
    if (!birthday) return false;
    
    try {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      // Parse the birthday date (database stores as YYYY-MM-DD)
      const bday = new Date(birthday);
      
      // Check if the date is valid
      if (isNaN(bday.getTime())) {
        console.warn("Invalid birthday date:", birthday);
        return false;
      }
      
      // Set the year to current year for comparison
      bday.setFullYear(today.getFullYear());

      return bday >= today && bday <= nextWeek;
    } catch (error) {
      console.error("Error parsing birthday:", birthday, error);
      return false;
    }
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
                {(() => {
                  try {
                    const date = new Date(c.birthday);
                    if (isNaN(date.getTime())) {
                      return c.birthday; // Return raw value if parsing fails
                    }
                    return date.toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short"
                    });
                  } catch (error) {
                    console.error("Error formatting birthday:", c.birthday, error);
                    return c.birthday;
                  }
                })()}
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




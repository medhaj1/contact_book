import React from 'react';

const TodaysBirthdaysCard = ({ birthdays }) => {
  if (!birthdays || birthdays.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col gap-2">
      <div className="font-semibold text-amber-700 flex items-center gap-1">
        🎂 Birthday{birthdays.length > 1 ? "s" : ""} Today!
      </div>
      {birthdays.map((contact) => (
        <div key={contact.contact_id} className="flex items-center gap-3 text-amber-700">
          <span className="font-bold">{contact.name}</span>
          <span className="text-xs">(Today)</span>
          <span className="text-slate-500 text-sm">{contact.email}</span>
        </div>
      ))}
    </div>
  );
};

export default TodaysBirthdaysCard;

import React, { useState } from "react";
import { isBirthdayToday, isBirthdayInNext7DaysExcludingToday, prettyDate } from "../../utils/birthdayUtils";

const BirthdayReminder = ({ contacts, setSelectedContact, sendWishMessage, setActiveTab }) => {
  const todaysBirthdays = contacts.filter(c => isBirthdayToday(c.birthday));
  const upcomingBirthdays = contacts.filter(c => isBirthdayInNext7DaysExcludingToday(c.birthday));

  const [wishedIds, setWishedIds] = useState(new Set());

  const handleWish = async (contact) => {
    if (wishedIds.has(contact.contact_id)) return;
    try {
      setSelectedContact(contact);
      setActiveTab("chat");
      await sendWishMessage(contact);
      setWishedIds(new Set(wishedIds).add(contact.contact_id));
    } catch (error) {
      console.error("Failed to send birthday wish:", error);
    }
  };

  const BirthdaySection = ({ title, people, gradient, showWish }) => (
    people.length > 0 && (
      <div
        className={`relative mb-4 px-6 py-3 rounded-2xl shadow-lg overflow-hidden ${gradient}`}
        style={{ maxWidth: "100%" }}
      >
        <h3 className="text-lg font-extrabold text-white mb-1 flex items-center gap-3 relative z-10">
          {title}
        </h3>
        <div
          className="flex flex-wrap gap-3 relative z-10"
          style={{ alignItems: "center", paddingBottom: 4 }}
        >
          {people.map(c => {
            const isWished = wishedIds.has(c.contact_id);
            return (
              <div
                key={c.contact_id}
                className="flex items-center gap-3 bg-white/70 dark:bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl shadow border border-white/30 cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label={`Birthday reminder for ${c.name}`}
                style={{
                  flex: "0 0 calc(33.333% - 16px)",
                  maxWidth: "calc(33.333% - 16px)",
                  height: 56,
                  minHeight: 56,
                }}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex justify-center items-center font-bold text-white overflow-hidden shadow text-lg flex-shrink-0">
                  {c.photo_url
                    ? <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover rounded-full" />
                    : c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col flex-1 min-w-0 px-2">
                  <div
                    className="font-semibold text-gray-900 dark:text-white text-md truncate select-text"
                    title={c.name}
                  >
                    {c.name}
                  </div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 select-text">
                    🎂 {prettyDate(c.birthday)}
                  </div>
                </div>
                {showWish && (
                  <button
                    onClick={() => handleWish(c)}
                    disabled={isWished}
                    className={`text-xs px-2 py-1 rounded transition-colors font-semibold flex-shrink-0 ${
                      isWished ? "bg-gray-400 text-gray-300 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600 text-white"
                    }`}
                    title={isWished ? "Wish sent" : `Send birthday wish to ${c.name}`}
                    aria-label={`Send birthday wish to ${c.name}`}
                  >
                    {isWished ? "Wished" : "Wish"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
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
      <BirthdaySection
        title="🎉 Birthdays Today"
        people={todaysBirthdays}
        gradient="bg-gradient-to-r from-indigo-700 via-violet-800 to-blue-900 dark:from-blue-900 dark:via-violet-900 dark:to-black"
        showWish={true}
      />
      <BirthdaySection
        title="🎂 Upcoming Birthdays"
        people={upcomingBirthdays}
        gradient="bg-gradient-to-r from-indigo-200 via-violet-200 to-blue-200 dark:from-blue-400 dark:via-violet-400 dark:to-indigo-500"
        showWish={false}
      />
    </>
  );
};

export default BirthdayReminder;








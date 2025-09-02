import React from "react";
import { isBirthdayToday, isBirthdayInNext7DaysExcludingToday, prettyDate } from "../../utils/birthdayUtils";
// Simple toast implementation
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '32px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = '#22c55e';
  toast.style.color = 'white';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '8px';
  toast.style.fontWeight = 'bold';
  toast.style.zIndex = '9999';
  toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 400);
  }, 1800);
}

const BirthdayReminder = ({ contacts, onBirthdayWish }) => {
  const todaysBirthdays = contacts.filter(c => isBirthdayToday(c.birthday));
  const upcomingBirthdays = contacts.filter(c => isBirthdayInNext7DaysExcludingToday(c.birthday));




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
            // Only show button if user is registered (contact_user_id is a non-empty string)
            const isRegistered = typeof c.contact_user_id === "string" && c.contact_user_id.trim().length > 0;
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
                {showWish && isRegistered ? (
                  <button
                    onClick={async () => {
                      if (onBirthdayWish) {
                        await onBirthdayWish(c);
                        showToast(`Wish has been sent to ${c.name}`);
                      }
                    }}
                    className="text-xs px-2 py-1 rounded transition-colors font-semibold flex-shrink-0 bg-green-500 hover:bg-green-600 text-white"
                    title={`Send Happy Birthday to ${c.name}`}
                    aria-label={`Send Happy Birthday to ${c.name}`}
                  >
                    Happy Birthday
                  </button>
                ) : null}
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








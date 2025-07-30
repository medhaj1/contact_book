function SettingsTab({ currentUser }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Section 1: Account */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-slate-500 text-md font-semibold uppercase mb-2">Account</h2>

        <div className="divide-y divide-slate-200">
          <button className="w-full text-left py-5 px-2 rounded-lg text-slate-700 hover:bg-blue-50">
            Account Settings
          </button>
          <button className="w-full text-left py-5 px-2 rounded-lg text-slate-700 hover:bg-blue-50">
            Blocked Contacts
          </button>
        </div>
      </div>

      {/* Section 2: Preferences */}
      <div className="px-6 py-4">
        <h2 className="text-slate-500 text-md font-semibold uppercase mb-2">Preferences</h2>

        <div className="divide-y divide-slate-200">
          <button className="w-full text-left py-5 px-2 rounded-lg text-slate-700 hover:bg-blue-50">
            Theme
          </button>
          <button className="w-full text-left py-5 px-2 rounded-lg text-slate-700 hover:bg-blue-50">
            Name Format
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsTab;

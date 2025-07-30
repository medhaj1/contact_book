function SettingsTab() {

  const handlethemeToggle=()=> {
    return(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
        <div className="bg-white p-8 rounded-[16px] w-[400px] max-h-[90vh] overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.15)]">
          <h3 className="text-[1.4rem] font-semibold text-[#334155] mb-6 text-center">theme</h3>
        </div>
      </div>
    )
  }
  const handleNameformat=()=> {}
  const handleAccountSettings=()=> {}
  const handleBlockedContacts=()=> {}


  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Section 1: Account */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-slate-500 text-md font-semibold uppercase mb-2">Account</h2>

        <div className="divide-y divide-slate-200">
          <button className="w-full text-left py-5 px-2 rounded-lg text-slate-700 hover:bg-blue-50"
            onClick={handleAccountSettings}>
            Account Settings
          </button>
          <button className="w-full text-left py-5 px-2 rounded-lg text-slate-700 hover:bg-blue-50"
            onClick={handleBlockedContacts}>
            Blocked Contacts
          </button>
        </div>
      </div>

      {/* Section 2: Preferences */}
      <div className="px-6 py-4">
        <h2 className="text-slate-500 text-md font-semibold uppercase mb-2">Preferences</h2>

        <div className="divide-y divide-slate-200">
          <button className="w-full text-left py-5 px-2 rounded-lg text-slate-700 hover:bg-blue-50"
            onClick={handlethemeToggle}>
            Theme
          </button>
          <button className="w-full text-left py-5 px-2 rounded-lg text-slate-700 hover:bg-blue-50"
          onClick={handleNameformat} >
            Name Format
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsTab;

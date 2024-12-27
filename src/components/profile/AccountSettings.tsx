export default function AccountSettings() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Display Name</label>
          <input type="text" className="form-input mt-1 block w-full" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input type="email" className="form-input mt-1 block w-full" />
        </div>
        <div>
          <button className="text-red-600 hover:text-red-700">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
} 
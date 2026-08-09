import { useState, useEffect } from "react";
import { UserCircle, Save, KeyRound, Trash2 } from "lucide-react";
import * as profileApi from "../../api/profile";
import { extractErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types/types";

export default function Profile() {
  const { userId, logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await profileApi.getProfile(userId);
        setProfile(data);
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setUsername(data.username);
        setEmail(data.email);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setProfileErr("");
    setProfileMsg("");
    setSavingProfile(true);
    try {
      const updated = await profileApi.updateProfile(userId, {
        first_name: firstName,
        last_name: lastName,
        username,
        email,
      });
      setProfile(updated);
      setProfileMsg("Profile updated successfully.");
    } catch (err) {
      setProfileErr(extractErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setPasswordErr("");
    setPasswordMsg("");
    setSavingPassword(true);
    try {
      await profileApi.changePassword(userId, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });
      setPasswordMsg("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPasswordErr(extractErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    if (!confirm("This will permanently delete your account and all data. Continue?")) return;
    setDeleteErr("");
    setDeleting(true);
    try {
      await profileApi.deleteAccount(userId, deletePassword);
      logout();
    } catch (err) {
      setDeleteErr(extractErrorMessage(err));
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="text-center text-slate-400 py-8 text-sm">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
          <UserCircle className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {profile?.first_name} {profile?.last_name}
          </h1>
          <p className="text-sm text-slate-500">@{profile?.username}</p>
        </div>
      </div>

      {/* Profile details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Profile Details</h2>
        <form className="space-y-4" onSubmit={handleProfileSave}>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {profileErr && <p className="text-xs text-rose-600">{profileErr}</p>}
          {profileMsg && <p className="text-xs text-emerald-600">{profileMsg}</p>}

          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Save className="h-4 w-4" />
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Password change */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Change Password</h2>
        <form className="space-y-4" onSubmit={handlePasswordChange}>
          <input
            type="password"
            placeholder="Current password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="New password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            required
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {passwordErr && <p className="text-xs text-rose-600">{passwordErr}</p>}
          {passwordMsg && <p className="text-xs text-emerald-600">{passwordMsg}</p>}

          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <KeyRound className="h-4 w-4" />
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-rose-700 mb-1">Danger Zone</h2>
        <p className="text-xs text-slate-500 mb-4">Deleting your account is permanent and cannot be undone.</p>
        <form className="space-y-3" onSubmit={handleDeleteAccount}>
          <input
            type="password"
            placeholder="Confirm your password"
            required
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            className="w-full border border-rose-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          {deleteErr && <p className="text-xs text-rose-600">{deleteErr}</p>}
          <button
            type="submit"
            disabled={deleting}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
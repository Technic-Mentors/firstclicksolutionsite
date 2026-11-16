import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAdminAuthStore } from '../../store/useAdminAuthStore';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { assetUrl } from '../../utils/media';
import { cn } from '../../utils/cn';
import { getErrorMessage } from '../../utils/errorMessage';

const emptyPasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

/**
 * The admin's own account settings.
 *
 * Two tabs rather than two stacked forms: together they ran past the height of the dialog,
 * so the heading scrolled out of view and the buttons of one form sat next to the fields of
 * the other. Split, each task fits on screen and there is only ever one save button visible.
 *
 * No log out here — it lives in the account menu that opens this dialog. Hiding the way out
 * of the panel inside an "edit profile" form is not where anyone looks for it.
 */
export default function AdminProfileModal({ open, onClose }) {
  const admin = useAdminAuthStore((s) => s.admin);
  const updateProfile = useAdminAuthStore((s) => s.updateProfile);
  const uploadAvatar = useAdminAuthStore((s) => s.uploadAvatar);
  const changePassword = useAdminAuthStore((s) => s.changePassword);

  const fileRef = useRef(null);
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (admin) setProfileForm({ name: admin.name || '', email: admin.email || '' });
  }, [admin]);

  // Reopening should not drop you back into a half-typed password change.
  useEffect(() => {
    if (open) {
      setTab('profile');
      setPasswordForm(emptyPasswordForm);
    }
  }, [open]);

  async function handleAvatarChange(file) {
    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      toast.success('Photo updated.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();

    const name = profileForm.name.trim();
    if (name.length < 2 || name.length > 25) {
      toast.error('Name must be between 2 and 25 characters.');
      return;
    }
    if (!/^[A-Za-z ]+$/.test(name)) {
      toast.error('Name can only contain letters and spaces.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile(profileForm.name, profileForm.email);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Password updated.');
      setPasswordForm(emptyPasswordForm);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} className="max-w-lg">
      {/* The banner is pulled out past the dialog's padding so it runs edge to edge. */}
      <div className="-mx-6 -mt-6 mb-0 h-24 bg-gradient-to-br from-forest-600 to-forest-700" />

      <div className="-mt-11 flex flex-col items-center text-center">
        <div className="relative">
          {admin?.avatar ? (
            <img
              src={assetUrl(admin.avatar)}
              alt=""
              className="h-[88px] w-[88px] rounded-full border-4 border-white object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-4 border-white bg-gold-100 text-2xl font-semibold text-gold-700 shadow-sm">
              {admin?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          )}

          {/* Changing the photo belongs on the photo, not in a separate row below it. */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
            title="Change photo"
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gold-500 text-white shadow transition-colors hover:bg-gold-600 disabled:opacity-60"
          >
            {uploadingAvatar ? <SpinnerIcon /> : <CameraIcon />}
            <span className="sr-only">Change photo</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarChange(file);
              e.target.value = '';
            }}
          />
        </div>

        <h3 className="mt-3 text-lg font-semibold text-charcoal">{admin?.name}</h3>
        <p className="text-sm text-charcoal-light">{admin?.email}</p>
        <span className="mt-2 rounded-full bg-forest-600/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-forest-700">
          Administrator
        </span>
      </div>

      <div className="mt-6 flex gap-1 rounded-lg bg-stone-100 p-1">
        <TabButton active={tab === 'profile'} onClick={() => setTab('profile')}>
          Profile
        </TabButton>
        <TabButton active={tab === 'password'} onClick={() => setTab('password')}>
          Password
        </TabButton>
      </div>

      {tab === 'profile' ? (
        <form onSubmit={handleProfileSubmit} className="mt-5 flex flex-col gap-4">
          <Input
            label="Name"
            value={profileForm.name}
            onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
            maxLength={25}
            required
          />
          <Input
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <div className="mt-1 flex items-center gap-3 border-t border-stone-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button type="submit" variant="gold" loading={savingProfile} className="flex-1">
              Save changes
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="mt-5 flex flex-col gap-4">
          <Input
            label="Current password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
            required
          />
          <div className="flex flex-col gap-1">
            <Input
              label="New password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
              required
            />
            <p className="text-xs text-charcoal-light">At least 8 characters.</p>
          </div>
          <Input
            label="Confirm new password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            required
          />
          <div className="mt-1 flex items-center gap-3 border-t border-stone-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button type="submit" variant="gold" loading={savingPassword} className="flex-1">
              Update password
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-white text-charcoal shadow-sm' : 'text-charcoal-light hover:text-charcoal',
      )}
    >
      {children}
    </button>
  );
}

function CameraIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

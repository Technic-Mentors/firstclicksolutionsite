import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { getErrorMessage } from '../../utils/errorMessage';

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name is too short')
    .max(25, 'Name must be 25 characters or fewer')
    .regex(/^[A-Za-z ]+$/, 'Name can only contain letters and spaces'),
  phone: z
    .string()
    .trim()
    .regex(/^\d{11}$/, 'Enter an 11-digit phone number'),
});

export default function Profile() {
  const customer = useAuthStore((s) => s.customer);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: customer?.name || '', phone: customer?.phone || '' },
  });

  function openEdit() {
    reset({ name: customer?.name || '', phone: customer?.phone || '' });
    setEditing(true);
  }

  async function onSubmit(values) {
    setSaving(true);
    try {
      await updateProfile(values);
      toast.success('Profile updated.');
      setEditing(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update profile.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    useCartStore.getState().resetToGuest();
    useWishlistStore.getState().reset();
    navigate('/');
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="overflow-hidden rounded-xl border border-gold-500/15 bg-white shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300" />

        <div className="flex items-center gap-4 border-b border-stone-100 bg-gradient-to-br from-gold-50 to-white px-6 py-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-xl font-semibold text-white shadow-sm">
            {customer?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-serif text-xl text-charcoal">{customer?.name}</h2>
            <p className="truncate text-sm text-charcoal-light">{customer?.email}</p>
          </div>
        </div>

        <div className="p-6">
          {editing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Full Name" maxLength={25} {...register('name')} error={errors.name?.message} />
              <Input label="Phone" placeholder="07700 900123" maxLength={16} {...register('phone')} error={errors.phone?.message} />
              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={saving}>
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <ProfileField icon={<UserIcon />} label="Name" value={customer?.name} />
              <ProfileField
                icon={<MailIcon />}
                label="Email"
                value={customer?.email}
                badge={
                  !customer?.email_verified_at && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                      Not verified
                    </span>
                  )
                }
              />
              <ProfileField icon={<PhoneIcon />} label="Phone" value={customer?.phone} />

              <div className="flex flex-wrap items-center gap-4 border-t border-stone-100 pt-4">
                <Button size="sm" onClick={openEdit}>
                  Edit Profile
                </Button>
                <Link to="/forgot-password" className="text-sm font-medium text-gold-600 hover:text-gold-700">
                  Change password
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <Button variant="outline" onClick={handleLogout}>
          <LogoutIcon className="h-[17px] w-[17px]" />
          Log Out
        </Button>
      </div>
    </div>
  );
}

function ProfileField({ icon, label, value, badge }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-stone-400">{label}</p>
        <div className="flex items-center gap-2">
          <p className="truncate text-sm text-charcoal">{value}</p>
          {badge}
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.5 2.9.6a2 2 0 0 1 1.8 2Z" />
    </svg>
  );
}

function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

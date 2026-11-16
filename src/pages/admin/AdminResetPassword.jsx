import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword } from '../../api/admin/auth.api';
import AuthShell from '../../components/admin/AuthShell';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { getErrorMessage } from '../../utils/errorMessage';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function AdminResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setSubmitting(true);
    setFailed(null);
    try {
      await resetPassword(token, values.password);
      toast.success('Password updated. Sign in with your new password.');
      navigate('/admin/login', { replace: true });
    } catch (err) {
      // Shown in place rather than as a toast: an expired or already-used link is not a
      // passing notice, it is the state of the page, and the person needs it still on
      // screen while they decide to request a new one.
      setFailed(getErrorMessage(err, 'This reset link is invalid or has expired.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      badge="Password reset"
      title="Set a new password"
      subtitle="Choose a password you have not used on this account before."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Input
            label="New password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <p className="text-xs text-charcoal-light">At least 8 characters.</p>
        </div>

        <Input
          label="Confirm new password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Repeat the password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {failed && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
            <p className="text-xs text-red-700">{failed}</p>
            <Link
              to="/admin/forgot-password"
              className="mt-1 inline-block text-xs font-semibold text-red-700 underline hover:text-red-800"
            >
              Request a new link
            </Link>
          </div>
        )}

        <Button type="submit" variant="gold" size="lg" loading={submitting} className="mt-1 w-full">
          Update password
        </Button>
      </form>

      <Link
        to="/admin/login"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-gold-600 hover:text-gold-700"
      >
        <ArrowLeftIcon />
        Back to sign in
      </Link>
    </AuthShell>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../api/admin/auth.api';
import AuthShell from '../../components/admin/AuthShell';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { getErrorMessage } from '../../utils/errorMessage';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

export default function AdminForgotPassword() {
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState(null);
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
      await requestPasswordReset(values.email);
      setSentTo(values.email);
    } catch (err) {
      setFailed(getErrorMessage(err, 'Could not send the reset link. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (sentTo) {
    return (
      <AuthShell badge="Password reset" title="Check your inbox" subtitle={`If an admin account uses ${sentTo}, a reset link is on its way.`}>
        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-charcoal-light">
            The link is valid for one hour and can be used once. If nothing arrives, check the
            spam folder before asking for another.
          </p>
        </div>
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

  return (
    <AuthShell
      badge="Password reset"
      title="Forgot your password?"
      subtitle="Enter your admin email and we'll send you a link to set a new one."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-4">
        <Input
          label="Email address"
          type="email"
          required
          autoComplete="username"
          placeholder="you@firstclicksolutions.co.uk"
          error={errors.email?.message}
          {...register('email')}
        />

        {failed && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{failed}</p>
        )}

        <Button type="submit" variant="gold" size="lg" loading={submitting} className="mt-1 w-full">
          Send reset link
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

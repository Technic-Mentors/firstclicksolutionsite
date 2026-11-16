import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAdminAuthStore } from '../../store/useAdminAuthStore';
import { setSessionPersistence } from '../../api/tokenStore';
import AuthShell from '../../components/admin/AuthShell';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { getErrorMessage } from '../../utils/errorMessage';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function AdminLogin() {
  const { login, admin, status, fetchMe } = useAdminAuthStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(true);

  useEffect(() => {
    if (status === 'idle') fetchMe();
  }, [status, fetchMe]);

  useEffect(() => {
    if (status === 'ready' && admin) navigate('/admin', { replace: true });
  }, [status, admin, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      // Decided before the request, because the tokens that come back are written straight
      // away — set after, and the first session would land in the wrong store.
      setSessionPersistence(staySignedIn);
      await login(values.email, values.password);
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setSubmitting(false);
    }
  }

  if (status !== 'ready' || admin) {
    return (
      <div className="flex h-screen items-center justify-center bg-forest-700">
        <Spinner light />
      </div>
    );
  }

  return (
    <AuthShell
      badge="Store admin"
      title="Welcome back"
      subtitle="Sign in to manage your store."
      footer={
        <p className="mt-5 flex items-start gap-1.5 text-[11px] leading-relaxed text-charcoal-light">
          <ShieldIcon />
          Admin access only. Activity on this page is logged.
        </p>
      }
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

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-charcoal-light">
              Password
              <span className="ml-0.5 text-red-500" aria-hidden="true">
                *
              </span>
            </span>
            <Link to="/admin/forgot-password" className="text-xs font-medium text-gold-600 hover:text-gold-700">
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            required
            aria-label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-charcoal-light">
          <input
            type="checkbox"
            checked={staySignedIn}
            onChange={(e) => setStaySignedIn(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300"
          />
          Keep me signed in on this device
        </label>

        <Button type="submit" variant="gold" size="lg" loading={submitting} className="mt-1 w-full">
          Sign in
          <ArrowRightIcon />
        </Button>
      </form>
    </AuthShell>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinejoin="round" className="mt-0.5 shrink-0">
      <path d="M12 3l8 3v6c0 4.5-3.2 8.2-8 9-4.8-.8-8-4.5-8-9V6l8-3Z" />
    </svg>
  );
}

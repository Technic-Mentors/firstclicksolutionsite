import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { loginSchema } from '../validation/auth.schema';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { getErrorMessage } from '../utils/errorMessage';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values) {
    setLoading(true);
    try {
      await login(values.email, values.password);
      await useCartStore.getState().mergeGuestCartIntoServer();
      navigate(location.state?.from || '/account');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="First Click Solutions" className="mx-auto h-20 w-auto" />
        <h1 className="mt-4 font-serif text-2xl text-charcoal">Welcome Back</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-gold-600 hover:text-gold-700">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading} className="w-full">
          Log In
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-charcoal-light">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-gold-600 hover:text-gold-700">
          Register
        </Link>
      </p>
    </div>
  );
}

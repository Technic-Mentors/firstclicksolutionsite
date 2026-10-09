import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { registerSchema } from '../validation/auth.schema';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { getErrorMessage } from '../utils/errorMessage';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const register_ = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values) {
    setLoading(true);
    try {
      await register_(values);
      await useCartStore.getState().mergeGuestCartIntoServer();
      toast.success('Account created! Check your email to verify.');
      navigate(location.state?.from || '/account');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="First Click Solutions" className="mx-auto h-20 w-auto" />
        <h1 className="mt-4 font-serif text-2xl text-charcoal">Create an Account</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" maxLength={25} {...register('name')} error={errors.name?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Phone" placeholder="07700 900123" maxLength={16} {...register('phone')} error={errors.phone?.message} />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
        <Button type="submit" loading={loading} className="w-full">
          Register
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-charcoal-light">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-gold-600 hover:text-gold-700">
          Log In
        </Link>
      </p>
    </div>
  );
}

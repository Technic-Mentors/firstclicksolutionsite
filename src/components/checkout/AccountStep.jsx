import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { createAddress } from '../../api/addresses.api';
import { loginSchema, checkoutRegisterSchema } from '../../validation/auth.schema';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { getErrorMessage } from '../../utils/errorMessage';
import { cn } from '../../utils/cn';

export default function AccountStep({ onAuthenticated }) {
  const [tab, setTab] = useState('register');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const registerCustomer = useAuthStore((s) => s.register);

  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm({ resolver: zodResolver(checkoutRegisterSchema) });

  async function afterAuthSuccess(successMessage) {
    try {
      await useCartStore.getState().mergeGuestCartIntoServer();
    } catch {
      // The account is already created/logged in; a cart-merge hiccup shouldn't block checkout.
    }
    // Only now — after login/register, any address save, and the cart merge have all
    // settled — is it safe to (re)fetch the address list; fetching any earlier can race
    // ahead of a just-created default address and come back empty.
    onAuthenticated?.();
    toast.success(successMessage);
  }

  async function onLogin(values) {
    setLoading(true);
    try {
      await login(values.email, values.password);
      await afterAuthSuccess('Logged in successfully.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed.'));
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(values) {
    setLoading(true);
    try {
      const { name, email, phone, password } = values;
      await registerCustomer({ name, email, phone, password });
      try {
        await createAddress({
          fullName: values.name,
          phone: values.phone,
          addressLine1: values.addressLine1,
          city: values.city,
          isDefault: true,
        });
      } catch {
        // Account creation already succeeded — a saved-address hiccup shouldn't block checkout;
        // they can still add one manually in the delivery step.
      }
      await afterAuthSuccess('Account created! Check your email to verify.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6">
      <div className="mb-1 flex items-center gap-2">
        <motion.span
          initial={{ scale: 0.85, opacity: 0.6 }}
          animate={{ scale: [0.85, 1.05, 0.85], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-600"
        >
          <LockIcon />
        </motion.span>
        <h2 className="font-medium text-charcoal">Your Account</h2>
      </div>
      <p className="mb-4 text-sm text-charcoal-light">
        Please log in or create an account so you can checkout and pay.
      </p>

      <div className="mb-5 inline-flex rounded-full border border-stone-200 bg-stone-50 p-1">
        <button
          type="button"
          onClick={() => setTab('register')}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            tab === 'register' ? 'bg-white text-gold-700 shadow-sm' : 'text-charcoal-light hover:text-charcoal',
          )}
        >
          Create an account
        </button>
        <button
          type="button"
          onClick={() => setTab('login')}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            tab === 'login' ? 'bg-white text-gold-700 shadow-sm' : 'text-charcoal-light hover:text-charcoal',
          )}
        >
          I have an account
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === 'register' ? (
          <motion.form
            key="register"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            onSubmit={registerForm.handleSubmit(onRegister)}
            className="space-y-3"
          >
            <Input
              label="Full Name"
              maxLength={25}
              {...registerForm.register('name')}
              error={registerForm.formState.errors.name?.message}
            />
            <Input
              label="Email"
              type="email"
              {...registerForm.register('email')}
              error={registerForm.formState.errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              {...registerForm.register('password')}
              error={registerForm.formState.errors.password?.message}
            />
            <Input
              label="Confirm Password"
              type="password"
              {...registerForm.register('confirmPassword')}
              error={registerForm.formState.errors.confirmPassword?.message}
            />
            <Input
              label="Phone"
              placeholder="07700 900123"
              maxLength={16}
              {...registerForm.register('phone')}
              error={registerForm.formState.errors.phone?.message}
            />
            <Input
              label="Delivery Address"
              placeholder="House number and street"
              maxLength={100}
              {...registerForm.register('addressLine1')}
              error={registerForm.formState.errors.addressLine1?.message}
            />
            <Input
              label="City"
              maxLength={100}
              {...registerForm.register('city')}
              error={registerForm.formState.errors.city?.message}
            />
            <p className="text-xs text-charcoal-light">
              This will be saved as your delivery address — you can change it anytime from your profile.
            </p>
            <Button type="submit" variant="gold" loading={loading} className="w-full">
              Create Account &amp; Continue
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="login"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            onSubmit={loginForm.handleSubmit(onLogin)}
            className="space-y-3"
          >
            <Input
              label="Email"
              type="email"
              {...loginForm.register('email')}
              error={loginForm.formState.errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              {...loginForm.register('password')}
              error={loginForm.formState.errors.password?.message}
            />
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-gold-600 hover:text-gold-700">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" variant="gold" loading={loading} className="w-full">
              Log In &amp; Continue
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

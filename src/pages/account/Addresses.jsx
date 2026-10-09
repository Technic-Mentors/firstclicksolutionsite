import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAsync } from '../../hooks/useAsync';
import { useDisclosure } from '../../hooks/useDisclosure';
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../api/addresses.api';
import { addressSchema } from '../../validation/address.schema';
import { getErrorMessage } from '../../utils/errorMessage';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function Addresses() {
  const { data: addresses, loading, refetch } = useAsync(() => getAddresses(), []);
  const { isOpen, open, close } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(addressSchema) });

  function openNew() {
    setEditing(null);
    reset({ label: 'Home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '' });
    open();
  }
  function openEdit(addr) {
    setEditing(addr);
    reset({
      label: addr.label,
      fullName: addr.full_name,
      phone: addr.phone,
      addressLine1: addr.address_line1,
      addressLine2: addr.address_line2,
      city: addr.city,
    });
    open();
  }

  async function onSubmit(values) {
    setSaving(true);
    try {
      if (editing) await updateAddress(editing.id, values);
      else await createAddress(values);
      toast.success('Address saved.');
      close();
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save address.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await deleteAddress(deleteTarget.id);
    toast.success('Address deleted.');
    setDeleteTarget(null);
    refetch();
  }

  async function handleSetDefault(id) {
    await setDefaultAddress(id);
    refetch();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}>Add Address</Button>
      </div>

      {!addresses?.length ? (
        <EmptyState title="No addresses saved" description="Add an address to speed up checkout." />
      ) : (
        addresses.map((addr) => (
          <div key={addr.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="text-sm">
                <p className="font-medium text-charcoal">
                  {addr.label} {addr.is_default && <span className="ml-2 text-xs text-gold-600">(Default)</span>}
                </p>
                <p className="text-charcoal-light">
                  {addr.full_name} · {addr.phone}
                </p>
                <p className="text-charcoal-light">
                  {addr.address_line1}, {addr.address_line2 ? `${addr.address_line2}, ` : ''}
                  {addr.city}
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr.id)} className="text-gold-600 hover:text-gold-700">
                    Set Default
                  </button>
                )}
                <button onClick={() => openEdit(addr)} className="text-charcoal-light hover:text-charcoal">
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(addr)} className="text-red-500 hover:text-red-600">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      <Modal open={isOpen} onClose={close} title={editing ? 'Edit Address' : 'Add Address'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input label="Label" {...register('label')} error={errors.label?.message} />
          <Input label="Full Name" required maxLength={25} {...register('fullName')} error={errors.fullName?.message} />
          <Input label="Phone" required placeholder="07700 900123" maxLength={16} {...register('phone')} error={errors.phone?.message} />
          <Input label="Address Line 1" required maxLength={100} {...register('addressLine1')} error={errors.addressLine1?.message} />
          <Input label="Address Line 2 (optional)" maxLength={100} {...register('addressLine2')} error={errors.addressLine2?.message} />
          <Input label="City" required {...register('city')} error={errors.city?.message} />
          <Button type="submit" loading={saving} className="w-full">
            Save Address
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this address?"
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

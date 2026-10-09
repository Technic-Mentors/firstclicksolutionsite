import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  getProduct,
  createProduct,
  updateProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  addProductImage,
  deleteProductImage,
  setPrimaryImage,
} from '../../api/admin/products.api';
import { getErrorMessage } from '../../utils/errorMessage';
import { listCategories } from '../../api/admin/categories.api';
import { useAsync } from '../../hooks/useAsync';
import Input from '../../components/ui/Input';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import ImageUploader from '../../components/admin/form/ImageUploader';
import { assetUrl } from '../../utils/media';

const emptyVariant = () => ({
  id: null,
  spec: '',
  conditionGrade: '',
  sku: '',
  priceOverride: '',
  stockQuantity: '',
  lowStockThreshold: '',
});

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: categories } = useAsync(() => listCategories(), []);
  const {
    data: product,
    loading: loadingProduct,
    error: loadError,
    refetch: refetchProduct,
  } = useAsync(() => (isEdit ? getProduct(id) : Promise.resolve(null)), [id]);

  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      categoryId: '',
      name: '',
      description: '',
      careInstructions: '',
      fabric: '',
      basePrice: '',
      compareAtPrice: '',
      sortOrder: 0,
      isFeatured: false,
      isActive: true,
      metaTitle: '',
      metaDescription: '',
      variants: [emptyVariant()],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  useEffect(() => {
    if (isEdit && product) {
      reset({
        categoryId: String(product.category_id ?? product.categoryId ?? ''),
        name: product.name || '',
        description: product.description || '',
        careInstructions: product.care_instructions || product.careInstructions || '',
        fabric: product.fabric || '',
        basePrice: product.base_price ?? product.basePrice ?? '',
        compareAtPrice: product.compare_at_price ?? product.compareAtPrice ?? '',
        sortOrder: product.sort_order ?? product.sortOrder ?? 0,
        isFeatured: Boolean(product.is_featured ?? product.isFeatured),
        isActive: Boolean(product.is_active ?? product.isActive ?? true),
        metaTitle: product.meta_title || product.metaTitle || '',
        metaDescription: product.meta_description || product.metaDescription || '',
        variants: (product.variants || []).map((v) => ({
          id: v.id,
          spec: v.spec || '',
          conditionGrade: v.condition_grade ?? v.conditionGrade ?? '',
          sku: v.sku || '',
          priceOverride: v.price_override ?? v.priceOverride ?? '',
          stockQuantity: v.stock_quantity ?? v.stockQuantity ?? '',
          lowStockThreshold: v.low_stock_threshold ?? v.lowStockThreshold ?? '',
        })),
      });
    }
  }, [isEdit, product, reset]);

  if (isEdit && loadingProduct) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isEdit && loadError) {
    return <ErrorState message="Could not load this product." onRetry={refetchProduct} />;
  }

  function buildVariantPayload(v) {
    return {
      spec: v.spec,
      conditionGrade: v.conditionGrade,
      sku: v.sku,
      priceOverride: v.priceOverride === '' ? undefined : Number(v.priceOverride),
      stockQuantity: Number(v.stockQuantity) || 0,
      lowStockThreshold: v.lowStockThreshold === '' ? undefined : Number(v.lowStockThreshold),
    };
  }

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      const basePayload = {
        categoryId: Number(values.categoryId),
        name: values.name,
        description: values.description || undefined,
        careInstructions: values.careInstructions || undefined,
        fabric: values.fabric || undefined,
        basePrice: Number(values.basePrice),
        compareAtPrice: values.compareAtPrice === '' ? undefined : Number(values.compareAtPrice),
        sortOrder: values.sortOrder === '' ? 0 : Number(values.sortOrder),
        isFeatured: Boolean(values.isFeatured),
        metaTitle: values.metaTitle || undefined,
        metaDescription: values.metaDescription || undefined,
      };

      if (isEdit) {
        await updateProduct(id, { ...basePayload, isActive: Boolean(values.isActive) });

        const existingIds = (product.variants || []).map((v) => v.id);
        const currentIds = values.variants.filter((v) => v.id).map((v) => v.id);
        const removedIds = existingIds.filter((vid) => !currentIds.includes(vid));

        for (const v of values.variants) {
          const payload = buildVariantPayload(v);
          if (v.id) {
            await updateVariant(id, v.id, payload);
          } else {
            await addVariant(id, payload);
          }
        }
        for (const vid of removedIds) {
          await deleteVariant(id, vid);
        }

        toast.success('Product updated.');
        refetchProduct();
      } else {
        const created = await createProduct({
          ...basePayload,
          variants: values.variants.map(buildVariantPayload),
        });
        toast.success('Product created.');
        navigate(`/admin/products/${created.id}/edit`, { replace: true });
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddImage(file) {
    try {
      await addProductImage(id, file);
      toast.success('Image uploaded.');
      refetchProduct();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    }
  }

  async function handleDeleteImage(imageId) {
    try {
      await deleteProductImage(id, imageId);
      toast.success('Image removed.');
      refetchProduct();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    }
  }

  async function handleSetPrimary(imageId) {
    try {
      await setPrimaryImage(id, imageId);
      toast.success('Primary image updated.');
      refetchProduct();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-charcoal">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-charcoal">Basic Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <SearchableSelect
                  label="Category"
                  placeholder="Select a category"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.categoryId?.message}
                  options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
                />
              )}
            />
            <Input
              label="Name"
              maxLength={200}
              error={errors.name?.message}
              {...register('name', { required: 'Name is required', maxLength: 200 })}
            />
            <Input label="Material" maxLength={100} {...register('fabric')} />
            <Input
              label="Base Price (Rs.)"
              type="number"
              step="0.01"
              min="0.01"
              error={errors.basePrice?.message}
              {...register('basePrice', { required: 'Base price is required', min: 0.01 })}
            />
            <Input label="Compare-at Price (Rs.)" type="number" step="0.01" min="0.01" {...register('compareAtPrice')} />
            <Input
              label="Sort Order (lower shows first)"
              type="number"
              step="1"
              min="0"
              {...register('sortOrder')}
            />
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 text-sm text-charcoal">
                <input type="checkbox" {...register('isFeatured')} className="h-4 w-4 rounded border-stone-300" />
                Featured
              </label>
              {isEdit && (
                <label className="flex items-center gap-2 text-sm text-charcoal">
                  <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded border-stone-300" />
                  Active
                </label>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <Textarea label="Description" rows={3} {...register('description')} />
            <Textarea label="Care Instructions" rows={2} {...register('careInstructions')} />
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-charcoal">SEO</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Meta Title" {...register('metaTitle')} />
            <Input label="Meta Description" {...register('metaDescription')} />
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-charcoal">Variants</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => append(emptyVariant())}>
              Add Variant
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex flex-wrap items-end gap-3 rounded-md border border-stone-200 p-3">
                <div className="w-28 flex-1 min-w-[7rem]">
                  <Input
                    label="Spec"
                    maxLength={100}
                    error={errors.variants?.[idx]?.spec?.message}
                    {...register(`variants.${idx}.spec`, { required: 'Required' })}
                  />
                </div>
                <div className="w-28 flex-1 min-w-[7rem]">
                  <Input
                    label="Condition"
                    maxLength={50}
                    error={errors.variants?.[idx]?.conditionGrade?.message}
                    {...register(`variants.${idx}.conditionGrade`, { required: 'Required' })}
                  />
                </div>
                <div className="w-36 flex-1 min-w-[9rem]">
                  <Input
                    label="SKU"
                    maxLength={64}
                    error={errors.variants?.[idx]?.sku?.message}
                    {...register(`variants.${idx}.sku`, { required: 'Required' })}
                  />
                </div>
                <div className="w-32 flex-1 min-w-[8rem]">
                  <Input label="Price Override" type="number" step="0.01" min="0.01" {...register(`variants.${idx}.priceOverride`)} />
                </div>
                <div className="w-28 flex-1 min-w-[7rem]">
                  <Input
                    label="Stock Qty"
                    type="number"
                    min="0"
                    step="1"
                    error={errors.variants?.[idx]?.stockQuantity?.message}
                    {...register(`variants.${idx}.stockQuantity`, {
                      required: 'Required',
                      min: { value: 0, message: 'Must be 0 or more' },
                    })}
                  />
                </div>
                <div className="w-32 flex-1 min-w-[8rem]">
                  <Input label="Low Stock At" type="number" min="0" step="1" {...register(`variants.${idx}.lowStockThreshold`)} />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={fields.length <= 1}
                  onClick={() => remove(idx)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        {isEdit && (
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-charcoal">Images</h3>
            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(product?.images || []).map((img) => (
                <div key={img.id} className="flex flex-col gap-2 rounded-md border border-stone-200 p-2">
                  <img src={assetUrl(img.image_path)} alt="" className="h-28 w-full rounded object-cover" />
                  <div className="flex items-center justify-between gap-1">
                    {img.is_primary ? (
                      <span className="text-xs font-medium text-gold-600">Primary</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(img.id)}
                        className="text-xs font-medium text-charcoal-light hover:text-gold-600"
                      >
                        Make primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <ImageUploader label="Add image" onChange={handleAddImage} />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
          <Button type="submit" variant="gold" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}

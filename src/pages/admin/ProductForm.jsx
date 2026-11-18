import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
import { cn } from '../../utils/cn';
import ProductPreview from '../../components/admin/product/ProductPreview';
import ListingHealth from '../../components/admin/product/ListingHealth';
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

/**
 * The steps, and which fields each one owns.
 *
 * `fields` is what gets validated when you press Next, so a step cannot be left with its own
 * required fields empty — but a field on a later step never blocks an earlier one.
 */
const STEPS = [
  { key: 'basics', label: 'Basics', hint: 'What the product is', fields: ['categoryId', 'name'] },
  { key: 'pricing', label: 'Pricing', hint: 'What it costs', fields: ['basePrice'] },
  { key: 'variants', label: 'Variants', hint: 'Specs and stock', fields: ['variants'] },
  { key: 'media', label: 'Images & SEO', hint: 'How it is found', fields: [] },
];

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
  const [step, setStep] = useState(0);
  // Images cannot be attached to a product that has no id yet, so while creating we hold the
  // chosen files here and upload them the moment the product exists. Each keeps a local
  // preview URL, which has to be released again or the blobs leak for the life of the tab.
  const [pendingImages, setPendingImages] = useState([]);
  const [primaryPending, setPrimaryPending] = useState(0);
  // Failures handed over by the redirect after creating. Held in state so the panel can be
  // dismissed, and so a later successful upload does not leave a stale warning on screen.
  const location = useLocation();
  const [imageFailures, setImageFailures] = useState(location.state?.imageFailures ?? []);

  const {
    register,
    handleSubmit,
    control,
    reset,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      categoryId: '',
      name: '',
      description: '',
      careInstructions: '',
      fabric: '',
      material: '',
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

  useEffect(() => () => pendingImages.forEach((img) => URL.revokeObjectURL(img.url)), [pendingImages]);

  function addPendingImages(fileList) {
    const chosen = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (chosen.length === 0) return;
    setPendingImages((current) => [
      ...current,
      ...chosen.map((file) => ({ file, url: URL.createObjectURL(file), key: `${file.name}-${Date.now()}-${Math.random()}` })),
    ]);
  }

  function removePendingImage(index) {
    setPendingImages((current) => {
      URL.revokeObjectURL(current[index].url);
      return current.filter((_, i) => i !== index);
    });
    setPrimaryPending((p) => (index === p ? 0 : index < p ? p - 1 : p));
  }

  useEffect(() => {
    if (isEdit && product) {
      reset({
        categoryId: String(product.category_id ?? product.categoryId ?? ''),
        name: product.name || '',
        description: product.description || '',
        careInstructions: product.care_instructions || product.careInstructions || '',
        fabric: product.fabric || '',
        material: product.material || '',
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

  async function goToStep(target) {
    // Going back, or editing an existing product, never needs a gate — only walking forward
    // through a product that does not exist yet does.
    if (target <= step || isEdit) {
      setStep(target);
      return;
    }
    for (let i = step; i < target; i += 1) {
      const ok = await trigger(STEPS[i].fields);
      if (!ok) {
        setStep(i);
        return;
      }
    }
    setStep(target);
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
        material: values.material || undefined,
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

        // The product exists now, so the held files finally have something to attach to.
        // Collected rather than thrown: the product itself saved fine, and losing that work
        // over a failed upload would be worse than reporting which images did not make it,
        // and why — a bare count leaves the person with nothing to act on.
        const failures = [];
        for (const [idx, img] of pendingImages.entries()) {
          try {
            await addProductImage(created.id, img.file, { isPrimary: idx === primaryPending });
          } catch (err) {
            failures.push({ name: img.file.name, reason: getErrorMessage(err, 'Upload failed.') });
          }
        }

        pendingImages.forEach((img) => URL.revokeObjectURL(img.url));
        setPendingImages([]);

        if (failures.length > 0) {
          toast.error(`Product created, but ${failures.length} image${failures.length === 1 ? '' : 's'} did not upload.`);
        } else {
          toast.success('Product created.');
        }
        // Carried across the redirect so the reasons survive landing on the edit page, where
        // the person can actually retry them.
        navigate(`/admin/products/${created.id}/edit`, { replace: true, state: { imageFailures: failures } });
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
      setImageFailures((current) => current.filter((f) => f.name !== file.name));
      refetchProduct();
    } catch (err) {
      const reason = getErrorMessage(err, 'Upload failed.');
      toast.error(reason);
      setImageFailures((current) => [
        ...current.filter((f) => f.name !== file.name),
        { name: file.name, reason },
      ]);
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

  const isLastStep = step === STEPS.length - 1;

  // Everything below follows the live form values rather than the saved product, so the
  // preview and the checklist describe what you are about to save, not what is on disk.
  const values = watch();
  const categoryName =
    (categories || []).find((c) => String(c.id) === String(values.categoryId))?.name || '';
  const savedImages = product?.images || [];
  const previewImage = savedImages.find((i) => i.is_primary) || savedImages[0];
  const previewImageUrl = isEdit
    ? previewImage && assetUrl(previewImage.image_path)
    : pendingImages[primaryPending]?.url || pendingImages[0]?.url;

  const variantsReady = (values.variants || []).some((v) => v.spec && v.conditionGrade && v.sku);
  const imageCount = isEdit ? savedImages.length : pendingImages.length;

  const healthChecks = [
    { key: 'basics', label: 'Name and category', step: 0, done: Boolean(values.name && values.categoryId) },
    { key: 'price', label: 'Add a price', step: 1, done: Number(values.basePrice) > 0, blocking: true },
    { key: 'variants', label: 'Variants set up', step: 2, done: variantsReady, blocking: true },
    { key: 'description', label: 'Write a description', step: 0, done: Boolean(values.description?.trim()) },
    { key: 'images', label: 'Add product images', step: 3, done: imageCount > 0 },
  ];
  const percentComplete = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* The dark band carries the sidebar's green so the form reads as part of the same
          panel, and puts the product's live state next to its name — on an edit screen the
          first question is usually "is this one already on the shop?". */}
      <div className="rounded-xl bg-forest-700 px-5 py-4 text-white">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium">
            <span className={cn('h-1.5 w-1.5 rounded-full', values.isActive ? 'bg-leaf-400' : 'bg-white/40')} />
            {values.isActive ? 'Live on store' : 'Draft'}
          </span>
          {categoryName && (
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium">{categoryName}</span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">{isEdit ? 'Edit product' : 'Add product'}</h1>
            <p className="mt-0.5 truncate text-[13px] text-white/60">
              {values.name || 'Give the product a name to get started.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="border border-white/25 bg-transparent text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button type="submit" form="product-form" variant="gold" loading={submitting}>
              {isEdit ? 'Save changes' : 'Create product'}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-charcoal">
            Step {step + 1} of {STEPS.length} · {STEPS[step].label}
          </span>
          <span className="text-charcoal-light">{percentComplete}% complete</span>
        </div>
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-gold-500 transition-all duration-300"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
        <Stepper steps={STEPS} current={step} onSelect={goToStep} />
      </div>

      {/* noValidate hands validation to react-hook-form. Without it the browser's own bubble
          fires first and the inline messages under each field never get a chance to show. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <form
        id="product-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5 lg:col-span-2"
      >
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          {step === 0 && (
            <StepPanel title="Basics" description="The name and category a shopper will see.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  name="categoryId"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Category"
                      required
                      placeholder="Select a category"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.categoryId?.message}
                      options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
                    />
                  )}
                />
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <Input
                    label="Product name"
                    required
                    maxLength={200}
                    error={errors.name?.message}
                    {...register('name', { required: 'Name is required', maxLength: 200 })}
                  />
                  <p className="self-end text-[11px] text-charcoal-light">
                    {(values.name || '').length} / 200
                  </p>
                </div>
                {/* The column is still called `fabric` from the clothing template this
                    project started as, but the storefront shows it as "Brand" and the
                    catalogue fills it with Dell, HP, Lenovo. The admin label said
                    "Material", so material descriptions were being typed into the field the
                    shop prints under Brand. */}
                {/* Every field here says where it lands on the product page, so what is
                    typed in the admin and what the shopper reads can be matched up
                    without saving and going to look. */}
                <div className="flex flex-col gap-1">
                  <Input
                    label="Brand"
                    maxLength={100}
                    placeholder="Dell, HP, Lenovo…"
                    {...register('fabric')}
                  />
                  <FieldHint>Product page → Specifications → Brand</FieldHint>
                </div>
                {/* Build/material notes used to be typed into `fabric` and printed under
                    Brand. They have their own column now. */}
                <div className="flex flex-col gap-1">
                  <Input
                    label="Material / build"
                    maxLength={255}
                    placeholder="Black steel chassis with a plastic front bezel…"
                    {...register('material')}
                  />
                  <FieldHint>Product page → Specifications → Material / build</FieldHint>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1">
                  <Textarea label="Description" rows={4} {...register('description')} />
                  <FieldHint>Product page → Description</FieldHint>
                </div>
                {/* Same story: stored as `care_instructions`, shown on the storefront as
                    "Condition". */}
                <div className="flex flex-col gap-1">
                  <Textarea
                    label="Condition notes"
                    rows={2}
                    placeholder="Grade A — light cosmetic marks, fully tested, 12 month warranty."
                    {...register('careInstructions')}
                  />
                  <FieldHint>Product page → Condition &amp; what&rsquo;s included</FieldHint>
                </div>
              </div>
            </StepPanel>
          )}

          {step === 1 && (
            <StepPanel title="Pricing" description="The starting price, and how the product is listed.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Base Price (£)"
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  error={errors.basePrice?.message}
                  {...register('basePrice', { required: 'Base price is required', min: 0.01 })}
                />
                <Input label="Compare-at Price (£)" type="number" step="0.01" min="0.01" {...register('compareAtPrice')} />
                <div className="flex flex-col gap-1">
                  <Input label="Sort Order" type="number" step="1" min="0" {...register('sortOrder')} />
                  <p className="text-xs text-charcoal-light">Lower numbers appear first.</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-4 border-t border-stone-100 pt-4">
                <label className="flex items-center gap-2 text-sm text-charcoal">
                  <input type="checkbox" {...register('isFeatured')} className="h-4 w-4 rounded border-stone-300" />
                  Featured on the storefront
                </label>
                {isEdit && (
                  <label className="flex items-center gap-2 text-sm text-charcoal">
                    <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded border-stone-300" />
                    Active
                  </label>
                )}
              </div>
            </StepPanel>
          )}

          {step === 2 && (
            <StepPanel
              title="Variants"
              description="Every product needs at least one. Spec, condition and SKU all print in the Specifications table on the product page, and stock is tracked per variant, not per product."
              action={
                <Button type="button" variant="outline" size="sm" onClick={() => append(emptyVariant())}>
                  Add variant
                </Button>
              }
            >
              <div className="flex flex-col gap-4">
                {fields.map((field, idx) => (
                  <div key={field.id} className="rounded-lg border border-stone-200 bg-stone-50/60 p-3.5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-charcoal-light">
                        Variant {idx + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={fields.length <= 1}
                        onClick={() => remove(idx)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <Input
                        label="Spec"
                        required
                        maxLength={100}
                        error={errors.variants?.[idx]?.spec?.message}
                        {...register(`variants.${idx}.spec`, { required: 'Required' })}
                      />
                      <Input
                        label="Condition"
                        required
                        maxLength={50}
                        error={errors.variants?.[idx]?.conditionGrade?.message}
                        {...register(`variants.${idx}.conditionGrade`, { required: 'Required' })}
                      />
                      <Input
                        label="SKU"
                        required
                        maxLength={64}
                        error={errors.variants?.[idx]?.sku?.message}
                        {...register(`variants.${idx}.sku`, { required: 'Required' })}
                      />
                      <Input
                        label="Stock Qty"
                        required
                        type="number"
                        min="0"
                        step="1"
                        error={errors.variants?.[idx]?.stockQuantity?.message}
                        {...register(`variants.${idx}.stockQuantity`, {
                          required: 'Required',
                          min: { value: 0, message: 'Must be 0 or more' },
                        })}
                      />
                      <Input
                        label="Price Override (£)"
                        type="number"
                        step="0.01"
                        min="0.01"
                        {...register(`variants.${idx}.priceOverride`)}
                      />
                      <Input
                        label="Low Stock At"
                        type="number"
                        min="0"
                        step="1"
                        {...register(`variants.${idx}.lowStockThreshold`)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </StepPanel>
          )}

          {step === 3 && (
            <StepPanel title="Images & SEO" description="Optional, but a product without a photo rarely sells.">
              {imageFailures.length > 0 && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-red-700">
                      {imageFailures.length} image{imageFailures.length === 1 ? '' : 's'} did not upload
                    </p>
                    <button
                      type="button"
                      onClick={() => setImageFailures([])}
                      className="shrink-0 text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      Dismiss
                    </button>
                  </div>
                  <ul className="mt-2 flex flex-col gap-1">
                    {imageFailures.map((failure) => (
                      <li key={failure.name} className="text-xs text-red-700">
                        <span className="font-medium">{failure.name}</span> — {failure.reason}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-red-600">Fix the file and add it again below.</p>
                </div>
              )}

              {isEdit ? (
                <>
                  <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {(product?.images || []).map((img) => (
                      <div key={img.id} className="flex flex-col gap-2 rounded-lg border border-stone-200 p-2">
                        <img src={assetUrl(img.image_path)} alt="" className="h-28 w-full rounded object-cover" />
                        <div className="flex items-center justify-between gap-1">
                          {img.is_primary ? (
                            <span className="text-xs font-semibold text-gold-600">Primary</span>
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
                </>
              ) : (
                <>
                  {pendingImages.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {pendingImages.map((img, idx) => (
                        <div key={img.key} className="flex flex-col gap-2 rounded-lg border border-stone-200 p-2">
                          <img src={img.url} alt="" className="h-28 w-full rounded object-cover" />
                          <div className="flex items-center justify-between gap-1">
                            {idx === primaryPending ? (
                              <span className="text-xs font-semibold text-gold-600">Primary</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setPrimaryPending(idx)}
                                className="text-xs font-medium text-charcoal-light hover:text-gold-600"
                              >
                                Make primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removePendingImage(idx)}
                              className="text-xs font-medium text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center transition-colors hover:border-gold-400 hover:bg-gold-50/40">
                    <UploadIcon />
                    <span className="text-sm font-medium text-charcoal">Choose images</span>
                    <span className="text-xs text-charcoal-light">
                      They upload automatically as soon as you create the product.
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        addPendingImages(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </>
              )}

              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-stone-100 pt-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Input label="Meta Title" {...register('metaTitle')} />
                  <FieldHint>Browser tab and search results. Blank uses the product name.</FieldHint>
                </div>
                <div className="flex flex-col gap-1">
                  <Input label="Meta Description" {...register('metaDescription')} />
                  <FieldHint>Search result snippet. Blank uses the description.</FieldHint>
                </div>
              </div>
            </StepPanel>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" disabled={step === 0} onClick={() => goToStep(step - 1)}>
              Back
            </Button>
            <span className="text-xs text-charcoal-light">Changes stay unsaved until you save.</span>
          </div>

          {/* Naming the next step rather than saying "Next" tells you what you are walking
              into, which matters most on the step you have not reached before. */}
          {!isLastStep ? (
            <Button type="button" variant={isEdit ? 'outline' : 'gold'} onClick={() => goToStep(step + 1)}>
              Continue to {STEPS[step + 1].label}
              <ArrowRightIcon />
            </Button>
          ) : (
            <Button type="submit" variant="gold" loading={submitting}>
              {isEdit ? 'Save changes' : 'Create product'}
            </Button>
          )}
        </div>
      </form>

      <aside className="flex flex-col gap-4">
        <ProductPreview
          name={values.name}
          categoryName={categoryName}
          brand={values.fabric}
          price={values.basePrice}
          variants={values.variants || []}
          imageUrl={previewImageUrl}
          isActive={!isEdit || values.isActive}
        />
        <ListingHealth checks={healthChecks} onGoToStep={goToStep} />
      </aside>
      </div>
    </div>
  );
}

function FieldHint({ children }) {
  return <p className="text-[11px] text-charcoal-light">{children}</p>;
}

function StepPanel({ title, description, action, children }) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <h3 className="text-base font-semibold text-charcoal">{title}</h3>
          {description && <p className="mt-0.5 text-[13px] text-charcoal-light">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </>
  );
}

function Stepper({ steps, current, onSelect }) {
  return (
    <ol className="flex items-center gap-1 overflow-x-auto rounded-xl border border-stone-200 bg-white p-3 sm:gap-2">
      {steps.map((s, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <li key={s.key} className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(idx)}
              aria-current={active ? 'step' : undefined}
              className={cn(
                'flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                active ? 'bg-gold-50' : 'hover:bg-stone-50',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  done && 'bg-green-600 text-white',
                  active && 'bg-gold-500 text-white',
                  !done && !active && 'bg-stone-100 text-charcoal-light',
                )}
              >
                {done ? <TickIcon /> : idx + 1}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className={cn('block truncate text-sm font-medium', active ? 'text-gold-700' : 'text-charcoal')}>
                  {s.label}
                </span>
                <span className="block truncate text-[11px] text-charcoal-light">{s.hint}</span>
              </span>
            </button>
            {idx < steps.length - 1 && <span className="hidden h-px w-4 shrink-0 bg-stone-200 sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-charcoal-light">
      <path d="M12 17V5M7 10l5-5 5 5M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TickIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L19 7" />
    </svg>
  );
}

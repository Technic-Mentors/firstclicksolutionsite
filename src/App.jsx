import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import AccountLayout from './components/layout/AccountLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminProtectedRoute from './routes/AdminProtectedRoute';
import Spinner from './components/ui/Spinner';
import ScrollToTop from './components/ScrollToTop';

// Customer pages--there 
const Home = lazy(() => import('./pages/Home'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BenefitsPage = lazy(() => import('./pages/BenefitsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const SizeGuidePage = lazy(() => import('./pages/SizeGuidePage'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));
const OffersPage = lazy(() => import('./pages/OffersPage'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Account pages
const AccountOverview = lazy(() => import('./pages/account/AccountOverview'));
const OrdersList = lazy(() => import('./pages/account/OrdersList'));
const OrderDetail = lazy(() => import('./pages/account/OrderDetail'));
const Addresses = lazy(() => import('./pages/account/Addresses'));
const Wishlist = lazy(() => import('./pages/account/Wishlist'));
const Profile = lazy(() => import('./pages/account/Profile'));

// Admin pages
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const AdminOrdersList = lazy(() => import('./pages/admin/OrdersList'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const ProductsList = lazy(() => import('./pages/admin/ProductsList'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Inventory = lazy(() => import('./pages/admin/Inventory'));
const CustomersList = lazy(() => import('./pages/admin/CustomersList'));
const CustomerDetail = lazy(() => import('./pages/admin/CustomerDetail'));
const Coupons = lazy(() => import('./pages/admin/Coupons'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));
const Banners = lazy(() => import('./pages/admin/Banners'));
const AdminBlogList = lazy(() => import('./pages/admin/BlogList'));
const AdminBlogForm = lazy(() => import('./pages/admin/BlogForm'));
const Shipping = lazy(() => import('./pages/admin/Shipping'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const ContactMessages = lazy(() => import('./pages/admin/ContactMessages'));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner />
    </div>
  );
}

/* ═══════════════ Floating WhatsApp Button ═══════════════ */
// TODO: set this once First Click Solutions has a WhatsApp business number.
// Left empty on purpose — FloatingWhatsApp hides itself while it is blank, which is
// better than linking customers to the previous brand's number.
const WHATSAPP_NUMBER = '';
const WHATSAPP_MESSAGE = 'Hello First Click Solutions, I would like to know more about your products.';

function FloatingWhatsApp() {
  const { pathname } = useLocation();

  // Hide on admin pages, and until a real WhatsApp number is configured
  if (pathname.startsWith('/admin') || !WHATSAPP_NUMBER) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/30 transition-transform duration-300 hover:scale-110 active:scale-95 sm:bottom-6 sm:right-6"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-40" />

      {/* WhatsApp icon */}
      <svg
        viewBox="0 0 32 32"
        className="relative h-7 w-7 fill-white drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.001 3C9.376 3 4 8.376 4 15c0 2.378.694 4.59 1.885 6.45L4 29l7.76-1.832A11.94 11.94 0 0 0 16 27c6.624 0 12-5.376 12-12S22.625 3 16.001 3zm0 21.75a9.68 9.68 0 0 1-4.94-1.352l-.354-.21-4.605 1.087 1.115-4.486-.23-.368A9.7 9.7 0 0 1 6.25 15c0-5.376 4.375-9.75 9.75-9.75 5.376 0 9.75 4.374 9.75 9.75 0 5.376-4.374 9.75-9.75 9.75zm5.35-7.296c-.294-.147-1.737-.857-2.006-.954-.27-.098-.466-.147-.662.147-.196.294-.759.954-.93 1.15-.173.196-.343.22-.637.074-.294-.147-1.243-.458-2.367-1.46-.875-.78-1.465-1.744-1.637-2.038-.172-.294-.018-.453.128-.6.13-.13.294-.343.44-.515.147-.171.196-.294.294-.49.098-.196.049-.368-.024-.515-.074-.147-.662-1.598-.908-2.188-.238-.574-.48-.497-.662-.506l-.564-.01c-.196 0-.514.073-.784.367-.27.294-1.029 1.006-1.029 2.452s1.054 2.844 1.2 3.04c.147.196 2.073 3.166 5.023 4.44.702.302 1.25.482 1.677.617.705.223 1.347.191 1.855.116.566-.084 1.737-.71 1.983-1.396.245-.687.245-1.276.172-1.396-.074-.122-.27-.196-.564-.343z" />
      </svg>

      {/* Tooltip on hover (desktop) */}
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md bg-charcoal px-3 py-1.5 text-xs font-medium text-cream opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
        Chat with us
        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full border-4 border-transparent border-l-charcoal" />
      </span>
    </a>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <FloatingWhatsApp />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="onlineshop" element={<ShopPage />} />
            <Route path="category/:slug" element={<CategoryPage />} />
            <Route path="product/:slug" element={<ProductPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="benefits" element={<BenefitsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="size-guide" element={<SizeGuidePage />} />
            <Route path="policy" element={<PolicyPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="blog" element={<BlogListPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
            <Route path="track-order" element={<TrackOrderPage />} />
            <Route path="checkout" element={<CheckoutPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="order-confirmation/:id" element={<OrderConfirmationPage />} />
              <Route path="account" element={<AccountLayout />}>
                <Route index element={<AccountOverview />} />
                <Route path="orders" element={<OrdersList />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="addresses" element={<Addresses />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="admin/login" element={<AdminLogin />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="reports" element={<Reports />} />
              <Route path="orders" element={<AdminOrdersList />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="products" element={<ProductsList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="categories" element={<Categories />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="customers" element={<CustomersList />} />
              <Route path="customers/:id" element={<CustomerDetail />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="banners" element={<Banners />} />
              <Route path="blog" element={<AdminBlogList />} />
              <Route path="blog/new" element={<AdminBlogForm />} />
              <Route path="blog/:id/edit" element={<AdminBlogForm />} />
              <Route path="shipping" element={<Shipping />} />
              <Route path="settings" element={<Settings />} />
              <Route path="contact-messages" element={<ContactMessages />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
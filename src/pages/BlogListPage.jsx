import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { getBlogPosts } from '../api/blog.api';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { formatDate } from '../utils/format';
import { assetUrl } from '../utils/media';
import PageHeroBg from '../components/layout/PageHeroBg';

export default function BlogListPage() {
  const [page, setPage] = useState(1);
  const { data, loading } = useAsync(() => getBlogPosts({ page, pageSize: 9 }), [page]);

  return (
    <div>
      {/* ══════════════ HERO — Sunlit Gradient ══════════════ */}
      <section className="relative isolate overflow-hidden bg-gold-500 text-white">
        <PageHeroBg />

        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <nav className="mb-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/75">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <span className="text-white/50">/</span>
            <span className="font-medium text-white">Blog</span>
          </nav>

          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/70" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/85">
              Guides &amp; Workshop Notes
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/70" />
          </div>

          <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
            Buying <span className="text-white">Guides</span>
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm text-white/85 sm:text-base">
            Advice on choosing, upgrading and looking after refurbished computers — plus what we have learned in the workshop.
          </p>

          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : !data?.data?.length ? (
          <EmptyState
            title="No articles yet"
            description="Check back soon for buying guides, upgrade walkthroughs and workshop notes."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
              {data.data.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group block">
                  <div className="mb-3 aspect-video overflow-hidden rounded-md bg-stone-100">
                    {post.featured_image && (
                      <img
                        src={assetUrl(post.featured_image)}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="text-xs uppercase tracking-wider text-gold-600">{post.category_name}</p>
                  <h2 className="mt-1 font-serif text-lg text-charcoal">{post.title}</h2>
                  <p className="mt-1 text-xs text-stone-400">{formatDate(post.published_at)}</p>
                </Link>
              ))}
            </div>

            {data.meta.totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-3">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
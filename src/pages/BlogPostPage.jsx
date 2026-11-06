import { useParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { getBlogPostBySlug } from '../api/blog.api';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { formatDate } from '../utils/format';
import { assetUrl } from '../utils/media';

export default function BlogPostPage() {
  const { slug } = useParams();
  const { data: post, loading, error, refetch } = useAsync(() => getBlogPostBySlug(slug), [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (error || !post) return <ErrorState message="Article not found." onRetry={refetch} />;

  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-wider text-forest-700">{post.category_name}</p>
      <h1 className="mt-2 font-serif text-3xl text-charcoal">{post.title}</h1>
      <p className="mt-2 text-sm text-stone-400">{formatDate(post.published_at)}</p>
      {post.featured_image && (
        <img src={assetUrl(post.featured_image)} alt="" className="mt-6 w-full rounded-md object-cover" />
      )}
      <div className="mt-8 whitespace-pre-wrap leading-relaxed text-charcoal-light">{post.content}</div>
      {post.tags?.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag.id} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-charcoal-light">
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

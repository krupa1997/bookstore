import React, { useState, useEffect } from 'react';
import { ShoppingCart, Bookmark, Star, ChevronRight, Loader2 } from 'lucide-react';
import BookCoverArt from './BookCoverArt';
import BookCard from './BookCard';
import { catalogApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

function StarRating({ value, max = 5, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => interactive && onChange && onChange(i + 1)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            size={16}
            className={i < value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Merges a live API product (ProductDetailDto) with the static mock book
 * so cover art and tags still render when the backend doesn't have them.
 */
function mergeWithMock(apiProduct, mockBook) {
  if (!apiProduct) return mockBook;
  return {
    ...mockBook,         // static cover/tags from mock as fallback
    ...apiProduct,       // live data wins
    // keep mock cover art helpers when backend doesn't provide them
    customCover: mockBook?.customCover ?? {},
    tags: apiProduct.category ? [apiProduct.category.name] : mockBook?.tags ?? [],
    deliveryDate: apiProduct.tentativeDeliveryDate
      ? new Date(apiProduct.tentativeDeliveryDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
      : mockBook?.deliveryDate,
    price: apiProduct.price ?? mockBook?.price,
    format: mockBook?.format ?? 'Paperback',
    author: apiProduct.author ?? mockBook?.author,
    description: apiProduct.description ?? mockBook?.description,
    publisher: apiProduct.brand?.name ?? mockBook?.publisher,
    language: mockBook?.language ?? 'English',
    rating: mockBook?.rating,
    copiesSold: mockBook?.copiesSold,
    writer: mockBook?.writer,
    reviews: mockBook?.reviews ?? [],
    isbn: apiProduct.isbn ?? mockBook?.isbn,
  };
}

export default function BookDetailPage({ book: mockBook, onBookClick, onBack }) {
  const { user, addToCart } = useAuth();
  const [reviewText, setReviewText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [cartMsg, setCartMsg] = useState('');

  // Live detail from API
  const [detail, setDetail]         = useState(null);
  const [related, setRelated]       = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(true);

  const MAX_CHARS = 100;

  useEffect(() => {
    let cancelled = false;
    setLoadingDetail(true);
    setDetail(null);
    setRelated([]);

    async function load() {
      try {
        const [det, rel] = await Promise.all([
          catalogApi.getProductById(mockBook.id),
          catalogApi.getRelatedProducts(mockBook.id).catch(() => []),
        ]);
        if (!cancelled) {
          setDetail(mergeWithMock(det, mockBook));
          setRelated(rel);
        }
      } catch {
        // API not reachable — fall back to static mock
        if (!cancelled) setDetail(mockBook);
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [mockBook.id]);

  async function handleAddToCart() {
    if (!user) {
      setCartMsg('Please sign in to add to cart.');
      return;
    }
    await addToCart(mockBook.id, 1);
    setCartMsg('Added to cart!');
    setTimeout(() => setCartMsg(''), 2500);
  }

  const book = detail ?? mockBook;

  return (
    <div className="flex gap-6 min-h-screen">
      {/* Main content */}
      <div className="flex-1 min-w-0 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6">
          <button onClick={onBack} className="hover:text-blue-400 transition-colors">Home</button>
          {book.tags?.slice(0, 2).map((tag) => (
            <React.Fragment key={tag}>
              <ChevronRight size={12} className="text-gray-600" />
              <span className="text-blue-400">{tag}</span>
            </React.Fragment>
          ))}
        </nav>

        {loadingDetail ? (
          <div className="flex items-center gap-2 text-gray-400 py-12">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : (
          <>
            {/* Book preview + details */}
            <div className="flex flex-col lg:flex-row gap-8 mb-10">
              {/* Covers */}
              <div className="flex gap-4 shrink-0">
                <BookCoverArt book={book} className="w-40 h-56 rounded" />
                <BookCoverArt book={book} isBack className="w-40 h-56 rounded" />
              </div>

              {/* Details */}
              <div className="flex flex-col gap-2 min-w-0">
                <h1 className="text-white text-2xl font-bold leading-tight">{book.title}</h1>
                <p className="text-sm text-gray-400">
                  by{' '}
                  <span className="text-blue-400 hover:underline cursor-pointer">{book.author}</span>
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">{book.description}</p>

                {book.publisher && (
                  <p className="text-sm text-gray-400">
                    Published by:{' '}
                    <span className="text-blue-400 hover:underline cursor-pointer">{book.publisher}</span>
                  </p>
                )}

                <p className="text-sm text-gray-500 mt-1">{book.format}</p>

                {book.tags?.length > 0 && (
                  <p className="text-sm">
                    {book.tags.map((tag, i) => (
                      <span key={tag}>
                        <span className="text-blue-400 hover:underline cursor-pointer">{tag}</span>
                        {i < book.tags.length - 1 && <span className="text-gray-600">, </span>}
                      </span>
                    ))}
                  </p>
                )}

                <p className="text-white text-3xl font-bold mt-2">₹{book.price}</p>
                <p className="text-xs text-gray-400">
                  Delivery by <strong className="text-gray-200">{book.deliveryDate}</strong>
                </p>

                {/* CTAs */}
                <div className="flex gap-3 mt-3 flex-wrap items-center">
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded"
                  >
                    Add to Cart <ShoppingCart size={16} />
                  </button>
                  <button className="flex items-center gap-2 bg-[#2a2c33] hover:bg-[#32353e] border border-[#3a3d46] transition-colors text-gray-200 text-sm px-5 py-2.5 rounded">
                    Add to Wishlist <Bookmark size={16} />
                  </button>
                  {cartMsg && (
                    <span className={`text-xs ${cartMsg.startsWith('Please') ? 'text-yellow-400' : 'text-green-400'}`}>
                      {cartMsg}
                    </span>
                  )}
                </div>

                {/* Meta row */}
                <div className="flex gap-6 mt-4 text-xs text-gray-400 flex-wrap">
                  {book.language && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-500">🔤 Language</span>
                      <span className="text-blue-400 font-medium">{book.language}</span>
                    </div>
                  )}
                  {book.rating != null && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-500">☆ Rating</span>
                      <StarRating value={Math.round(book.rating)} />
                    </div>
                  )}
                  {book.copiesSold != null && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-500">$ Sells</span>
                      <span className="text-gray-200 font-medium">{book.copiesSold} copies sold</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About the writer */}
            {book.writer && (
              <section className="mb-10">
                <h2 className="text-white font-semibold text-base mb-4">About the writer</h2>
                <div className="flex gap-4 items-start">
                  <img
                    src={book.writer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(book.writer.name)}&background=2a2c33&color=e5e7eb&size=80`}
                    alt={book.writer.name}
                    className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-[#2a2c33]"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">{book.writer.name}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{book.writer.bio}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Reviews */}
            <section>
              <h2 className="text-white font-semibold text-base mb-4">Reviews</h2>
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Write review */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Leave Your Review</span>
                    <span className="text-xs text-gray-500">{reviewText.length}/{MAX_CHARS}</span>
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Placeholder text"
                    rows={6}
                    className="w-full bg-[#1e2026] border border-[#2a2c33] rounded p-3 text-sm text-gray-300 placeholder-gray-600 outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <StarRating value={userRating} interactive onChange={setUserRating} />
                    <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded">
                      Submit →
                    </button>
                  </div>
                </div>

                {/* Existing reviews */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                  {book.reviews?.map((rev) => (
                    <div key={rev.id} className="bg-[#1e2026] border border-[#2a2c33] rounded p-4">
                      <p className="text-white font-semibold text-sm mb-1">{rev.author}</p>
                      <p className="text-xs text-gray-400 leading-relaxed mb-3">{rev.content}</p>
                      <StarRating value={rev.rating} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Related reads sidebar */}
      {related.length > 0 && (
        <aside className="hidden xl:flex flex-col w-72 shrink-0">
          <h2 className="text-white font-semibold text-base mb-4">Related Reads</h2>
          <div className="flex flex-col gap-5">
            {related.map((b) => (
              <BookCard key={b.id} book={{ ...b, customCover: {}, tags: b.category ? [b.category.name] : [] }} onClick={onBookClick} />
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}

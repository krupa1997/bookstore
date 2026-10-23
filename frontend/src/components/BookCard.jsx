import React from 'react';
import BookCoverArt from './BookCoverArt';

export default function BookCard({ book, onClick }) {
  return (
    <div
      className="flex gap-4 cursor-pointer group"
      onClick={() => onClick && onClick(book)}
    >
      {/* Cover */}
      <div className="shrink-0">
        <BookCoverArt book={book} className="w-28 h-40 rounded" />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 min-w-0">
        <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs text-gray-400">
          by{' '}
          <span className="text-blue-400 hover:underline cursor-pointer">
            {book.author}
          </span>
        </p>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {book.description}
        </p>

        <p className="text-xs text-gray-500 mt-1">{book.format}</p>

        {/* Tags */}
        {book.tags?.length > 0 && (
          <p className="text-xs">
            {book.tags.map((tag, i) => (
              <span key={tag}>
                <span className="text-blue-400 hover:underline cursor-pointer">{tag}</span>
                {i < book.tags.length - 1 && (
                  <span className="text-gray-600">, </span>
                )}
              </span>
            ))}
          </p>
        )}

        {/* Price */}
        <p className="text-white font-bold text-base mt-1">₹{book.price}</p>
        <p className="text-xs text-gray-400">
          Delivery by <strong className="text-gray-200">{book.deliveryDate}</strong>
        </p>
      </div>
    </div>
  );
}

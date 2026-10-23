import React from 'react';
import BookCard from './BookCard';

export default function BookSection({ title, books, onBookClick }) {
  if (!books?.length) return null;

  return (
    <section className="mb-10">
      <h2 className="text-white font-semibold text-base mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onClick={onBookClick} />
        ))}
      </div>
    </section>
  );
}

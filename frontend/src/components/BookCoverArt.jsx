import React from 'react';

export default function BookCoverArt({ book, isBack = false, className = "w-32 h-44" }) {
  if (isBack) {
    return (
      <div className={`${className} bg-[#f5d949] text-gray-900 rounded-sm p-4 flex flex-col justify-between shadow-lg text-[10px] leading-tight select-none`}>
        <div className="space-y-2">
          <p className="font-serif italic font-semibold text-center text-xs text-amber-950">
            {book.backCoverQuote || '"A refreshing path to clarity in a cluttered world."'}
          </p>
          <p className="text-[9px] text-gray-800 line-clamp-4 leading-normal">
            {book.fullDescription || book.description}
          </p>
          <div className="border-t border-amber-900/20 pt-1">
            <p className="font-bold text-[8px] uppercase tracking-wider text-gray-900">About the Author</p>
            <p className="text-[8px] text-gray-700 line-clamp-2">
              {book.writer?.bio || "Productivity coach and advocate for intentional living."}
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between pt-2 border-t border-amber-900/30">
          <span className="font-bold text-base font-serif">Q</span>
          <div className="bg-white px-1.5 py-0.5 rounded border border-gray-400 flex flex-col items-center">
            <div className="w-12 h-3 bg-[repeating-linear-gradient(90deg,#000,#000_1px,#fff_1px,#fff_3px)]"></div>
            <span className="text-[6px] tracking-tighter text-gray-600 font-mono">ISBN {book.isbn || '978-0-12345'}</span>
          </div>
        </div>
      </div>
    );
  }

  const theme = book.customCover?.theme || "light";

  if (theme === "yellow") {
    return (
      <div className={`${className} bg-[#fed531] text-gray-900 rounded-sm p-3 flex flex-col justify-between shadow-lg select-none text-center relative overflow-hidden`}>
        <div className="pt-2">
          <h4 className="font-black text-xs uppercase tracking-tight text-gray-900 leading-tight">THE JOY OF</h4>
          <h3 className="font-black text-sm uppercase tracking-tight text-gray-900 leading-tight">MINIMALISM</h3>
        </div>
        <div className="my-auto flex flex-col items-center justify-center">
          <div className="w-4 h-4 bg-amber-100 rounded-full mb-1"></div>
          <div className="w-9 h-9 border-[5px] border-gray-900 border-b-0 rounded-t-full"></div>
          <div className="w-5 h-5 border-[4px] border-gray-900 border-b-0 rounded-t-full -mt-2.5"></div>
        </div>
        <div>
          <p className="font-bold text-[10px] tracking-wider uppercase text-gray-900">{book.author}</p>
          <p className="text-[7px] text-gray-800 line-clamp-2">Simplify your life for greater clarity and happiness</p>
        </div>
      </div>
    );
  }

  if (theme === "light") {
    return (
      <div className={`${className} bg-white text-gray-900 rounded-sm p-3 flex flex-col justify-between shadow-lg select-none text-center`}>
        <div>
          <h4 className="font-black text-xs tracking-tight text-gray-900">THE ART OF</h4>
          <h3 className="font-black text-sm tracking-tight text-gray-900 -mt-0.5">FOCUS</h3>
        </div>
        <div className="my-auto flex justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-red-500 flex items-center justify-center p-1">
            <div className="w-7 h-7 rounded-full border-2 border-red-500 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-[7px] text-gray-600 line-clamp-2">How to Prioritize Your Life for Maximum Productivity</p>
          <p className="font-bold text-[9px] tracking-wider uppercase text-gray-900 mt-1">{book.author}</p>
        </div>
      </div>
    );
  }

  if (theme === "red") {
    return (
      <div className={`${className} bg-[#de3823] text-white rounded-sm p-3 flex flex-col justify-between shadow-lg select-none text-center`}>
        <div>
          <h4 className="font-black text-xs tracking-wider">THE ART</h4>
          <h4 className="font-black text-xs tracking-wider">OF</h4>
          <h3 className="font-black text-xs tracking-widest mt-0.5">LEARNING</h3>
        </div>
        <div className="my-auto flex flex-col items-center">
          <div className="w-6 h-6 rounded-full border-2 border-yellow-300 flex items-center justify-center bg-yellow-400 text-gray-900 text-[10px]">💡</div>
          <div className="w-10 h-3 bg-white/90 rounded-sm mt-1"></div>
        </div>
        <p className="font-bold text-[10px] tracking-wider uppercase">{book.author}</p>
      </div>
    );
  }

  if (theme === "teal") {
    return (
      <div className={`${className} bg-[#196b86] text-white rounded-sm p-3 flex flex-col justify-between shadow-lg select-none text-center relative overflow-hidden`}>
        <div>
          <h4 className="font-black text-[11px] tracking-tight">THE PATH TO</h4>
          <h3 className="font-black text-sm tracking-tight text-yellow-300">SUCCESS</h3>
        </div>
        <div className="my-auto flex flex-col items-center">
          <div className="w-10 h-10 border-b-2 border-r-2 border-yellow-300 rotate-45 transform origin-center"></div>
        </div>
        <p className="font-bold text-[9px] tracking-wider uppercase text-white/90">{book.author}</p>
      </div>
    );
  }

  if (theme === "dark-blue") {
    return (
      <div className={`${className} bg-[#0f2334] text-white rounded-sm p-3 flex flex-col justify-between shadow-lg select-none text-center`}>
        <div>
          <span className="text-[7px] tracking-widest text-teal-300 uppercase">A Novel</span>
          <h4 className="font-serif font-black text-xs tracking-wider mt-0.5">THE</h4>
          <h3 className="font-serif font-black text-xs tracking-widest text-teal-200">MIDNIGHT</h3>
          <h3 className="font-serif font-black text-xs tracking-widest text-teal-200">HOUR</h3>
        </div>
        <div className="my-auto text-xl opacity-75">🏮</div>
        <p className="font-serif text-[9px] tracking-wider uppercase text-teal-100">{book.author}</p>
      </div>
    );
  }

  if (theme === "purple") {
    return (
      <div className={`${className} bg-[#36274e] text-white rounded-sm p-3 flex flex-col justify-between shadow-lg select-none text-center`}>
        <div>
          <h4 className="font-serif text-sm tracking-wide">Beneath</h4>
          <span className="text-[8px] text-pink-300 italic">the</span>
          <h3 className="font-serif font-bold text-xs tracking-widest text-pink-200">STARS</h3>
        </div>
        <div className="my-auto text-xs opacity-75">✨ 👫 ✨</div>
        <div>
          <span className="text-[6px] uppercase tracking-wider text-pink-300">A Romance</span>
          <p className="font-serif text-[8px] uppercase tracking-wider text-pink-100">{book.author}</p>
        </div>
      </div>
    );
  }

  if (theme === "space") {
    return (
      <div className={`${className} bg-[#0b1b36] text-white rounded-sm p-3 flex flex-col justify-between shadow-lg select-none text-center`}>
        <div>
          <h4 className="font-black text-xs tracking-wider">THE</h4>
          <h3 className="font-black text-xs tracking-widest text-yellow-300">FINAL</h3>
          <h3 className="font-black text-xs tracking-widest text-yellow-300">FRONTIER</h3>
        </div>
        <div className="my-auto text-xl">🚀 🪐</div>
        <p className="font-bold text-[8px] tracking-wider uppercase text-yellow-100">{book.author}</p>
      </div>
    );
  }

  if (theme === "mystery") {
    return (
      <div className={`${className} bg-[#18292f] text-white rounded-sm p-3 flex flex-col justify-between shadow-lg select-none text-center`}>
        <div>
          <span className="text-[7px] text-teal-300 uppercase">THE</span>
          <h3 className="font-serif font-bold text-xs text-teal-100 tracking-wider">VANISHING</h3>
          <h3 className="font-serif font-bold text-xs text-teal-100 tracking-wider">HOUSE</h3>
        </div>
        <div className="my-auto text-lg opacity-80">🏚️ 🌕</div>
        <p className="font-serif text-[8px] uppercase tracking-wider text-teal-200">{book.author}</p>
      </div>
    );
  }

  // Fallback (e.g. orange kitten)
  return (
    <div className={`${className} bg-[#ea7a32] text-white rounded-sm p-3 flex flex-col justify-between shadow-lg select-none text-center`}>
      <div>
        <h4 className="font-black text-xs tracking-tight">The Lost</h4>
        <h3 className="font-black text-sm tracking-tight text-amber-200">Kitten</h3>
      </div>
      <div className="my-auto text-2xl">🐱</div>
      <p className="font-bold text-[8px] tracking-wider uppercase text-white/90">{book.author}</p>
    </div>
  );
}

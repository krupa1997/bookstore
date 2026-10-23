import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import CategorySidebar from './components/CategorySidebar';
import FilterBar from './components/FilterBar';
import BookSection from './components/BookSection';
import LoginModal from './components/LoginModal';
import CartDrawer from './components/CartDrawer';
import CheckoutPage from './components/CheckoutPage';
import OrdersPage from './components/OrdersPage';
import WalletPage from './components/WalletPage';
import BookDetailPage from './components/BookDetailPage';
import { catalogApi } from './api/api';
import { MOCK_BOOKS } from './data/mockBooks';
import { Loader2 } from 'lucide-react';

const SECTIONS = [
  { key: 'recommended', title: 'Recommended for You' },
  { key: 'bestsellers', title: 'Bestsellers this Month' },
  { key: 'new-launches', title: 'New Launches' },
];

const DEFAULT_FILTERS = {
  search: '',
  categoryId: '',
  brandId: '',
  language: '',
  format: '',
  sort: '',
  page: 1,
};

function HomePage({ filters, onFilterChange, onBookClick }) {
  const [sections, setSections] = useState(null);  // null = loading
  const [apiError, setApiError] = useState(false);

  const loadFromApi = useCallback(async () => {
    try {
      const [products, recommendations] = await Promise.all([
        catalogApi.getProducts({
          categoryId: filters.categoryId || undefined,
          brandId:    filters.brandId    || undefined,
          search:     filters.search     || undefined,
          page: filters.page,
          limit: 30,
        }),
        catalogApi.getRecommendations().catch(() => ({ items: [] })),
      ]);

      const allItems = products.items ?? [];
      const recItems = recommendations.items ?? recommendations ?? [];

      // Build sections from API data — fall back label assignment by index
      const sectionKeys = ['recommended', 'bestsellers', 'new-launches'];
      const chunkSize = Math.ceil(allItems.length / 3);

      const mapped = {
        recommended: recItems.length > 0 ? recItems : allItems.slice(0, chunkSize),
        bestsellers:  allItems.slice(chunkSize, chunkSize * 2),
        'new-launches': allItems.slice(chunkSize * 2),
      };
      setSections(mapped);
      setApiError(false);
    } catch {
      // Backend not reachable — fall back to static mock data
      setApiError(true);
      const mapped = {};
      SECTIONS.forEach(({ key }) => {
        mapped[key] = MOCK_BOOKS.filter((b) => b.section === key);
      });
      setSections(mapped);
    }
  }, [filters]);

  useEffect(() => { loadFromApi(); }, [loadFromApi]);

  if (!sections) {
    return (
      <div className="flex items-center gap-2 text-gray-400 py-16 justify-center">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-sm">Loading catalog…</span>
      </div>
    );
  }

  return (
    <>
      {apiError && (
        <div className="mb-4 px-3 py-2 bg-yellow-900/30 border border-yellow-700/40 rounded text-xs text-yellow-300">
          Backend unreachable — showing demo data. Start the Spring Boot server at <code>localhost:8080</code>.
        </div>
      )}
      {SECTIONS.map(({ key, title }) => (
        <BookSection
          key={key}
          title={title}
          books={sections[key] ?? []}
          onBookClick={onBookClick}
        />
      ))}
    </>
  );
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activePage, setActivePage]         = useState('home'); // 'home' | 'my-orders' | ...
  const [showLogin, setShowLogin]           = useState(false);
  const [showCart, setShowCart]             = useState(false);
  const [showCheckout, setShowCheckout]     = useState(false);
  const [selectedBook, setSelectedBook]     = useState(null);
  const [filters, setFilters]               = useState(DEFAULT_FILTERS);

  function navigateTo(page) {
    setActivePage(page);
    setSelectedBook(null);
    setShowCheckout(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCategorySelect(cat) {
    setActiveCategory(cat);
    setActivePage('home');
    setFilters((f) => ({ ...f, categoryId: cat === 'All' ? '' : cat, page: 1 }));
  }

  function handleBookClick(book) {
    setSelectedBook(book);
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setSelectedBook(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#121316]">
        <Navbar
          onLoginClick={() => setShowLogin(true)}
          onCartClick={() => setShowCart(true)}
          onNavClick={navigateTo}
          onLogout={() => navigateTo('home')}
          activePage={activePage}
        />

        {/* Sticky filter bar sits just below the fixed navbar */}
        <div className="fixed top-14 left-0 right-0 z-40">
          <FilterBar filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Layout below navbar + filterbar */}
        <div className="flex pt-[112px]">
          {/* Sidebar */}
          <div className="fixed top-[112px] left-0 bottom-0 overflow-y-auto z-30 w-48">
            <CategorySidebar activeCategory={activeCategory} onSelect={handleCategorySelect} />
          </div>

          {/* Main scrollable content */}
          <main className="flex-1 ml-0 md:ml-48 px-6 py-6 min-w-0">
            {activePage === 'my-orders' ? (
              <OrdersPage
                onBack={() => navigateTo('home')}
                onBuyAgainSuccess={() => { navigateTo('home'); setShowCart(true); }}
              />
            ) : activePage === 'my-wallet' ? (
              <WalletPage onBack={() => navigateTo('home')} />
            ) : showCheckout ? (
              <CheckoutPage
                onBack={() => { setShowCheckout(false); setShowCart(true); }}
                onOrderComplete={() => { setShowCheckout(false); navigateTo('my-orders'); }}
              />
            ) : selectedBook ? (
              <BookDetailPage
                book={selectedBook}
                onBookClick={handleBookClick}
                onBack={handleBack}
              />
            ) : (
              <HomePage
                filters={filters}
                onFilterChange={setFilters}
                onBookClick={handleBookClick}
              />
            )}
          </main>
        </div>

        {/* Login modal */}
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

        {/* Cart drawer */}
        {showCart && (
          <CartDrawer
            onClose={() => setShowCart(false)}
            onLoginClick={() => { setShowCart(false); setShowLogin(true); }}
            onCheckout={() => { setShowCart(false); setShowCheckout(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        )}
      </div>
    </AuthProvider>
  );
}

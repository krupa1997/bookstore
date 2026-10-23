export const CATEGORIES = [
  "All",
  "Romance",
  "Mystery",
  "Science Fiction",
  "Fantasy",
  "Historical",
  "Biography",
  "Self-help",
  "Memoir",
  "Travel",
  "Cooking",
  "Children's",
  "Young Adult",
  "Comics & Graphic Novels",
  "Poetry",
  "Drama",
  "Science",
  "Philosophy",
  "Religion",
  "Language Learning"
];

export const MOCK_BOOKS = [
  // Recommended for You
  {
    id: "art-of-focus",
    title: "The Art of Focus",
    author: "Arjun Patel",
    description: "Practical guide to mastering focus & boosting productivity every day.",
    format: "Paperback",
    tags: ["Non-fiction", "Self Help"],
    price: 399,
    deliveryDate: "Mon, 21 Jul",
    section: "recommended",
    coverBg: "bg-white text-gray-900",
    coverImg: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80",
    customCover: {
      title: "THE ART OF FOCUS",
      subtitle: "How to Prioritize Your Life for Maximum Productivity",
      author: "ARJUN PATEL",
      accent: "text-red-500",
      theme: "light",
      target: true
    }
  },
  {
    id: "art-of-learning",
    title: "The Art of Learning",
    author: "Raj Patel",
    description: "Master the mindset and methods for effective lifelong learning.",
    format: "Paperback",
    tags: ["Non-fiction", "Self Help"],
    price: 259,
    deliveryDate: "Mon, 21 Jul",
    section: "recommended",
    coverBg: "bg-red-600 text-white",
    customCover: {
      title: "THE ART OF LEARNING",
      subtitle: "",
      author: "RAJ PATEL",
      theme: "red"
    }
  },
  {
    id: "path-to-success",
    title: "The Path to Success",
    author: "James Wright",
    description: "A practical guide to achieving goals with clarity and confidence.",
    format: "Paperback",
    tags: ["Non-fiction", "Self Help"],
    price: 359,
    deliveryDate: "Mon, 21 Jul",
    section: "recommended",
    coverBg: "bg-cyan-700 text-white",
    customCover: {
      title: "THE PATH TO SUCCESS",
      author: "JAMES WRIGHT",
      theme: "teal"
    }
  },

  // Bestsellers this Month
  {
    id: "the-midnight-hour",
    title: "The Midnight Hour",
    author: "James Adams",
    description: "Haunting tale of a man's journey & the shadows of a forgotten past.",
    format: "Paperback",
    tags: ["Fiction", "Thriller", "Horror"],
    price: 299,
    deliveryDate: "Mon, 21 Jul",
    section: "bestsellers",
    customCover: {
      title: "THE MIDNIGHT HOUR",
      subtitle: "A NOVEL",
      author: "JAMES ADAMS",
      theme: "dark-blue"
    }
  },
  {
    id: "beneath-the-stars",
    title: "Beneath the Stars",
    author: "Jessica Martin",
    description: "A heartwarming tale, where two souls discover who you need.",
    format: "Hard Cover",
    tags: ["Fiction", "Love", "Drama"],
    price: 499,
    deliveryDate: "Mon, 21 Jul",
    section: "bestsellers",
    customCover: {
      title: "Beneath the STARS",
      subtitle: "A ROMANCE",
      author: "JESSICA MARTIN",
      theme: "purple"
    }
  },
  {
    id: "the-final-frontier",
    title: "The Final Frontier",
    author: "Laura Mitchell",
    description: "A mission to space secrets to change humanity forever.",
    format: "Paperback",
    tags: ["Fiction", "Thriller"],
    price: 359,
    deliveryDate: "Mon, 21 Jul",
    section: "bestsellers",
    customCover: {
      title: "THE FINAL FRONTIER",
      author: "LAURA MITCHELL",
      theme: "space"
    }
  },

  // New Launches
  {
    id: "joy-of-minimalism",
    title: "Joy of Minimalism",
    author: "Daniel Reed",
    description: "Declutter your life to uncover peace, clarity, and joy.",
    fullDescription: "Discover how less can truly be more. In The Joy of Minimalism, Daniel Reed guides you through practical strategies to declutter your mind, space, and schedule. Whether you're overwhelmed, over-committed, or just over it—this book offers a calm, mindful approach to building a simpler, more fulfilling life.",
    publisher: "ABC Publishers",
    format: "Paperback",
    tags: ["Non-fiction", "Self Help"],
    price: 149,
    deliveryDate: "Mon, 21 Jul",
    section: "new-launches",
    language: "English",
    rating: 5.0,
    copiesSold: 145,
    customCover: {
      title: "THE JOY OF MINIMALISM",
      subtitle: "Simplify your life for greater clarity and happiness",
      author: "DANIEL REED",
      theme: "yellow"
    },
    backCoverQuote: "\"A refreshing path to clarity in a cluttered world.\"",
    isbn: "978-0-123456-78-9",
    writer: {
      name: "Daniel Reed",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      bio: "Daniel Reed is a writer, minimalist, and productivity coach based in San Francisco. With a passion for intentional living, Daniel has dedicated his career to helping individuals simplify their lives — one habit, one space, and one thought at a time. He is the author of The Joy of Minimalism, an acclaimed guide to decluttering both physically and mentally. His other works include Less, But Better and The Focus Reset, which have helped thousands rethink consumerism, prioritize what truly matters, and build sustainable systems for personal growth."
    },
    reviews: [
      {
        id: "rev-1",
        author: "John Smith",
        rating: 5,
        content: "The accordion component delivers large amounts of content in a small space through progressive disclosure. The user gets key details about the underlying content and can choose to expand that content within the constraints of the accordion."
      }
    ]
  },
  {
    id: "the-vanishing-house",
    title: "The Vanishing House",
    author: "Clara Nelson",
    description: "A chilling mystery unfolds within a house that disappears.",
    format: "eBook",
    tags: ["Fiction", "Horror"],
    price: 99,
    deliveryDate: "Mon, 21 Jul",
    section: "new-launches",
    customCover: {
      title: "THE VANISHING HOUSE",
      author: "CLARA NELSON",
      theme: "mystery"
    }
  },
  {
    id: "the-lost-kitten",
    title: "The Lost Kitten",
    author: "Emilly Parker",
    description: "A heartwarming tale of courage, friendship, and feline adventure.",
    format: "Hardcover",
    tags: ["Fiction", "Children"],
    price: 339,
    deliveryDate: "Mon, 21 Jul",
    section: "new-launches",
    customCover: {
      title: "The Lost Kitten",
      author: "EMILY PARKER",
      theme: "orange-kitten"
    }
  }
];

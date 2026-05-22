export const SITE_URL = 'https://listnrent.com'
export const BRAND_NAME = 'ListnRent'
export const SITE_LOGO_URL = `${SITE_URL}/apple-touch-icon.png`

export const homeSeo = {
  path: '/',
  title: 'Clothes on Rent in Mumbai',
  metaTitle: 'Clothes on Rent in Mumbai | Lehenga, Saree & Sherwani Rentals',
  description:
    'Rent designer ethnic wear in Mumbai for weddings, parties, festivals, and special occasions. Browse lehengas, sarees, sherwanis, and list your outfits to earn.',
  keywords:
    'clothes on rent in Mumbai, designer clothes on rent Mumbai, ethnic wear rental Mumbai, lehenga on rent Mumbai, saree on rent Mumbai, sherwani on rent Mumbai, wedding outfits on rent Mumbai',
}

export const collectionSeo = {
  path: '/collection',
  title: 'Rent Ethnic Wear in Mumbai',
  metaTitle: 'Rent Ethnic Wear in Mumbai | Lehengas, Sarees, Sherwanis & Party Wear',
  description:
    'Browse dry-cleaned outfits for rent in Mumbai. Filter by occasion, size, category, gender, and price on ListnRent.',
  keywords:
    'rent ethnic wear Mumbai, outfit rental Mumbai, wedding outfit rental, party wear rental Mumbai, rent clothes online Mumbai',
}

export const seoLandingPages = [
  {
    slug: 'clothes-on-rent-mumbai',
    path: '/clothes-on-rent-mumbai',
    title: 'Clothes on Rent in Mumbai',
    metaTitle: 'Clothes on Rent in Mumbai | Designer Outfit Rentals',
    description:
      'Rent designer clothes in Mumbai for weddings, sangeet, parties, festivals, and formal events. Browse verified ethnic wear with doorstep delivery and easy returns.',
    keywords:
      'clothes on rent in Mumbai, designer clothes on rent in Mumbai, rent clothes online Mumbai, outfit rental Mumbai, fashion rental Mumbai',
    eyebrow: 'Mumbai Outfit Rentals',
    lead:
      'Find occasion-ready outfits without buying something you may wear once. ListnRent helps you rent premium ethnic wear, formal wear, and party wear across Mumbai.',
    filters: {},
    highlights: [
      'Verified outfits with photos, measurements, pricing, and owner details',
      'Wedding, festival, party, and formal styles for men and women',
      'A sustainable way to access premium fashion for important moments',
    ],
    sections: [
      {
        heading: 'Rent for every occasion',
        body:
          'Browse lehengas, sarees, sherwanis, tuxedos, jodhpuris, kurta jackets, blazers, and Navratri outfits for the events that fill Mumbai calendars.',
      },
      {
        heading: 'List your wardrobe and earn',
        body:
          'Have designer or premium ethnic outfits sitting unused? Create a listing, add photos and measurements, set your rental price, and make your wardrobe work harder.',
      },
    ],
    faqs: [
      {
        question: 'Can I rent clothes online in Mumbai?',
        answer:
          'Yes. You can browse outfits on ListnRent, check size and measurement details, choose dates, and book clothing rentals online in Mumbai.',
      },
      {
        question: 'What types of clothes are available for rent?',
        answer:
          'ListnRent supports ethnic wear, wedding outfits, party wear, formal suits, sherwanis, sarees, lehengas, jodhpuris, kurta jackets, and more.',
      },
    ],
    related: ['lehenga-on-rent-mumbai', 'sherwani-on-rent-mumbai', 'wedding-outfits-on-rent-mumbai'],
  },
  {
    slug: 'lehenga-on-rent-mumbai',
    path: '/lehenga-on-rent-mumbai',
    title: 'Lehenga on Rent in Mumbai',
    metaTitle: 'Lehenga on Rent in Mumbai | Bridal & Party Lehenga Rentals',
    description:
      'Rent bridal, sangeet, mehendi, festive, and party lehengas in Mumbai. Compare styles, sizes, rental prices, and availability on ListnRent.',
    keywords:
      'lehenga on rent Mumbai, bridal lehenga on rent Mumbai, designer lehenga rental Mumbai, party wear lehenga rent Mumbai, wedding lehenga rental',
    eyebrow: 'Lehenga Rentals',
    lead:
      'Choose a lehenga for weddings, sangeet nights, receptions, festive functions, and statement party looks without paying the full purchase price.',
    filters: { category: ['LEHENGA'] },
    highlights: [
      'Great for bridal guests, bridesmaids, engagement events, and sangeet nights',
      'Filter by size, price, location, and availability',
      'Measurement details help reduce fit uncertainty before you book',
    ],
    sections: [
      {
        heading: 'Bridal and wedding guest lehengas',
        body:
          'Target heavily embroidered styles for grand events, lighter festive lehengas for mehendi, and elegant silhouettes for receptions or cocktail nights.',
      },
      {
        heading: 'How to choose a rental lehenga',
        body:
          'Check waist, bust, blouse, and length measurements. Compare rental duration, deposit, pickup or delivery, and whether the piece suits your venue and event timing.',
      },
    ],
    faqs: [
      {
        question: 'Is renting a lehenga cheaper than buying?',
        answer:
          'For one-time occasions, renting usually costs much less than buying a designer lehenga and avoids long-term storage and repeat-wear concerns.',
      },
      {
        question: 'Can I rent a lehenga for sangeet or mehendi?',
        answer:
          'Yes. ListnRent is suited for sangeet, mehendi, reception, wedding guest, festive, and party lehenga rentals in Mumbai.',
      },
    ],
    related: ['saree-on-rent-mumbai', 'wedding-outfits-on-rent-mumbai', 'party-wear-on-rent-mumbai'],
  },
  {
    slug: 'saree-on-rent-mumbai',
    path: '/saree-on-rent-mumbai',
    title: 'Saree on Rent in Mumbai',
    metaTitle: 'Saree on Rent in Mumbai | Designer Saree Rentals',
    description:
      'Rent designer sarees in Mumbai for weddings, festivals, receptions, farewells, and parties. Browse premium saree rentals by style, price, and size.',
    keywords:
      'saree on rent Mumbai, designer saree rental Mumbai, wedding saree on rent, party wear saree rent Mumbai, silk saree rental',
    eyebrow: 'Saree Rentals',
    lead:
      'Rent sarees for wedding functions, festive days, receptions, and elegant evening events while keeping your wardrobe light and your look fresh.',
    filters: { category: ['SAREE'] },
    highlights: [
      'Ideal for weddings, festivals, receptions, farewells, and formal celebrations',
      'Browse rich silks, embroidered looks, party sarees, and traditional styles',
      'Rent premium sarees without buying for a single event',
    ],
    sections: [
      {
        heading: 'Wedding and festive saree rentals',
        body:
          'Look for color, fabric, work, drape style, blouse fit, and rental timing. Sarees are especially strong for multi-event wedding weeks and cultural celebrations.',
      },
      {
        heading: 'A smarter wardrobe choice',
        body:
          'Renting a saree helps you try premium styles for important events while reducing textile waste and repeat-purchase pressure.',
      },
    ],
    faqs: [
      {
        question: 'Can I rent sarees for festivals in Mumbai?',
        answer:
          'Yes. You can rent sarees for festivals, weddings, receptions, formal gatherings, and parties in Mumbai through ListnRent.',
      },
      {
        question: 'What should I check before renting a saree?',
        answer:
          'Review fabric, blouse details, length, condition, rental price, deposit, delivery options, and owner notes before booking.',
      },
    ],
    related: ['lehenga-on-rent-mumbai', 'ethnic-wear-on-rent-mumbai', 'wedding-outfits-on-rent-mumbai'],
  },
  {
    slug: 'sherwani-on-rent-mumbai',
    path: '/sherwani-on-rent-mumbai',
    title: 'Sherwani on Rent in Mumbai',
    metaTitle: 'Sherwani on Rent in Mumbai | Groom & Wedding Sherwani Rentals',
    description:
      'Rent sherwanis, indo-western outfits, jodhpuris, and kurta jackets in Mumbai for weddings, receptions, sangeet, and festive occasions.',
    keywords:
      'sherwani on rent Mumbai, groom sherwani rent Mumbai, indo western on rent Mumbai, jodhpuri on rent Mumbai, men ethnic wear rental Mumbai',
    eyebrow: 'Sherwani Rentals',
    lead:
      "Rent men's ethnic wear in Mumbai for weddings, reception nights, festive events, and formal family functions with sizing and pricing upfront.",
    filters: { category: ['INDO-WESTERN/ SHERWANI'], gender: ['Male'] },
    highlights: [
      'Strong options for grooms, groomsmen, brothers, and wedding guests',
      'Includes sherwanis, indo-westerns, jodhpuris, kurta jackets, and formal suits',
      'Compare price per day, deposit, measurements, and location before booking',
    ],
    sections: [
      {
        heading: "Wedding-ready men's ethnic wear",
        body:
          'Sherwanis and indo-westerns are ideal for wedding ceremonies, receptions, engagements, sangeet nights, and festive family celebrations.',
      },
      {
        heading: 'Fit matters most',
        body:
          'Before booking, check chest, shoulder, waist, sleeve, and length measurements. Fit notes and owner details help you choose confidently.',
      },
    ],
    faqs: [
      {
        question: 'Can grooms rent sherwanis in Mumbai?',
        answer:
          "Yes. ListnRent supports sherwani and men's ethnic wear rentals for grooms, groomsmen, family members, and wedding guests in Mumbai.",
      },
      {
        question: 'Are indo-western outfits available for rent?',
        answer:
          'Yes. You can browse indo-westerns, sherwanis, jodhpuris, kurta jackets, blazers, tuxedos, and formal suits.',
      },
    ],
    related: ['wedding-outfits-on-rent-mumbai', 'ethnic-wear-on-rent-mumbai', 'clothes-on-rent-mumbai'],
  },
  {
    slug: 'wedding-outfits-on-rent-mumbai',
    path: '/wedding-outfits-on-rent-mumbai',
    title: 'Wedding Outfits on Rent in Mumbai',
    metaTitle: 'Wedding Outfits on Rent in Mumbai | Lehenga, Saree & Sherwani Rentals',
    description:
      'Rent wedding outfits in Mumbai for brides, grooms, family, and guests. Browse lehengas, sarees, sherwanis, jodhpuris, and party wear.',
    keywords:
      'wedding outfits on rent Mumbai, wedding clothes on rent Mumbai, marriage clothes on rent Mumbai, bridal lehenga rent Mumbai, groom sherwani rent Mumbai',
    eyebrow: 'Wedding Rentals',
    lead:
      'Dress for every wedding function without buying a new outfit for each event. Find rentals for ceremony, mehendi, sangeet, reception, and cocktail nights.',
    filters: { occasion: ['Wedding'] },
    highlights: [
      'Wedding guest, family, bride-side, groom-side, and couple outfit options',
      'Shop by occasion, category, gender, price, size, and location',
      'Designed for high-value outfits that are often worn only once',
    ],
    sections: [
      {
        heading: 'One wedding week, many looks',
        body:
          'Rent a different look for mehendi, sangeet, reception, and the main ceremony without locking money into multiple rarely-worn outfits.',
      },
      {
        heading: 'Perfect for Mumbai wedding calendars',
        body:
          'Mumbai weddings move fast. Browse online, shortlist by size and location, and book looks that fit your function schedule.',
      },
    ],
    faqs: [
      {
        question: 'What wedding outfits can I rent?',
        answer:
          'You can rent lehengas, sarees, sherwanis, jodhpuris, indo-westerns, kurta jackets, designer suits, and party wear.',
      },
      {
        question: 'Can wedding guests rent outfits too?',
        answer:
          'Yes. Wedding guests, family members, bridesmaids, groomsmen, brides, and grooms can all use ListnRent to find occasion wear.',
      },
    ],
    related: ['lehenga-on-rent-mumbai', 'sherwani-on-rent-mumbai', 'saree-on-rent-mumbai'],
  },
  {
    slug: 'party-wear-on-rent-mumbai',
    path: '/party-wear-on-rent-mumbai',
    title: 'Party Wear on Rent in Mumbai',
    metaTitle: 'Party Wear on Rent in Mumbai | Designer Party Outfit Rentals',
    description:
      'Rent party wear in Mumbai for cocktail nights, receptions, birthdays, festive parties, and evening events. Browse designer outfits by price and size.',
    keywords:
      'party wear on rent Mumbai, party dress rental Mumbai, designer party outfit rent Mumbai, cocktail outfit rental Mumbai, rent party clothes Mumbai',
    eyebrow: 'Party Wear Rentals',
    lead:
      'Find high-impact party outfits for birthdays, cocktails, reception nights, festive parties, and evening celebrations without buying a new look every time.',
    filters: { occasion: ['Parties'] },
    highlights: [
      'Great for cocktail events, receptions, birthdays, and festive parties',
      'Rent statement pieces for a fraction of retail purchase cost',
      'Refresh your look for every event while keeping your wardrobe minimal',
    ],
    sections: [
      {
        heading: 'Rent statement looks',
        body:
          'Party wear rentals are ideal for trend-led outfits, bold colors, sequins, evening gowns, indo-westerns, and formal pieces that you may not repeat often.',
      },
      {
        heading: 'Plan around your dates',
        body:
          'Check event dates, rental duration, deposits, and returns before booking so your outfit is ready when the celebration starts.',
      },
    ],
    faqs: [
      {
        question: 'Can I rent party wear for one night?',
        answer:
          'Rental duration depends on the listing, but party wear rentals are designed for short-term occasions and special events.',
      },
      {
        question: 'Is party wear available for men and women?',
        answer:
          'Yes. ListnRent includes party and formal outfits for both men and women, depending on current listings.',
      },
    ],
    related: ['clothes-on-rent-mumbai', 'wedding-outfits-on-rent-mumbai', 'ethnic-wear-on-rent-mumbai'],
  },
  {
    slug: 'ethnic-wear-on-rent-mumbai',
    path: '/ethnic-wear-on-rent-mumbai',
    title: 'Ethnic Wear on Rent in Mumbai',
    metaTitle: 'Ethnic Wear on Rent in Mumbai | Saree, Lehenga & Sherwani Rentals',
    description:
      'Rent ethnic wear in Mumbai for weddings, festivals, Navratri, parties, and family functions. Browse sarees, lehengas, sherwanis, and traditional outfits.',
    keywords:
      'ethnic wear on rent Mumbai, traditional wear rental Mumbai, Indian clothes on rent Mumbai, festive wear rental Mumbai, Navratri outfits on rent',
    eyebrow: 'Ethnic Wear Rentals',
    lead:
      'Rent Indian ethnic wear for the occasions that deserve something special: weddings, festivals, Navratri nights, family functions, and formal celebrations.',
    filters: {},
    highlights: [
      'Sarees, lehengas, sherwanis, jodhpuris, kurta jackets, and more',
      'Useful for weddings, festivals, parties, and cultural occasions',
      'A circular-fashion alternative to buying occasional wear repeatedly',
    ],
    sections: [
      {
        heading: 'Traditional styles, modern convenience',
        body:
          'Browse ethnic outfits online, compare details, and choose pieces that match your function, size, and budget.',
      },
      {
        heading: 'Better for your wardrobe and the planet',
        body:
          'Renting helps reduce single-use fashion purchases and gives premium occasion wear more life across Mumbai celebrations.',
      },
    ],
    faqs: [
      {
        question: 'What ethnic wear can I rent in Mumbai?',
        answer:
          'You can rent sarees, lehengas, sherwanis, jodhpuris, kurta jackets, Navratri outfits, designer suits, and other traditional styles.',
      },
      {
        question: 'Is ethnic wear rental suitable for festivals?',
        answer:
          'Yes. Ethnic wear rentals work well for Navratri, Diwali, family functions, weddings, and festive parties.',
      },
    ],
    related: ['saree-on-rent-mumbai', 'lehenga-on-rent-mumbai', 'sherwani-on-rent-mumbai'],
  },
]

export const seoLandingPageMap = seoLandingPages.reduce((acc, page) => {
  acc[page.slug] = page
  return acc
}, {})

export const getSeoLandingPage = (slug) => seoLandingPageMap[slug] || null

export const getRelatedSeoPages = (page) =>
  (page?.related || [])
    .map((slug) => getSeoLandingPage(slug))
    .filter(Boolean)

import React from 'react'
import { Link } from 'react-router-dom'
import { CLOUDINARY_IMAGES } from '../../constants/imageConstants'

const CuratedOccasionsSection = () => {
  const occasionsData = [
    {
      id: 'weddings',
      title: 'Weddings',
      subtitle: 'Glamorous for the big day',
      icon: '💍',
      bgImage: CLOUDINARY_IMAGES.WEDDING,
      link: '/collection?occasion=Wedding',
    },
    {
      id: 'parties',
      title: 'Parties',
      subtitle: 'Chic looks & cocktail wear',
      icon: '🎉',
      bgImage: CLOUDINARY_IMAGES.PARTIES,
      link: '/collection?occasion=Parties',
    },
    {
      id: 'festivals',
      title: 'Festivals',
      subtitle: 'Vibrant looks you need',
      icon: '✨',
      bgImage: CLOUDINARY_IMAGES.FESTIVALS,
      link: '/collection?occasion=Festivals',
    },
  ]

  return (
    <section className="py-16 px-6 bg-[#FDFAF7]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4 text-center"
          style={{ fontFamily: "'Georgia', serif" }}>
          Curated Occasions
        </h2>
        <p className="text-center text-[#666] mb-12 max-w-2xl mx-auto">
          Find the perfect silhouette for every celebration.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {occasionsData.map((occasion) => (
            <Link
              key={occasion.id}
              to={occasion.link}
              className="group relative overflow-hidden rounded-2xl h-100 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
              style={{
                backgroundImage: `url('${occasion.bgImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Background overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                <div className="text-4xl mb-3">{occasion.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: "'Georgia', serif" }}>
                  {occasion.title}
                </h3>
                <p className="text-white/90 text-sm">{occasion.subtitle}</p>
              </div>

              {/* Hover Effect */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-white text-xl">→</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CuratedOccasionsSection

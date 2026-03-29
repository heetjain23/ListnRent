import React from 'react'

const SeamlessJourneySection = () => {
  const steps = [
    {
      id: 1,
      icon: '📤',
      title: 'Share',
      description: 'Upload your curated wardrobe pieces with style',
    },
    {
      id: 2,
      icon: '🔍',
      title: 'Discover',
      description: 'Discover exquisite designer looks curated by the best in town',
    },
    {
      id: 3,
      icon: '🎀',
      title: 'Rent',
      description: 'Select your dates and get high-quality garments delivered',
    },
    {
      id: 4,
      icon: '↩️',
      title: 'Return',
      description: 'Hassle-free returns with dry cleaning included in the plan',
    },
  ]

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4 text-center"
          style={{ fontFamily: "'Georgia', serif" }}>
          A Seamless Journey
        </h2>
        <p className="text-center text-[#666] mb-14 max-w-2xl mx-auto">
          Accessing luxury should be as effortless as wearing it.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Step Number Circle */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#00342B] to-[#00695C]
                  flex items-center justify-center text-3xl shadow-md">
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2"
                  style={{ fontFamily: "'Georgia', serif" }}>
                  {step.title}
                </h3>
                <p className="text-[#666] text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector Line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/4 -right-4 w-8 h-1 bg-linear-to-r from-[#D4AF37] to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SeamlessJourneySection

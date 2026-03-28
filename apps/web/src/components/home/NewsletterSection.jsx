import React, { useState } from 'react'

const NewsletterSection = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Implement newsletter subscription logic later
    setTimeout(() => {
      setIsLoading(false)
      setEmail('')
    }, 500)
  }

  return (
    <section className="py-20 px-6 bg-[#004D40]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-12" style={{ fontFamily: "'Georgia', serif" }}>
              Elegance with a Conscience.
            </h2>

            {/* Feature 1 */}
            <div className="mb-10">
              <div className="flex items-start">
                <div className="text-yellow-500 text-2xl mr-4 mt-1">🌿</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Sustainability at Core</h3>
                  <p className="text-gray-200">
                    By choosing to rent, you are participating in a circular fashion economy, reducing waste and the environmental impact of one-time wear pieces.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div>
              <div className="flex items-start">
                <div className="text-yellow-500 text-2xl mr-4 mt-1">✓</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Verified Heritage</h3>
                  <p className="text-gray-200">
                    Every piece on RentFit undergoes a rigorous authentication and quality check. We ensure your luxury experience is flawless.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Newsletter Form */}
          <div className="bg-[#F5F0EB] rounded-2xl p-8 md:p-10">
            <h3 className="text-2xl font-extrabold text-[#004D40] mb-4" style={{ fontFamily: "'Georgia', serif" }}>
              Join the Atelier
            </h3>
            <p className="text-gray-700 mb-8">
              Sign up to receive exclusive early access to new designer drops and sustainable styling tips.
            </p>

            <form onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:border-[#004D40] bg-white text-gray-900"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#004D40] text-white font-bold py-3 rounded-lg hover:bg-[#154a4b] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Subscribing...' : 'SUBSCRIBE'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NewsletterSection

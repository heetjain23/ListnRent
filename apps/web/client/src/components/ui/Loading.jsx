import React from 'react'
import { Skeleton } from 'boneyard-js/react'

const skeletonFrames = {
  page: (
    <div className="w-full max-w-md mx-auto rounded-4xl border border-[#E8E0D5] bg-white p-8 shadow-sm space-y-4">
      <div className="h-4 w-32 rounded-full bg-[#EFE8DE] animate-pulse" />
      <div className="h-10 w-3/4 rounded-full bg-[#EFE8DE] animate-pulse" />
      <div className="h-4 w-full rounded-full bg-[#F1EBDD] animate-pulse" />
      <div className="h-4 w-5/6 rounded-full bg-[#F1EBDD] animate-pulse" />
      <div className="mt-6 h-12 rounded-full bg-[#EFE8DE] animate-pulse" />
    </div>
  ),
  dashboard: (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="flex gap-6 xl:gap-8 items-start">
        <div className="hidden lg:block w-64 xl:w-72 shrink-0 h-[calc(100vh-80px)] rounded-2xl border border-[#E8E0D5] bg-white/80 p-4 space-y-4">
          <div className="h-16 rounded-xl bg-[#EFE8DE] animate-pulse" />
          <div className="h-12 rounded-xl bg-[#EFE8DE] animate-pulse" />
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-11 rounded-xl bg-[#F3ECE2] animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-6">
          <div className="rounded-4xl border border-[#E8E0D5] bg-white/85 p-6 space-y-4 shadow-sm">
            <div className="h-4 w-28 rounded-full bg-[#EFE8DE] animate-pulse" />
            <div className="h-10 w-72 max-w-full rounded-full bg-[#EFE8DE] animate-pulse" />
            <div className="h-4 w-96 max-w-full rounded-full bg-[#F1EBDD] animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-2xl border border-[#E8E0D5] bg-white/85 p-5 shadow-sm space-y-3">
                <div className="h-4 w-20 rounded-full bg-[#EFE8DE] animate-pulse" />
                <div className="h-10 rounded-full bg-[#EFE8DE] animate-pulse" />
                <div className="h-3 w-32 rounded-full bg-[#F1EBDD] animate-pulse" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
            <div className="rounded-4xl border border-[#E8E0D5] bg-white/85 p-6 shadow-sm space-y-4">
              <div className="h-5 w-40 rounded-full bg-[#EFE8DE] animate-pulse" />
              <div className="h-64 rounded-3xl bg-[#EFE8DE] animate-pulse" />
            </div>
            <div className="rounded-4xl border border-[#E8E0D5] bg-white/85 p-6 shadow-sm space-y-4">
              <div className="h-5 w-36 rounded-full bg-[#EFE8DE] animate-pulse" />
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-14 rounded-2xl bg-[#EFE8DE] animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  cart: (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pt-28 pb-24">
      <div className="mb-8 space-y-3">
        <div className="h-10 w-56 rounded-full bg-[#E8E0D5] animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded-full bg-[#ECE4D8] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 xl:gap-12 items-start">
        <div className="space-y-5">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-3xl border border-[#E8E0D5] bg-white/80 p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="h-28 w-24 rounded-2xl bg-[#EFE8DE] animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-2/3 rounded-full bg-[#EFE8DE] animate-pulse" />
                  <div className="h-3 w-1/2 rounded-full bg-[#F1EBDD] animate-pulse" />
                  <div className="h-3 w-5/6 rounded-full bg-[#F1EBDD] animate-pulse" />
                  <div className="flex gap-2 pt-4">
                    <div className="h-8 w-24 rounded-full bg-[#EFE8DE] animate-pulse" />
                    <div className="h-8 w-20 rounded-full bg-[#EFE8DE] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-4xl border border-[#E8E0D5] bg-white/85 p-6 shadow-sm space-y-4">
          <div className="h-5 w-40 rounded-full bg-[#EFE8DE] animate-pulse" />
          <div className="h-12 rounded-2xl bg-[#EFE8DE] animate-pulse" />
          <div className="h-12 rounded-2xl bg-[#EFE8DE] animate-pulse" />
          <div className="h-16 rounded-2xl bg-[#EFE8DE] animate-pulse" />
        </div>
      </div>
    </div>
  ),
}

const Loading = ({ message = 'Loading...', fullScreen = true, variant = 'page' }) => {
  const frame = skeletonFrames[variant] || skeletonFrames.page

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Skeleton name={`client-loading-${variant}`} loading={true} fixture={frame}>
        {frame}
      </Skeleton>
      {message && <p className="text-[#666] text-center text-sm">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 pt-20">
        <div className="text-center w-full">{content}</div>
      </div>
    )
  }

  return content
}

export default Loading

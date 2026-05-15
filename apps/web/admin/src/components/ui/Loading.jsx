import React from 'react'
import { Skeleton } from 'boneyard-js/react'

const skeletonFrames = {
  page: (
    <div className="w-full max-w-md mx-auto rounded-4xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
      <div className="h-4 w-32 rounded-full bg-slate-200 animate-pulse" />
      <div className="h-10 w-3/4 rounded-full bg-slate-200 animate-pulse" />
      <div className="h-4 w-full rounded-full bg-slate-100 animate-pulse" />
      <div className="h-4 w-5/6 rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-6 h-12 rounded-full bg-slate-200 animate-pulse" />
    </div>
  ),
  table: (
    <div className="w-full rounded-4xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="h-4 w-40 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-9 w-28 rounded-full bg-slate-200 animate-pulse" />
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="col-span-2 h-3 rounded-full bg-slate-100 animate-pulse" />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="grid grid-cols-12 gap-3 items-center rounded-xl border border-slate-100 p-3">
            <div className="col-span-1 h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
            <div className="col-span-3 h-3 rounded-full bg-slate-200 animate-pulse" />
            <div className="col-span-3 h-3 rounded-full bg-slate-100 animate-pulse" />
            <div className="col-span-2 h-3 rounded-full bg-slate-100 animate-pulse" />
            <div className="col-span-2 h-3 rounded-full bg-slate-100 animate-pulse" />
            <div className="col-span-1 h-8 rounded-full bg-slate-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  ),
}

const Loading = ({ message = 'Loading...', fullScreen = true, variant = 'page' }) => {
  const frame = skeletonFrames[variant] || skeletonFrames.page

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Skeleton name={`admin-loading-${variant}`} loading={true} fixture={frame}>
        {frame}
      </Skeleton>
      {message && <p className="text-slate-600 text-center text-sm">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-20">
        <div className="w-full text-center">{content}</div>
      </div>
    )
  }

  return content
}

export default Loading
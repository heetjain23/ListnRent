export const getBadgeClass = (badge) => {
  if (badge.includes('PICKUP') && !badge.includes('RETURN')) {
    return 'inline-flex rounded-full bg-[#d8d9cf] px-2.5 py-1 text-[11px] font-bold text-[#5c635e]'
  }

  if (badge.includes('RETURN')) {
    return 'inline-flex rounded-full bg-[#ffd6d6] px-2.5 py-1 text-[11px] font-bold text-[#bf4a4a]'
  }

  return 'inline-flex rounded-full bg-[#f2d15b] px-2.5 py-1 text-[11px] font-bold text-[#78641a]'
}

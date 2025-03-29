import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatAddress = (address, subLength = 6) => {
  if (!address || address.length < 20 || subLength === address?.length) {
    return address
  }
  const length = address.length
  return `${address.slice(0, Math.min(subLength, length))}...${address.slice(length - Math.min(subLength, length), length)}`
}

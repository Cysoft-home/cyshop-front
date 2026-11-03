// Cloudinary resizes and compresses images from its own servers, so we ask it for the
// size we need instead of making Next.js do the work again.
export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    return src.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
  }
  // Local development: the Django server hands out the original file.
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}
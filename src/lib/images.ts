/** A 1200x630 version of a product photo, the size WhatsApp and Facebook previews use. */
export function shareImageUrl(url: string): string {
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/f_jpg,q_auto,c_fill,w_1200,h_630/");
  }
  return url;
}
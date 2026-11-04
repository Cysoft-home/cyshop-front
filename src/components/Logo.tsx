import Image from "next/image";

// The CyShop logo. Use `reversed` on dark backgrounds.
// On phones the header shows the symbol alone to save room.
export function Logo({
  reversed = false,
  compactOnPhone = false,
}: {
  reversed?: boolean;
  compactOnPhone?: boolean;
}) {
  const full = reversed ? "/cyshop-logo-reversed.svg" : "/cyshop-logo.svg";
  return (
    <>
      <Image
        src={full}
        alt="CyShop"
        width={148}
        height={40}
        unoptimized
        priority
        className={`h-9 w-auto ${compactOnPhone ? "hidden sm:block" : ""}`}
      />
      {compactOnPhone && (
        <Image
          src="/cyshop-mark.svg"
          alt="CyShop"
          width={36}
          height={36}
          unoptimized
          priority
          className="h-9 w-9 sm:hidden"
        />
      )}
    </>
  );
}
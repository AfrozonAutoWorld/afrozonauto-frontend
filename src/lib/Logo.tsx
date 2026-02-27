import type { ImgHTMLAttributes } from 'react';

/** Logo from public/logo_image.svg (40×41). Public folder is at project root; file is served as /logo_image.svg */
const LOGO_SRC = '/logo_image.svg';

export function Logo({
  className,
  width = 40,
  height = 41,
  alt = 'Afrozon',
  src = LOGO_SRC,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
}

declare module "imagemin-mozjpeg" {
  export interface MozjpegOptions {
    [key: string]: unknown;
  }

  const plugin: (options?: MozjpegOptions) => unknown;
  export default plugin;
}

declare module "imagemin-gifsicle" {
  export interface GifsicleOptions {
    [key: string]: unknown;
  }

  const plugin: (options?: GifsicleOptions) => unknown;
  export default plugin;
}

declare module "imagemin-svgo" {
  export interface SvgoOptions {
    [key: string]: unknown;
  }

  const plugin: (options?: SvgoOptions) => unknown;
  export default plugin;
}

declare module "imagemin-webp" {
  export interface WebpOptions {
    [key: string]: unknown;
  }

  const plugin: (options?: WebpOptions) => unknown;
  export default plugin;
}

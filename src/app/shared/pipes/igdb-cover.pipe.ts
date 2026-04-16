import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'igdbCover', standalone: true })
export class IgdbCoverPipe implements PipeTransform {
  transform(url: string | null | undefined, size: 'small' | 'big' = 'big'): string | null {
    if (!url) return null;
    if (!url.includes('images.igdb.com')) return url;
    const token = size === 'small' ? 't_cover_small' : 't_cover_big';
    return url.replace(/\/t_[^/]+\//, `/${token}/`);
  }
}

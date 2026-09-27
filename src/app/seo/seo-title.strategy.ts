import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { PageSeo, SEO_ROUTE_DATA_KEY } from './seo.model';
import { SeoService } from './seo.service';

/**
 * Hooks the SEO contract into the router: `updateTitle` runs after every successful navigation
 * — the build-time prerender's initial navigation included, which is what bakes the tags into
 * each static HTML file. A route declares `title` as usual and `data: { seo: PageSeo }` for the
 * rest (the deepest route carrying `seo` wins, so a parent can set defaults for its children).
 */
@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot) ?? '';
    const seo = this.pageSeo(snapshot.root);
    this.seo.apply({ ...seo, title: seo.title ?? title }, snapshot.url);
  }

  private pageSeo(root: ActivatedRouteSnapshot): PageSeo {
    let seo: PageSeo = {};
    for (let route: ActivatedRouteSnapshot | null = root; route; route = route.firstChild) {
      const data = route.data[SEO_ROUTE_DATA_KEY] as PageSeo | undefined;
      if (data) {
        seo = data;
      }
    }
    return seo;
  }
}

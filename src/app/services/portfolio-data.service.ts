import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { PortfolioData, Project, Skill, SkillCategory } from '../models/portfolio-data.model';

const DATA_URL = 'assets/data/portfolio.json';

/**
 * Single access point for Skills and Projects content.
 *
 * Today this reads the static JSON asset at `assets/data/portfolio.json`. Every component reads
 * through the methods below rather than the file directly, so moving to a real backend later is a
 * one-line change here (point `DATA_URL` at an API endpoint, or replace the `http.get` with
 * whatever call the API needs) — no component changes required.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioDataService {
  private readonly http = inject(HttpClient);

  // Fetched once and replayed: Hero and Skills both read the skills half of this without
  // triggering a second request.
  private readonly data$: Observable<PortfolioData> = this.http
    .get<PortfolioData>(DATA_URL)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getSkillCategories(): Observable<SkillCategory[]> {
    return this.data$.pipe(map((data) => data.skills.categories));
  }

  /** The subset of skills (from `getSkillCategories`) featured as chips in the hero. */
  getHeroHighlights(): Observable<Skill[]> {
    return this.data$.pipe(
      map((data) => {
        const byName = new Map(
          data.skills.categories.flatMap((category) => category.skills).map((skill) => [skill.name, skill]),
        );
        return data.skills.heroHighlights
          .map((name) => byName.get(name))
          .filter((skill): skill is Skill => skill !== undefined);
      }),
    );
  }

  getProjectCategories(): Observable<string[]> {
    return this.data$.pipe(map((data) => data.projects.categories));
  }

  getProjects(): Observable<Project[]> {
    return this.data$.pipe(map((data) => data.projects.items));
  }
}

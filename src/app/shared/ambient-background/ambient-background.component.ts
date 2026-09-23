import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Decorative animated backdrop behind every page: a faint dot grid and three soft colour blobs
 * that drift slowly. Pure CSS — the blobs are radial gradients moved with `transform` only, so
 * the work stays on the compositor. Fixed to the viewport, ignores pointer events and paints
 * beneath the document (z-index -1); sections keep opaque or translucent surfaces on top so
 * content stays readable. Static under `prefers-reduced-motion`.
 */
@Component({
  selector: 'app-ambient-background',
  template: `
    <div class="ambient__grid"></div>
    <div class="ambient__blob ambient__blob--1"></div>
    <div class="ambient__blob ambient__blob--2"></div>
    <div class="ambient__blob ambient__blob--3"></div>
  `,
  styleUrl: './ambient-background.component.scss',
  host: { 'aria-hidden': 'true' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmbientBackgroundComponent {}

import { Observable, catchError, map, of, startWith } from 'rxjs';

/** Loading / ready / error phases of an async source, for skeleton and empty-state rendering. */
export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'ready'; value: T }
  | { status: 'error' };

/**
 * Wraps a source so consumers can render every phase. Emits `loading` synchronously, so it can
 * feed `toSignal(..., { requireSync: true })`. Errors become an `error` state instead of
 * propagating (the source is content, not an action — there is nothing to retry automatically).
 */
export function toLoadState<T>(source: Observable<T>): Observable<LoadState<T>> {
  return source.pipe(
    map((value): LoadState<T> => ({ status: 'ready', value })),
    catchError((): Observable<LoadState<T>> => of({ status: 'error' })),
    startWith<LoadState<T>>({ status: 'loading' }),
  );
}

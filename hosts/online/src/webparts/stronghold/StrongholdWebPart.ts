import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'StrongholdWebPartStrings';

import type { AppHandle } from '../../shared/host-services';
import { APP_ENTRY_FILE } from '../../shared/app-entry';
import { loadApp } from '../../shared/load-app';

/**
 * The web part's properties. There are none: the app always loads from this package. A property that pointed the
 * web part at another URL would let any page editor run any script, which SPFx reserves for solutions that declare
 * requiresCustomScript, so there isn't one. To try an unpackaged build, use hosts/dev.
 */
export interface IStrongholdWebPartProps {
}

/**
 * The Stronghold web part for SharePoint Online, which is also the Teams tab (SPFx 1.24.1).
 *
 * It does three things and no more: works out where the app's files are, loads the entry file with the shared
 * loader, and calls mount. Everything Stronghold shows comes from the app (../../../../../app), which is built
 * with current tools and copied into this package by scripts/copy-app.js. The Server host does the same in
 * TypeScript 2.4; keep the two in step.
 */
export default class StrongholdWebPart extends BaseClientSideWebPart<IStrongholdWebPartProps> {
  /** The mounted app, once it is up. */
  private _app: AppHandle | undefined;
  /** True once render() has started loading; SPFx may call render() again, and there is nothing to redo. */
  private _appStarted: boolean = false;
  /** True once SharePoint has disposed the web part, so a load that finishes late mounts nothing. */
  private _appDisposed: boolean = false;

  public render(): void {
    if (this._appStarted) {
      return;
    }
    this._appStarted = true;
    this.domElement.textContent = '';
    const urls: string[] = this._appUrls();
    if (urls.length === 0) {
      this._showFailure(new Error('SharePoint gave this web part no base URL for its files.'), urls);
      return;
    }
    this._loadFrom(urls, 0);
  }

  protected onDispose(): void {
    this._appDisposed = true;
    if (this._app) {
      this._app.unmount();
      this._app = undefined;
    }
    super.onDispose();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  /**
   * The entry file's possible URLs, in order.
   *
   * SharePoint tells a web part where its files were loaded from through the manifest's
   * loaderConfig.internalModuleBaseUrls. With includeClientSideAssets on (config/package-solution.json), that is the
   * app catalog's ClientSideAssets folder, or the Microsoft 365 CDN in front of it, and scripts/copy-app.js puts the
   * app's files in that same folder. In a Teams tab it is the same folder: the tab is this web part on a page. SPFx
   * documents the list as fallbacks to try in order, so every entry becomes a candidate.
   *
   * The entry file's name carries a hash of its contents (src/shared/app-entry.ts, generated from the app's build),
   * so a browser that cached the previous package's entry file never pairs it with module files it doesn't match.
   */
  private _appUrls(): string[] {
    const bases: string[] = this.context.manifest.loaderConfig.internalModuleBaseUrls || [];
    return bases.map((base: string): string => (base.endsWith('/') ? base : `${base}/`) + APP_ENTRY_FILE);
  }

  /** Loads from urls[index]; on failure moves to the next URL, and after the last one shows what went wrong. */
  private _loadFrom(urls: string[], index: number): void {
    loadApp(urls[index]).then((app) => {
      if (this._appDisposed) {
        return;
      }
      try {
        this._app = app.mount(this.domElement, {});
      } catch (error) {
        // The file loaded; the app failed while drawing. Another URL would give the same app, so say so once.
        this._showFailure(error, [urls[index]]);
      }
    }, (error: Error) => {
      if (this._appDisposed) {
        return;
      }
      if (index + 1 < urls.length) {
        this._loadFrom(urls, index + 1);
      } else {
        this._showFailure(error, urls);
      }
    });
  }

  private _showFailure(error: unknown, urls: string[]): void {
    this.domElement.textContent = `${strings.LoadFailed} ${urls.join(', ')}`;
    console.error('[Stronghold]', error);
  }
}

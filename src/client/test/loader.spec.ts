import { init } from '../loader';
import { ComponentHostData } from '../../declarations';
import { mockWindow } from '../../testing/mocks';


describe('loader', () => {

  let win: any;
  let doc: HTMLDocument;
  let namespace: string;
  let fsNamespace: string;
  let resourcesUrl: string;
  let appCore: string;
  let appCorePolyfilled: string;
  let hydratedCssClass: string;
  let components: ComponentHostData[];
  let HTMLElementPrototype: any;

  beforeEach(() => {
    win = mockWindow();
    doc = win.document;
    namespace = 'AppNameSpace';
    fsNamespace = 'app-namespace';
    resourcesUrl = null;
    appCore = 'app.core.js';
    appCorePolyfilled = 'app.core.pf.js';
    hydratedCssClass = 'hydrated';
    components = [];
    HTMLElementPrototype = {};
  });

  describe('init', () => {

    it('set window namespace', () => {
      const loaderScript = doc.createElement('script');
      loaderScript.src = '/build/app.js';
      doc.head.appendChild(loaderScript);
      init(win, doc, namespace, fsNamespace, resourcesUrl, appCore, appCorePolyfilled, hydratedCssClass, components, HTMLElementPrototype);
      expect(win[namespace]).toBeDefined();
    });

    it('set window namespace components', () => {
      const loaderScript = doc.createElement('script');
      loaderScript.src = '/build/app.js';
      doc.head.appendChild(loaderScript);
      init(win, doc, namespace, fsNamespace, resourcesUrl, appCore, appCorePolyfilled, hydratedCssClass, components, HTMLElementPrototype);
      expect(win[namespace].components).toBe(components);
    });

    it('add <style> when components w/ styles', () => {
      const loaderScript = doc.createElement('script');
      loaderScript.src = '/build/app.js';
      doc.head.appendChild(loaderScript);

      components = [
        ['cmp-tag', {}, true] as any
      ];
      init(win, doc, namespace, fsNamespace, resourcesUrl, appCore, appCorePolyfilled, hydratedCssClass, components, HTMLElementPrototype);
      const style = doc.head.querySelector('style');
      expect(style.hasAttribute('data-styles')).toBeTruthy();
      expect(style.innerHTML.indexOf('cmp-tag') > -1).toBeTruthy();
      expect(style.innerHTML.indexOf('{visibility:hidden}') > -1).toBeTruthy();
    });

    it('do not add <style> when no components w/ styles', () => {
      const loaderScript = doc.createElement('script');
      loaderScript.src = '/build/app.js';
      doc.head.appendChild(loaderScript);

      components = [];

      init(win, doc, namespace, fsNamespace, resourcesUrl, appCore, appCorePolyfilled, hydratedCssClass, components, HTMLElementPrototype);

      const style = doc.head.querySelector('style');
      expect(style).toBeFalsy();
    });

    it('set script src attribute', () => {
      const loaderScript = doc.createElement('script');
      loaderScript.src = '/build/app.js';
      doc.head.appendChild(loaderScript);

      init(win, doc, namespace, fsNamespace, resourcesUrl, appCore, appCorePolyfilled, hydratedCssClass, components, HTMLElementPrototype);

      const coreScript = doc.head.querySelector('script[data-resources-url][data-namespace]');
      expect(coreScript.getAttribute('src')).toBe('/build/app-namespace/app.core.pf.js');
    });

    it('set resourcesUrl from namespace object resourcesUrl', () => {
      win.AppNameSpace = {
        resourcesUrl: '/namespace/property/resources-url/'
      };
      const loaderScript = doc.createElement('script');
      loaderScript.setAttribute('data-resources-url', '/custom/resources-url/');
      loaderScript.src = '/build/app.js';
      doc.head.appendChild(loaderScript);

      init(win, doc, namespace, fsNamespace, resourcesUrl, appCore, appCorePolyfilled, hydratedCssClass, components, HTMLElementPrototype);

      const coreScript = doc.head.querySelector('script[data-resources-url][data-namespace]');
      expect(coreScript.getAttribute('data-resources-url')).toBe('/namespace/property/resources-url/');
    });

    it('set resourcesUrl from data-resources-url attribute', () => {
      const loaderScript = doc.createElement('script');
      loaderScript.setAttribute('data-resources-url', '/custom/attr/resources-url/');
      loaderScript.src = '/build/app.js';
      doc.head.appendChild(loaderScript);

      init(win, doc, namespace, fsNamespace, resourcesUrl, appCore, appCorePolyfilled, hydratedCssClass, components, HTMLElementPrototype);

      const coreScript = doc.head.querySelector('script[data-resources-url][data-namespace]');
      expect(coreScript.getAttribute('data-resources-url')).toBe('/custom/attr/resources-url/');
    });

    it('set script resource path data attribute from defaults', () => {
      const loaderScript = doc.createElement('script');
      loaderScript.src = '/build/app.js';
      doc.head.appendChild(loaderScript);

      init(win, doc, namespace, fsNamespace, resourcesUrl, appCore, appCorePolyfilled, hydratedCssClass, components, HTMLElementPrototype);

      const coreScript = doc.head.querySelector('script[data-resources-url][data-namespace]');
      expect(coreScript.getAttribute('data-resources-url')).toBe('/build/app-namespace/');
    });

    it('set script namespce data attribute', () => {
      const loaderScript = doc.createElement('script');
      loaderScript.src = '/build/app.js';
      doc.head.appendChild(loaderScript);

      init(win, doc, namespace, fsNamespace, resourcesUrl, appCore, appCorePolyfilled, hydratedCssClass, components, HTMLElementPrototype);

      const coreScript = doc.head.querySelector('script[data-namespace]');
      expect(coreScript.getAttribute('data-namespace')).toBe(fsNamespace);
    });

    it('parse file:// src', () => {
      const scriptElm = doc.createElement('script');
      scriptElm.src = 'file:///c:/path/to/my%20bundle.js';
      doc.head.appendChild(scriptElm);
      init(win, doc, namespace, fsNamespace, resourcesUrl, appCore, appCorePolyfilled, hydratedCssClass, components, HTMLElementPrototype);
      const script = doc.head.lastElementChild;
      expect(script.getAttribute('src')).toBe('file:///c:/path/to/app-namespace/app.core.pf.js');
    });

    it('parse http:// src', () => {
      const scriptElm = doc.createElement('script');
      scriptElm.src = 'http://domain.com/some/path/bundle.js';
      doc.head.appendChild(scriptElm);
      init(win, doc, namespace, fsNamespace, resourcesUrl, appCore, appCorePolyfilled, hydratedCssClass, components, HTMLElementPrototype);
      const script = doc.head.lastElementChild;
      expect(script.getAttribute('src')).toBe('http://domain.com/some/path/app-namespace/app.core.pf.js');
    });

    it('parse ../ src', () => {
      const scriptElm = doc.createElement('script');
      scriptElm.src = '../bundle.js';
      doc.head.appendChild(scriptElm);
      init(win, doc, namespace, fsNamespace, resourcesUrl, appCore, appCorePolyfilled, hydratedCssClass, components, HTMLElementPrototype);
      const script = doc.head.lastElementChild;
      expect(script.getAttribute('src')).toBe('../app-namespace/app.core.pf.js');
    });

    it('parse ./ src', () => {
      const scriptElm = doc.createElement('script');
      scriptElm.src = './bundle.js';
      doc.head.appendChild(scriptElm);
      init(win, doc, namespace, fsNamespace, resourcesUrl, appCore, appCorePolyfilled, hydratedCssClass, components, HTMLElementPrototype);
      const script = doc.head.lastElementChild;
      expect(script.getAttribute('src')).toBe('./app-namespace/app.core.pf.js');
    });

    it('parse src', () => {
      const scriptElm = doc.createElement('script');
      scriptElm.src = 'bundle.js';
      doc.head.appendChild(scriptElm);
      init(win, doc, namespace, fsNamespace, resourcesUrl, appCore, appCorePolyfilled, hydratedCssClass, components, HTMLElementPrototype);
      const script = doc.head.lastElementChild;
      expect(script.getAttribute('src')).toBe('app-namespace/app.core.pf.js');
    });

  });

});

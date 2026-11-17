// Shows a saved article on the phone.
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { WebView } from 'react-native-webview';

const LINK_PREFIX = 'lastapp://item/';

export type ReaderCommand =
  | { type: 'find'; query: string }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'clear' };
export type ReaderMessage = { type: 'find'; count: number; at: number };
export type HtmlViewHandle = { send: (cmd: ReaderCommand) => void };

export const HtmlView = forwardRef<
  HtmlViewHandle,
  {
    html: string;
    background: string;
    dark: boolean;
    onOpenItem: (id: string) => void;
    onMessage?: (msg: ReaderMessage) => void;
    onReady?: () => void;
  }
>(function HtmlView(props, ref) {
  const web = useRef<{ injectJavaScript: (code: string) => void } | null>(null);
  useImperativeHandle(ref, () => ({
    send: (cmd) =>
      web.current?.injectJavaScript(
        `window.__reader && window.__reader(${JSON.stringify(cmd)}); true;`,
      ),
  }));
  return (
    <WebView
      ref={(w) => {
        web.current = w;
      }}
      originWhitelist={['*']}
      source={{ html: props.html }}
      style={{ backgroundColor: props.background }}
      forceDarkOn={props.dark}
      onLoadEnd={props.onReady}
      onMessage={(e) => {
        try {
          props.onMessage?.(JSON.parse(e.nativeEvent.data));
        } catch {
          // not one of ours
        }
      }}
      // Block every network request: this page must work offline, and
      // shouldn't leak what someone is reading. Links to other saved
      // guides open inside the app.
      onShouldStartLoadWithRequest={(req) => {
        if (req.url.startsWith(LINK_PREFIX)) {
          props.onOpenItem(req.url.slice(LINK_PREFIX.length));
          return false;
        }
        return req.url === 'about:blank' || req.url.startsWith('data:');
      }}
    />
  );
});

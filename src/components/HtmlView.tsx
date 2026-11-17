// Shows a saved article on the phone.
import { WebView } from 'react-native-webview';

export function HtmlView(props: { html: string; background: string; dark: boolean }) {
  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: props.html }}
      style={{ backgroundColor: props.background }}
      forceDarkOn={props.dark}
      // Block every network request: this page must work offline, and
      // shouldn't leak what someone is reading.
      onShouldStartLoadWithRequest={(req) =>
        req.url === 'about:blank' || req.url.startsWith('data:')
      }
    />
  );
}

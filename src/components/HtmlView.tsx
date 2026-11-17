// Shows a saved article on the phone.
import { WebView } from 'react-native-webview';

const LINK_PREFIX = 'lastapp://item/';

export function HtmlView(props: {
  html: string;
  background: string;
  dark: boolean;
  onOpenItem: (id: string) => void;
}) {
  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: props.html }}
      style={{ backgroundColor: props.background }}
      forceDarkOn={props.dark}
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
}

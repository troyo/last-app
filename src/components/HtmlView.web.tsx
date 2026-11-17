// Browser preview version: an iframe with scripts and network blocked.
const LINK_PREFIX = 'lastapp://item/';

export function HtmlView(props: {
  html: string;
  background: string;
  dark: boolean;
  onOpenItem: (id: string) => void;
}) {
  return (
    <iframe
      title="article"
      sandbox="allow-same-origin"
      srcDoc={props.html}
      onLoad={(e) => {
        const doc = (e.target as HTMLIFrameElement).contentDocument;
        doc?.addEventListener('click', (ev) => {
          const a = (ev.target as HTMLElement).closest('a');
          const href = a?.getAttribute('href') ?? '';
          ev.preventDefault();
          if (href.startsWith(LINK_PREFIX)) props.onOpenItem(href.slice(LINK_PREFIX.length));
        });
      }}
      style={{ flex: 1, border: 0, width: '100%', height: '100%', background: props.background }}
    />
  );
}

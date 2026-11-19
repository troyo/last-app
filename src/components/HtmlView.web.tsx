// Browser preview version: an iframe with the network blocked. Only the
// reader's own script can run (the page's security policy refuses any other).
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const LINK_PREFIX = 'lastapp://item/';
const HELP_PREFIX = 'lastapp://help/';

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
    /** A link to one of the app's own step-by-step cards. */
    onOpenHelp?: (id: string) => void;
    onMessage?: (msg: ReaderMessage) => void;
    onReady?: () => void;
  }
>(function HtmlView(props, ref) {
  const frame = useRef<HTMLIFrameElement>(null);
  const onMessage = useRef(props.onMessage);
  onMessage.current = props.onMessage;
  useImperativeHandle(ref, () => ({
    send: (cmd) =>
      frame.current?.contentWindow?.postMessage(JSON.stringify({ ...cmd, reader: true }), '*'),
  }));
  useEffect(() => {
    const listen = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      try {
        onMessage.current?.(JSON.parse(String(e.data)));
      } catch {
        // not one of ours
      }
    };
    window.addEventListener('message', listen);
    return () => window.removeEventListener('message', listen);
  }, []);
  return (
    <iframe
      ref={frame}
      title="article"
      sandbox="allow-same-origin allow-scripts"
      srcDoc={props.html}
      onLoad={(e) => {
        props.onReady?.();
        const doc = (e.target as HTMLIFrameElement).contentDocument;
        doc?.addEventListener('click', (ev) => {
          const a = (ev.target as HTMLElement).closest('a');
          if (!a) return;
          const href = a.getAttribute('href') ?? '';
          ev.preventDefault();
          if (href.startsWith(LINK_PREFIX)) props.onOpenItem(href.slice(LINK_PREFIX.length));
          else if (href.startsWith(HELP_PREFIX)) props.onOpenHelp?.(href.slice(HELP_PREFIX.length));
        });
      }}
      style={{ flex: 1, border: 0, width: '100%', height: '100%', background: props.background }}
    />
  );
});

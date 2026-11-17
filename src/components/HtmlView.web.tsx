// Browser preview version: a sandboxed iframe (scripts and network blocked by CSP).
export function HtmlView(props: { html: string; background: string; dark: boolean }) {
  const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">`;
  return (
    <iframe
      title="article"
      sandbox=""
      srcDoc={props.html.replace('<head>', `<head>${csp}`)}
      style={{ flex: 1, border: 0, width: '100%', height: '100%', background: props.background }}
    />
  );
}

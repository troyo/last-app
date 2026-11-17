// Remembers that this phone's owner read and accepted the safety terms.
import { File, Paths } from './fs';

// Bump this when the terms change, and everyone is asked to agree again.
export const TERMS_VERSION = 1;
const FILE = new File(Paths.document, 'agreement.json');

export function hasAgreed(): boolean {
  try {
    return FILE.exists && JSON.parse(FILE.textSync()).version === TERMS_VERSION;
  } catch {
    return false; // when in doubt, ask again
  }
}

export function recordAgreement() {
  try {
    FILE.writeSync(JSON.stringify({ version: TERMS_VERSION, agreedAt: new Date().toISOString() }));
  } catch {
    // if it can't be saved we'll simply ask again next time
  }
}

// The full terms, in plain words. Shown at first launch and from the About tab.
// IMPORTANT: have a lawyer review this before a public release.
export const TERMS: { title: string; body: string }[] = [
  {
    title: 'General information only',
    body: 'Last App shares general information for learning and preparedness. It is not medical, legal, safety or other professional advice, and it is not written for your specific situation.',
  },
  {
    title: 'Not a substitute for real help',
    body: 'This app does not replace doctors, emergency services or other trained professionals. Whenever you are able to reach emergency services or professional care, do that first.',
  },
  {
    title: 'It may be wrong or out of date',
    body: 'The guides come from public sources such as government publications, Wikipedia and Wikibooks, and the quick help cards are short summaries. Any of it may be incomplete, outdated or mistaken. Nothing here has been checked for your circumstances.',
  },
  {
    title: 'You use it at your own risk',
    body: 'You are responsible for your own decisions and actions, and for anyone in your care. First aid and survival techniques carry risk, especially without training.',
  },
  {
    title: 'No guarantees, limited liability',
    body: 'The app and everything in it are provided “as is”, with no warranties of any kind. To the fullest extent the law allows, the makers of Last App and its content sources are not liable for any injury, death, loss or damage that comes from using, or being unable to use, the app or its content.',
  },
  {
    title: 'Guides change',
    body: 'Guides are updated over time and may contain errors. When something matters, check it against a second source if you can.',
  },
  {
    title: 'Who can use it',
    body: 'You must be 18 or older, or be using the app with a parent or guardian who agrees to these terms.',
  },
];

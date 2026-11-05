import boyUrl from '../assets/heroes/boy.png';
import girlUrl from '../assets/heroes/girl.png';
import { getSetting } from '../services/settings.js';

// Playable characters. The start screen saves the choice (later, one per profile);
// ?hero=girl in the address overrides it.
export const HEROES = {
  boy: { id: 'boy', textureKey: 'hero-boy', url: boyUrl },
  girl: { id: 'girl', textureKey: 'hero-girl', url: girlUrl },
};

export function chosenHero() {
  const fromAddress = new URLSearchParams(location.search).get('hero');
  return HEROES[fromAddress] || HEROES[getSetting('hero')] || HEROES.boy;
}

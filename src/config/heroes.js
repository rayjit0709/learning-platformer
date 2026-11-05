import boyUrl from '../assets/heroes/boy.png';
import girlUrl from '../assets/heroes/girl.png';

// Playable characters. M4 will let each profile pick one; for now use
// ?hero=girl in the address (default is the boy).
export const HEROES = {
  boy: { textureKey: 'hero-boy', url: boyUrl },
  girl: { textureKey: 'hero-girl', url: girlUrl },
};

export function chosenHero() {
  const id = new URLSearchParams(location.search).get('hero');
  return HEROES[id] || HEROES.boy;
}

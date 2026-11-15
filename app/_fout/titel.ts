import { useEffect } from "react";

// De titel van het tabblad. Een <title> in de pagina zelf verliest het van de
// standaardtitel uit het layout, die Next soms pas later in <head> zet. Daarom zetten
// we hem zelf, en opnieuw zolang deze pagina openstaat en <head> verandert.
function bewaak(titel: string) {
  const zet = () => { if (document.title !== titel) document.title = titel; };
  zet();
  const kijker = new MutationObserver(zet);
  kijker.observe(document.head, { childList: true, subtree: true, characterData: true });
  return () => kijker.disconnect();
}

export function useTitel(titel: string) {
  useEffect(() => bewaak(titel), [titel]);
}

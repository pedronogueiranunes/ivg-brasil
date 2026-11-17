// Ilha do mapa de cursos (tarefa 09). Entra com client:visible: o JavaScript do Leaflet só é baixado
// quando o mapa aparece na tela. O CSS do Leaflet (pequeno) vem com a página, em pesquisa/cursos.astro,
// porque o import dinâmico de CSS dentro da ilha não é publicado pelo build.
// A lista da página é a fonte principal; o mapa repete os mesmos cursos.
import { useEffect, useRef, useState } from 'react';
import type { CircleMarker, Map as LeafletMap } from 'leaflet';
import { EVENTO_FILTRO, passaNoFiltro, type CursoNoMapa, type FiltroCursos } from '@/lib/cursos';

interface Props {
  cursos: CursoNoMapa[];
  rotulos: { mapa: string; carregando: string; osm: string; niveis: Record<string, string>; modalidades: Record<string, string> };
}

const BRASIL: [[number, number], [number, number]] = [[-33.8, -74], [5.3, -34.8]];

function filtroAtual(): FiltroCursos {
  const form = document.querySelector<HTMLFormElement>('[data-cursos-filtros]');
  const valor = (nome: string) => (form?.elements.namedItem(nome) as HTMLSelectElement | null)?.value ?? '';
  return { uf: valor('uf'), nivel: valor('nivel'), modalidade: valor('modalidade') };
}

export default function MapaCursos({ cursos, rotulos }: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let mapa: LeafletMap | undefined;
    let cancelado = false;
    let aoFiltrar: ((e: Event) => void) | undefined;

    (async () => {
      const { default: L } = await import('leaflet');
      if (cancelado || !caixa.current) return;
      const css = getComputedStyle(document.documentElement);
      const acento = css.getPropertyValue('--color-accent').trim() || '#b5452a';
      const papel = css.getPropertyValue('--color-surface').trim() || '#ffffff';

      mapa = L.map(caixa.current, { scrollWheelZoom: false, maxBounds: [[-40, -85], [12, -25]] }).fitBounds(BRASIL);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: `© <a href="https://www.openstreetmap.org/copyright">${rotulos.osm}</a>`,
      }).addTo(mapa);

      const marcadores = cursos.map((c) => {
        const popup = document.createElement('div');
        const nome = document.createElement(c.link ? 'a' : 'strong');
        nome.textContent = c.instituicao;
        if (nome instanceof HTMLAnchorElement) nome.href = c.link;
        const detalhe = document.createElement('p');
        detalhe.textContent = `${c.cidade ? `${c.cidade}, ` : ''}${c.uf} · ${rotulos.niveis[c.nivel]} · ${rotulos.modalidades[c.modalidade]}`;
        popup.append(nome, detalhe);
        const m: CircleMarker = L.circleMarker([c.lat, c.lng], { radius: 8, color: papel, weight: 2, fillColor: acento, fillOpacity: 1 }).bindPopup(popup);
        return { curso: c, m };
      });

      const aplicar = (f: FiltroCursos) => {
        if (!mapa) return;
        const visiveis = marcadores.filter(({ curso }) => passaNoFiltro(curso, f));
        for (const { m } of marcadores) m.remove();
        for (const { m } of visiveis) m.addTo(mapa);
        if (visiveis.length) mapa.fitBounds(L.latLngBounds(visiveis.map(({ m }) => m.getLatLng())).pad(0.3), { maxZoom: 9 });
        else mapa.fitBounds(BRASIL);
      };
      aoFiltrar = (e) => aplicar((e as CustomEvent<FiltroCursos>).detail);
      document.addEventListener(EVENTO_FILTRO, aoFiltrar);
      aplicar(filtroAtual());
      setPronto(true);
    })();

    return () => {
      cancelado = true;
      if (aoFiltrar) document.removeEventListener(EVENTO_FILTRO, aoFiltrar);
      mapa?.remove();
    };
  }, [cursos, rotulos]);

  return (
    <div className="mapa-cursos" role="region" aria-label={rotulos.mapa} aria-busy={!pronto}>
      <div ref={caixa} className="mapa-cursos__caixa" />
      {!pronto && <p className="mapa-cursos__carregando">{rotulos.carregando}</p>}
    </div>
  );
}

// Cursos de alemão (tarefa 09). Nomes dos estados: mesma lista do schema (src/content.config.ts)
// e do importador (scripts/importar-cursos.mjs). Nomes próprios, iguais nos três idiomas.
export const UF_NOMES = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal',
  ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
  SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
} as const;
export type UF = keyof typeof UF_NOMES;

/** O que a ilha do mapa recebe de cada curso (só os que têm posição). */
export interface CursoNoMapa {
  id: string;
  instituicao: string;
  cidade: string;
  uf: UF;
  nivel: 'graduacao' | 'pos';
  modalidade: 'presencial' | 'ead' | 'hibrido';
  link: string;
  lat: number;
  lng: number;
}

/** Estado dos filtros, compartilhado entre o script da lista e a ilha do mapa. Vazio = todos. */
export interface FiltroCursos { uf: string; nivel: string; modalidade: string }
export const EVENTO_FILTRO = 'cursos:filtro';
export const passaNoFiltro = (c: { uf: string; nivel: string; modalidade: string }, f: FiltroCursos) =>
  (!f.uf || c.uf === f.uf) && (!f.nivel || c.nivel === f.nivel) && (!f.modalidade || c.modalidade === f.modalidade);

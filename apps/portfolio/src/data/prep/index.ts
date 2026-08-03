// Discovery + typing for prep dossiers. Vite's import.meta.glob with eager:true
// inlines every JSON at build time, so adding a <slug>.json file is all it takes
// to get a /prep/<slug> route — no registry to keep in sync.
export type Round = { name: string; length: string; tests: string; scoring: string; prep: string };
export type Question = { difficulty: string; title: string; frequency: number; link: string; topics: string[] };
export type Story = { story: string; prompt: string; situation: string; task: string; action: string; result: string; mapsTo: string };
export type Dossier = {
  slug: string;
  company: string;
  datasetName: string;
  updated: string;
  formatIntel: { summary: string; rounds: Round[] };
  questions: { sixMonths: Question[]; allTime: Question[]; note: string };
  behavioral: { values: string[]; stories: Story[] };
  askThem: string[];
};

const files = import.meta.glob<{ default: Dossier }>("./*.json", { eager: true });
export const dossiers: Dossier[] = Object.values(files)
  .map((m) => m.default)
  .sort((a, b) => a.company.localeCompare(b.company));

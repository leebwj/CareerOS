// The DoorDash view of the portfolio (/doordash): AI work first, because the
// posting asks for a case study of it, then the other design case studies.
import alephThumb from "../assets/work/aleph-lab.png";
import modeCards from "../assets/work/doordash/aleph-mode-cards.png";
import homeBefore from "../assets/work/doordash/aleph-home-before.jpg";
import homeAfter from "../assets/work/doordash/aleph-home-after.jpg";
import speakingAfter from "../assets/work/doordash/aleph-speaking-after.jpg";
import popupAfter from "../assets/work/doordash/aleph-popup-after.jpg";
import finalHome from "../assets/work/doordash/final-home.png";
import finalEnglish from "../assets/work/doordash/final-english.png";
import finalAnnie from "../assets/work/doordash/final-annie.png";
import finalStats from "../assets/work/doordash/final-stats.png";
import finalSettings from "../assets/work/doordash/final-settings.png";
import finalWords from "../assets/work/doordash/final-words.png";
import { applyOverride, type PageOverride, type Step, type Study, type TailoredView } from "./tailored";
import { overrides as robloxOverrides, studies as robloxStudies } from "./roblox";
import type { Project } from "./projects";

export const DOORDASH_RESUME = "/Brian_Lee_Resume_DoorDash.pdf";

const shared = (slug: string): Study => robloxStudies.find((s) => s.slug === slug)!;

const aiStudies: Study[] = [
  {
    slug: "aleph-lab",
    outcome: "Redesign live to 100% of users",
    thumb: alephThumb,
    role: "Engineering & design intern",
    team: "Y Combinator startup (F25), remote",
    line: "The app around Annie, an AI character who plays alongside kids, redesigned and rebuilt in React Native.",
    blurb: "Aleph's app needed a full redesign that families would not have to relearn. Our designer and I worked out a 33-section Figma system, and I built it into the React Native app with Claude Code and the Figma MCP doing most of the typing and me deciding what stayed. The new structure went live to every user first, and the visual system followed in stages to 100%. I also gave Annie her voice in the interface: one message at a time on the home screen, and crash and error states a child can read, in English and Korean.",
  },
  {
    slug: "wikipedia",
    outcome: "Hi-fi prototype, 5 sections, usability tested",
    blurb: "People scan Wikipedia, but the mobile app assumes they read. One of my five redesigned sections was an AI Chat tab, a quick-summary layer over the article. All four usability testers expected it to give full answers, so I rewrote its framing as summaries that link back into the article. Testing changed three other sections too, and the case study lists each change and why.",
  },
  {
    slug: "art-of-web",
    outcome: "Live, 8 course projects in one scene",
    role: "Solo designer & developer",
    team: "Solo",
    blurb: "A course portfolio I wanted people to explore, not scroll. I built it as one Three.js scene, with Claude and Codex writing most of the scene, physics, and modal code from my descriptions. My part was how it should feel: hand-set scale for the objects that looked wrong next to the others, a bounce tuned until the drift read as calm, and a last day spent only on the title. It is live as one scene holding eight projects.",
  },
  {
    slug: "road-rogue",
    outcome: "Playable in the browser",
    role: "Solo developer & game designer",
    team: "Solo",
    blurb: "A design course asked how far AI tools could carry an interactive piece. I built a 3D car-chase game with Meshy generating the assets and Codex scaffolding the logic, then found where the tools stopped. They got me to a first playable fast. The driving feel, the part that makes it fun, still came down to tuning by hand.",
  },
];

const designStudies: Study[] = ["dewey", "penn-spark-redesign", "path-at-penn", "capsule"].map(shared);

const steps: Step[] = [
  {
    title: "Find the problem in what people do",
    body: "Path@Penn started with walkthroughs and interviews, and the finding that mattered was that students did not plan in the portal at all. They planned in four other apps and came back to click enroll.",
    link: { text: "Path@Penn", slug: "path-at-penn" },
  },
  {
    title: "Decide in lo-fi, with the people who build it",
    body: "On Dewey we drew both versions of the feed, benchmarked where other apps put search, and checked with the developers that a merged book-and-user search was feasible before choosing.",
    link: { text: "Dewey", slug: "dewey" },
  },
  {
    title: "Prototype in the medium it ships in",
    body: "At Aleph the redesign went from Figma straight into the React Native app. Testing on a real phone changed the system: the brand green was tried at five strengths and kept at 55% because the rest failed contrast or stopped looking like the brand.",
    link: { text: "Aleph Lab", slug: "aleph-lab" },
  },
  {
    title: "Test, then change the design",
    body: "Four think-aloud sessions on the Wikipedia mid-fi changed four things: section previews, search snippets, the AI Chat framing, and the language toggle. Each change and its reason is on the page.",
    link: { text: "Wikipedia Redesign", slug: "wikipedia" },
  },
  {
    title: "Use AI for speed, keep the judgment",
    body: "The tools write most of the code now. What I check is what they decide on their own: stand-in icons in place of the designer's, colors changed that nobody asked to change, a divider a pixel too thick. Those get reverted.",
    link: { text: "Aleph Lab", slug: "aleph-lab" },
  },
];

const why: string[] = [
  "I order from DoorDash regularly, mostly restaurant delivery around campus. What brought me to the design team is what it has been writing. How Designers at DoorDash Are Becoming Builders describes how I worked this summer: I worked out a Figma system with our designer and then built it into the production React Native app myself, instead of handing it off.",
  "Dream Big, Start Small is also how that redesign shipped. The new structure went to every user first, behind one flag that could switch it off, and the visual system followed at 25, 50, and 100%. Each step was small enough to undo, which is what let it go out quickly.",
  "Two Teams, One Shift says that when building is fast, direction becomes the bottleneck. That matched what I saw. The AI tools I used wrote most of the code, and my job was deciding what to keep. The Aleph case study lists the calls I made against the tools, because that part does not show up in a screenshot.",
  "Your evals post asks who gets to decide what is good. My closest experience is small: four readers overruled the wording of my Wikipedia AI Chat because they expected full answers, and they were right. I would like to work on that question at DoorDash's scale.",
];

const overrides: Record<string, PageOverride> = {
  ...robloxOverrides,
  "aleph-lab": {
    role: "Engineering & design intern",
    drop: ["What I worked on"],
    metrics: [
      { value: "100%", label: "of users on the redesign" },
      { value: "33", label: "design-system sections" },
      { value: "16", label: "mode cards wired and checked" },
    ],
    tagline: "Designing and building the app around Annie, an AI character who plays alongside kids while they learn English.",
    insert: [
      { after: "Company", block: { type: "prose", label: "Problem", heading: "A redesign families should not have to relearn", body: [
        "The app was getting a full redesign: a new structure and a 33-section Figma system that I worked out together with the team's designer. Families opened it every day, so the risk was a morning where nothing sat where they left it.",
        "The team's plan was structure first, style second, because structure can ship in small pieces and a visual change cannot. I built both halves in React Native and proposed the flag that let either one be switched off.",
      ] } },
      { after: "Problem", block: { type: "list", label: "Structure", heading: "What moved, before any visual change", items: [
        "Home went from one long column to a two-by-two grid.",
        "A new Speaking tab took talking with Annie and word practice off the home screen.",
        "Class length moved from Home into each game's description, and class settings merged into Settings.",
        "All of it sat behind one flag, and it went live to every user before the new visual system was turned on. The visual system then followed at 25, 50, and 100%.",
      ] } },
      { after: "Structure", block: { type: "media", label: "Before and after", layout: "half", items: [
        { src: homeBefore, alt: "Home before: hero, a time card, and a practice section in one column", caption: "Before: Home did three jobs at once, with the class-time card and the practice section stacked under the hero." },
        { src: homeAfter, alt: "Home after: hero above a two-column grid of game modes", caption: "After the structure release: Home is only about classes, in a two-column grid." },
      ] } },
      { after: "Before and after", block: { type: "media", label: "Where things went", layout: "half", items: [
        { src: speakingAfter, alt: "The new Speaking tab with call-with-Annie and word-practice cards", caption: "Talking with Annie and word practice moved off Home into their own Speaking tab." },
        { src: popupAfter, alt: "A class popup with the time card inside it", caption: "Class length moved into each class popup, where the parent decides to start." },
      ] } },
      { after: "Where things went", block: { type: "media", label: "Final look", layout: "third", items: [
        { src: finalHome, alt: "Home in the new visual system: Annie greets the child by name above a featured adventure and a grid of modes", caption: "Home: Annie greets the child by name and suggests one adventure, above the grid of modes." },
        { src: finalEnglish, alt: "The English Training tab with a word-practice card and a phone-English card", caption: "English Training, the tab that took practice off Home: today's words first, then talking with Annie." },
        { src: finalAnnie, alt: "Annie's tab showing her tier, her character, and time, words, and sessions together", caption: "Annie's own tab: her tier, and the time, words, and sessions the child has spent with her." },
        { src: finalStats, alt: "The Stats tab with minutes spoken, words mastered, a weekly streak, and learning feedback", caption: "Stats for parents: minutes spoken, words mastered, the week's streak, and feedback from class." },
        { src: finalSettings, alt: "Settings with word practice, Minecraft class with a subtitle preview, general, and notifications", caption: "Settings in one place, with a preview of how Annie's subtitles look during Minecraft class." },
        { src: finalWords, alt: "A word-practice question asking for the Korean translation of an English word", caption: "Word practice: one English word, four answers in Korean." },
      ] } },
      { after: "Final look", block: { type: "list", label: "Decisions", heading: "Building the system, and where it changed on a phone", items: [
        "Cyan is reserved for Annie's surfaces and cobalt for accents, so a child can tell the character from the app.",
        "No gradients anywhere, so the system stays flat enough to build from tokens.",
        "The brand green was tested live at 15, 35, 55, 65 and 100% strength. 55% stayed: the others failed WCAG contrast or stopped reading as the brand.",
        "Played days on the calendar keep dark text, because white measured 2.21:1 against the fill.",
        "The three bubble colors in the file failed white-text contrast on a real device, so two replaced them.",
      ] } },
      { after: "Decisions", block: { type: "media", label: "Mode cards", layout: "full", items: [
        { src: modeCards, alt: "Sixteen game-mode cards with Korean titles and difficulty tags", caption: "The check sheet for the mode-card swap. The art is our designer's; I wired each card to its mode, checked all 16 pairings against the database, and wrote the uploader." },
      ] } },
      { after: "Mode cards", block: { type: "list", label: "Annie's voice", heading: "An AI character, in the interface", items: [
        "Ten kinds of home-screen message from Annie, shown one at a time in a fixed priority, so she never talks over herself.",
        "The child's name is kept out of every analytics event.",
        "Before, a crash showed a white screen. Now it shows a branded recovery: \"Something went wrong. An unexpected error occurred. Restarting the app should fix it.\" In Korean: \"문제가 발생했어요. 예상치 못한 오류가 발생했어요. 앱을 다시 시작하면 해결돼요.\"",
        "A failed class list reads \"Oops — couldn't load the classes. The connection hiccuped for a moment. A quick retry should fix it!\" instead of the raw error text.",
      ] } },
      { after: "Annie's voice", block: { type: "list", label: "AI in the process", heading: "How it was built", items: [
        "Claude Code ran the builds and reviews, with the Figma MCP reading exact tokens from the file instead of eyeballed hex values.",
        "Codex gave a second-model review before anything merged.",
        "A skill checks every converted component against a fixture: no raw hex, and all type goes through the text variants.",
        "A second skill drafts a new game mode's configuration and runs it through parse, lint and review until it comes back clean.",
      ] } },
      { after: "AI in the process", block: { type: "list", label: "Judgment", heading: "Where I overruled the tools", items: [
        "Stand-in icons from a stock set, in place of the designer's glyphs: rejected on sight. The real vector paths are now pinned by a test.",
        "A color remap on the settings icons when only a merge was asked for: reverted.",
        "A divider that looked a little heavy: pinned to exactly two device pixels.",
        "A duplicate section added on its own: reverted.",
      ] } },
      { after: "Judgment", block: { type: "list", label: "Also at Aleph", heading: "The engineering side of the same summer", items: [
        "Packaged Annie as a versioned SDK so studios outside the company can build game modes on her, then wrote a full mode from the handover docs alone to prove it worked. It merged as a first-party mode.",
        "Built the app's lifecycle notifications end to end: streak reminders, re-engagement and class-completion alerts, with back-off so one family never gets a pile of them, and a holdout group so the effect was measured.",
        "Built an analysis tool on production data that showed a reported retention gain came from how it was measured, not from the product.",
      ] } },
    ],
  },
  "art-of-web": {
    insert: [
      { after: "Overview", block: { type: "prose", label: "AI workflow", heading: "Directing the build", body: [
        "I built the scene with Claude and Codex writing most of the Three.js, physics, and modal code from my descriptions, and spent my own time on how it should feel.",
        "Every object is scaled from its bounding box, which made the clock, the tape, and the cube look out of scale next to the rest, so they carry hand-set multipliers. The bounce settled at 0.9 restitution with 0.998 friction per frame, slow enough to read each object as it passes. The last day before submission went to the title alone: a run of changes to its size and to the buttons around it.",
      ] } },
    ],
  },
  "road-rogue": { role: "Solo developer & game designer" },
};

export const forDoorDash = (p: Project): Project => applyOverride(p, overrides[p.slug]);

export const doordashView: TailoredView = {
  base: "/doordash",
  company: "DoorDash",
  description: "Product design portfolio: designing and building the app around an AI character, AI in my own process, and research-led design work.",
  resume: DOORDASH_RESUME,
  heroSub: "Product designer who ships what he designs, in code. CS + Design at Penn, hoping to spend Summer 2027 designing at DoorDash.",
  groups: [
    { kicker: "AI in my work", heading: "Designing with AI, and for it.", studies: aiStudies },
    { kicker: "Design work", heading: "From research to shipped code.", studies: designStudies },
  ],
  steps,
  why: { kicker: "Why DoorDash", heading: "Designers who build.", paras: why },
  contactLine: "I'd like to spend Summer 2027 designing at DoorDash, in San Francisco or New York. Happy to walk through any of this work on a call. The full site, with the graphics and engineering projects, is at leebrian.dev.",
  footLine: "I'd like to spend Summer 2027 designing at DoorDash. Happy to walk through this work on a call.",
  apply: forDoorDash,
};

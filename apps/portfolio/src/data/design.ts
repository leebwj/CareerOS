// The design reading of the case studies (/design/work/[slug]): the Aleph
// internship as a product design story, for links sent with design
// applications. The landing page stays /design.
import homeBefore from "../assets/work/doordash/aleph-home-before.jpg";
import homeAfter from "../assets/work/doordash/aleph-home-after.jpg";
import speakingAfter from "../assets/work/doordash/aleph-speaking-after.jpg";
import popupAfter from "../assets/work/doordash/aleph-popup-after.jpg";
import modeCards from "../assets/work/doordash/aleph-mode-cards.png";
import finalHome from "../assets/work/doordash/final-home.png";
import finalEnglish from "../assets/work/doordash/final-english.png";
import finalAnnie from "../assets/work/doordash/final-annie.png";
import finalStats from "../assets/work/doordash/final-stats.png";
import finalSettings from "../assets/work/doordash/final-settings.png";
import finalWords from "../assets/work/doordash/final-words.png";
import { applyOverride, type PageOverride, type StudyGroup } from "./tailored";
import { overrides as robloxOverrides } from "./roblox";
import { getView } from "./views";
import type { Project } from "./projects";

export const alephDesign: PageOverride = {
  role: "Engineering & design intern",
  drop: ["What I worked on"],
  metrics: [
    { value: "100%", label: "of users on the redesign" },
    { value: "33", label: "design-system sections" },
    { value: "16", label: "mode cards wired and checked" },
  ],
  tagline: "Designing and building the app around Annie, an AI character who plays alongside kids while they learn English.",
  insert: [
    { after: "Company", block: { type: "list", label: "In short", heading: "The project in three lines", items: [
      "Problem: families open the app every day, and it was getting a new structure and a new 33-section visual system. Nothing could move out from under them.",
      "My part: I built both into the React Native app with the team's one designer, proposed the kill switch on the structure release, and tested the colors on real phones.",
      "Outcome: the new structure went live to 100% of users on July 16, before any visual change, and the visual system followed. Testing on real phones changed the green, the calendar text and Annie's bubble colors before release.",
    ] } },
    { after: "In short", block: { type: "media", label: "Before and after", layout: "half", items: [
      { src: homeBefore, alt: "Home before: hero, a time card, and a practice section in one column", caption: "Before: Home did three jobs at once, with the class-time card and the practice section stacked under the hero." },
      { src: finalHome, alt: "Home in the new visual system: Annie greets the child by name above a featured adventure and a grid of modes", caption: "After: Home is only about classes. Annie greets the child by name and suggests one adventure, above the grid of modes." },
    ] } },
    { after: "Before and after", block: { type: "prose", label: "Problem", heading: "A redesign families should not have to relearn", body: [
      "The app was getting a new structure and a 33-section Figma system that I worked out together with the team's designer. Families opened it every day, so the risk was a morning where nothing sat where they left it.",
      "The team's plan was structure first, style second, because structure can ship in small pieces and a visual change cannot. I built both halves in React Native and proposed the kill switch that let the structure release be turned off.",
    ] } },
    { after: "Problem", block: { type: "list", label: "Structure", heading: "What moved, before any visual change", items: [
      "Home went from one long column to a two-by-two grid.",
      "A new Speaking tab took talking with Annie and word practice off the home screen.",
      "Class length moved from Home into each game's description, and class settings merged into Settings.",
      "All of it sat behind one kill switch, and it went live to every user on July 16, before the new visual system was turned on.",
    ] } },
    { after: "Structure", block: { type: "media", label: "Where things went", layout: "third", items: [
      { src: homeAfter, alt: "Home after the structure release: hero above a two-column grid of game modes", caption: "After the structure release, still in the old look: Home is only about classes, in a two-column grid." },
      { src: speakingAfter, alt: "The new Speaking tab with call-with-Annie and word-practice cards", caption: "Talking with Annie and word practice moved off Home into their own Speaking tab." },
      { src: popupAfter, alt: "A class popup with the time card inside it", caption: "Class length moved into each class popup, where the parent decides to start." },
    ] } },
    { after: "Where things went", block: { type: "media", label: "Final look", layout: "third", items: [
      { src: finalEnglish, alt: "The English Training tab with a word-practice card and a phone-English card", caption: "English Training, the tab that took practice off Home: today's words first, then talking with Annie." },
      { src: finalAnnie, alt: "Annie's tab showing her tier, her character, and time, words, and sessions together", caption: "Annie's own tab: her tier, and the time, words, and sessions the child has spent with her." },
      { src: finalStats, alt: "The Stats tab with minutes spoken, words mastered, a weekly streak, and learning feedback", caption: "Stats for parents: minutes spoken, words mastered, the week's streak, and feedback from class." },
      { src: finalSettings, alt: "Settings with word practice, Minecraft class with a subtitle preview, general, and notifications", caption: "Settings in one place, with a preview of how Annie's subtitles look during Minecraft class." },
      { src: finalWords, alt: "A word-practice question asking for the Korean translation of an English word", caption: "Word practice: one English word, four answers in Korean." },
    ] } },
    { after: "Final look", block: { type: "list", label: "Decisions", heading: "Building the system, and where it changed on a phone", items: [
      "Cyan is reserved for Annie's surfaces and cobalt for accents, so a child can tell the character from the app.",
      "No gradients anywhere, so the system stays flat enough to build from tokens.",
      "On a real phone the light cyan and lime accents measured 1.9:1 and 1.6:1 against white, too faint to carry a label.",
      "The green on the chip that marks a rising number was tried on the phone at 15, 35, 55, 65 and 100% strength. 55% stayed, with a dark label at 9.59:1: the lighter tints stopped reading as the brand lime, and the stronger ones pulled the eye off the number the chip annotates.",
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
};

const overrides: Record<string, PageOverride> = { ...robloxOverrides, "aleph-lab": alephDesign };

const order = ["aleph-lab", ...getView("design").order];

export const designView = {
  base: "/design" as const,
  groups: [{ kicker: "", heading: "", studies: order.map((slug) => ({ slug, outcome: "", blurb: "" })) }] as StudyGroup[],
  footLine: "I'm looking for product design internships for Summer 2027 and new-grad roles. Happy to walk through this work on a call.",
  apply: (p: Project): Project => applyOverride(p, overrides[p.slug]),
};

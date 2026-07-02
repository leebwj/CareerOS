import type { ImageMetadata } from "astro";
import passengerImg from "../assets/work/passenger.png";
import miniMinecraftImg from "../assets/work/mini-minecraft.png";
import pennSparkImg from "../assets/work/penn-spark.png";
import pathImg from "../assets/work/path-at-penn.png";
import roadRogueImg from "../assets/work/road-rogue.png";
import pathDashboard from "../assets/work/path-at-penn/dashboard.png";
import pathCourse from "../assets/work/path-at-penn/course.png";
import pathSchedule from "../assets/work/path-at-penn/schedule.png";
import pathDegree from "../assets/work/path-at-penn/degree.png";
import pathInterview from "../assets/work/path-at-penn/interview.png";
import pathTesting from "../assets/work/path-at-penn/testing.png";
import wikiCover from "../assets/work/wikipedia/cover.png";
import wikiHome from "../assets/work/wikipedia/home.png";
import wikiArticle from "../assets/work/wikipedia/article.png";
import wikiSearch from "../assets/work/wikipedia/search.png";
import wikiChat from "../assets/work/wikipedia/chat.png";
import wikiLofi from "../assets/work/wikipedia/lofi.png";
import wikiTesting from "../assets/work/wikipedia/testing.png";
import pgCanyonGolden from "../assets/work/passenger/canyon-golden.png";
import pgCanyonBlue from "../assets/work/passenger/canyon-blue.png";
import pgCanyonKuwahara from "../assets/work/passenger/canyon-kuwahara.png";
import pgCanyonWideOff from "../assets/work/passenger/canyon-wide-off.png";
import pgCanyonWideOn from "../assets/work/passenger/canyon-wide-on.png";
import pgTrainInterior from "../assets/work/passenger/train-interior.png";
import pgTrainExterior from "../assets/work/passenger/train-exterior.png";
import pgGbBase from "../assets/work/passenger/gb-basecolor.png";
import pgGbNormal from "../assets/work/passenger/gb-normal.png";
import pgGbRough from "../assets/work/passenger/gb-roughness.png";
import pgGbMetal from "../assets/work/passenger/gb-metallic.png";
import pgGbDepth from "../assets/work/passenger/gb-depth.png";
import pgGbHdr from "../assets/work/passenger/gb-hdr.png";
import pgMayaFront from "../assets/work/passenger/maya-front.png";
import pgMayaSide from "../assets/work/passenger/maya-side.png";
import pgMayaTop from "../assets/work/passenger/maya-top.png";
import pgCharEngine from "../assets/work/passenger/char-engine.png";
import pgTrainExtOn from "../assets/work/passenger/train-ext-on.png";
import pgTrainIntOff from "../assets/work/passenger/train-int-off.png";
import pgTrainIntOn from "../assets/work/passenger/train-int-on.png";
import mcGrassland from "../assets/work/mini-minecraft/grassland.png";
import mcBiomeBorder from "../assets/work/mini-minecraft/biome-border.png";
import mcWaterLake from "../assets/work/mini-minecraft/water-lake.png";
import mcCave from "../assets/work/mini-minecraft/cave.png";
import mcMountainDusk from "../assets/work/mini-minecraft/mountain-dusk.png";
import psHome from "../assets/work/penn-spark/home.png";
import psClient from "../assets/work/penn-spark/client-projects.png";
import psCommunity from "../assets/work/penn-spark/community.png";
import psJoin from "../assets/work/penn-spark/join.png";

// ── shared taxonomy (single source of truth for the grid filters + the pills) ──
export type CatId = "design" | "engineering" | "graphics";
export const catLabels: Record<CatId, string> = {
  design: "Design",
  engineering: "Engineering",
  graphics: "Graphics/3D",
};
export const filters: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "design", label: "Design" },
  { id: "engineering", label: "Engineering" },
  { id: "graphics", label: "Graphics/3D" },
];

// ── case-study body blocks ──
export type MediaItem = {
  src?: ImageMetadata;
  embed?: string; // youtube id, or a full iframe URL
  alt?: string;
  caption?: string;
  placeholder?: string; // shown when no real media yet
};
export type Block =
  | { type: "prose"; label?: string; heading?: string; body: string[] }
  | { type: "list"; label?: string; heading?: string; items: string[] }
  | { type: "stats"; label?: string; items: { value: string; label: string }[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "media"; label?: string; layout?: "full" | "half" | "third"; ratio?: string; bare?: boolean; items: MediaItem[] };

export interface Project {
  slug: string;
  type?: "project" | "experience"; // experiences are minimal, NDA-safe role pages
  logo?: string; // brand logo (experience cards)
  years?: string; // compact date for the experience ledger
  order: number;
  title: string;
  tagline: string; // one-line thesis (hero)
  motif: string; // ProjectCover glyph
  cats: CatId[];
  kind: "design" | "engineering";
  date: string; // display
  context: string;
  role: string;
  team?: string;
  tools: string[];
  metaExtra?: { label: string; value: string };
  links: { live?: string; github?: string; video?: string; figma?: string; deck?: string };
  repoNote?: string; // e.g. private university repo — shown as a disabled affordance + note
  // grid card
  img: ImageMetadata | null;
  alt?: string;
  blurb: string;
  tech: string[];
  // detail page
  featured?: { type: "image" | "video" | "embed"; src?: ImageMetadata; embed?: string; alt?: string };
  metrics: { value: string; label: string }[];
  blocks: Block[];
  credits?: { name: string; contribution: string }[];
}

export const projects: Project[] = [
  {
    slug: "passenger",
    order: 1,
    title: "Passenger",
    tagline: "A cinematic Unreal Engine 5 short: a canyon, a train swallowed by roots, and hand-written painterly shaders that make real-time frames feel oil-painted.",
    motif: "waves",
    cats: ["graphics"],
    kind: "engineering",
    date: "Mar–Apr 2026",
    context: "Personal project",
    role: "Solo · environment, lighting, animation, shaders, render",
    tools: ["Unreal Engine 5", "Maya", "HLSL", "Megascans", "Movie Render Pipeline"],
    metaExtra: { label: "Output", value: "Cinematic · 2560×1080" },
    links: { video: "https://youtu.be/mSnqY3R2d-E" },
    img: passengerImg,
    alt: "Passenger — a canyon rendered with an anisotropic Kuwahara painterly shader",
    blurb:
      "A cinematic Unreal Engine 5 short where a figure walks a canyon, finds a train swallowed by roots, and picks up something that briefly opens the world backward. Built in Maya + UE5 with Lumen GI, hardware ray tracing, and custom HLSL shaders, including an anisotropic Kuwahara filter for a painterly look.",
    tech: ["Unreal 5", "Maya", "HLSL", "Megascans"],
    featured: { type: "video", embed: "mSnqY3R2d-E", alt: "Passenger — cinematic short" },
    metrics: [
      { value: "2560×1080", label: "render resolution" },
      { value: "64", label: "TSR samples / frame" },
      { value: "2", label: "custom HLSL shaders" },
    ],
    blocks: [
      {
        type: "prose",
        label: "Overview",
        body: [
          "Passenger crosses a canyon of sandstone walls scorched by a sun that has done this ten million times before. At the canyon's edge he finds a train, stopped long enough ago that birch trees have grown up through the floor, vines have claimed the grab rails, and wildflowers cover what was once the aisle. Inside, an apple — still quiet. He picks it up, and the world opens somewhere else.",
          "Built entirely in Unreal Engine 5, with character rigging and animation from Maya. The two environments, a sun-scorched Utah canyon and an overgrown subway car, share one lighting approach: real-time global illumination grounds each scene in believable light before the stylized shaders go on top.",
        ],
      },
      {
        type: "prose",
        label: "Scene 01 · Canyon",
        heading: "Building a Utah canyon in Unreal Engine 5",
        body: [
          "The canyon is assembled from Megascans photogrammetry (high-resolution rock faces and desert scatter), arranged to feel like it had always been there: no obvious tiling, no floating rocks, a sense of geological weight.",
          "Lumen global illumination handles the bounce that wraps into the walls from the sun angle. As the virtual sun nears the horizon, Lumen re-solves the GI in real time: deep amber shadow on one side, burnt orange on the lit face. No baking, no lightmaps; the lighting reacts as the camera moves.",
        ],
      },
      {
        type: "media",
        label: "Lighting studies",
        layout: "half",
        items: [
          { src: pgCanyonGolden, alt: "Canyon at golden hour", caption: "Golden hour · warm directional light, Lumen pulling amber deep into the walls" },
          { src: pgCanyonBlue, alt: "Canyon at blue hour", caption: "Blue hour · sun below the horizon, cool skylight fills the scene" },
        ],
      },
      {
        type: "prose",
        label: "Scene 02 · The train",
        heading: "A subway car swallowed by a decade of growth",
        body: [
          "The train is built on a modular NYC-style kit (car shells, doors, ceiling marquees, grab rails), then stripped of every sign of function. Birch trees push through the floor, hornbeam foliage fills the door frames, meadow grass covers the aisle, vines loop the rails. The LED marquee still cycles “DELAYS AHEAD” — but there are no delays, because there is no train anymore.",
          "All of the interior light comes from the sky through the broken canopy above. Lumen computes the soft, diffuse fill of overcast light filtering through leaves, with thin god rays catching mist scattered through the volume.",
        ],
      },
      {
        type: "media",
        label: "The train",
        layout: "half",
        items: [
          { src: pgTrainInterior, alt: "Overgrown subway car — marquee", caption: "The LED marquee still cycles “DELAYS AHEAD”" },
          { src: pgTrainExterior, alt: "Overgrown subway car — foliage", caption: "Foliage overtaking the abandoned car" },
        ],
      },
      {
        type: "prose",
        label: "Shaders",
        heading: "Hand-written post-process for a painterly look",
        body: [
          "The signature look is a custom anisotropic Kuwahara line shader: a Sobel operator detects the local edge gradient and its direction, which rotates four sampling quadrants to align with surface features. Each quadrant's mean and variance are computed, and the mean of the lowest-variance quadrant is returned, so flat areas resolve into coherent oil-paint patches while edges stay sharp. It's parameterised by brush radius, painterliness, and line thickness.",
          "A second toon/cell pass samples BaseColor from the GBuffer and quantises the scene into tonal bands with separate shadow/highlight tints. Both materials read real GBuffer channels (BaseColor, WorldNormal, SceneDepth) through SceneTexture nodes, so the stylisation responds to actual geometry, not just the final pixel.",
        ],
      },
      {
        type: "media",
        label: "Cell shader · off / on",
        layout: "half",
        items: [
          { src: pgCanyonGolden, alt: "Canyon 1 — cell shader off", caption: "Cell shader off · canyon 1" },
          { src: pgCanyonKuwahara, alt: "Canyon 1 — cell shader on", caption: "Cell shader on · canyon 1" },
          { src: pgCanyonWideOff, alt: "Canyon 2 — cell shader off", caption: "Cell shader off · canyon 2" },
          { src: pgCanyonWideOn, alt: "Canyon 2 — cell shader on", caption: "Cell shader on · canyon 2" },
          { src: pgTrainExterior, alt: "Train 1 — cell shader off", caption: "Cell shader off · train 1" },
          { src: pgTrainExtOn, alt: "Train 1 — cell shader on", caption: "Cell shader on · train 1" },
          { src: pgTrainIntOff, alt: "Train 2 — cell shader off", caption: "Cell shader off · train 2" },
          { src: pgTrainIntOn, alt: "Train 2 — cell shader on", caption: "Cell shader on · train 2" },
        ],
      },
      {
        type: "prose",
        label: "Technical breakdown",
        heading: "GBuffer passes: what the renderer sees",
        body: [
          "Unreal's Movie Render Pipeline can output individual GBuffer passes alongside the final composite, showing how the deferred renderer decomposes the scene before lighting. I used them to validate material authoring and debug the post-process shaders.",
        ],
      },
      {
        type: "media",
        label: "GBuffer",
        layout: "half",
        items: [
          { src: pgGbBase, alt: "BaseColor pass", caption: "BaseColor · flat albedo" },
          { src: pgGbNormal, alt: "WorldNormal pass", caption: "WorldNormal · encoded normals" },
          { src: pgGbRough, alt: "Roughness pass", caption: "Roughness · PBR channel" },
          { src: pgGbMetal, alt: "Metallic pass", caption: "Metallic · PBR channel" },
          { src: pgGbDepth, alt: "SceneDepth pass", caption: "SceneDepth · linear depth" },
          { src: pgGbHdr, alt: "Pre-tonemap HDR", caption: "Pre-tonemap HDR · before exposure" },
        ],
      },
      {
        type: "prose",
        label: "Maya pipeline",
        body: [
          "The stylised low-poly passenger was modelled, rigged, textured, and animated in Maya. The rig uses IK limb chains, a spline-IK spine, and foot orient constraints, driven by NURBS control curves. Core cycles (idle, walk, jump, sit, push-up, pickup) export as FBX clips into an Unreal Animation Blueprint that blends between them with a locomotion blend space and procedural secondary motion.",
        ],
      },
      { type: "media", label: "Character", layout: "full", items: [{ src: pgCharEngine, alt: "Character rendered in the canyon", caption: "The stylised passenger rendered in-engine with Lumen GI" }] },
      {
        type: "media",
        label: "Maya rig",
        layout: "third",
        items: [
          { src: pgMayaFront, alt: "Maya rig — front", caption: "Front · joint hierarchy & control curves" },
          { src: pgMayaSide, alt: "Maya rig — side", caption: "Side · IK leg chain & foot constraints" },
          { src: pgMayaTop, alt: "Maya rig — top", caption: "Top · shoulder & arm control layout" },
        ],
      },
      {
        type: "prose",
        label: "Render",
        body: [
          "The film renders through Unreal's Movie Render Pipeline rather than a viewport capture. Temporal Super Resolution accumulated over 64 samples per frame kills real-time shimmer, output at 2560×1080 (2.4:1) to push the eye wide, with hardware ray tracing for reflections and shadows over Lumen GI.",
        ],
      },
      {
        type: "prose",
        label: "Reflection",
        body: [
          "Writing the shaders by hand, rather than reaching for a plugin, is what made the look feel like mine, and reading the GBuffer directly taught me more about the deferred pipeline than any tutorial. The lesson that stuck: a real-time engine gives you a filmmaker's iteration speed, but only if you understand what it's actually computing each frame.",
        ],
      },
    ],
  },

  {
    slug: "mini-minecraft",
    order: 2,
    title: "Mini Minecraft",
    tagline: "A full 3D voxel world engine, built from first principles in C++ and OpenGL.",
    motif: "voxel",
    cats: ["engineering", "graphics"],
    kind: "engineering",
    date: "Apr 2026",
    context: "Team of 3 · Course",
    role: "Graphics & systems engineer",
    team: "Group of 3",
    tools: ["C++17", "OpenGL 3.3", "GLSL", "Qt", "Multithreading"],
    metaExtra: { label: "Course", value: "CIS 4600 · GPU Programming" },
    links: { video: "https://www.youtube.com/watch?v=_NExgS0mZgM" },
    repoNote: "This was a university class project, so the repo is kept private, but I'm happy to walk through the code on request.",
    img: miniMinecraftImg,
    alt: "Mini Minecraft — procedurally generated terrain at dusk",
    blurb:
      "A 3D voxel engine built from scratch in C++/OpenGL: seven procedural biomes from layered Perlin/FBM noise, 3D caves, PCF shadow mapping, screen-space reflections, a day-night cycle, multithreaded chunk streaming, and an A*-pathfinding NPC ecosystem.",
    tech: ["C++", "OpenGL", "GLSL", "Multithreading"],
    featured: { type: "video", embed: "_NExgS0mZgM", alt: "Mini Minecraft — engine demo" },
    metrics: [
      { value: "26", label: "C++ source files" },
      { value: "13", label: "GLSL shaders" },
      { value: "7", label: "procedural biomes" },
      { value: "7×7", label: "PCF shadow kernel" },
    ],
    blocks: [
      {
        type: "prose",
        label: "Overview",
        heading: "A faithful Minecraft engine: no game engine, no framework",
        body: [
          "Mini Minecraft is a tight, roughly month-long group project for CIS 4600 (GPU Programming) at Penn, built through April. The goal was to rebuild Minecraft's core engine (procedural world generation, real-time rendering, player physics, interactive terrain) using only C++17, OpenGL 3.3, and GLSL, with no game engine or rendering framework. The final codebase spans 26 C++ source files and 13 GLSL shaders.",
          "It ran across three milestones, each teammate owning distinct systems. My contributions spanned 7-biome procedural terrain, 3D cave generation with post-process fluid overlays, and a full render-pipeline upgrade: PCF shadow mapping, screen-space reflections, vertex ambient occlusion, distance fog, Blinn-Phong specular, and a day-night cycle.",
        ],
      },
      {
        type: "prose",
        label: "Milestone 01",
        heading: "Generating an infinite world across biomes",
        body: [
          "The world blends 7 biomes seamlessly from large-scale noise. Grassland and forest use a Voronoi-based hill field for soft rolling terrain; mountain and rocky variants use fractal Brownian motion over Perlin with an abs() warp for sharp STONE peaks capped in SNOW above Y=200; desert and snowland use low-amplitude Perlin fields surfaced with SAND or SNOW.",
          "Biomes blend via a large-scale Perlin value remapped to [0,1] through smoothstep(0.25, 0.75), used as the interpolation weight between adjacent height fields: clear zones, smooth transitions. Columns fill STONE from Y=0–128, biome surface Y=128–255, and empty columns between Y=128–138 fill with WATER for lakes and coastlines.",
        ],
      },
      {
        type: "media",
        label: "Terrain",
        layout: "half",
        items: [
          { src: mcGrassland, alt: "Grassland coast", caption: "Grassland · coastline, beach, and distant mountains under distance fog" },
          { src: mcBiomeBorder, alt: "Biome border", caption: "Stone mountain meeting grassland via smoothstep interpolation" },
        ],
      },
      {
        type: "prose",
        label: "Milestone 02",
        heading: "3D noise caves, fluid physics, and a post-process pipeline",
        body: [
          "3D Perlin noise (8 surflet contributions per grid cell, trilinear interpolation) carves every block below Y=128 where the value goes negative; caves below Y=25 fill with LAVA and all Y=0 blocks become unbreakable BEDROCK.",
          "WATER and LAVA are non-solid: the player moves at 0.8× speed inside fluid and swims up on Spacebar, with immersion read from both body and camera position. A post-process pass renders the scene to a framebuffer, then draws it on a fullscreen quad with a blue (water) or red (lava) tint based on camera position.",
        ],
      },
      {
        type: "media",
        label: "Caves",
        layout: "full",
        items: [{ src: mcCave, alt: "Underground cave with lava", caption: "3D Perlin caves · blocks below Y=128 carved by negative noise; lava fills below Y=25" }],
      },
      {
        type: "prose",
        label: "Milestone 03",
        heading: "Shadow mapping, SSR, ambient occlusion, and more",
        body: [
          "The final milestone was a full render-pipeline upgrade. PCF shadow mapping renders the scene from the light's orthographic view into a depth buffer; terrain fragments compare depth with a 7×7 PCF kernel and slope-scaled bias (with texel snapping) to kill acne and Peter-Panning.",
          "Screen-space reflections ray-march water rays against a view-space position buffer, blending with Fresnel weights and shoreline masking. Vertex ambient occlusion bakes per-face occupancy into the 64-byte interleaved vertex layout. A unified day-night cycle drives sun position, light color, fog, and sky gradient together, with Blinn-Phong specular tuned per material.",
        ],
      },
      {
        type: "media",
        label: "Rendering",
        layout: "half",
        items: [
          { src: mcMountainDusk, alt: "Mountain at dusk", caption: "Render pipeline · distance fog, Blinn-Phong specular, and sun bloom at dusk" },
          { src: mcWaterLake, alt: "Water lake", caption: "Water · empty columns fill as lakes, sky and terrain reflected on the surface" },
        ],
      },
      {
        type: "prose",
        label: "Reflection",
        heading: "What building a graphics engine teaches you",
        body: [
          "Building a renderer from first principles forces you to understand every stage — there's nowhere to hide when the shadow acne is yours. The biggest lesson was systems discipline across a team: clean interfaces between terrain, streaming, physics, and rendering were what let three people move fast without stepping on each other.",
        ],
      },
    ],
    credits: [
      { name: "Brian Lee", contribution: "Graphics & systems: procedural terrain & biomes, 3D caves + post-process, and the render pipeline (PCF shadows, SSR, vertex AO, day-night, fog, Blinn-Phong)." },
      { name: "Angelina Hu", contribution: "Terrain chunking (interleaved VBOs + face culling), multithreaded chunk streaming, view-frustum culling, day/night visuals, procedural assets, and audio." },
      { name: "Seth Thor", contribution: "Player physics & collision, texture-atlas UVs, animated water/lava shaders, A* pathfinding on a thread pool, and a predator-prey NPC ecosystem." },
    ],
  },

  {
    slug: "art-of-web",
    order: 3,
    title: "Art of the Web",
    tagline: "A semester of coursework rebuilt as one interactive Three.js world.",
    motif: "orbit",
    cats: ["engineering", "graphics", "design"],
    kind: "engineering",
    date: "Aug–Dec 2025",
    context: "Solo · Course",
    role: "Solo designer & developer",
    tools: ["Three.js", "GSAP", "SCSS", "p5.js", "Vite"],
    metaExtra: { label: "Output", value: "Interactive 3D portfolio" },
    links: { live: "https://leebwj.github.io/1020/portfolio/", github: "https://github.com/leebwj/ArtOfTheWeb" },
    img: null,
    alt: "Art of the Web — interactive Three.js portfolio",
    blurb:
      "A semester-long interactive portfolio built as one Three.js 3D scene, where floating GLTF objects with custom physics and GSAP animation become the navigation for eight course projects, from CSS art and generative p5.js sketches to a browser game.",
    tech: ["Three.js", "GSAP", "p5.js", "Vite"],
    featured: { type: "embed", embed: "https://leebwj.github.io/1020/portfolio/", alt: "Art of the Web — live site" },
    metrics: [
      { value: "9", label: "floating 3D objects" },
      { value: "8", label: "course projects" },
      { value: "1", label: "live Three.js world" },
    ],
    blocks: [
      {
        type: "prose",
        label: "Overview",
        heading: "A portfolio that is itself a project",
        body: [
          "Art of the Web is a course about the internet as a creative and cultural medium: how the web is built, who controls it, how it shapes culture. Instead of submitting work through an LMS, the format required building and maintaining a public portfolio all semester.",
          "So the portfolio became the project: how do you build something that feels as considered as the work it houses? The answer was a fully interactive 3D scene where each course project floats in space, clickable to reveal its details.",
        ],
      },
      {
        type: "prose",
        label: "The scene",
        heading: "A Three.js scene as an interface",
        body: [
          "It's built with Three.js and Vite, not a static page but a rendered WebGL scene. Nine GLTF models (a book, clock, globe, tape, cube, and others) drift continuously across the viewport, each one a course project; clicking opens a modal with its details.",
        ],
      },
      {
        type: "list",
        label: "Systems",
        items: [
          "Custom physics: per-object velocity + angular velocity each frame, radius-based collision resolution, restitution off the viewport bounds, and a slow random drift to keep the scene alive.",
          "GLTF loading: GLTFLoader auto-scales and centers each model from its bounding box; a loading screen tracks all load promises before the scene goes interactive.",
          "Raycasting: mouse → normalized device coords each frame; a Raycaster detects the hovered object, which scales up on a GSAP spring; click opens the modal.",
          "Lighting: ambient, directional, hemisphere, and rim lights with a PMREM environment map for accurate reflections.",
          "GSAP + OrbitControls: spring-based modal, hover, and camera transitions; a freely orbitable camera with damping and distance limits.",
        ],
      },
      {
        type: "list",
        label: "Inside",
        heading: "Eight projects, each a different medium",
        items: [
          "F1 ASCII Animation: a Formula 1 race animated in pure CSS/HTML with ASCII characters.",
          "CSS Still Life: an 800×600 still life built entirely from divs, gradients, and keyframes. No images.",
          "Blue Mixtape: a multi-page music zine as a navigable site (HTML + CSS grid/flex).",
          "Data Footprints: an interactive site on personal data and web tracking, in vanilla JS.",
          "p5.js Clock: a generative clock where seconds, minutes, and hours each drive their own visual system.",
          "Tame the Cat: a scripted browser game with a state machine and chance elements.",
          "QuadTree Painter: a generative Mondrian-style painter (Canvas API) from recursive quadtree splits.",
          "API Tool Pitch: a team single-page pitch for an IFTTT-linked assistive tool.",
        ],
      },
      {
        type: "prose",
        label: "Reflection",
        heading: "When the container is as interesting as the content",
        body: [
          "Building the navigation as a physics scene made it more fun to make and to browse, and it taught me a lot about performance budgeting on the web, where one unoptimized GLTF can tank the frame rate.",
        ],
      },
    ],
  },

  {
    slug: "penn-spark-redesign",
    order: 4,
    title: "Penn Spark Redesign",
    tagline: "A ground-up website redesign, from Figma to a live Next.js rebuild.",
    motif: "grid",
    cats: ["design", "engineering"],
    kind: "design",
    date: "Sep–Dec 2025",
    context: "Team · Project lead",
    role: "Project lead · designer & developer",
    team: "10+ designers & developers",
    tools: ["Figma", "Next.js", "React", "Tailwind"],
    metaExtra: { label: "Outcome", value: "Shipped · pennspark.org" },
    links: { live: "https://pennspark.org/", deck: "https://www.figma.com/deck/Smncuea22qlU67fbiESZaP" },
    img: pennSparkImg,
    alt: "Penn Spark — redesigned club website homepage",
    blurb:
      "Led the end-to-end redesign of Penn Spark's website as project lead: wireframes and a component system in Figma, then a rebuild from an aging Gatsby stack to Next.js + React. Shipped live at pennspark.org.",
    tech: ["Figma", "Next.js", "React", "Tailwind"],
    featured: { type: "image", src: pennSparkImg, alt: "Penn Spark redesigned homepage" },
    metrics: [
      { value: "10+", label: "designers & devs" },
      { value: "Gatsby → Next", label: "stack migration" },
      { value: "Live", label: "at pennspark.org" },
    ],
    blocks: [
      {
        type: "prose",
        label: "Overview",
        heading: "Leading a full redesign from design to deployment",
        body: [
          "Penn Spark is Penn's student-run community of designers and developers, where teams build software together, from passion projects to client work for real organizations and non-profits. As project lead for the website redesign, the work spanned both ends of the stack: leading a team through a Figma-first design process, then rebuilding the site from the ground up in code.",
          "The existing site ran on Gatsby and hadn't been meaningfully updated in years: inconsistent branding, outdated content, slow performance, and a codebase that was hard for non-technical members to maintain. The redesign was a chance to fix all of it at once.",
        ],
      },
      {
        type: "prose",
        label: "Problem",
        heading: "A public face that didn't reflect the club's quality",
        body: [
          "The site is the first thing potential members, clients, and partners see, and it didn't match the quality of the club's actual work. Four issues needed fixing:",
        ],
      },
      {
        type: "list",
        items: [
          "Stale visual design: dated, with inconsistent brand colors, type, and layout across pages.",
          "Poor information architecture: hard to grasp what the club does, who's on the team, or how to get involved.",
          "Outdated Gatsby stack: slow to build, hard to update, no shared component system or structured content.",
          "No case-study content: past project work had no showcase; the club's impact was invisible.",
        ],
      },
      {
        type: "prose",
        label: "Process",
        heading: "Design-first, then build",
        body: [
          "It started in Figma, not code. Wireframes set the structure and hierarchy across the key pages (Home, About, Projects, Join, Contact), with a component system built alongside: typography, spacing, color tokens, and reusable patterns like cards, nav, and CTA blocks.",
          "Once the team reviewed and approved the hi-fi designs, development moved to Next.js + React, a deliberate choice: better performance than Gatsby for a marketing site, and a component model that maps directly to the Figma structure. Tailwind kept styling fast and consistent; shared components (NavBar, ProjectCard, TeamMember, Footer) were built once and reused. Case studies were structured as data files so future members can add projects without touching component code.",
        ],
      },
      {
        type: "media",
        label: "Screens",
        layout: "full",
        items: [
          { src: psHome, alt: "Redesigned homepage", caption: "Redesigned homepage · hero section" },
          { src: psClient, alt: "Client Projects", caption: "Client Projects · the case-study showcase the old site lacked" },
          { src: psCommunity, alt: "Community section", caption: "Community · a scattered-photo layout of real club events" },
          { src: psJoin, alt: "Join section", caption: "Join · a dramatic tonal shift driving the recruitment CTA" },
        ],
      },
      {
        type: "prose",
        label: "Outcome",
        heading: "A faster, more cohesive site the club can maintain",
        body: [
          "The redesigned pennspark.org launched at the end of Fall 2025. It loads significantly faster, has a consistent identity across every page, and finally surfaces the club's project work through dedicated case-study pages.",
          "Because content is structured as data, future project leads add case studies, team members, and events by editing data files, not components. Both the Figma design system and the code component library are documented and handed off. Leading this end to end, from research and wireframes through design system and deployment, was one of the most complete product experiences in my work so far.",
        ],
      },
    ],
  },

  {
    slug: "path-at-penn",
    order: 5,
    title: "Path@Penn Redesign",
    tagline: "A self-directed UX overhaul of Penn's course-planning portal.",
    motif: "path",
    cats: ["design"],
    kind: "design",
    date: "Mar 2026",
    context: "Solo · Self-directed",
    role: "Solo designer & UX researcher",
    tools: ["Figma", "UX Research", "Prototyping", "User Testing"],
    metaExtra: { label: "Deliverable", value: "Hi-fi prototype · 4 surfaces" },
    links: { figma: "https://www.figma.com/proto/DBOeERCANozjTRaP6VYxIb/Brian-Lee---Design?node-id=47-409", deck: "https://www.figma.com/deck/KYlvDCdz7M2VCTRki5Vvag" },
    img: pathImg,
    alt: "Path@Penn — redesigned student course-planning dashboard",
    blurb:
      "A self-directed UX overhaul of Penn's course portal, distilling a dense, fragmented interface into four connected surfaces (Dashboard, Course, Schedule, Degree) for clearer, more guided planning.",
    tech: ["Figma", "UX Research", "Prototyping", "User Testing"],
    featured: {
      type: "embed",
      embed: "https://embed.figma.com/proto/DBOeERCANozjTRaP6VYxIb/Brian-Lee---Design?node-id=47-409&scaling=scale-down-width&content-scaling=fixed&page-id=42%3A398&embed-host=share",
      alt: "Path@Penn — live prototype",
    },
    metrics: [
      { value: "4", label: "redesigned surfaces" },
      { value: "Solo", label: "research → hi-fi" },
    ],
    blocks: [
      {
        type: "prose",
        label: "Overview",
        body: [
          "Path@Penn is the University of Pennsylvania's primary portal for course registration, schedule planning, and degree tracking, a tool every student relies on each semester. Despite its central role, the experience is a dense, fragmented interface that makes planning harder than it needs to be, especially for first-time users.",
          "This was a self-directed project: no client, no team, no brief. The goal: take a platform students use out of necessity, not by choice, and redesign it into something genuinely useful, intuitive, and cohesive.",
        ],
      },
      {
        type: "prose",
        label: "Problem",
        heading: "A platform that works against its users",
        body: [
          "The core frustration isn't one broken feature — it's the cumulative friction of many small failures. Four pain points kept recurring:",
        ],
      },
      {
        type: "list",
        items: [
          "Dense, information-heavy interface: too much surfaced at once to focus on the task at hand.",
          "Fragmented workflows: a single task like adding a course spans multiple pages with no clear thread.",
          "Unclear registration feedback: after enrolling, it's ambiguous whether it succeeded, failed, or waitlisted, and why.",
          "Reliance on external tools: students fall back on Penn Course Review, Course Plan, and spreadsheets to fill the gaps.",
        ],
      },
      { type: "quote", text: "I use like four different apps just to plan my schedule. Path@Penn is the last step — I don't actually use it to plan anything.", cite: "Student · informal interview" },
      {
        type: "prose",
        label: "Research",
        heading: "Grounding the redesign in real student behavior",
        body: [
          "Before touching Figma, I spent time understanding how students actually use the platform, not how they're supposed to, through observational walkthroughs, informal interviews, and a heuristic audit of the existing UI.",
        ],
      },
      {
        type: "list",
        label: "Insights",
        items: [
          "Students carry a “browse → plan → register → track” mental model; Path@Penn maps to none of it.",
          "The degree audit, one of the most important planning tools, is functionally hidden.",
          "Registration feedback (seats, conflicts, prerequisites) is buried in text, not surfaced when it's needed.",
          "First-years especially report feeling “lost” on opening the portal, unsure where to start.",
        ],
      },
      {
        type: "media",
        label: "Research",
        layout: "half",
        items: [
          { src: pathInterview, alt: "User interviews", caption: "User interviews · how students actually navigate the portal" },
          { src: pathTesting, alt: "User testing", caption: "Task-based testing with a think-aloud protocol" },
        ],
      },
      {
        type: "prose",
        label: "Process",
        heading: "From lo-fi structure to a high-fidelity prototype",
        body: [
          "Structure first, visuals second. Lo-fi wireframes worked the information architecture (what lives where, how sections connect, how navigation signals progress) before settling on four sections that mirror how students actually think about planning.",
          "Mid-fi prototypes were tested with peers doing real tasks (find a course, add it, check degree progress) while thinking aloud; that feedback simplified the navigation and made the registration-confirmation state far more explicit. Hi-fi designs were built in Figma on a shared component system (type styles, color tokens, reusable components) so the four sections stay cohesive.",
        ],
      },
      {
        type: "list",
        label: "The four surfaces",
        items: [
          "Dashboard: a personalized home with deadlines, semester progress, and quick actions up front.",
          "Course: search-first, live filtering by requirement / schedule / instructor, details expanding inline.",
          "Schedule: a visual weekly view with real-time conflict detection.",
          "Degree: a clear visual audit of what's done, in progress, and still needed.",
        ],
      },
      {
        type: "media",
        label: "Screens",
        layout: "full",
        items: [
          { src: pathDashboard, alt: "Redesigned dashboard", caption: "Dashboard · deadlines, semester progress, and quick actions" },
          { src: pathCourse, alt: "Course search", caption: "Course · search-first, with live filtering" },
          { src: pathSchedule, alt: "Schedule view", caption: "Schedule · a visual weekly view with conflict detection" },
          { src: pathDegree, alt: "Degree audit", caption: "Degree · a clear visual audit of requirements" },
        ],
      },
      {
        type: "prose",
        label: "Outcome",
        body: [
          "The final prototype is a fundamentally different experience, not by adding features but by reorganizing what already exists into a structure that matches how students plan. It reduces clicks to complete core tasks, surfaces registration feedback at the point of action, and gives students one trustworthy place to see where they stand toward graduation, without a separate app.",
        ],
      },
    ],
  },

  {
    slug: "road-rogue",
    order: 6,
    title: "Road Rogue",
    tagline: "A 3D browser chase game built with an AI-assisted pipeline: Meshy for the 3D assets, Codex for the game logic, and Three.js to tie it together.",
    motif: "road",
    cats: ["graphics", "engineering"],
    kind: "engineering",
    date: "Nov 2025",
    context: "Solo · Course",
    role: "Solo developer & game designer",
    tools: ["Three.js", "JavaScript", "Meshy", "Codex"],
    metaExtra: { label: "Platform", value: "HTML · playable" },
    links: { live: "https://leebwj.github.io/0020/Final/index.html", github: "https://github.com/leebwj/RodeRogue" },
    img: roadRogueImg,
    alt: "Road Rogue — 3D car-chase game",
    blurb:
      "A 3D car-chase game (à la Smashy Road) built for a design course on AI-assisted creation: 3D assets from Meshy, logic scaffolded with Codex, assembled in Three.js. Responsive driving and a survival score that ramps the tension.",
    tech: ["Three.js", "JavaScript", "Meshy", "Game Design"],
    featured: { type: "image", src: roadRogueImg, alt: "Road Rogue gameplay" },
    metrics: [
      { value: "Meshy", label: "AI-generated 3D assets" },
      { value: "HTML", label: "playable, no install" },
    ],
    blocks: [
      {
        type: "prose",
        label: "Overview",
        heading: "A vibe-coded 3D chase game, built with AI tools",
        body: [
          "Road Rogue is a 3D car-chase game inspired by Smashy Road, built for a design course exploring AI-assisted creation. The brief was open: use AI tools to design and build something interactive. The result: a browser chase where you drive a getaway car through a low-poly city while police pursue you, surviving as long as you can.",
          "It was fully vibe-coded, with 3D assets from Meshy (text-to-3D) and game logic scaffolded and debugged with Codex, wired together in Three.js. The workflow felt more like directing than programming: describe what you want, evaluate the output, steer toward something that feels good.",
        ],
      },
      {
        type: "prose",
        label: "AI workflow",
        heading: "Meshy + Codex + Three.js",
        body: [
          "The tools shaped the process as much as the concept. Assets came from Meshy's text-to-3D pipeline: prompts described shape, style, and detail; several iterations per asset were generated and the best chosen, closer to art direction than modelling. Game logic (driving physics, police AI, collision, scoring) was scaffolded through Codex: describe a system in plain language, evaluate the generated code, find what's wrong, and re-prompt with tighter constraints.",
        ],
      },
      {
        type: "list",
        label: "Systems",
        items: [
          "Driving: velocity- and friction-based movement so the car has weight; distinct acceleration, braking, and steering.",
          "Police AI: pursuit vehicles track the player with basic steering, spawning progressively as the score climbs.",
          "Procedural city: modular road and building blocks assembled at runtime, so each run has a different layout.",
          "Score & difficulty: a survival timer drives the score; police speed and spawn rate ramp as it rises.",
        ],
      },
      {
        type: "prose",
        label: "Reflection",
        heading: "What vibe-coding actually teaches you",
        body: [
          "AI tools are great for getting to a first playable fast, but the part that makes it fun, the driving feel, still came down to hand-tuning. The real skill vibe-coding builds is evaluation: knowing what “good” looks like and steering toward it, because the tools will happily generate plausible-but-wrong just as easily as right.",
        ],
      },
    ],
  },

  {
    slug: "capsule",
    order: 7,
    title: "Capsule",
    tagline: "A collaborative web app for digital time capsules: lock photos and messages until a chosen date, then open them inside an immersive 3D gallery.",
    motif: "orbit",
    cats: ["design", "engineering", "graphics"],
    kind: "engineering",
    date: "Spring 2025",
    context: "Team project",
    role: "Design & full-stack · UI, 3D gallery, API",
    team: "Team project",
    tools: ["React", "React Three Fiber", "Node.js", "MongoDB", "AWS S3", "Blender"],
    metaExtra: { label: "Stack", value: "Full-stack + 3D web app" },
    links: { github: "https://github.com/leebwj/sp25-penn-time-capsule", figma: "https://www.figma.com/proto/xNLzE7NKvOo9SToBUZtaSn/Penn-Time-Capsule?node-id=913-1430" },
    img: null,
    alt: "Capsule — a 3D time-capsule reveal gallery",
    blurb:
      "A collaborative web app where users create digital time capsules (photos, messages, media) locked until a chosen date, then revealed through an immersive 3D gallery. Built with React Three Fiber, a Node/MongoDB API, and AWS S3.",
    tech: ["React", "R3F", "Node", "MongoDB"],
    featured: { type: "embed", embed: "https://embed.figma.com/proto/xNLzE7NKvOo9SToBUZtaSn/Penn-Time-Capsule?node-id=913-1430&scaling=contain&content-scaling=fixed&page-id=662%3A1067&embed-host=share", alt: "Capsule — prototype" },
    metrics: [
      { value: "React · R3F", label: "3D front end" },
      { value: "Node · Mongo · S3", label: "back end" },
      { value: "Team", label: "collaborative capsules" },
    ],
    blocks: [
      { type: "prose", label: "Overview", heading: "Memories, locked in 3D, revealed in time", body: [
        "Capsule is a collaborative web app where users create digital time capsules, containers for photos, messages, and media, locked until a chosen date. When the date arrives, the capsule opens and its contents are revealed through an immersive 3D gallery.",
        "The concept was inspired by Japanese gachapon machines: turning a dial, receiving a capsule, opening it to discover what's inside. That anticipation-and-reveal shaped both the interaction design and the 3D visual language.",
      ] },
      { type: "prose", label: "Design", heading: "Designing around the moment of reveal", body: [
        "The UI and flows were designed in Figma first, built around a specific emotional arc (creation, anticipation, reveal), each phase with its own visual and interaction language.",
      ] },
      { type: "list", items: [
        "Creation: a clean, form-driven flow for uploading media and writing messages; lightweight, so the weight goes into the content.",
        "Waiting: a 3D gallery where locked capsules float and rotate, tactile but inaccessible, their look hinting at the contents inside.",
        "Reveal: on unlock, an animation plays: the capsule opens and its contents spill into the gallery, like a gift being unwrapped.",
      ] },
      { type: "prose", label: "Development", heading: "Full-stack, with 3D at the center", body: [
        "The front end is React + React Three Fiber (a React renderer for Three.js), so the 3D gallery is composable with app state: capsules fetched from the database appear in the scene, and clicks on 3D objects trigger app logic. The back end is a Node.js API over MongoDB, with media in AWS S3 via pre-signed URLs to keep large binaries out of the database.",
      ] },
      { type: "list", label: "Hard parts", items: [
        "Date-gated content: capsule contents are encrypted at rest and only served after the unlock date, verified server-side on every request.",
        "Collaborative access: multiple contributors per capsule before it locks, which meant careful permission and notification design.",
        "3D performance: GLTF compression + level-of-detail logic keep the gallery smooth as it fills with models.",
      ] },
      { type: "prose", label: "Reflection", heading: "When design and code reinforce each other", body: [
        "Because I owned both the Figma and the React Three Fiber build, design decisions and technical constraints could push on each other in real time: the reveal animation was designed knowing exactly what the runtime could afford, and vice versa. That tight loop is where the project felt most like my own.",
      ] },
    ],
  },

  {
    slug: "wikipedia",
    order: 8,
    title: "Wikipedia Redesign",
    tagline: "Redesigning the world's largest encyclopedia for how people actually read.",
    motif: "grid",
    cats: ["design"],
    kind: "design",
    date: "Apr 2026",
    context: "Solo · Course (DSGN 2570)",
    role: "Solo designer & UX researcher",
    tools: ["Figma", "UX Research", "User Testing", "Prototyping"],
    metaExtra: { label: "Deliverable", value: "Hi-fi prototype" },
    links: { figma: "https://www.figma.com/proto/vKo7ySkGZW5dliYa44yHwa/Brian-Lee---Design?node-id=103-7273" },
    img: wikiCover,
    alt: "Wikipedia mobile redesign — five redesigned sections",
    blurb:
      "A full research-to-prototype redesign of Wikipedia's mobile interface for DSGN 2570: interviews, a survey, insight synthesis, lo-fi wireframes, usability testing with four users, and a hi-fi prototype across five sections (Home, Article, Search, Language, AI Chat).",
    tech: ["Figma", "UX Research", "User Testing"],
    featured: { type: "embed", embed: "https://embed.figma.com/proto/vKo7ySkGZW5dliYa44yHwa/Brian-Lee---Design?node-id=103-7273&scaling=scale-down&content-scaling=fixed&page-id=27%3A377&embed-host=share", alt: "Wikipedia redesign — live prototype" },
    metrics: [
      { value: "3", label: "user interviews" },
      { value: "4", label: "usability-test participants" },
      { value: "5", label: "redesigned sections" },
    ],
    blocks: [
      { type: "prose", label: "Overview", heading: "Redesigning Wikipedia for how people actually read", body: [
        "Wikipedia is where most research begins, but its mobile experience hasn't kept pace with how people consume information: scanning rather than reading, jumping between sections, expecting summaries before committing to depth.",
        "For DSGN 2570, Penn's User Experience (UX) and User Interface (UI) Design course, I ran a complete research-to-prototype redesign of Wikipedia's mobile interface: structured interviews, a survey, insight and How-Might-We synthesis, lo-fi wireframes, usability testing with four participants, and a hi-fi prototype across five sections: Home, Article, Search, Language, and an AI Chat feature.",
      ] },
      { type: "media", label: "Concept", layout: "full", bare: true, items: [{ src: wikiCover, alt: "Wikipedia mobile redesign — concept mockup", caption: "The redesigned mobile experience" }] },
      { type: "prose", label: "Problem", heading: "Built for encyclopedias, not for people in a hurry", body: [
        "Wikipedia's mobile app functions — but functioning isn't the same as working well. Several structural mismatches surfaced between what the interface offers and how people move through information:",
      ] },
      { type: "list", items: [
        "Dense, unstructured text: long articles with little hierarchy force linear reading; no summary, no way to preview relevance.",
        "Broken in-article navigation: people rely on Ctrl+F because the built-in section nav is insufficient or invisible.",
        "Cognitive overload: technical topics sprawl into dozens of sections; without filtering, users abandon to Google.",
        "Buried language settings: the language toggle is hard to find and ambiguous (app language vs. article language).",
        "No smart-summary layer: tools like Perplexity surface answers first; Wikipedia offers nothing equivalent.",
      ] },
      { type: "quote", text: "I usually just Ctrl+F whatever I'm looking for. I don't actually read the article — I just scan for the part I need.", cite: "Interview participant" },
      { type: "prose", label: "Research", heading: "How three different users actually use Wikipedia", body: [
        "Three structured interviews across different academic backgrounds (Wharton Finance, College Neuroscience, Engineering CS) covered usage patterns, navigation, pain points, mobile vs. desktop, competing tools, and improvement ideas, with a survey capturing quantitative data.",
      ] },
      { type: "list", label: "Findings", items: [
        "All three use Wikipedia for quick background (skimming, not reading) and lean on Ctrl+F because headers aren't enough.",
        "Dense terminology drives abandonment to Google rather than persisting through the page.",
        "Most Wikipedia features (language, TOC, discussion) are effectively hidden: they exist but go unused.",
        "Mobile is notably worse than desktop: smaller targets, more scrolling, a harder-to-reach table of contents.",
      ] },
      { type: "prose", label: "Structure", heading: "Mapping the redesign before the visuals", body: [
        "Lo-fi screens set the information architecture before any visual design: a search-first Home with trending keywords and the featured article up front; a persistent, scrollable section-header strip replacing the buried TOC, plus a floating action menu; Language separated and relabeled “Article Language”; and an AI Chat tab as a quick-summary layer over the knowledge base.",
      ] },
      { type: "media", label: "Lo-fi", layout: "full", items: [{ src: wikiLofi, alt: "Lo-fi wireframes", caption: "Lo-fi screens set the information architecture before any visual design" }] },
      { type: "prose", label: "Testing", heading: "Four users, five tasks, one prototype", body: [
        "Mid-fi prototypes were tested with four participants from different Penn schools, each running five task-based prompts while thinking aloud. The home page was understood immediately; but users wanted section previews before committing, article snippets in search results, and clearer framing that Language changes the article and that AI Chat produces summaries, not full answers; each fed directly into the final design.",
      ] },
      { type: "media", label: "Testing", layout: "full", items: [{ src: wikiTesting, alt: "User testing", caption: "Task-based sessions with four participants across different Penn schools" }] },
      { type: "media", label: "Final design", layout: "half", items: [
        { src: wikiHome, alt: "Redesigned home", caption: "Home · search-first, with trending keywords and the featured article" },
        { src: wikiArticle, alt: "Redesigned article", caption: "Article · a persistent section-header strip replaces the buried TOC" },
        { src: wikiSearch, alt: "Search results", caption: "Search · results with article snippets, not just titles" },
        { src: wikiChat, alt: "AI Chat", caption: "AI Chat · a quick-summary layer over the knowledge base" },
      ] },
      { type: "prose", label: "Reflection", heading: "What habituation hides from usability", body: [
        "The biggest lesson was how much habituation masks: people had stopped noticing Wikipedia's friction because they'd built workarounds (Ctrl+F, jumping to Google) into muscle memory. Good usability work means designing for what people actually do, not the coping strategies they've normalised.",
      ] },
    ],
  },

  {
    slug: "playground",
    order: 9,
    title: "Playground",
    tagline: "A childhood game character rebuilt in interactive 3D, modeled, textured, and rigged in Maya, then wired into the browser so it reacts to you.",
    motif: "waves",
    cats: ["graphics"],
    kind: "engineering",
    date: "2025",
    context: "Solo · Personal",
    role: "Solo · modeling, texturing, rigging, animation",
    tools: ["Maya", "Substance Painter", "Photoshop", "Spline"],
    metaExtra: { label: "Runtime", value: "Interactive · browser (Spline)" },
    links: { live: "https://my.spline.design/untitled-QVRKLSCWxKCmX5aAVZUXDukV/" },
    img: null,
    alt: "Playground — an interactive 3D character scene",
    blurb:
      "An interactive 3D scene built around “Boo,” a childhood-game character: modeled in Maya, textured in Substance Painter, rigged and animated, then wired into Spline so keyboard and mouse input trigger reactions in the browser.",
    tech: ["Maya", "Substance Painter", "Spline"],
    featured: { type: "embed", embed: "https://my.spline.design/untitled-QVRKLSCWxKCmX5aAVZUXDukV/", alt: "Playground — interactive 3D scene" },
    metrics: [
      { value: "Interactive", label: "in-browser 3D" },
      { value: "Maya → Spline", label: "model to runtime" },
    ],
    blocks: [
      { type: "prose", label: "Overview", heading: "A childhood memory, brought to life in 3D", body: [
        "Playground is an interactive 3D scene built around “Boo,” a character from a childhood game that stuck with me. It wasn't about recreating the game, but capturing its feeling: the playfulness, the slight eeriness, the sense that something is alive and reacting to you.",
        "The scene lives in the browser: keyboard and mouse trigger different animations, and Boo reacts, moves, and shifts its attention. The interaction is simple; the goal was to make even simple interactions feel full of personality.",
      ] },
      { type: "prose", label: "Craft", heading: "From polygon to personality", body: [
        "The character was modeled from scratch in Maya, basic polygons sculpted toward Boo's rounded, soft silhouette, then textured in Substance Painter with hand-painted albedo and subtle imperfections so the white surface feels like a physical object, not a flat CG render. Rigging and animation were set up in Maya and exported to Spline, whose browser runtime maps click, keyboard, and hover inputs to animation states.",
      ] },
      { type: "list", label: "Animation", items: [
        "Idle: a subtle floating loop with gentle eye tracking, so Boo feels aware even at rest.",
        "Triggered reactions: surprise, curiosity, playfulness, each loopable and blending smoothly back to idle.",
        "Environment: simple geometric shapes and a limited palette keep the focus on Boo, no visual noise.",
      ] },
      { type: "prose", label: "Reflection", heading: "What animation teaches you about character", body: [
        "Giving a static model personality is almost entirely in the timing and weight of its motion — a few frames of anticipation or overshoot do more than any amount of surface detail. Animation is where the character actually lives.",
      ] },
    ],
  },

  // ── work experience — concise, NDA-safe role pages (à la emmiwu.com/t-mobile) ──
  {
    slug: "aleph-lab",
    type: "experience",
    logo: "/logos/aleph.png",
    order: 101,
    title: "Aleph Lab",
    tagline: "Software engineering at a Y Combinator startup building an AI language buddy that lives inside the games kids already play.",
    motif: "grid",
    cats: [],
    kind: "engineering",
    date: "2026 – present",
    years: "2026 – Now",
    context: "Internship · Remote",
    role: "Software Engineer Intern",
    tools: [],
    metaExtra: { label: "Backed by", value: "Y Combinator · F25" },
    links: { live: "https://alephlab.ai" },
    img: null,
    blurb: "Software engineering intern at a Y Combinator (F25) startup building an AI language-learning companion that lives inside the games kids already play.",
    tech: [],
    metrics: [],
    blocks: [
      { type: "prose", label: "Company", body: [
        "Aleph Lab is a San Francisco AI startup in Y Combinator's Fall 2025 batch. Its product, Aleph Kids, is an AI language-learning companion: a voice-enabled character named “Annie” that talks and plays with children inside games they already love, like Minecraft, so they practice speaking a new language while they play.",
      ] },
      { type: "prose", label: "Note", body: [
        "My work here is early-stage and under wraps, but I'm happy to talk through it in more detail over a call.",
      ] },
    ],
  },
  {
    slug: "penn-spark",
    type: "experience",
    logo: "/logos/pennspark.png",
    order: 102,
    title: "Penn Spark",
    tagline: "Leading cross-functional teams of 15+ designers and developers to ship client-facing 0→1 products at Penn's student product studio.",
    motif: "grid",
    cats: [],
    kind: "design",
    date: "Jan 2025 – present",
    years: "2025 – Now",
    context: "Philadelphia, PA",
    role: "Red Project Lead · Product Designer",
    team: "15+ designers & developers",
    tools: ["Figma", "React", "TypeScript"],
    links: { live: "https://pennspark.org/" },
    img: null,
    blurb: "Red-team project lead and product designer at Penn's student product studio, leading 15+ designers and developers to ship client-facing 0→1 products.",
    tech: [],
    metrics: [],
    blocks: [
      { type: "prose", label: "Overview", body: [
        "Penn Spark is the University of Pennsylvania's student-run design and development community, where cross-functional teams of designers and developers partner with organizations and non-profits to build software from 0 to 1. I lead a “Red” team as Project Lead and Product Designer.",
      ] },
      { type: "list", label: "What I worked on", items: [
        "Led cross-functional teams of 15+ designers and developers to ship client-facing 0→1 products",
        "Defined end-to-end user flows, interaction patterns, and scalable interface systems",
        "Shipped polished, user-centered features across semester-long project cycles",
      ] },
      { type: "prose", label: "Note", body: [
        "I also led Penn Spark's own website redesign; that case study is in Selected Work. Some client-project details are kept private.",
      ] },
    ],
  },
  {
    slug: "bitmango",
    type: "experience",
    logo: "/logos/bitmango.png",
    order: 103,
    title: "BitMango · Puzzle1 Studio",
    tagline: "Maintaining and shipping live Unity mobile games at a puzzle-game studio.",
    motif: "voxel",
    cats: [],
    kind: "engineering",
    date: "Jun – Aug 2025",
    years: "2025",
    context: "Pangyo, South Korea",
    role: "Software Engineer Intern",
    team: "Mobile games studio",
    tools: ["Unity", "C#"],
    metaExtra: { label: "Reach", value: "420M+ downloads" },
    links: { live: "https://www.bitmango.com/en/homepageen/" },
    img: null,
    blurb: "Software engineering intern maintaining 50+ live Unity mobile titles and resolving 100+ QA bugs at a Korean puzzle-game studio.",
    tech: [],
    metrics: [],
    blocks: [
      { type: "prose", label: "Company", body: [
        "BitMango is a South Korean mobile-game company (founded 2011) behind casual puzzle hits like Roll the Ball, Word Cookies, and Block! Hexa Puzzle, with over 420 million downloads. Its development team spun out in 2019 as Puzzle1 Studio, which builds the games while BitMango publishes.",
      ] },
      { type: "list", label: "What I worked on", items: [
        "Maintained 50+ live Unity mobile titles, improving UI/UX and core gameplay stability across deployments",
        "Upgraded SDKs and platform modules to keep titles compliant with evolving app-store requirements",
        "Resolved 100+ QA-report bugs by modifying Unity prefabs and C# scripts",
      ] },
      { type: "prose", label: "Note", body: ["The titles I worked on are live on the App Store and Google Play, and I'm happy to point you to the specific games and fixes on request."] },
    ],
  },
  {
    slug: "it-farm",
    type: "experience",
    logo: "/logos/itfarm.png",
    order: 104,
    title: "IT-Farm",
    tagline: "Designing SQL database tooling over million-row semiconductor datasets at a Korean semiconductor smart-factory IT company.",
    motif: "path",
    cats: [],
    kind: "engineering",
    date: "Jun – Aug 2022",
    years: "2022",
    context: "Seongnam, South Korea",
    role: "Database Engineer Intern",
    team: "Semiconductor IT solutions",
    tools: ["Oracle", "SQLite", "SQL"],
    metaExtra: { label: "Scale", value: "1M+ data entities" },
    links: { live: "https://it-farm.co.kr/" },
    img: null,
    blurb: "Database engineering intern building SQL tooling over million-row semiconductor datasets at a Korean smart-factory IT company.",
    tech: [],
    metrics: [],
    blocks: [
      { type: "prose", label: "Company", body: [
        "IT-Farm (아이티팜) is a South Korean semiconductor IT-solutions company in Seongnam. It builds AI, image-processing, and smart-factory automation systems (MES/CIM integration, equipment control, and data-collection and quality-analysis tools) for semiconductor and display manufacturers.",
      ] },
      { type: "list", label: "What I worked on", items: [
        "Designed and implemented a SQL database prototype managing 1M+ data entities (Oracle, SQLite)",
        "Processed and organized semiconductor datasets from 20+ client companies, including Samsung, SK, and LG",
        "Wrote and optimized SQL queries for faster retrieval across large-scale datasets",
      ] },
      { type: "prose", label: "Note", body: [
        "The underlying client datasets are confidential, but I can speak to the systems and my process in more detail on request.",
      ] },
    ],
  },
];

export const projectsOnly = projects.filter((p) => (p.type ?? "project") !== "experience");
export const experiences = projects.filter((p) => p.type === "experience");
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

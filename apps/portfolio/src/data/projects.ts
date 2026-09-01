import type { ImageMetadata } from "astro";
import passengerImg from "../assets/work/passenger.png";
import miniMinecraftImg from "../assets/work/mini-minecraft.png";
import pennSparkImg from "../assets/work/penn-spark.png";
import pathImg from "../assets/work/path-at-penn.png";
import roadRogueImg from "../assets/work/road-rogue.png";
import artOfWebImg from "../assets/work/art-of-web.png";
import playgroundImg from "../assets/work/playground.jpg";
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
import miniMayaImg from "../assets/work/mini-maya.png";
import capsuleImg from "../assets/work/capsule.png";
import wikiFit from "../assets/work/thumbs/wikipedia-fit.png";
import deweyFit from "../assets/work/thumbs/dewey-fit.png";
import playgroundFit from "../assets/work/thumbs/playground-fit.png";
import pathFit from "../assets/work/thumbs/path-at-penn-fit.png";
import mmEditorCow from "../assets/work/mini-maya/editor-cow.png";
import mmDiagHe from "../assets/work/mini-maya/diagram-halfedge.png";
import mmDiagCC from "../assets/work/mini-maya/diagram-catmull.png";
import mmSelectHe from "../assets/work/mini-maya/select-halfedge.png";
import mmTraverseNext from "../assets/work/mini-maya/traverse-next.png";
import mmSelectFace from "../assets/work/mini-maya/select-face.png";
import mmSelectVert from "../assets/work/mini-maya/select-vertex.png";
import mmTriangulate from "../assets/work/mini-maya/triangulate.png";
import mmSplit from "../assets/work/mini-maya/split-edge.png";
import mmSub0 from "../assets/work/mini-maya/sub-0.png";
import mmSub1 from "../assets/work/mini-maya/sub-1.png";
import mmSub3 from "../assets/work/mini-maya/sub-3.png";
import mmCowSub from "../assets/work/mini-maya/cow-subdivided.png";
import mcGrassland from "../assets/work/mini-minecraft/grassland.png";
import mcBiomeBorder from "../assets/work/mini-minecraft/biome-border.png";
import mcWaterLake from "../assets/work/mini-minecraft/water-lake.png";
import mcCave from "../assets/work/mini-minecraft/cave.png";
import mcMountainDusk from "../assets/work/mini-minecraft/mountain-dusk.png";
import psHome from "../assets/work/penn-spark/home.png";
import psClient from "../assets/work/penn-spark/client-projects.png";
import psCommunity from "../assets/work/penn-spark/community.png";
import psJoin from "../assets/work/penn-spark/join.png";
import deweyThumb from "../assets/work/dewey.png";
import dwBrand from "../assets/work/dewey/brand.png";
import dwWebBefore from "../assets/work/dewey/web-before.png";
import dwLofiA from "../assets/work/dewey/lofi-feed-a.jpg";
import dwLofiB from "../assets/work/dewey/lofi-feed-b.jpg";
import dwLofiRecs from "../assets/work/dewey/lofi-recs.jpg";
import dwSignin from "../assets/work/dewey/hifi-signin.png";
import dwFeed from "../assets/work/dewey/hifi-feed.png";
import dwSearch from "../assets/work/dewey/hifi-search.png";
import dwRecs from "../assets/work/dewey/hifi-recs.png";
import dwShelf from "../assets/work/dewey/hifi-shelf.png";
import dwAppRecs from "../assets/work/dewey/app-recs.png";

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
  video?: string; // local mp4 under public/, shown with controls
  alt?: string;
  caption?: string;
  placeholder?: string; // shown when no real media yet
};
export type Block =
  | { type: "prose"; label?: string; heading?: string; body: string[] }
  | { type: "list"; label?: string; heading?: string; items: string[] }
  | { type: "stats"; label?: string; items: { value: string; label: string }[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "media"; label?: string; layout?: "full" | "half" | "third"; ratio?: string; bare?: boolean; items: MediaItem[] }
  | { type: "code"; label?: string; heading?: string; file?: string; code: string; note?: string }
  // inline SVG: technical diagrams live in the page rather than as raster assets so
  // they stay crisp at any zoom and follow the viewer's theme via currentColor
  | { type: "svg"; label?: string; heading?: string; svg: string; caption?: string };

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
  thumb?: ImageMetadata; // 2026 card image where it differs from the classic one
  thumbPos?: string; // object-position for the 3:2 crop, e.g. "left center"
  alt?: string;
  blurb: string;
  line: string; // 2026 card one-liner, ≤ 20 words
  who: string; // role/team in one phrase: "Solo", "Team of 3; I owned …"
  briefPoints?: string[]; // About-hover brief bullets; falls back to clipped "what I worked on" items
  reel?: { mp4: string; webm?: string }; // short muted loop that plays over the card thumbnail
  short?: string; // ≤ 8 words, for the hero ledger
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
    tagline: "Proof a real-time engine can look hand-painted: a canyon, a train swallowed by roots, and shaders that hide the render.",
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
    blurb: "A cinematic Unreal Engine 5 short that gets a game engine to output frames you would read as oil paint. A figure walks a canyon, finds a train swallowed by roots, and picks up something that briefly opens the world backward — carried by custom HLSL shaders, including an anisotropic Kuwahara filter, over Lumen GI and hardware ray tracing.",
    line: "A cinematic short in Unreal 5 with a hand-written anisotropic Kuwahara post-process over Lumen GI.",
    who: "Solo",
    short: "an Unreal 5 short with a hand-written Kuwahara shader",
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
          "The passenger is the protagonist of the game Gris — the mesh is zcythe's free public model of the character, and everything that makes it move here is mine. The rig, built in Maya, uses IK limb chains, a spline-IK spine, and foot orient constraints, driven by NURBS control curves. Core cycles (idle, walk, jump, sit, push-up, pickup) export as FBX clips into an Unreal Animation Blueprint that blends between them with a locomotion blend space and procedural secondary motion.",
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
    credits: [
      { name: "zcythe", contribution: "Free public model of the Gris character, used as the passenger's mesh" },
    ],
  },

  {
    slug: "mini-minecraft",
    order: 2,
    title: "Mini Minecraft",
    tagline: "A voxel world that reads as a place rather than noise, with every system underneath it built from first principles in C++ and OpenGL.",
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
    blurb: "A 3D voxel engine written from scratch in C++/OpenGL, where everything that makes the world feel inhabited is hand-built: seven procedural biomes blended from layered Perlin/FBM noise, 3D caves, PCF shadow mapping, screen-space reflections, a day-night cycle, multithreaded chunk streaming, and an A*-pathfinding NPC ecosystem.",
    line: "A voxel engine from scratch in C++/OpenGL: 7 procedural biomes, 3D caves, PCF shadow maps, SSR, day–night.",
    who: "Team of 3; I owned terrain and the render pipeline",
    short: "a voxel engine in C++/OpenGL, team of 3",
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
        label: "Terrain",
        heading: "Terrain that reads as a place, not as noise",
        body: [
          "Raw noise makes convincing hills and unconvincing worlds: everything undulates the same way everywhere. The terrain here works in two layers. Per-biome height fields give each region its own character (a Voronoi F2−F1 hill field for soft cellular grassland, cubed ridge noise for sharp rocky peaks, 4-octave FBM for texture), and a large-scale selector field decides which biomes own a given column.",
          "Each biome claims a lobe of the selector axis, a smoothstep tent centered at its own position, modulated by independent relief and ridge masks and normalized so the weights always sum to one. Where lobes overlap, biomes blend; where one dominates, the terrain commits to it.",
        ],
      },
      {
        type: "code",
        file: "src/scene/terrain.cpp",
        code: `static float lobe(float x, float center, float halfWidth) {
    float d = glm::abs(x - center);
    return 1.0f - glm::smoothstep(0.0f, halfWidth, d);
}`,
        note: "A column's height is then the weight-blended sum of every biome's height field, pulled 82% toward the blend so the base terrain still anchors the world, then re-flattened in lowlands and carved by a basin mask of up to 34 blocks, which is where the lakes come from (water fills empty columns up to Y=138).",
      },
      {
        type: "media",
        label: "Terrain",
        layout: "half",
        items: [
          { src: mcGrassland, alt: "Grassland coast", caption: "Grassland · coastline, beach, and distant mountains under distance fog" },
          { src: mcBiomeBorder, alt: "Biome border", caption: "Stone mountain meeting grassland where selector lobes overlap" },
        ],
      },
      {
        type: "prose",
        label: "Caves",
        heading: "Caves from a negative threshold",
        body: [
          "Underground, a hand-rolled 3D Perlin (eight surflet contributions with a quintic falloff) is sampled at two anisotropic scales, with Y compressed twice as hard as X and Z, blended 85/15. That compression is why the caves read as winding tunnels instead of spherical bubbles.",
          "Every block below Y=128 where the blended noise goes negative is carved. Below Y=25 the void fills with LAVA, Y=0 stays BEDROCK, and under lakes the carve ceiling drops so a cave can never breach a lake floor. Ore spawns only on carved cave surfaces: a stone block must have an exposed face before a hash decides whether it becomes coal, iron, gold, or (below Y=22, at odds of 0.24%) diamond.",
        ],
      },
      {
        type: "code",
        file: "src/scene/terrain.cpp",
        code: `for (int y = 1; y <= 128 && y <= caveTop; ++y) {
    float caveNoise = getCaveNoise(worldX, y, worldZ);
    if (caveNoise < 0.0f) {
        if (y < 25) {
            chunk->setLocalBlockAt(localX, y, localZ, LAVA);
        } else {
            chunk->setLocalBlockAt(localX, y, localZ, EMPTY);
        }
    }
}`,
      },
      {
        type: "media",
        label: "Caves",
        layout: "full",
        items: [{ src: mcCave, alt: "Underground cave with lava", caption: "3D Perlin caves · blocks below Y=128 carved by negative noise; lava fills below Y=25" }],
      },
      {
        type: "prose",
        label: "Shadows",
        heading: "Shadow mapping is a war on three artifacts",
        body: [
          "The sun renders opaque terrain into a 4096² depth map over a 320-block orthographic volume. Naive depth comparison then produces the classic trio: acne (self-shadow stripes), Peter-Panning (shadows detaching from their casters), and shimmer (edges crawling as the player walks). Each gets its own counter-measure.",
          "Acne dies to a slope-scaled bias, 0.0015 · tan(acos(N·L)), clamped so it can never grow into Peter-Panning. Shimmer dies to texel snapping: the light frustum's center moves in whole shadow-map texels (about 0.078 blocks) in a fixed-orientation light space, so walking never sub-pixel-shifts the map. Hard edges die to a 7×7 PCF kernel, 49 depth tests per fragment; shadow depth itself follows the day, shallow at night and deep at noon.",
        ],
      },
      {
        type: "code",
        file: "glsl/lambert.frag.glsl",
        code: `float bias = clamp(0.0015 * tan(acos(cosTheta)), 0.00025, 0.0015); // fix value to avoid peter panning
vec2 texelSize = vec2(1.0 / 4096.0);
float shadow = 0.0;
for (int x = -3; x <= 3; ++x) {
    for (int y = -3; y <= 3; ++y) {
        float closestDepth = texture(u_ShadowMap, shadowCoord.xy + vec2(x, y) * texelSize).r;
        if (closestDepth < currentDepth - bias) {
            shadow += 1.0;
        }
    }
}
shadow /= 49.0;`,
      },
      {
        type: "prose",
        label: "SSR",
        heading: "Making water reflect what is actually on screen",
        body: [
          "The first water shader faked reflections with a fresnel sky tint, and it read as gray plastic. The fix was real screen-space reflections: a separate pass writes view-space positions into an RGBA32F buffer, and every water fragment marches its reflected ray against that buffer.",
          "The march runs as a DDA in pixel space, one pixel per step along the dominant screen axis for up to 384 iterations, then a 5-step binary refinement pins the hit. Four fade terms (hit quality, travel distance, screen edge, grazing-angle fresnel) suppress the artifacts SSR is infamous for, and masks restrict the whole effect to up-facing water surfaces.",
        ],
      },
      {
        type: "code",
        file: "glsl/lambert.frag.glsl",
        code: `float dx = endPixel.x - startPixel.x;
float dy = endPixel.y - startPixel.y;
// step one pixel at a time along larger screen space axis
float moreHorizontal = abs(dx) > abs(dy) ? 1.0 : 0.0;
float maxDelta = mix(abs(dy), abs(dx), moreHorizontal);
vec2 stepDir = vec2(dx, dy) / max(maxDelta, 0.001);`,
      },
      {
        type: "prose",
        label: "Light & air",
        heading: "The cheap tricks that sell the frame",
        body: [
          "Vertex ambient occlusion is computed on the CPU at mesh build: three neighbor tests per vertex (two edges, one corner), the both-edges case short-circuiting straight to the darkest value, packed into the spare .w of the UV attribute. Soft contact shadows, free at render time.",
          "The 240-second day-night cycle keeps two sun vectors: the visual sun, which sets, and a lighting sun whose elevation never drops below 0.08, so night shading stays plausible instead of lighting the world from underground. Sky, fog, sun color, and shadow depth all derive from the same daylight scalar; swimming into water or lava adds an animated UV wobble and tint in the post-process pass (stronger for lava).",
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
    slug: "mini-maya",
    order: 3,
    title: "Mini Maya",
    tagline: "A mesh editor built from pointers up — half-edge topology, live editing, and Catmull–Clark subdivision in C++ and OpenGL.",
    motif: "grid",
    cats: ["graphics", "engineering"],
    kind: "engineering",
    date: "Feb – Mar 2026",
    context: "CIS 4600 · Interactive Computer Graphics, Penn",
    role: "Solo · data structure, topology operations, subdivision, Qt GUI",
    tools: ["C++", "OpenGL", "GLSL", "Qt", "GLM"],
    metaExtra: { label: "Course", value: "CIS 4600 · Adam Mally" },
    links: { github: "https://github.com/CIS4600-Spring-2026/homework-06-half-edge-mesh-leebwj" },
    repoNote: "University repository — private per course policy. Happy to walk through the code directly.",
    img: miniMayaImg,
    alt: "A cube, then the same cube after one and two rounds of Catmull–Clark subdivision, converging toward a sphere",
    thumbPos: "centre",
    blurb:
      "A Maya-style mesh editor written from scratch in C++ and OpenGL. An indexed vertex buffer can draw a mesh but cannot answer \"what is next to this?\" — so the mesh is stored as a half-edge graph instead, which makes every neighbour a pointer hop away and turns edge splits, face triangulation and Catmull–Clark subdivision into local operations rather than full rebuilds.",
    tech: ["C++", "OpenGL", "Qt", "GLSL"],
    metrics: [
      { value: "3", label: "interlinked pointer classes" },
      { value: "253", label: "lines of Catmull–Clark" },
      { value: "8→98", label: "cube vertices, 2 subdivisions" },
      { value: "6", label: "traversal debug keys" },
    ],
    blocks: [
      { type: "prose", label: "Overview", body: [
        "Mini Maya is a mesh editor in the mould of Autodesk Maya or Blender: load an OBJ, click any vertex, edge or face, edit it, and subdivide the whole surface into something smooth. It was built over two assignments for Penn's CIS 4600 — the first laid down the data structure and the renderer, the second added the editing operations and Catmull–Clark subdivision.",
        "The interesting part is not the UI. It is that the mesh is not stored the way a renderer wants it. A GPU wants a flat array of vertices and an index buffer; that is enough to draw triangles and useless for anything else. Ask an index buffer which faces touch this vertex, or which face is on the other side of this edge, and it has no answer — you would have to scan the whole buffer. Every operation in this editor depends on being able to answer exactly those questions.",
      ] },
      { type: "media", label: "The editor", layout: "full", items: [
        { src: mmEditorCow, alt: "Mini Maya with the cow model loaded, its 2,903 vertices listed on the right", caption: "The cow model loaded from OBJ, face-coloured. The three lists on the right hold every vertex, half-edge and face — 2,903 vertices and 5,804 faces, each one clickable." },
      ] },
      { type: "prose", heading: "Why a half-edge graph", body: [
        "The half-edge structure splits every edge into two directed halves, one belonging to each of the two faces that share it. That sounds like bookkeeping and it is, but it buys a property that matters: from any half-edge, every neighbour is one pointer away. Walking a face is a loop over next; crossing into the neighbouring face is a single sym. Neither cost depends on how big the mesh is.",
        "Each half-edge stores four pointers, and those four are enough to reconstruct the entire neighbourhood of anything you can click on.",
      ] },
      { type: "code", file: "meshcomponents.h", code: "class HalfEdge : public QListWidgetItem {\nprivate:\n    static int s_nextId;   // shared counter for unique ids\n    int    m_id;\n    HalfEdge* mp_next;     // next half-edge in this face's loop\n    HalfEdge* mp_sym;      // the opposite half-edge, in the adjacent face\n    Face*     mp_face;     // the face this half-edge lies on\n    Vertex*   mp_vert;     // the vertex between this half-edge and mp_next\n    ...\n};", note: "Vertex and Face are symmetric — each keeps a position or colour, a unique id, and a pointer to one half-edge that touches it. All three inherit QListWidgetItem, so the mesh IS the GUI list: selecting a row selects the component." },
      { type: "media", layout: "full", bare: true, items: [
        { src: mmDiagHe, alt: "Diagram: two faces sharing an edge, with one half-edge and its next, sym, vert and face pointers labelled", caption: "What one half-edge stores. Walking next repeatedly circles its face and returns to where it started; sym is the twin half-edge in the face on the other side." },
      ] },
      { type: "prose", heading: "Making the invisible clickable", body: [
        "A pointer graph is hard to debug because you cannot see it. So the editor draws it: the selected vertex, half-edge or face renders on top of the mesh with depth testing switched off, so it is visible even through geometry, and the keyboard walks the graph directly.",
        "This turned out to be the most useful thing in the project. Every topology bug I hit — a sym pointer left dangling, a next loop that never closed — was found by selecting a component and pressing keys until the highlight went somewhere it should not have.",
      ] },
      { type: "list", heading: "Traversal keys", items: [
        "N — move to this half-edge's next, walking around the face",
        "M — jump to its sym, crossing into the adjacent face",
        "F — select the face this half-edge lies on",
        "V — select the vertex it points to",
        "H — from a selected vertex, jump to one of its half-edges",
        "Shift+H — from a selected face, jump to one of its half-edges",
      ] },
      { type: "media", label: "Traversal and debugging", layout: "half", items: [
        { src: mmSelectHe, alt: "A half-edge selected in the list and highlighted on the mesh", caption: "HalfEdge 10 selected: the list row and the edge itself light up together." },
        { src: mmTraverseNext, alt: "The selection after pressing N twice, two edges further around the face", caption: "After N, N — two hops around the same face loop." },
        { src: mmSelectFace, alt: "A face selected and outlined on the mesh", caption: "A face, outlined through the geometry." },
        { src: mmSelectVert, alt: "A single vertex selected and marked on the mesh", caption: "A single vertex. Depth testing is off, so the marker shows even when the surface is in front of it." },
      ] },
      { type: "prose", heading: "Editing topology, not just geometry", body: [
        "Moving a vertex is easy — it is one position. Changing what the mesh is made of is the harder problem, because every operation has to leave the pointer graph consistent or everything downstream breaks.",
        "Splitting an edge inserts a midpoint vertex and has to create two new half-edges, rewire four next pointers and re-pair two syms. Triangulating a face fans it into triangles, each of which needs its own face record and its own closed loop of half-edges. Both were written so the mesh is never left half-updated: the new components are built first, then linked in.",
      ] },
      { type: "media", label: "Topology operations", layout: "half", items: [
        { src: mmSplit, alt: "The dodecahedron after splitting a half-edge", caption: "Split: a midpoint vertex inserted, two new half-edges created and the loop rewired around it." },
        { src: mmTriangulate, alt: "A pentagonal face fanned into triangles", caption: "Triangulate: a pentagon fanned into triangles, each with its own face record and closed half-edge loop." },
      ] },
      { type: "prose", heading: "Catmull–Clark subdivision", body: [
        "Subdivision is where the data structure pays for itself. Catmull–Clark smooths a mesh by replacing every face with a grid of smaller quads, and every step of it is a neighbourhood query — exactly what the half-edge graph makes cheap.",
        "It runs in four passes. Each face gets a centroid. Each edge gets a point averaged from its two endpoints and the two centroids beside it. Each original vertex is pulled inward toward its neighbours. Then every face is quadrangulated: one new quad per original corner, stitched to the centroid and the two adjacent edge points.",
      ] },
      { type: "prose", body: [
        "One detail decides whether the second pass works at all. Every edge is two half-edges, so walking the mesh visits each edge twice — and computing an edge point twice means placing two vertices where there should be one, which tears the surface along every seam. The fix is to key the pass on the edge rather than the half-edge: order the two endpoints consistently, and both halves hash to the same entry, so the second visit finds the point already computed.",
      ] },
      { type: "media", layout: "full", bare: true, items: [
        { src: mmDiagCC, alt: "Diagram: the four passes of Catmull-Clark subdivision on a single quad", caption: "The four passes. Every face comes out a quadrilateral, and the vertices with unusual valence are the ones the mesh already had — their number is fixed after the first round rather than growing, which is what makes repeated subdivision converge." },
      ] },
      { type: "prose", body: [
        "The mesh grows fast — a cube goes from 8 vertices and 6 faces to 26 and 24 after one round, then 98 and 96 after two, and the assignment's benchmark was subdividing a cow model in under ten seconds. Because the vertex, edge and face passes each read the mesh before any of them writes to it, the new positions are computed into hash maps keyed on the original components and only applied once the whole mesh is rebuilt. Smoothing in place would feed half-updated positions into the next vertex's average.",
      ] },
      { type: "media", label: "Subdivision", layout: "third", items: [
        { src: mmSub0, alt: "A cube before subdivision", caption: "The cube: 8 vertices, 6 faces." },
        { src: mmSub1, alt: "The cube after one round of Catmull-Clark", caption: "One round: 26 vertices, 24 faces." },
        { src: mmSub3, alt: "The cube after three rounds, nearly a sphere", caption: "Three rounds — converged. The lists grow with it." },
      ] },
      { type: "media", label: "On a real model", layout: "full", items: [
        { src: mmCowSub, alt: "The cow model after one round of Catmull-Clark subdivision", caption: "The cow after one subdivision — the assignment's benchmark was doing this in under ten seconds." },
      ] },
      { type: "prose", heading: "What I would change", body: [
        "The components are raw interlinked pointers held alive by vectors of unique_ptr, which is the shape the assignment asks for and the shape that makes the traversal read clearly. It also means a wrong rewire is a dangling pointer rather than a caught error. If I built this again I would put an index-based handle in front of the pointers — the traversal reads the same, but a stale handle is checkable and a stale pointer is a crash.",
        "There is one place where the implementation does not honour the data structure it is built on. Collecting the half-edges around a vertex scans every half-edge in the mesh and keeps the ones pointing at it — O(E) for a question the structure can answer in O(valence) by spinning he->next->sym until you return to the start. It is called once per vertex inside the subdivision pass, which makes that pass O(V·E) when it should be linear. On a cube nobody notices; on the cow model in the assignment's ten-second benchmark, it is the whole cost. Writing the spin is a dozen lines and I would do it before anything else on this list.",
        "The renderer also rebuilds and re-uploads the entire vertex buffer after every edit, because each face duplicates its vertices to keep per-face colour and flat normals. That is fine at homework scale and wrong at any other: a real editor would upload only the touched range.",
      ] },
      { type: "prose", label: "Note", body: [
        "Coursework for CIS 4600 (Interactive Computer Graphics) at Penn, taught by Adam Mally. The repository is private under course policy — I am glad to walk through the half-edge implementation or the subdivision code directly.",
      ] },
    ],
  },
  {
    slug: "art-of-web",
    order: 4,
    title: "Art of the Web",
    tagline: "A semester of coursework you explore instead of scroll, rebuilt as one interactive Three.js world.",
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
    thumb: artOfWebImg,
    alt: "Art of the Web — interactive Three.js portfolio",
    blurb: "A semester's work turned into a place rather than a list: one Three.js scene where floating GLTF objects with custom physics and GSAP animation become the navigation for eight course projects, from CSS art and generative p5.js sketches to a browser game.",
    line: "A semester of web experiments, navigated through one Three.js scene of floating objects.",
    who: "Solo",
    short: "web experiments inside one Three.js scene",
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
    order: 5,
    title: "Penn Spark Redesign",
    tagline: "A club site the team can run without an engineer, taken from Figma to a live Next.js rebuild.",
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
    thumb: psHome,
    thumbPos: "left center",
    alt: "Penn Spark — redesigned club website homepage",
    blurb: "Penn Spark's website, live at pennspark.org. Led end-to-end as project lead: wireframes and a component system in Figma, then a rebuild off an ageing Gatsby stack onto Next.js + React, with a content system the team updates itself.",
    line: "The club's site, taken from Figma to a Next.js rebuild the team updates without an engineer. Live at pennspark.org.",
    who: "Project lead, team of 10+",
    short: "the club site, Figma to Next.js, live",
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
    order: 6,
    title: "Path@Penn Redesign",
    tagline: "Course registration students can plan inside of, instead of fight — a self-directed overhaul of Penn's portal.",
    motif: "path",
    cats: ["design"],
    kind: "design",
    date: "Mar 2026",
    context: "Personal project",
    role: "Solo designer & UX researcher",
    tools: ["Figma", "UX Research", "Prototyping", "User Testing"],
    metaExtra: { label: "Deliverable", value: "Hi-fi prototype · 4 surfaces" },
    links: { figma: "https://www.figma.com/proto/DBOeERCANozjTRaP6VYxIb/Brian-Lee---Design?node-id=47-409", deck: "https://www.figma.com/deck/KYlvDCdz7M2VCTRki5Vvag" },
    img: pathImg,
    thumb: pathFit,
    alt: "Path@Penn — redesigned student course-planning dashboard",
    blurb: "A self-directed UX overhaul that turns Penn's dense, fragmented course portal into four connected surfaces (Dashboard, Course, Schedule, Degree), so planning a semester stops being a scavenger hunt across tools.",
    line: "Penn's course portal rebuilt as four connected surfaces, so planning a semester takes one tool.",
    who: "Solo",
    short: "Penn's course portal rebuilt as four surfaces",
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
    order: 7,
    title: "Road Rogue",
    tagline: "How far an AI-assisted pipeline can actually carry a game: Meshy for the assets, Codex for the logic, Three.js to tie it together.",
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
    blurb: "A 3D car-chase game (à la Smashy Road) built to find the limits of AI-assisted creation for a design course: 3D assets from Meshy, logic scaffolded with Codex, assembled in Three.js. It holds up as a game — responsive driving and a survival score that ramps the tension.",
    line: "A browser car-chase game built to see how far Meshy and Codex can carry a playable game.",
    who: "Solo",
    short: "a browser car-chase game in Three.js",
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
    order: 8,
    title: "Capsule",
    tagline: "Memories you walk through instead of scroll: photos and messages locked until a chosen date, then opened inside a 3D gallery.",
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
    img: capsuleImg,
    alt: "Capsule — a 3D time-capsule reveal gallery",
    blurb: "A collaborative web app where a time capsule stops being a folder and becomes a space — photos, messages and media locked until a chosen date, then revealed through an immersive 3D gallery. Built with React Three Fiber, a Node/MongoDB API, and AWS S3.",
    line: "A time-capsule web app with a 3D reveal gallery in React Three Fiber over a Node/MongoDB API.",
    who: "Team of 4; I owned the UI and the 3D gallery",
    short: "a time-capsule app with a 3D reveal gallery",
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
    order: 9,
    title: "Wikipedia Redesign",
    tagline: "Redesigning the world's largest encyclopedia around how people actually read it.",
    motif: "grid",
    cats: ["design"],
    kind: "design",
    date: "Apr 2026",
    context: "Personal project",
    role: "Solo designer & UX researcher",
    tools: ["Figma", "UX Research", "User Testing", "Prototyping"],
    metaExtra: { label: "Deliverable", value: "Hi-fi prototype" },
    links: { figma: "https://www.figma.com/proto/vKo7ySkGZW5dliYa44yHwa/Brian-Lee---Design?node-id=103-7273" },
    img: wikiCover,
    thumb: wikiFit,
    alt: "Wikipedia mobile redesign — five redesigned sections",
    blurb: "A research-to-prototype redesign of Wikipedia's mobile interface where testing, not taste, decided the outcome: interviews, a survey and insight synthesis produced three reader personas, then usability sessions with four users reshaped previews, search snippets and AI framing across five sections.",
    line: "A mobile redesign shaped by interviews and four usability sessions: search-first home, a section strip, article snippets.",
    who: "Solo",
    short: "a research-led mobile redesign",
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
        "This was a personal project: a complete research-to-prototype redesign of Wikipedia's mobile interface. Structured interviews, a survey, insight and How-Might-We synthesis, lo-fi wireframes, usability testing with four participants, and a hi-fi prototype across five sections: Home, Article, Search, Language, and an AI Chat feature.",
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
      { type: "prose", label: "Personas", heading: "Three readers, one scope", body: [
        "The interviews and survey collapsed into three reader personas and a set of How-Might-We questions that fixed the redesign's scope before any screens were drawn: five sections, each answering a documented need rather than a feature wishlist.",
      ] },
      { type: "media", label: "Personas", layout: "third", items: [
        { placeholder: "Persona 01 · from the research file" },
        { placeholder: "Persona 02 · from the research file" },
        { placeholder: "Persona 03 · from the research file" },
      ] },
      { type: "prose", label: "Structure", heading: "Mapping the redesign before the visuals", body: [
        "Lo-fi screens set the information architecture before any visual design: a search-first Home with trending keywords and the featured article up front; a persistent, scrollable section-header strip replacing the buried TOC, plus a floating action menu; Language separated and relabeled “Article Language”; and an AI Chat tab as a quick-summary layer over the knowledge base.",
      ] },
      { type: "media", label: "Lo-fi", layout: "full", items: [{ src: wikiLofi, alt: "Lo-fi wireframes", caption: "Lo-fi screens set the information architecture before any visual design" }] },
      { type: "prose", label: "Testing", heading: "Four users, five tasks, one prototype", body: [
        "Mid-fi prototypes were tested with four participants from different Penn schools, each running five task-based prompts while thinking aloud. The home page was understood immediately; the rest of the design earned its changes the hard way.",
      ] },
      { type: "media", label: "Testing", layout: "full", items: [{ src: wikiTesting, alt: "User testing", caption: "Task-based sessions with four participants across different Penn schools" }] },
      { type: "list", label: "Iterations", heading: "What testing changed", items: [
        "Section previews: nobody would open a section blind, so headers in the strip gained short previews.",
        "Search snippets: title-only results forced guessing, so every result now carries an article snippet.",
        "AI Chat framing: participants expected full answers, so the copy reframes it as summaries that link back into the article.",
        "Article Language: the toggle read as an app setting, so it was separated from Settings and relabeled.",
      ] },
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
    slug: "dewey",
    order: 10,
    title: "Dewey",
    tagline: "Taking a book-discovery startup from web MVP to a working iOS app, as design lead of the Penn Spark client team.",
    motif: "grid",
    cats: ["design"],
    kind: "design",
    date: "Jan – Apr 2026",
    context: "Client project · Penn Spark",
    role: "Design Lead · Project Co-Lead",
    team: "Team of 8, with Dewey's founding team",
    tools: ["Figma", "Design Systems", "Prototyping", "React Native"],
    metaExtra: { label: "Client", value: "Dewey · joindewey.com" },
    links: { live: "https://joindewey.com/" },
    repoNote: "The code and design files belong to the client, so they stay private; the demo below is the working build.",
    img: deweyThumb,
    thumb: deweyFit,
    alt: "Dewey iOS app — feed, recommendations, and shelf screens",
    blurb: "A semester-long client build at Penn Spark: Dewey's social book-discovery web MVP translated into a working iOS app. I led design (and co-led the project): the mobile design system inside the client's brand, five core flows from wireframes to hi-fi, and the handoff the developers built from.",
    line: "Client work: a book-discovery web MVP turned into a working iOS app; I led the design end.",
    who: "Design lead & project co-lead; team of 8",
    short: "a client iOS app, design lead",
    tech: ["Figma", "Design Systems", "React Native"],
    reel: { mp4: "/reels/dewey.mp4" },
    featured: { type: "image", src: deweyThumb, alt: "Dewey iOS app screens" },
    metrics: [
      { value: "5", label: "core flows designed" },
      { value: "14", label: "weeks, kickoff to showcase" },
      { value: "8", label: "designers & developers" },
    ],
    blocks: [
      { type: "prose", label: "Overview", heading: "A real client, a real backend, a real deadline", body: [
        "Dewey is a social book-discovery startup founded by two Wharton MBAs: Goodreads-style tracking, taste-based comparative ranking (log a book and it asks whether you liked it more than the last one you loved), short-form reader reactions, and a recommendation algorithm in active development. They came to Penn Spark with a live web MVP, real early users, and one ask: turn it into a production-ready iOS app.",
        "I led design and co-led the project: scoping the design work, owning the UX architecture, running the design side of the weekly client meetings, and carrying the system from wireframes through developer handoff. Two designers worked with me; the developer half of the team built against our specs on Dewey's existing Supabase backend.",
      ] },
      { type: "media", label: "Before", layout: "full", items: [
        { src: dwWebBefore, alt: "Dewey's web MVP", caption: "The starting point · Dewey's live web MVP at joindewey.com" },
      ] },
      { type: "prose", label: "The task", heading: "Translate, don't reinvent", body: [
        "The brief sounds simple: get the website into app form. The constraints made it design work. Every existing feature had to survive the move to a phone; the visual identity was the client's, not ours to change; the backend and its data model already existed; and the one genuinely new surface, the recommendations experience, had no web version to translate at all.",
        "The process ran in five stages: discovery (web audit, brand review), UX architecture (user journeys, flow charts), lo-fi wireframes for every core screen, hi-fidelity design inside Dewey's brand system, and developer handoff with full Figma specs and prototypes.",
      ] },
      { type: "media", label: "Brand", layout: "full", bare: true, items: [
        { src: dwBrand, alt: "Dewey brand system", caption: "The client's identity, kept: Margin and Playfair Display over Inter, sage and cream" },
      ] },
      { type: "list", label: "Architecture", heading: "Five flows carry the whole product", items: [
        "Feed: friend posts, trending books, create post, like and comment.",
        "Search: books and users in one place, book detail, add to shelf, rate and review.",
        "Recs: daily picks, swipe to accept, calendar history.",
        "Shelf: browse, create and rename shelves, track reading by status.",
        "Profile: bio, reading goals, posts, follow and unfollow.",
      ] },
      { type: "prose", label: "Lo-fi", heading: "Decisions made cheap, in grayscale", body: [
        "The wireframe round existed to settle arguments before they got expensive. Should search live on the feed or in its own tab? We drew both, benchmarked how Instagram and Spotify structure their home surfaces, checked with the developers that a merged book-and-user search was feasible, and picked the dedicated tab. Should recommendations be a scroll or a swipe? The swipe deck won: it matches the one-decision-at-a-time nature of Dewey's comparative ranking.",
      ] },
      { type: "media", label: "Lo-fi", layout: "third", items: [
        { src: dwLofiA, alt: "Feed wireframe without search", caption: "Feed A · search as its own tab" },
        { src: dwLofiB, alt: "Feed wireframe with search bar", caption: "Feed B · search bar on the feed" },
        { src: dwLofiRecs, alt: "Recommendations wireframe", caption: "Recs · the swipe deck, tested in grayscale" },
      ] },
      { type: "prose", label: "Hi-fi", heading: "Mobile composition inside someone else's brand", body: [
        "The hi-fi round rebuilt every screen in Dewey's system: Margin for the wordmark, Playfair Display for page titles, Inter for everything readable, the sage-and-cream palette carried from the website. Web features were recomposed for one-handed use rather than shrunk to fit: the feed's trending row became a horizontal shelf, navigation collapsed to four tabs, and the recommendation deck got the swipe-and-flip motion the web never had.",
      ] },
      { type: "media", label: "Hi-fi", layout: "third", items: [
        { src: dwSignin, alt: "Sign in screen", caption: "Sign in" },
        { src: dwFeed, alt: "Feed screen", caption: "Feed · trending shelf, then friends" },
        { src: dwSearch, alt: "Search screen", caption: "Search · books and users, one surface" },
      ] },
      { type: "media", layout: "third", items: [
        { src: dwRecs, alt: "Recommendations screen", caption: "Recs · one pick at a time" },
        { src: dwShelf, alt: "Shelf screen", caption: "Shelf · reading tracked by status" },
      ] },
      { type: "prose", label: "Shipped", heading: "The build is real and people use it", body: [
        "The developers built the app in React Native with Expo on Dewey's existing Supabase backend, wired the recommendation surface to the algorithm the client was developing (embeddings plus LLM-based tagging on their side), and distributed the working build through Expo Go, with the client's founding team and beta testers on it. Designs were iterated weekly against both developer constraints and client feedback until the two stopped disagreeing.",
      ] },
      { type: "media", label: "Demo", layout: "half", items: [
        { video: "/reels/dewey-demo.mp4", alt: "Dewey app demo", caption: "The working build · feed, search, recommendations, shelf" },
        { src: dwAppRecs, alt: "Recommendations in the shipped app", caption: "The shipped recs surface: real daily pick, real data" },
      ] },
      { type: "prose", label: "Reflection", heading: "Client design is mostly constraint navigation", body: [
        "This project was less about inventing an interface and more about holding one steady: a brand that wasn't mine, a backend that already existed, two designers to direct, four developers consuming the specs, and founders with opinions and users. The design lead job was keeping all of that coherent, and the weekly rhythm of adjusting hi-fis to what the build and the client actually needed taught me more than the screens did.",
      ] },
    ],
    credits: [
      { name: "Brian Lee", contribution: "Design lead & project co-lead: UX architecture, wireframes, hi-fi system, client communication, dev handoff." },
      { name: "Nond Phokasub · Eve Fan", contribution: "Designers: wireframes, hi-fi screens, and the design kit across the five flows." },
      { name: "Meiling Mathur", contribution: "Developer lead & project co-lead: React Native/Expo build, backend integration, recommendations wiring." },
      { name: "Penn Spark developers", contribution: "Justin, Gordon, Evan, Sylvia, Olivia: screens, endpoints, debugging, deployment." },
      { name: "Dewey", contribution: "Angela Malinovitch, Doris Wang, Ceylin Erkan: the product, the brand, the backend, and the algorithm." },
    ],
  },

  {
    slug: "playground",
    order: 10,
    title: "Playground",
    tagline: "A childhood game character that reacts to you in the browser — modeled, textured and rigged in Maya, then wired to live input.",
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
    thumb: playgroundFit,
    alt: "Playground — an interactive 3D character scene",
    blurb: "An interactive 3D scene that puts “Boo,” a childhood-game character, within reach: modeled in Maya, textured in Substance Painter, rigged and animated, then wired into Spline so keyboard and mouse input make it react in the browser.",
    line: "Boo, modeled and rigged in Maya, reacting to keyboard and mouse in the browser through Spline.",
    who: "Solo",
    short: "Boo, rigged in Maya, live in the browser",
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
    date: "Jun – Aug 2026",
    years: "Summer 2026",
    context: "Internship · Remote",
    role: "Software Engineer Intern",
    tools: [],
    metaExtra: { label: "Backed by", value: "Y Combinator · F25" },
    links: { live: "https://alephlab.ai" },
    img: null,
    blurb: "Software engineering intern at a Y Combinator (F25) startup, where I shipped an app-wide redesign, built the product's lifecycle notification system and then made it run unattended, and packaged the company's AI character as an SDK outside studios can build on.",
    line: "Shipped an app-wide React Native redesign, built the lifecycle notification system and made it run unattended, and packaged the AI agent that plays with kids inside Minecraft as an SDK.",
    who: "Software engineer intern",
    briefPoints: [
      "App-wide React Native redesign from Figma to production, carrying a 33-section design system",
      "A lifecycle notification system that clears its own guardrails and sends unattended",
      "The in-game AI agent packaged as an SDK: 1,301 tests, proven by an outside builder shipping on it",
    ],
    tech: [],
    metrics: [
      { value: "3", label: "production systems shipped" },
      { value: "33", label: "design-system sections" },
      { value: "1,301", label: "tests behind the agent SDK" },
    ],
    blocks: [
      { type: "prose", label: "Company", body: [
        "Aleph Lab is a San Francisco AI startup in Y Combinator's Fall 2025 batch. Its product, Aleph Kids, is an AI language-learning companion: a voice-enabled character named “Annie” that talks and plays with children inside games they already love, like Minecraft, so they practice speaking a new language while they play.",
      ] },
      { type: "list", label: "What I worked on", items: [
        "Delivered an app-wide React Native redesign from Figma to production — sequencing the information architecture ahead of the visual system, so the layout stayed familiar and users kept their bearings before the new look arrived",
        "Built the product's lifecycle notification system end to end: re-engagement, streak reminders and class-completion alerts, with per-stage copy, back-off so message types cannot pile onto the same family, and a holdout group so the effect could be measured rather than assumed",
        "Then made it autonomous — it proposes sends, clears its own safety guardrails and delivers unattended, where every send had previously needed a person to approve it",
        "Widened notification eligibility after validating the targeting against production data, substantially increasing the number of families the system could reach",
        "Hardened public endpoints that trusted whatever user ID they were handed, adding bearer authentication with no changes required from existing server-to-server callers",
        "Packaged the in-game AI agent as a versioned SDK that studios outside the company can build on — typed APIs, per-session isolation, and capability enforcement at a boundary the mode author cannot cross — published as versioned packages over a hosted multi-tenant service",
        "Proved it end to end by having an external builder author a game mode and run the agent inside it with no access to our repository, loading their content at runtime",
        "Took hosted voice end to end, so a builder can hold a spoken conversation with the character from a browser with no game client running",
        "Shipped a Claude skill that authors and validates a new mode's configuration, so integrating the agent into a mode stopped being bespoke work each time",
        "Improved how the character behaves in the world: its defensive targeting had been starting fights with neutral creatures and bosses far above a child’s level, corrected additively so the change could only ever remove a bad target, never add an attack",
        "Extended its perception to modded content, so it recognises the custom blocks and items a game mode adds instead of describing them with the wrong words",
        "Built an agent-based analysis tool over production data that showed a reported retention gain was a measurement artifact, and surfaced the drivers that actually mattered",
        "Gave the character a consistent presence in the app — its message-bubble system, a branded crash recovery in English and Korean, and dashboards that tell a failed request apart from an empty one",
      ] },
      { type: "prose", label: "Note", body: [
        "Specifics about the product's internals and metrics stay with the company — happy to talk through the engineering in more depth over a call.",
      ] },
    ],
  },
  {
    slug: "penn-spark",
    type: "experience",
    logo: "/logos/pennspark.png",
    order: 102,
    title: "Penn Spark",
    tagline: "Getting client-facing 0→1 products out the door with cross-functional teams of 15+ at Penn's student product studio.",
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
    blurb: "Red-team project lead and product designer at Penn's student product studio, where 15+ designers and developers shipped client-facing 0→1 products on every semester cycle.",
    line: "Lead a team of 15+ designers and developers shipping client products each semester.",
    who: "Project lead, product designer",
    briefPoints: [
      "Red team lead: 15+ designers and developers shipping a client product every semester",
      "End-to-end user flows, interaction patterns, and the interface system that keeps them consistent",
      "Also rebuilt pennspark.org itself; the case study is in Selected Work",
    ],
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
    tagline: "Keeping 50+ live Unity mobile titles shipping and in the stores at a Korean puzzle-game studio.",
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
    blurb: "Software engineering intern who kept 50+ live Unity mobile titles shipping: 100+ QA-reported bugs cleared into production, and the whole portfolio held compliant through a platform requirement change.",
    line: "Kept 50+ live Unity titles shipping; 100+ QA-reported bugs fixed in production.",
    who: "Software engineer intern",
    briefPoints: [
      "50+ live Unity puzzle titles kept shipping across a 420M-download portfolio",
      "100+ QA-reported bugs fixed in production prefabs and C# scripts",
      "SDK and platform-module upgrades that kept every title compliant in the stores",
    ],
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
    tagline: "Making million-row semiconductor datasets queryable for 20+ client companies at a Korean smart-factory IT company.",
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
    blurb: "Database engineering intern who made semiconductor data from 20+ client companies queryable, designing SQL tooling over million-row datasets in Oracle and SQLite.",
    line: "SQL tooling over 1M+ semiconductor records from 20+ client companies.",
    who: "Database engineer intern",
    briefPoints: [
      "A SQL prototype managing 1M+ semiconductor data entities in Oracle and SQLite",
      "Datasets from 20+ client companies made queryable, including Samsung, SK, and LG",
      "Query optimization for faster retrieval across million-row tables",
    ],
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

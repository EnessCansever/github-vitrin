import "server-only";

import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {ImageResponse} from "next/og";
import {cardFormats, type CardContent, type CardFormat} from "./types";

const paper = "#f4eee2", blue = "#1845f5", lime = "#d4eb52";
let fonts: Promise<{name: string; data: ArrayBuffer; weight: 400 | 500 | 800; style: "normal"}[]> | undefined;
const seal = Array.from({length: 48}, (_, i) => {
  const angle = Math.PI * 2 * i / 48 - Math.PI / 2;
  const radius = i % 2 ? 90 : 100;
  return `${100 + radius * Math.cos(angle)},${100 + radius * Math.sin(angle)}`;
}).join(" ");

function loadFonts() {
  fonts ??= Promise.all([
    readFile(join(process.cwd(), "src/app/fonts/BarlowCondensed-ExtraBold.ttf")).then(buffer => ({name: "Display", data: Uint8Array.from(buffer).buffer, weight: 800 as const, style: "normal" as const})),
    readFile(join(process.cwd(), "src/app/fonts/IBMPlexMono-Regular.ttf")).then(buffer => ({name: "Mono", data: Uint8Array.from(buffer).buffer, weight: 400 as const, style: "normal" as const})),
    readFile(join(process.cwd(), "src/app/fonts/Manrope-Medium.ttf")).then(buffer => ({name: "Body", data: Uint8Array.from(buffer).buffer, weight: 500 as const, style: "normal" as const})),
  ]);
  return fonts;
}

function Arrow({size, color = paper}: {size: number; color?: string}) {
  return <svg width={size} height={size} viewBox="0 0 48 48"><path d="M9 8L38 37M12 37H38V11" stroke={color} strokeWidth="2" fill="none" /></svg>;
}

function Stamp({label, size}: {label: string; size: number}) {
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", width: size, height: size, color: "#090e14", fontFamily: "Mono", fontWeight: 400}}>
      <svg width={size} height={size} viewBox="0 0 200 200" style={{position: "absolute", top: 0, left: 0}}><polygon points={seal} fill={lime} /></svg>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: size * .72, height: size * .3, flexShrink: 0}}>
        {label.split("\n").map(line => <span key={line} style={{display: "flex", justifyContent: "center", width: "100%", height: size * .14, flexShrink: 0, fontSize: size * .1, lineHeight: 1.3, whiteSpace: "nowrap"}}>{line}</span>)}
      </div>
      <div style={{display: "flex", marginTop: size * 0.04}}><Arrow size={size * 0.16} color={blue} /></div>
    </div>
  );
}

// Measured from the bundled Barlow hmtx table, in em units.
const titleAdvance: Record<string, number> = {
  A: .508, B: .477, C: .47, D: .48, E: .441, F: .427, G: .473, H: .483, I: .235,
  J: .462, K: .505, L: .437, M: .558, N: .522, O: .479, P: .474, Q: .467, R: .481,
  S: .454, T: .485, U: .48, V: .506, W: .707, X: .49, Y: .492, Z: .419,
  İ: .235, Ö: .479, Ü: .48, Ç: .47, Ğ: .473, Ş: .454, " ": .2, "?": .462,
};
let printTexture: Promise<string> | undefined;

function loadTexture() {
  printTexture ??= readFile(join(process.cwd(), "src/features/cards/assets/letterpress-paper.jpg"))
    .then(buffer => `data:image/jpeg;base64,${buffer.toString("base64")}`);
  return printTexture;
}

function PrintTexture({src, format = "story"}: {src: string; format?: CardFormat}) {
  const {width, height} = cardFormats[format];
  return (
    <svg width={String(width)} height={String(height)} viewBox={`0 0 ${width} ${height}`} style={{position: "absolute", top: 0, left: 0}}>
      <defs>
        <filter id="paper-fiber" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .957 0 0 0 0 .933 0 0 0 0 .886 -.04 -.04 -.04 0 .12" /></filter>
        <filter id="ink-wear" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .004 0 0 0 0 .169 0 0 0 0 .757 -.045 -.045 -.045 0 .1269" /></filter>
      </defs>
      <image href={src} width={String(width)} height={String(height)} preserveAspectRatio="none" filter="url(#paper-fiber)" />
      <image href={src} width={String(width)} height={String(height)} preserveAspectRatio="none" filter="url(#ink-wear)" />
    </svg>
  );
}

function StoryCard({data, texture}: {data: CardContent; texture: string}) {
  const words = data.title.join(" ").split(" ");
  const lines = words.length > 2 ? [words.slice(0, -2).join(" "), words[words.length - 2], words[words.length - 1]] : data.title;
  const advances = lines.map(line => [...line].reduce((total, letter) => total + (titleAdvance[letter] ?? .55), 0));
  const longTitle = lines.length === 3;
  const limits = longTitle ? [344, 244, 270] : [344, 352];
  const widths = longTitle ? [604, 604, 900] : [604, 970];
  const sizes = lines.map((line, i) => Math.min(limits[i], (widths[i] + 4 * (line.length - 1)) / advances[i]));
  const stampSize = lines.length === 3 ? 300 : Math.max(230, Math.min(300, sizes[0] * .88));
  const positions = [0];
  for (let i = 1; i < lines.length; i++) {
    const width = advances[i] * sizes[i] - 4 * (lines[i].length - 1);
    positions[i] = Math.max(positions[i - 1] + sizes[i - 1] * .9 - sizes[i] * .19 + 14,
      longTitle && i === 2 ? stampSize + 16 : width > 928 - stampSize ? stampSize - sizes[i] * .19 + 8 : 0);
  }
  const last = lines.length - 1;
  const titleHeight = positions[last] + sizes[last] * .9 + 8;
  const stamp = <div style={{display: "flex", position: "absolute", top: 0, right: 0}}><Stamp label={data.identity} size={stampSize} /></div>;
  return (
    <div style={{display: "flex", flexDirection: "column", position: "relative", width: 1080, height: 1920, padding: "210px 64px 244px", background: "#012bc1", color: paper, fontFamily: "Body", fontWeight: 500, lineHeight: 1.15}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", height: 80, flexShrink: 0}}>
        <span style={{fontFamily: "Display", fontWeight: 800, fontSize: 80, lineHeight: 1}}>{data.brand}</span>
        <div style={{display: "flex", alignItems: "center", gap: 28}}><div style={{width: 108, height: 1, background: paper, opacity: .6}} /><span style={{fontFamily: "Mono", fontWeight: 400, fontSize: 30, letterSpacing: 1, width: 240}}>DEVELOPER ID</span></div>
      </div>
      <div style={{display: "flex", position: "relative", marginTop: 100, height: titleHeight, flexShrink: 0}}>
        <svg width="68" height="28" viewBox="0 0 68 28" style={{position: "absolute", left: 0, top: -36}}><path d="M4 24L14 4M24 24L34 4M44 24L54 4" stroke={paper} strokeWidth="2" /></svg>
        {!longTitle && stamp}
        {lines.map((line, i) => <div key={line} style={{display: "flex", position: "absolute", top: positions[i], left: 0, ...(longTitle ? {width: i < 2 ? 604 : 952, whiteSpace: "nowrap"} : {}), fontFamily: "Display", fontWeight: 800, fontSize: sizes[i], lineHeight: 1, letterSpacing: -4}}>{line}</div>)}
        {longTitle && stamp}
      </div>
      <div style={{display: "flex", fontFamily: "Mono", fontWeight: 400, fontSize: Math.min(50, 890 / ((data.username.length + 1) * .6)), wordBreak: "break-all", paddingLeft: 52, borderLeft: `2px solid ${paper}`, marginTop: 24}}>@{data.username}</div>
      <div style={{display: "flex", alignItems: "baseline", gap: 24, marginTop: 14}}>
        <span style={{fontFamily: "Display", fontWeight: 800, fontSize: 200, lineHeight: 1}}>{data.score}</span>
        <span style={{fontFamily: "Mono", fontWeight: 400, fontSize: 56}}>/100</span>
      </div>
      <span style={{fontSize: 32, marginTop: 0}}>{data.scoreLabel}</span>
      <div style={{display: "flex", justifyContent: "space-between", borderTop: `1px solid ${paper}`, borderBottom: `1px solid ${paper}`, padding: "10px 0", marginTop: 18}}>
        {data.categories.map(category => <div key={category.label} style={{display: "flex", alignItems: "baseline", gap: 10}}><span style={{fontSize: 26}}>{category.label}</span><span style={{fontFamily: "Mono", fontWeight: 400, fontSize: 30}}>{category.points}</span></div>)}
      </div>
      <div style={{display: "flex", flexDirection: "column", marginTop: 14}}>
        <div style={{display: "flex", alignItems: "flex-start", gap: 16}}>
          <span style={{fontFamily: "Mono", fontWeight: 400, fontSize: 22, color: lime, width: 140, flexShrink: 0}}>{data.firstStep}</span>
          {data.task && <div style={{display: "flex", fontFamily: "Mono", fontWeight: 400, fontSize: data.task.target.length > 55 ? 26 : 30, lineHeight: 1.2, wordBreak: "break-all", flex: 1}}>{data.task.target}</div>}
        </div>
        <div style={{display: "flex", fontSize: 34, marginTop: 8}}>{data.task?.text ?? data.noTask}</div>
      </div>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: 22, marginTop: 14}}><span style={{fontSize: 36}}>{data.invitation}</span><Arrow size={38} /></div>
      <div style={{display: "flex", flexDirection: "column", marginTop: 10, borderTop: `1px solid ${paper}`, paddingTop: 12, gap: 8}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 20}}><span style={{fontFamily: "Display", fontWeight: 800, fontSize: 52}}>{data.brand}</span><span style={{fontSize: 28}}>{data.signature} {data.author}</span></div>
        <div style={{display: "flex", ...(longTitle ? {flexDirection: "column"} : {}), justifyContent: "space-between", alignItems: longTitle ? "flex-start" : "baseline", gap: longTitle ? 8 : 20}}><span style={{fontFamily: "Mono", fontWeight: 400, fontSize: 20}}>{data.date}</span><span style={{fontSize: 20}}>{data.scope}</span></div>
      </div>
      {PrintTexture({src: texture})}
    </div>
  );
}

function LandscapeCard({data, texture}: {data: CardContent; texture: string}) {
  const advances = data.title.map(line => [...line].reduce((width, letter) => width + (titleAdvance[letter] ?? .55), 0));
  const sizes = data.title.map((line, i) => Math.min(196, (620 + 2 * (line.length - 1)) / advances[i]));
  // Dotted capitals extend above Barlow's ordinary cap height.
  const tops = data.title.map(line => /[İĞÖÜ]/.test(line) ? -.04 : .18);
  const bottoms = data.title.map(line => /[ÇŞ]/.test(line) ? 1 : .91);
  const inkHeight = sizes.reduce((height, size, i) => height + size * (bottoms[i] - tops[i]), 0);
  const scale = Math.min(1, 272 / inkHeight);
  const titleHeight = inkHeight * scale + 12;
  return (
    <div style={{display: "flex", flexDirection: "column", position: "relative", width: 1200, height: 630, padding: "24px 36px 16px", background: "#012bc1", color: paper, fontFamily: "Body", fontWeight: 500, lineHeight: 1.15}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, height: 44, flexShrink: 0}}>
        <span style={{fontFamily: "Display", fontWeight: 800, fontSize: 44, lineHeight: 1}}>{data.brand}</span>
        <div style={{display: "flex", fontFamily: "Mono", fontWeight: 400, fontSize: Math.min(38, 852 / ((data.username.length + 1) * .6)), wordBreak: "break-all", maxWidth: 852}}>@{data.username}</div>
      </div>
      <div style={{display: "flex", gap: 32, marginTop: 16, height: 296, flexShrink: 0}}>
        <div style={{display: "flex", position: "relative", width: 620, height: 296, flexShrink: 0}}>
          {data.title.map((line, i) => <div key={line} style={{display: "flex", position: "absolute", left: 0, top: (296 - titleHeight) / 2 + (i === 0 ? 0 : sizes[0] * scale * (bottoms[0] - tops[0]) + 12) - sizes[i] * scale * tops[i], width: 620, whiteSpace: "nowrap", fontFamily: "Display", fontWeight: 800, fontSize: sizes[i] * scale, lineHeight: 1, letterSpacing: -2}}>{line}</div>)}
        </div>
        <div style={{display: "flex", flexDirection: "column", position: "relative", width: 476, flexShrink: 0}}>
          <span style={{fontSize: 28, width: 270}}>{data.scoreLabel}</span>
          <div style={{display: "flex", position: "absolute", top: 0, right: 0}}><Stamp label={data.identity} size={152} /></div>
          <div style={{display: "flex", position: "absolute", top: 96, left: 0, alignItems: "baseline", gap: 14}}>
            <span style={{fontFamily: "Display", fontWeight: 800, fontSize: 200, lineHeight: 1, width: 320, flexShrink: 0}}>{data.score}</span>
            <span style={{fontFamily: "Mono", fontWeight: 400, fontSize: 42}}>/100</span>
          </div>
        </div>
      </div>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${paper}`, borderBottom: `1px solid ${paper}`, marginTop: 10, height: 44, flexShrink: 0}}>
        {data.categories.map(category => <div key={category.label} style={{display: "flex", alignItems: "baseline", gap: 12}}><span style={{fontSize: 25}}>{category.label}</span><span style={{fontFamily: "Mono", fontWeight: 400, fontSize: 28}}>{category.points}</span></div>)}
      </div>
      <div style={{display: "flex", flexDirection: "column", marginTop: 10, height: 90, flexShrink: 0}}>
        <div style={{display: "flex", alignItems: "flex-start", gap: 16}}>
          <span style={{fontFamily: "Mono", fontWeight: 400, fontSize: 22, color: lime, width: 132, flexShrink: 0}}>{data.firstStep}</span>
          {data.task && <div style={{display: "flex", fontFamily: "Mono", fontWeight: 400, fontSize: data.task.target.length > 55 ? 20 : 26, lineHeight: 1.2, wordBreak: "break-all", width: 980}}>{data.task.target}</div>}
        </div>
        <div style={{display: "flex", fontSize: 30, marginTop: 6}}>{data.task?.text ?? data.noTask}</div>
      </div>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: 48, marginTop: 12, height: 35, flexShrink: 0}}>
        <div style={{display: "flex", alignItems: "center", gap: 14, width: 672, fontSize: 30}}>{data.invitation}<Arrow size={28} /></div>
        <span style={{fontSize: 28, width: 408, textAlign: "right"}}>{data.signature} {data.author}</span>
      </div>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 104, marginTop: 8, height: 23, flexShrink: 0}}>
        <span style={{fontSize: 20, width: 624}}>{data.scope}</span>
        <span style={{fontFamily: "Mono", fontWeight: 400, fontSize: 20, width: 400, textAlign: "right"}}>{data.date}</span>
      </div>
      {PrintTexture({src: texture, format: "landscape"})}
    </div>
  );
}

export async function renderCard(data: CardContent, format: CardFormat): Promise<ArrayBuffer> {
  // Satori discovers embedded images from the expanded element tree.
  const texture = await loadTexture();
  const content = format === "story" ? StoryCard({data, texture}) : LandscapeCard({data, texture});
  const image = new ImageResponse(content, {
    ...cardFormats[format], fonts: await loadFonts(),
  });
  return image.arrayBuffer();
}

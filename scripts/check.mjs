import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const episodes=JSON.parse(await readFile(new URL('content/episodes.json',root),'utf8'));
assert.ok(episodes.length>=3);
const seen=new Set();
for(const episode of episodes){
  assert.ok(!seen.has(episode.number),'Episode numbers must be unique');seen.add(episode.number);
  await access(new URL('public'+episode.image,root));
  assert.ok((episode.guest||episode.placeholder)&&episode.title&&episode.description);
  if(episode.teaser)await access(new URL("public"+episode.teaser,root));
  assert.ok(episode.videoId===null||/^[\w-]{11}$/.test(episode.videoId),'Valid YouTube video ID required');
  let last=-1;
  for(const chapter of episode.chapters){assert.ok(chapter.title);assert.ok(chapter.seconds>=last,'Chapters must be chronological');last=chapter.seconds;}
  for(const link of episode.links)assert.equal(new URL(link.url).protocol,'https:');
}
for(const file of ['logo.svg','logo-light.svg','mahesh-nandigam.jpg','mahesh-moholkar.jpg'])await access(new URL('public/assets/'+file,root));
for(const file of ['icon.svg','favicon.ico','apple-touch-icon.png'])await access(new URL('public/'+file,root));
const config=await readFile(new URL('next.config.ts',root),'utf8');
assert.ok(config.includes('output: "export"'));
console.log(`Checked ${episodes.length} episodes, ${episodes.reduce((sum,e)=>sum+e.chapters.length,0)} chapters, media assets, and links.`);

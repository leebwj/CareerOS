import sharp from "sharp";
const OUT=process.argv[2];
const jobs=[
  ["passenger","src/assets/work/passenger/canyon-golden.png",480,0,1599,1071],
  ["mini-minecraft","src/assets/work/mini-minecraft/grassland.png",237,0,2053,1375],
  ["path-at-penn","src/assets/work/path-at-penn/schedule.png",360,120,1330,870],
  ["penn-spark","src/assets/work/penn-spark/home.png",0,0,2542,1264],
  ["art-of-web","src/assets/work/art-of-web.png",30,20,1530,940],
  ["road-rogue","src/assets/work/road-rogue.png",900,600,1400,940],
  ["playground","src/assets/work/playground.jpg",0,10,1000,672],
];
for(const [n,s,l,t,w,h] of jobs){
  await sharp(s).extract({left:l,top:t,width:w,height:h}).resize(1800,null).png({compressionLevel:9}).toFile(`${OUT}/${n}.png`);
  console.log(n,(w/h).toFixed(3));
}
for(const [n,s] of [["wiki-home","wikipedia/home.png"],["wiki-article","wikipedia/article.png"],["wiki-chat","wikipedia/chat.png"],["dewey-recs","dewey/hifi-recs.png"],["dewey-feed","dewey/hifi-feed.png"],["dewey-shelf","dewey/hifi-shelf.png"]]){
  await sharp("src/assets/work/"+s).resize(786,null).png().toFile(`${OUT}/${n}.png`);
}
console.log("phones written");

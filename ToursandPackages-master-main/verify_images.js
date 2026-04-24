const candidates = [
  { name: "Santorini", url: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1600&fit=crop" },
  { name: "Aurora", url: "https://images.unsplash.com/photo-1520769945061-0a448c463865?w=1600&fit=crop" },
  { name: "Great Wall", url: "https://images.unsplash.com/photo-1508180588132-7230b42fbb1c?w=1600&fit=crop" },
  { name: "Pyramids", url: "https://images.unsplash.com/photo-1605649487212-4d4ce7ca6be0?w=1600&fit=crop" },
  { name: "NYC", url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&fit=crop" },
  { name: "Mt Fuji", url: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1600&fit=crop" },
  { name: "Taj Mahal", url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7c5?w=1600&fit=crop" }
];

async function run() {
  for (let i = 0; i < candidates.length; i++) {
    try {
      const r = await fetch(candidates[i].url, { method: 'HEAD' });
      console.log(`[${r.status}] ${candidates[i].name} = ${candidates[i].url}`);
    } catch(e) {
      console.log(`[Error] ${candidates[i].name}`);
    }
  }
}
run();

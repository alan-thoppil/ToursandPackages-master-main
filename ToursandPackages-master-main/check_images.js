const urls = [
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1570077188670-e3a8d69f0bd5?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1531366936336-62e0672eceab?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1615551043360-33de8b5f410c?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1508804185872-d7bad82ecf97?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1539650116574-8efeb43e2b08?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600&fit=crop",
  "https://images.unsplash.com/photo-1496442220379-c567bb6c4fdb?w=1600&fit=crop"
];

async function run() {
  for (let i = 0; i < urls.length; i++) {
    try {
      const r = await fetch(urls[i], { method: 'HEAD' });
      console.log(`Image ${i + 1}: ${r.status}`);
    } catch(e) {
      console.log(`Image ${i + 1}: Error`);
    }
  }
}
run();

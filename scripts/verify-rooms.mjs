import https from 'https';

function fetchRooms() {
  return new Promise((resolve, reject) => {
    https.get('https://meetpin-weld.vercel.app/api/rooms?bbox=37.4,126.8,37.7,127.2&limit=100', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

const response = await fetchRooms();
const rooms = response.data.rooms;

console.log('=== 전체 10개 방 상세 검증 ===\n');

rooms.forEach((room, index) => {
  console.log(`[${index + 1}/10] ${room.title}`);
  console.log(`  - ID: ${room.id}`);
  console.log(`  - Host UID: ${room.host_uid}`);
  console.log(`  - Category: ${room.category}`);
  console.log(`  - Location: (${room.lat}, ${room.lng})`);
  console.log(`  - Place: ${room.place_text}`);
  console.log(`  - Start: ${room.start_at}`);
  console.log(`  - Max People: ${room.max_people}`);
  console.log(`  - Fee: ₩${room.fee ? room.fee.toLocaleString() : 0}`);
  console.log(`  - Visibility: ${room.visibility}`);
  console.log(`  - Status: ${room.status}`);
  console.log(`  - Created: ${room.created_at}`);
  console.log(`  - Profiles: ${room.profiles ? 'Loaded' : 'null (expected for anonymous)'}`);

  const missing = [];
  if (!room.id) missing.push('id');
  if (!room.host_uid) missing.push('host_uid');
  if (!room.title) missing.push('title');
  if (!room.category) missing.push('category');
  if (room.lat === null || room.lat === undefined) missing.push('lat');
  if (room.lng === null || room.lng === undefined) missing.push('lng');
  if (!room.place_text) missing.push('place_text');
  if (!room.start_at) missing.push('start_at');
  if (!room.max_people) missing.push('max_people');
  if (!room.visibility) missing.push('visibility');
  if (!room.status) missing.push('status');

  if (missing.length > 0) {
    console.log(`  ⚠️  Missing fields: ${missing.join(', ')}`);
  } else {
    console.log(`  ✅ All critical fields present`);
  }
  console.log('');
});

console.log('=== 최종 통계 ===');
console.log(`Total rooms verified: ${rooms.length}`);
console.log(`All rooms have complete data: ${rooms.every(r => r.id && r.host_uid && r.title)}`);
console.log(`All rooms are public: ${rooms.every(r => r.visibility === 'public')}`);
console.log(`All rooms are open: ${rooms.every(r => r.status === 'open')}`);
console.log('');

// Category breakdown
const categories = rooms.reduce((acc, r) => {
  acc[r.category] = (acc[r.category] || 0) + 1;
  return acc;
}, {});
console.log('Category distribution:');
Object.entries(categories).forEach(([cat, count]) => {
  console.log(`  - ${cat}: ${count} rooms`);
});

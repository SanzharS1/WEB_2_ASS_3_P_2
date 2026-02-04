require('dotenv').config();
const bcrypt = require('bcrypt');
const { getDb } = require('./database/mongo');

async function run() {
  const db = await getDb();

  // ======= Create/Update Admin user =======
  const email = 'admin@fitlife.com';
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 10);

  await db.collection('users').updateOne(
    { email },
    {
      $set: {
        email,
        passwordHash,
        role: 'admin',
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  // ======= Seed workouts (20 records) =======
  const col = db.collection('workouts');
  const count = await col.countDocuments();

  if (count < 20) {
    const base = [
      { name:'Morning Run', type:'Cardio', intensity:'Medium', duration:30, calories:250, date:'2026-02-01', notes:'Park route', status:'done' },
      { name:'Leg Day', type:'Strength', intensity:'High', duration:45, calories:400, date:'2026-02-02', notes:'Squats + lunges', status:'done' },
      { name:'Yoga Flow', type:'Flexibility', intensity:'Low', duration:25, calories:120, date:'2026-02-03', notes:'Stretching', status:'done' },
      { name:'Cycling', type:'Cardio', intensity:'Medium', duration:40, calories:350, date:'2026-02-04', notes:'City ride', status:'planned' }
    ];

    const docs = [];
    for (let i = 0; i < 20; i++) {
      const b = base[i % base.length];
      docs.push({
        ...b,
        name: `${b.name} #${i + 1}`,
        createdAt: new Date()
      });
    }

    await col.insertMany(docs);
  }

  console.log('Seed done!');
  console.log('Admin login: admin@fitlife.com / admin123');
  console.log('Workouts seeded: >= 20');
  process.exit(0);
}

run().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});

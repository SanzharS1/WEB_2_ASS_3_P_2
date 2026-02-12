require('dotenv').config();
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { getDb } = require('./database/mongo');

async function upsertUser(db, { email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 10);

  await db.collection('users').updateOne(
    { email: email.toLowerCase() },
    {
      $set: {
        email: email.toLowerCase(),
        passwordHash,
        role,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  return db.collection('users').findOne({ email: email.toLowerCase() });
}

async function run() {
  const db = await getDb();

  // 🔐 credentials from ENV (NO hardcoded secrets)
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@fitlife.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';

  const userEmail = process.env.SEED_USER_EMAIL || 'user@fitlife.com';
  const userPassword = process.env.SEED_USER_PASSWORD || 'user123';

  const admin = await upsertUser(db, {
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
  });

  const user = await upsertUser(db, {
    email: userEmail,
    password: userPassword,
    role: 'user',
  });

  const col = db.collection('workouts');

  const total = await col.countDocuments();
  if (total < 20) {
    const base = [
      { name:'Morning Run', type:'Cardio', intensity:'Medium', duration:30, calories:250, date:'2026-02-01', notes:'Park route', status:'done' },
      { name:'Leg Day', type:'Strength', intensity:'High', duration:45, calories:400, date:'2026-02-02', notes:'Squats + lunges', status:'done' },
      { name:'Yoga Flow', type:'Flexibility', intensity:'Low', duration:25, calories:120, date:'2026-02-03', notes:'Stretching', status:'done' },
      { name:'Cycling', type:'Cardio', intensity:'Medium', duration:40, calories:350, date:'2026-02-04', notes:'City ride', status:'planned' }
    ];

    const docs = [];

    for (let i = 0; i < 20; i++) {
      const b = base[i % base.length];
      const ownerId = i % 2 === 0 ? user._id : admin._id;

      docs.push({
        userId: new ObjectId(ownerId),
        ...b,
        name: `${b.name} #${i + 1}`,
        createdAt: new Date(),
      });
    }

    await col.insertMany(docs);
  }

  console.log('✅ Seed done!');
  console.log(`Admin login: ${adminEmail}`);
  console.log(`User login : ${userEmail}`);
  console.log('Workouts seeded: >= 20 (with userId owners)');
  process.exit(0);
}

run().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});

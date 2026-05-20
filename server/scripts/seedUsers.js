/**
 * MAIRA & ADHIS ADVOCATES - User Seed Script
 *
 * Creates 8 Firebase Auth accounts + Firestore user documents.
 *
 * USAGE:
 *   cd server
 *   node scripts/seedUsers.js
 *
 * REQUIREMENTS:
 *   Set FIREBASE_SERVICE_ACCOUNT env var with your Firebase service account JSON,
 *   OR run with Firebase emulators, OR use Application Default Credentials.
 *
 *   To get a service account:
 *   Firebase Console → Project Settings → Service accounts → Generate new private key
 *   Then: export FIREBASE_SERVICE_ACCOUNT=$(cat serviceAccount.json)
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
if (!admin.apps.length) {
  // Option 1: serviceAccount.json file in server/ folder
  const keyPath = path.join(__dirname, '..', 'serviceAccount.json');
  if (fs.existsSync(keyPath)) {
    const serviceAccount = require(keyPath);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Option 2: environment variable
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  } else {
    console.error('❌ No service account found.');
    console.error('   Place serviceAccount.json in the server/ folder and try again.');
    process.exit(1);
  }
}

const auth = admin.auth();
const db = admin.firestore();

const users = [
  // ===== ADMINISTRATORS (2) =====
  {
    email: 'admin1@maca.co.tz',
    password: 'Admin@Maira2024',
    name: 'Adv. Maira Hassan',
    role: 'ADMIN',
    department: 'Management',
  },
  {
    email: 'admin2@maca.co.tz',
    password: 'Admin@Adhis2024',
    name: 'Adv. Adhis Nkrumah',
    role: 'ADMIN',
    department: 'Management',
  },

  // ===== EMPLOYEES (6) =====
  {
    email: 'james.kimani@maca.co.tz',
    password: 'Staff@2024!',
    name: 'James Kimani',
    role: 'ADVOCATE',
    department: 'Legal',
  },
  {
    email: 'florence.mwangi@maca.co.tz',
    password: 'Staff@2024!',
    name: 'Florence Mwangi',
    role: 'SECRETARY',
    department: 'Administration',
  },
  {
    email: 'robert.osei@maca.co.tz',
    password: 'Staff@2024!',
    name: 'Robert Osei',
    role: 'ACCOUNTANT',
    department: 'Finance',
  },
  {
    email: 'amina.saleh@maca.co.tz',
    password: 'Staff@2024!',
    name: 'Amina Saleh',
    role: 'PROCUREMENT_OFFICER',
    department: 'Procurement',
  },
  {
    email: 'david.njoroge@maca.co.tz',
    password: 'Staff@2024!',
    name: 'David Njoroge',
    role: 'EMPLOYEE',
    department: 'General',
  },
  {
    email: 'grace.wanjiku@maca.co.tz',
    password: 'Staff@2024!',
    name: 'Grace Wanjiku',
    role: 'EMPLOYEE',
    department: 'General',
  },
];

async function seedUsers() {
  console.log('\n🔐 MAIRA & ADHIS ADVOCATES - Creating User Accounts\n');
  console.log('='.repeat(50));

  for (const user of users) {
    try {
      // Create or get Firebase Auth user
      let authUser;
      try {
        authUser = await auth.createUser({
          email: user.email,
          password: user.password,
          displayName: user.name,
          emailVerified: true,
        });
        console.log(`✅ Created: ${user.email}`);
      } catch (err) {
        if (err.code === 'auth/email-already-exists') {
          authUser = await auth.getUserByEmail(user.email);
          console.log(`⏭  Exists:  ${user.email}`);
        } else {
          throw err;
        }
      }

      // Create Firestore user document
      await db.collection('users').doc(authUser.uid).set({
        uid: authUser.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: 'ACTIVE',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      console.log(`   └─ Profile: ${user.name} | Role: ${user.role}\n`);

    } catch (err) {
      console.error(`❌ Error creating ${user.email}:`, err.message, '\n');
    }
  }

  console.log('='.repeat(50));
  console.log('\n✅ Setup complete!\n');
  console.log('ADMIN ACCOUNTS:');
  console.log('  📧 admin1@maca.co.tz     🔑 Admin@Maira2024');
  console.log('  📧 admin2@maca.co.tz     🔑 Admin@Adhis2024\n');
  console.log('STAFF ACCOUNTS (all use password: Staff@2024!):');
  users.slice(2).forEach(u => console.log(`  📧 ${u.email}`));
  console.log('\nAdmins can change roles via the User Management page in the dashboard.\n');
  process.exit(0);
}

seedUsers().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

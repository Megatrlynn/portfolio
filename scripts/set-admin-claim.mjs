import admin from 'firebase-admin';

const getArg = (name) => {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=').slice(1).join('=') : '';
};

const uid = getArg('uid');
const email = getArg('email');
const adminFlagArg = getArg('admin');
const adminFlag = adminFlagArg === '' ? true : adminFlagArg === 'true';

if (!uid && !email) {
  console.error('Usage: node scripts/set-admin-claim.mjs --uid=<FIREBASE_UID> [--admin=true|false]');
  console.error('   or: node scripts/set-admin-claim.mjs --email=<USER_EMAIL> [--admin=true|false]');
  process.exit(1);
}

// Requires GOOGLE_APPLICATION_CREDENTIALS env var to point to your service account JSON.
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const run = async () => {
  try {
    const auth = admin.auth();
    const user = uid ? await auth.getUser(uid) : await auth.getUserByEmail(email);

    await auth.setCustomUserClaims(user.uid, { admin: adminFlag });

    console.log(`Success: set admin claim to ${adminFlag} for UID ${user.uid} (${user.email ?? 'no-email'})`);
    console.log('Note: user must refresh token (sign out/in) for new claims to take effect.');
  } catch (error) {
    console.error('Failed to set custom claim.');
    console.error(error);
    process.exit(1);
  }
};

run();

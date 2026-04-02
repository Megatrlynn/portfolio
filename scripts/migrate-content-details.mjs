import admin from 'firebase-admin';

const hasArg = (name) => process.argv.includes(`--${name}`);
const getArg = (name) => {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=').slice(1).join('=') : '';
};

const commit = hasArg('commit');
const credentialsPath = getArg('credentials');

if (credentialsPath) {
  // Optional explicit credentials file path.
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const ensureArray = (value) => (Array.isArray(value) ? value : []);
const asString = (value, fallback = '') => (typeof value === 'string' ? value : fallback);

const buildProjectPatch = (data) => {
  const fallbackLink = asString(data.link, '').trim();
  const patch = {};

  if (!('fullDescription' in data)) {
    patch.fullDescription = asString(data.description, '');
  }
  if (!('features' in data)) {
    patch.features = [];
  }
  if (!('challenges' in data)) {
    patch.challenges = [];
  }
  if (!('outcomes' in data)) {
    patch.outcomes = [];
  }
  if (!('role' in data)) {
    patch.role = 'Full Stack & IoT Developer';
  }
  if (!('duration' in data)) {
    patch.duration = 'N/A';
  }
  if (!('status' in data)) {
    patch.status = 'Completed';
  }
  if (!('demoUrl' in data)) {
    patch.demoUrl = fallbackLink || '#';
  }
  if (!('repoUrl' in data)) {
    patch.repoUrl = fallbackLink || '#';
  }

  // Normalize malformed values without overriding valid data.
  if ('features' in data && !Array.isArray(data.features)) {
    patch.features = ensureArray(data.features);
  }
  if ('challenges' in data && !Array.isArray(data.challenges)) {
    patch.challenges = ensureArray(data.challenges);
  }
  if ('outcomes' in data && !Array.isArray(data.outcomes)) {
    patch.outcomes = ensureArray(data.outcomes);
  }

  return patch;
};

const buildPostPatch = (data) => {
  const patch = {};

  if (!('content' in data)) {
    patch.content = asString(data.excerpt, '');
  }
  if (!('tools' in data)) {
    patch.tools = [];
  }
  if (!('keyTakeaways' in data)) {
    patch.keyTakeaways = [];
  }
  if (!('audience' in data)) {
    patch.audience = 'General Developers';
  }
  if (!('difficulty' in data)) {
    patch.difficulty = 'Intermediate';
  }
  if (!('referenceLinks' in data)) {
    patch.referenceLinks = [];
  }

  // Normalize malformed values without overriding valid data.
  if ('tools' in data && !Array.isArray(data.tools)) {
    patch.tools = ensureArray(data.tools);
  }
  if ('keyTakeaways' in data && !Array.isArray(data.keyTakeaways)) {
    patch.keyTakeaways = ensureArray(data.keyTakeaways);
  }
  if ('referenceLinks' in data && !Array.isArray(data.referenceLinks)) {
    patch.referenceLinks = ensureArray(data.referenceLinks);
  }

  return patch;
};

const runCollectionMigration = async ({ collectionName, buildPatch }) => {
  const snapshot = await db.collection(collectionName).get();
  let inspected = 0;
  let changed = 0;

  console.log(`\n[${collectionName}] found ${snapshot.size} documents`);

  for (const docSnap of snapshot.docs) {
    inspected += 1;
    const data = docSnap.data();
    const patch = buildPatch(data);
    const keys = Object.keys(patch);

    if (keys.length === 0) {
      continue;
    }

    changed += 1;
    console.log(`- ${docSnap.id}: will set [${keys.join(', ')}]`);

    if (commit) {
      await docSnap.ref.update(patch);
    }
  }

  console.log(`[${collectionName}] inspected=${inspected} changed=${changed} mode=${commit ? 'COMMIT' : 'DRY-RUN'}`);
  return { inspected, changed };
};

const run = async () => {
  try {
    console.log('Starting content details migration...');
    console.log(`Mode: ${commit ? 'COMMIT (writes enabled)' : 'DRY-RUN (no writes)'}`);

    const projects = await runCollectionMigration({
      collectionName: 'projects',
      buildPatch: buildProjectPatch,
    });

    const posts = await runCollectionMigration({
      collectionName: 'posts',
      buildPatch: buildPostPatch,
    });

    const totalChanged = projects.changed + posts.changed;
    console.log(`\nMigration complete. Total docs needing updates: ${totalChanged}`);

    if (!commit) {
      console.log('No writes were made. Re-run with --commit to apply updates.');
    }
  } catch (error) {
    console.error('Migration failed.');
    console.error(error);
    process.exit(1);
  }
};

run();

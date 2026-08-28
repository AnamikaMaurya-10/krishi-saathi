const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'AnamikaMaurya-10/krishi-saathi';
const BRANCH = 'main';

function api(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.github.com',
      path: urlPath,
      method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'node.js',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    };
    if (data) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function createBlob(filePath) {
  const content = fs.readFileSync(filePath);
  const isBinary = content.includes(0);
  let res;
  if (isBinary) {
    res = await api('POST', `/repos/${REPO}/git/blobs`, {
      content: content.toString('base64'),
      encoding: 'base64',
    });
  } else {
    res = await api('POST', `/repos/${REPO}/git/blobs`, {
      content: content.toString('utf8'),
      encoding: 'utf-8',
    });
  }
  if (res.status !== 201) {
    console.error(`   Blob failed for ${filePath}:`, res.status, JSON.stringify(res.data).substring(0, 200));
  }
  return res.data?.sha;
}

async function main() {
  const BASE = '/home/daytona/codebase';
  
  // Get current main branch ref
  console.log('1. Getting current main branch...');
  const refRes = await api('GET', `/repos/${REPO}/git/refs/heads/${BRANCH}`);
  if (refRes.status !== 200) {
    console.error('Failed to get ref:', refRes);
    process.exit(1);
  }
  const currentSha = refRes.data.object.sha;
  console.log(`   Current main SHA: ${currentSha}`);
  
  // Get current tree
  const commitRes = await api('GET', `/repos/${REPO}/git/commits/${currentSha}`);
  const baseTreeSha = commitRes.data.tree.sha;
  console.log(`   Base tree SHA: ${baseTreeSha}`);
  
  // Get the tree recursively to find existing file SHAs
  console.log('2. Getting existing file tree...');
  const treeRes = await api('GET', `/repos/${REPO}/git/trees/${baseTreeSha}?recursive=1`);
  const existingFiles = {};
  if (treeRes.data.tree) {
    for (const item of treeRes.data.tree) {
      if (item.type === 'blob') {
        existingFiles[item.path] = item.sha;
      }
    }
  }
  console.log(`   Found ${Object.keys(existingFiles).length} existing files`);
  
  // Files to delete
  const filesToDelete = [
    'src/pages/Auth.tsx',
    'src/components/RequireAuth.tsx',
    'src/hooks/use-auth.ts',
    'src/convex/auth.ts',
    'src/convex/auth.config.ts',
    'src/convex/auth/emailOtp.ts',
    'src/convex/http.ts',
    'src/convex/users.ts',
  ];
  
  // Files to create/update
  const filesToCreate = [
    'src/pages/Login.tsx',
    'src/main.tsx',
    'src/components/LogoDropdown.tsx',
    'src/pages/Landing.tsx',
    'src/convex/schema.ts',
    'package.json',
  ];
  
  // Build the tree
  console.log('3. Building new tree...');
  const tree = [];
  
  // Add deleted files (set sha to null for deletion)
  for (const f of filesToDelete) {
    if (existingFiles[f]) {
      tree.push({ path: f, mode: '100644', type: 'blob', sha: null });
      console.log(`   DELETE: ${f}`);
    }
  }
  
  // Create/update files
  for (const f of filesToCreate) {
    const fullPath = path.join(BASE, f);
    if (fs.existsSync(fullPath)) {
      const sha = await createBlob(fullPath);
      if (sha) {
        tree.push({ path: f, mode: '100644', type: 'blob', sha });
        console.log(`   CREATE/UPDATE: ${f} -> ${sha.substring(0, 8)}`);
      } else {
        console.error(`   SKIP (no SHA): ${f}`);
      }
    }
  }
  
  // Create new tree
  console.log('4. Creating tree...');
  const newTreeRes = await api('POST', `/repos/${REPO}/git/trees`, {
    base_tree: baseTreeSha,
    tree: tree,
  });
  if (newTreeRes.status !== 201) {
    console.error('Failed to create tree:', newTreeRes);
    process.exit(1);
  }
  const newTreeSha = newTreeRes.data.sha;
  console.log(`   New tree SHA: ${newTreeSha}`);
  
  // Create commit
  console.log('5. Creating commit...');
  const commitMsg = 'Remove authentication, add demo role-selection login\n\n- Delete Auth.tsx, RequireAuth.tsx, use-auth.ts, auth.ts, auth.config.ts, emailOtp.ts, http.ts, users.ts\n- Add Login.tsx (role selection: Farmer/Officer)\n- Rewrite main.tsx without ConvexAuthProvider\n- Update Landing.tsx CTAs to /login\n- Remove authTables from schema.ts\n\n🤖 Generated with Codebuff\nCo-Authored-By: Codebuff <noreply@codebuff.com>';
  
  const newCommitRes = await api('POST', `/repos/${REPO}/git/commits`, {
    message: commitMsg,
    tree: newTreeSha,
    parents: [currentSha],
  });
  if (newCommitRes.status !== 201) {
    console.error('Failed to create commit:', newCommitRes);
    process.exit(1);
  }
  const newCommitSha = newCommitRes.data.sha;
  console.log(`   New commit SHA: ${newCommitSha}`);
  
  // Force update the ref
  console.log('6. Updating main branch...');
  const updateRes = await api('PATCH', `/repos/${REPO}/git/refs/heads/${BRANCH}`, {
    sha: newCommitSha,
    force: true,
  });
  if (updateRes.status !== 200) {
    console.error('Failed to update ref:', updateRes);
    process.exit(1);
  }
  console.log(`   ✅ main branch updated to ${newCommitSha}`);
  console.log('\nDone! Vercel will auto-deploy from this commit.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

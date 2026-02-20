import {$} from 'execa';
import glob from 'tiny-glob';

// const zipPath = (await glob('web-ext-artifacts/bookmark*.zip')).pop();
let zipPath;
for (const path of await glob('web-ext-artifacts/*.zip')) {
  if (/latest|source/i.test(path)) {
    continue
  }
  zipPath = path;
  break;
}

await $({stdin: {file: zipPath}})`crx3 -p key.pem -o ${zipPath.replace('.zip', '.crx')}`;

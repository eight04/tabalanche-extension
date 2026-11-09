import fs from "node:fs/promises";

const filePath = process.argv[2];
const data = await fs.readFile(filePath, 'utf-8');
const tabGroups = [];

const lines = data.split(/\r?\n/);
let currentGroup = null;

for (const line of lines) {
  if (line.trim() === '') {
    if (currentGroup) {
      tabGroups.push(currentGroup);
      currentGroup = null;
    }
    continue;
  }
  if (!currentGroup) {
    currentGroup = {
      created: new Date().getTime(),
      tabs: []
    };
  }
  const [, url, title] = line.match(/^(\S+) \| (.+)/) || [null, line];
  if (!url) {
    throw new Error(`Invalid line format: ${line}`);
  }
  currentGroup.tabs.push({
    url,
    title: title || url
  });
}

if (currentGroup) {
  tabGroups.push(currentGroup);
}

console.log(JSON.stringify(tabGroups, null, 2));


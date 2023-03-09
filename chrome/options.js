/* global platform */

// Saves options to chrome.storage.sync.
async function save_options() {
  const opts = {};
  
  for (const key in platform.optionDefaults) {
    var input = document.getElementById(key);
    if (!input) continue;
    // right now this is the only input we have
    if (input.type == 'checkbox') {
      opts[key] = input.checked;
    } else if (input.type == 'text') {
      opts[key] = input.value;
    } else {
      throw new Error(`unknown input type ${input.type}`);
    }
  }
  
  await platform.setOptions(opts);
  
  // TODO: Update status to let user know options were saved.
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
async function restore_options() {
  const items = await platform.getOptions();
  for (const key in items) {
    var input = document.getElementById(key);
    if (!input) continue;
    
    if (input.type == 'checkbox') {
      input.checked = items[key];
    } else if (input.type == 'text') {
      input.value = items[key];
    } else {
      throw new Error(`unknown input type ${input.type}`);
    }
  }
}

var advancedDiv = document.getElementById('advanced');
var advancedLink = document.getElementById('show-advanced');

advancedLink.addEventListener('click', function () {
  if (advancedDiv.hidden) {
    advancedDiv.hidden = false;
    advancedLink.textContent = 'Hide advanced options...';
  } else {
    advancedDiv.hidden = true;
    advancedLink.textContent = 'Show advanced options...';
  }
});

document.addEventListener('DOMContentLoaded', restore_options);

const ACTIONS = {
  "destroy": () => browser.runtime.sendMessage({
    method: "destroy-db"
  }),
  "save": save_options,
  "import-tabs": importTabs,
  "export-tabs": exportTabs,
};

for (const key in ACTIONS) {
  document.querySelector(`#${key}`).addEventListener('click', ACTIONS[key]);
}

document.querySelector('#useScreenshot').addEventListener('click', e => {
  if (e.target.checked) {
    platform.requestScreenshotPermission();
  }
});

// FIXME: support dropping file on the button
async function importTabs() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.addEventListener("change", async () => {
    const file = input.files[0];
    const text = await file.text();
    await browser.runtime.sendMessage({
      method: "import-tabs",
      text
    });
  })
  input.click();
}

let lastUrl = "";
async function exportTabs() {
  URL.revokeObjectURL(lastUrl);
  const text = await browser.runtime.sendMessage({
    method: "export-tabs"
  });
  const file = new File([text], "tabalanche-export.json", {
    type: "application/json",
  });
  const a = document.createElement("a");
  lastUrl = a.href = URL.createObjectURL(file);
  a.download = file.name;
  a.click();
}

const cookieTotalElement = document.getElementById("cookieTotal");
const CPSElement = document.getElementById("CPS");
const cookieButton = document.getElementById("cookieButton");
const upgradeMenu = document.getElementById("upgradeMenu");

let cookieTotal = 0;
let cookiesPerClick = 1;
let cookiesPerSecond = 0;
let upgradesBought = [];

cookieButton.addEventListener("click", function () {
  addCookies(cookiesPerClick);
});

// load the game state, start update and save timers and build the menu
load();
setInterval(update, 1000);
setInterval(save, 15000);
getUpgrades(upgradesBought);

// add cookies to total - depends on cookies per click
function addCookies(amount) {
  cookieTotal += amount;
  cookieTotalElement.innerText = cookieTotal;
}

// buy an upgrade if we can afford it
function buyUpgrade(upgrade) {
  if (cookieTotal < upgrade.cost) {
    console.log("Not enough cookies to purchase:", upgrade.name);
    return;
  }
  if (!upgradesBought[upgrade.id]) {
    upgradesBought[upgrade.id] = upgrade;
    upgradesBought[upgrade.id].count = 0;
  }
  upgradesBought[upgrade.id].count++;
  cookiesPerSecond = calculateCPS();
  cookieTotal -= upgrade.cost;

  let ownedLabel = document.getElementById(`ownedLabel${upgrade.id}`);
  // ownedLabel.innerText = Number(ownedLabel.innerText) + 1;

  ownedLabel.innerText = `You have: ${upgradesBought[upgrade.id].count}`;

  console.log("Bought upgrade:", upgrade.name);
}

// calculate cookies per second from list of bought upgrades
function calculateCPS() {
  let CPS = 0;
  for (upgrade of upgradesBought) {
    if (upgrade) {
      CPS += upgrade.increase * upgrade.count;
    }
  }
  return CPS;
}

// fetch upgrades from API and build the upgrade menu
async function getUpgrades(upgradesBoughtParam) {
  // get upgrades from API
  const response = await fetch(
    "https://cookie-upgrade-api.vercel.app/api/upgrades"
  );
  const upgradeList = await response.json();

  // build upgrade menu
  for await (const upgrade of upgradeList) {
    let upgradeBox = document.createElement("button");
    upgradeBox.classList.add("upgrade-box");
    upgradeBox.id = `upgradeBox${upgrade.id}`;
    upgradeBox.addEventListener("click", function () {
      buyUpgrade(upgrade);
    });

    let nameLabel = document.createElement("p");
    nameLabel.innerText = upgrade.name;

    let costLabel = document.createElement("p");
    costLabel.innerText = `Cost: ${upgrade.cost}`;

    let CPSLabel = document.createElement("p");
    CPSLabel.innerText = `+${upgrade.increase} per second`;

    let ownedLabel = document.createElement("p");
    ownedLabel.id = `ownedLabel${upgrade.id}`;
    if (upgradesBoughtParam[upgrade.id]) {
      ownedLabel.innerText = `You have: ${
        upgradesBoughtParam[upgrade.id].count
      }`;
    } else {
      ownedLabel.innerText = "You have: 0";
    }

    upgradeBox.appendChild(nameLabel);
    upgradeBox.appendChild(costLabel);
    upgradeBox.appendChild(CPSLabel);
    upgradeBox.appendChild(ownedLabel);
    upgradeMenu.appendChild(upgradeBox);
  }
  return upgradeList;
}

// restore game state from local storage
function load() {
  if (localStorage.getItem("cookieTotal")) {
    cookieTotal = Number(localStorage.getItem("cookieTotal"));
  }
  if (localStorage.getItem("cookiesPerClick")) {
    cookiesPerClick = Number(localStorage.getItem("cookiesPerClick"));
  }
  if (localStorage.getItem("cookiesPerSecond")) {
    cookiesPerSecond = Number(localStorage.getItem("cookiesPerSecond"));
  }
  if (localStorage.getItem("upgradesBought")) {
    upgradesBought = JSON.parse(localStorage.getItem("upgradesBought"));
  }
}

// store game state in local storage
// happens every 15 seconds
function save() {
  cookiesPerSecond = calculateCPS();
  localStorage.setItem("cookieTotal", cookieTotal);
  localStorage.setItem("cookiesPerClick", cookiesPerClick);
  localStorage.setItem("cookiesPerSecond", cookiesPerSecond);
  localStorage.setItem("upgradesBought", JSON.stringify(upgradesBought));
}

// update the total cookies and cookies per second readouts
// happens every second
function update() {
  cookieTotal += cookiesPerSecond;
  cookieTotalElement.innerText = cookieTotal;
  CPSElement.innerText = `Cookies per second: ${cookiesPerSecond}`;
}

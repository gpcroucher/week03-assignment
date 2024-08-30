const cookieTotalElement = document.getElementById("cookieTotal");
const cookieButton = document.getElementById("cookieButton");
const upgradeMenu = document.getElementById("upgradeMenu");

let cookieTotal = 0;
let cookiesPerClick = 1;
let cookiesPerSecond = 0;
let upgradesBought = [];
load();

cookieButton.addEventListener("click", function () {
  addCookies(cookiesPerClick);
});

setInterval(update, 1000);
setInterval(save, 15000);

getUpgrades();

function addCookies(amount) {
  cookieTotal += amount;
  cookieTotalElement.innerText = cookieTotal;
}

function buyUpgrade(upgrade) {
  if (cookieTotal < upgrade.cost) {
    console.log("Not enough cookies to purchase:", upgrade.name);
  } else {
    if (!upgradesBought[upgrade.id]) {
      upgradesBought[upgrade.id] = upgrade;
      upgradesBought[upgrade.id].count = 0;
    }
    upgradesBought[upgrade.id].count++;
    cookiesPerSecond = calculateCPS();
    cookieTotal -= upgrade.cost;
    console.log("Bought upgrade:", upgrade.name);
  }
}

function calculateCPS() {
  let CPS = 0;
  for (upgrade of upgradesBought) {
    if (upgrade) {
      CPS += upgrade.increase * upgrade.count;
    }
  }
  return CPS;
}

async function getUpgrades() {
  // get upgrades from API
  const response = await fetch(
    "https://cookie-upgrade-api.vercel.app/api/upgrades"
  );
  const upgradeList = await response.json();

  // build upgrade menu
  for await (const upgrade of upgradeList) {
    let upgradeBox = document.createElement("div");
    upgradeBox.classList.add("upgrade-box");
    upgradeBox.id = `upgradeBox${upgrade.id}`;
    upgradeBox.addEventListener("click", function () {
      buyUpgrade(upgrade);
    });

    let nameLabel = document.createElement("p");
    nameLabel.innerText = upgrade.name;

    let costLabel = document.createElement("p");
    costLabel.innerText = upgrade.cost;

    let CPSLabel = document.createElement("p");
    CPSLabel.innerText = upgrade.increase;

    upgradeBox.appendChild(nameLabel);
    upgradeBox.appendChild(costLabel);
    upgradeBox.appendChild(CPSLabel);
    upgradeMenu.appendChild(upgradeBox);
  }
  return upgradeList;
}

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

function save() {
  cookiesPerSecond = calculateCPS();
  localStorage.setItem("cookieTotal", cookieTotal);
  localStorage.setItem("cookiesPerClick", cookiesPerClick);
  localStorage.setItem("cookiesPerSecond", cookiesPerSecond);
  localStorage.setItem("upgradesBought", JSON.stringify(upgradesBought));
}

function update() {
  cookieTotal += cookiesPerSecond;
  cookieTotalElement.innerText = cookieTotal;
}

const predictionBtns = document.getElementsByClassName(
  "prediction-dropdown-trigger"
);
const sideWindow = document.getElementById("side-left-window");
const windowContent = document.getElementById("left-window-content");
const closeWindowButton = document.getElementById("close-left-window");

export function initPredictions() {
  Array.from(predictionBtns).forEach((item) => {
    item.addEventListener("click", function (event) {
      sideWindow.classList.remove("-translate-x-full");
      sideWindow.classList.add("translate-x-0");
      windowContent.innerHTML = getContent(item.id);
    });
  });

  closeWindowButton.addEventListener("click", () => {
    sideWindow.classList.remove("translate-x-0");
    sideWindow.classList.add("-translate-x-full");
  });
}

function getContent(itemId) {
  const input_form_styling = "flex flex-col items-center";
  const input_styling =
    "bg-gray-500 text-white border border-gray-700 rounded p-2 text-l mb-2 w-80 box-border focus:border-gray-400 focus:outline-none";
  const button_styling = "btn-blue";
  switch (itemId) {
    case "collision-pred":
      return `
                <h2>Collision Prediction</h2>
                <div class="${input_form_styling}">
                    <input type="text" id="satellite1" placeholder="Satellite 1" class="${input_styling}">
                    <input type="text" id="satellite2" placeholder="Satellite 2" class="${input_styling}">
                    <button data-ripple="true" id="calculate-button" class="${button_styling}">Calculate</button>
                </div>
            `;
    case "pass-pred":
      return `
                <h2>Pass Prediction</h2>
                <div class="${input_form_styling}">
                    <input type="text" id="satellite1" placeholder="Satellite 1" class="${input_styling}">
                    <input type="text" id="satellite2" placeholder="Location" class="${input_styling}">
                    <button data-ripple="true" id="calculate-button" class="${button_styling}">Calculate</button>
                </div>
            `;
    case "re-entry-pred":
      return `
                <h2>Re-entry Prediction</h2>
                <div class="${input_form_styling}">
                    <input type="text" id="satellite1" placeholder="Satellite 1" class="${input_styling}">
                    <button data-ripple="true" id="calculate-button" class="${button_styling}">Calculate</button>
                </div>
            `;
    default:
      return "";
  }
}

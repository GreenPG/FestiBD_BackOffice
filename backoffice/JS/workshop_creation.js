const form = document.forms.newWorkshop;
const formElement = document.querySelector("form");
const createButton = document.querySelector(".create-button");
const nameContainer = document.querySelector(".name-container");
const categoryContainer = document.querySelector(".category-container");
const capacityContainer = document.querySelector(".capacity-container");
const dateContainer = document.querySelector(".date-container");
const timingsContainer = document.querySelector(".timing-container");
const descriptionContainer = document.querySelector(".description-container");
const categorySelect = document.querySelector("select");
const resetButton = document.querySelector(".reset");

async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:8081/categories", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getJWT()}`,
      },
    });

    if (!response.ok) {
      let data = response.json();
      throw new Error(`${data.reason}`);
    }

    const data = await response.json();

    data.forEach((category) => {
      let newOption = document.createElement("option");
      newOption.textContent = capitalize(category.name);
      newOption.value = category.id;
      categorySelect.appendChild(newOption);
    });
  } catch (e) {
    let newError = document.createElement("p");
    newError.textContent = `Error: ${e}`;
    formElement.appendChild(newError);
  }
}

function checkName() {
  if (form.name === "") {
    let errorMessage = document.createElement("p");
    errorMessage.textContent = "Workshop name required";
    errorMessage.classList.add("error");
    nameContainer.children.push(errorMessage);
    return false;
  }

  if (form.name.length > 255) {
    let errorMessage = document.createElement("p");
    errorMessage.textContent = "Workshop name too long";
    errorMessage.classList.add("error");
    nameContainer.children.push(errorMessage);
    return false;
  }
  return true;
}

function checkCategory() {
  if (form.category.value === "") {
    let errorMessage = document.createElement("p");
    errorMessage.textContent = "Category required";
    errorMessage.classList.add("error");
    categoryContainer.appendChild(errorMessage);
    return false;
  }
  return true;
}

function checkDate() {
  const firstDate = new Date("2026-9-13");
  const lastDate = new Date("2026-9-15");
  const workshopDate = new Date(
    form.date.valueAsDate.getFullYear(),
    form.date.valueAsDate.getMonth(),
    form.date.valueAsDate.getDate(),
  );

  if (
    workshopDate.getTime() < firstDate.getTime() ||
    workshopDate.getTime() > lastDate.getTime()
  ) {
    let errorMessage = document.createElement("p");
    errorMessage.textContent = `Date must be between ${firstDate.toDateString()} and ${lastDate.toDateString()}`;
    errorMessage.classList.add("error");
    dateContainer.appendChild(errorMessage);
    return false;
  }
  return true;
}

function checkTimings() {
  if (form.start.valueAsDate.getTime() >= form.end.valueAsDate.getTime()) {
    let errorMessage = document.createElement("p");
    errorMessage.textContent = "End time must be greater start time";
    errorMessage.classList.add("error");
    timingsContainer.appendChild(errorMessage);
    return false;
  }
  return true;
}

async function sendCreateWorkshopRequest() {
  try {
    let startDate = new Date(form.date.valueAsDate);
    startDate.setUTCHours(
      form.start.valueAsDate.getUTCHours(),
      form.start.valueAsDate.getUTCMinutes(),
      form.start.valueAsDate.getUTCSeconds(),
    );
    let endDate = new Date(form.date.valueAsDate);
    endDate.setUTCHours(
      form.end.valueAsDate.getUTCHours(),
      form.end.valueAsDate.getUTCMinutes(),
      form.end.valueAsDate.getUTCSeconds(),
    );

    const response = await fetch("http://localhost:8081/workshops/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJWT()}`,
      },
      body: JSON.stringify({
        name: form.name.value,
        category_id: form.category.value,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        capacity: form.capacity.valueAsNumber,
        totalSubscribers: 0,
        description: form.description.value,
      }),
    });

    if (!response.ok) {
      let data = await response.json();
      throw new Error(`${data.reason}`);
    }
  } catch (e) {
    console.log(e);
  }
}

function getJWT() {
  let token = "";
  const cookies = document.cookie.split(";");
  cookies.forEach((cookie) => {
    let splittedCookie = cookie.split("=");
    if (splittedCookie[0] === "jwttoken") {
      token = splittedCookie[1];
    }
  });
  return token;
}

function resetErrorMessages() {
  if (nameContainer.children.length === 3) {
    nameContainer.children.pop();
  }
  if (categoryContainer.children.length === 3) {
    categoryContainer.children.pop();
  }
  if (capacityContainer.children.length === 3) {
    capacityContainer.children.pop();
  }
  if (dateContainer.children.length === 3) {
    dateContainer.children.pop();
  }
  if (timingsContainer.children.length === 3) {
    timingsContainer.children.pop();
  }
  if (descriptionContainer.children.length === 3) {
    descriptionContainer.children[2].remove();
  }
  if (formElement.children.length === 3) {
    formElement.children[2].remove();
  }
}

function displaySuccess() {
  const main = document.querySelector("main");

  let successMessage = document.createElement("h2");
  successMessage.textContent = "Workshop successfully created";

  let newWorkshopButton = document.createElement("button");
  newWorkshopButton.textContent = "Create a new workshop";
  newWorkshopButton.classList.add("go-to-new-workshop");
  newWorkshopButton.addEventListener("click", () => {
    document.location = "workshop_creation.html";
  });

  let goToDashboardButton = document.createElement("button");
  goToDashboardButton.textContent = "Go back to dashboard";
  goToDashboardButton.classList.add("go-to-dashboard");

  goToDashboardButton.addEventListener("click", () => {
    document.location = "dashboard.html";
  });

  let buttonContainer = document.createElement("div");
  buttonContainer.appendChild(newWorkshopButton);
  buttonContainer.appendChild(goToDashboardButton);

  let successBox = document.createElement("div");
  successBox.classList.add("success-box");
  successBox.appendChild(successMessage);
  successBox.appendChild(buttonContainer);
  main.innerHTML = "";
  main.appendChild(successBox);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resetErrorMessages();
  if (
    !checkName() ||
    !checkCategory() ||
    !checkDate() ||
    !checkTimings() //||
  ) {
    return;
  }
  await sendCreateWorkshopRequest();
  displaySuccess();
});

fetchCategories();

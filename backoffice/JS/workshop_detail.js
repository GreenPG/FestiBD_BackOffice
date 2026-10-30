import { getJWT, fetchCategories, capitalize } from "./utils.js";

const workshop = document.forms.workshop;
const reservationsContainer = document.querySelector(".bookings-list");
const title = document.querySelector("h1");
const categoriesSelector = document.querySelector("select");
const backButton = document.querySelector(".back-button");
const editButton = document.querySelector(".edit-button");
const confirmButton = document.querySelector(".confirm-button");
const modificationMessage = document.querySelector(".modification-message");
const ws_id = document.URL.split("#")[1];

async function fetchWorkshop() {
  try {
    const response = await fetch(
      `http://localhost:8081/workshops/manage/${ws_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getJWT()}`,
        },
      },
    );

    if (!response.ok) {
      let data = await response.json();
      throw new Error(`Error: ${data.reason}`);
    }

    let data = await response.json();
    title.textContent = data.name;
    data.date = data.startTime;
    updateForm(data);

    await fillReservations(data.reservations);
  } catch (error) {
    console.log(error);
  }
}

async function fillReservations(reservations) {
  reservations.forEach((reservation) => {
    let username = document.createElement("p");
    username.textContent = reservation.username;
    let newReservation = document.createElement("div");
    newReservation.classList.add("booking-row");
    newReservation.appendChild(username);
    let button = document.createElement("button");
    let buttonImage = document.createElement("img");
    buttonImage.src = "../assets/x.circle.red.svg";
    buttonImage.alt = "Cancel button";
    button.appendChild(buttonImage);
    button.id = reservation.id;
    button.addEventListener("click", async (e) => {
      cancelButtonListener(e);
    });
    newReservation.appendChild(button);
    reservationsContainer.appendChild(newReservation);
  });
}

async function initCategories() {
  let categories = await fetchCategories();

  categories.forEach((category) => {
    let newCategory = document.createElement("option");
    newCategory.value = category.id;
    newCategory.textContent = capitalize(category.name);
    categoriesSelector.appendChild(newCategory);
  });
}

function updateBackupWorkshop() {
  const dateVal = workshop.date.value;
  const startVal = workshop.start.value;
  const endVal = workshop.end.value;

  const localStartDateTimeString = `${dateVal}T${startVal}:00`;
  const localEndDateTimeString = `${dateVal}T${endVal}:00`;

  return {
    name: title,
    category_id: workshop.category.value,
    capacity: workshop.capacity.valueAsNumber,
    startTime: new Date(localStartDateTimeString).toISOString(),
    endTime: new Date(localEndDateTimeString).toISOString(),
    description: workshop.description.value,
  };
}

function editListener() {
  backupWorkshop = updateBackupWorkshop();
  for (let index = 0; index < workshop.elements.length; index++) {
    workshop.elements[index].disabled = false;
  }
  toggleEditButton();
}

function cancelEditListener() {
  for (let index = 0; index < workshop.elements.length; index++) {
    if (!workshop.elements[index].classList.contains("edit-button")) {
      workshop.elements[index].disabled = true;
    }
  }
  updateForm(backupWorkshop);
  toggleEditButton();
  modificationMessage.classList.remove("failed");
}

function toggleEditButton() {
  if (isButtonEdit == true) {
    editButton.children[0].src = "../assets/x.circle.orange.svg";
    editButton.children[1].textContent = "Cancel";
    editButton.addEventListener("click", cancelEditListener, { once: true });
    confirmButton.disabled = false;
    isButtonEdit = false;
  } else {
    editButton.children[0].src = "../assets/pencil.line.svg";
    editButton.children[1].textContent = "Edit";
    editButton.addEventListener("click", editListener, { once: true });
    isButtonEdit = true;
    confirmButton.disabled = true;
  }
}

async function updateWorkshop() {
  try {
    const dateVal = workshop.date.value;
    const startVal = workshop.start.value;
    const endVal = workshop.end.value;

    const localStartDateTimeString = `${dateVal}T${startVal}:00`;
    const localEndDateTimeString = `${dateVal}T${endVal}:00`;
    const response = await fetch(`http://localhost:8081/workshops/${ws_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJWT()}`,
      },
      body: JSON.stringify({
        name: title.textContent,
        category_id: workshop.category.value,
        capacity: workshop.capacity.valueAsNumber,
        startTime: new Date(localStartDateTimeString).toISOString(),
        endTime: new Date(localEndDateTimeString).toISOString(),
        description: workshop.description.value,
      }),
    });

    if (!response.ok) {
      let data = await response.json();
      throw new Error(data.reason);
    }

    let data = await response.json();
    updateForm(data);

    confirmButton.disabled = true;

    modificationMessage.textContent = "Workshop modified successfully";
    modificationMessage.classList.remove("failed");
    modificationMessage.classList.add("success");
    modificationMessage.disabled = false;

    editButton.children[0].src = "../assets/pencil.line.svg";
    editButton.children[1].textContent = "Edit";
    editButton.addEventListener("click", editListener, { once: true });

    for (let index = 0; index < workshop.elements.length; index++) {
      if (!workshop.elements[index].classList.contains("edit-button")) {
        workshop.elements[index].disabled = true;
      }
    }
  } catch (error) {
    modificationMessage.textContent = `Modification failed: ${error.message}`;
    modificationMessage.classList.remove("success");
    modificationMessage.classList.add("failed");
    modificationMessage.disabled = false;
  }
}

function updateForm(newData) {
  workshop.category.value = newData.category_id;
  workshop.capacity.value = newData.capacity;
  const start = new Date(newData.startTime);
  const end = new Date(newData.endTime);
  const localDate = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
  const localStart = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  const localEnd = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
  workshop.date.value = localDate;
  workshop.start.value = localStart;
  workshop.end.value = localEnd;
  workshop.description.value = newData.description;
}

const pad = (n) => String(n).padStart(2, 0);

let isButtonEdit = true;
let backupWorkshop;
editButton.addEventListener("click", editListener, { once: true });
confirmButton.addEventListener("click", updateWorkshop);
backButton.addEventListener("click", () => {
  document.location = "dashboard.html";
});

async function cancelButtonListener(e) {
  try {
    const reservationID = e.currentTarget.id;
    const response = await fetch(
      `http://localhost:8081/reservations/${reservationID}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getJWT()}`,
        },
      },
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.reason);
    }

    removeReservation(reservationID);
  } catch (error) {
    console.log(error);
  }
}

function removeReservation(id) {
  for (let i = 0; i < reservationsContainer.children.length; i++) {
    if (reservationsContainer.children[i].children[1].id === id) {
      reservationsContainer.removeChild(reservationsContainer.children[i]);
      return;
    }
  }
}

await initCategories();
await fetchWorkshop();

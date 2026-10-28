import { getJWT, capitalize, getSiblings } from "./utils.js";

const tableBody = document.querySelector(".table-container tbody");
const days = document.querySelector(".days");

async function fetchWorkshops() {
  try {
    tableBody.innerHTML = "";
    console.log("yalla");
    console.log(getDate());
    const response = await fetch(
      `http://localhost:8081/workshops/search?date=${getDate()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getJWT()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("C'est la merde");
    }

    let data = await response.json();

    data.forEach((workshop) => {
      let newRow = document.createElement("tr");
      let title = document.createElement("td");
      title.textContent = workshop.name;
      let status = document.createElement("td");
      let statusContent = document.createElement("p");
      if (workshop.totalSubsribers >= workshop.capacity) {
        statusContent.classList.add("full");
        statusContent.textContent = "Full";
      } else {
        statusContent.classList.add("open");
        statusContent.textContent = "Open";
      }
      status.appendChild(statusContent);
      let category = document.createElement("td");
      category.textContent = capitalize(workshop.category_name);
      let start = document.createElement("td");
      start.textContent = new Date(workshop.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      let end = document.createElement("td");
      end.textContent = new Date(workshop.endTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      let capacity = document.createElement("td");
      capacity.textContent = workshop.capacity;
      let bookings = document.createElement("td");
      bookings.textContent = workshop.totalSubscribers;
      newRow.appendChild(title);
      newRow.appendChild(status);
      newRow.appendChild(category);
      newRow.appendChild(start);
      newRow.appendChild(end);
      newRow.appendChild(capacity);
      newRow.appendChild(bookings);
      tableBody.appendChild(newRow);
    });
  } catch (e) {
    console.log(e);
  }
}

function getDate() {
  const selectedDate = document.querySelector(".selected");

  switch (selectedDate.textContent.split(" ")[1]) {
    case "13/09":
      return "2026-09-13T00:00:00Z";
    case "14/09":
      return "2026-09-14T00:00:00Z";
    case "15/09":
      return "2026-09-15T00:00:00Z";
  }
}

console.log(days);
console.log(days.children);
for (let i = 0; i < days.children.length; i++) {
  days.children[i].addEventListener("click", () => {
    days.children[i].classList.add("selected");
    let siblings = getSiblings(days.children[i]);
    siblings.forEach((elem) => elem.classList.remove("selected"));
    fetchWorkshops();
  });
}
fetchWorkshops();

export async function fetchCategories() {
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

    return data;
  } catch (e) {
    throw e;
  }
}

export function getJWT() {
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

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const getSiblings = (n) => {
  return getChildren(n.parentNode.firstChild, n);
};

const getChildren = (elem, main) => {
  var siblings = [];
  for (; elem; elem = elem.nextSibling)
    if (elem.nodeType == 1 && elem != main) siblings.push(elem);
  return siblings;
};

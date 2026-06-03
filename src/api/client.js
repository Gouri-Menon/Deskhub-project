const BASE_URL = "http://localhost:3001";

async function request(url, options = {}) {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Something went wrong",
    }));

    throw new Error(error.message);
  }

  return response.json();
}

export const get = (url) =>
  request(url, {
    method: "GET",
  });

export const post = (url, data) =>
  request(url, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const patch = (url, data) =>
  request(url, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const del = (url) =>
  request(url, {
    method: "DELETE",
  });

export { request };
export async function fetchWithAuth(url, options = {}) {
  let access = localStorage.getItem("access");
  let refresh = localStorage.getItem("refresh");

  // Add Authorization header
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${access}`,
    "Content-Type": "application/json",
  };

  // First attempt
  let response = await fetch(url, options);

  // If access token expired → try refresh
  if (response.status === 401 && refresh) {
    const refreshResponse = await fetch("http://127.0.0.1:8000/accounts/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      localStorage.setItem("access", data.access);

      // Retry original request with new access token
      options.headers.Authorization = `Bearer ${data.access}`;
      return fetch(url, options);
    } else {
      // Refresh token invalid → logout user
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
    }
  }

  return response;
}

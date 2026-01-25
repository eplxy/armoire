
/**
 * use to check if user is logged in
 * source of truth is localStorage token
 */
export const checkIsLoggedIn = () => {
  const token = localStorage.getItem("token");
  return token !== null && !isTokenExpired(token);
};


export function isTokenExpired(token: string | null) {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  return decoded.exp < Math.floor(Date.now() / 1000);
}

export function parseJwt(token: string | null) {
  if (!token) {
    return true;
  }
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
//taken from https://mui.com/material-ui/react-avatar/

export function stringAvatar(name: string) {
  if (!name || name.length === 0) return {};

  const nameParts = name.split(" ").filter((part) => part.length > 0);
  const initials =
    nameParts.length === 1
      ? nameParts[0].slice(0, 1).toUpperCase()
      : `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();

  const bgColor = stringToColor(name);
  const textColor = getContrastText(bgColor);

  return {
    sx: {
      bgcolor: bgColor,
    },
    style: { color: textColor },
    children: initials,
  };
}

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function getContrastText(color: string) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF";
}

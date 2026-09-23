export const getProfileInitials = (name = "") => {
  const safeName = String(name).trim();

  if (!safeName) {
    return "U";
  }

  const words = safeName.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

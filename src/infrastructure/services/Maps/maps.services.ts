export const findCoordinatesFromLink = (link: string) => {
  const indexOfPlace = link.indexOf("place/");
  const rem = link.substring(indexOfPlace + 6);
  const name = rem.split("/")[0].replaceAll("+", " ");
  const lat = rem.split("/")[1].split(",")[0].replace("@", " ");
  const lng = rem.split("/")[1].split(",")[1];
  if (!name || !lat || !lng) return null;
  return {
    name,
    coordinates: {
      lat,
      lng,
    },
  };
};

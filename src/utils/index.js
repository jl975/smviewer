export const fetchDocument = async path => {
  const response = await fetch(path, {
    mode: "cors",
  });
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  const readResult = await reader.read();
  return decoder.decode(readResult.value);
};

export const getAssetPath = path => {
  return window.location.origin + "/assets/" + path;
};

export const capitalize = str => {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
};

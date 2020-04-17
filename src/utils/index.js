export const getOriginPath = () => {
  return window.location.href.slice(
    0,
    window.location.href.indexOf(window.location.search)
  );
};

export const fetchDocument = async (path) => {
  const response = await fetch(path, {
    mode: "cors",
  });
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  const readResult = await reader.read();
  return decoder.decode(readResult.value);
};

export const getAssetPath = (path) => {
  return getOriginPath() + "assets/" + path;
};

export const getJacketPath = (path) => {
  return getOriginPath() + "jackets/" + path;
};

export const capitalize = (str) => {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
};

const parseUrlParams = () => {
  if (!window.location.search) return {};
  const obj = {};
  try {
    window.location.search
      .slice(1)
      .split("&")
      .forEach((param) => {
        const [key, value] = param.split("=");
        obj[key] = value;
      });
    return obj;
  } catch (error) {
    console.log("error parsing url params", error);
    return {};
  }
};
export const presetParams = parseUrlParams();

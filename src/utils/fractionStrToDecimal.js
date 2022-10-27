const fractionStrToDecimal = (str) => {
  if (!str.includes("/")) {
    return Number(str);
  }

  return str.split("/").reduce((acc, cur) => acc / cur);
};

export default fractionStrToDecimal;

export const isValidEmail = (email) => {
  return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );
};

export const isValidText = (name) => {
  return /^[a-zA-Z0-9 ]*$/.test(name);
};

export const isValidUPICode = (name) => {
  return /^[a-zA-Z0-9@. - ]*$/.test(name);
};

export const isValidAddress = (name) => {
  return /^[a-zA-Z0-9,. -]*$/.test(name);
};

export const isValidTextOnly = (name) => {
  return /^[a-zA-Z ]*$/.test(name);
};

import crypto from "crypto";

function generatePassword(
  length = 12,
  charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()",
) {
  let password = "";
  const charsetLength = charset.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charsetLength);
    password += charset[randomIndex];
  }

  return password;
}

//   "password": "uT!c6@Pz8rNeqLwv"
export default generatePassword;

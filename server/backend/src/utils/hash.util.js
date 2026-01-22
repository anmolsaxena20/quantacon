import bcrypt from "bcrypt";

const hashPassword = (password) => bcrypt.hash(password, 10);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

export { hashPassword, comparePassword };

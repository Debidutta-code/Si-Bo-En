import bcrypt from 'bcryptjs';

const createHash = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

const compareHash = async (
  password: string,
  user_password: string
): Promise<Boolean> => {
  return await bcrypt.compare(password, user_password);
};

export { createHash, compareHash };

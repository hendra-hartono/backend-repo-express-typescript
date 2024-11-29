import { setSeederFactory } from "typeorm-extension";
import { User } from "../models/user";
import { Password } from "../services/password";

export const UserFactory = setSeederFactory(User, async (faker) => {
  const user = new User();
  user.name = "Seishiro Tokai"; // faker.internet.displayName();
  user.email = "seishiro.tokai@gmail.com";
  user.password = await Password.encryptPassword("qwerty123");
  user.role = "doctor";
  return user;
});

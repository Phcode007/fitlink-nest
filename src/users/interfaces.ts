import { Role } from '../common/enums/role.enum';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role?: Role;
}

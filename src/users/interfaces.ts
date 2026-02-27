import { Role } from '../common/enums/role.enum';

export interface CreateUserInput {
  email: string;
  name?: string;
  username?: string;
  cpf?: string;
  passwordHash: string;
  role?: Role;
}

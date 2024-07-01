import { IBase } from "./Base";

export interface Employee extends IBase {
  cid?: string;
  name?: string;
  dob: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  position?: string;
  startDate: string;
}

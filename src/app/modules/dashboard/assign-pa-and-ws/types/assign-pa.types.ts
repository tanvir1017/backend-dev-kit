import { I_GlobalJwtPayload } from "../../../../interface/common.interface";

export interface I_AssignPAProps {
  purchasingAgentId: string;
  orderId: string;
  remarks: string;
  user: I_GlobalJwtPayload;
}
export interface I_AssignWSProps {
  warehouseStuffId: string;
  orderId: string;
  user: I_GlobalJwtPayload;
}

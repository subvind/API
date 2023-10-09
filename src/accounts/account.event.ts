export enum ChargeType {
  ORGANIZATION = 'Organization',
  WEBMASTER = 'Webmaster',
}

export enum CRUDType {
  CREATE = 'Create',
  READ = 'Read',
  UPDATE = 'Update',
  DELETE = 'Delete',
}

export class AccountEvent {
  url: string;
  method: any;
  headers: any;
  body: any;
  crud: CRUDType;
  charge: ChargeType;
  organizationId: any;
  payload: any;
  createdAt: string;
}
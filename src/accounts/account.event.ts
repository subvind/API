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
  crud: CRUDType;
  charge: ChargeType;
  organizationId: any;
  payload: any;
}
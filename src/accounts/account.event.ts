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
  kind: string = 'accounts';
  url: string;
  method: string;
  headers: any;
  body: any;
  crud: CRUDType;
  charge: ChargeType;
  organizationId: any;
  payload: any;
  eventAt: string;
}
export type Configuration =  {
  developmentPath: string,
  testsPath: string,
};

export enum StoreMethod {
  Getters = 'getters',
  Actions = 'actions',
  State = 'state',
  Mutations = 'mutations',
}

export enum Template {
  Main,
  Dummy,
}

export type Configuration = {
  developmentPath: string;
  testsPath: string;
  testsHelpersPath: string;
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

export enum GenerateMode {
  Basic,
  WithStore,
}

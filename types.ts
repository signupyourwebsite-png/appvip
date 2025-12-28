
export interface ExtensionFile {
  path: string;
  content: string;
}

export interface ExtensionResult {
  name: string;
  description: string;
  files: ExtensionFile[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

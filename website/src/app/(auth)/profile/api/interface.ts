export interface ISpaApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}


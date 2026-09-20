export interface SuccessMessageConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  message: string;
}

export const SUCCESS_MESSAGES: SuccessMessageConfig[] = [
  {
    url: '/Invoice',
    method: 'POST',
    message: 'Your invoice has been created'
  }
];
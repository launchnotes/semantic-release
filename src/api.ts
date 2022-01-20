import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export type ApiErrors = { message: string, path: string }[];

export const callMutation = async <ResponseShape = unknown>({
  apiToken,
  query,
  variables,
  apiEndpoint,
}: {
  apiToken: string,
  query: string,
  variables: Record<string, unknown>,
  apiEndpoint: string,
}): Promise<ResponseShape> => {
  const options: AxiosRequestConfig = {
    method: 'POST',
    url: apiEndpoint,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    data: {
      query,
      variables,
    },
  };

  const response = await axios.request<{ data: ResponseShape }>(options);
  return response.data.data;
};

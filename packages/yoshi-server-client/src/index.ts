import unfetch from 'isomorphic-unfetch';
import {
  FunctionArgs,
  FunctionResult,
  UnpackPromise,
  DSL,
  RequestPayload,
} from 'yoshi-server/types';
import { createWixHeaders } from '@wix/headers';
import { joinUrls } from './utils';

type Options = {
  baseUrl?: string;
};

export interface HttpClient {
  request<Result extends FunctionResult, Args extends FunctionArgs>({
    method: { fileName, functionName },
    args,
    headers,
  }: {
    method: DSL<Result, Args>;
    args: Args;
    headers?: { [index: string]: string };
  }): Promise<UnpackPromise<Result>>;
}

// https://github.com/developit/unfetch/issues/46
const fetch = unfetch;

export default class implements HttpClient {
  private baseUrl: string;

  constructor({ baseUrl = '/' }: Options = {}) {
    this.baseUrl = baseUrl;
  }

  async request<Result extends FunctionResult, Args extends FunctionArgs>({
    method: { fileName, functionName },
    args,
    headers = {},
  }: {
    method: DSL<Result, Args>;
    args: Args;
    headers?: { [index: string]: string };
  }): Promise<UnpackPromise<Result>> {
    const url = joinUrls(this.baseUrl, '/_api_');
    const wixHeaders = createWixHeaders() as { [index: string]: string };
    const body: RequestPayload = { fileName, functionName, args };

    const res = await fetch(url, {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...wixHeaders,
        ...headers,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      if (res.headers.get('content-type')?.includes('application/json')) {
        const error = await res.json();
        if (process.env.NODE_ENV !== 'production') {
          console.error(error);
        }

        throw new Error(JSON.stringify(error));
      } else {
        const error = await res.text();
        const errorMessage = `
            Yoshi Server: the server returned a non JSON response.
            This is probable due to an error in one of the middlewares before Yoshi Server.
            ${error}
          `;
        if (process.env.NODE_ENV !== 'production') {
          console.error(error);
        }

        throw new Error(errorMessage);
      }
    }

    const result = await res.json();

    return result.payload;
  }
}

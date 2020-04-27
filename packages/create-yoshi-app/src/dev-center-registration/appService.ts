import axios from 'axios';
import { token } from './config';

axios.defaults.headers.common.Authorization = token;

const getUrl = (path: string): string => {
  return `https://www.wix.com/_api/app-service/v1/${path}`;
};

export const createApp = (name: string): Promise<{ appId: string }> => {
  return axios
    .post<{ appId: string }>(getUrl('apps'), {
      name,
    })
    .then(res => res.data);
};

export const getApps = (): Promise<Array<{ appId: string }>> => {
  return axios
    .get<{ apps: Array<{ appId: string }> }>(getUrl('apps'))
    .then(res => res.data.apps);
};

export const createComponent = ({
  name,
  appId,
  type,
}: {
  name: string;
  appId: string;
  type: string;
}): Promise<{ id: string; type: string; name: string }> => {
  return axios
    .post<{ compId: string }>(getUrl(`apps/${appId}/components`), {
      compName: name,
      compType: type,
    })
    .then(res => ({
      id: res.data.compId,
      type,
      name,
    }));
};

import React from 'react';
import ReactDOM from 'react-dom';
import HttpClient from 'yoshi-server-testing';
import { HttpProvider } from 'yoshi-server-react';
import eventually from 'wix-eventually';
import { greet } from '../../api/greeting.api';
import App from './App';

const mocks = [
  {
    request: { fn: greet, variables: ['Yaniv'] },
    result: () => ({
      greeting: 'Hello Yaniv',
    }),
  },
];

const httpClientMock = new HttpClient(mocks);

it('should pass', async () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <HttpProvider client={httpClientMock}>
      <App />
    </HttpProvider>,
    div,
  );
  return eventually(() => {
    expect(div.innerHTML).toMatch('Hello Yaniv');
  });
});

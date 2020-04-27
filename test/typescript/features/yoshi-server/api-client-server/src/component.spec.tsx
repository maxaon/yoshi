import React from 'react';
import ReactDOM from 'react-dom';
import HttpClient from 'yoshi-server-testing';
import eventually from 'wix-eventually';
import Component from './component';
import { greet } from './api/greeting.api';

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
  ReactDOM.render(<Component httpClient={httpClientMock} />, div);
  return eventually(() => {
    expect(div.innerHTML).toMatch('Hello Yaniv');
  });
});

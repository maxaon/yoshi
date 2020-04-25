import React, { FC, useEffect } from 'react';
import { notifyViewFinishedLoading } from '@wix/business-manager-api';
import { useFedops } from 'yoshi-flow-bm-runtime';
import t from '../../translations/en.json';

const Index: FC = () => {
  const fedops = useFedops();

  useEffect(() => {
    fedops.appLoaded();
    notifyViewFinishedLoading('{%projectName%}.pages.index');
  }, [fedops]);

  return (
    <div>
      <h1>{t['app.title']}</h1>
    </div>
  );
};

export default Index;

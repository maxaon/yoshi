import chalk from 'chalk';
import {
  clearConsole,
  gitInit,
  isInsideGitRepo,
  lintFix,
  npmInstall,
  gitCommit,
} from './utils';
import runDevCenterRegistrationPrompt from './dev-center-registration/runPrompt';
import runPrompt from './runPrompt';
import generateProject from './generateProject';
import TemplateModel from './TemplateModel';

export interface CreateAppOptions {
  workingDir: string;
  templateModel?: TemplateModel;
  install?: boolean;
  lint?: boolean;
  commit?: boolean;
}

export default async ({
  workingDir,
  templateModel,
  install = true,
  lint = true,
  commit = true,
}: CreateAppOptions) => {
  clearConsole();

  if (!templateModel) {
    // Use ' ' due to a technical problem in hyper when you don't see the first char after clearing the console
    console.log(
      ' ' + chalk.underline('Please answer the following questions:\n'),
    );

    // If we don't have template model injected, ask the user
    // to answer the questions and generate one for us
    templateModel = await runPrompt(workingDir);
  }

  if (templateModel.templateDefinition.name === 'flow-editor') {
    const devCenterModel = await runDevCenterRegistrationPrompt(templateModel);
    console.log(devCenterModel);
  }

  console.log(
    `\nCreating a ${chalk.cyan(
      templateModel.getTitle(),
    )} project in:\n\n${chalk.green(workingDir)}\n`,
  );

  generateProject(templateModel, workingDir);

  if (!isInsideGitRepo(workingDir)) {
    gitInit(workingDir);
  }

  if (install) {
    npmInstall(workingDir);
  }

  if (lint) {
    lintFix(workingDir);
  }

  if (commit) {
    gitCommit(workingDir);
  }

  return templateModel;
};

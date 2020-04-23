import extendedPropmts, { Answers } from './extended-prompts';
import TemplateModel from './TemplateModel';
import getQuestions from './getQuestions';

export default async (): Promise<TemplateModel> => {
  const questions = getQuestions();
  let answers: Answers<string>;

  try {
    answers = await extendedPropmts(questions);
  } catch (e) {
    console.log();
    console.log('Aborting ...');
    process.exit(0);
  }

  return new TemplateModel(answers as any);
};

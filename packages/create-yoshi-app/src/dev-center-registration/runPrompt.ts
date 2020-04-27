import LocalAppTemplateModel from '../TemplateModel';
import extendedPropmts, { Answers } from './extended-prompts';
import TemplateModel from './TemplateModel';
import getQuestions from './getQuestions';

export default async (
  localAppModel: LocalAppTemplateModel,
): Promise<TemplateModel> => {
  const questions = getQuestions();
  let answers: Answers<string>;

  try {
    answers = await extendedPropmts<{ apps?: any } & LocalAppTemplateModel>(
      questions,
      localAppModel,
    );
  } catch (e) {
    // We want to show unhanded errors
    if (e.message !== 'Aborted') {
      console.error(e);
    }
    console.log();
    console.log('Aborting ...');
    process.exit(0);
  }

  return new TemplateModel(answers as any);
};

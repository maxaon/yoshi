import prompts, { PromptObject, Answers } from 'prompts';

export interface ExtendedPromptObject<T extends string>
  extends PromptObject<T> {
  shouldTerminate?: (answers: Answers<string>) => boolean;
  before?: (answers: Answers<string>) => Promise<void> | void;
}

// Currently `prompts` package evaluates all values with function type 👿.
// So we don't want to pass extended values.
const promptifyQuestion = (
  question: ExtendedPromptObject<string>,
): PromptObject<string> => {
  const promptifiedQuestion = { ...question };
  delete promptifiedQuestion.shouldTerminate;
  delete promptifiedQuestion.before;

  return promptifiedQuestion;
};

export default async (
  questions: Array<ExtendedPromptObject<string>>,
): Promise<Answers<string>> => {
  let answers: Answers<string> = {};

  const onCancel = () => {
    throw new Error('Aborted');
  };

  for (const question of questions) {
    if (question.before) {
      await question.before(answers);
    }
    const answer = await prompts([promptifyQuestion(question)], {
      onCancel,
    });
    answers = { ...answers, ...answer };
    if (question.shouldTerminate && question.shouldTerminate(answers)) {
      break;
    }
  }

  return answers;
};

export { Answers } from 'prompts';

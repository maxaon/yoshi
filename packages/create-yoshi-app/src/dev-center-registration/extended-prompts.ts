import prompts, { PromptObject, Answers, Choice } from 'prompts';

export interface ExtendedPromptObject<T extends string>
  extends PromptObject<T> {
  // shouldTerminate?: (answers: Answers<string>) => boolean;
  before?: <C extends any>(
    answers: Answers<string>,
    context: C,
  ) => Promise<any> | any;
  after?: <C extends any>(
    answers: Answers<string>,
    context: C,
  ) => Promise<any> | any;
  next?: <C extends any>(
    answers: Answers<string>,
    context: C,
  ) => Array<ExtendedPromptObject<T>>;
  getDynamicChoices?: <C extends any>(
    answers: Answers<string>,
    context: C,
  ) => Promise<Array<Choice>>;
}

// Currently `prompts` package evaluates all values with function type 👿.
// So we don't want to pass extended values.
const promptifyQuestion = (
  question: ExtendedPromptObject<string>,
): PromptObject<string> => {
  const promptifiedQuestion = { ...question };
  // delete promptifiedQuestion.shouldTerminate;
  delete promptifiedQuestion.before;
  delete promptifiedQuestion.after;
  delete promptifiedQuestion.next;
  delete promptifiedQuestion.getDynamicChoices;

  return promptifiedQuestion;
};

async function run<T>(
  questions: Array<ExtendedPromptObject<string>>,
  context: T,
  prevAnswers: Answers<string> = {},
): Promise<Answers<string>> {
  let answers: Answers<string> = prevAnswers;

  const onCancel = () => {
    throw new Error('Aborted');
  };

  for (const question of questions) {
    if (question.before) {
      const beforeResult = await question.before<T>(answers, context);
      if (beforeResult) {
        answers = { ...answers, ...beforeResult };
      }
    }
    if (question.getDynamicChoices) {
      question.choices = await question.getDynamicChoices(answers, context);
    }
    const answer = await prompts([promptifyQuestion(question)], {
      onCancel,
    });
    answers = { ...answers, ...answer };

    if (question.after) {
      const afterResult = await question.after(answers, context);
      answers = { ...answers, ...afterResult };
    }
    if (question.next) {
      const nextAnswers = await run(
        question.next(answers, context),
        context,
        answers,
      );
      answers = { ...answers, ...nextAnswers };
    }
    // if (question.shouldTerminate && question.shouldTerminate(answers)) {
    //   break;
    // }
  }
  console.log(answers, 'answers');
  return answers;
}

export default run;

export { Answers } from 'prompts';

// Navigation param lists
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Practice: undefined;
  Exams: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  LanguageSelection: undefined;
  Permissions: undefined;
};

export type HomeStackParamList = {
  ScenarioList: undefined;
  Conversation: { scenarioId: string };
  ExamMode: undefined;
};

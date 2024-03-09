type OptionKey = "A" | "B" | "C" | "D";

export interface Option {
  key: OptionKey;
  text: string;
  image?: string;
  audio?: string;
  video?: string;
}

export interface TriviaQuestion {
  id: number;
  question: string;
  audio_question: string;
  image: string;
  options: Option[];
  answer: OptionKey;
  audio_answer?: string;
}

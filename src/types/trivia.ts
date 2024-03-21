export type OptionKey = "A" | "B" | "C" | "D";

export interface Option {
  key: OptionKey;
  text: string;
  image?: string;
  image_search_term?: string;
  audio?: string;
  video?: string;
}

export interface TriviaQuestion {
  id: number;
  question?: string;
  emoji?: string;
  audio_question: string;
  image_question?: string;
  options?: Option[];
  answer: OptionKey;
  audio_answer?: string;
  image_answer?: string;
  text_answer?: string;
}

export interface TriviaQuestion {
	id: number;
	question: string;
	audio_question: string;
	image: string;
	options: string[];
	answer: string;
	audio_answer?: string;
}

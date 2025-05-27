// interfaces.ts
export interface TestViewResponse {
    success: boolean;
    is_admin?: boolean;
    test_dict?: TestCardMeta;
    full_test_with_answers?: FullTestWithAnswers;
    error?: string;
}

export interface TestCardMeta {
    test_name: string;
    test_id: number;
    tfp_sha: string;
    test_description?: string;
    correct_percentage?: number;
    complete_trials?: number;
    default_question?: string;
    folder_id?: number;
    test_type?: string;
    is_mixed?: boolean;
    created_at?: string;
}

export interface FullTestWithAnswers {
    test: TestCardMeta;
    questions: Question[];
}

export interface Question {
    question_id: number;
    question: string;
    question_type: 'MULTIPLE_CHOICE' | 'MATCHING';
    question_data: QuestionData;
    question_order: number;
    max_points: number;
    user_answer?: UserAnswer;
    image_paths?: string[];
}

export interface QuestionData {
    options: MultipleChoiceOption[] | MatchingOption[];
    categories?: MatchingCategory[];
}

export interface MultipleChoiceOption {
    id: number;
    text: string;
    is_correct: boolean;
}

export interface MatchingOption {
    id: number;
    text: string;
    matching_category_id: number | null;
}

export interface MatchingCategory {
    id: number;
    text: string;
    display_order: number;
}

export interface UserAnswer {
    correct_percentage: number;
    response: {
        selected_options?: number[];
        matches?: MatchAnswer[];
    };
}

export interface MatchAnswer {
    option_id: number;
    matched_to_category_id: number;
}

export interface UploadedImage {
    id: string; // Unique identifier for the image
    file: File; // The actual file object
    preview: string; // Data URL for preview
    name: string; // Original filename
    size: number; // File size in bytes
}

export interface UserTestResponse {
    question_id: number;
    response: {
        selected_options?: number[];
        matches?: MatchAnswer[];
    };
}
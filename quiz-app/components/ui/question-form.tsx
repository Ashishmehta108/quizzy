"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Question } from "@/lib/types";

interface QuestionFormProps {
  questions: Question[];
  onSubmit: (answers: Record<string, number>) => void;
  isSubmitting?: boolean;
}

type updatedQuestions = {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  answer: number;
};

export function QuestionForm({
  questions,
  onSubmit,
  isSubmitting,
}: QuestionFormProps) {
  const updatedQuestions: updatedQuestions[] = questions.map((question) => ({
    ...question,
    options: JSON.parse(question.options),
  }));

  const [answers, setAnswers] = useState<Record<string, number>>({});

  const handleAnswerChange = (questionId: string, answer: number) => {
    setAnswers((prev) => {
      console.log({ ...prev, [questionId]: answer });
      return { ...prev, [questionId]: answer };
    });
    // console.log(answers);
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  // const isComplete = questions.every((q) => answers[q.id]);

  return (
    <div className="space-y-6">
      {updatedQuestions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              Question {index + 1}: {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) =>
                handleAnswerChange(question.id, Number(value))
              }
            >
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={optionIndex.toString()}
                    id={`${question.id}-${optionIndex}`}
                  />
                  <Label
                    htmlFor={`${question.id}-${optionIndex}`}
                    className="cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
          {isSubmitting ? "Submitting..." : "Submit Quiz"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import questions from "./fill-in-the-blanks.json";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AIChatSidebar from "@/components/ai-sidebar/ai-sidebar";

type QuestionType = {
    id: number;
    title: string;
    content: string;
    option: string;
};

export default function FillInTheBlanks() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [blanks, setBlanks] = useState<{ [key: string]: string | null }>({});
    const [wordBank, setWordBank] = useState<string[]>([]);
    const [answerOrder, setAnswerOrder] = useState<string[]>([]);
    const [paragraphParts, setParagraphParts] = useState<string[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

    const currentQuestion: QuestionType = questions[currentIndex];

    useEffect(() => {
        const matches = [...currentQuestion.content.matchAll(/【(.*?)】/g)];
        const correctWords = matches.map(m => m[1]);
        const parts = currentQuestion.content.split(/【.*?】/g);

        const initialBlanks = Object.fromEntries(
            correctWords.map((_, i) => [`blank-${i}`, null])
        );

        setParagraphParts(parts);
        setAnswerOrder(correctWords);
        setBlanks(initialBlanks);

        const options = currentQuestion.option.split("\n").sort(() => Math.random() - 0.5);
        setWordBank(options);
        setSubmitted(false);
    }, [currentIndex]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id.toString());
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        const sourceId = active.id.toString();
        const targetId = over.id.toString();

        const isFromBank = wordBank.includes(sourceId);
        const isBlankTarget = targetId.startsWith("blank");

        // From bank to blank
        if (isFromBank && isBlankTarget) {
            const replaced = blanks[targetId]; // current word in the blank
            setWordBank(prev => {
                const filtered = prev.filter(w => w !== sourceId);
                return replaced ? [...filtered, replaced] : filtered;
            });
            setBlanks(prev => ({ ...prev, [targetId]: sourceId }));
            return;
        }

        // Swap blanks
        else if (targetId.startsWith("blank") && sourceId.startsWith("blank")) {
            const temp = blanks[sourceId];
            setBlanks(prev => ({
                ...prev,
                [sourceId]: prev[targetId],
                [targetId]: temp,
            }));
        }

        // From blank back to bank
        else if (targetId === "bank" && sourceId.startsWith("blank")) {
            const word = blanks[sourceId];
            if (!word) return;
            setBlanks(prev => ({ ...prev, [sourceId]: null }));
            setWordBank([...wordBank, word]);
        }
    };

    const isComplete = Object.values(blanks).every(Boolean);
    const userAnswers = Object.keys(blanks).map(k => blanks[k]);
    const isCorrect = userAnswers.join() === answerOrder.join();

    return (
        <div>
            <AIChatSidebar
                section="Reading"
                questionType="Fill in the blanks"
                instruction="Drag words from the word bank into the correct blanks."
                passage={currentQuestion.content}
                userResponse={Object.values(blanks).filter(Boolean).join(" ")}
            />
            <div className="min-h-screen p-6 bg-slate-50  dark:bg-black/80 text-gray-800 dark:text-gray-100">
                <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">{currentQuestion.title}</h2>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                        Drag words from the box below to the appropriate place in the text.
                    </p>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <p className="mb-4 leading-relaxed">
                            {paragraphParts.map((part, i) => (
                                <span key={i}>
                                    {part}
                                    {i < answerOrder.length && (
                                        <Droppable id={`blank-${i}`} content={blanks[`blank-${i}`]} />
                                    )}
                                </span>
                            ))}
                        </p>

                        <SortableContext items={wordBank} strategy={verticalListSortingStrategy}>
                            <div id="bank" className="flex flex-wrap gap-2 p-3 border rounded bg-slate-100 dark:bg-slate-800 min-h-[60px] mt-6">
                                {wordBank.map(word => (
                                    <DraggableWord key={word} id={word} word={word} />
                                ))}
                            </div>
                        </SortableContext>

                        <DragOverlay>
                            {activeId ? <DraggableWord id={activeId} word={activeId} /> : null}
                        </DragOverlay>
                    </DndContext>

                    <div className="flex justify-between items-center mt-8">
                        <button
                            onClick={() => {
                                const resetBlanks = Object.fromEntries(Object.keys(blanks).map(key => [key, null]));
                                setBlanks(resetBlanks);
                                setWordBank([...wordBank, ...Object.values(blanks).filter(Boolean) as string[]]);
                                setSubmitted(false);
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                        >
                            Reset
                        </button>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSubmitted(true)}
                                disabled={!isComplete}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                Submit
                            </button>
                            {/* {submitted && currentIndex < questions.length - 1 && ( */}
                            {currentIndex < questions.length - 1 && (
                                <button
                                    onClick={() => setCurrentIndex(currentIndex + 1)}
                                    className="px-4 py-2 bg-black dark:bg-slate-800 text-white rounded hover:bg-gray-800 dark:hover:bg-slate-700"
                                >
                                    Next →
                                </button>
                            )}
                        </div>
                    </div>

                    {submitted && (
                        <div className="mt-4">
                            <p className={`font-semibold ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                {isCorrect ? "✅ Correct!" : "❌ Incorrect. Try again or check the correct answer."}
                            </p>

                            {!isCorrect && (
                                <div className="mt-3">
                                    <h4 className="text-gray-700 dark:text-gray-200 font-semibold mb-1">Correct Answers:</h4>
                                    <ul className="list-decimal ml-6 text-sm text-gray-800 dark:text-gray-300 space-y-1">
                                        {answerOrder.map((ans, index) => (
                                            <li key={index}>{ans}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
}

function Droppable({ id, content }: { id: string; content: string | null }) {
    const { setNodeRef } = useSortable({ id });
    return (
        <span
            ref={setNodeRef}
            className="inline-block min-w-[80px] px-2 py-1 border-b border-dashed border-gray-400 mx-1 text-blue-700 bg-blue-50 rounded"
        >
            {content ?? "__________"}
        </span>
    );
}

function DraggableWord({ id, word }: { id: string; word: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={style}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded cursor-move border border-blue-300"
        >
            {word}
        </div>
    );
}
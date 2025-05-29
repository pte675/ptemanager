"use client";

import { useState, useEffect } from "react";
import data from "./re-order.json"; // ✅ Your JSON file here
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    arrayMove,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AIChatSidebar from "@/components/ai-sidebar/ai-sidebar";

type Question = {
    id: number;
    title: string;
    instruction: string;
    content: string;
    answer: string;
};

function SortableItem({ id, text }: { id: string; text: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="p-4 mb-2 rounded bg-gray-100 border cursor-move"
        >
            {text}
        </div>
    );
}

export default function ReorderParaDndKit() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledItems, setShuffledItems] = useState<{ id: string; text: string }[]>([]);
    const [correctOrder, setCorrectOrder] = useState<string[]>([]);
    const [showAnswer, setShowAnswer] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));
    const currentQuestion: Question = data[currentIndex];

    useEffect(() => {
        const lines = currentQuestion.content.split("\n").filter(Boolean);
        const items = lines.map(line => ({ id: line.slice(0, 1), text: line }));
        setShuffledItems(shuffleArray(items));
        setCorrectOrder(currentQuestion.answer.split("\n").map(line => line.slice(0, 1)));
        setSubmitted(false);
        setShowAnswer(false);
    }, [currentIndex]);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = shuffledItems.findIndex(i => i.id === active.id);
        const newIndex = shuffledItems.findIndex(i => i.id === over.id);
        setShuffledItems(arrayMove(shuffledItems, oldIndex, newIndex));
    };

    const isCorrect = shuffledItems.map(i => i.id).join() === correctOrder.join();

    return (
        <div>
            <AIChatSidebar
                section="PTE Reading"
                questionType="Reorder Paragraph"
                instruction={`Reorder the following lines to form a coherent paragraph.\n\nCorrect Order: ${currentQuestion.answer
                    .split("\n")
                    .map(line => line[0])
                    .join(" ")}`}
                passage={currentQuestion.content}
                userResponse={shuffledItems.map(i => i.text[0]).join(" ")}
            />
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-emerald-600">{currentQuestion.title}</h1>
                        <p className="text-slate-600 mt-2 max-w-2xl mx-auto">{currentQuestion.instruction}</p>
                    </header>

                    <div className="flex justify-center px-4">
                        <div className="bg-white p-6 rounded shadow w-full max-w-2xl">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={shuffledItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    {shuffledItems.map((item) => (
                                        <SortableItem key={item.id} id={item.id} text={item.text} />
                                    ))}
                                </SortableContext>
                            </DndContext>

                            <div className="flex justify-between mt-6">
                                <button
                                    onClick={() =>
                                        setShuffledItems(shuffleArray(shuffledItems))
                                    }
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                >
                                    Restart
                                </button>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={showAnswer} onChange={() => setShowAnswer(!showAnswer)} />
                                        Answer
                                    </label>
                                    {!submitted ? (
                                        <button
                                            onClick={() => setSubmitted(true)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Submit
                                        </button>
                                    ) : (
                                        currentIndex < data.length - 1 && (
                                            <button
                                                onClick={() => setCurrentIndex(currentIndex + 1)}
                                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                            >
                                                Next
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {submitted && (
                                <div className="mt-4 text-sm">
                                    <p className={isCorrect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                        {isCorrect ? "✅ Correct!" : "❌ Incorrect Order"}
                                    </p>
                                </div>
                            )}

                            {showAnswer && (
                                <div className="mt-4">
                                    <h3 className="text-green-600 font-semibold">Correct Order:</h3>
                                    <ol className="list-decimal ml-6 mt-2 text-gray-800 space-y-1">
                                        {currentQuestion.answer.split("\n").map((line, i) => (
                                            <li key={i}>{line}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

function shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
}
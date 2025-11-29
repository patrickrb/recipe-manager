'use client';

import { Icons } from '@/components/Icons';
import { useState } from 'react';

interface DynamicListProps {
    items: string[];
    onAdd: (item: string) => void;
    onRemove: (index: number) => void;
    placeholder?: string;
    label: string;
    type?: 'input' | 'textarea';
}

export function DynamicList({
    items,
    onAdd,
    onRemove,
    placeholder = 'Add item...',
    label,
    type = 'input',
}: DynamicListProps) {
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
        if (newItem.trim()) {
            onAdd(newItem.trim());
            setNewItem('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start group">
                        <div className="flex-1 p-2 bg-gray-50 rounded-md text-sm text-gray-700 break-words">
                            {item}
                        </div>
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Icons.X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <div className="flex gap-2">
                    {type === 'textarea' ? (
                        <textarea
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="flex-1 min-h-[80px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    ) : (
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    )}
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!newItem.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Icons.Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useRef } from 'react';
import { Icons } from '@/components/Icons';
import Image from 'next/image';

interface ImageUploadProps {
    image: string | null | undefined;
    onImageChange: (file: File) => Promise<void>;
    onRemoveImage: () => void;
}

export function ImageUpload({ image, onImageChange, onRemoveImage }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const processFile = async (file: File) => {
        setIsLoading(true);
        try {
            await onImageChange(file);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            await processFile(file);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Recipe Image</label>
            <div
                className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                {isLoading ? (
                    <div className="h-48 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : image ? (
                    <div className="relative h-48 w-full">
                        <Image
                            src={image}
                            alt="Recipe preview"
                            fill
                            className="object-cover rounded-md"
                        />
                        <button
                            type="button"
                            onClick={onRemoveImage}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 text-red-500"
                        >
                            <Icons.X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div
                        className="h-48 flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Icons.Placeholder className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                )}
            </div>
        </div>
    );
}

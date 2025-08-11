// src/components/QuotationBuilder.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Trash2, PlusCircle } from 'lucide-react';

export type LineItem = {
    id: number;
    description: string;
    price: number;
};

interface QuotationBuilderProps {
    onSubmit: (lineItems: LineItem[], total: number) => void;
    isLoading: boolean;
    submitButtonText?: string;
}

const QuotationBuilder = ({ onSubmit, isLoading, submitButtonText = "Submit Quote" }: QuotationBuilderProps) => {
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: 1, description: '', price: 0 }
    ]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const newTotal = lineItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
        setTotal(newTotal);
    }, [lineItems]);

    const handleAddItem = () => {
        setLineItems([...lineItems, { id: Date.now(), description: '', price: 0 }]);
    };

    const handleRemoveItem = (id: number) => {
        setLineItems(lineItems.filter(item => item.id !== id));
    };

    const handleItemChange = (id: number, field: 'description' | 'price', value: string) => {
        setLineItems(lineItems.map(item =>
            item.id === id
                ? { ...item, [field]: field === 'price' ? parseFloat(value) || 0 : value }
                : item
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(lineItems, total);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left font-semibold text-gray-600 w-12">#</th>
                            <th className="p-2 text-left font-semibold text-gray-600">Item Description</th>
                            <th className="p-2 text-left font-semibold text-gray-600 w-40">Price (R)</th>
                            <th className="p-2 w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {lineItems.map((item, index) => (
                            <tr key={item.id} className="border-t">
                                <td className="p-2 text-gray-500">{index + 1}</td>
                                <td className="p-2">
                                    <Input
                                        type="text"
                                        placeholder="e.g., Supply and install tap"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                        required
                                        className="h-9"
                                    />
                                </td>
                                <td className="p-2">
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={item.price || ''}
                                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                        required
                                        step="0.01"
                                        className="h-9"
                                    />
                                </td>
                                <td className="p-2 text-center">
                                    {lineItems.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-2 border-t">
                    <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="flex items-center gap-2">
                        <PlusCircle size={16} /> Add Item
                    </Button>
                </div>
                <div className="flex justify-end p-4 bg-gray-50 rounded-b-lg">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-brand-teal">R{total.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full mt-4" size="lg">
                {isLoading ? 'Submitting...' : submitButtonText}
            </Button>
        </form>
    );
};

export default QuotationBuilder;
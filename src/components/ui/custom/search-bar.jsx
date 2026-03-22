'use client';

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link';

import { Input } from '@/components/ui/input'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'

export function SearchBar({
    options,
    placeholder = 'Type to search...',
    className,
}) {
    const [inputValue, setInputValue] = useState('')
    const [open, setOpen] = useState(false)
    const [filteredOptions, setFilteredOptions] = useState([])

    const inputRef = useRef(null)

    useEffect(() => {
        if (inputValue.trim() === '') {
            setFilteredOptions([])
            setOpen(false)
        } else {
            let q = inputValue.toLowerCase();

            const scored = options.map(item => {
                let score = 0;

                item.keywords.forEach(k => {
                    if (k.toLowerCase() === q) score += 40;
                    else if (k.toLowerCase().startsWith(q)) score += 20;
                    else if (k.toLowerCase().includes(q)) score += 5;
                });

                return { ...item, score };
            }).filter(i => i.score > 0);

            scored.sort((a, b) => b.score - a.score);

            setFilteredOptions(scored.slice(0, 10))
            setOpen(scored.length > 0)
        }
    }, [inputValue, options])

    const handleClick = () => {
        setInputValue('');
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverAnchor asChild>
                <Input
                    type='text'
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={placeholder}
                    onFocus={() => {
                        if (filteredOptions.length > 0) {
                            setOpen(true)
                        }
                    }}
                    className={className}
                />
            </PopoverAnchor>
            <PopoverContent className="!h-56 sm:max-h-60 !overflow-y-auto w-76 sm:w-96 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                <ul className="text-sm">
                    {filteredOptions.map((option) => (
                        <li
                            key={option.label}
                            className='cursor-pointer hover:bg-muted'
                        >
                            <Link className='block px-4 py-2 w-full' href={option.link} onClick={handleClick}>{option.label}</Link>
                        </li>
                    ))}
                </ul>
            </PopoverContent>
        </Popover>
    )
}
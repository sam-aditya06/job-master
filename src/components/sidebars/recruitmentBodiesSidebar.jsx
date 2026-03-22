'use client';

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RecruitmentBodiesSidebar() {
    const pathName = usePathname();
    const sp = useSearchParams();
    const router = useRouter();

    const sector = sp.get('sector');
    const search = sp.get('search');

    const [inputValue, setInputValue] = useState(search || '');

    useEffect(() => {
        !search ? setInputValue('') : setInputValue(search);
    }, [search])

    useEffect(() => {
        if (!inputValue) {
            if (search) {
                const sParams = new URLSearchParams(sp);
                sParams.delete('search');
                router.replace(`${pathName}?${sParams.toString()}`);
            }
            return;
        }
        const timoutId = setTimeout(() => {
            const sParams = new URLSearchParams(sp);
            sParams.set('search', inputValue);
            router.replace(`${pathName}?${sParams.toString()}`);
        }, 500);
        return () => {
            clearTimeout(timoutId);
        }
    }, [inputValue]);

    const handleFilterSelect = (key, value) => {
        const sParams = new URLSearchParams(sp);
        sParams.set(key, value);
        router.replace(`${pathName}?${sParams.toString()}`);
    }


    return (
        <div className="flex flex-col gap-5 mt-12 lg:mt-5 p-2">
            <div className="flex flex-col gap-2">
                <p className='font-bold text-sm'>Search</p>
                <Input className='h-8 text-sm' placeholder='Search recruitment body' value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            </div>
            <Accordion type='single' defaultValue='sector'>
                <AccordionItem value='sector'>
                    <AccordionTrigger className='border-b rounded-none px-1 !py-2 font-bold cursor-pointer hover:no-underline'>Sector</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-3" value={sector} onValueChange={(value) => handleFilterSelect('sector', value)}>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='govt'>Govt</Label>
                                <RadioGroupItem id='govt' value='govt' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='psu'>PSU</Label>
                                <RadioGroupItem id='psu' value='psu' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='banking'>Banking</Label>
                                <RadioGroupItem id='banking' value='banking' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='defence'>Defence</Label>
                                <RadioGroupItem id='defence' value='defence' />
                            </div>
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div></div>
        </div>
    )
}

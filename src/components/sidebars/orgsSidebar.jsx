'use client';

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useFilter } from "@/lib/context/filterContext";

export default function OrgsSidebar() {
    const { optimisticParams, applyFilter } = useFilter();

    const sector = optimisticParams.sector;

    const handleFilterSelect = (key, value) => {
        applyFilter({ [key]: value });
    }


    return (
        <div className="flex flex-col gap-5 mt-12 lg:mt-2 p-2">
            <Accordion type='single' collapsible defaultValue='sector'>
                <AccordionItem value='sector'>
                    <AccordionTrigger className='border-b rounded-none px-1 !py-2 font-bold cursor-pointer hover:no-underline'>Sector</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-3" value={sector ?? ""} onValueChange={(value) => handleFilterSelect('sector', value)}>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='central-govt'>Central Govt</Label>
                                <RadioGroupItem id='central-govt' value='central-govt' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='state-govt'>State Govt</Label>
                                <RadioGroupItem id='state-govt' value='state-govt' />
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
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='railways'>Railways</Label>
                                <RadioGroupItem id='railways' value='railways' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='judiciary'>Judiciary</Label>
                                <RadioGroupItem id='judiciary' value='judiciary' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='police'>Police</Label>
                                <RadioGroupItem id='police' value='police' />
                            </div>
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div></div>
        </div>
    )
}

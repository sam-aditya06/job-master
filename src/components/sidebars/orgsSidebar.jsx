'use client';

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useFilter } from "@/lib/context/filterContext";
import { slugify } from "@/lib/utils";

export default function OrgsSidebar({ sectors }) {
    const { optimisticParams, applyFilter } = useFilter();

    const sector = optimisticParams.sector;
    const type = optimisticParams.type;

    const handleFilterSelect = (key, value) => {
        applyFilter({ [key]: value });
    }


    return (
        <div className="flex flex-col gap-5 mt-12 lg:mt-2 p-2">
            <Accordion type='multiple' collapsible defaultValue={['sector', 'type']}>
                <AccordionItem value='sector'>
                    <AccordionTrigger className='border-b rounded-none px-1 !py-2 text-brand font-bold cursor-pointer hover:no-underline'>Sector</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-3" value={sector ?? ""} onValueChange={(value) => handleFilterSelect('sector', value)}>
                            {
                                sectors.map(sector => (
                                    <div className="flex justify-between items-center">
                                        <Label className="text-sm" htmlFor={slugify(sector)}>{sector}</Label>
                                        <RadioGroupItem id={slugify(sector)} value={slugify(sector)} />
                                    </div>
                                ))
                            }
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='type'>
                    <AccordionTrigger className='border-b rounded-none px-1 !py-2 text-brand font-bold cursor-pointer hover:no-underline'>Type</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-3" value={type ?? ""} onValueChange={(value) => handleFilterSelect('type', value)}>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='org'>Organisation</Label>
                                <RadioGroupItem id='org' value='org' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor="rBody">Recruitment Body</Label>
                                <RadioGroupItem id="rBody" value="rBody" />
                            </div>
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div></div>
        </div>
    )
}

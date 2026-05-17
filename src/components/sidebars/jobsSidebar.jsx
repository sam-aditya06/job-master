'use client';

import { useEffect, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useFilter } from "@/lib/context/filterContext";
import { deslugify, slugify } from "@/lib/utils";

export default function JobsSidebar({ jobsFilters }) {

    const { optimisticParams, applyFilter, removeFilter } = useFilter();

    const { orgs, states, categories, sectors, rStatuses, qualifications } = jobsFilters;

    const cat = optimisticParams.cat;
    const sector = optimisticParams.sector;
    const paramsOrg = optimisticParams.org;
    const paramsLocation = optimisticParams.location;
    const qualification = optimisticParams.qualification;
    const expLvl = optimisticParams.expLvl;
    const recruitmentStatus = optimisticParams.rStatus;

    const [forOrg, setForOrg] = useState(null);
    const [location, setLocation] = useState(null);

    useEffect(() => {
        if (!paramsLocation)
            setLocation(null);
        else if (paramsLocation === 'all-india' || paramsLocation === 'worldwide')
            setLocation(paramsLocation);
        else {
            const stateObj = states.find(state => state.slug === paramsLocation);
            setLocation(stateObj);
        }

    }, [paramsLocation]);

    useEffect(() => {
        if (!paramsOrg)
            setForOrg(null);
        else {
            const orgObj = orgs.find(org => org.slug === paramsOrg);
            setForOrg(orgObj);
        }

    }, [paramsOrg]);

    return (
        <div className="flex flex-col gap-5 mt-12 xl:mt-0 h-full p-2 overflow-y-auto">
            <div className="flex flex-col gap-2">
                <p className='text-brand font-bold text-sm'>Hiring Organisation</p>
                <Combobox items={orgs} itemToStringLabel={(org) => org.name} value={forOrg ?? ""} onValueChange={(value) => value ? applyFilter({ org: value.slug }) : removeFilter('org')} >
                    <ComboboxInput className='hover:border-ring hover:ring-[3px] hover:ring-ring/50' placeholder='Employer (e.g., PNB)' showClear={forOrg} />
                    <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {
                                (org) => (
                                    <ComboboxItem key={org.slug} value={org}>{org.name}</ComboboxItem>
                                )
                            }
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </div>
            <Accordion type='multiple' defaultValue='recruitmentStatus'>
                <AccordionItem value='recruitmentStatus'>
                    <AccordionTrigger className='rounded-none px-1 !py-2 text-brand font-bold cursor-pointer hover:no-underline'>Recruitment Status</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-2" value={recruitmentStatus ?? ""} onValueChange={(value) => applyFilter({ rStatus: value })}>
                            {
                                rStatuses.includes('ongoing') &&
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-green-700 translate-y-[1.5px]"></div>
                                        <Label className="text-sm" htmlFor='govt'>Ongoing</Label>
                                    </div>
                                    <RadioGroupItem id='ongoing' value='ongoing' />
                                </div>
                            }
                            {
                                rStatuses.includes('pending') &&
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-yellow-600 translate-y-[1.5px]"></div>
                                        <Label className="text-sm" htmlFor='psu'>Pending</Label>
                                    </div>
                                    <RadioGroupItem id='pending' value='pending' />
                                </div>
                            }
                            {
                                rStatuses.includes('completed') &&
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-gray-400 translate-y-[1.5px]"></div>
                                        <Label className="text-sm" htmlFor='bank'>Completed</Label>
                                    </div>
                                    <RadioGroupItem id='completed' value='completed' />
                                </div>
                            }
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='orgSector'>
                    <AccordionTrigger className='rounded-none px-1 !py-2 text-brand font-bold cursor-pointer hover:no-underline'>Organisation Sector</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-3" value={sector ?? ""} onValueChange={(value) => applyFilter({ sector: value })}>
                            {
                                sectors.map(sector => (
                                    <div key={sector} className="flex justify-between items-center">
                                        <Label className="text-sm" htmlFor={slugify(sector)}>{sector}</Label>
                                        <RadioGroupItem id={slugify(sector)} value={slugify(sector)} />
                                    </div>
                                ))
                            }
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='jobCategories'>
                    <AccordionTrigger className='rounded-none px-1 !py-2 text-brand font-bold cursor-pointer hover:no-underline'>Job Categories</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-3" value={cat ?? ""} onValueChange={(value) => applyFilter({ cat: value })}>
                            {
                                categories.map(cat => (
                                    <div key={cat} className="flex justify-between items-center">
                                        <Label className="text-sm" htmlFor={slugify(cat)}>{cat}</Label>
                                        <RadioGroupItem id={slugify(cat)} value={slugify(cat)} />
                                    </div>
                                ))
                            }
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='location'>
                    <AccordionTrigger className='rounded-none px-1 !py-2 text-brand font-bold cursor-pointer hover:no-underline'>Location</AccordionTrigger>
                    <AccordionContent className='flex flex-col gap-3 mt-2 px-2'>
                        <Combobox
                            items={['all-india', 'worldwide', ...states]}
                            value={location}
                            itemToStringLabel={location => deslugify(location)}
                            onValueChange={(value) => value ? applyFilter({ location: value }) : removeFilter('location')}
                        >
                            <ComboboxInput className='hover:border-ring hover:ring-[3px] hover:ring-ring/50' placeholder='Select a location' showClear />
                            <ComboboxContent>
                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                <ComboboxList>
                                    {
                                        (location) => (
                                            <ComboboxItem key={location} value={location}>{deslugify(location)}</ComboboxItem>
                                        )
                                    }
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='qualification'>
                    <AccordionTrigger className='rounded-none px-1 !py-2 text-brand font-bold cursor-pointer hover:no-underline'>Qualification</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-3" value={qualification ?? ""} onValueChange={(value) => applyFilter({ qualification: value })}>
                            {
                                qualifications.map(q => (
                                    <div key={q} className="flex justify-between items-center">
                                        <Label className="text-sm" htmlFor={slugify(q)}>{q}</Label>
                                        <RadioGroupItem id={slugify(q)} value={slugify(q)} />
                                    </div>

                                ))
                            }
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='expLvl'>
                    <AccordionTrigger className='border-b rounded-none px-1 !py-2 text-brand font-bold cursor-pointer hover:no-underline'>Experience</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-3" value={expLvl ?? ""} onValueChange={(value) => applyFilter({ expLvl: value })}>
                            <div className="flex justify-between items-center">
                                <Label htmlFor='fresher' className="text-sm">Fresher</Label>
                                <RadioGroupItem id='fresher' value='fresher' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label htmlFor='experienced' className="text-sm">Experienced</Label>
                                <RadioGroupItem id='experienced' value='experienced' />
                            </div>
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div></div>
        </div >
    )
}

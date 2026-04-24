'use client';

import { useEffect, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useFilter } from "@/lib/context/filterContext";

export default function RecruitmentsSidebar({ orgs = [], states = [], recruiters = [] }) {

    const { optimisticParams, applyFilter, removeFilter } = useFilter();

    const sector = optimisticParams.sector;
    const paramsFor = optimisticParams.for;
    const paramsBy = optimisticParams.by;
    const paramsLocation = optimisticParams.location;
    const qualification = optimisticParams.qualification;
    const expLvl = optimisticParams.expLvl;
    const status = optimisticParams.status;

    const [forOrg, setForOrg] = useState(null);
    const [byOrg, setByOrg] = useState(null);
    const [location, setLocation] = useState(null);

    useEffect(() => {
        if (!paramsLocation)
            setLocation(null);
        else if (paramsLocation === 'all-india')
            setLocation({ name: "All India", slug: "all-india" });
        else {
            const stateObj = states.find(state => state.slug === paramsLocation);
            setLocation(stateObj);
        }

    }, [paramsLocation]);

    useEffect(() => {
        if (!paramsFor)
            setForOrg(null);
        else {
            const forOrgObj = orgs.find(org => org.slug === paramsFor);
            setForOrg(forOrgObj);
        }

    }, [paramsFor]);

    useEffect(() => {
        if (!paramsBy)
            setByOrg(null);
        else {
            const byOrgObj = recruiters.find(recruiter => recruiter.slug === paramsBy);
            setByOrg(byOrgObj);
        }

    }, [paramsBy]);


    return (
        <div className="grow flex flex-col gap-5 mt-12 xl:mt-0 h-full p-2 overflow-y-auto">
            <div className="flex flex-col gap-2">
                <p className='font-bold text-sm'>Hiring Organisation</p>
                <Combobox items={orgs} itemToStringLabel={(org) => org.name} value={forOrg ?? ""} onValueChange={(value) => value ? applyFilter({ for: value.slug }) : removeFilter('for')} >
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
            <div className="flex flex-col gap-2">
                <p className='font-bold text-sm'>Recruiter</p>
                <Combobox items={recruiters} itemToStringLabel={(recruiter) => recruiter.name} value={byOrg ?? ""} onValueChange={(value) => value ? applyFilter({ by: value.slug }) : removeFilter('by')} >
                    <ComboboxInput className='hover:border-ring hover:ring-[3px] hover:ring-ring/50' placeholder='e.g., IBPS, RRB, UPSC' showClear={byOrg} />
                    <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {
                                (recruiter) => (
                                    <ComboboxItem key={recruiter.slug} value={recruiter}>{recruiter.name}</ComboboxItem>
                                )
                            }
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </div>
            <Accordion className='mt-4' type='multiple' defaultValue={['status']}>
                <AccordionItem value='status'>
                    <AccordionTrigger className='rounded-none px-1 !py-2 font-bold cursor-pointer hover:no-underline'>Status</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-2" value={status ?? ""} onValueChange={(value) => applyFilter({status: value})}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-700 translate-y-[1.5px]"></div>
                                    <Label className="text-sm" htmlFor='ongoing'>Ongoing</Label>
                                </div>
                                <RadioGroupItem id='ongoing' value='ongoing' />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-yellow-500 translate-y-[1.5px]"></div>
                                    <Label className="text-sm" htmlFor='pending'>Pending</Label>
                                </div>
                                <RadioGroupItem id='pending' value='pending' />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-gray-400 translate-y-[1.5px]"></div>
                                    <Label className="text-sm" htmlFor='completed'>Completed</Label>
                                </div>
                                <RadioGroupItem id='completed' value='completed' />
                            </div>
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='jobSector'>
                    <AccordionTrigger className='rounded-none px-1 !py-2 font-bold cursor-pointer hover:no-underline'>Job Sector</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-3" value={sector ?? ""} onValueChange={(value) => applyFilter({sector: value})}>
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
                <AccordionItem value='location'>
                    <AccordionTrigger className='rounded-none px-1 !py-2 font-bold cursor-pointer hover:no-underline'>Location</AccordionTrigger>
                    <AccordionContent className='flex flex-col gap-3 mt-2 px-2'>
                        <Combobox items={[{ name: 'All India', slug: 'all-india' }, ...states]} value={location} itemToStringLabel={(location) => location.name} onValueChange={(value) => value ? applyFilter({ location: value.slug }) : removeFilter('location')} >
                            <ComboboxInput className='hover:border-ring hover:ring-[3px] hover:ring-ring/50' placeholder='Select a location' showClear />
                            <ComboboxContent>
                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                <ComboboxList>
                                    {
                                        (location) => (
                                            <ComboboxItem key={location.slug} value={location}>{location.name}</ComboboxItem>
                                        )
                                    }
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                        {/* <RadioGroup className="flex flex-col gap-3" value={paramsLocation ?? ""} onValueChange={(value) => applyFilter({ location: value })}>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='all-india'>All India</Label>
                                <RadioGroupItem id='all-india' value='all-india' />
                            </div>
                            {
                                states.map(state => (
                                    <div key={state.name} className="flex justify-between items-center">
                                        <Label className="text-sm" htmlFor='state'>{state.name}</Label>
                                        <RadioGroupItem id='state' value={state.slug} />
                                    </div>
                                ))
                            }
                        </RadioGroup> */}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='qualification'>
                    <AccordionTrigger className='rounded-none px-1 !py-2 font-bold cursor-pointer hover:no-underline'>Qualification</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-3" value={qualification ?? ""} onValueChange={(value) => applyFilter({qualification: value})}>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='10th'>10th</Label>
                                <RadioGroupItem id='10th' value='10th' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='12th'>12th</Label>
                                <RadioGroupItem id='12th' value='12th' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='ITI'>ITI</Label>
                                <RadioGroupItem id='ITI' value='ITI' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='Diploma'>Diploma</Label>
                                <RadioGroupItem id='Diploma' value='Diploma' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='graduation'>Graduation</Label>
                                <RadioGroupItem id='graduation' value='graduation' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='PG'>PG</Label>
                                <RadioGroupItem id='PG' value='PG' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='PhD'>PhD</Label>
                                <RadioGroupItem id='PhD' value='PhD' />
                            </div>
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='expLvl'>
                    <AccordionTrigger className='border-b rounded-none px-1 !py-2 font-bold cursor-pointer hover:no-underline'>Experience</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-3" value={expLvl ?? ""} onValueChange={(value) => applyFilter({expLvl: value})}>
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
        </div>
    )
}

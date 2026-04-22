'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

import { useFilter } from "@/lib/context/filterContext";

export default function RecruitmentsSidebar({ orgs = [], states = [], recruiters = [] }) {

    const { optimisticParams, applyFilter, removeFilter } = useFilter();

    const sector = optimisticParams.sector;
    const paramsLocation = optimisticParams.location;
    const qualification = optimisticParams.qualification;
    const expLvl = optimisticParams.expLvl;
    const status = optimisticParams.status;

    const [forInputValue, setForInputValue] = useState('');
    const [byInputValue, setByInputValue] = useState('');
    const [stateInputValue, setStateInputValue] = useState('');
    const [displayedOrgs, setDisplayedOrgs] = useState([]);
    const [displayedRecruiters, setDisplayedRecruiters] = useState([]);
    const [displayedStates, setDisplayedStates] = useState(states);
    const [forOpen, setForOpen] = useState(false);
    const [byOpen, setByOpen] = useState(false);
    const [enableStateSelection, setEnableStateSelection] = useState(false);
    const [stateListOpen, setStateListOpen] = useState(false);
    const [location, setLocation] = useState(() => (paramsLocation === undefined || paramsLocation === 'all-india') ? paramsLocation : 'state');


    useEffect(() => {
        if (!forOpen)
            forInputValue && setForInputValue('');
        if (!byOpen)
            byInputValue && setByInputValue('');
        if (!stateListOpen)
            stateInputValue && setStateInputValue('');
    }, [forOpen, byOpen, stateListOpen]);

    useEffect(() => {
        if (!forInputValue)
            return;

        const timoutId = setTimeout(() => {
            const newDisplayedOrgsList = orgs.filter(org => org.name.toLowerCase().includes(forInputValue) || org.slug.toLowerCase().includes(forInputValue));
            console.log(newDisplayedOrgsList.length);
            if (newDisplayedOrgsList.length > 0) {
                setDisplayedOrgs(newDisplayedOrgsList);
                setForOpen(true);
            }
        }, 500);
        return () => {
            clearTimeout(timoutId);
        }
    }, [forInputValue]);

    useEffect(() => {
        if (!byInputValue)
            return;

        const timoutId = setTimeout(() => {
            const newDisplayedRecruitersList = recruiters.filter(recruiter => recruiter.name.toLowerCase().includes(byInputValue) || recruiter.slug.toLowerCase().includes(byInputValue));
            if (newDisplayedRecruitersList.length > 0) {
                setDisplayedRecruiters(newDisplayedRecruitersList);
                setByOpen(true);
            }
        }, 500);
        return () => {
            clearTimeout(timoutId);
        }
    }, [byInputValue]);

    useEffect(() => {
        if (!stateInputValue)
            return;

        const newDisplayedRegionsList = states.filter(state => state.name.toLowerCase().includes(stateInputValue) || state.slug.toLowerCase().includes(stateInputValue));
        setDisplayedStates(newDisplayedRegionsList);

    }, [stateInputValue]);

    const handleFilterSelect = (key, value) => {
        applyFilter({ [key]: value });
        key === 'for' && setForOpen(false);
        key === 'by' && setByOpen(false);
        key === 'location' && setStateListOpen(false);
    }

    const handleLocationSelect = (value) => {
        setLocation(value);
        if (value === 'all-india')
            applyFilter({ location: value })
        else {
            if (location === 'all-india')
                removeFilter('location');

            setEnableStateSelection(true);
        }
    }


    return (
        <div className="grow flex flex-col gap-5 mt-12 xl:mt-0 h-full p-2 overflow-y-auto">
            <div className="flex flex-col gap-2">
                <p className='font-bold text-sm'>Recruitment for</p>
                <Popover open={forOpen} onOpenChange={setForOpen}>
                    <PopoverAnchor asChild>
                        <Input className='h-8 text-sm' placeholder='Search organisation' value={forInputValue} onChange={(e) => setForInputValue(e.target.value)} onBlur={() => !forOpen && setForInputValue('')} />
                    </PopoverAnchor>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 h-fit max-h-36 overflow-y-auto">
                        {
                            displayedOrgs.map(org => (
                                <p key={org.name} className="rounded-md hover:bg-gray-400 p-1 cursor-pointer" onClick={() => handleFilterSelect('for', org.slug)}>{org.name}</p>
                            ))
                        }
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex flex-col gap-2">
                <p className='font-bold text-sm'>Recruitment by</p>
                <Popover open={byOpen} onOpenChange={setByOpen}>
                    <PopoverAnchor asChild>
                        <Input className='h-8 text-sm' placeholder='Search recruiter' value={byInputValue} onChange={(e) => setByInputValue(e.target.value)} onBlur={() => !byOpen && setByInputValue('')} />
                    </PopoverAnchor>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 h-fit max-h-36 overflow-y-auto">
                        {
                            displayedRecruiters.map(org => (
                                <p key={org.name} className="rounded-md hover:bg-gray-400 p-1 cursor-pointer" onClick={() => handleFilterSelect('by', org.slug)}>{org.name}</p>
                            ))
                        }
                    </PopoverContent>
                </Popover>
            </div>
            <Accordion className='mt-4' type='multiple' defaultValue={['status']}>
                <AccordionItem value='status'>
                    <AccordionTrigger className='rounded-none px-1 !py-2 font-bold cursor-pointer hover:no-underline'>Status</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-2" value={status ?? ""} onValueChange={(value) => handleFilterSelect('status', value)}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-500 translate-y-[1.5px]"></div>
                                    <Label className="text-sm" htmlFor='ongoing'>Ongoing</Label>
                                </div>
                                <RadioGroupItem id='ongoing' value='ongoing' />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-amber-500 translate-y-[1.5px]"></div>
                                    <Label className="text-sm" htmlFor='pending'>Pending</Label>
                                </div>
                                <RadioGroupItem id='pending' value='pending' />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-gray-500 translate-y-[1.5px]"></div>
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
                <AccordionItem value='location'>
                    <AccordionTrigger className='rounded-none px-1 !py-2 font-bold cursor-pointer hover:no-underline'>Location</AccordionTrigger>
                    <AccordionContent className='flex flex-col gap-3 mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-3" value={location ?? ""} onValueChange={(value) => handleLocationSelect(value)}>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='all-india'>All India</Label>
                                <RadioGroupItem id='all-india' value='all-india' />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-sm" htmlFor='state'>State/UT</Label>
                                <RadioGroupItem id='state' value='state' />
                            </div>
                        </RadioGroup>
                        <Popover open={stateListOpen} onOpenChange={setStateListOpen}>
                            <PopoverAnchor asChild>
                                <Input className='h-8 text-sm' placeholder='Search state or UT' value={stateInputValue} onFocus={() => setStateListOpen(true)} onChange={(e) => setStateInputValue(e.target.value)} onBlur={() => !stateListOpen && setStateInputValue('')} disabled={!enableStateSelection} />
                            </PopoverAnchor>
                            <PopoverContent onOpenAutoFocus={(e) => e.preventDefault()} className="w-[var(--radix-popover-trigger-width)] p-2 h-fit max-h-36 overflow-y-auto">
                                {
                                    displayedStates.map(state => (
                                        <p key={state.name} className="rounded-md hover:bg-gray-400 p-1 cursor-pointer" onClick={() => handleFilterSelect('region', state.slug)}>{state.name}</p>
                                    ))
                                }
                            </PopoverContent>
                        </Popover>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='qualification'>
                    <AccordionTrigger className='rounded-none px-1 !py-2 font-bold cursor-pointer hover:no-underline'>Qualification</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-3" value={qualification ?? ""} onValueChange={(value) => handleFilterSelect('qualification', value)}>
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
                        <RadioGroup className="flex flex-col gap-3" value={expLvl ?? ""} onValueChange={(value) => handleFilterSelect('expLvl', value)}>
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

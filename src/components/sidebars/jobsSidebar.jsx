'use client';

import { useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

export default function JobsSidebar({ orgs = [], states = [], setSidebarOpen }) {
    const pathName = usePathname();
    const sp = useSearchParams();
    const router = useRouter();

    const sector = sp.get('sector');
    const paramsLocation = sp.get('location');
    const qualification = sp.get('qualification');
    const expLvl = sp.get('expLvl');
    const recruitmentStatus = sp.get('rStatus');

    const [orgInputValue, setOrgInputValue] = useState('');
    const [stateInputValue, setStateInputValue] = useState('');
    const [displayedOrgs, setDisplayedOrgs] = useState([]);
    const [displayedStates, setDisplayedStates] = useState(states);
    const [open, setOpen] = useState(false);
    const [regionOpen, setRegionOpen] = useState(false);
    const [enableStateSelection, setEnableStateSelection] = useState(false);
    const [stateListOpen, setStateListOpen] = useState(false);
    const [location, setLocation] = useState(() => (paramsLocation === null || paramsLocation === 'all-india') ? paramsLocation : 'state');

    useEffect(() => {
        if (!open)
            orgInputValue && setOrgInputValue('');
        if (!regionOpen)
            stateInputValue && setStateInputValue('');
    }, [open, regionOpen]);

    useEffect(() => {
        if (!orgInputValue)
            return;

        const timoutId = setTimeout(() => {
            const newDisplayedOrgsList = orgs.filter(org => org.name.toLowerCase().includes(orgInputValue) || org.abbr.toLowerCase().includes(orgInputValue));
            if (newDisplayedOrgsList.length > 0) {
                setDisplayedOrgs(newDisplayedOrgsList);
                setOpen(true);
            }
        }, 500);
        return () => {
            clearTimeout(timoutId);
        }
    }, [orgInputValue]);

    useEffect(() => {
        if (!stateInputValue)
            return;

        const newDisplayedRegionsList = states.filter(region => region.name.toLowerCase().includes(stateInputValue) || region.slug.toLowerCase().includes(stateInputValue));
        setDisplayedStates(newDisplayedRegionsList);

    }, [stateInputValue]);

    const handleFilterSelect = (key, value) => {
        key === 'org' && setOpen(false);
        key === 'location' && setRegionOpen(false);
        const sParams = new URLSearchParams(sp);
        sParams.set(key, value);
        router.replace(`${pathName}?${sParams.toString()}`);
        setSidebarOpen && setSidebarOpen(false);
    }

    const handleLocationSelect = (value) => {
        setLocation(value);
        if (value === 'all-india') {
            const sParams = new URLSearchParams(sp);
            sParams.set('location', value);
            router.replace(`${pathName}?${sParams.toString()}`);
        }
        else {
            if (location === 'all-india') {
                const sParams = new URLSearchParams(sp);
                sParams.delete('location');
                router.replace(`${pathName}?${sParams.toString()}`);
            }
            setEnableStateSelection(true);
        }
    }

    return (
        <div className="flex flex-col gap-5 mt-12 xl:mt-0 h-full p-2 overflow-y-auto">
            <div className="flex flex-col gap-2">   
                <p className='font-bold text-sm'>Organisation</p>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverAnchor asChild>
                        <Input placeholder='choose an organisation' value={orgInputValue} onChange={(e) => setOrgInputValue(e.target.value)} onBlur={() => !open && setOrgInputValue('')} />
                    </PopoverAnchor>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 h-fit max-h-36 overflow-y-auto">
                        {
                            displayedOrgs.map(org => (
                                <p key={org.name} className="rounded-md hover:bg-gray-400 p-1 cursor-pointer" onClick={() => handleFilterSelect('org', org.slug)}>{org.name}</p>
                            ))
                        }
                    </PopoverContent>
                </Popover>
            </div>
            <Accordion type='multiple' defaultValue='recruitmentStatus'>
                <AccordionItem value='recruitmentStatus'>
                    <AccordionTrigger className='rounded-none px-1 !py-2 font-bold cursor-pointer hover:no-underline'>Recruitment Status</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-2" value={recruitmentStatus} onValueChange={(value) => handleFilterSelect('rStatus', value)}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-500 translate-y-[1.5px]"></div>
                                    <Label className="text-sm" htmlFor='govt'>Ongoing</Label>
                                </div>
                                <RadioGroupItem id='ongoing' value='ongoing' />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-amber-500 translate-y-[1.5px]"></div>
                                    <Label className="text-sm" htmlFor='psu'>Pending</Label>
                                </div>
                                <RadioGroupItem id='pending' value='pending' />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-gray-500 translate-y-[1.5px]"></div>
                                    <Label className="text-sm" htmlFor='bank'>Completed</Label>
                                </div>
                                <RadioGroupItem id='completed' value='completed' />
                            </div>
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='jobSector'>
                    <AccordionTrigger className='rounded-none px-1 !py-2 font-bold cursor-pointer hover:no-underline'>Job Sector</AccordionTrigger>
                    <AccordionContent className='mt-2 px-2'>
                        <RadioGroup className="flex flex-col gap-3" value={sector} onValueChange={(value) => handleFilterSelect('sector', value)}>
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
                        <RadioGroup className="flex flex-col gap-3" value={location} onValueChange={(value) => handleLocationSelect(value)}>
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
                        <RadioGroup className="flex flex-col gap-3" value={qualification} onValueChange={(value) => handleFilterSelect('qualification', value)}>
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
                        <RadioGroup className="flex flex-col gap-3" value={expLvl} onValueChange={(value) => handleFilterSelect('expLvl', value)}>
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

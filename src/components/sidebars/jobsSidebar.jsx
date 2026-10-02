'use client';

import { useEffect, useState } from "react";

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useFilter } from "@/lib/context/filterContext";
import { capitalize, slugify } from "@/lib/utils";
import { JobsSidebarSkeleton } from "../skeletons";
import { useMessages } from "../messageProvider";

export default function JobsSidebar() {

    const { lang, messages } = useMessages();
    const { optimisticParams, applyFilter, removeFilter } = useFilter();

    const paramsCat = optimisticParams.cat;
    const paramsOrg = optimisticParams.org;
    const paramsLocation = optimisticParams.location;
    const paramsQualification = optimisticParams.qualification;
    const expLvl = optimisticParams.expLvl;
    const recruitmentStatus = optimisticParams.rStatus;

    const [jobsFilters, setJobsFilter] = useState(undefined);
    const [org, setOrg] = useState(null);
    const [qualification, setQualification] = useState(null);
    const [location, setLocation] = useState(null);
    const [cat, setCat] = useState(null);

    useEffect(() => {
        const fetchSidebar = async () => {
            try {
                const newSearchParams = (new URLSearchParams(optimisticParams)).toString();
                const res = await fetch(`/api/sidebar/${lang}/jobs?${newSearchParams}`);

                if (!res.ok) {
                    if (res.status === 404) {
                        setJobsFilter(null);
                        return;
                    }

                    throw new Error(`Failed to fetch sidebar: ${res.status}`);
                }

                const data = await res.json();
                if (data)
                    setJobsFilter(data);
            } catch (error) {
                console.error("Failed to fetch sidebar:", error);
            }
        };

        fetchSidebar();
    }, [optimisticParams]);

    useEffect(() => {
        if (!paramsLocation)
            setLocation(null);

        if (!jobsFilters?.locations) return;

        const locationObj = jobsFilters.locations.find(location => location.slug === paramsLocation);
        setLocation(locationObj);

    }, [paramsLocation, jobsFilters]);

    useEffect(() => {
        if (!paramsOrg)
            setOrg(null);

        if (!jobsFilters?.orgs) return;

        const orgObj = jobsFilters.orgs.find(org => org.slug === paramsOrg);
        setOrg(orgObj);

    }, [paramsOrg, jobsFilters]);

    useEffect(() => {
        if (!paramsQualification)
            setQualification(null);

        if (!jobsFilters?.qualifications) return;

        const qualificationObj = jobsFilters.qualifications.find(q => q.slug === paramsQualification);
        setQualification(qualificationObj);

    }, [paramsQualification, jobsFilters]);

    useEffect(() => {
        if (!paramsCat)
            setCat(null);

        if (!jobsFilters?.categories) return;

        const catObj = jobsFilters.categories.find(cat => slugify(cat.name) === paramsCat);
        setCat(catObj);

    }, [paramsCat, jobsFilters]);

    return (
        <>
            {
                jobsFilters ?
                    <div className="flex flex-col gap-5 mt-12 lg:mt-0 h-full p-2 overflow-y-auto">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor='hiringOrg'>{messages.jobs.filterLabels.hiringOrg}</Label>
                            <Combobox items={jobsFilters.orgs} itemToStringLabel={(org) => org.name} value={org ?? ""} onValueChange={(value) => value ? applyFilter({ org: value.slug }) : removeFilter('org')} >
                                <ComboboxInput id='hiringOrg' className='hover:border-ring hover:ring-[3px] hover:ring-ring/50' placeholder='Employer (e.g., PNB)' showClear={org} />
                                <ComboboxContent>
                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                    <ComboboxList>
                                        {
                                            (org) => (
                                                <ComboboxItem key={org.slug} value={org} disabled={org.isDisabled}>{org.name}</ComboboxItem>
                                            )
                                        }
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </div>
                        <fieldset>
                            <legend className='mb-3 text-sm font-semibold'>{messages.jobs.filterLabels.rStatus}</legend>
                            <RadioGroup className="flex flex-col gap-2" value={recruitmentStatus ?? ""} onValueChange={(value) => value && applyFilter({ rStatus: value })}>
                                {
                                    jobsFilters.rStatuses.map(rStatus => {
                                        const { status, isDisabled } = rStatus;
                                        const iconColor = status === 'upcoming' ? 'bg-yellow-600' : status === 'ongoing' ? 'bg-green-700' : 'bg-gray-400';
                                        return (
                                            <div key={status} className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-3 w-3 rounded-full ${iconColor} translate-y-[1.5px]`}></div>
                                                    <Label className="text-sm" htmlFor={status}>{messages.jobs.filters.rStatuses[status]}</Label>
                                                </div>
                                                <RadioGroupItem id={status} value={status} disabled={isDisabled} />
                                            </div>
                                        )
                                    })
                                }
                            </RadioGroup>
                        </fieldset>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor='jobCategory'>{messages.jobs.filterLabels.category}</Label>
                            <Combobox
                                items={jobsFilters.categories}
                                value={cat ?? ""}
                                itemToStringLabel={cat => cat.name}
                                isItemEqualToValue={(itemValue, value) => itemValue.name === value.name}
                                onValueChange={(value) => value ? applyFilter({ cat: value.slug }) : removeFilter('cat')}
                            >
                                <ComboboxInput id='jobCategory' className='hover:border-ring hover:ring-[3px] hover:ring-ring/50' placeholder='e.g., Banking, IT' showClear={cat} />
                                <ComboboxContent>
                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                    <ComboboxList>
                                        {
                                            (cat) => (
                                                <ComboboxItem key={cat.name} value={cat} disabled={cat.isDisabled}>{cat.name}</ComboboxItem>
                                            )
                                        }
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor='location'>{messages.jobs.filterLabels.location}</Label>
                            <Combobox
                                items={jobsFilters.locations}
                                value={location ?? ""}
                                itemToStringLabel={location => location.name}
                                onValueChange={(value) => value ? applyFilter({ location: value.slug }) : removeFilter('location')}
                            >
                                <ComboboxInput id='location' className='hover:border-ring hover:ring-[3px] hover:ring-ring/50' placeholder='Select a location' showClear />
                                <ComboboxContent>
                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                    <ComboboxList>
                                        {
                                            (location) => (
                                                <ComboboxItem key={location.slug} value={location} disabled={location.isDisabled}>{location.name}</ComboboxItem>
                                            )
                                        }
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor='qualification'>{messages.jobs.filterLabels.qualification}</Label>
                            <Combobox
                                items={jobsFilters.qualifications}
                                itemToStringLabel={(qualification) => qualification.name}
                                value={qualification ?? ""}
                                onValueChange={(value) => value ? applyFilter({ qualification: value.slug }) : removeFilter('qualification')}
                            >
                                <ComboboxInput className='hover:border-ring hover:ring-[3px] hover:ring-ring/50' placeholder='Select Qualification' showClear={qualification} />
                                <ComboboxContent>
                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                    <ComboboxList>
                                        {
                                            (qualification) => (
                                                <ComboboxItem key={qualification.slug} value={qualification} disabled={qualification.isDisabled}>{qualification.name}</ComboboxItem>
                                            )
                                        }
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </div>
                        <fieldset>
                            <legend className='mb-3 text-sm font-semibold'>{messages.jobs.filterLabels.experience}</legend>
                            <RadioGroup className="flex flex-col gap-2" value={expLvl ?? ""} onValueChange={(value) => value && applyFilter({ expLvl: value })}>
                                {
                                    jobsFilters.expLvls.map(expLvl => (
                                        <div key={expLvl.slug} className="flex justify-between items-center">
                                            <Label htmlFor={expLvl.slug} className="text-sm">{expLvl.name}</Label>
                                            <RadioGroupItem id={expLvl.slug} value={expLvl.slug} disabled={expLvl.isDisabled} />
                                        </div>
                                    ))
                                }
                            </RadioGroup>
                        </fieldset>
                    </div > :
                    <JobsSidebarSkeleton />
            }
        </>
    )
}

import * as cheerio from 'cheerio';

import { connectDB } from "./dbConfig";
import { buildJobPosting, deslugify, formatLocationJsonLd, getMessages } from "./utils";
import { format } from "date-fns";

const ITEM_PER_PAGE = 12;

//For Recruitments Page Metadata
export async function getRecruitmentsMetadata({ recruiter, status, cat, location, qualification, expLvl, lang } = {}) {
    try {
        const db = await connectDB()

        const allParams = { recruiter, status, cat, qualification, expLvl, location }

        const activeParams = Object.entries(allParams)
            .filter(([_, value]) => value)
            .map(([key]) => key)
            .sort()

        const meta = await db.collection("metadata").findOne(
            { page: "recruitments", params: activeParams },
            { projection: { title: `$title.${lang}`, description: `$description.${lang}`, _id: 0 } }
        );

        if (!meta)
            return {
                title: `Government Recruitments | ${process.env.NEXT_PUBLIC_NAME}`,
                description: "Browse government recruitment in India by qualification, status and more. Explore key details like vacancies, required experience and more."
            }

        const recruiterName = recruiter ? await getNameFromSlug("orgs", recruiter, lang) : null;

        let statusName = status ? deslugify(status) : null;

        let categoryName = cat ? deslugify(cat) : null;

        let qualificationName;

        if (qualification) {
            const result = await db.collection('qualifications').findOne(
                { slug: qualification },
                { projection: { name: `$name.${lang}`, ancestors: 1 } }
            );
            qualificationName = qualification === 'any-graduate' ? 'graduates' : result.name;
            if (qualificationName.includes('(Any)')) {
                qualificationName = qualificationName.replace(' (Any)', "");
            }
            if (result.ancestors.includes('any-graduate'))
                qualificationName = `${qualificationName} graduates`;
        }

        let expLvlName;

        if (expLvl) {
            if (qualification)
                expLvlName = expLvl;
            else
                expLvlName = expLvl === 'fresher' ? 'Freshers' : 'Experienced Professionals';
        }

        let locationName;

        if (location) {
            const locationDetails = await db.collection('locations').find(
                { slug: location },
                { projection: { name: `$name.${lang}` } }
            );
            locationName = locationDetails.name;
        }

        const displayParams = {
            recruiter: recruiterName,
            status: statusName,
            statusLower: statusName.toLowerCase(),
            cat: categoryName,
            catLower: categoryName.toLowerCase(),
            qualification: qualificationName,
            expLvl: expLvlName,
            expLvlLower: expLvlName.toLowerCase(),
            location: locationName,
            siteName: process.env.NEXT_PUBLIC_NAME
        }

        const replace = (template) =>
            template.replace(/{{(\w+)}}/g, (_, key) => displayParams[key] ?? "")

        return {
            title: replace(meta.title),
            description: replace(meta.description)
        }

    } catch (error) {
        return {
            title: `Government Recruitments | ${process.env.NEXT_PUBLIC_NAME}`,
            description: "Browse government recruitment in India by qualification, status and more. Explore key details like vacancies, required experience and more."
        }
    }
}

async function createRecruitmentsSearchQuery({ search, recruiter, status, cat, location, qualification, expLvl, lang } = {}) {
    let query = {
        $and: [{ status: { $ne: 'inactive' } }]
    };

    if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        query.$and.push({
            $or: [
                { name: { [lang]: searchRegex } },
                { fullName: { [lang]: searchRegex } },
                { slug: searchRegex },
                { keywords: searchRegex },
            ]
        });
    }
    if (status)
        query.$and.push({ status });

    if (location) {
        query.$and.push({ "locations.pathSlugs": location });
    }
    if (recruiter) {
        query.$and.push({ "recruiter.slug": recruiter });
    }

    try {
        const db = await connectDB();

        if (qualification || expLvl || cat) {
            let { $and } = await createJobsSearchQuery({ qualification, expLvl, cat });

            let jobQuery = $and.length > 2 ? $and.slice(1) : $and[1];

            const jobs = await db.collection('jobs')
                .find(jobQuery)
                .project({
                    org: 1,
                    categories: 1,
                    qualifications: 1,
                    minimumExperience: 1,
                    maximumExperience: 1
                })
                .toArray();

            const jobIds = jobs.map(job => job._id);
            query.$and.push({ "jobs.jobId": { $in: jobIds } });

        }
        return query;
    } catch (error) {
        console.error("createRecruitmentsSearchQuery failed:", error);
        throw error;
    }

}

//For Recruitments Page Metadata
export async function getRecruitmentCount({ recruiter, status, cat, qualification, expLvl, location, lang } = {}) {
    let { query } = await createRecruitmentsSearchQuery({ recruiter, status, cat, qualification, expLvl, location, lang });

    try {
        const db = await connectDB();
        const count = await db.collection('recruitments').countDocuments(query);
        return count;
    } catch (error) {
        console.error("getRecruitmentCount failed:", error);
        throw error;
    }
}

//For Recruitments Page
export async function getRecruitments({ search, recruiter, status, cat, qualification, expLvl, location, lang, page = 1 } = {}) {

    let query = await createRecruitmentsSearchQuery({ search, recruiter, status, cat, qualification, expLvl, location, lang });

    try {
        const db = await connectDB();

        const recruitmentsInfo = await db.collection('recruitments').aggregate([
            { $match: query },
            {
                $facet: {
                    metadata: [
                        { $count: "total" }
                    ],
                    data: [
                        { $sort: { updatedAt: -1, _id: 1 } },
                        { $skip: (page - 1) * ITEM_PER_PAGE },
                        { $limit: ITEM_PER_PAGE },
                        {
                            $project: {
                                name: `$name.${lang}`,
                                fullName: `$fullName.${lang}`,
                                slug: 1,
                                year: 1,
                                locations: 1,
                                jobs: 1,
                                vacancies: `$contentVariables.vacancies.${lang}`,
                                registrationEndDates: `$contentVariables.registrationEndDate.${lang}`,
                                status: 1,
                                stageStatus: `$stageStatus.${lang}`
                            }
                        }
                    ]
                }
            }
        ]).next();

        const { metadata, data: recruitments } = recruitmentsInfo;

        if (recruitments.length === 0)
            return { itemCount: 0, recruitments };


        const jobIds = recruitments.flatMap(rec => rec.jobs.map(job => job.jobId));
        const jobs = await db.collection('jobs')
            .find({ _id: { $in: jobIds } })
            .project({
                org: 1,
                categories: 1,
                qualifications: 1,
                minimumExperience: 1,
                maximumExperience: 1
            })
            .toArray();

        const categoryIds = jobs.flatMap(job => job.categories.map(cat => cat.categoryId));
        const qualificationIds = jobs.flatMap(job => job.qualifications.map(q => q.qualificationId));
        const locationIds = recruitments.flatMap(rec => rec.locations.map(loc => loc.locationId));

        const [categories, locations, qualifications] = await Promise.all([
            db.collection('jobCategories')
                .find({ _id: { $in: categoryIds } })
                .project({ name: `$name.${lang}` })
                .toArray(),
            db.collection('locations')
                .find({ _id: { $in: locationIds } })
                .project({ name: `$name.${lang}` })
                .toArray(),
            db.collection('qualifications')
                .find({ _id: { $in: qualificationIds } })
                .project({ name: `$name.${lang}`, shortForm: `$shortForm.${lang}` })
                .toArray()
        ]);

        const finalRecruitmentsList = recruitments.map(recruitment => {

            const recruitmentJobIds = recruitment.jobs.map(job => job.jobId.toString());
            const recruitmentJobs = jobs.filter(job => recruitmentJobIds.includes(job._id.toString()));

            const uniqueCategories = recruitmentJobs.flatMap(job => job.categories).filter((obj, index, self) => {
                return index === self.findIndex(item => item.categoryId.toString() === obj.categoryId.toString())
            });


            let modifiedCategories = uniqueCategories.map(jCat => {
                const categoryDoc = categories.find(cat => cat._id.toString() === jCat.categoryId.toString());
                return categoryDoc.name;
            });

            let modifiedLocation = recruitment.locations.map(jLoc => {
                const locationDoc = locations.find(loc => loc._id.toString() === jLoc.locationId.toString());
                return locationDoc.name;
            });

            const uniqueQualifications = recruitmentJobs.flatMap(job => job.qualifications).filter((obj, index, self) => {
                return index === self.findIndex(item => item.qualificationId.toString() === obj.qualificationId.toString())
            });

            let recruitmentQualifications = uniqueQualifications.map(jQualification => {
                const qualificationDoc = qualifications.find(q => q._id.toString() === jQualification.qualificationId.toString());
                return qualificationDoc;
            });

            const minimumExperience = Math.min([...recruitmentJobs.map(recJob => recJob.minimumExperience)]) || 0;
            const maximumExperience = Math.min([...recruitmentJobs.map(recJob => recJob.maximumExperience)]) || 0;
            return {
                ...recruitment,
                categories: modifiedCategories,
                location: modifiedLocation,
                qualifications: recruitmentQualifications,
                minimumExperience,
                maximumExperience
            };
        });

        const details = { itemCount: metadata[0].total, recruitments: finalRecruitmentsList };

        return JSON.parse(JSON.stringify(details));

    } catch (error) {
        console.error("getRecruitments failed:", error);
        throw error;
    }
};

//For Recruitments Page Sidebar
export async function getRecruitmentsFilters({ lang, sp = {} }) {


    try {
        const db = await connectDB();

        let something = {
            recruiters: [],
            statuses: [],
            categories: [],
            locations: [],
            qualifications: [],
            expLvls: []
        };

        if (Object.keys(sp).length > 0) {

            const createSP = (field) => {
                const newSP = { ...sp };
                delete newSP[field];
                return newSP;
            }
            let recruiterSP = createSP('recruiter')
            let qualificationSP = createSP('qualification');
            let categorySP = createSP('cat');
            let locationSP = createSP('location');
            let statusSP = createSP('rStatus');
            let expLvlSP = createSP('expLvl');

            let withoutRecruiterQuery = await createRecruitmentsSearchQuery(recruiterSP);
            let withoutQualificationQuery = await createRecruitmentsSearchQuery(qualificationSP);
            let withoutCategoryQuery = await createRecruitmentsSearchQuery(categorySP);
            let withoutLocationQuery = await createRecruitmentsSearchQuery(locationSP);
            let withoutStatusQuery = await createRecruitmentsSearchQuery(statusSP);
            let withoutExpLvlQuery = await createRecruitmentsSearchQuery(expLvlSP);

            const recruitmentBasedfilterDetails = await db.collection('recruitments').aggregate([
                { $match: { status: { $ne: 'inactive' } } },
                {
                    $facet: {
                        initialRecruiters: [{ $group: { _id: "$recruiter.recruiterId" } }],
                        initialStatuses: [
                            { $group: { _id: "$status" } }
                        ],
                        initialLocations: [
                            { $unwind: "$locations" },
                            { $group: { _id: "$locations.locationId" } }
                        ],
                        initialJobs: [
                            { $unwind: "$jobs" },
                            { $group: { _id: "$jobs.jobId" } }
                        ],
                        filteredRecruiters: [
                            { $match: withoutRecruiterQuery },
                            { $group: { _id: "$recruiter.recruiterId" } }
                        ],
                        filteredStatuses: [
                            { $match: withoutStatusQuery },
                            { $group: { _id: "$status" } }
                        ],
                        withoutCategoryFilteredJobs: [
                            { $match: withoutCategoryQuery },
                            { $unwind: "$jobs" },
                            { $group: { _id: "$jobs.jobId" } }
                        ],
                        filteredLocations: [
                            { $match: withoutLocationQuery },
                            { $unwind: "$locations" },
                            { $group: { _id: "$locations.locationId" } }
                        ],
                        withoutQualificationFilteredJobs: [
                            { $match: withoutQualificationQuery },
                            { $unwind: "$jobs" },
                            { $group: { _id: "$jobs.jobId" } }
                        ],
                        withoutExpLvlFilteredJobs: [
                            { $match: withoutExpLvlQuery },
                            { $unwind: "$jobs" },
                            { $group: { _id: "$jobs.jobId" } }
                        ]
                    }
                },
                {
                    $project: {
                        initialRecruiterIds: "$initialRecruiters._id",
                        initialStatuses: "$initialStatuses._id",
                        initialLocationIds: "$initialLocations._id",
                        initialJobIds: "$initialJobs._id",
                        filteredRecruiterIds: "$filteredRecruiters._id",
                        filteredStatuses: "$filteredStatuses._id",
                        withoutCategoryFilteredJobIds: "$withoutCategoryFilteredJobs._id",
                        filteredLocationIds: "$filteredLocations._id",
                        withoutQualificationFilteredJobIds: "$withoutQualificationFilteredJobs._id",
                        withoutExpLvlFilteredJobIds: "$withoutExpLvlFilteredJobs._id"
                    }
                }
            ]).next();

            const {
                initialRecruiterIds,
                initialStatuses,
                initialLocationIds,
                initialJobIds,
                filteredRecruiterIds,
                filteredStatuses,
                withoutCategoryFilteredJobIds,
                filteredLocationIds,
                withoutQualificationFilteredJobIds,
                withoutExpLvlFilteredJobIds
            } = recruitmentBasedfilterDetails;

            const intialJobBasedFilterDetails = await db.collection('jobs').aggregate([
                { $match: { _id: { $in: initialJobIds } } },
                {
                    $facet: {
                        initialQualifications: [
                            { $unwind: "$qualifications" },
                            { $group: { _id: "$qualifications.qualificationId" } }
                        ],
                        initialCategories: [
                            { $unwind: "$categories" },
                            { $group: { _id: "$categories.categoryId" } }
                        ]
                    }
                },
                {
                    $project: {
                        initialQualificationIds: "$initialQualifications._id",
                        initialCategoryIds: "$initialCategories._id"
                    }
                }
            ]).next();

            const { initialQualificationIds, initialCategoryIds } = intialJobBasedFilterDetails;

            const filterDetails = await db.collection('jobs').aggregate([
                { $match: {} },
                {
                    $facet: {
                        filteredQualifications: [
                            { $match: { _id: { $in: withoutQualificationFilteredJobIds } } },
                            { $unwind: "$qualifications" },
                            { $group: { _id: "$qualifications.qualificationId" } }
                        ],
                        filteredCategories: [
                            { $match: { _id: { $in: withoutCategoryFilteredJobIds } } },
                            { $unwind: "$categories" },
                            { $group: { _id: "$categories.categoryId" } }
                        ],
                        filteredMinExperience: [
                            { $match: { _id: { $in: withoutExpLvlFilteredJobIds } } },
                            { $group: { _id: "$minimumExperience" } }
                        ]
                    }
                },
                {
                    $project: {
                        filteredQualificationIds: "$filteredQualifications._id",
                        filteredCategoryIds: "$filteredCategories._id",
                        filteredMinExperience: "$filteredMinExperience._id"
                    }
                }
            ]).next();

            const {
                filteredQualificationIds,
                filteredCategoryIds,
                filteredMinExperience
            } = filterDetails;

            const finalRecruiters = initialRecruiterIds.map(id => ({ id, isDisabled: !filteredRecruiterIds.some(fId => fId.toString() === id.toString()) }));
            const finalCategories = initialCategoryIds.map(id => ({ id, isDisabled: !filteredCategoryIds.some(fId => fId.toString() === id.toString()) }));
            const finalQualifications = initialQualificationIds.map(id => ({ id, isDisabled: !filteredQualificationIds.some(fId => fId.toString() === id.toString()) }));
            const finalLocations = initialLocationIds.map(id => ({ id, isDisabled: !filteredLocationIds.some(fId => fId.toString() === id.toString()) }));
            const finalStatuses = initialStatuses.sort().reverse().map(status => ({ status, isDisabled: !filteredStatuses.includes(status) }));
            const finalMinExperience = [
                { slug: "fresher", isDisabled: !filteredMinExperience.some(exp => exp === 0) },
                { slug: "experienced", isDisabled: !filteredMinExperience.some(exp => exp > 0) }
            ]

            something.recruiters.push(...finalRecruiters);
            something.qualifications.push(...finalQualifications);
            something.categories.push(...finalCategories);
            something.locations.push(...finalLocations);
            something.statuses.push(...finalStatuses);
            something.expLvls.push(...finalMinExperience);
        }
        else {

            const recruitmentBasedfilterDetails = await db.collection('recruitments').aggregate([
                { $match: { status: { $ne: 'inactive' } } },
                {
                    $facet: {
                        initialRecruiters: [{ $group: { _id: "$recruiter.recruiterId" } }],
                        initialStatuses: [
                            { $group: { _id: "$status" } }
                        ],
                        initialLocations: [
                            { $unwind: "$locations" },
                            { $group: { _id: "$locations.locationId" } }
                        ],
                        initialJobs: [
                            { $unwind: "$jobs" },
                            { $group: { _id: "$jobs.jobId" } }
                        ]
                    }
                },
                {
                    $project: {
                        initialRecruiterIds: "$initialRecruiters._id",
                        initialStatuses: "$initialStatuses._id",
                        initialLocationIds: "$initialLocations._id",
                        initialJobIds: "$initialJobs._id"
                    }
                }
            ]).next();

            const {
                initialRecruiterIds,
                initialStatuses,
                initialLocationIds,
                initialJobIds
            } = recruitmentBasedfilterDetails;

            const jobBasedFilterDetails = await db.collection('jobs').aggregate([
                { $match: { _id: { $in: initialJobIds } } },
                {
                    $facet: {
                        initialQualifications: [
                            { $unwind: "$qualifications" },
                            { $group: { _id: "$qualifications.qualificationId" } }
                        ],
                        initialCategories: [
                            { $unwind: "$categories" },
                            { $group: { _id: "$categories.categoryId" } }
                        ],
                        initialExperiences: [{ $group: { _id: "$minimumExperience" } }]
                    }
                },
                {
                    $project: {
                        initialQualificationIds: "$initialQualifications._id",
                        initialCategoryIds: "$initialCategories._id",
                        initialExperiences: "$initialExperiences._id"
                    }
                }
            ]).next();

            const {
                initialQualificationIds,
                initialCategoryIds,
                initialExperiences
            } = jobBasedFilterDetails;

            const finalRecruiters = initialRecruiterIds.map(id => ({ id, isDisabled: false }));
            const finalCategories = initialCategoryIds.map(id => ({ id, isDisabled: false }));
            const finalQualifications = initialQualificationIds.map(id => ({ id, isDisabled: false }));
            const finalLocations = initialLocationIds.map(id => ({ id, isDisabled: false }))
            const finalRecruitmentStatuses = initialStatuses.sort().reverse().map(rStatus => ({ status: rStatus, isDisabled: false }));
            const finalMinExperience = [
                { slug: "fresher", isDisabled: !initialExperiences.some(exp => exp === 0) },
                { slug: "experienced", isDisabled: !initialExperiences.some(exp => exp > 0) }
            ];

            something.recruiters.push(...finalRecruiters);
            something.qualifications.push(...finalQualifications);
            something.categories.push(...finalCategories);
            something.locations.push(...finalLocations);
            something.statuses.push(...finalRecruitmentStatuses);
            something.expLvls.push(...finalMinExperience);
        }

        const recruiterIds = something.recruiters.map(recruiter => recruiter.id);
        const categoryIds = something.categories.map(cat => cat.id);
        const locationIds = something.locations.map(loc => loc.id);
        const qualificationIds = something.qualifications.map(q => q.id);

        const [dbRecruiters, dbCategories, dbLocations, dbQualifications] = await Promise.all([
            db.collection("orgs")
                .find({ _id: { $in: recruiterIds } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("jobCategories")
                .find({ _id: { $in: categoryIds } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("locations")
                .find({ _id: { $in: locationIds } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("qualifications")
                .find({ _id: { $in: qualificationIds } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray()
        ])

        const recruiters = dbRecruiters.filter(org => something.recruiters.some(recruiter => recruiter.id.toString() === org._id.toString())).map(recruiter => ({
            ...recruiter,
            isDisabled: something.recruiters.find(rid => rid.id.toString() === recruiter._id.toString()).isDisabled
        }));

        const categories = dbCategories.map(category => ({
            ...category,
            isDisabled: something.categories.find(cat => cat.id.toString() === category._id.toString()).isDisabled
        }));

        const qualifications = dbQualifications.map(qualification => ({
            ...qualification,
            isDisabled: something.qualifications.find(q => q.id.toString() === qualification._id.toString()).isDisabled
        }));

        const locations = dbLocations.map(location => ({
            ...location,
            isDisabled: something.locations.find(loc => loc.id.toString() === location._id.toString()).isDisabled
        }));

        const messages = await getMessages(lang);

        const details = {
            recruiters,
            categories,
            locations,
            qualifications,
            statuses: something.statuses,
            expLvls: something.expLvls.map(expLvl => ({ name: messages.jobs.filters.expLvls[expLvl.slug], ...expLvl }))
        }

        return JSON.parse(JSON.stringify(details));

    } catch (error) {
        console.error("getJobsFilters failed: ", error)
        return null
    }
}

//For Home Page's "Recent Recruitments" section
export async function getOngoingRecruitments({ lang }) {

    try {
        const db = await connectDB();
        const recruitments = await db.collection('recruitments').aggregate([
            { $match: { status: { $ne: "inactive" } } },
            { $sort: { updatedAt: -1, _id: 1 } },
            { $limit: 6 },
            {
                $project: {
                    name: `$name.${lang}`,
                    fullName: `$fullName.${lang}`,
                    slug: 1,
                    year: 1,
                    locations: 1,
                    jobs: 1,
                    vacancies: `$contentVariables.vacancies.${lang}`,
                    registrationEndDate: `$contentVariables.registrationEndDate.${lang}`,
                    status: 1,
                    stageStatus: `$stageStatus.${lang}`
                }
            }
        ]).toArray();
        if (!recruitments.length) return [];

        const jobIds = [...new Set(recruitments.flatMap(rec => rec.jobs.map(job => job.jobId)))];
        const jobs = await db.collection('jobs')
            .find({ _id: { $in: jobIds } })
            .project({
                org: 1,
                categories: 1,
                qualifications: 1,
                minimumExperience: 1,
                maximumExperience: 1
            })
            .toArray();

        const categoryIds = jobs.flatMap(job => job.categories.map(cat => cat.categoryId));
        const qualificationIds = jobs.flatMap(job => job.qualifications.map(q => q.qualificationId));
        const locationIds = recruitments.flatMap(rec => rec.locations.map(loc => loc.locationId));

        const [categories, locations, qualifications] = await Promise.all([
            db.collection('jobCategories')
                .find({ _id: { $in: categoryIds } })
                .project({ name: `$name.${lang}` })
                .toArray(),
            db.collection('locations')
                .find({ _id: { $in: locationIds } })
                .project({ name: `$name.${lang}` })
                .toArray(),
            db.collection('qualifications')
                .find({ _id: { $in: qualificationIds } })
                .project({ name: `$name.${lang}`, shortForm: `$shortForm.${lang}` })
                .toArray()
        ]);

        const finalRecruitmentsList = recruitments.map(recruitment => {

            const recruitmentJobIds = recruitment.jobs.map(job => job.jobId.toString());
            const recruitmentJobs = jobs.filter(job => recruitmentJobIds.includes(job._id.toString()));

            const uniqueCategories = recruitmentJobs.flatMap(job => job.categories).filter((obj, index, self) => {
                return index === self.findIndex(item => item.categoryId.toString() === obj.categoryId.toString())
            });


            let modifiedCategories = uniqueCategories.map(jCat => {
                const categoryDoc = categories.find(cat => cat._id.toString() === jCat.categoryId.toString());
                return categoryDoc.name;
            });

            let modifiedLocation = recruitment.locations.map(jLoc => {
                const locationDoc = locations.find(loc => loc._id.toString() === jLoc.locationId.toString());
                return locationDoc.name;
            });

            const uniqueQualifications = recruitmentJobs.flatMap(job => job.qualifications).filter((obj, index, self) => {
                return index === self.findIndex(item => item.qualificationId.toString() === obj.qualificationId.toString())
            });

            let recruitmentQualifications = uniqueQualifications.map(jQualification => {
                const qualificationDoc = qualifications.find(q => q._id.toString() === jQualification.qualificationId.toString());
                return qualificationDoc;
            });

            const minimumExperience = Math.min([...recruitmentJobs.map(recJob => recJob.minimumExperience)]) || 0;
            const maximumExperience = Math.min([...recruitmentJobs.map(recJob => recJob.maximumExperience)]) || 0;
            return {
                ...recruitment,
                categories: modifiedCategories,
                location: modifiedLocation,
                qualifications: recruitmentQualifications,
                minimumExperience,
                maximumExperience
            };
        });

        return JSON.parse(JSON.stringify(finalRecruitmentsList));

    } catch (error) {
        console.error("getRecruitments failed:", error);
        throw error;
    }
};

//For Recruitment Page Metadata
export async function getRecruitmentMetadata(lang, recSlug) {
    const year = recSlug.substring(recSlug.lastIndexOf('-') + 1);

    try {
        const db = await connectDB();
        const result = await db.collection('recruitments').aggregate([
            { $match: { slug: recSlug } },
            {
                $project: {
                    title: `$metadata.title.${lang}`,
                    description: `$metadata.description.${lang}`
                }
            }
        ]).next();
        if (!result)
            return null;
        const recruitment = {
            title: result.title.replace("((year))", year),
            description: result.description.replace("((year))", year)
        }
        return JSON.parse(JSON.stringify(recruitment));
    } catch (error) {
        console.error("getRecruitmentMetadata failed:", error);
        throw error;
    }
};

//For Creating Job Postings
export async function getRecruitmentJsonLd(lang, recSlug) {
    const year = recSlug.substring(recSlug.lastIndexOf('-') + 1);
    if (!/^\d{4}$/.test(year)) {
        console.error(`Could not extract a valid year from slug "${recSlug}"`);
        return null;
    }

    try {
        const db = await connectDB();
        const recruitmentDetails = await db.collection('recruitments').findOne(
            { slug: recSlug },
            {
                projection: {
                    name: `$name.${lang}`,
                    locations: 1,
                    jobs: 1,
                    status: 1,
                    notificationDate: "$contentVariables.notificationDate.en",
                    registrationEndDate: "$contentVariables.registrationEndDate.en"
                }
            }
        );
        const hasValidJobs = recruitmentDetails.jobs.find(job => (job.vacancies > 0));
        if (
            !recruitmentDetails ||
            recruitmentDetails.status === "pending" ||
            recruitmentDetails.jobs.length === 0 ||
            !hasValidJobs
        )
            return null;

        const recruitmentJobIds = recruitmentDetails.jobs.map(j => j.jobId);
        const recruitmentLocationIds = recruitmentDetails.locations.map(loc => loc.locationId);

        const [recruitmentJobs, locationList] = await Promise.all([
            db.collection('jobs')
                .find({ _id: { $in: recruitmentJobIds } })
                .project({ orgId: "$org.orgId", name: `$name.${lang}`, jobType: 1 })
                .toArray(),
            db.collection('locations')
                .find({ _id: { $in: recruitmentLocationIds } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray()
        ]);

        const orgIds = recruitmentJobs.map(rj => rj.orgId);
        const orgList = await db.collection('orgs')
            .find({ _id: { $in: orgIds } })
            .project({ name: `$name.${lang}` })
            .toArray();

        const modifiedRecruitmentJobs = recruitmentDetails.jobs
            .filter(job => job.vacancies > 0)
            .map(job => {
                const jobDoc = recruitmentJobs.find(rj => rj._id.equals(job.jobId));
                const org = orgList.find(o => o._id.equals(jobDoc.orgId));
                return {
                    ...job,
                    name: jobDoc.name,
                    jobType: jobDoc.jobType,
                    orgName: org.name
                };
            });

        const { notificationDate, registrationEndDate } = recruitmentDetails;

        const locations = formatLocationJsonLd(locationList);

        const base = {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            ...(locations.length > 0 && {
                "jobLocation": locations.length > 1 ? locations : locations[0]
            }),
            "datePosted": format(new Date(notificationDate), "yyyy-MM-dd"),
            "validThrough": format(new Date(registrationEndDate), "yyyy-MM-dd"),
            "directApply": false,
        };

        if (modifiedRecruitmentJobs.length === 1) {
            return buildJobPosting(lang, modifiedRecruitmentJobs[0], base, year);
        }

        return modifiedRecruitmentJobs.map(job => ({
            ...buildJobPosting(lang, job, base, year),
            "identifier": {
                "@type": "PropertyValue",
                "name": job.orgName,
                "value": `${recSlug}-${job.jobId}`
            }
        }));

    } catch (error) {
        console.error("getRecruitmentJsonLd failed: ", error);
        return null;
    }

}

//For Recruitment Page Content
export async function getRecruitmentContent(lang, recSlug) {
    const year = recSlug.substring(recSlug.lastIndexOf('-') + 1);
    let query = [
        { $match: { slug: recSlug } },
        {
            $project: {
                contentVariables: 1,
                updatedAt: 1,
                overviewContent: {
                    $getField: {
                        field: lang,
                        input: {
                            $getField: {
                                field: "$status",
                                input: "$overview.content"
                            }
                        }
                    }
                },
                stages: {
                    $map: {
                        input: "$stages",
                        as: "stage",
                        in: {
                            content: {
                                $getField: {
                                    field: lang,
                                    input: {
                                        $getField: {
                                            field: "$$stage.status",
                                            input: "$$stage.content"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    ];

    try {
        const db = await connectDB();

        const recruitment = await db.collection('recruitments').aggregate(query).next();

        if (!recruitment)
            return null
        else {
            let { contentVariables, overviewContent, stages, updatedAt } = recruitment;
            let content = "<article>" + overviewContent + stages.map(stage => stage.content).join('') + "</article>";
            content = content.replace(RegExp(`\\(\\(lang\\)\\)`, "g"), lang);
            content = content.replace(RegExp(`\\(\\(year\\)\\)`, "g"), year);
            Object.keys(contentVariables).filter(key => content.includes(`((${key}))`)).map(key => {
                const value = contentVariables[key][lang];
                content = content.replace(RegExp(`\\(\\(${key}\\)\\)`, "g"), value);
            });

            const lastUpdated = generateLastUpdated(updatedAt);
            content = content.replace('last_updated', lastUpdated);

            return content;
        }

    } catch (error) {
        console.error("getRecruitmentContent failed:", error);
        throw error;
    }
};

//For Recruitment Page Sidebar
export async function getRecruitmentSidebarDetails(lang, recSlug) {

    try {
        const db = await connectDB();
        const recruitment = await db.collection('recruitments').aggregate([
            { $match: { slug: recSlug } },
            {
                $project:
                {
                    stages: {
                        $map: {
                            input: "$stages",
                            as: "stage",
                            in: {
                                name: "$$stage.name",
                                slug: "$$stage.slug",
                                status: "$$stage.status",
                                linkHeadings: {
                                    $map: {
                                        input: "$$stage.linkHeadings",
                                        as: "linkHeading",
                                        in: {
                                            headingName: `$$linkHeading.headingName.${lang}`,
                                            slug: "$$linkHeading.slug"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

        ]).next();
        if (!recruitment)
            return null;

        const stages = recruitment.stages.map(stage => ({ ...stage, name: stage.name[lang] }));

        return { stages };

    } catch (error) {
        console.error("getRecruitmentSidebarDetails failed:", error);
        throw error;
    }
};

//For Jobs Page Metadata
export async function getJobsMetadata({ org, rStatus, cat, qualification, expLvl, location, lang } = {}) {
    try {
        const db = await connectDB()

        const allParams = { org, rStatus, cat, qualification, expLvl, location }

        // Build active params array — sorted alphabetically
        const activeParams = Object.entries(allParams)
            .filter(([_, value]) => value)
            .map(([key]) => key)
            .sort();

        const meta = await db.collection("metadata").findOne(
            { page: "jobs", params: activeParams },
            { projection: { title: `$title.${lang}`, description: `$description.${lang}`, _id: 0 } }
        );

        if (!meta)
            return {
                title: `Government Jobs | ${process.env.NEXT_PUBLIC_NAME}`,
                description: "Browse government job roles in India by qualification, recruitement status and more. Explore key job details like salary, required experience and more."
            }

        // Prepare display-ready values
        const orgName = org ? await getNameFromSlug("orgs", org, lang) : null;

        let statusName = rStatus ? deslugify(rStatus) : null;

        let categoryName = cat ? deslugify(cat) : null;

        let qualificationName;

        if (qualification) {
            const result = await db.collection('qualifications').findOne(
                { slug: qualification },
                { projection: { name: `$name.${lang}`, ancestors: 1 } }
            );
            qualificationName = qualification === 'any-graduate' ? 'graduates' : result.name;
            if (qualificationName.includes('(Any)')) {
                qualificationName = qualificationName.replace(' (Any)', "");
            }
            if (result.ancestors.includes('any-graduate'))
                qualificationName = `${qualificationName} graduates`;

        }

        let expLvlName;

        if (expLvl) {
            if (qualification)
                expLvlName = expLvl;
            else
                expLvlName = expLvl === 'fresher' ? 'Freshers' : 'Experienced Professionals';
        }

        let locationName;

        if (location) {
            const locationDetails = await db.collection('locations').find(
                { slug: location },
                { projection: { name: `$name.${lang}` } }
            );
            locationName = locationDetails.name;
        }

        const displayParams = {
            org: orgName,
            rStatus: statusName,
            rStatusLower: statusName.toLowerCase(),
            cat: categoryName,
            catLower: categoryName.toLowerCase(),
            qualification: qualificationName,
            expLvl: expLvlName,
            expLvlLower: expLvlName.toLowerCase(),
            location: locationName,
            siteName: process.env.NEXT_PUBLIC_NAME
        }

        const replace = (template) =>
            template.replace(/{{(\w+)}}/g, (_, key) => displayParams[key] ?? "");

        return {
            title: replace(meta.title),
            description: replace(meta.description)
        }

    } catch (error) {
        console.error("getJobsMetadata failed: " + error);
        return {
            title: `Government Jobs | ${process.env.NEXT_PUBLIC_NAME}`,
            description: "Browse government job roles in India by qualification, recruitement status and more. Explore key job details like salary, required experience and more."
        }
    }
}

//For Jobs Page
async function createJobsSearchQuery({ search, org, rStatus, cat, qualification, expLvl, location, lang } = {}) {
    let query = {
        $and: [{ hidden: false }]
    };

    if (search) {
        const searchRegex = { $regex: search, $options: "i" };
        query.$and.push({
            $or: [
                { name: { [lang]: searchRegex } },
                { slug: searchRegex }
            ]
        });
    }

    if (cat) {
        query.$and.push({ "categories.slug": cat });
    }

    if (expLvl) {
        query.$and.push({ minimumExperience: expLvl === 'experienced' ? { $gt: 0 } : 0 });
    }

    if (qualification) {
        if (
            [
                'diploma-_any_',
                'iti-_any_',
                'any-graduate',
                'any-post_graduate'
            ].includes(qualification)
        )
            query.$and.push({ "qualifications.slug": qualification })
        else {
            try {
                const db = await connectDB();
                const qualificationDetails = await db.collection('qualifications').findOne({ slug: qualification }, { projection: { ancestors: 1 } });
                query.$and.push({ "qualifications.slug": { $in: [qualification, ...qualificationDetails.ancestors] } });
            } catch (error) {
                console.error("getting qualification details failed: ", error);
            }
        }
    }

    if (location) {
        query.$and.push({ "locations.pathSlugs": location });
    }

    if (org) {
        query.$and.push({ "org.slug": org });
    }

    if (rStatus) {
        query.$and.push({ "recruitments.status": rStatus });
    }

    if (query.$and.length === 0)
        return {};

    return query;
}

//For Jobs Page Metadata
export async function getJobCount({ org, rStatus, cat, qualification, expLvl, location, lang } = {}) {

    let query = await createJobsSearchQuery({ org, rStatus, cat, qualification, expLvl, location, lang });

    try {
        const db = await connectDB();

        const count = await db.collection('jobs').countDocuments(query);

        return count;

    } catch (error) {
        console.error("getJobCount failed:", error);
        throw error;
    }
};

//For Jobs Page
export async function getJobs({ search, org, rStatus, cat, qualification, expLvl, location, lang, page = 1 } = {}) {

    let query = await createJobsSearchQuery({ search, org, rStatus, cat, qualification, expLvl, location, lang });

    try {
        const db = await connectDB();

        const res = await db.collection('jobs').aggregate([
            { $match: query },
            {
                $facet: {
                    metadata: [
                        { $count: "total" }
                    ],
                    data: [
                        { $sort: { updatedAt: -1, "name.en": 1 } },
                        { $skip: (page - 1) * ITEM_PER_PAGE },
                        { $limit: ITEM_PER_PAGE },
                        {
                            $project: {
                                orgId: "$org.orgId",
                                name: `$name.${lang}`,
                                slug: 1,
                                categories: 1,
                                locations: 1,
                                qualifications: 1,
                                minimumExperience: 1,
                                maximumExperience: 1,
                                minimumSalary: 1,
                                maximumSalary: 1,
                                recruitments: 1
                            }
                        }
                    ]
                }
            }
        ]).next();

        if (res.data.length === 0)
            return { itemCount: 0, jobs: res.data };

        const { metadata, data: jobs } = res;

        const orgIds = jobs.map(job => job.orgId);
        const categoryIds = jobs.flatMap(job => job.categories.map(jc => jc.categoryId));
        const locationIds = jobs.flatMap(job => job.locations.map(jl => jl.locationId));
        const qualificationIds = jobs.flatMap(job => job.qualifications.map(q => q.qualificationId));
        const [orgs, categories, locations, qualifications] = await Promise.all([
            db.collection('orgs')
                .find({ _id: { $in: orgIds } })
                .project({ name: `$name.${lang}`, logo: "$logoSrc" })
                .toArray(),
            db.collection('jobCategories')
                .find({ _id: { $in: categoryIds } })
                .project({ name: `$name.${lang}` })
                .toArray(),
            db.collection('locations')
                .find({ _id: { $in: locationIds } })
                .project({ name: `$name.${lang}` })
                .toArray(),
            db.collection('qualifications')
                .find({ _id: { $in: qualificationIds } })
                .project({ name: `$name.${lang}`, shortForm: `$shortForm.${lang}` })
                .toArray()
        ]);

        const finalJobList = jobs.map((job) => {
            const jobOrg = orgs.find(org => job.orgId.toString() === org._id.toString());

            let modifiedCategories = job.categories.map(jCat => {
                const categoryDoc = categories.find(cat => cat._id.toString() === jCat.categoryId.toString());
                return categoryDoc.name;
            });

            let modifiedLocation = job.locations.map(jLoc => {
                const locationDoc = locations.find(loc => loc._id.toString() === jLoc.locationId.toString());
                return locationDoc.name;
            });

            const jobQualificationIds = job.qualifications.map(q => q.qualificationId.toString());
            let modifiedQualifications = qualifications.filter(q => jobQualificationIds.includes(q._id.toString()));

            return {
                ...job,
                orgName: jobOrg.name,
                orgLogo: jobOrg.logo,
                categories: modifiedCategories,
                location: modifiedLocation,
                qualifications: modifiedQualifications,
            };
        });

        const details = { itemCount: metadata[0].total, jobs: finalJobList };

        return JSON.parse(JSON.stringify(details));

    } catch (error) {
        console.error(error);
        throw error;
    }
};

//For Jobs Page Sidebar
export async function getJobsFilters({ lang, sp = {} }) {


    try {
        const db = await connectDB();

        let something = {
            orgs: [],
            qualifications: [],
            categories: [],
            locations: [],
            rStatuses: [],
            expLvls: []
        };

        if (Object.keys(sp).length > 0) {

            const createSP = (field) => {
                const newSP = { ...sp };
                delete newSP[field];
                return newSP;
            }
            let orgSP = createSP('org')
            let qualificationSP = createSP('qualification');
            let categorySP = createSP('cat');
            let locationSP = createSP('location');
            let rStatusSP = createSP('rStatus');
            let expLvlSP = createSP('expLvl');

            let orgQuery = await createJobsSearchQuery(orgSP);
            let qualificationQuery = await createJobsSearchQuery(qualificationSP);
            let categoryQuery = await createJobsSearchQuery(categorySP);
            let locationQuery = await createJobsSearchQuery(locationSP);
            let rStatusQuery = await createJobsSearchQuery(rStatusSP);
            let expLvlQuery = await createJobsSearchQuery(expLvlSP);

            const filterDetails = await db.collection('jobs').aggregate([
                { $match: { hidden: false } },
                {
                    $facet: {
                        initialOrgs: [{ $group: { _id: "$org.orgId" } }],
                        initialQualifications: [
                            { $unwind: "$qualifications" },
                            { $group: { _id: "$qualifications.qualificationId" } }
                        ],
                        initialCategories: [
                            { $unwind: "$categories" },
                            { $group: { _id: "$categories.categoryId" } }
                        ],
                        initialLocations: [
                            { $unwind: "$locations" },
                            { $group: { _id: "$locations.locationId" } }
                        ],
                        initialRecruitmentStatuses: [
                            { $unwind: "$recruitments" },
                            { $group: { _id: "$recruitments.status" } }
                        ],
                        initialExperiences: [{ $group: { _id: "$minimumExperience" } }],
                        filteredOrgs: [
                            { $match: orgQuery },
                            { $group: { _id: "$org.orgId" } }
                        ],
                        filteredQualifications: [
                            { $match: qualificationQuery },
                            { $unwind: "$qualifications" },
                            { $group: { _id: "$qualifications.qualificationId" } }
                        ],
                        filteredCategories: [
                            { $match: categoryQuery },
                            { $unwind: "$categories" },
                            { $group: { _id: "$categories.categoryId" } }
                        ],
                        filteredLocations: [
                            { $match: locationQuery },
                            { $group: { _id: "$locations.locationId" } }
                        ],
                        filteredRecruitmentStatuses: [
                            { $match: rStatusQuery },
                            { $unwind: "$recruitments" },
                            { $group: { _id: "$recruitments.status" } }
                        ],
                        filteredMinExperience: [
                            { $match: expLvlQuery },
                            { $group: { _id: "$minimumExperience" } }
                        ]
                    }
                },
                {
                    $project: {
                        initialOrgIds: "$initialOrgs._id",
                        initialQualificationIds: "$initialQualifications._id",
                        initialCategoryIds: "$initialCategories._id",
                        initialLocationIds: "$initialLocations._id",
                        initialRecruitmentStatuses: "$initialRecruitmentStatuses._id",
                        initialExperiences: "$initialExperiences._id",
                        filteredOrgIds: "$filteredOrgs._id",
                        filteredQualificationIds: "$filteredQualifications._id",
                        filteredCategoryIds: "$filteredCategories._id",
                        filteredLocationIds: "$filteredLocations._id",
                        filteredRecruitmentStatuses: "$filteredRecruitmentStatuses._id",
                        filteredMinExperience: "$filteredMinExperience._id"
                    }
                }
            ]).next();

            const {
                initialOrgIds,
                initialQualificationIds,
                initialCategoryIds,
                initialLocationIds,
                initialRecruitmentStatuses,
                filteredOrgIds,
                filteredQualificationIds,
                filteredCategoryIds,
                filteredLocationIds,
                filteredRecruitmentStatuses,
                filteredMinExperience
            } = filterDetails;

            const finalOrgs = initialOrgIds.map(id => ({ id, isDisabled: !filteredOrgIds.some(fId => fId.toString() === id.toString()) }));
            const finalQualifications = initialQualificationIds.map(id => ({ id, isDisabled: !filteredQualificationIds.some(fId => fId.toString() === id.toString()) }));
            const finalCategories = initialCategoryIds.map(id => ({ id, isDisabled: !filteredCategoryIds.some(fId => fId.toString() === id.toString()) }));
            const finalLocations = initialLocationIds.map(id => ({ id, isDisabled: !filteredLocationIds.some(fId => fId.toString() === id.toString()) }));
            const finalRecruitmentStatuses = initialRecruitmentStatuses.sort().reverse().map(rStatus => ({ status: rStatus, isDisabled: !filteredRecruitmentStatuses.includes(rStatus) }));
            const finalMinExperience = [
                { slug: "fresher", isDisabled: !filteredMinExperience.some(exp => exp === 0) },
                { slug: "experienced", isDisabled: !filteredMinExperience.some(exp => exp > 0) }
            ]

            something.orgs.push(...finalOrgs);
            something.qualifications.push(...finalQualifications);
            something.categories.push(...finalCategories);
            something.locations.push(...finalLocations);
            something.rStatuses.push(...finalRecruitmentStatuses);
            something.expLvls.push(...finalMinExperience);
        }
        else {

            const initialFilterDetails = await db.collection('jobs').aggregate([
                { $match: { hidden: false } },
                {
                    $facet: {
                        initialOrgs: [{ $group: { _id: "$org.orgId" } }],
                        initialQualifications: [
                            { $unwind: "$qualifications" },
                            { $group: { _id: "$qualifications.qualificationId" } }
                        ],
                        initialCategories: [
                            { $unwind: "$categories" },
                            { $group: { _id: "$categories.categoryId" } }
                        ],
                        initialLocations: [
                            { $unwind: "$locations" },
                            { $group: { _id: "$locations.locationId" } }
                        ],
                        initialRecruitmentStatuses: [
                            { $unwind: "$recruitments" },
                            { $group: { _id: "$recruitments.status" } }
                        ],
                        initialExperiences: [{ $group: { _id: "$minimumExperience" } }]
                    }
                },
                {
                    $project: {
                        initialOrgIds: "$initialOrgs._id",
                        initialQualificationIds: "$initialQualifications._id",
                        initialCategoryIds: "$initialCategories._id",
                        initialLocationIds: "$initialLocations._id",
                        initialRecruitmentStatuses: "$initialRecruitmentStatuses._id",
                        initialExperiences: "$initialExperiences._id",
                    }
                }
            ]).next();

            const {
                initialOrgIds,
                initialQualificationIds,
                initialCategoryIds,
                initialLocationIds,
                initialRecruitmentStatuses,
                initialExperiences
            } = initialFilterDetails;

            const finalOrgs = initialOrgIds.map(id => ({ id, isDisabled: false }))
            const finalQualifications = initialQualificationIds.map(id => ({ id, isDisabled: false }))
            const finalCategories = initialCategoryIds.map(id => ({ id, isDisabled: false }))
            const finalLocations = initialLocationIds.map(id => ({ id, isDisabled: false }))
            const finalRecruitmentStatuses = initialRecruitmentStatuses.sort().reverse().map(rStatus => ({ status: rStatus, isDisabled: false }))
            const finalMinExperience = [
                { slug: "fresher", isDisabled: !initialExperiences.some(exp => exp === 0) },
                { slug: "experienced", isDisabled: !initialExperiences.some(exp => exp > 0) }
            ]

            something.orgs.push(...finalOrgs);
            something.qualifications.push(...finalQualifications);
            something.categories.push(...finalCategories);
            something.locations.push(...finalLocations);
            something.rStatuses.push(...finalRecruitmentStatuses);
            something.expLvls.push(...finalMinExperience);
        }


        const [dbOrgs, dbCategories, dbLocations, dbQualifications] = await Promise.all([
            db.collection("orgs")
                .find({ _id: { $in: something.orgs.map(org => org.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("jobCategories")
                .find({ _id: { $in: something.categories.map(category => category.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("locations")
                .find({ _id: { $in: something.locations.map(location => location.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("qualifications")
                .find({ _id: { $in: something.qualifications.map(qualification => qualification.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray()
        ])

        const orgs = dbOrgs.map(org => ({
            ...org,
            isDisabled: something.orgs.find(o => o.id.toString() === org._id.toString()).isDisabled
        }));

        const categories = dbCategories.map(category => ({
            ...category,
            isDisabled: something.categories.find(cat => cat.id.toString() === category._id.toString()).isDisabled
        }));

        const qualifications = dbQualifications.map(qualification => ({
            ...qualification,
            isDisabled:
                something.qualifications.some(q => q.id.toString() === qualification._id.toString()).isDisabled
        }));

        const locations = dbLocations.map(location => ({
            ...location,
            isDisabled: something.locations.find(loc => loc.id.toString() === location._id.toString()).isDisabled
        }));

        const messages = await getMessages(lang);

        const details = {
            orgs,
            categories,
            qualifications,
            locations,
            rStatuses: something.rStatuses,
            expLvls: something.expLvls.map(expLvl => ({ name: messages.jobs.filters.expLvls[expLvl.slug], ...expLvl }))
        }

        return JSON.parse(JSON.stringify(details));

    } catch (error) {
        console.error("getJobsFilters failed: ", error)
        return null
    }
}

//For Home Page's "Popular Jobs" section
export async function getPopularJobs({ lang }) {

    try {
        const db = await connectDB();
        const jobs = await db.collection('jobs')
            .find({})
            .sort({ updatedAt: -1 })
            .limit(6)
            .project({
                orgId: "$org.orgId",
                recruitments: 1,
                name: `$name.${lang}`,
                slug: 1,
                categories: 1,
                locations: 1,
                qualifications: 1,
                minimumExperience: 1,
                maximumExperience: 1,
                minimumSalary: 1,
                maximumSalary: 1,
            })
            .toArray();

        const orgIds = jobs.map(job => job.orgId);
        const categoryIds = jobs.flatMap(job => job.categories.map(jc => jc.categoryId));
        const locationIds = jobs.flatMap(job => job.locations.map(jl => jl.locationId));
        const qualificationIds = jobs.flatMap(job => job.qualifications.map(q => q.qualificationId));
        const [orgs, categories, locations, qualifications] = await Promise.all([
            db.collection('orgs')
                .find({ _id: { $in: orgIds } })
                .project({ name: `$name.${lang}`, logo: "$logoSrc" })
                .toArray(),
            db.collection('jobCategories')
                .find({ _id: { $in: categoryIds } })
                .project({ name: `$name.${lang}` })
                .toArray(),
            db.collection('locations')
                .find({ _id: { $in: locationIds } })
                .project({ name: `$name.${lang}` })
                .toArray(),
            db.collection('qualifications')
                .find({ _id: { $in: qualificationIds } })
                .project({ name: `$name.${lang}`, shortForm: `$shortForm.${lang}` })
                .toArray()
        ]);

        const finalJobList = jobs.map((job) => {
            const jobOrg = orgs.find(org => job.orgId.toString() === org._id.toString());

            let modifiedCategories = job.categories.map(jCat => {
                const categoryDoc = categories.find(cat => cat._id.toString() === jCat.categoryId.toString());
                return categoryDoc.name;
            });

            let modifiedLocation = job.locations.map(jLoc => {
                const locationDoc = locations.find(loc => loc._id.toString() === jLoc.locationId.toString());
                return locationDoc.name;
            });

            const jobQualificationIds = job.qualifications.map(q => q.qualificationId.toString());
            let modifiedQualifications = qualifications.filter(q => jobQualificationIds.includes(q._id.toString()));

            return {
                ...job,
                orgName: jobOrg.name,
                orgLogo: jobOrg.logo,
                categories: modifiedCategories,
                location: modifiedLocation,
                qualifications: modifiedQualifications,
            };
        });

        return JSON.parse(JSON.stringify(finalJobList));
    } catch (error) {
        console.error("getPopularJobs failed:", error);
        throw error;
    }
};

//For Job JobNav and Job Recruitment Details page's metadata
export async function getJobMetadata(lang, jobSlug) {
    try {
        const db = await connectDB();
        const jobDetails = await db.collection('jobs')
            .findOne(
                { slug: jobSlug, hidden: false },
                {
                    projection: {
                        title: `$metadata.title.${lang}`,
                        description: `$metadata.description.${lang}`
                    }
                }
            );
        if (!jobDetails)
            return null;

        return JSON.parse(JSON.stringify(jobDetails));

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getJobContent(lang, jobSlug) {

    let projection = { minimumSalary: 1, maximumSalary: 1, content: `$content.${lang}`, updatedAt: 1 };

    try {
        const db = await connectDB();
        const jobDetails = await db.collection('jobs').aggregate([
            { $match: { slug: jobSlug, hidden: false } },
            {
                $project: {
                    org: 1,
                    recruitments: 1,
                    minimumSalary: 1,
                    maximumSalary: 1,
                    content: `$content.${lang}`,
                    updatedAt: 1
                }
            }
        ]).next();

        if (!jobDetails)
            return null;

        let dbContent = jobDetails.content;

        dbContent = dbContent.replaceAll('((lang))', lang);
        const { minimumSalary, maximumSalary } = jobDetails;
        dbContent = dbContent.replace('((minimumSalary))', minimumSalary.toLocaleString("en-IN"));
        dbContent = dbContent.replace('((maximumSalary))', maximumSalary.toLocaleString("en-IN"));

        const lastUpdated = generateLastUpdated(jobDetails.updatedAt);
        dbContent = dbContent.replace('last_updated', lastUpdated);

        const recruitmentIds = [...new Set(jobDetails.recruitments.map(rec => rec.recruitmentId))];

        const matchedRecruitments = await db.collection('recruitments').aggregate([
            {
                $match: {
                    $and: [
                        { _id: { $in: recruitmentIds } },
                        { "status": { $ne: "inactive" } }
                    ]
                }
            },
            { $sort: { updatedAt: -1 } },
            {
                $addFields: {
                    currentStage: {
                        $last: {
                            $filter: {
                                input: "$stages",
                                as: "stage",
                                cond: { $in: ["$$stage.status", ["ongoing", "completed"]] }
                            }
                        }
                    },
                    upcomingStage: {
                        $first: {
                            $filter: {
                                input: "$stages",
                                as: "stage",
                                cond: { $eq: ["$$stage.status", "upcoming"] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    name: `$name.${lang}`,
                    slug: 1,
                    vacancies: `$contentVariables.vacancies.${lang}`,
                    registrationEndDate: `$contentVariables.registrationEndDate.${lang}`,
                    status: 1,
                    stageStatus: `$stageStatus.${lang}`,
                    currentStageSlug: "$currentStage.slug",
                    upcomingStageSlug: "$upcomingStage.slug",
                    overviewContent: {
                        $getField: {
                            field: lang,
                            input: {
                                $getField: {
                                    field: '$status',
                                    input: '$overview.content'
                                }
                            }
                        }
                    },
                    updatedAt: -1,
                    contentVariables: 1
                }
            }
        ]).toArray();

        let recruitments;

        if (matchedRecruitments.length > 0) {
            recruitments = matchedRecruitments.map(recruitment => {
                const {
                    slug,
                    upcomingStageSlug,
                    currentStageSlug,
                    overviewContent,
                    currentStageContent,
                    contentVariables,
                    ...rest
                } = recruitment;
                const overviewLink = `/${lang}/recruitments/${slug}#overview`;
                const currentStageLink = `/${lang}/recruitments/${slug}#${currentStageSlug}`;
                const upcomingStageLink = `/${lang}/recruitments/${slug}#${upcomingStageSlug}`;
                let $ = cheerio.load(overviewContent, null, false);
                let currentStatus = $('p#currentStatus').html();
                let whatsNext = $('p#whatsNext').html();
                const year = slug.substring(slug.lastIndexOf('-') + 1);
                currentStatus = currentStatus.replaceAll(`((year))`, year);
                whatsNext = whatsNext.replaceAll(`((year))`, year);
                Object.keys(contentVariables).forEach(key => {
                    let value = contentVariables[key][lang];
                    if (currentStatus.includes(`((${key}))`))
                        currentStatus = currentStatus.replaceAll(`((${key}))`, value);
                    if (whatsNext.includes(`((${key}))`))
                        whatsNext = whatsNext.replaceAll(`((${key}))`, value);
                });
                return { ...rest, overviewLink, currentStatus, currentStageLink, whatsNext, upcomingStageLink };
            });
        }
        else
            recruitments = [];

        return JSON.parse(JSON.stringify({ content: dbContent, recruitments }));

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getJobSidebarFields(lang, jobSlug) {
    try {
        const db = await connectDB();
        const jobDetails = await db.collection('jobs').aggregate([
            { $match: { slug: jobSlug } },
            {
                $project: {
                    linkHeadings: {
                        $map: {
                            input: "$linkHeadings",
                            as: "linkHeading",
                            in: {
                                headingName: `$$linkHeading.headingName.${lang}`,
                                slug: "$$linkHeading.slug"
                            }
                        }
                    }
                }
            }
        ]).next();
        if (!jobDetails)
            return null;

        return jobDetails.linkHeadings;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getQuickLinks({ lang }) {

    try {
        const db = await connectDB();
        const [jobs, something] = await Promise.all([
            db.collection("jobs").aggregate([
                { $match: {} },
                {
                    $facet: {
                        tenthPassRecruitmentIds: [
                            { $match: { "qualifications.slug": "10th-pass" } },
                            { $unwind: "$recruitments" },
                            { $group: { _id: "$recruitments.recruitmentId" } }
                        ],
                        twelfthPassRecruitmentIds: [
                            { $match: { "qualifications.slug": RegExp("12th-pass", "i") } },
                            { $unwind: "$recruitments" },
                            { $group: { _id: "$recruitments.recruitmentId" } }
                        ],
                        graduateRecruitmentIds: [
                            { $match: { "qualifications.slug": "any-graduate" } },
                            { $unwind: "$recruitments" },
                            { $group: { _id: "$recruitments.recruitmentId" } }
                        ]
                    }
                },
                {
                    $project: {
                        _id: -1,
                        tenthPassRecruitmentIds: "$tenthPassRecruitmentIds._id",
                        twelfthPassRecruitmentIds: "$twelfthPassRecruitmentIds._id",
                        graduateRecruitmentIds: "$graduateRecruitmentIds._id",
                    }
                }
            ]).next(),
            db.collection('recruitments').aggregate([
                { $match: { status: "ongoing" } },
                {
                    $facet: {
                        admitCards: [
                            { $unwind: "$stages" },
                            { $match: { "stages.name.en": /Admit Card/i, "stage.status": "ongoing" } },
                            {
                                $project: {
                                    recName: `$name.${lang}`,
                                    slug: 1,
                                    stageName: `$stages.name.${lang}`,
                                    stageSlug: `$stages.slug`
                                }
                            }
                        ],
                        results: [
                            { $match: { "stageStatus.en": /Result Out/i } },
                            { $unwind: "$stages" },
                            { $match: { "stages.name.en": /Result/i } },
                            { $sort: { "stages.updatedAt": - 1 } },
                            { $limit: 1 },
                            {
                                $project: {
                                    recName: `$name.${lang}`,
                                    slug: 1,
                                    stageName: `$stages.name.${lang}`,
                                    stageSlug: `$stages.slug`
                                }
                            }
                        ],
                        scorecards: [
                            { $match: { "stageStatus.en": /Scorecard Out/i } },
                            { $unwind: "$stages" },
                            { $match: { "stages.name.en": /Scorecard/i } },
                            { $sort: { "stages.updatedAt": - 1 } },
                            { $limit: 1 },
                            {
                                $project: {
                                    recName: `$name.${lang}`,
                                    slug: 1,
                                    stageName: `$stages.name.${lang}`,
                                    stageSlug: `$stages.slug`
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        _id: -1,
                        admitCards: 1,
                        results: 1,
                        scorecards: 1
                    }
                }
            ]).toArray()
        ]);

        const recruitments = await db.collection('recruitments').aggregate([
            { $match: { status: "ongoing" } },
            {
                $facet: {
                    tenthPassRecruitments: [
                        { $match: { _id: { $in: jobs.tenthPassRecruitmentIds } } },
                        { $set: { updatedAt: { $max: "$stages.updatedAt" } } },
                        { $sort: { updatedAt: -1, "name.en": 1 } },
                        { $limit: 10 },
                        { $project: { name: `$name.${lang}`, slug: 1, stageStatus: `$stageStatus.${lang}` } }
                    ],
                    twelfthPassRecruitments: [
                        { $match: { _id: { $in: jobs.twelfthPassRecruitmentIds } } },
                        { $set: { updatedAt: { $max: "$stages.updatedAt" } } },
                        { $sort: { updatedAt: -1, "name.en": 1 } },
                        { $limit: 10 },
                        { $project: { name: `$name.${lang}`, slug: 1, stageStatus: `$stageStatus.${lang}` } }
                    ],
                    graduateRecruitments: [
                        { $match: { _id: { $in: jobs.graduateRecruitmentIds } } },
                        { $set: { updatedAt: { $max: "$stages.updatedAt" } } },
                        { $sort: { updatedAt: -1, "name.en": 1 } },
                        { $limit: 10 },
                        { $project: { name: `$name.${lang}`, slug: 1, stageStatus: `$stageStatus.${lang}` } }
                    ]
                }
            },
            {
                $project: {
                    _id: -1,
                    tenthPassRecruitments: 1,
                    twelfthPassRecruitments: 1,
                    graduateRecruitments: 1
                }
            }
        ]).next();

        const latestAdmitCards = something.flatMap(rec => rec.admitCards);
        const latestResults = something.flatMap(rec => rec.results);
        const latestScorecards = something.flatMap(rec => rec.scorecards);

        const details = { recruitments, latestAdmitCards, latestResults, latestScorecards };

        return JSON.parse(JSON.stringify(details));

    } catch (error) {
        console.error(error);
        throw error;
    }
};

export async function getDetailsForSitemap(collectionName) {

    let projection;

    switch (collectionName) {
        case 'jobs':
            projection = { slug: 1, updatedAt: 1, _id: 0 };
            break;
        case 'recruitments':
            projection = { slug: 1, updatedAt: 1, stages: { slug: 1, updatedAt: 1 }, _id: 0 };
            break;
    }

    try {
        const db = await connectDB();
        const slugs = collectionName === 'jobs' ?
            await db.collection(collectionName).find({ hidden: false }).project(projection).toArray() :
            await db.collection(collectionName).aggregate([
                { $match: { status: { $ne: "inactive" } } },
                { $set: { updatedAt: { $max: "$stages.updatedAt" } } },
                { $project: projection }
            ]).toArray();
        return slugs;
    } catch (error) {
        return [];
    }
}

export async function getFiltersForSitemap(collectionName) {
    try {
        const db = await connectDB();
        if (collectionName === 'jobs') {
            const rStatuses = await db.collection('jobs').distinct('recruitments.status', {
                $and: [
                    { hidden: false },
                    { "recruitments.status": { $ne: "inactive" } },
                    { "recruitments.status": { $ne: "completed" } }
                ]
            });

            return { rStatuses }

        }

        else if (collectionName === 'recruitments') {
            const statuses = await db.collection('recruitments').distinct('status', {
                $and: [
                    { status: { $ne: "inactive" } },
                    { status: { $ne: "completed" } }
                ]
            });

            return { statuses }
        }

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getNameFromSlug(collectionName, slug, lang) {

    try {
        const db = await connectDB();
        const doc = await db.collection(collectionName).findOne(
            { slug: slug },
            { projection: { name: `$name.${lang}` } }
        );
        if (!doc)
            return null;
        return doc.name;
    } catch (error) {

    }
}

export async function getLocationNameFromSlug(slug, lang) {

    try {
        const db = await connectDB();
        const location = await db.collection('locations').findOne(
            { slug: slug },
            { projection: { name: `$name.${lang}` } }
        );
        if (!location)
            return null;
        return location.name;
    } catch (error) {

    }
}

export function generateLastUpdated(updatedAt) {
    const date = new Date(updatedAt);
    const [day, month, year] = date.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric', month: 'short', year: 'numeric'
    }).split(' ');
    return `<p class="text-sm text-gray-500 dark:text-gray-400 italic">Last Updated: ${day} ${month}, ${year}</p>`;
}

export function validatePath(url) {
    const pathName = url.substring(1).split('/');

}
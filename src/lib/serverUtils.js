import { ObjectId } from "mongodb";

import { connectDB } from "./dbConfig";
import { capitalize, deslugify, formatEducation, formatLocation } from "./utils";

const ITEM_PER_PAGE = 8;

//For Job and Recruitment Filters
export async function getStates() {

    try {
        const db = await connectDB();
        const states = await db.collection('states').find({}).toArray();
        return JSON.parse(JSON.stringify(states));
    } catch (error) {
        console.error("getStates failed:", error);
        throw error;
    }
}

//For Recruitments Page
export async function getRecruitments({ search, org, recruiter, status, cat, sector, qualification, expLvl, location, page = 1 } = {}) {

    let query = {};

    if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        query.$or = [
            { name: searchRegex },
            { slug: searchRegex },
            { keywords: searchRegex },
        ];
    }
    if (status)
        query.status = status;

    try {
        const db = await connectDB();
        if (location) {
            if (location === 'all-india')
                query = { ...query, 'location.scope': 'all_india' };
            else if (location === 'worldwide')
                query = { ...query, 'location.scope': 'international' };
            else {
                const state = await db.collection('states').findOne({ slug: location });
                if (!state) {
                    console.warn(`getRecruitments: no state found for slug "${location}"`);
                    return [];
                }
                query['location.state'] = state.name;
            }
        }
        if (recruiter) {
            const org = await db.collection('orgs').findOne({ slug: recruiter });

            if (!org) {
                console.warn(`getRecruitments: no org found for slug "${recruiter}"`);
                return [];
            }

            query.recruiterId = org._id.toString();
        }

        let jobs;

        if (org || qualification || expLvl || cat || sector) {
            let jobQuery = {};

            if (org) {
                const orgDetails = await db.collection('orgs').findOne({ slug: org }, { projection: { _id: 1 } });
                if (!orgDetails) {
                    console.warn(`getRecruitments: no org found for forSlug "${org}"`);
                    return [];
                }
                jobQuery.orgId = orgDetails._id.toString();
            }

            if (qualification) {
                jobQuery = { ...jobQuery, 'education.level': { $regex: qualification, $options: 'i' } };
            }

            if (expLvl) {
                if (expLvl === 'fresher')
                    jobQuery = { ...jobQuery, 'experience.maxYears': 0 };
                else if (expLvl === 'experienced')
                    jobQuery = { ...jobQuery, 'experience.minYears': { $gt: 0 } };
                else
                    return [];
            }

            if (cat) {
                jobQuery = { ...jobQuery, categories: { $regex: cat.replace("-", " "), $options: 'i' } };
            }

            if (sector) {
                const orgs = await db.collection("orgs")
                    .find({ sector: { $regex: sector.replace("-", " "), $options: "i" } })
                    .project({ _id: 1 })
                    .toArray();
                const orgIds = orgs.map(org => org._id.toString());
                jobQuery = { ...jobQuery, orgId: { $in: orgIds } }
            }

            jobs = await db.collection('jobs')
                .find(jobQuery)
                .project({ orgId: 1, recruitmentId: 1, categories: 1, education: 1, experience: 1 })
                .toArray();

            if (jobs.length > 0) {
                const recruitmentIds = [...new Set(jobs.map(job => new ObjectId(job.recruitmentId)))];
                query._id = { $in: recruitmentIds };
            }
            else
                return [];

        }

        const recruitmentsInfo = await db.collection('recruitments').aggregate([
            { $match: query },
            {
                $addFields: {
                    statusOrder: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$status", "ongoing"] }, then: 1 },
                                { case: { $eq: ["$status", "completed"] }, then: 2 },
                                { case: { $eq: ["$status", "pending"] }, then: 3 }
                            ],
                            default: 4
                        }
                    }
                }
            },
            {
                $facet: {
                    metadata: [
                        { $count: "total" }
                    ],
                    data: [
                        { $sort: { statusOrder: 1, updatedAt: -1 } },
                        { $skip: (page - 1) * ITEM_PER_PAGE },
                        { $limit: ITEM_PER_PAGE },
                        { $project: { name: 1, fullName: 1, slug: 1, location: 1, vacancies: 1, registrationDeadline: 1, status: 1, stageStatus: 1 } }
                    ]
                }
            }
        ]).next();

        const { metadata, data: recruitments } = recruitmentsInfo;

        if (recruitments.length === 0)
            return { itemCount: 0, recruitments };

        const recruitmentIds = recruitments.map(rec => rec._id.toString());

        if (!jobs)
            jobs = await db.collection('jobs')
                .find({ recruitmentId: { $in: recruitmentIds } })
                .project({ orgId: 1, recruitmentId: 1, categories: 1, education: 1, experience: 1 })
                .toArray();

        const jobOrgIds = jobs.map(job => new ObjectId(job.orgId));
        const orgs = await db.collection('orgs')
            .find({ _id: { $in: jobOrgIds } })
            .project({ sector: 1 }).toArray();

        const finalRecruitmentsList = recruitments.map(recruitment => {
            const recruitmentJobs = jobs.filter(job => job.recruitmentId === recruitment._id.toString());
            const recruitmentOrgIds = recruitmentJobs.map(job => job.orgId);
            const recruitmentOrgs = orgs.filter(org => recruitmentOrgIds.includes(org._id.toString()));
            const sectors = [...new Set(recruitmentOrgs.flatMap(org => org.sector))].sort();
            const categories = [...new Set(recruitmentJobs.flatMap(job => job.categories))].sort();
            const minYears = Math.min([...recruitmentJobs.map(recJob => recJob.experience.minYears)]) || 0;
            const maxYears = Math.min([...recruitmentJobs.map(recJob => recJob.experience.maxYears)]) || 0;
            return { ...recruitment, experienceRange: { minYears, maxYears }, sectors, categories };
        });

        const details = { itemCount: metadata[0].total, recruitments: finalRecruitmentsList };

        return JSON.parse(JSON.stringify(details));

    } catch (error) {
        console.error("getRecruitments failed:", error);
        throw error;
    }
};

//For Recruitments Page Metadata
export async function getRecruitmentsMetadata({ org, recruiter, status, sector, cat, qualification, expLvl, location } = {}) {
    try {
        const db = await connectDB()

        const allParams = { org, recruiter, status, sector, cat, qualification, expLvl, location }

        const activeParams = Object.entries(allParams)
            .filter(([_, value]) => value)
            .map(([key]) => key)
            .sort()

        const meta = await db.collection("metadata").findOne(
            { page: "recruitments", params: activeParams },
            { projection: { title: 1, description: 1, _id: 0 } }
        )

        if (!meta)
            return {
                title: `Government Recruitments | ${process.env.NEXT_PUBLIC_NAME}`,
                description: "Browse latest government recruitment notifications. Find ongoing and upcoming recruitments across banking, defence, railways, PSU, and more."
            }

        const orgName = org ? await getNameFromSlug("orgs", org) : null
        const recruiterName = recruiter ? await getNameFromSlug("orgs", recruiter) : null
        const statusLabel = {
            "ongoing": "Ongoing",
            "pending": "Upcoming",
            "completed": "Completed"
        }[status] ?? null
        const expLvlLabel = {
            "fresher": "Fresher",
            "entry": "Entry Level",
            "mid": "Mid Level",
            "senior": "Senior Level"
        }[expLvl] ?? null

        const displayParams = {
            org: orgName,
            recruiter: recruiterName,
            status: statusLabel,
            sector: deslugify(sector),
            cat: deslugify(cat),
            qualification: deslugify(qualification),
            expLvl: expLvlLabel,
            location: deslugify(location),
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
            description: "Browse latest government recruitment notifications. Find ongoing and upcoming recruitments across banking, defence, railways, PSU, and more."
        }
    }
}

//For Recruitment Page Metadata
export async function getRecruiterFromId(recruiterId) {
    try {
        const db = await connectDB();
        const recruiter = await db.collection('orgs').findOne(
            { _id: ObjectId.createFromHexString(recruiterId) },
            { projection: { name: 1, slug: 1, abbr: 1, _id: 0 } }
        )
        if (!recruiter) return null;

        return recruiter;

    } catch (error) {
        return null
    }
}

//For Home Page, Org Page and Recruitment body page
export async function getOngoingRecruitments(page, orgSlug) {

    let aggregate = [];

    try {
        const db = await connectDB();
        if (page === 'home')
            aggregate.push({ $match: { status: 'ongoing' } });
        else if (page === 'org') {
            if (!orgSlug)
                return [];

            const org = await db.collection('orgs').findOne({ slug: orgSlug });
            if (!org)
                return [];
            const orgJobs = await db.collection('jobs').find({ orgId: org._id.toString() }).project({ recruitmentId: 1 }).toArray();

            const recruitmentIds = [...new Set(orgJobs.map(job => new ObjectId(job.recruitmentId)))];

            aggregate.push({ $match: { _id: { $in: recruitmentIds }, status: 'ongoing' } });
        }
        if (page === 'home') {
            aggregate.push({ $sort: { updatedAt: -1 } }, { $limit: 6 });
        }
        else {
            aggregate.push({ $sort: { updatedAt: -1 } }, { $limit: 6 });
        }

        const recruitments = await db.collection('recruitments').aggregate(aggregate).toArray();
        if (!recruitments.length) return [];

        const recruitmentIds = recruitments.map(recruitment => recruitment._id.toString());
        const jobs = await db.collection('jobs').find({ recruitmentId: { $in: recruitmentIds } }).project({ orgId: 1, recruitmentId: 1, categories: 1, experience: 1 }).toArray();
        const orgIds = [...new Set(jobs.map(job => new ObjectId(job.orgId)))];
        const orgs = await db.collection('orgs').find({ _id: { $in: orgIds } }).project({ sector: 1 }).toArray();

        const finalRecruitmentsList = recruitments.map(recruitment => {
            const recruitmentJobs = jobs.filter(job => job.recruitmentId === recruitment._id.toString());
            const recruitmentOrgIds = recruitmentJobs.map(job => job.orgId);
            const recruitmentOrgs = orgs.filter(org => recruitmentOrgIds.includes(org._id.toString()));
            const sectors = [...new Set(recruitmentOrgs.flatMap(org => org.sector))].sort();
            const categories = [...new Set(recruitmentJobs.flatMap(job => job.categories))].sort();
            const minYears = Math.min([...recruitmentJobs.map(recJob => recJob.experience.minYears)]) || 0;
            const maxYears = Math.min([...recruitmentJobs.map(recJob => recJob.experience.maxYears)]) || 0;
            return { ...recruitment, experienceRange: { minYears, maxYears }, sectors, categories };
        })

        return JSON.parse(JSON.stringify(finalRecruitmentsList));

    } catch (error) {
        console.error("getRecruitments failed:", error);
        throw error;
    }
};

//For Recruitment Page
export async function getRecruitmentDetails(mdOrContent, recSlug, year, stageSlug) {
    try {
        const db = await connectDB();

        let projection = { recruiterId: 1, name: 1, year: 1 };

        if (mdOrContent === 'md') {
            projection = { ...projection, stages: { name: 1, slug: 1, status: 1 } }
        }
        else {
            projection = { ...projection, description: 1, location: 1, status: 1 };
            if (!year) {
                projection = stageSlug ? { ...projection, stages: 1 } : { ...projection, overview: 1 };
            }
        }

        const [recruitment, pastRecruitmentInfo] = await Promise.all([
            db.collection('recruitments').findOne({ slug: recSlug }, { projection }),
            year && db.collection('archives').findOne({ recruitmentSlug: recSlug, year })
        ]);
        if (!recruitment)
            return { status: 'invalid recruitment' }
        else if (year && !pastRecruitmentInfo)
            return { status: 'off year' };


        let finalDetails = recruitment;

        if (mdOrContent === 'content') {
            let content = '';
            if (year)
                content = pastRecruitmentInfo.content;
            else if (stageSlug) {

                const stage = recruitment.stages.find(s => s.slug === stageSlug);
                if (!stage)
                    return { status: 'invalid stage' };

                const { name, link, completedContent, pendingContent, status } = stage;

                if (status === 'not-reached')
                    return { status: 'not reached stage', recruitmentDetails: recruitment };

                const stageCard = generateStageCard(recruitment.name, name, link, status);

                if (status === 'pending')
                    content = pendingContent.replace('stage-card', stageCard);
                else if (status === 'ongoing' || status === 'completed')
                    content = completedContent.replace('stage-card', stageCard);
                else
                    return null;
            }
            else {
                const { status, overview: { pendingContent, completedContent } } = recruitment;

                if (status === 'pending')
                    content = pendingContent;
                else
                    content = completedContent;
            }

            finalDetails = { ...finalDetails, content };

        }

        const { _id, ...finalRecruitmentDetails } = finalDetails;

        return { status: 'found', recruitmentDetails: finalRecruitmentDetails };
    } catch (error) {
        console.error("getRecruitmentDetails failed:", error);
        throw error;
    }
};

//For Recruitment Page Sidebar
export async function getRecruitmentSidebarDetails(recSlug) {

    try {
        const db = await connectDB();
        const [recruitment, pastRecruitmentInfos] = await Promise.all([
            db.collection('recruitments').findOne(
                { slug: recSlug },
                { projection: { name: 1, year: 1, stages: { name: 1, slug: 1, status: 1 } } }
            ),
            db.collection('archives').find({ recruitmentSlug: recSlug }).sort({ year: -1 }).project({ year: 1 }).toArray()
        ])
        if (!recruitment)
            return null;

        const sidebarDetails = {
            stages: recruitment.stages,
            years: [
                recruitment.year,
                ...pastRecruitmentInfos.map(p => p.year)
            ]
        };

        return sidebarDetails;

    } catch (error) {
        console.error("getRecruitmentSidebarDetails failed:", error);
        throw error;
    }
};

//For Orgs Page
export async function getOrgs({ search, sector, type, page = 1 }) {

    let query = {};
    if (search) {
        const searchRegex = { $regex: search, $options: "i" };
        query.$or = [
            { name: searchRegex },
            { slug: searchRegex },
            { abbr: searchRegex }
        ];
    }
    if (sector)
        query.sector = { $regex: sector.replace('-', ' '), $options: "i" };
    if (type)
        query.isRecruitmentBody = type === 'rBody'

    try {
        const db = await connectDB();
        const res = await db.collection('orgs').aggregate([
            { $match: query },
            {
                $facet: {
                    metadata: [
                        { $count: "total" }
                    ],
                    data: [
                        { $sort: { name: 1 } },
                        { $skip: (page - 1) * ITEM_PER_PAGE },
                        { $limit: ITEM_PER_PAGE },
                        { $project: { name: 1, slug: 1, isRecruitmentBody: 1, description: 1, sector: 1, logoSrc: 1 } }
                    ]
                }
            }
        ]).next();

        const details = { itemCount: res.metadata[0]?.total ?? 0, orgs: res.data };

        return JSON.parse(JSON.stringify(details));

    } catch (error) {
        console.error(error);
        throw error;
    }
};

//For Orgs Page Sidebar
export async function getOrgsFilters() {
    try {
        const db = await connectDB()

        const orgs = await db.collection("orgs").find({}).project({ sector: 1 }).toArray();

        const sectors = [...new Set(orgs.flatMap(org => org.sector))].sort();

        return sectors;

    } catch (error) {
        console.error("getJobsFilters failed: ", error)
        return null
    }
}

//For Orgs Page Metadata
export async function getOrgsMetadata({ sector } = {}) {
    try {
        const db = await connectDB()

        const activeParams = sector ? ["sector"] : []

        const meta = await db.collection("metadata").findOne(
            { page: "orgs", params: activeParams },
            { projection: { title: 1, description: 1, _id: 0 } }
        )

        if (!meta)
            return {
                title: `Government Organisations | ${process.env.NEXT_PUBLIC_NAME}`,
                description: "Browse government organisations in India. Find PSUs, banks, defence, railways, and other govt organisations with their jobs and recruitments."
            }

        const displayParams = {
            sector: deslugify(sector),
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
            title: `Government Organisations | ${process.env.NEXT_PUBLIC_NAME}`,
            description: "Browse government organisations in India. Find PSUs, banks, defence, railways, and other govt organisations with their jobs and recruitments."
        }
    }
}

//For Org Page
export async function getOrgDetails(orgSlug) {

    try {
        const db = await connectDB();
        const org = await db.collection('orgs').findOne({ slug: orgSlug });
        if (!org)
            return null;
        const [tempRecruitments, ongoingRecruitments, tempJobs] = await Promise.all([
            db.collection("recruitments")
                .find({ recruiterId: org._id.toString() })
                .sort({ popularityScore: -1 })
                .limit(3)
                .project({ name: 1, fullName: 1, slug: 1, location: 1, vacancies: 1, registrationDeadline: 1, status: 1, stageStatus: 1 })
                .toArray(),
            getOngoingRecruitments('org', orgSlug),
            db.collection("jobs")
                .find({ orgId: org._id.toString() })
                .sort({ popularityScore: -1 })
                .limit(3)
                .project({ orgId: 1, name: 1, categories: 1, location: 1, experience: 1, payScale: 1 })
                .toArray()
        ]);

        const tempRecruitmentIds = tempRecruitments.map(rec => rec._id.toString());
        const jobs = await db.collection("jobs")
            .find({ recruitmentId: { $in: tempRecruitmentIds } })
            .project({ orgId: 1, recruitmentId: 1, categories: 1, experience: 1 })
            .toArray();

        const jobOrgIds = jobs.map(job => new ObjectId(job.orgId));
        const orgs = await db.collection("orgs")
            .find({ _id: { $in: jobOrgIds } })
            .project({ name: 1, abbr: 1, sector: 1, logoSrc: 1 })
            .toArray();

        const popularJobs = tempJobs.map(job => {
            const jobOrg = orgs.find(org => org._id.toString() === job.orgId);
            const { name: orgName, abbr: orgAbbr, logoSrc: orgLogo, sector: orgSectors } = jobOrg;
            return { ...job, orgName, orgAbbr, orgSectors, orgLogo }
        })

        const topRecruitments = tempRecruitments.map(recruitment => {
            const recruitmentJobs = jobs.filter(job => job.recruitmentId === recruitment._id.toString());
            const recruitmentOrgIds = recruitmentJobs.map(job => job.orgId);
            const recruitmentOrgs = orgs.filter(org => recruitmentOrgIds.includes(org._id.toString()));
            const sectors = [...new Set(recruitmentOrgs.flatMap(org => org.sector))].sort();
            const categories = [...new Set(recruitmentJobs.flatMap(job => job.categories))].sort();
            const minYears = Math.min([...recruitmentJobs.map(recJob => recJob.experience.minYears)]) || 0;
            const maxYears = Math.min([...recruitmentJobs.map(recJob => recJob.experience.maxYears)]) || 0;
            return { ...recruitment, experienceRange: { minYears, maxYears }, sectors, categories };
        })
        const orgDetails = { ...org, popularJobs, topRecruitments, ongoingRecruitments };
        return JSON.parse(JSON.stringify(orgDetails));

    } catch (error) {
        console.error("getOrgs failed:", error);
        throw error;
    }
};

//For Jobs Page
export async function getJobs({ search, org, rStatus, sector, cat, qualification, expLvl, location, page = 1 } = {}) {

    let query = {};
    if (search) {
        const searchRegex = { $regex: search, $options: "i" };
        query.$or = [
            { name: searchRegex },
            { slug: searchRegex }
        ];
    }
    if (cat) {
        const modifiedCat = cat.replace(/-/g, " ");
        query.categories = { $regex: modifiedCat, $options: "i" };
    }
    if (qualification)
        query['education.level'] = new RegExp(qualification.replace(/-/g, " "), 'i');
    if (expLvl) {
        query['experience.minYears'] = expLvl === 'experienced' ? { $gt: 0 } : 0;
    }

    try {
        const db = await connectDB();
        if (location) {
            if (location === 'all-india')
                query = { ...query, 'location.scope': 'all_india' };
            else if (location === 'worldwide')
                query = { ...query, 'location.scope': 'international' };
            else {
                const state = await db.collection('states').findOne({ slug: location });
                if (!state) {
                    console.warn(`getRecruitments: no state found for slug "${location}"`);
                    return [];
                }
                query['location.state'] = state.name;
            }
        }


        if (org) {
            const orgDetails = await db.collection('orgs').findOne({ slug: org }, { projection: { _id: 1 } });
            if (!orgDetails)
                return [];
            query.orgId = orgDetails._id.toString();
        }
        else if (sector) {
            const orgs = await db.collection("orgs")
                .find({ sector: { $regex: sector.replace("-", " "), $options: "i" } })
                .project({ _id: 1 })
                .toArray();
            const orgIds = orgs.map(org => org._id.toString());
            query.orgId = { $in: orgIds };
        }

        const recruitmentFilter = { _id: 1, slug: 1, status: 1 };
        const recruitments = await db.collection('recruitments')
            .find(rStatus ? { status: rStatus } : {})
            .project(recruitmentFilter)
            .toArray();

        if (rStatus) {
            query.recruitmentId = { $in: recruitments.map(r => r._id.toString()) };
        }

        const res = await db.collection('jobs').aggregate([
            { $match: query },
            {
                $facet: {
                    metadata: [
                        { $count: "total" }
                    ],
                    data: [
                        { $sort: { popularityScore: -1 } },
                        { $skip: (page - 1) * ITEM_PER_PAGE },
                        { $limit: ITEM_PER_PAGE },
                        { $project: { orgId: 1, recruitmentId: 1, name: 1, slug: 1, categories: 1, location: 1, experience: 1, payScale: 1 } }
                    ]
                }
            }
        ]).next();

        if (res.data.length === 0)
            return { itemCount: 0, jobs: res.data };

        const orgIds = [...new Set(res.data.map(j => j.orgId))];

        const orgs = await db.collection('orgs')
            .find({ _id: { $in: orgIds.map(id => ObjectId.createFromHexString(id)) } })
            .project({ name: 1, abbr: 1, sector: 1, logoSrc: 1 })
            .toArray();

        const jobs = res.data.map(job => {
            const { _id, ...rest } = job;
            const orgDetails = orgs.find(org => org._id.toString() === job.orgId);
            if (!orgDetails)
                return null;
            const { name: orgName, abbr: orgAbbr, logoSrc: orgLogo, sector: orgSectors } = orgDetails;
            const recruitmentDetails = recruitments.find(recruitment => recruitment._id.toString() === job.recruitmentId);
            if (!recruitmentDetails)
                return null;
            const { slug: recruitmentSlug, status: recruitmentStatus } = recruitmentDetails;
            return { ...rest, orgName, orgAbbr, orgSectors, orgLogo, recruitmentSlug, recruitmentStatus: rStatus || recruitmentStatus };
        }).filter(Boolean);

        const details = { itemCount: res.metadata[0].total, jobs };

        return JSON.parse(JSON.stringify(details));

    } catch (error) {
        console.error(error);
        throw error;
    }
};

//For Jobs Page Sidebar
export async function getJobsFilters() {

    try {
        const db = await connectDB()

        const [orgs, categories, qualifications, expLvls, states, rStatuses] = await Promise.all([
            db.collection("orgs").find({}).project({ name: 1, slug: 1, sector: 1 }).toArray(),
            db.collection("jobs").distinct("categories"),
            db.collection("jobs").distinct("education.level"),
            db.collection("jobs").distinct("experience.level"),
            db.collection("jobs").distinct("location.state", { "location.scope": "state" }),
            db.collection("recruitments").distinct("status")
        ])

        const sectors = [...new Set(orgs.flatMap(org => org.sector))].sort();

        const details = {
            orgs,
            sectors,
            categories,
            qualifications,
            expLvls,
            states: states.filter(Boolean).sort(),
            rStatuses
        }

        return JSON.parse(JSON.stringify(details));

    } catch (error) {
        console.error("getJobsFilters failed: ", error)
        return null
    }
}

//For Jobs Page Metadata
export async function getJobsMetadata({ org, rStatus, sector, cat, qualification, expLvl, location } = {}) {
    try {
        const db = await connectDB()

        const allParams = { org, rStatus, sector, cat, qualification, expLvl, location }

        // Build active params array — sorted alphabetically
        const activeParams = Object.entries(allParams)
            .filter(([_, value]) => value)
            .map(([key]) => key)
            .sort()

        const meta = await db.collection("metadata").findOne(
            { page: "jobs", params: activeParams },
            { projection: { title: 1, description: 1, _id: 0 } }
        )

        if (!meta)
            return {
                title: `Government Jobs | ${process.env.NEXT_PUBLIC_NAME}`,
                description: "Browse all government job roles across central, state, PSU, banking, defence, railways, and more. Find eligibility, responsibilities, and perks for every govt post."
            }

        // Prepare display-ready values
        const orgName = org ? await getNameFromSlug("orgs", org) : null
        const rStatusLabel = {
            "ongoing": "Ongoing",
            "pending": "Upcoming",
            "completed": "Completed"
        }[rStatus] ?? null

        const displayParams = {
            org: orgName,
            sector: deslugify(sector),
            cat: deslugify(cat),
            rStatus: rStatusLabel,
            qualification: {
                "10th": "10th Pass",
                "12th": "10th Pass",
                "graduation": "Graduates",
                "post-graduation": "Post-Graduates",
                "phd": "PhD Holders"
            }[qualification],
            expLvl: deslugify(expLvl),
            location: deslugify(location),
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
            title: `Government Jobs | ${process.env.NEXT_PUBLIC_NAME}`,
            description: "Browse all government job roles across central, state, PSU, banking, defence, railways, and more. Find eligibility, responsibilities, and perks for every govt post."
        }
    }
}

//For Home Page
export async function getPopularJobs() {

    try {
        const db = await connectDB();
        // const sectorWisePopularJobs = await db.collection('jobs').aggregate([
        //     { $sort: { sector: 1, popularityScore: -1 } },
        //     {
        //         $group: {
        //             _id: "$sector",
        //             jobs: { $push: "$$ROOT" }
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             sector: "$_id",
        //             jobs: { $slice: ["$jobs", 6] }
        //         }
        //     }
        // ]).toArray();
        // const jobsList = sectorWisePopularJobs.flatMap(jList => jList.jobs);
        const jobsList = await db.collection('jobs')
            .find({})
            .sort({ popularityScore: -1 })
            .limit(6)
            .project({ orgId: 1, name: 1, slug: 1, categories: 1, location: 1, experience: 1, payScale: 1 })
            .toArray();

        const orgIds = [...new Set(jobsList.map(j => j.orgId))];
        const orgs = await db.collection('orgs')
            .find({ _id: { $in: orgIds.map(id => new ObjectId(id)) } })
            .project({ name: 1, sector: 1, logoSrc: 1 })
            .toArray();

        const allPopularJobs = jobsList.map(job => {
            const { _id, ...rest } = job;
            const org = orgs.find(o => o._id.toString() === job.orgId);
            const { name: orgName, logoSrc: orgLogo, sector } = org;
            return { ...rest, orgName, orgLogo, orgSectors: sector };
        });
        return allPopularJobs;
    } catch (error) {
        console.error("getPopularJobs failed:", error);
        throw error;
    }
};

//For Job and JobNav page's metadata and for Job page's JSON-LD
export async function getJobDetails(jobSlug) {

    try {
        const db = await connectDB();
        const jobDetails = await db.collection('jobs')
            .findOne(
                { slug: jobSlug },
                { projection: { orgId: 1, name: 1, description: 1, categories: 1, location: 1, education: 1, payScale: 1 } }
            );
        if (!jobDetails)
            return null;
        const org = await db.collection("orgs").findOne({ _id: new ObjectId(jobDetails.orgId) }, { projection: { name: 1, sector: 1 } });
        let formattedEducation = formatEducation(jobDetails.education)
        let formattedLocation = formatLocation(jobDetails.location);
        return JSON.parse(JSON.stringify({ ...jobDetails, org: org.name, location: formattedLocation, education: formattedEducation, sectors: org.sector }));

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getJobContent(jobSlug, jobNavSlug) {

    const dbKey = jobNavSlug?.split('-').map((word, index) => {
        if (index > 0)
            return capitalize(word);
        return word;
    }).join('');

    try {
        const db = await connectDB();
        let projection = jobNavSlug ? { [dbKey]: 1 } : { overview: 1 };
        const jobDetails = await db.collection('jobs').findOne({ slug: jobSlug }, { projection });

        if (!jobDetails)
            return null;

        if (!jobNavSlug)
            return jobDetails.overview;

        if (!jobDetails[dbKey])
            return null;

        return jobDetails[dbKey];

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getJobRecruitmentDetails(jobSlug) {

    try {
        const db = await connectDB();
        const jobDetails = await db.collection('jobs').findOne({ slug: jobSlug }, { projection: { orgId: 1, recruitmentId: 1, name: 1, description: 1, jobType: 1, location: 1 } });
        if (!jobDetails)
            return null;
        const recruitmentDetails = await db.collection('recruitments')
            .findOne({ _id: new ObjectId(jobDetails.recruitmentId) }, { projection: { recruiterId: 1, name: 1, slug: 1, year: 1, registrationDeadline: 1, status: 1 } });

        const { recruiterId, name, slug, year, registrationDeadline, status } = recruitmentDetails;

        const orgDetails = await db.collection('orgs')
            .findOne({ _id: new ObjectId(recruiterId) }, { projection: { name: 1, abbr: 1 } })

        const recruiterName = `${orgDetails.name}${orgDetails.abbr ? ` (${orgDetails.abbr})` : ''}`;

        const pastCycles = await db.collection('archives')
            .find({ recruitmentSlug: slug })
            .sort({ year: -1 })
            .limit(5)
            .toArray();

        const finalJobDetails = { ...jobDetails, location: formatLocation(jobDetails.location), recruiterName, recName: name, recSlug: slug, recYear: year, registrationDeadline, recStatus: status, pastCycles }
        return JSON.parse(JSON.stringify(finalJobDetails));

    } catch (error) {
        console.error("getJobRecruitmentDetails failed: ", error);
    }
}

export async function getJobSidebarFields(jobSlug) {
    try {
        const db = await connectDB();
        const jobDetails = await db.collection('jobs').findOne({ slug: jobSlug });
        if (!jobDetails)
            return null;

        const fields = [
            'overview',
            'eligibilityCriteria',
            'responsibilities',
            'perks',
            'physicalStandards',
            'medicalStandards',
            'recruitmentDetails'
        ]

        const availableFields = Object.keys(jobDetails).filter(field => fields.includes(field));

        return availableFields;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getRecruiters() {


    try {
        const db = await connectDB();
        const res = await db.collection('recruiters').find().toArray();
        if (res.length === 0)
            return [];

        const refObjectIds = res.map(recruiter => ObjectId.createFromHexString(recruiter.refId));

        const orgs = await db.collection('orgs')
            .find({ _id: { $in: refObjectIds } })
            .project({ name: 1, slug: 1 })
            .toArray();

        const recruitmentBodies = await db.collection('recruitment-bodies')
            .find({ _id: { $in: refObjectIds } })
            .project({ name: 1, slug: 1 })
            .toArray();

        const recruiters = res.map(recruiter => {
            const recruiterDetails = recruiter.recruiterType === 'org'
                ? orgs.find(org => org._id.toString() === recruiter.refId)
                : recruitmentBodies.find(rBody => rBody._id.toString() === recruiter.refId);

            if (!recruiterDetails) return null;
            return { ...recruiter, name: recruiterDetails.name, slug: recruiterDetails.slug };
        }).filter(Boolean);

        return JSON.parse(JSON.stringify(recruiters));

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getQuickLinks(search) {

    // 
    // 

    let query = {};
    if (search) {
        query.name = { $regex: search, $options: "i" }
    }

    try {
        const db = await connectDB();
        const res = await db.collection('quick-links').find(query).sort({ name: 1 }).toArray();
        return JSON.parse(JSON.stringify(res));

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
        case 'orgs':
        case 'recruitment-bodies':
            projection = { slug: 1, sector: 1, updatedAt: 1, _id: 0 };
            break;
        case 'recruitments':
            projection = { recruiterId: 1, slug: 1, updatedAt: 1, year: 1, status: 1, stages: { slug: 1, status: 1 }, _id: 0 };
            break;
        case 'archives':
            projection = { recruitmentSlug: 1, year: 1, updatedAt: 1, _id: 0 };
            break;
    }

    try {
        const db = await connectDB();
        const slugs = await db.collection(collectionName).find().project(projection).toArray();
        return slugs;
    } catch (error) {
        return [];
    }
}

export async function getNameFromSlug(collectionName, slug) {

    try {
        const db = await connectDB();
        const doc = await db.collection(collectionName).findOne({ slug: slug }, { projection: { name: 1 } });
        if (!doc)
            return null;
        return doc.name;
    } catch (error) {

    }
}

export function generateStageCard(recName, stage, link, status) {

    let stageCard = '';

    if (stage === "Notification") {
        if (status === "completed")
            stageCard =
                `<div class="stage-card">
            <p class="stage-label">${stage}</p>
            <a href="${link}" target="_blank">
              <div class="link-btn">View Notification PDF</div>
            </a>
            <p class="cms-note">Check the details carefully before applying.</p>
          </div>`
        else
            stageCard =
                `<div class="stage-card">
            <p class="stage-label">Notification</p>
            <div class="link-btn-disabled">View Notification PDF</div>
            <p class="cms-note">The official notification PDF link will be activated once released.</p>
          </div>`;
    }
    else if (stage === "Registration") {
        if (recName === "IIFCL AGM") {
            stageCard = status === "pending" ?
                `<div class="stage-card">
                <p class="stage-label">${stage}</p>
                <div class="link-btn-disabled">Download Application Form</div>
                <p class="cms-note">The link will be activated once registration begins.</p>
            </div>` :
                status === "ongoing" ?
                    `<div class="stage-card">
                <p class="stage-label">${stage}</p>
                <a href="${link}" target="_blank">
                <div class="link-btn">Download Application Form</div>
                </a>
                <p class="cms-note">Complete your registration before the last date.</p>
            </div>` :
                    `<div class="stage-card">
                <p class="stage-label">${stage}</p>
                <div class="link-btn-disabled">Download Application Form</div>
                <p class="cms-note">The registration process has now closed.</p>
            </div>`;
        }
        else {
            stage = status === "pending" ?
                `<div class="stage-card">
                <p class="stage-label">${stage}</p>
                <div class="link-btn-disabled">Apply Online</div>
                <p class="cms-note">The link will be activated once registration begins.</p>
            </div>` :
                status === "ongoing" ?
                    `<div class="stage-card">
                <p class="stage-label">${stage}</p>
                <a href="${link}" target="_blank">
                <div class="link-btn">Apply Online</div>
                </a>
                <p class="cms-note">Complete your registration before the last date.</p>
            </div>` :
                    `<div class="stage-card">
                <p class="stage-label">${stage}</p>
                <div class="link-btn-disabled">Apply Online</div>
                <p class="cms-note">The registration process has now closed.</p>
            </div>`;
        }
    }
    else if (stage.includes("Admit Card")) {
        stageCard = status === "pending" ?
            `<div class="stage-card">
                <p class="stage-label">${stage}</p>
                <div class="link-btn-disabled">Download Admit Card</div>
                <p class="cms-note">The link will be activated once registration begins.</p>
            </div>` :
            status === "ongoing" ?
                `<div class="stage-card">
                    <p class="stage-label">${stage}</p>
                    <a href="${link}" target="_blank">
                        <div class="link-btn">Download Admit Card</div>
                    </a>
                    <p class="cms-note">Download your admit card using the above link.</p>
                </div>` :
                `<div class="stage-card">
                    <p class="stage-label">${stage}</p>
                    <div class="link-btn-disabled">Download Admit Card</div>
                    <p class="cms-note">The admit card link has expired.</p>
                </div>`;
    }
    else if (stage.includes("Result")) {
        stageCard = status === "pending" ?
            `<div class="stage-card">
                <p class="stage-label">Online Test</p>
                <div class="link-btn-disabled">Check Result</div>
                <p class="cms-note">The result link will be activated once declared.</p>
            </div>` :
            `<div class="stage-card">
                <p class="stage-label">${stage}</p>
                <a href="${link}" target="_blank">
                    <div class="link-btn">Check Result</div>
                </a>
                <p class="cms-note">Use your registration details to check your result.</p>
            </div>`;
    }
    else if (stage.includes("Call Letter")) {
        stageCard = status === "pending" ?
            `<div class="stage-card">
                    <p class="stage-label">${stage}</p>
                    <div class="link-btn-disabled">Download Call Letter</div>
                    <p class="cms-note">The link will be activated once the call letter is released.</p>
                </div>` :
            status === "ongoing" ?
                `<div class="stage-card">
                        <p class="stage-label">${stage}</p>
                        <a href="${link}" target="_blank">
                            <div class="link-btn">Download Call Letter</div>
                        </a>
                        <p class="cms-note">Download your call letter using the above link.</p>
                    </div>` :
                `<div class="stage-card">
                        <p class="stage-label">${stage}</p>
                        <div class="link-btn-disabled">Download Call Letter</div>
                        <p class="cms-note">The call letter link has expired.</p>
                    </div>`;
    }

    return stageCard;
}
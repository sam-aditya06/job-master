import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "./dbConfig";
import { ObjectId } from "mongodb";
import { capitalize, formatLocation } from "./utils";

const ITEM_PER_PAGE = 8;

//For Job and Recruitment Filters
export async function getStates() {
    'use cache';
    cacheLife('hours');

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
export async function getRecruitments({ search, forSlug, bySlug, status, sector, qualification, expLvl, location, page = 1 } = {}) {

    'use cache';
    cacheLife('hours');

    let query = {};

    if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        query.$or = [
            { name: searchRegex },
            { slug: searchRegex },
            { abbr: searchRegex },
            { keywords: searchRegex },
        ];
    }
    if (sector)
        query.sector = sector;
    if (qualification)
        query.qualifications = new RegExp(qualification, 'i');
    if (status)
        query.status = status;
    if (expLvl) {
        query['experienceRange.minYears'] = expLvl === 'experienced' ? { $gt: 0 } : 0;
    }

    try {
        const db = await connectDB();
        if (location) {
            if (location === 'all-india')
                query = { ...query, 'location.isAllIndia': true };
            else {
                const state = await db.collection('states').findOne({ slug: location });
                if (!state) {
                    console.warn(`getRecruitments: no state found for slug "${location}"`);
                    return [];
                }
                query['location.state'] = state.name;
            }
        }
        if (bySlug) {
            const org = await db.collection('orgs').findOne({ slug: bySlug });
            const rBody = await db.collection('recruitment-bodies').findOne({ slug: bySlug });

            const entity = org ?? rBody;
            if (!entity) {
                console.warn(`getRecruitments: no org or recruitment-body found for slug "${bySlug}"`);
                return [];
            }

            const recruiter = await db.collection('recruiters').findOne({ refId: entity._id.toString() });
            if (!recruiter) {
                console.warn(`getRecruitments: no recruiter found for refId "${entity._id}"`);
                return [];
            }
            query.recruiterId = recruiter._id.toString();
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
                        { $limit: ITEM_PER_PAGE }
                    ]
                }
            }
        ]).next();

        const { metadata, data: recruitments } = recruitmentsInfo;

        if (recruitments.length === 0)
            return { itemCount: 0, recruitments };

        const recruitmentIds = recruitments.map((r) => r._id.toString());

        const jobs = await db.collection('jobs').find({
            recruitmentId: { $in: recruitmentIds },
        }).project({ orgId: 1, recruitmentId: 1, experience: 1 }).toArray();

        let recruitmentsList;

        if (forSlug) {

            const org = await db.collection('orgs').findOne({ slug: forSlug });
            if (!org) {
                console.warn(`getRecruitments: no org found for forSlug "${forSlug}"`);
                return [];
            }

            const matchedJobs = jobs.filter(recJob => recJob.orgId === org._id.toString());

            const recruitmentIdsWithJobs = new Set(matchedJobs.map((j) => j.recruitmentId));

            recruitmentsList = recruitments.filter((r) =>
                recruitmentIdsWithJobs.has(r._id.toString())
            )
        }
        else
            recruitmentsList = recruitments;

        const finalRecruitmentsList = recruitmentsList.map(recruitment => {
            const recruitmentJobs = jobs.filter(job => job.recruitmentId === recruitment._id.toString());
            const minYears = Math.min([...recruitmentJobs.map(recJob => recJob.experience.minYears)]) || 0;
            const maxYears = Math.min([...recruitmentJobs.map(recJob => recJob.experience.maxYears)]) || 0;
            return { ...recruitment, experienceRange: { minYears, maxYears } };
        });

        const details = { itemCount: forSlug ? finalRecruitmentsList.length : metadata[0].total, recruitments: finalRecruitmentsList };

        return JSON.parse(JSON.stringify(details));

    } catch (error) {
        console.error("getRecruitments failed:", error);
        throw error;
    }
};

export async function getRecruiterFromId(recruiterId) {
    try {
        const db = await connectDB();
        const recruiter = await db.collection('recruiters').findOne(
            { _id: ObjectId.createFromHexString(recruiterId) }
        )
        if (!recruiter) return null;

        const collection = recruiter.recruiterType === 'org' ? 'orgs' : 'recruitment-bodies'
        const entity = await db.collection(collection).findOne(
            { _id: ObjectId.createFromHexString(recruiter.refId) },
            { projection: { name: 1, slug: 1, abbr: 1, _id: 0 } }
        )

        if (!entity) {
            console.warn(`getRecruiterFromId: no entity found for recruiterId ${recruiterId}`)
            return null
        }

        return entity;

    } catch (error) {
        return null
    }
}

export async function getRecruiterNameFromSlug(slug) {
    try {
        const db = await connectDB();
        const org = await db.collection('orgs').findOne({ slug: slug });
        const rBody = await db.collection('recruitment-bodies').findOne({ slug: slug });

        const entity = org ?? rBody;
        if (!entity) {
            console.warn(`getRecruiterName: invalid recruiter id`);
            return null;
        }
        return entity.name;

    } catch (error) {

    }
}

//For Home Page, Org Page and Recruitment body page
export async function getOngoingRecruitments(page, orgSlug, rBodySlug) {

    'use cache';
    cacheLife('hours');

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

            const recruitmentIds = [...new Set(orgJobs.map(job => job.recruitmentId))];

            aggregate.push({ $match: { _id: { $in: recruitmentIds }, status: 'ongoing' } });
        }
        else if (page === 'rBody') {
            if (!rBodySlug)
                return [];
            const rBody = await db.collection('recruitment-bodies').findOne({ slug: rBodySlug });
            const recruiter = await db.collection('recruiters').findOne({ refId: rBody._id.toString() });
            aggregate.push({ $match: { recruiterId: recruiter._id.toString(), status: 'ongoing' } });

        }
        if (page === 'home') {
            // aggregate.push(
            // { $sort: { sector: 1, statusOrder: 1, updatedAt: -1 } },
            // {
            //         $group: {
            //             _id: "$sector",
            //             recruitments: { $push: "$$ROOT" }
            //         }
            //     },
            //     {
            //         $project: {
            //             _id: 0,
            //             sector: "$_id",
            //             recruitments: { $slice: ["$recruitments", 6] }
            //         }
            // }
            // );
            aggregate.push({ $sort: { updatedAt: -1 } }, { $limit: 6 });
        }
        else {
            aggregate.push({ $sort: { updatedAt: -1 } }, { $limit: 6 });
        }

        const recruitments = await db.collection('recruitments').aggregate(aggregate).toArray();
        if (!recruitments.length) return [];

        const recruitmentIds = recruitments.map(recruitment => recruitment._id.toString());
        const jobs = await db.collection('jobs').find({ recruitmentId: { $in: recruitmentIds } }).project({ recruitmentId: 1, experience: 1 }).toArray();

        const finalRecruitmentsList = recruitments.map(recruitment => {
            const recruitmentJobs = jobs.filter(job => job.recruitmentId === recruitment._id.toString());
            const minYears = Math.min([...recruitmentJobs.map(recJob => recJob.experience.minYears)]) || 0;
            const maxYears = Math.min([...recruitmentJobs.map(recJob => recJob.experience.maxYears)]) || 0;
            return { ...recruitment, experienceRange: { minYears, maxYears } };
        })

        return JSON.parse(JSON.stringify(finalRecruitmentsList));

    } catch (error) {
        console.error("getRecruitments failed:", error);
        throw error;
    }
};

//For Recruitment Page
export async function getRecruitmentDetails(mdOrContent, recSlug, year, stageSlug) {

    'use cache';
    year ? cacheLife('max') : cacheLife('hours');

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
        if (!recruitment || (year && !pastRecruitmentInfo))
            return null;


        let finalDetails = recruitment;

        if (mdOrContent === 'content') {
            let content = '';
            if (year)
                content = pastRecruitmentInfo.content;
            else if (stageSlug) {

                const stage = recruitment.stages.find(s => s.slug === stageSlug);
                if (!stage)
                    return null;

                const { name, link, completedContent, pendingContent, status } = stage;

                const stageCard = generateStageCard(name, link, status);

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

        return finalRecruitmentDetails;
    } catch (error) {
        console.error("getRecruitmentDetails failed:", error);
        throw error;
    }
};

//For the Recruitment Page's Sidebar
export async function getRecruitmentSidebarDetails(recSlug) {

    'use cache';
    cacheLife('hours');

    try {
        const db = await connectDB();
        const recruitment = await db.collection('recruitments').findOne(
            { slug: recSlug },
            { projection: { name: 1, year: 1, stages: { name: 1, slug: 1, status: 1 } } }
        );
        if (!recruitment)
            return null;

        const pastRecruitmentInfos = await db.collection('archives').find({ recruitmentSlug: recruitment.slug }).project({ year: 1 }).toArray();
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
export async function getOrgs({ search, sector, page }) {

    'use cache';
    cacheLife('hours');

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
        query.sector = sector;

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
                        ...(page ? [
                            { $skip: (page - 1) * ITEM_PER_PAGE },
                            { $limit: ITEM_PER_PAGE }
                        ] : [])
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

//For Org Page
export async function getOrgDetails(orgSlug) {

    'use cache';
    cacheLife('hours');

    try {
        const db = await connectDB();
        const org = await db.collection('orgs').findOne({ slug: orgSlug });
        if (!org)
            return null;
        const ongoingRecruitments = await getOngoingRecruitments('org', orgSlug);
        const { jobs: popularJobs } = await getJobs({ orgSlug: org.slug });
        const orgDetails = ongoingRecruitments.length > 0 ? { ...org, popularJobs, ongoingRecruitments } : { ...org, popularJobs };
        return JSON.parse(JSON.stringify(orgDetails));

    } catch (error) {
        console.error("getOrgs failed:", error);
        throw error;
    }
};

//For Recruitment bodies page
export async function getRecruitmentBodies({ search, sector, page = 1 }) {

    'use cache';
    cacheLife('hours');
    cacheTag('recruitment-bodies');

    console.log('CACHE MISS - DB hit at:', new Date().toISOString());

    let query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
            { abbr: { $regex: search, $options: "i" } }
        ];
    }
    if (sector)
        query.sector = sector;

    try {
        const db = await connectDB();
        const res = await db.collection('recruitment-bodies').aggregate([
            { $match: query },
            {
                $facet: {
                    metadata: [
                        { $count: "total" }
                    ],
                    data: [
                        { $sort: { name: 1 } },
                        { $skip: (page - 1) * ITEM_PER_PAGE },
                        { $limit: ITEM_PER_PAGE }
                    ]
                }
            }
        ]).next();

        const details = { itemCount: res.metadata[0]?.total ?? 0, recruitmentBodies: res.data };

        return JSON.parse(JSON.stringify(details));

    } catch (error) {
        console.error('getRecruitmentBodies error:', error);
        throw error;
    }
};

//For Recruitment body page
export async function getRecruitmentBodyDetails(rBodySlug) {

    'use cache';
    cacheLife('hours');

    try {
        const db = await connectDB();
        const rBody = await db.collection('recruitment-bodies').findOne({ slug: rBodySlug });
        if (!rBody)
            return null;

        const recruiter = await db.collection('recruiters').findOne({ refId: rBody._id.toString() });
        const [topRecruitments, ongoingRecruitments] = await Promise.all([
            db.collection('recruitments').find({ recruiterId: recruiter._id.toString() }).toArray(),
            getOngoingRecruitments('rBody', null, rBodySlug)
        ])

        const topRecruitmentIds = topRecruitments.map((r) => r._id.toString());
        const ongoingRecruitmentIds = ongoingRecruitments.map((r) => r._id.toString());

        const jobs = await db.collection('jobs').find({
            recruitmentId: { $in: [...topRecruitmentIds, ...ongoingRecruitmentIds] },
        }).project({ orgId: 1, recruitmentId: 1, experience: 1 }).toArray();

        const finalTopRecruitmentsList = topRecruitments.map(recruitment => {
            const recruitmentJobs = jobs.filter(job => job.recruitmentId === recruitment._id.toString());
            const minYears = Math.min([...recruitmentJobs.map(recJob => recJob.experience.minYears)]) || 0;
            const maxYears = Math.min([...recruitmentJobs.map(recJob => recJob.experience.maxYears)]) || 0;
            return { ...recruitment, experienceRange: { minYears, maxYears } };
        });
        const finalOngoingRecruitmentsList = topRecruitments.map(recruitment => {
            const recruitmentJobs = jobs.filter(job => job.recruitmentId === recruitment._id.toString());
            const minYears = Math.min([...recruitmentJobs.map(recJob => recJob.experience.minYears)]) || 0;
            const maxYears = Math.min([...recruitmentJobs.map(recJob => recJob.experience.maxYears)]) || 0;
            return { ...recruitment, experienceRange: { minYears, maxYears } };
        });
        const rBodyDetails = ongoingRecruitments.length > 0 ?
            {
                ...rBody,
                topRecruitments: finalTopRecruitmentsList,
                ongoingRecruitments: finalOngoingRecruitmentsList
            } :
            {
                ...rBody,
                topRecruitments: finalTopRecruitmentsList
            };
        return JSON.parse(JSON.stringify(rBodyDetails));

    } catch (error) {
        console.error("getOrgs failed:", error);
        throw error;
    }
};

//For Jobs Page
export async function getJobs({ search, orgSlug, rStatus, sector, qualification, expLvl, location, page = 1 } = {}) {
    'use cache';
    cacheLife('hours');

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
        query.sector = sector;
    if (qualification)
        query['education.level'] = new RegExp(qualification, 'i');
    if (expLvl) {
        query['experience.minYears'] = expLvl === 'experienced' ? { $gt: 0 } : 0;
    }

    try {
        const db = await connectDB();
        if (location) {
            if (location === 'all-india')
                query = { ...query, 'location.isAllIndia': true };
            else {
                const state = await db.collection('states').findOne({ slug: location });
                if (!state) {
                    console.warn(`getRecruitments: no state found for slug "${location}"`);
                    return [];
                }
                query['location.state'] = state.name;
            }
        }


        if (orgSlug) {
            const org = await db.collection('orgs').findOne({ slug: orgSlug }, { projection: { _id: 1 } });
            if (!org)
                return [];
            query.orgId = org._id.toString();
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
                        { $project: { orgId: 1, recruitmentId: 1, name: 1, slug: 1, abbr: 1, sector: 1, location: 1, experience: 1, payScale: 1 } }
                    ]
                }
            }
        ]).next();

        if (res.data.length === 0)
            return { itemCount: 0, jobs: res.data };

        const orgIds = [...new Set(res.data.map(j => j.orgId))];

        const orgs = await db.collection('orgs')
            .find({ _id: { $in: orgIds.map(id => ObjectId.createFromHexString(id)) } })
            .project({ name: 1, abbr: 1, logoSrc: 1 })
            .toArray();

        const jobs = res.data.map(job => {
            const { _id, ...rest } = job;
            const orgDetails = orgs.find(org => org._id.toString() === job.orgId);
            if (!orgDetails)
                return null;
            const { name: orgName, abbr: orgAbbr, logoSrc: orgLogo } = orgDetails;
            const recruitmentDetails = recruitments.find(recruitment => recruitment._id.toString() === job.recruitmentId);
            if (!recruitmentDetails)
                return null;
            const { slug: recruitmentSlug, status: recruitmentStatus } = recruitmentDetails;
            return { ...rest, orgName, orgAbbr, orgLogo, recruitmentSlug, recruitmentStatus: rStatus || recruitmentStatus };
        }).filter(Boolean);

        const details = { itemCount: res.metadata[0].total, jobs };

        return JSON.parse(JSON.stringify(details));

    } catch (error) {
        console.error(error);
        throw error;
    }
};

//For Home Page
export async function getPopularJobs() {

    'use cache';
    cacheLife('hours');

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
            .project({ orgId: 1, name: 1, slug: 1, abbr: 1, sector: 1, location: 1, experience: 1, payScale: 1 })
            .toArray();

        const orgIds = [...new Set(jobsList.map(j => j.orgId))];
        const orgs = await db.collection('orgs')
            .find({ _id: { $in: orgIds.map(id => new ObjectId(id)) } })
            .project({ name: 1, logoSrc: 1 })
            .toArray();

        const allPopularJobs = jobsList.map(job => {
            const { _id, ...rest } = job;
            const org = orgs.find(o => o._id.toString() === job.orgId);
            const { name: orgName, logoSrc: orgLogo } = org;
            return { ...rest, orgName, orgLogo };
        });
        return allPopularJobs;
    } catch (error) {
        console.error("getPopularJobs failed:", error);
        throw error;
    }
};

export function formatEducation(education) {
    const required = education.filter(e => e.isRequired)
    const levels = [...new Set(required.map(e => e.level))]

    if (levels.length === 0) return null
    if (levels.length === 1) return levels[0]  // "Graduation"

    // e.g. "Graduation / PG" or "10th / ITI / Diploma"
    return levels.join(" / ")
}

//For Job and JobNav page's metadata and for Job page's JSON-LD
export async function getJobDetails(jobSlug) {

    'use cache';
    cacheLife('hours');

    try {
        const db = await connectDB();
        const jobDetails = await db.collection('jobs')
            .findOne(
                { slug: jobSlug },
                { projection: { orgId: 1, name: 1, description: 1, sector: 1, location: 1, education: 1, payScale: 1 } }
            );
        if (!jobDetails)
            return null;
        const org = await db.collection('orgs').findOne({ _id: new ObjectId(jobDetails.orgId) }, { projection: { name: 1 } });
        let formattedEducation = formatEducation(jobDetails.education)
        let formattedLocation = formatLocation(jobDetails.location, jobDetails.sector);
        return JSON.parse(JSON.stringify({ ...jobDetails, location: formattedLocation, education: formattedEducation, org: org.name }));

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getJobContent(jobSlug, jobNavSlug) {

    'use cache';
    cacheLife('hours');

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
    'use cache';
    cacheLife('hours');

    try {
        const db = await connectDB();
        const jobDetails = await db.collection('jobs').findOne({ slug: jobSlug }, { projection: { orgId: 1, recruitmentId: 1, name: 1, abbr: 1, location: 1 } });
        if (!jobDetails)
            return null;
        const recruitmentDetails = await db.collection('recruitments')
            .findOne({ _id: new ObjectId(jobDetails.recruitmentId) }, { projection: { recruiterId: 1, name: 1, slug: 1, year: 1, status: 1 } });

        const { recruiterId, name, slug, year, status } = recruitmentDetails;

        const recruiter = await db.collection('recruiters').findOne({ _id: new ObjectId(recruiterId) });

        const recruiterDetails = recruiter.recruiterType === 'org' ?
            await db.collection('orgs').findOne({ _id: new ObjectId(recruiter.refId) }, { projection: { name: 1, abbr: 1 } }) :
            await db.collection('recruitment-bodies').findOne({ _id: new ObjectId(recruiter.refId) }, { projection: { name: 1, abbr: 1 } });

        const recruiterName = `${recruiterDetails.name}${recruiterDetails.abbr ? ` (${recruiterDetails.abbr})` : ''}`;

        const pastCycles = await db.collection('archives')
            .find({ recruitmentSlug: slug })
            .sort({ year: -1 })
            .limit(6)
            .toArray();

        let formattedLocation = formatLocation(jobDetails.location, jobDetails.sector);
        const finalJobDetails = { ...jobDetails, location: formattedLocation, recruiterName, recName: name, recSlug: slug, recYear: year, recStatus: status, pastCycles }
        return finalJobDetails;

    } catch (error) {

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
    'use cache';
    cacheLife('hours');
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

    // 'use cache';
    // cacheLife('hours');

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

export async function getAllSlugs(collectionName) {

    'use cache';
    cacheLife('hours');

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
            projection = { recruiterId: 1, slug: 1, updatedAt: 1, year: 1, status: 1, stages: { slug: 1 }, _id: 0 };
            break;
        case 'archives':
            projection = { recruitmentSlug: 1, updatedAt: 1, _id: 0 };
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

    'use cache';
    cacheLife('hours');

    try {
        const db = await connectDB();
        const doc = await db.collection(collectionName).findOne({ slug: slug }, { projection: { name: 1 } });
        if (!doc)
            return null;
        return doc.name;
    } catch (error) {

    }
}

export function generateStageCard(stage, link, status) {

    switch (stage) {
        case "Notification":
            return status === "completed"
                ? `
          <div class="stage-card">
            <p class="stage-label">${stage}</p>
            <a href="${link}" target="_blank">
              <div class="link-btn">View Notification PDF</div>
            </a>
            <p class="cms-note">Check the details carefully before applying.</p>
          </div>
        `
                : `
          <div class="stage-card">
            <p class="stage-label">Notification</p>
            <div class="link-btn-disabled">View Notification PDF</div>
            <p class="cms-note">The official notification PDF link will be activated once released.</p>
          </div>
        `;
        case "Registration":
            return status === "pending" ?
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

        case "Admit Card (Prelims)":
        case "Admit Card (Mains)":
        case "Admit Card (CBT 1)":
        case "Admit Card (CBT 2)":
        case "Admit Card (Online Test)":
            return status === "pending" ?
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

        case "Result (Online Test)":
            return status === "active"
                ? `
          <div class="stage-card">
            <p class="stage-label">${stage}</p>
            <a href="${link}" target="_blank">
              <div class="link-btn">Check Result</div>
            </a>
            <p class="cms-note">Use your registration details to check your result.</p>
          </div>
        `
                : `
          <div class="stage-card">
            <p class="stage-label">Online Test</p>
            <div class="link-btn-disabled">Check Result</div>
            <p class="cms-note">The result link will be activated once declared.</p>
          </div>
        `;

        default:
            return "";
    }
}
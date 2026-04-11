import { cacheLife } from "next/cache";
import { connectDB } from "./dbConfig";
import { ObjectId } from "mongodb";
import { connection } from "next/server";

//For Job and Recruitment Filters
export async function getStates() {
    'use cache';
    cacheLife('hours');

    try {
        const db = await connectDB();
        const statesCollection = await db.collection('states');
        const states = await statesCollection.find({}).toArray();
        return JSON.parse(JSON.stringify(states));
    } catch (error) {
        console.error("getRegions failed:", error);
        throw error;
    }
}

//For Recruitments Page
export async function getRecruitments({ search, forSlug, bySlug, status, sector, qualification, expLvl, location, isTop } = {}) {

    // 'use cache';
    // cacheLife('hours');

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

    if (isTop) {
        query.isTop = isTop;
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
        const recruitments = await db.collection('recruitments').aggregate([
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
            { $sort: { statusOrder: 1, updatedAt: -1 } }
        ]).toArray();

        if (!recruitments.length) return [];

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

        return JSON.parse(JSON.stringify(finalRecruitmentsList));

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
            { projection: { name: 1, slug: 1, _id: 0 } }
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
        return entity.abbr || entity.name;

    } catch (error) {

    }
}

//For Home Page, Org Page and Recruitment body page
export async function getOngoingRecruitments(page, orgSlug, rBodySlug) {

    // 'use cache';
    // cacheLife('hours');

    let aggregate = [];

    try {
        const db = await connectDB();
        if (page === 'home')
            aggregate.push({ $match: { status: 'ongoing' } });
        else if (page === 'org') {
            if (!orgSlug)
                return [];
            const org = await db.collection('orgs').findOne({ slug: orgSlug });
            const recruiter = await db.collection('recruiters').findOne({ refId: org._id.toString() });
            aggregate.push({ $match: { recruiterId: recruiter._id.toString(), status: 'ongoing' } });

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

export async function getRecruitmentDetails(mdOrContent, recSlug, year, stageSlug) {

    // 'use cache';
    // cacheLife('hours');

    try {
        const db = await connectDB();
        let recruitment = null;

        if (mdOrContent === 'md') {
            recruitment = await db.collection('recruitments').findOne(
                { slug: recSlug },
                { projection: { recruiterId: 1, name: 1 } }
            );
            if (!recruitment) return null;
        }
        else {
            recruitment = await db.collection('recruitments').findOne(
                { slug: recSlug },
                { projection: { recruiterId: 1, name: 1, description: 1, location: 1, year: 1, overview: 1, stages: 1, status: 1 } }
            );
            if (!recruitment) return null;

            let content = '';

            if (year) {
                const pastRecruitmentInfo = await db.collection('archive').findOne({ recruitmentSlug: recSlug, year: year });
                if (!pastRecruitmentInfo)
                    return null;

                content = pastRecruitmentInfo.content;
            }
            else if (stageSlug) {

                const stage = recruitment.stages.find(s => s.slug === stageSlug);
                if (!stage)
                    return null;

                const { completedContent, pendingContent, status } = stage;

                if (status === 'pending')
                    content = pendingContent;
                else if (status === 'completed')
                    content = completedContent;
                else
                    return null;
            }
            else {
                console.log({ recruitment });
                const { status, overview: { pendingContent, completedContent } } = recruitment;

                if (status === 'pending')
                    content = pendingContent;
                else
                    content = completedContent;
            }
            recruitment = { ...recruitment, content };
        }

        return recruitment;
    } catch (error) {
        console.error("getRecruitmentDetails failed:", error);
        throw error;
    }
};

export async function getRecruitmentSidebarDetails(recSlug) {

    // 'use cache';
    // cacheLife('hours');

    try {
        const db = await connectDB();
        const recruitment = await db.collection('recruitments').findOne({ slug: recSlug });
        if (!recruitment)
            return null;

        const pastRecruitmentInfos = await db.collection('archive').find({ recruitmentId: recruitment._id.toString() }).toArray();
        const sidebarDetails = {
            stages: recruitment.stages.map(({ name, slug, status }) => ({ name, slug, status })),
            years: [
                recruitment.year.toString(),
                ...pastRecruitmentInfos.map(p => p.year)
            ]
        };

        return sidebarDetails;

    } catch (error) {
        console.error("getRecruitmentSidebarDetails failed:", error);
        throw error;
    }
};

export async function getOrgs(search, sector) {

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
        const res = await db.collection('orgs').find(query).toArray();
        return JSON.parse(JSON.stringify(res));

    } catch (error) {
        console.error(error);
        throw error;
    }
};

export async function getOrgDetails(orgSlug) {

    'use cache';
    cacheLife('hours');

    try {
        const db = await connectDB();
        const org = await db.collection('orgs').findOne({ slug: orgSlug });
        if (!org)
            return null;
        const ongoingRecruitments = await getOngoingRecruitments('org', orgSlug);
        const popularJobs = await getJobs({ orgSlug: org.slug });
        const orgDetails = ongoingRecruitments.length > 0 ? { ...org, popularJobs, ongoingRecruitments } : { ...org, popularJobs };
        return JSON.parse(JSON.stringify(orgDetails));

    } catch (error) {
        console.error("getOrgs failed:", error);
        throw error;
    }
};

export async function getRecruitmentBodies(search, sector) {

    // 'use cache';
    // cacheLife('hours');

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
        const rBodiesCollection = db.collection('recruitment-bodies');
        const res = await rBodiesCollection.find(query).toArray();
        return JSON.parse(JSON.stringify(res));

    } catch (error) {
        console.log(error);
    }
};

export async function getRecruitmentBodyDetails(rBodySlug) {

    // 'use cache';
    // cacheLife('hours');

    try {
        const db = await connectDB();
        const rBody = await db.collection('recruitment-bodies').findOne({ slug: rBodySlug });
        if (!rBody)
            return null;

        const recruitersCollection = await db.collection('recruiters');
        const recruiter = await recruitersCollection.findOne({ refId: rBody._id.toString() });
        const topRecruitments = await db.collection('recruitments').find({ recruiterId: recruiter._id.toString() }).toArray();
        const ongoingRecruitments = await getOngoingRecruitments('rBody', null, rBodySlug);
        const rBodyDetails = ongoingRecruitments.length > 0 ? { ...rBody, topRecruitments, ongoingRecruitments } : { ...rBody, topRecruitments };
        return JSON.parse(JSON.stringify(rBodyDetails));

    } catch (error) {
        console.error("getOrgs failed:", error);
        throw error;
    }
};

export async function getJobs({ search, orgSlug, rStatus, sector, qualification, expLvl, location, isTop } = {}) {

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

    if (isTop) {
        query.isTop = isTop;
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
            const org = await db.collection('orgs').findOne({ slug: orgSlug });
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

        const res = await db.collection('jobs').find(query).sort({ popularityScore: -1 }).toArray();

        if (res.length === 0)
            return [];

        const orgIds = [...new Set(res.map(j => j.orgId))];

        const orgs = await db.collection('orgs')
            .find({ _id: { $in: orgIds.map(id => ObjectId.createFromHexString(id)) } })
            .project({ name: 1, abbr: 1, logoSrc: 1 })
            .toArray();

        const jobs = res.map(job => {
            const orgDetails = orgs.find(org => org._id.toString() === job.orgId);
            if (!orgDetails)
                return null;
            const { name: orgName, abbr: orgAbbr, logoSrc: orgLogo } = orgDetails;
            const recruitmentDetails = recruitments.find(recruitment => recruitment._id.toString() === job.recruitmentId);
            if (!recruitmentDetails)
                return null;
            const { slug: recruitmentSlug } = recruitmentDetails;
            return { ...job, orgName, orgAbbr, orgLogo, recruitmentSlug, recruitmentStatus: rStatus };
        }).filter(Boolean);

        return JSON.parse(JSON.stringify(jobs));

    } catch (error) {
        console.error(error);
        throw error;
    }
};

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
        const jobsList = await db.collection('jobs').find({}).sort({ popularityScore: -1 }).limit(6).toArray();
        const orgIds = [...new Set(jobsList.map(j => j.orgId))];
        const orgs = await db.collection('orgs')
            .find({ _id: { $in: orgIds.map(id => ObjectId.createFromHexString(id)) } })
            .project({ name: 1, logoSrc: 1 })
            .toArray();

        const allPopularJobs = jobsList.map(job => {
            const org = orgs.find(o => o._id.toString() === job.orgId);
            const { name: orgName, logoSrc: orgLogo } = org;
            return { ...job, orgName, orgLogo };
        });
        return JSON.parse(JSON.stringify(allPopularJobs));
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

export async function getJobDetails(jobSlug) {

    'use cache';
    cacheLife('hours');

    try {
        const db = await connectDB();
        const jobDetails = await db.collection('jobs').findOne({ slug: jobSlug });
        const org = await db.collection('orgs').findOne({ _id: ObjectId.createFromHexString(jobDetails.orgId) }, { projection: { name: 1 } });
        if (!jobDetails)
            return null;

        let formattedLocation = '';
        if (jobDetails.location.state)
            formattedLocation = jobDetails.location.state;
        else if (jobDetails.location.isAllIndia === true) {
            if (jobDetails.location.isStateWise)
                formattedLocation = 'All India (State wise)';
            else if (jobDetails.location.isStateWise)
                formattedLocation = 'All India (State wise)';
            else if (jobDetails.location.isCircleWise)
                formattedLocation = 'All India (Circle wise)';
            else if (jobDetails.sector === 'railways')
                formattedLocation = 'All India (RRB wise)';
            else
                formattedLocation = 'All India';

        }
        return JSON.parse(JSON.stringify({ ...jobDetails, location: formattedLocation, org: org.name }));

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getJobContent(jobSlug, jobNavSlug) {

    'use cache';
    cacheLife('hours');

    try {
        const db = await connectDB();
        const jobDetails = await db.collection('jobs').findOne({ slug: jobSlug });
        if (!jobDetails)
            return null;
        if (!jobNavSlug)
            return jobDetails.overview;

        const jobNavSlugs = [
            'overview',
            'eligibility-criteria',
            'responsibilities',
            'perks',
            'physical-standards',
            'medical-standards',
            'recruitment-details'
        ]
        if (!jobNavSlugs.includes(jobNavSlug))
            return null;
        else if (jobNavSlug === 'eligibility-criteria')
            return jobDetails.eligibilityCriteria
        else if (jobNavSlug === 'recruitment-details')
            return jobDetails.recruitmentDetails
        else
            return jobDetails[jobNavSlug];

    } catch (error) {
        console.error(error);
        throw error;
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
        const res = await db.collection('quick-links').find(query).toArray();
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
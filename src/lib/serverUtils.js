import { cacheLife } from "next/cache";
import { closeDB, connectDB } from "./dbConfig";
import { ObjectId } from "mongodb";
import { connection } from "next/server";

export const getStates = async () => {
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

export const getRecruitments = async ({ search, forSlug, bySlug, status, sector, qualification, expLvl, location, isTop } = {}) => {

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
    if (qualification)
        query.qualifications = RegExp(qualification === 'graduation' ? 'ug' : qualification, 'i');
    if (status)
        query.status = status;
    if (expLvl) {
        query.requiredExperience = expLvl === 'experienced' ? { $gt: 0 } : 0;
    }

    if (isTop) {
        query.isTop = isTop;
    }

    try {
        await connection();
        const db = await connectDB();
        if (location) {
            if (location === 'all-india')
                query = { ...query, 'location.isAllIndia': true };
            else {
                const state = await db.collection('states').findOne({ slug: location });
                query = { ...query, 'location.state': state.name };
            }
        }
        if (bySlug) {
            const org = await db.collection('orgs').findOne({ slug: bySlug });
            const rBody = await db.collection('recruitment-bodies').findOne({ slug: bySlug });
            if (org || rBody) {
                const recruitersCollection = db.collection('recruiters');
                const recruiter = await recruitersCollection.findOne({ refId: org ? org._id.toString() : rBody._id.toString() });
                query.recruiterId = recruiter._id.toString();
            }
            else
                return undefined;
        }
        const recruitments = await db.collection('recruitments').find(query).sort({ lastUpdated: -1 }).toArray();
        if (recruitments.length > 0) {
            const results = await Promise.all(
                recruitments.map(async (recruitment) => {
                    if (forSlug) {
                        const org = await db.collection('orgs').findOne({ slug: forSlug });

                        const jobs = await db.collection('jobs').find({
                            orgId: org._id.toString(),
                            recruitmentId: recruitment._id.toString()
                        }).toArray();

                        return jobs.length > 0 ? recruitment : null;
                    }
                    return recruitment;
                })
            );

            const finalRecruitments = results.filter(Boolean);
            return JSON.parse(JSON.stringify(finalRecruitments));
        }
        else
            return undefined;
    } catch (error) {
        console.error("getRecruitments failed:", error);
        throw error;
    }
};

export const getRecentRecruitments = async () => {

    // 'use cache';
    // cacheLife('hours');

    try {
        await connection();
        const db = await connectDB();
        const recruitmentCollection = await db.collection('recruitments');
        const sectorWiseRecentRecruitments = await recruitmentCollection.aggregate([
            {
                $match: { status: { $ne: 'pending' } }
            },
            { $sort: { sector: 1, lastUpdated: -1 } },
            {
                $group: {
                    _id: "$sector",
                    recruitments: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    _id: 0,
                    sector: "$_id",
                    recruitments: { $slice: ["$recruitments", 6] }
                }
            }
        ]).toArray();
        const allRecentRecruitments = sectorWiseRecentRecruitments.flatMap(rList => rList.recruitments);
        return JSON.parse(JSON.stringify(allRecentRecruitments));
    } catch (error) {
        console.error("getRecruitments failed:", error);
        throw error;
    }
};

export const getRecruitmentDetails = async (recSlug, y, stageSlug) => {

    // 'use cache';
    // cacheLife('hours');

    try {
        const db = await connectDB();
        const recruitmentCollection = await db.collection('recruitments');
        const recruitments = await recruitmentCollection.find({ slug: recSlug }).toArray();
        if (recruitments.length > 0) {
            let recruitmentDetails = recruitments[0];
            let pageContent = { content: null };
            if (y) {
                const archiveCollection = db.collection('archive');
                const pastRecruitmentInfos = await archiveCollection.find({ $and: [{ recruitmentId: recruitmentDetails._id.toString() }, { year: y }] }).toArray();

            }
            else if (stageSlug) {
                const stage = recruitmentDetails.stages.find(s => s.slug === stageSlug);
                if (stage.status === 'pending')
                    pageContent.content = stage.pendingContent;
                else if (stage.status === 'completed')
                    pageContent.content = stage.completedContent;
                else
                    return undefined;
            }
            else {
                if (recruitmentDetails.status === 'pending')
                    pageContent.content = recruitmentDetails.overview.pendingContent;
                else if (recruitmentDetails.status === 'ongoing')
                    pageContent.content = recruitmentDetails.overview.completedContent;
            }
            return pageContent;
        }
        else
            return undefined;
    } catch (error) {
        console.error("getOrgs failed:", error);
        throw error;
    }
};

export const getRecruitmentSidebarDetails = async (recSlug) => {

    // 'use cache';
    // cacheLife('hours');

    try {
        const db = await connectDB();
        const recruitmentCollection = await db.collection('recruitments');
        const recruitments = await recruitmentCollection.find({ slug: recSlug }).toArray();

        if (recruitments.length > 0) {
            let sidebarDetails = { stages: [], years: [(new Date()).getFullYear().toString()] };
            let recruitmentDetails = recruitments[0];
            sidebarDetails.stages = recruitmentDetails.stages.map(stage => {
                const { name, slug, status } = stage;
                return { name, slug, status };
            })
            const archiveCollection = await db.collection('archive');
            const pastRecruitmentInfos = archiveCollection.find({ recruitmentId: recruitmentDetails._id.toString() }).toArray();
            if (pastRecruitmentInfos.length > 0) {
                for (const pastRecruitmentInfo of pastRecruitmentInfos) {
                    sidebarDetails.years.push(pastRecruitmentInfo.year);
                }
            }
            return sidebarDetails;
        }
        else
            return undefined;
    } catch (error) {
        console.error("getOrgs failed:", error);
        throw error;
    }
};

export const getOrgs = async (search, sector) => {

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
        await connection();
        const db = await connectDB();
        const orgsCollection = db.collection('orgs');
        const res = await orgsCollection.find(query).toArray();
        return JSON.parse(JSON.stringify(res));

    } catch (error) {
        console.log(error);
    }
};

export const getOrgDetails = async (orgSlug) => {

    // 'use cache';
    // cacheLife('hours');

    try {
        const db = await connectDB();
        const recruitmentCollection = await db.collection('orgs');
        const results = await recruitmentCollection.find({ slug: orgSlug }).toArray();
        if (results.length > 0) {
            const org = results[0];
            const popularJobs = await getJobs({ org: org.slug });
            const orgDetails = { ...org, popularJobs };
            return JSON.parse(JSON.stringify(orgDetails));
        }
        else
            return undefined;
    } catch (error) {
        console.error("getOrgs failed:", error);
        throw error;
    }
};

export const getRecruitmentBodies = async (search, sector) => {

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

export const getRecruitmentBodyDetails = async (rBodySlug) => {

    // 'use cache';
    // cacheLife('hours');

    try {
        const db = await connectDB();
        const recruitmentBodiesCollection = await db.collection('recruitment-bodies');
        const results = await recruitmentBodiesCollection.find({ slug: rBodySlug }).toArray();
        if (results.length > 0) {
            const rBody = results[0];
            const recruitersCollection = await db.collection('recruiters');
            const refId = rBody._id.toString();
            const recruiters = await recruitersCollection.find({ refId: refId }).toArray();
            const recruiterId = recruiters[0]._id.toString();
            const recruitmentCollection = await db.collection('recruitments');
            const topRecruitments = await recruitmentCollection.find({ recruiterId: recruiterId }).toArray();
            const rBodyDetails = { ...rBody, topRecruitments };
            return JSON.parse(JSON.stringify(rBodyDetails));
        }
        else
            return undefined;
    } catch (error) {
        console.error("getOrgs failed:", error);
        throw error;
    }
};

export const getJobs = async ({ search, orgSlug, rStatus, sector, qualification, expLvl, location, isTop } = {}) => {

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
    if (qualification)
        query = { 'education.level': RegExp(qualification === 'graduation' ? 'ug' : qualification, 'i') };
    if (expLvl) {
        query.requiredExperience = expLvl === 'experienced' ? { $gt: 0 } : 0;
    }

    if (isTop) {
        query.isTop = isTop;
    }

    try {
        await connection();
        const db = await connectDB();
        if (location) {
            if (location === 'all-india')
                query = { ...query, 'location.isAllIndia': true };
            else {
                const statesCollection = db.collection('states');
                const results = await statesCollection.find({ slug: location }).toArray();
                query = { ...query, 'location.state': results[0].name };
            }
        }
        if (orgSlug) {
            const orgsCollection = db.collection('orgs');
            const results = await orgsCollection.find({ slug: orgSlug }).toArray();
            query = { ...query, orgId: results[0]._id.toString() };
        }
        const orgCollection = db.collection('orgs');
        const recruitmentCollection = db.collection('recruitments');
        const jobsCollection = db.collection('jobs');
        const res = await jobsCollection.find(query).toArray();
        if (res.length > 0) {
            const jobs = await Promise.all(res.map(async (job) => {
                const orgRes = await orgCollection.find({ _id: ObjectId.createFromHexString(job.orgId) }).toArray();
                const orgDetails = orgRes[0];
                const { name: orgName, abbr: orgAbbr, logoSrc: orgLogo } = orgDetails;
                const recruitmentRes = await recruitmentCollection.find({ _id: ObjectId.createFromHexString(job.recruitmentId) }).toArray();
                const recruitmentDetails = recruitmentRes[0];
                const { slug: recruitmentSlug, status: recruitmentStatus } = recruitmentDetails;
                return { ...job, orgName, orgAbbr, orgLogo, recruitmentSlug, recruitmentStatus };
            }));
            const finalJobList = rStatus ? jobs.filter(job => job.recruitmentStatus === rStatus) : jobs;
            return JSON.parse(JSON.stringify(finalJobList));
        }
        return undefined;

    } catch (error) {
        console.log(error);
    }
};

export const getPopularJobs = async () => {

    // 'use cache';
    // cacheLife('hours');

    try {
        await connection();
        const db = await connectDB();
        const jobsCollection = await db.collection('jobs');
        const sectorWisePopularJobs = await jobsCollection.aggregate([
            { $sort: { sector: 1, popularityScore: -1 } },
            {
                $group: {
                    _id: "$sector",
                    jobs: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    _id: 0,
                    sector: "$_id",
                    jobs: { $slice: ["$jobs", 6] }
                }
            }
        ]).toArray();
        const jobsList = sectorWisePopularJobs.flatMap(jList => jList.jobs);
        const orgCollection = db.collection('orgs');
        const allPopularJobs = await Promise.all(jobsList.map(async (job) => {
            const orgRes = await orgCollection.find({ _id: ObjectId.createFromHexString(job.orgId) }).toArray();
            const orgDetails = orgRes[0];
            const { name: orgName, logoSrc: orgLogo } = orgDetails;
            return { ...job, orgName, orgLogo };
        }));
        return JSON.parse(JSON.stringify(allPopularJobs));
    } catch (error) {
        console.error("getPopularJobs failed:", error);
        throw error;
    }
};

export const getJobDetails = async (jobSlug, jobNavSlug) => {
    try {
        await connection();
        const db = await connectDB();
        const jobsCollection = db.collection('jobs');
        const res = await jobsCollection.find({ slug: jobSlug }).toArray();
        const jobDetails = res[0];
        if (!jobNavSlug)
            return jobDetails.overview;
        else if (jobNavSlug === 'eligibility-criteria')
            return jobDetails.eligibilityCriteria
        else
            return jobDetails[jobNavSlug];

    } catch (error) {
        console.log(error);
    }
}

export const getRecruiters = async () => {
    // 'use cache';
    // cacheLife('hours');
    try {
        const db = await connectDB();
        const res = await db.collection('recruiters').find({}).toArray();
        const recruiters = await Promise.all(res.map(async (recruiter) => {
            let recruiterDetails;
            if (recruiter.recruiterType === 'org') {
                recruiterDetails = await db.collection('orgs').findOne({ _id: ObjectId.createFromHexString(recruiter.refId) });
                return { ...recruiter, name: recruiterDetails.name, slug: recruiterDetails.slug };
            }
            else {
                recruiterDetails = await db.collection('recruitment-bodies').findOne({ _id: ObjectId.createFromHexString(recruiter.refId) });
                return { ...recruiter, name: recruiterDetails.name, slug: recruiterDetails.slug };
            }
        }))
        return JSON.parse(JSON.stringify(recruiters));
    } catch (error) {
        console.log(error);
    }
}

export const getQuickLinks = async (search) => {

    // 'use cache';
    // cacheLife('hours');

    let query = {};
    if (search) {
        query.name = { $regex: search, $options: "i" }
    }

    try {
        const db = await connectDB();
        const rBodiesCollection = db.collection('quick-links');
        const res = await rBodiesCollection.find(query).toArray();
        return JSON.parse(JSON.stringify(res));

    } catch (error) {
        console.log(error);
    }
};
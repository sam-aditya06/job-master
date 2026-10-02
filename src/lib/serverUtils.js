import { ObjectId } from "mongodb";
import * as cheerio from 'cheerio';

import { connectDB } from "./dbConfig";
import { buildJobPosting, deslugify, formatLocationJsonLd, getMessages } from "./utils";
import { format } from "date-fns";

const ITEM_PER_PAGE = 12;

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

//For Recruitments Page Metadata
export async function getRecruitmentsMetadata({ org, recruiter, status, cat, location, qualification, expLvl, lang } = {}) {
    try {
        const db = await connectDB()

        const allParams = { org, recruiter, status, cat, qualification, expLvl, location }

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

        const orgName = org ? await getNameFromSlug("orgs", org, lang) : null
        const recruiterName = recruiter ? await getNameFromSlug("orgs", recruiter, lang) : null

        let qualificationName;

        if (qualification) {
            if (qualification === "graduate")
                qualificationName = "Graduates";
            else {
                const result = await db.collection('qualifications').findOne(
                    { slug: qualification },
                    { projection: { name: `$name.${lang}`, level: 1 } }
                );

                if (result.level.includes('Graduate'))
                    qualificationName = `${result.name} graduates`
                else
                    qualificationName = result.name;
            }

        }

        let expLvlName;

        if (expLvl) {
            if (qualification)
                expLvlName = deslugify(expLvl);
            else
                expLvlName = expLvl === 'fresher' ? 'Freshers' : 'Experienced Professionals';
        }

        const displayParams = {
            org: orgName,
            recruiter: recruiterName,
            status: deslugify(status),
            cat: deslugify(cat),
            qualification: qualificationName,
            expLvl: expLvlName,
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
            description: "Browse government recruitment in India by qualification, status and more. Explore key details like vacancies, required experience and more."
        }
    }
}

async function createRecruitmentsSearchQuery({ search, org, recruiter, status, cat, location, qualification, expLvl, lang } = {}) {
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
        if (location === 'all-india')
            query.$and.push({ "location.scope": "all-india" });
        else {
            query.$and.push({
                $or: [
                    { "location.state.slug": location },
                    { "location.district.slug": location },
                    { "location.municipaility.slug": location },
                    { "location.panchayat.slug": location }
                ]
            });
        }
    }
    if (recruiter) {
        query.$and.push({ "recruiter.slug": recruiter });
    }

    try {
        const db = await connectDB();

        let jobs;


        if (org || qualification || expLvl || cat) {
            let jobQuery = await createJobsSearchQuery({ org, qualification, expLvl, cat });

            jobs = await db.collection('jobs')
                .find(jobQuery)
                .project({
                    org: 1,
                    categories: 1,
                    allowedQualificationLevels: 1,
                    qualifications: 1,
                    minimumExperience: 1,
                    maximumExperience: 1
                })
                .toArray();

            const jobIds = jobs.map(job => job._id);
            query.$and.push({ "jobs.jobId": { $in: jobIds } });

        }
        return { query, jobs };
    } catch (error) {
        console.error("createRecruitmentsSearchQuery failed:", error);
        throw error;
    }

}

//For Recruitments Page
export async function getRecruitments({
    search,
    org,
    recruiter,
    status,
    cat,
    qualification,
    expLvl,
    location,
    lang,
    page = 1

} = {}) {

    let { query, jobs } = await createRecruitmentsSearchQuery({ search, org, recruiter, status, cat, qualification, expLvl, location, lang });

    try {
        const db = await connectDB();

        const recruitmentsInfo = await db.collection('recruitments').aggregate([
            { $match: query },
            { $set: { updatedAt: { $max: "$stages.updatedAt" } } },
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
                                location: 1,
                                jobs: 1,
                                vacancies: `$contentVariables.vacancies.${lang}`,
                                registrationEndDate: `$contentVariables.registrationEndDate.${lang}`,
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


        if (!jobs) {
            const jobIds = recruitments.flatMap(rec => rec.jobs.map(job => job.jobId));
            jobs = await db.collection('jobs')
                .find({ _id: { $in: jobIds } })
                .project({
                    org: 1,
                    categories: 1,
                    allowedQualificationLevels: 1,
                    qualifications: 1,
                    minimumExperience: 1,
                    maximumExperience: 1
                })
                .toArray();
        }
        const qualificationIds = jobs.filter(job => job.qualifications).flatMap(job => job.qualifications.map(q => q.qualificationId));
        const stateIds = recruitments.filter(rec => rec.location.states).flatMap(rec => rec.location.states.map(js => js.stateId));
        const utIds = recruitments.filter(rec => rec.location.uts).flatMap(rec => rec.location.uts.map(jut => jut.utId));
        const districtIds = recruitments.filter(rec => rec.location.districts).flatMap(rec => rec.location.districts.map(jd => jd.districtId));
        const municipailityIds = recruitments.filter(rec => rec.municipailities).flatMap(rec => rec.location.municipailities.map(jm => jm.municipailityId));
        const panchayatds = recruitments.filter(rec => rec.location.panchayats).flatMap(rec => rec.location.panchayats.map(jp => jp.panchayatId));

        const [qualifications, states, uts, districts, municipalities, panchayats] = await Promise.all([
            qualificationIds.length > 0 ? db.collection('qualifications')
                .find({ _id: { $in: qualificationIds } })
                .project({ name: `$name.${lang}`, shortForm: `$shortForm.${lang}` })
                .toArray() : [],
            stateIds.length > 0 ? db.collection('states')
                .find({ _id: { $in: stateIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : [],
            utIds.length > 0 ? db.collection('unionTerritories')
                .find({ _id: { $in: utIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : [],
            districtIds.length > 0 ? db.collection('districts')
                .find({ _id: { $in: districtIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : []
            , municipailityIds.length > 0 ? db.collection('municipalities')
                .find({ _id: { $in: municipailityIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : [],
            panchayatds.length > 0 ? db.collection('panchayats')
                .find({ _id: { $in: panchayatds } })
                .project({ name: `$name.${lang}` })
                .toArray() : []
        ]);

        const messages = await getMessages(lang);

        const finalRecruitmentsList = recruitments.map(recruitment => {

            const recruitmentJobIds = recruitment.jobs.map(job => job.jobId.toString());
            const recruitmentJobs = jobs.filter(job => recruitmentJobIds.includes(job._id.toString()));

            const categories = [...new Set(recruitmentJobs.flatMap(job => job.categories))].sort().map(cat => messages.jobs.filters.categories[cat]);

            let modifiedLocation = [];
            if (recruitment.location.scope === 'all-india')
                modifiedLocation.push(messages.jobs.filters.locations["all-india"]);
            else if (recruitment.location.scope === 'state')
                modifiedLocation.push(...recruitment.location.states.map(({ stateId }) => states.find(state => state._id.toString() === stateId.toString()).name));
            else if (recruitment.location.scope === 'ut')
                modifiedLocation.push(...recruitment.location.uts.map(({ utId }) => uts.find(ut => ut._id.toString() === utId.toString()).name));
            else if (recruitment.location.scope === 'district')
                modifiedLocation.push(...recruitment.location.districts.map(({ districtId }) => districts.find(district => district._id.toString() === districtId.toString()).name));
            else if (recruitment.location.scope === 'municipality')
                modifiedLocation.push(...recruitment.location.municipalities.map(({ municipalityId }) => municipalities.find(municipality => municipality._id.toString() === municipalityId.toString()).name));
            else if (recruitment.location.scope === 'panchayat')
                modifiedLocation.push(...recruitment.location.panchayats.map(({ panchayatId }) => panchayats.find(panchayat => panchayat._id.toString() === panchayatId.toString()).name));


            let recruitmentQualifications = [];
            recruitmentJobs.forEach(job => {
                if (!job.qualifications) {
                    let minimumQualificationLabel = messages.jobs.filters.qualifications[job.allowedQualificationLevels[0]];
                    if (!recruitmentQualifications.some(rq => rq.name === minimumQualificationLabel))
                        recruitmentQualifications.push({ name: minimumQualificationLabel });
                }
                else {
                    const recruitmentJobQualificationIds = recruitmentJobs.flatMap(job => job.qualifications.map(q => q.qualificationId.toString()));
                    const matchedQualifications = qualifications.filter(q => recruitmentJobQualificationIds.includes(q._id.toString()));
                    recruitmentQualifications.push(...matchedQualifications);
                }
            });
            const minimumExperience = Math.min([...recruitmentJobs.map(recJob => recJob.minimumExperience)]) || 0;
            const maximumExperience = Math.min([...recruitmentJobs.map(recJob => recJob.maximumExperience)]) || 0;
            return { ...recruitment, categories, location: modifiedLocation, qualifications: recruitmentQualifications, minimumExperience, maximumExperience };
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
            orgIds: [],
            recruiterIds: [],
            statuses: [],
            categories: [],
            scopes: [],
            stateIds: [],
            utIds: [],
            districtIds: [],
            municipailityIds: [],
            panchayatIds: [],
            aqls: [],
            intialQIds: [],
            filteredQIds: [],
            expLvls: []
        };

        if (Object.keys(sp).length > 0) {

            const createSP = (field) => {
                const newSP = { ...sp };
                delete newSP[field];
                return newSP;
            }
            let orgSP = createSP('org')
            let recruiterSP = createSP('recruiter')
            let qualificationSP = createSP('qualification');
            let categorySP = createSP('cat');
            let locationSP = createSP('location');
            let statusSP = createSP('rStatus');
            let expLvlSP = createSP('expLvl');

            let { query: withoutOrgQuery } = await createRecruitmentsSearchQuery(orgSP);
            let { query: withoutRecruiterQuery } = await createRecruitmentsSearchQuery(recruiterSP);
            let { query: withoutQualificationQuery } = await createRecruitmentsSearchQuery(qualificationSP);
            let { query: withoutCategoryQuery } = await createRecruitmentsSearchQuery(categorySP);
            let { query: withoutLocationQuery } = await createRecruitmentsSearchQuery(locationSP);
            let { query: withoutStatusQuery } = await createRecruitmentsSearchQuery(statusSP);
            let { query: withoutExpLvlQuery } = await createRecruitmentsSearchQuery(expLvlSP);

            const [intialJobBasedFilterDetails, recruitmentBasedfilterDetails] = await Promise.all([
                db.collection('jobs').aggregate([
                    { $match: {} },
                    {
                        $facet: {
                            initialOrgIds: [{ $group: { _id: "$org.orgId" } }],
                            initialQualificationIds: [
                                { $unwind: "$qualifications" },
                                { $group: { _id: "$qualifications.qualificationId" } }
                            ],
                            initialCategories: [
                                { $unwind: "$categories" },
                                { $group: { _id: "$categories" } }
                            ]
                        }
                    },
                    {
                        $project: {
                            initialOrgIds: "$initialOrgIds._id",
                            initialQualificationIds: "$initialQualificationIds._id",
                            initialCategories: "$initialCategories._id"
                        }
                    }
                ]).next(),
                db.collection('recruitments').aggregate([
                    { $match: { status: { $ne: 'inactive' } } },
                    {
                        $facet: {
                            initialRecruiterIds: [{ $group: { _id: "$recruiter.recruiterId" } }],
                            initialStatuses: [
                                { $group: { _id: "$status" } }
                            ],
                            initialStates: [
                                { $match: { "location.score": "state" } },
                                { $unwind: "$location.states" },
                                { $group: { _id: "$location.states.stateId" } }
                            ],
                            initialUTs: [
                                { $match: { "location.scope": "ut" } },
                                { $unwind: "$location.uts" },
                                { $group: { _id: "$location.uts.utId" } }
                            ],
                            initialDistricts: [
                                { $match: { "location.scope": "district" } },
                                { $unwind: "$location.districts" },
                                { $group: { _id: "$location.districts.districtId" } }
                            ],
                            initialMunicipalities: [
                                { $match: { "location.scope": "municipality" } },
                                { $unwind: "$location.municipalities" },
                                { $group: { _id: "$location.municipalities.municipalityId" } }
                            ],
                            initialPanchayats: [
                                { $match: { "location.scope": "panchayat" } },
                                { $unwind: "$location.panchayats" },
                                { $group: { _id: "$location.panchayats.panchayatId" } }
                            ],
                            withoutOrgFilteredJobIds: [
                                { $match: withoutOrgQuery },
                                { $unwind: "$jobs" },
                                { $group: { _id: "$jobs.jobId" } }
                            ],
                            filteredRecruiterIds: [
                                { $match: withoutRecruiterQuery },
                                { $group: { _id: "$recruiter.recruiterId" } }
                            ],
                            filteredStatuses: [
                                { $match: withoutStatusQuery },
                                { $group: { _id: "$status" } }
                            ],
                            withoutCategoryFilteredJobIds: [
                                { $match: withoutCategoryQuery },
                                { $unwind: "$jobs" },
                                { $group: { _id: "$jobs.jobId" } }
                            ],
                            finalScopes: [
                                { $match: withoutLocationQuery },
                                { $group: { _id: "$location.scope" } }
                            ],
                            filteredStates: [
                                { $match: withoutLocationQuery },
                                { $unwind: "$location.states" },
                                { $group: { _id: "$location.states.stateId" } }
                            ],
                            filteredUTs: [
                                { $match: withoutLocationQuery },
                                { $unwind: "$location.uts" },
                                { $group: { _id: "$location.uts.utId" } }
                            ],
                            filteredDistricts: [
                                { $match: withoutLocationQuery },
                                { $unwind: "$location.districts" },
                                { $group: { _id: "$location.districts.districtId" } }
                            ],
                            filteredMunicipalities: [
                                { $match: withoutLocationQuery },
                                { $unwind: "$location.municipalities" },
                                { $group: { _id: "$location.municipalities.municipalityId" } }
                            ],
                            filteredPanchayats: [
                                { $match: withoutLocationQuery },
                                { $unwind: "$location.panchayats" },
                                { $group: { _id: "$location.panchayats.panchayatId" } }
                            ],
                            withoutQualificationFilteredJobIds: [
                                { $match: withoutQualificationQuery },
                                { $unwind: "$jobs" },
                                { $group: { _id: "$jobs.jobId" } }
                            ],
                            withoutExpLvlFilteredJobIds: [
                                { $match: withoutExpLvlQuery },
                                { $unwind: "$jobs" },
                                { $group: { _id: "$jobs.jobId" } }
                            ]
                        }
                    },
                    {
                        $project: {
                            initialRecruiterIds: "$initialRecruiterIds._id",
                            initialStatuses: "$initialStatuses._id",
                            initialStateIds: "$initialStates._id",
                            initialUTIds: "$initialUTs._id",
                            initialDistrictIds: "$initialDistricts._id",
                            initialMunicipalityIds: "$initialMunicipalities._id",
                            initialPanchayatIds: "$initialPanchayats._id",
                            withoutOrgFilteredJobIds: "$withoutOrgFilteredJobIds._id",
                            filteredRecruiterIds: "$filteredRecruiterIds._id",
                            filteredStatuses: "$filteredStatuses._id",
                            withoutCategoryFilteredJobIds: "$withoutCategoryFilteredJobIds._id",
                            filteredStateIds: "$filteredStates._id",
                            filteredUTIds: "$filteredUTs._id",
                            filteredDistrictIds: "$filteredDistricts._id",
                            filteredMunicipalityIds: "$filteredMunicipalities._id",
                            filteredPanchayatIds: "$filteredPanchayats._id",
                            withoutQualificationFilteredJobIds: "$withoutQualificationFilteredJobIds._id",
                            withoutExpLvlFilteredJobIds: "$withoutExpLvlFilteredJobIds._id"
                        }
                    }
                ]).next()

            ]);

            const { initialOrgIds, initialQualificationIds, initialCategories } = intialJobBasedFilterDetails;

            const {
                initialRecruiterIds,
                initialStatuses,
                initialStateIds,
                initialUTIds,
                initialDistrictIds,
                initialMunicipalityIds,
                initialPanchayatIds,
                withoutOrgFilteredJobIds,
                filteredRecruiterIds,
                filteredStatuses,
                withoutCategoryFilteredJobIds,
                filteredStateIds,
                filteredUTIds,
                filteredDistrictIds,
                filteredMunicipalityIds,
                filteredPanchayatIds,
                withoutQualificationFilteredJobIds,
                withoutExpLvlFilteredJobIds
            } = recruitmentBasedfilterDetails;

            const filterDetails = await db.collection('jobs').aggregate([
                { $match: {} },
                {
                    $facet: {
                        filteredOrgIds: [
                            { $match: { _id: { $in: withoutOrgFilteredJobIds } } },
                            { $group: { _id: "$org.orgId" } }
                        ],
                        finalAQLs: [
                            { $match: { _id: { $in: withoutQualificationFilteredJobIds }, qualifications: { $exists: false } } },
                            { $unwind: "$allowedQualificationLevels" },
                            { $group: { _id: "$allowedQualificationLevels" } }
                        ],
                        filteredQualificationIds: [
                            { $match: { _id: { $in: withoutQualificationFilteredJobIds } } },
                            { $unwind: "$qualifications" },
                            { $group: { _id: "$qualifications.qualificationId" } }
                        ],
                        filteredCategories: [
                            { $match: { _id: { $in: withoutCategoryFilteredJobIds } } },
                            { $unwind: "$categories" },
                            { $group: { _id: "$categories" } }
                        ],
                        filteredMinExperience: [
                            { $match: { _id: { $in: withoutExpLvlFilteredJobIds } } },
                            { $group: { _id: "$minimumExperience" } }
                        ]
                    }
                },
                {
                    $project: {
                        filteredOrgIds: "$filteredOrgIds._id",
                        finalAQLs: "$finalAQLs._id",
                        filteredQualificationIds: "$filteredQualificationIds._id",
                        filteredCategories: "$filteredCategories._id",
                        filteredMinExperience: "$filteredMinExperience._id"
                    }
                }
            ]).next();

            const {
                filteredOrgIds,
                finalAQLs,
                filteredQualificationIds,
                filteredCategories,
                filteredMinExperience
            } = filterDetails;

            const finalOrgIds = initialOrgIds.map(id => ({ id, isDisabled: !filteredOrgIds.some(fId => fId.toString() === id.toString()) }));
            const finalRecruiterIds = initialRecruiterIds.map(id => ({ id, isDisabled: !filteredRecruiterIds.some(fId => fId.toString() === id.toString()) }));
            const finalCategories = initialCategories.map(cat => ({ slug: cat, isDisabled: !filteredCategories.includes(cat) }));
            const finalStateIds = initialStateIds.map(id => ({ id, isDisabled: !filteredStateIds.some(fId => fId.toString() === id.toString()) }));
            const finalUTIds = initialUTIds.map(id => ({ id, isDisabled: !filteredUTIds.some(fId => fId.toString() === id.toString()) }));
            const finalDistrictIds = initialDistrictIds.map(id => ({ id, isDisabled: !filteredDistrictIds.some(fId => fId.toString() === id.toString()) }));
            const finalMunicipalityIds = initialMunicipalityIds.map(id => ({ id, isDisabled: !filteredMunicipalityIds.some(fId => fId.toString() === id.toString()) }));
            const finalPanchayatIds = initialPanchayatIds.map(id => ({ id, isDisabled: !filteredPanchayatIds.some(fId => fId.toString() === id.toString()) }));
            const finalStatuses = initialStatuses.sort().reverse().map(status => ({ status, isDisabled: !filteredStatuses.includes(status) }));
            const finalMinExperience = [
                { slug: "fresher", isDisabled: !filteredMinExperience.some(exp => exp === 0) },
                { slug: "experienced", isDisabled: !filteredMinExperience.some(exp => exp > 0) }
            ]

            something.orgIds.push(...finalOrgIds);
            something.recruiterIds.push(...finalRecruiterIds);
            something.aqls.push(...finalAQLs);
            something.intialQIds.push(...initialQualificationIds);
            something.filteredQIds.push(...filteredQualificationIds);
            something.categories.push(...finalCategories);
            something.stateIds.push(...finalStateIds);
            something.utIds.push(...finalUTIds);
            something.districtIds.push(...finalDistrictIds);
            something.municipailityIds.push(...finalMunicipalityIds);
            something.panchayatIds.push(...finalPanchayatIds);
            something.statuses.push(...finalStatuses);
            something.expLvls.push(...finalMinExperience);
        }
        else {

            const [jobBasedFilterDetails, recruitmentBasedfilterDetails] = await Promise.all([
                db.collection('jobs').aggregate([
                    { $match: {} },
                    {
                        $facet: {
                            initialOrgIds: [{ $group: { _id: "$org.orgId" } }],
                            initialQualificationIds: [
                                { $unwind: "$qualifications" },
                                { $group: { _id: "$qualifications.qualificationId" } }
                            ],
                            initialCategories: [
                                { $unwind: "$categories" },
                                { $group: { _id: "$categories" } }
                            ],
                            initialExperiences: [{ $group: { _id: "$minimumExperience" } }]
                        }
                    },
                    {
                        $project: {
                            initialOrgIds: "$initialOrgIds._id",
                            initialQualificationIds: "$initialQualificationIds._id",
                            initialCategories: "$initialCategories._id",
                            initialExperiences: "$initialExperiences._id"
                        }
                    }
                ]).next(),
                db.collection('recruitments').aggregate([
                    { $match: { status: { $ne: 'inactive' } } },
                    {
                        $facet: {
                            initialRecruiterIds: [{ $group: { _id: "$recruiter.recruiterId" } }],
                            initialStatuses: [
                                { $group: { _id: "$status" } }
                            ],
                            initialStates: [
                                { $match: { "location.score": "state" } },
                                { $unwind: "$location.states" },
                                { $group: { _id: "$location.states.stateId" } }
                            ],
                            initialUTs: [
                                { $match: { "location.scope": "ut" } },
                                { $unwind: "$location.uts" },
                                { $group: { _id: "$location.uts.utId" } }
                            ],
                            initialDistricts: [
                                { $match: { "location.scope": "district" } },
                                { $unwind: "$location.districts" },
                                { $group: { _id: "$location.districts.districtId" } }
                            ],
                            initialMunicipalities: [
                                { $match: { "location.scope": "municipality" } },
                                { $unwind: "$location.municipalities" },
                                { $group: { _id: "$location.municipalities.municipalityId" } }
                            ],
                            initialPanchayats: [
                                { $match: { "location.scope": "panchayat" } },
                                { $unwind: "$location.panchayats" },
                                { $group: { _id: "$location.panchayats.panchayatId" } }
                            ]
                        }
                    },
                    {
                        $project: {
                            initialRecruiterIds: "$initialRecruiterIds._id",
                            initialStatuses: "$initialStatuses._id",
                            initialStateIds: "$initialStates._id",
                            initialUTIds: "$initialUTs._id",
                            initialDistrictIds: "$initialDistricts._id",
                            initialMunicipalityIds: "$initialMunicipalities._id",
                            initialPanchayatIds: "$initialPanchayats._id"
                        }
                    }
                ]).next()

            ]);

            const {
                initialOrgIds,
                initialQualificationIds,
                initialCategories,
                initialExperiences
            } = jobBasedFilterDetails;

            const {
                initialRecruiterIds,
                initialStatuses,
                initialStateIds,
                initialUTIds,
                initialDistrictIds,
                initialMunicipalityIds,
                initialPanchayatIds
            } = recruitmentBasedfilterDetails;

            const finalOrgIds = initialOrgIds.map(id => ({ id, isDisabled: false }));
            const finalRecruiterIds = initialRecruiterIds.map(id => ({ id, isDisabled: false }));
            const finalCategories = initialCategories.map(cat => ({ slug: cat, isDisabled: false }));
            const finalStateIds = initialStateIds.map(id => ({ id, isDisabled: false }))
            const finalUTIds = initialUTIds.map(id => ({ id, isDisabled: false }))
            const finalDistrictIds = initialDistrictIds.map(id => ({ id, isDisabled: false }))
            const finalMunicipalityIds = initialMunicipalityIds.map(id => ({ id, isDisabled: false }))
            const finalPanchayatIds = initialPanchayatIds.map(id => ({ id, isDisabled: false }))
            const finalRecruitmentStatuses = initialStatuses.sort().reverse().map(rStatus => ({ status: rStatus, isDisabled: false }));
            const finalMinExperience = [
                { slug: "fresher", isDisabled: !initialExperiences.some(exp => exp === 0) },
                { slug: "experienced", isDisabled: !initialExperiences.some(exp => exp > 0) }
            ];

            something.orgIds.push(...finalOrgIds);
            something.recruiterIds.push(...finalRecruiterIds);
            something.intialQIds.push(...initialQualificationIds);
            something.categories.push(...finalCategories);
            something.stateIds.push(...finalStateIds);
            something.utIds.push(...finalUTIds);
            something.districtIds.push(...finalDistrictIds);
            something.municipailityIds.push(...finalMunicipalityIds);
            something.panchayatIds.push(...finalPanchayatIds);
            something.statuses.push(...finalRecruitmentStatuses);
            something.expLvls.push(...finalMinExperience);
        }

        const orgIds = [...new Set([...something.orgIds.map(oid => oid.id), ...something.recruiterIds.map(rid => rid.id)])]

        const [dbOrgs, dbQualifications, dbStates, dbUTs, dbDistricts, dbMunicipalities, dbPanchayats] = await Promise.all([
            db.collection("orgs")
                .find({ _id: { $in: orgIds } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("qualifications")
                .find({ _id: { $in: something.intialQIds } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("states")
                .find({ _id: { $in: something.stateIds.map(sId => sId.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("unionTerritories")
                .find({ _id: { $in: something.utIds.map(uId => uId.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("districts")
                .find({ _id: { $in: something.districtIds.map(dId => dId.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("municipalities")
                .find({ _id: { $in: something.municipailityIds.map(mId => mId.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("panchayats")
                .find({ _id: { $in: something.panchayatIds.map(pId => pId.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray()
        ])

        const orgs = dbOrgs.filter(org => something.orgIds.some(oid => oid.id.toString() === org._id.toString())).map(org => ({
            ...org,
            isDisabled: something.orgIds.find(oid => oid.id.toString() === org._id.toString()).isDisabled
        }));

        const recruiters = dbOrgs.filter(org => something.recruiterIds.some(rid => rid.id.toString() === org._id.toString())).map(recruiter => ({
            ...recruiter,
            isDisabled: something.recruiterIds.find(rid => rid.id.toString() === recruiter._id.toString()).isDisabled
        }));

        const qualifications = dbQualifications.map(q => ({
            ...q,
            isDisabled: something.filteredQIds.some(oid => oid.id.toString() === q._id.toString()) ||
                something.aqls.includes(q.level)
        }));

        const states = dbStates.map(state => ({
            ...state,
            isDisabled: something.stateIds.find(sId => sId.id.toString() === state._id.toString()).isDisabled
        }));

        const uts = dbUTs.map(ut => ({
            ...ut,
            isDisabled: something.utIds.find(uId => uId.id.toString() === ut._id.toString()).isDisabled
        }));

        const districts = dbDistricts.map(org => ({
            ...org,
            isDisabled: something.districtIds.find(oId => oId.id.toString() === org._id.toString()).isDisabled
        }));

        const municipailities = dbMunicipalities.map(municipality => ({
            ...municipality,
            isDisabled: something.municipailityIds.find(mId => mId.id.toString() === municipality._id.toString()).isDisabled
        }));

        const panchayats = dbPanchayats.map(panchayat => ({
            ...panchayat,
            isDisabled: something.panchayatIds.find(pId => pId.id.toString() === panchayat._id.toString()).isDisabled
        }));

        const messages = await getMessages(lang);

        const details = {
            orgs,
            recruiters,
            categories: something.categories.map(cat => ({ name: messages.jobs.filters.categories[cat.slug], ...cat })),
            locations: [
                {
                    name: messages.jobs.filters.locations["all-india"],
                    slug: "all-india",
                    isDisabled: Object.keys(sp).length > 0 && !something.scopes.includes("all-india")
                },
                ...states,
                ...uts,
                ...districts,
                ...municipailities,
                ...panchayats
            ],
            qualifications: [
                {
                    name: messages.jobs.filters.qualifications["graduate"],
                    slug: "graduate",
                    isDisabled: Object.keys(sp).length > 0 && !something.aqls.includes("graduate")
                },
                ...qualifications
            ],
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
            { $set: { updatedAt: { $max: "$stages.updatedAt" } } },
            { $sort: { updatedAt: -1, _id: 1 } },
            { $limit: 6 },
            {
                $project: {
                    name: `$name.${lang}`,
                    fullName: `$fullName.${lang}`,
                    slug: 1,
                    year: 1,
                    location: 1,
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
                allowedQualificationLevels: 1,
                qualifications: 1,
                minimumExperience: 1,
                maximumExperience: 1
            })
            .toArray();

        const qualificationIds = jobs.filter(job => job.qualifications).flatMap(job => job.qualifications.map(q => q.qualificationId));
        const stateIds = recruitments.filter(rec => rec.location.states).flatMap(rec => rec.location.states.map(js => js.stateId));
        const utIds = recruitments.filter(rec => rec.location.uts).flatMap(rec => rec.location.uts.map(jut => jut.utId));
        const districtIds = recruitments.filter(rec => rec.location.districts).flatMap(rec => rec.location.districts.map(jd => jd.districtId));
        const municipailityIds = recruitments.filter(rec => rec.municipailities).flatMap(rec => rec.location.municipailities.map(jm => jm.municipailityId));
        const panchayatds = recruitments.filter(rec => rec.location.panchayats).flatMap(rec => rec.location.panchayats.map(jp => jp.panchayatId));

        const [qualifications, states, uts, districts, municipalities, panchayats] = await Promise.all([
            qualificationIds.length > 0 ? db.collection('qualifications')
                .find({ _id: { $in: qualificationIds } })
                .project({ name: `$name.${lang}`, shortForm: `$shortForm.${lang}` })
                .toArray() : [],
            stateIds.length > 0 ? db.collection('states')
                .find({ _id: { $in: stateIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : [],
            utIds.length > 0 ? db.collection('unionTerritories')
                .find({ _id: { $in: utIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : [],
            districtIds.length > 0 ? db.collection('districts')
                .find({ _id: { $in: districtIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : []
            , municipailityIds.length > 0 ? db.collection('municipalities')
                .find({ _id: { $in: municipailityIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : [],
            panchayatds.length > 0 ? db.collection('panchayats')
                .find({ _id: { $in: panchayatds } })
                .project({ name: `$name.${lang}` })
                .toArray() : []
        ]);

        const messages = await getMessages(lang);


        const finalRecruitmentsList = recruitments.map(recruitment => {

            const recruitmentJobIds = recruitment.jobs.map(job => job.jobId.toString());
            const recruitmentJobs = jobs.filter(job => recruitmentJobIds.includes(job._id.toString()));

            const categories = [...new Set(recruitmentJobs.flatMap(job => job.categories))].sort().map(cat => messages.jobs.filters.categories[cat]);

            let modifiedLocation = [];
            if (recruitment.location.scope === 'all-india')
                modifiedLocation.push(messages.jobs.filters.locations["all-india"]);
            else if (recruitment.location.scope === 'state')
                modifiedLocation.push(...recruitment.location.states.map(({ stateId }) => states.find(state => state._id.toString() === stateId.toString()).name));
            else if (recruitment.location.scope === 'ut')
                modifiedLocation.push(...recruitment.location.uts.map(({ utId }) => uts.find(ut => ut._id.toString() === utId.toString()).name));
            else if (recruitment.location.scope === 'district')
                modifiedLocation.push(...recruitment.location.districts.map(({ districtId }) => districts.find(district => district._id.toString() === districtId.toString()).name));
            else if (recruitment.location.scope === 'municipality')
                modifiedLocation.push(...recruitment.location.municipalities.map(({ municipalityId }) => municipalities.find(municipality => municipality._id.toString() === municipalityId.toString()).name));
            else if (recruitment.location.scope === 'panchayat')
                modifiedLocation.push(...recruitment.location.panchayats.map(({ panchayatId }) => panchayats.find(panchayat => panchayat._id.toString() === panchayatId.toString()).name));

            let recruitmentQualifications = [];
            recruitmentJobs.forEach(job => {
                if (!job.qualifications) {
                    let minimumQualificationLabel = messages.jobs.filters.qualifications[job.allowedQualificationLevels[0]];
                    if (!recruitmentQualifications.some(rq => rq.name === minimumQualificationLabel))
                        recruitmentQualifications.push({ name: minimumQualificationLabel });
                }
                else {
                    const recruitmentJobQualificationIds = recruitmentJobs.flatMap(job => job.qualifications).map(id => id.toString());
                    const matchedQualifications = qualifications.filter(q => recruitmentJobQualificationIds.includes(q._id.toString()));
                    recruitmentQualifications.push([...matchedQualifications]);
                }
            });
            const minimumExperience = Math.min([...recruitmentJobs.map(recJob => recJob.minimumExperience)]) || 0;
            const maximumExperience = Math.min([...recruitmentJobs.map(recJob => recJob.maximumExperience)]) || 0;
            return { ...recruitment, categories, location: modifiedLocation, qualifications: recruitmentQualifications, minimumExperience, maximumExperience };
        });

        return JSON.parse(JSON.stringify(finalRecruitmentsList));

    } catch (error) {
        console.error("getRecruitments failed:", error);
        throw error;
    }
};

//For Recruitment Overview and Recruitment Stage Pages' Metadata
export async function getRecruitmentMetadata(lang, recSlug, stageSlug) {
    const year = recSlug.substring(recSlug.lastIndexOf('-') + 1);
    let query = [
        { $match: { slug: recSlug } }
    ];

    if (stageSlug) {
        query = [
            ...query,
            { $unwind: "$stages" },
            { $match: { "stages.slug": stageSlug } },
            {
                $project: {
                    title: `$stages.metadata.title.${lang}`,
                    description: {
                        $getField: {
                            field: lang,
                            input: {
                                $getField: {
                                    field: "$stages.status",
                                    input: "$stages.metadata.description"
                                }
                            }
                        }
                    }
                }
            }
        ];

    }
    else
        query = [
            ...query,
            {
                $project: {
                    title: `$overview.metadata.title.${lang}`,
                    description: {
                        $getField: {
                            field: lang,
                            input: {
                                $getField: {
                                    field: "$status",
                                    input: "$overview.metadata.description"
                                }
                            }
                        }
                    }
                }
            }
        ];

    try {
        const db = await connectDB();
        const result = await db.collection('recruitments').aggregate(query).next();
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
                    location: 1,
                    jobs: 1,
                    status: 1,
                    notificationDate: "$contentVariables.notificationDate.en",
                    registrationDates: "$contentVariables.registrationDates.en"
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

        const recruitmentJobs = await db.collection('jobs')
            .find({ _id: { $in: recruitmentJobIds } })
            .project({ orgId: "$org.orgId", name: `$name.${lang}`, jobType: 1 })
            .toArray();

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

        const { notificationDate, registrationDates, location } = recruitmentDetails;

        const locationJsonLd = formatLocationJsonLd(location);

        const registrationEndDate = registrationDates.substring(registrationDates.lastIndexOf('to ') + 3);

        const base = {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            ...(locationJsonLd && {
                "jobLocation": { "@type": "Place", "address": locationJsonLd }
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

export async function getRecruitmentContent(lang, recSlug, stageSlug) {
    const year = recSlug.substring(recSlug.lastIndexOf('-') + 1);
    let query = [
        { $match: { slug: recSlug } }
    ];

    if (stageSlug) {
        query = [
            ...query,
            { $unwind: "$stages" },
            { $match: { "stages.slug": stageSlug } },
            {
                $project: {
                    name: `$name.${lang}`,
                    stage: `$stages.name.${lang}`,
                    status: "$stages.status",
                    contentVariables: 1,
                    updatedAt: "$stages.updatedAt",
                    content: {
                        $getField: {
                            field: lang,
                            input: {
                                $getField: {
                                    field: "$stages.status",
                                    input: "$stages.content"
                                }
                            }
                        }
                    }
                }
            }
        ];

    }
    else
        query = [
            ...query,
            {
                $project: {
                    contentVariables: 1,
                    updatedAt: { $max: "$stages.updatedAt" },
                    content: {
                        $getField: {
                            field: lang,
                            input: {
                                $getField: {
                                    field: "$status",
                                    input: "$overview.content"
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
            let { contentVariables, content, updatedAt } = recruitment;
            content = content.replace(RegExp(`\\(\\(lang\\)\\)`, "g"), lang);
            content = content.replace(RegExp(`\\(\\(year\\)\\)`, "g"), year);
            Object.keys(contentVariables).filter(key => content.includes(`((${key}))`)).map(key => {
                const value = contentVariables[key][lang];
                content = content.replace(RegExp(`\\(\\(${key}\\)\\)`, "g"), value);
            });
            // if (content.includes('stage-card')) {
            //     const { name, stage, link, status } = recruitment;
            //     const stageCard = generateStageCard(name, stage, link, status);
            //     content = content.replace("stage-card", stageCard);
            // }
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
        const recruitment = await db.collection('recruitments').findOne(
            { slug: recSlug },
            { projection: { name: `$name.${lang}`, stages: { name: 1, slug: 1, status: 1 } } }
        );
        if (!recruitment)
            return null;

        const stages = recruitment.stages.map(stage => ({ ...stage, name: stage.name[lang] }));

        return { stages };

    } catch (error) {
        console.error("getRecruitmentSidebarDetails failed:", error);
        throw error;
    }
};

//For Recruitment Page
export async function validateRecruitment(recSlug) {
    try {
        const db = await connectDB();
        const recruitment = await db.collection('recruitments').findOne(
            { slug: recSlug, isActive: true },
            { projection: { cycles: { year: 1 } } }
        );
        if (!recruitment)
            return { exists: false }
        else
            return { exists: true, currentYear: recruitment.cycles[0].year };
    } catch (error) {
        console.error("validateRecruitment failed:", error);
        throw error;
    }
}

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

        let qualificationName;

        if (qualification) {
            if (qualification === "graduate")
                qualificationName = "Graduates";
            else {
                const result = await db.collection('qualifications').findOne(
                    { slug: qualification },
                    { projection: { name: `$name.${lang}`, level: 1 } }
                );

                if (result.level.includes('Graduate'))
                    qualificationName = `${result.name} graduates`
                else
                    qualificationName = result.name;
            }

        }

        let expLvlName;

        if (expLvl) {
            if (qualification)
                expLvlName = deslugify(expLvl);
            else
                expLvlName = expLvl === 'fresher' ? 'Freshers' : 'Experienced Professionals';
        }

        const displayParams = {
            org: orgName,
            cat: deslugify(cat),
            rStatus,
            qualification: qualificationName,
            expLvl: expLvlName,
            location: deslugify(location),
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
async function createJobsSearchQuery({ search, org, rStatus, cat, qualification, expLvl, location } = {}) {
    let query = {
        $and: [{ hidden: false }]
    };

    if (search) {
        const searchRegex = { $regex: search, $options: "i" };
        query.$and.push({
            $or: [
                { name: searchRegex },
                { slug: searchRegex }
            ]
        });
    }

    if (cat) {
        const modifiedCat = cat.replace(/-/g, " ");
        query.$and.push({ categories: { $regex: modifiedCat, $options: "i" } });
    }

    if (expLvl) {
        query.$and.push({ minimumExperience: expLvl === 'experienced' ? { $gt: 0 } : 0 });
    }

    if (qualification) {
        if (qualification === 'graduate')
            query.$and.push({ allowedQualificationLevels: "Graduate" })
        else {
            try {
                const db = await connectDB();
                const qualificationDetails = await db.collection('qualifications').findOne({ slug: qualification }, { projection: { level: 1 } });
                query.$and.push({
                    $or: [
                        {
                            $and: [
                                { qualifications: { $exists: false } },
                                { allowedQualificationLevels: qualificationDetails.level }
                            ]
                        },
                        { "qualifications.slug": qualification }
                    ]
                });
            } catch (error) {
                console.error("getting qualification details failed: ", error);
            }
        }
    }

    if (location) {
        if (location === 'all-india')
            query.$and.push({ "location.scope": "all-india" });
        else {
            query.$and.push({
                $or: [
                    { "location.states.slug": location },
                    { "location.uts.slug": location },
                    { "location.districts.slug": location },
                    { "location.municipailities.slug": location },
                    { "location.panchayats.slug": location }
                ]
            });
        }
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

//For Jobs Page
export async function getJobs({ search, org, rStatus, cat, qualification, expLvl, location, lang, page = 1 } = {}) {

    let query = await createJobsSearchQuery({ search, org, rStatus, cat, qualification, expLvl, location });

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
                        { $set: { updatedAt: { $max: "$recruitments.updatedAt" } } },
                        { $sort: { updatedAt: -1, "name.en": 1 } },
                        { $skip: (page - 1) * ITEM_PER_PAGE },
                        { $limit: ITEM_PER_PAGE },
                        {
                            $project: {
                                orgId: "$org.orgId",
                                name: `$name.${lang}`,
                                slug: 1,
                                categories: 1,
                                location: 1,
                                allowedQualificationLevels: 1,
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
        const qualificationIds = jobs.filter(job => job.qualifications).flatMap(job => job.qualifications.map(q => q.qualificationId));
        const stateIds = jobs.filter(job => job.location.states).flatMap(job => job.location.states.map(js => js.stateId));
        const utIds = jobs.filter(job => job.location.uts).flatMap(job => job.location.uts.map(jut => jut.utId));
        const districtIds = jobs.filter(job => job.location.districts).flatMap(job => job.location.districts.map(jd => jd.districtId));
        const municipailityIds = jobs.filter(job => job.municipailities).flatMap(job => job.location.municipailities.map(jm => jm.municipailityId));
        const panchayatds = jobs.filter(job => job.location.panchayats).flatMap(job => job.location.panchayats.map(jp => jp.panchayatId));
        const [orgs, qualifications, states, uts, districts, municipalities, panchayats] = await Promise.all([
            db.collection('orgs')
                .find({ _id: { $in: orgIds } })
                .project({ name: `$name.${lang}`, logo: "$logoSrc" })
                .toArray(),
            qualificationIds.length > 0 ? db.collection('qualifications')
                .find({ _id: { $in: qualificationIds } })
                .project({ name: `$name.${lang}`, shortForm: `$shortForm.${lang}` })
                .toArray() : [],
            stateIds.length > 0 ? db.collection('states')
                .find({ _id: { $in: stateIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : [],
            utIds.length > 0 ? db.collection('unionTerritories')
                .find({ _id: { $in: utIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : [],
            districtIds.length > 0 ? db.collection('districts')
                .find({ _id: { $in: districtIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : []
            , municipailityIds.length > 0 ? db.collection('municipalities')
                .find({ _id: { $in: municipailityIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : [],
            panchayatds.length > 0 ? db.collection('panchayats')
                .find({ _id: { $in: panchayatds } })
                .project({ name: `$name.${lang}` })
                .toArray() : []
        ]);

        const messages = await getMessages(lang);

        const finalJobList = jobs.map((job) => {
            const jobOrg = orgs.find(org => job.orgId.toString() === org._id.toString());

            let modifiedCategories = job.categories.map(cat => messages.jobs.filters.categories[cat]);

            let modifiedLocation = [];
            if (job.location.scope === 'all-india')
                modifiedLocation.push(messages.jobs.filters.locations["all-india"]);
            else if (job.location.scope === 'state')
                modifiedLocation.push(...job.location.states.map(({ stateId }) => states.find(state => state._id.toString() === stateId.toString()).name));
            else if (job.location.scope === 'ut')
                modifiedLocation.push(...job.location.uts.map(({ utId }) => uts.find(ut => ut._id.toString() === utId.toString()).name));
            else if (job.location.scope === 'district')
                modifiedLocation.push(...job.location.districts.map(({ districtId }) => districts.find(district => district._id.toString() === districtId.toString()).name));
            else if (job.location.scope === 'municipality')
                modifiedLocation.push(...job.location.municipalities.map(({ municipalityId }) => municipalities.find(municipality => municipality._id.toString() === municipalityId.toString()).name));
            else if (job.location.scope === 'panchayat')
                modifiedLocation.push(...job.location.panchayats.map(({ panchayatId }) => panchayats.find(panchayat => panchayat._id.toString() === panchayatId.toString()).name));

            let modifiedQualifications;
            if (!job.qualifications) {
                let minimumQualification = job.allowedQualificationLevels[0];
                modifiedQualifications = [{ name: messages.jobs.filters.qualifications[minimumQualification] }];
            }
            else {
                const jobQualificationIds = job.qualifications.map(q => q.qualificationId.toString());
                modifiedQualifications = qualifications.filter(q => jobQualificationIds.includes(q._id.toString()));
            }

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
        // throw error;
    }
};

//For Jobs Page Sidebar
export async function getJobsFilters({ lang, sp = {} }) {


    try {
        const db = await connectDB();

        let something = {
            orgIds: [],
            aqls: [],
            intialQIds: [],
            filteredQIds: [],
            categories: [],
            scopes: [],
            stateIds: [],
            utIds: [],
            districtIds: [],
            municipailityIds: [],
            panchayatIds: [],
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
            let aqlQuery =
                qualificationQuery.$and ?
                    { ...qualificationQuery, $and: [...qualificationQuery.$and, { qualifications: { $exists: false } }] } :
                    { qualifications: { $exists: false } };
            let categoryQuery = await createJobsSearchQuery(categorySP);
            let locationQuery = await createJobsSearchQuery(locationSP);
            let rStatusQuery = await createJobsSearchQuery(rStatusSP);
            let expLvlQuery = await createJobsSearchQuery(expLvlSP);

            const filterDetails = await db.collection('jobs').aggregate([
                { $match: { hidden: false } },
                {
                    $facet: {
                        initialOrgIds: [{ $group: { _id: "$org.orgId" } }],
                        initialQualificationIds: [
                            { $unwind: "$qualifications" },
                            { $group: { _id: "$qualifications.qualificationId" } }
                        ],
                        initialCategories: [
                            { $unwind: "$categories" },
                            { $group: { _id: "$categories" } }
                        ],
                        initialStates: [
                            { $match: { "location.scope": "state" } },
                            { $unwind: "$location.states" },
                            { $group: { _id: "$location.states.stateId" } }
                        ],
                        initialUTs: [
                            { $match: { "location.scope": "ut" } },
                            { $unwind: "$location.uts" },
                            { $group: { _id: "$location.uts.utId" } }
                        ],
                        initialDistricts: [
                            { $match: { "location.scope": "district" } },
                            { $unwind: "$location.districts" },
                            { $group: { _id: "$location.districts.districtId" } }
                        ],
                        initialMunicipalities: [
                            { $match: { "location.scope": "municipality" } },
                            { $unwind: "$location.municipalities" },
                            { $group: { _id: "$location.municipalities.municipalityId" } }
                        ],
                        initialPanchayats: [
                            { $match: { "location.scope": "panchayat" } },
                            { $unwind: "$location.panchayats" },
                            { $group: { _id: "$location.panchayats.panchayatId" } }
                        ],
                        initialRecruitmentStatuses: [
                            { $unwind: "$recruitments" },
                            { $group: { _id: "$recruitments.status" } }
                        ],
                        initialExperiences: [{ $group: { _id: "$minimumExperience" } }],
                        filteredOrgIds: [
                            { $match: orgQuery },
                            { $group: { _id: "$org.orgId" } }
                        ],
                        finalAQLs: [
                            { $match: aqlQuery },
                            { $unwind: "$allowedQualificationLevels" },
                            { $group: { _id: "$allowedQualificationLevels" } }
                        ],
                        filteredQualificationIds: [
                            { $match: qualificationQuery },
                            { $unwind: "$qualifications" },
                            { $group: { _id: "$qualifications.qualificationId" } }
                        ],
                        filteredCategories: [
                            { $match: categoryQuery },
                            { $unwind: "$categories" },
                            { $group: { _id: "$categories" } }
                        ],
                        finalScopes: [
                            { $match: locationQuery },
                            { $group: { _id: "$location.scope" } }
                        ],
                        filteredStates: [
                            { $match: locationQuery },
                            { $unwind: "$location.states" },
                            { $group: { _id: "$location.states.stateId" } }
                        ],
                        filteredUTs: [
                            { $match: locationQuery },
                            { $unwind: "$location.uts" },
                            { $group: { _id: "$location.uts.utId" } }
                        ],
                        filteredDistricts: [
                            { $match: locationQuery },
                            { $unwind: "$location.districts" },
                            { $group: { _id: "$location.districts.districtId" } }
                        ],
                        filteredMunicipalities: [
                            { $match: locationQuery },
                            { $unwind: "$location.municipalities" },
                            { $group: { _id: "$location.municipalities.municipalityId" } }
                        ],
                        filteredPanchayats: [
                            { $match: locationQuery },
                            { $unwind: "$location.panchayats" },
                            { $group: { _id: "$location.panchayats.panchayatId" } }
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
                        initialOrgIds: "$initialOrgIds._id",
                        initialQualificationIds: "$initialQualificationIds._id",
                        initialCategories: "$initialCategories._id",
                        initialStateIds: "$initialStates._id",
                        initialUTIds: "$initialUTs._id",
                        initialDistrictIds: "$initialDistricts._id",
                        initialMunicipalityIds: "$initialMunicipalities._id",
                        initialPanchayatIds: "$initialPanchayats._id",
                        initialRecruitmentStatuses: "$initialRecruitmentStatuses._id",
                        initialExperiences: "$initialExperiences._id",
                        filteredOrgIds: "$filteredOrgIds._id",
                        finalAQLs: "$finalAQLs._id",
                        filteredQualificationIds: "$filteredQualificationIds._id",
                        filteredCategories: "$filteredCategories._id",
                        finalScopes: "$finalScopes._id",
                        filteredStateIds: "$filteredStates._id",
                        filteredUTIds: "$filteredUTs._id",
                        filteredDistrictIds: "$filteredDistricts._id",
                        filteredMunicipalityIds: "$filteredMunicipalities._id",
                        filteredPanchayatIds: "$filteredPanchayats._id",
                        filteredRecruitmentStatuses: "$filteredRecruitmentStatuses._id",
                        filteredMinExperience: "$filteredMinExperience._id"
                    }
                }
            ]).next();

            const {
                initialOrgIds,
                initialQualificationIds,
                initialCategories,
                initialStateIds,
                initialUTIds,
                initialDistrictIds,
                initialMunicipalityIds,
                initialPanchayatIds,
                initialRecruitmentStatuses,
                filteredOrgIds,
                finalAQLs,
                filteredQualificationIds,
                filteredCategories,
                finalScopes,
                filteredStateIds,
                filteredUTIds,
                filteredDistrictIds,
                filteredMunicipalityIds,
                filteredPanchayatIds,
                filteredRecruitmentStatuses,
                filteredMinExperience
            } = filterDetails;

            const finalOrgIds = initialOrgIds.map(id => ({ id, isDisabled: !filteredOrgIds.some(fId => fId.toString() === id.toString()) }));
            const finalCategories = initialCategories.map(cat => ({ slug: cat, isDisabled: !filteredCategories.includes(cat) }));
            const finalStateIds = initialStateIds.map(id => ({ id, isDisabled: !filteredStateIds.some(fId => fId.toString() === id.toString()) }));
            const finalUTIds = initialUTIds.map(id => ({ id, isDisabled: !filteredUTIds.some(fId => fId.toString() === id.toString()) }));
            const finalDistrictIds = initialDistrictIds.map(id => ({ id, isDisabled: !filteredDistrictIds.some(fId => fId.toString() === id.toString()) }));
            const finalMunicipalityIds = initialMunicipalityIds.map(id => ({ id, isDisabled: !filteredMunicipalityIds.some(fId => fId.toString() === id.toString()) }));
            const finalPanchayatIds = initialPanchayatIds.map(id => ({ id, isDisabled: !filteredPanchayatIds.some(fId => fId.toString() === id.toString()) }));
            const finalRecruitmentStatuses = initialRecruitmentStatuses.sort().reverse().map(rStatus => ({ status: rStatus, isDisabled: !filteredRecruitmentStatuses.includes(rStatus) }));
            const finalMinExperience = [
                { slug: "fresher", isDisabled: !filteredMinExperience.some(exp => exp === 0) },
                { slug: "experienced", isDisabled: !filteredMinExperience.some(exp => exp > 0) }
            ]

            something.orgIds.push(...finalOrgIds);
            something.aqls.push(...finalAQLs);
            something.intialQIds.push(...initialQualificationIds);
            something.filteredQIds.push(...filteredQualificationIds);
            something.categories.push(...finalCategories);
            something.scopes.push(...finalScopes);
            something.stateIds.push(...finalStateIds);
            something.utIds.push(...finalUTIds);
            something.districtIds.push(...finalDistrictIds);
            something.municipailityIds.push(...finalMunicipalityIds);
            something.panchayatIds.push(...finalPanchayatIds);
            something.rStatuses.push(...finalRecruitmentStatuses);
            something.expLvls.push(...finalMinExperience);
        }
        else {

            const initialFilterDetails = await db.collection('jobs').aggregate([
                { $match: { hidden: false } },
                {
                    $facet: {
                        initialOrgIds: [{ $group: { _id: "$org.orgId" } }],
                        initialQualificationIds: [
                            { $unwind: "$qualifications" },
                            { $group: { _id: "$qualifications.qualificationId" } }
                        ],
                        initialCategories: [
                            { $unwind: "$categories" },
                            { $group: { _id: "$categories" } }
                        ],
                        initialStates: [
                            { $match: { "location.scope": "state" } },
                            { $unwind: "$location.states" },
                            { $group: { _id: "$location.states.stateId" } }
                        ],
                        initialUTs: [
                            { $match: { "location.scope": "ut" } },
                            { $unwind: "$location.uts" },
                            { $group: { _id: "$location.uts.utId" } }
                        ],
                        initialDistricts: [
                            { $match: { "location.scope": "district" } },
                            { $unwind: "$location.districts" },
                            { $group: { _id: "$location.districts.districtId" } }
                        ],
                        initialMunicipalities: [
                            { $match: { "location.scope": "municipality" } },
                            { $unwind: "$location.municipalities" },
                            { $group: { _id: "$location.municipalities.municipalityId" } }
                        ],
                        initialPanchayats: [
                            { $match: { "location.scope": "panchayat" } },
                            { $unwind: "$location.panchayats" },
                            { $group: { _id: "$location.panchayats.panchayatId" } }
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
                        initialOrgIds: "$initialOrgIds._id",
                        initialQualificationIds: "$initialQualificationIds._id",
                        initialCategories: "$initialCategories._id",
                        initialStateIds: "$initialStates._id",
                        initialUTIds: "$initialUTs._id",
                        initialDistrictIds: "$initialDistricts._id",
                        initialMunicipalityIds: "$initialMunicipalities._id",
                        initialPanchayatIds: "$initialPanchayats._id",
                        initialRecruitmentStatuses: "$initialRecruitmentStatuses._id",
                        initialExperiences: "$initialExperiences._id",
                    }
                }
            ]).next();

            const {
                initialOrgIds,
                initialQualificationIds,
                initialCategories,
                initialStateIds,
                initialUTIds,
                initialDistrictIds,
                initialMunicipalityIds,
                initialPanchayatIds,
                initialRecruitmentStatuses,
                initialExperiences
            } = initialFilterDetails;

            const finalOrgIds = initialOrgIds.map(id => ({ id, isDisabled: false }))
            const finalCategories = initialCategories.map(cat => ({ slug: cat, isDisabled: false }))
            const finalStateIds = initialStateIds.map(id => ({ id, isDisabled: false }))
            const finalUTIds = initialUTIds.map(id => ({ id, isDisabled: false }))
            const finalDistrictIds = initialDistrictIds.map(id => ({ id, isDisabled: false }))
            const finalMunicipalityIds = initialMunicipalityIds.map(id => ({ id, isDisabled: false }))
            const finalPanchayatIds = initialPanchayatIds.map(id => ({ id, isDisabled: false }))
            const finalRecruitmentStatuses = initialRecruitmentStatuses.sort().reverse().map(rStatus => ({ status: rStatus, isDisabled: false }))
            const finalMinExperience = [
                { slug: "fresher", isDisabled: !initialExperiences.some(exp => exp === 0) },
                { slug: "experienced", isDisabled: !initialExperiences.some(exp => exp > 0) }
            ]

            something.orgIds.push(...finalOrgIds);
            something.intialQIds.push(...initialQualificationIds);
            something.categories.push(...finalCategories);
            something.stateIds.push(...finalStateIds);
            something.utIds.push(...finalUTIds);
            something.districtIds.push(...finalDistrictIds);
            something.municipailityIds.push(...finalMunicipalityIds);
            something.panchayatIds.push(...finalPanchayatIds);
            something.rStatuses.push(...finalRecruitmentStatuses);
            something.expLvls.push(...finalMinExperience);
        }


        const [dbOrgs, dbQualifications, dbStates, dbUTs, dbDistricts, dbMunicipalities, dbPanchayats] = await Promise.all([
            db.collection("orgs")
                .find({ _id: { $in: something.orgIds.map(oId => oId.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("qualifications")
                .find({ _id: { $in: something.intialQIds } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("states")
                .find({ _id: { $in: something.stateIds.map(sId => sId.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("unionTerritories")
                .find({ _id: { $in: something.utIds.map(uId => uId.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("districts")
                .find({ _id: { $in: something.districtIds.map(dId => dId.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("municipalities")
                .find({ _id: { $in: something.municipailityIds.map(mId => mId.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray(),
            db.collection("panchayats")
                .find({ _id: { $in: something.panchayatIds.map(pId => pId.id) } })
                .project({ name: `$name.${lang}`, slug: 1 })
                .toArray()
        ])

        const orgs = dbOrgs.map(org => ({
            ...org,
            isDisabled: something.orgIds.find(oid => oid.id.toString() === org._id.toString()).isDisabled
        }));

        const qualifications = dbQualifications.map(q => ({
            ...q,
            isDisabled:
                something.filteredQIds.some(oid => oid.id.toString() === q._id.toString()) ||
                something.aqls.includes(q.level)
        }));

        const states = dbStates.map(state => ({
            ...state,
            isDisabled: something.stateIds.find(sId => sId.id.toString() === state._id.toString()).isDisabled
        }));

        const uts = dbUTs.map(ut => ({
            ...ut,
            isDisabled: something.utIds.find(uId => uId.id.toString() === ut._id.toString()).isDisabled
        }));

        const districts = dbDistricts.map(org => ({
            ...org,
            isDisabled: something.districtIds.find(oId => oId.id.toString() === org._id.toString()).isDisabled
        }));

        const municipailities = dbMunicipalities.map(municipality => ({
            ...municipality,
            isDisabled: something.municipailityIds.find(mId => mId.id.toString() === municipality._id.toString()).isDisabled
        }));

        const panchayats = dbPanchayats.map(panchayat => ({
            ...panchayat,
            isDisabled: something.panchayatIds.find(pId => pId.id.toString() === panchayat._id.toString()).isDisabled
        }));

        const messages = await getMessages(lang);

        const details = {
            orgs,
            categories: something.categories.map(cat => ({ name: messages.jobs.filters.categories[cat.slug], ...cat })),
            qualifications: [
                {
                    name: messages.jobs.filters.qualifications["graduate"],
                    slug: "graduate",
                    isDisabled: Object.keys(sp).length > 0 && !something.aqls.includes("graduate")
                },
                ...qualifications
            ],
            locations: [
                {
                    name: messages.jobs.filters.locations["all-india"],
                    slug: "all-india",
                    isDisabled: Object.keys(sp).length > 0 && !something.scopes.includes("all-india")
                },
                ...states,
                ...uts,
                ...districts,
                ...municipailities,
                ...panchayats
            ],
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
            .sort({ popularityScore: -1 })
            .limit(6)
            .project({
                orgId: "$org.orgId",
                recruitments: 1,
                name: `$name.${lang}`,
                slug: 1,
                categories: 1,
                location: 1,
                allowedQualificationLevels: 1,
                qualifications: 1,
                minimumExperience: 1,
                maximumExperience: 1,
                minimumSalary: 1,
                maximumSalary: 1,
            })
            .toArray();

        const orgIds = jobs.map(job => job.orgId);
        const qualificationIds = jobs.filter(job => job.qualifications).flatMap(job => job.qualifications.map(q => q.qualificationId));
        const stateIds = jobs.filter(job => job.location.states).flatMap(job => job.location.states.map(js => js.stateId));
        const utIds = jobs.filter(job => job.location.uts).flatMap(job => job.location.uts.map(jut => jut.utId));
        const districtIds = jobs.filter(job => job.location.districts).flatMap(job => job.location.districts.map(jd => jd.districtId));
        const municipailityIds = jobs.filter(job => job.municipailities).flatMap(job => job.location.municipailities.map(jm => jm.municipailityId));
        const panchayatds = jobs.filter(job => job.location.panchayats).flatMap(job => job.location.panchayats.map(jp => jp.panchayatId));
        const [orgs, qualifications, states, uts, districts, municipalities, panchayats] = await Promise.all([
            db.collection('orgs')
                .find({ _id: { $in: orgIds } })
                .project({ name: `$name.${lang}`, logo: "$logoSrc" })
                .toArray(),
            qualificationIds.length > 0 ? db.collection('qualifications')
                .find({ _id: { $in: qualificationIds } })
                .project({ name: `$name.${lang}`, shortForm: `$shortForm.${lang}` })
                .toArray() : [],
            stateIds.length > 0 ? db.collection('states')
                .find({ _id: { $in: stateIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : [],
            utIds.length > 0 ? db.collection('unionTerritories')
                .find({ _id: { $in: utIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : [],
            districtIds.length > 0 ? db.collection('districts')
                .find({ _id: { $in: districtIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : []
            , municipailityIds.length > 0 ? db.collection('municipalities')
                .find({ _id: { $in: municipailityIds } })
                .project({ name: `$name.${lang}` })
                .toArray() : [],
            panchayatds.length > 0 ? db.collection('panchayats')
                .find({ _id: { $in: panchayatds } })
                .project({ name: `$name.${lang}` })
                .toArray() : []
        ]);

        const messages = await getMessages(lang);

        const finalJobList = jobs.map((job) => {
            const jobOrg = orgs.find(org => job.orgId.toString() === org._id.toString());

            let modifiedCategories = job.categories.map(cat => messages.jobs.filters.categories[cat]);

            let modifiedLocation = [];
            if (job.location.scope === 'all-india')
                modifiedLocation.push(messages.jobs.filters.locations["all-india"]);
            else if (job.location.scope === 'state')
                modifiedLocation.push(...job.location.states.map(({ stateId }) => states.find(state => state._id.toString() === stateId.toString()).name));
            else if (job.location.scope === 'ut')
                modifiedLocation.push(...job.location.uts.map(({ utId }) => uts.find(ut => ut._id.toString() === utId.toString()).name));
            else if (job.location.scope === 'district')
                modifiedLocation.push(...job.location.districts.map(({ districtId }) => districts.find(district => district._id.toString() === districtId.toString()).name));
            else if (job.location.scope === 'municipality')
                modifiedLocation.push(...job.location.municipalities.map(({ municipalityId }) => municipalities.find(municipality => municipality._id.toString() === municipalityId.toString()).name));
            else if (job.location.scope === 'panchayat')
                modifiedLocation.push(...job.location.panchayats.map(({ panchayatId }) => panchayats.find(panchayat => panchayat._id.toString() === panchayatId.toString()).name));

            let modifiedQualifications;
            if (!job.qualifications) {
                let minimumQualification = job.allowedQualificationLevels[0];
                modifiedQualifications = [{ name: messages.jobs.filters.qualifications[minimumQualification] }];
            }
            else {
                const jobQualificationIds = job.qualifications.map(q => q.qualificationId.toString());
                modifiedQualifications = qualifications.filter(q => jobQualificationIds.includes(q._id.toString()));
            }

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
export async function getJobMetadata(lang, jobSlug, jobNavSlug) {
    const dbKey = {
        "eligibility-criteria": "eligibilityCriteria",
        "selection-process": "selectionProcess",
        "recruitments": "recruitmentDetails"
    }[jobNavSlug] || 'overview';
    try {
        const db = await connectDB();
        const jobDetails = await db.collection('jobs')
            .findOne(
                { slug: jobSlug, hidden: false },
                {
                    projection: {
                        title: `$${dbKey}.metadata.title.${lang}`,
                        description: `$${dbKey}.metadata.description.${lang}`
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

export async function getJobContent(lang, jobSlug, jobNavSlug) {

    const dbKey = jobNavSlug ? {
        "eligibility-criteria": "eligibilityCriteria",
        "selection-process": "selectionProcess"
    }[jobNavSlug] : 'overview';

    let projection = { minimumSalary: 1, maximumSalary: 1, content: `$${dbKey}.content.${lang}`, updatedAt: 1 };

    try {
        const db = await connectDB();
        const jobDetails = await db.collection('jobs').findOne({ slug: jobSlug, hidden: false }, { projection });

        if (!jobDetails)
            return null;

        let dbContent = jobDetails.content;

        dbContent = dbContent.replaceAll('((lang))', lang);

        if (!jobNavSlug) {
            const { minimumSalary, maximumSalary } = jobDetails;
            dbContent = dbContent.replace('((minimumSalary))', minimumSalary.toLocaleString("en-IN"));
            dbContent = dbContent.replace('((maximumSalary))', maximumSalary.toLocaleString("en-IN"));
        }

        const lastUpdated = generateLastUpdated(jobDetails.updatedAt);
        dbContent = dbContent.replace('last_updated', lastUpdated);

        return dbContent;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getJobRecruitmentDetails(jobSlug, lang) {

    try {
        const db = await connectDB();
        const jobDetails = await db.collection('jobs').aggregate([
            { $match: { slug: jobSlug, hidden: false } },
            {
                $project: {
                    org: 1,
                    recruitments: 1,
                    pageHeading: `$recruitmentDetails.title.${lang}`
                }
            }
        ]).next();

        if (!jobDetails)
            return null;

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
            {
                $addFields: {
                    currentStage: {
                        $last: {
                            $filter: {
                                input: "$stages",
                                as: "s",
                                cond: { $in: ["$$s.status", ["ongoing", "completed"]] }
                            }
                        }
                    },
                    upcomingStage: {
                        $first: {
                            $filter: {
                                input: "$stages",
                                as: "s",
                                cond: { $eq: ["$$s.status", "upcoming"] }
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
                    currentStageContent: {
                        $getField: {
                            field: lang,
                            input: {
                                $getField: {
                                    field: "$currentStage.status",
                                    input: "$currentStage.content"
                                }
                            }
                        }
                    },
                    upcomingStageSlug: "$upcomingStage.slug",
                    upcomingStageContent: {
                        $getField: {
                            field: lang,
                            input: {
                                $getField: {
                                    field: "$upcomingStage.status",
                                    input: "$upcomingStage.content"
                                }
                            }
                        }
                    },
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
                    upcomingStageContent,
                    currentStageSlug,
                    currentStageContent,
                    contentVariables,
                    ...rest
                } = recruitment;
                const overviewLink = `/${lang}/recruitments/${slug}`;
                const currentStageLink = `${overviewLink}/${currentStageSlug}`;
                const upcomingStageLink = `${overviewLink}/${upcomingStageSlug}`;
                let usc = cheerio.load(upcomingStageContent, null, false);
                let csc = cheerio.load(currentStageContent, null, false);
                let currentStatus = csc('header > p').first().html();
                let whatsNext = usc('header > p').first().html();
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
            recruitments = []


        const orgDetails = await db.collection('orgs').findOne(
            { _id: jobDetails.org.orgId },
            { projection: { name: `$name.${lang}` } }
        )


        const finalJobDetails = {
            ...jobDetails,
            orgName: orgDetails.name,
            recruitments
        }
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
            'selectionProcess',
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
                            { $match: { "qualifications.slug": "10th-pass" } },
                            { $unwind: "$recruitments" },
                            { $group: { _id: "$recruitments.recruitmentId" } }
                        ],
                        graduateRecruitmentIds: [
                            { $match: { allowedQualificationLevels: "Graduate" } },
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
    const expLvls = ['fresher'];
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
        const [state, ut, district, municipaility, panchayat] = await Promise.all([
            db.collection('states').findOne(
                { slug: slug },
                { projection: { name: `$name.${lang}` } }
            ),
            db.collection('unionTerritories').findOne(
                { slug: slug },
                { projection: { name: `$name.${lang}` } }
            ),
            db.collection('districts').findOne(
                { slug: slug },
                { projection: { name: `$name.${lang}` } }
            ),
            db.collection('municipalities').findOne(
                { slug: slug },
                { projection: { name: `$name.${lang}` } }
            ),
            db.collection('panchayats').findOne(
                { slug: slug },
                { projection: { name: `$name.${lang}` } }
            )
        ]);
        const [matchedDoc] = [state, ut, district, municipaility, panchayat].filter(Boolean);
        if (!matchedDoc)
            return null;
        return matchedDoc.name;
    } catch (error) {

    }
}

export function generateLastUpdated(updatedAt) {
    const date = new Date(updatedAt);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleDateString("en-IN", {
        month: "short"
    });
    const year = date.getFullYear();
    return `<p class="text-sm text-gray-500 dark:text-gray-400 italic">Last Updated: ${day} ${month}, ${year}</p>`;
}
const stageDescriptions = [
    {
        stage: ["Notification"],
        upcoming: {
            en: "{{stage}} {{year}} notification is awaited. Check expected release date, eligibility criteria, and vacancy details here."
        },
        completed: {
            en: "{{recruitmentName}} {{year}} notification has been released. Check eligibility criteria, vacancy details, and download the official notification PDF here."
        }
    },
    {
        stage: ["Registration"],
        upcoming: {
            en: "{{recruitmentName}} {{year}} registration is yet to begin. Check expected start date, how to apply, and required documents here.",
        },
        ongoing: {
            en: "{{recruitmentName}} {{year}} registration is open. Check how to apply, required documents, and last date to apply here."
        },
        completed: {
            en: "{{recruitmentName}} {{year}} registration has ended. Check the last date that was applicable and stay updated on the next steps in the recruitment process."
        }
    },
    {
        stage: ["Prelims Admit Card", "Mains Admit Card", "CBT 1 Admit Card", , "CBT 2 Admit Card"],
        upcoming: {
            en: "{{recruitmentName}} {{year}} admit card is yet to be released. Check expected release date and steps to download your hall ticket here."
        },
        ongoing: {
            en: "{{recruitmentName}} {{year}} admit card is out. Download your hall ticket now and check exam date, exam city, and reporting time here."
        },
        completed: {
            en: "{{recruitmentName}} {{year}} admit card download window has closed. Check exam details and stay updated on the next steps in the recruitment process."
        }
    },
    {
        stage: ["Prelims", "Mains", "CBT 1", "CBT 2"],
        upcoming: {
            en: "{{recruitmentName}} {{year}} exam date has not been announced yet. Check expected exam schedule and preparation tips here."
        }
    }
]

export default function getStageDescription(stage, status, recruitmentName, year, lang = 'en') {
    const entry = stageDescriptions.find(item => item.stage.includes(stage));
    const template = entry[status][lang] || entry[status]['en'];

    return template
        .replace(/\{\{recruitmentName\}\}/g, recruitmentName)
        .replace(/\{\{year\}\}/g, year)
        .replace(/\{\{stage\}\}/g, stage);
}
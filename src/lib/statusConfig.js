import { Bell, Calendar, FileText, CheckCircle, BookText } from "lucide-react";

const statusConfig = {
    "Applications": {
        color: "bg-emerald-50 dark:bg-emerald-700 text-emerald-700 dark:text-emerald-50 border-emerald-200 dark:border-emerald-700",
        icon: <FileText className="w-3 h-3" />,
    },
    "Notification": {
        color: "bg-blue-50 dark:bg-blue-700 text-blue-700 dark:text-blue-50 border-blue-200 dark:border-blue-700",
        icon: <Bell className="w-3 h-3" />,
    },
    "Result": {
        color: "bg-purple-50 dark:bg-purple-700 text-purple-700 dark:text-purple-50 border-purple-200 dark:border-purple-700",
        icon: <CheckCircle className="w-3 h-3" />,
    },
    "Admit Card": {
        color: "bg-amber-50 dark:bg-amber-700 text-amber-700 dark:text-amber-50 border-amber-200 dark:border-amber-700",
        icon: <Calendar className="w-3 h-3" />,
    },
    "Registration": {
        color: "bg-amber-50 dark:bg-amber-700 text-amber-700 dark:text-amber-50 border-amber-200 dark:border-amber-700",
        icon: <BookText className="w-3 h-3" />,
    },
    "Completed": {
        color: "bg-emerald-50 dark:bg-emerald-700 text-emerald-700 dark:text-emerald-50 border-emerald-200 dark:border-emerald-700",
        icon: <CheckCircle className="w-3 h-3" />,
    }
};

export default statusConfig;
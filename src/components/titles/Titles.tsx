import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ConstructionIcon from '@mui/icons-material/Construction';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import ScienceIcon from '@mui/icons-material/Science';
import { JSX } from "react";

export interface Title {
    id: string;
    url: string;
    name: string;
    icon: JSX.Element;
}

export const titles: Record<string, Title> = {
    secretaryOfStrategy: {
        id: "STRATEGY",
        url: "/secretary-of-strategy",
        name: "Secretary of Strategy",
        icon: <HealthAndSafetyIcon />,
    },
    secretaryOfSecurity: {
        id: "SECURITY",
        url: "/secretary-of-security",
        name: "Secretary of Security",
        icon: <MilitaryTechIcon />,
    },
    secretaryOfDevelopment: {
        id: "DEVELOPMENT",
        url: "/secretary-of-development",
        name: "Secretary of Development",
        icon: <ConstructionIcon />,
    },
    secretaryOfScience: {
        id: "SCIENCE",
        url: "/secretary-of-science",
        name: "Secretary of Science",
        icon: <ScienceIcon />,
    },
    secretaryOfInterior: {
        id: "INTERIOR",
        url: "/secretary-of-interior",
        name: "Secretary of Interior",
        icon: <AutoStoriesIcon />,
    },
};

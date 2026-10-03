import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

type Props = {
    label: string;
    iconSrc: string;
    href: string;
};

export const SidebarItem = ({ label, iconSrc, href }: Props) => {
    const location = useLocation();
    const active = location.pathname === href;

    return (
        <Button
            variant={active ? "sidebarOutline" : "sidebar"}
            className="justify-start h-[52px]"
            asChild
        >
            <Link to={href}>
                <img src={iconSrc} alt={label} className="mr-5" height={32} width={32} />
                {label}
            </Link>
        </Button>
    );
};
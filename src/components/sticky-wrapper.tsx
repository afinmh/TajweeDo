type Props = {
    children: React.ReactNode;
};

export const StickyWrapper =({children}: Props)=>{
    return(
        <div className="hidden lg:block w-[368px] sticky top-6 self-start">
            <div className="flex flex-col gap-y-4">
                {children}
            </div>
        </div>
    );
};
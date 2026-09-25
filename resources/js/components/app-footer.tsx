export function AppFooter() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="border-t border-sidebar-border/70 dark:border-sidebar-border bg-background">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <span>© {currentYear} Kaldis Coffee. All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>Developed by</span>
                        <span className="font-semibold text-foreground">BI Department</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

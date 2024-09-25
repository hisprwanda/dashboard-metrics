export interface ModuleApps {
    name: string;
    namespace: string;
    defaultAction: string;
    displayName?: string;
    icon: string;
    description: string;
}

export interface Apps {
    modules: ModuleApps[];
}

export interface Data {
    apps: Apps;
}

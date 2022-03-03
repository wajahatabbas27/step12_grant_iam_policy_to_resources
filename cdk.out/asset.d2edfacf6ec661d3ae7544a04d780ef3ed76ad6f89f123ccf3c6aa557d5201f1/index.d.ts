declare const AWS: any;
declare const docClient: any;
declare type AppSyncEvent = {
    info: {
        fieldName: string;
    };
    arguments: {
        id: string;
        title: string;
    };
};

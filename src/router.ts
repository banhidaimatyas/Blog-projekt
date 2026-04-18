interface Jogosultsag {
    bejelentkezesKell: boolean;
}

interface UtvonalDefinicio {
    utvonal: string;
    oldal: (params?: Record<string, string>) => void;
    jog?: Jogosultsag;
}